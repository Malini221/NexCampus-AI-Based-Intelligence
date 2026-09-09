from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .auth import get_db, get_profile, require_user
from .auth_routes import router as auth_router
from .config import get_settings
from .intelligence import analyze_text, make_embedding

settings = get_settings()
app = FastAPI(title="NexCampus Intelligence API", version="1.1.0")
app.include_router(auth_router)
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ComplaintCreate(BaseModel):
    category_id: str
    subcategory_id: str | None = None
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=3, max_length=10000)
    location_text: str | None = None
    building: str | None = None
    block: str | None = None
    floor: str | None = None
    room: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    attachment_path: str | None = None
    is_anonymous: bool = False

class StatusUpdate(BaseModel):
    status: str
    note: str | None = None

def _notify(db, user_id: str, title: str, message: str, complaint_id: str | None = None, incident_id: str | None = None, action_required: bool = False, action_type: str | None = None, notification_type: str = "reports") -> None:
    db.table("notifications").insert({"user_id": user_id, "complaint_id": complaint_id, "incident_id": incident_id, "type": notification_type, "title": title, "message": message, "action_required": action_required, "action_type": action_type}).execute()

def _complaint_for_user(db, complaint_id: str, user: dict) -> dict:
    complaint = db.table("complaints").select("*,categories(name,key),subcategories(name)").eq("id", complaint_id).single().execute().data
    if not complaint: raise HTTPException(status_code=404, detail="Complaint not found")
    profile = get_profile(user["id"])
    if complaint["student_id"] != profile["id"] and profile["role"] not in ("staff", "admin"): raise HTTPException(status_code=403, detail="Not allowed")
    return complaint

@app.get("/health")
def health() -> dict[str, str]: return {"status": "ok", "service": "nexcampus-fastapi"}

@app.get("/api/categories")
def categories(_: dict = Depends(require_user)) -> list[dict]:
    return get_db().table("categories").select("id,key,name,icon,subtitle,question,private_reporting").eq("is_active", True).order("name").execute().data or []

@app.get("/api/categories/{category_id}/subcategories")
def subcategories(category_id: str, _: dict = Depends(require_user)) -> list[dict]:
    return get_db().table("subcategories").select("id,category_id,name").eq("category_id", category_id).eq("is_active", True).order("name").execute().data or []

@app.post("/api/complaints")
def create_complaint(payload: ComplaintCreate, user: dict = Depends(require_user)) -> dict[str, Any]:
    profile, db = get_profile(user["id"]), get_db()
    category = db.table("categories").select("id,key,name,default_department_id").eq("id", payload.category_id).single().execute().data
    if not category: raise HTTPException(status_code=400, detail="Invalid category")
    if payload.subcategory_id and not db.table("subcategories").select("id").eq("id", payload.subcategory_id).eq("category_id", payload.category_id).single().execute().data: raise HTTPException(status_code=400, detail="Invalid subcategory for selected category")
    row = payload.model_dump(); row["student_id"] = profile["id"]
    complaint = (db.table("complaints").insert(row).execute().data or [None])[0]
    if not complaint: raise HTTPException(status_code=500, detail="Complaint could not be created")
    db.table("complaint_status_history").insert({"complaint_id": complaint["id"], "from_status": None, "to_status": "Submitted", "changed_by": user["id"], "note": "Complaint submitted and queued for verification."}).execute()
    _notify(db, profile["id"], "Complaint submitted", f"Complaint #{complaint['ticket_number']} is pending verification.", complaint_id=complaint["id"])
    return complaint

@app.get("/api/complaints/me")
def my_complaints(user: dict = Depends(require_user)) -> list[dict]:
    return get_db().table("complaints").select("*,categories(name,key),subcategories(name)").eq("student_id", user["id"]).order("submitted_at", desc=True).execute().data or []

@app.get("/api/complaints/{complaint_id}")
def complaint_detail(complaint_id: str, user: dict = Depends(require_user)) -> dict[str, Any]:
    db = get_db(); complaint = _complaint_for_user(db, complaint_id, user)
    analysis = db.table("ai_analysis").select("*,categories:predicted_category_id(name,key),departments:recommended_department_id(name)").eq("complaint_id", complaint_id).maybe_single().execute().data
    link = db.table("incident_complaints").select("incident_id,similarity_score,linked_by,incidents(id,incident_number,title,severity,priority,status,affected_student_count,occurrence_count,department_id)").eq("complaint_id", complaint_id).maybe_single().execute().data
    history = db.table("complaint_status_history").select("id,from_status,to_status,note,created_at,changed_by").eq("complaint_id", complaint_id).order("created_at").execute().data or []
    return {"complaint": complaint, "analysis": analysis, "incident": link, "history": history}

@app.post("/api/complaints/{complaint_id}/verify")
def verify_complaint(complaint_id: str, payload: StatusUpdate | None = None, user: dict = Depends(require_user)) -> dict:
    db = get_db(); profile = get_profile(user["id"])
    if profile["role"] not in ("staff", "admin"): raise HTTPException(status_code=403, detail="Staff access required")
    complaint = db.table("complaints").select("*").eq("id", complaint_id).single().execute().data
    if not complaint: raise HTTPException(status_code=404, detail="Complaint not found")
    target = payload.status if payload and payload.status in ("Under Review", "Dismissed") else "Under Review"
    note = (payload.note if payload else None) or ("Complaint verified and queued for AI analysis." if target == "Under Review" else "Complaint was not verified.")
    updated = db.table("complaints").update({"status": target}).eq("id", complaint_id).execute().data
    db.table("complaint_status_history").insert({"complaint_id": complaint_id, "from_status": complaint["status"], "to_status": target, "changed_by": user["id"], "note": note}).execute()
    _notify(db, complaint["student_id"], "Complaint verified" if target == "Under Review" else "Complaint not verified", note, complaint_id=complaint_id)
    return (updated or [complaint])[0]

@app.post("/api/complaints/{complaint_id}/analyze")
def analyze_complaint(complaint_id: str, user: dict = Depends(require_user)) -> dict[str, Any]:
    db = get_db(); complaint = _complaint_for_user(db, complaint_id, user); profile = get_profile(user["id"])
    if profile["role"] not in ("staff", "admin") and complaint["status"] != "Under Review": raise HTTPException(status_code=403, detail="Complaint must be verified before analysis")
    text = f"{complaint['title']}\n{complaint['description']}\n{complaint.get('location_text') or ''}"
    analysis = analyze_text(complaint["title"], complaint["description"], complaint.get("location_text")); embedding = make_embedding(text)
    db.table("complaints").update({"embedding": embedding}).eq("id", complaint_id).execute()
    category = db.table("categories").select("id,name,default_department_id").eq("key", analysis["category_key"]).single().execute().data
    category_id, department_id = (category["id"], category.get("default_department_id")) if category else (complaint["category_id"], None)
    similar = db.rpc("find_similar_complaints", {"query_embedding": embedding, "match_threshold": settings.similarity_threshold, "match_count": 10}).execute().data or []
    similar = [x for x in similar if x["complaint_id"] != complaint_id]
    incident_id = similar[0].get("incident_id") if similar and similar[0].get("incident_id") else None
    if incident_id:
        db.table("incident_complaints").upsert({"incident_id": incident_id, "complaint_id": complaint_id, "similarity_score": similar[0]["similarity"], "linked_by": "system"}).execute()
        db.table("incidents").update({"last_reported_at": datetime.now(timezone.utc).isoformat()}).eq("id", incident_id).execute()
    else:
        incident = db.table("incidents").insert({"category_id": category_id, "department_id": department_id, "title": complaint["title"], "description": complaint["description"], "location_text": complaint.get("location_text"), "building": complaint.get("building"), "block": complaint.get("block"), "floor": complaint.get("floor"), "room": complaint.get("room"), "latitude": complaint.get("latitude"), "longitude": complaint.get("longitude"), "severity": analysis["severity"], "priority": analysis["priority"], "risk_score": analysis["risk_score"], "first_reported_at": complaint["submitted_at"], "last_reported_at": complaint["submitted_at"]}).execute().data
        incident_id = (incident or [None])[0]["id"] if incident else None
        if incident_id: db.table("incident_complaints").insert({"incident_id": incident_id, "complaint_id": complaint_id, "similarity_score": 1.0, "linked_by": "system"}).execute()
    analysis_row = {"complaint_id": complaint_id, "predicted_category_id": category_id, "severity": analysis["severity"], "priority": analysis["priority"], "risk_score": analysis["risk_score"], "summary": analysis["summary"], "recommended_department_id": department_id, "risk_signals": analysis["risk_signals"], "reasoning": analysis["reasoning"], "embedding_model": settings.embedding_model, "classifier_model": "rule-based prototype; replace with trained DistilBERT/TinyBERT model", "processing_status": "completed"}
    saved = db.table("ai_analysis").upsert(analysis_row, on_conflict="complaint_id").execute().data
    db.table("complaints").update({"status": "In Progress"}).eq("id", complaint_id).execute()
    db.table("complaint_status_history").insert({"complaint_id": complaint_id, "from_status": complaint["status"], "to_status": "In Progress", "changed_by": user["id"], "note": "AI analysis completed; incident matching and routing completed."}).execute()
    _notify(db, complaint["student_id"], "AI analysis completed", "Your complaint has been analyzed and routed for resolution.", complaint_id=complaint_id, incident_id=incident_id)
    return {"analysis": (saved or [analysis_row])[0], "incident_id": incident_id, "similar": similar}

@app.get("/api/notifications/me")
def notifications(user: dict = Depends(require_user)) -> list[dict]:
    return get_db().table("notifications").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(100).execute().data or []

@app.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, user: dict = Depends(require_user)) -> dict:
    result = get_db().table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user["id"]).execute().data
    if not result: raise HTTPException(status_code=404, detail="Notification not found")
    return result[0]

@app.patch("/api/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: str, payload: StatusUpdate, user: dict = Depends(require_user)) -> dict:
    db = get_db(); profile = get_profile(user["id"])
    if profile["role"] not in ("staff", "admin"): raise HTTPException(status_code=403, detail="Staff access required")
    complaint = db.table("complaints").select("*").eq("id", complaint_id).single().execute().data
    if not complaint: raise HTTPException(status_code=404, detail="Complaint not found")
    allowed = {"Submitted", "Under Review", "In Progress", "Resolved", "Awaiting Verification", "Closed", "Dismissed", "Cancelled"}
    if payload.status not in allowed: raise HTTPException(status_code=422, detail="Invalid complaint status")
    resolved_at = datetime.now(timezone.utc).isoformat() if payload.status == "Resolved" else None
    updated = db.table("complaints").update({"status": payload.status, "resolved_at": resolved_at}).eq("id", complaint_id).execute().data
    db.table("complaint_status_history").insert({"complaint_id": complaint_id, "from_status": complaint["status"], "to_status": payload.status, "changed_by": user["id"], "note": payload.note}).execute()
    _notify(db, complaint["student_id"], f"Complaint status: {payload.status}", payload.note or f"Your complaint is now {payload.status}.", complaint_id=complaint_id)
    return (updated or [complaint])[0]

@app.post("/api/complaints/{complaint_id}/confirm-resolution")
def confirm_resolution(complaint_id: str, payload: StatusUpdate | None = None, user: dict = Depends(require_user)) -> dict:
    db = get_db(); complaint = _complaint_for_user(db, complaint_id, user)
    if complaint["student_id"] != user["id"]: raise HTTPException(status_code=403, detail="Not allowed")
    if complaint["status"] != "Resolved": raise HTTPException(status_code=409, detail="Complaint is not awaiting confirmation")
    target = payload.status if payload and payload.status in ("Closed", "In Progress") else "Closed"
    note = (payload.note if payload else None) or ("Student confirmed the resolution." if target == "Closed" else "Student reported that the issue still exists.")
    updated = db.table("complaints").update({"status": target}).eq("id", complaint_id).execute().data
    db.table("complaint_status_history").insert({"complaint_id": complaint_id, "from_status": "Resolved", "to_status": target, "changed_by": user["id"], "note": note}).execute()
    _notify(db, user["id"], "Resolution confirmed" if target == "Closed" else "Complaint reopened", note, complaint_id=complaint_id, action_required=False)
    return (updated or [complaint])[0]
