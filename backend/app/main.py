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
app = FastAPI(title="NexCampus Intelligence API", version="1.0.0")
app.include_router(auth_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "nexcampus-fastapi"}


@app.get("/api/categories")
def categories(_: dict = Depends(require_user)) -> list[dict]:
    result = get_db().table("categories").select("id,key,name,icon,subtitle,question,private_reporting").eq("is_active", True).order("name").execute()
    return result.data or []


@app.get("/api/categories/{category_id}/subcategories")
def subcategories(category_id: str, _: dict = Depends(require_user)) -> list[dict]:
    result = get_db().table("subcategories").select("id,category_id,name").eq("category_id", category_id).eq("is_active", True).order("name").execute()
    return result.data or []


@app.post("/api/complaints")
def create_complaint(payload: ComplaintCreate, user: dict = Depends(require_user)) -> dict[str, Any]:
    profile = get_profile(user["id"])
    db = get_db()
    category = db.table("categories").select("id,key,name,default_department_id").eq("id", payload.category_id).single().execute().data
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")
    if payload.subcategory_id:
        sub = db.table("subcategories").select("id").eq("id", payload.subcategory_id).eq("category_id", payload.category_id).single().execute().data
        if not sub:
            raise HTTPException(status_code=400, detail="Invalid subcategory for selected category")
    row = payload.model_dump()
    row["student_id"] = profile["id"]
    result = db.table("complaints").insert(row).execute()
    complaint = (result.data or [None])[0]
    if not complaint:
        raise HTTPException(status_code=500, detail="Complaint could not be created")
    return complaint


@app.get("/api/complaints/me")
def my_complaints(user: dict = Depends(require_user)) -> list[dict]:
    result = (get_db().table("complaints").select("*,categories(name,key),subcategories(name)").eq("student_id", user["id"]).order("submitted_at", desc=True).execute())
    return result.data or []


@app.post("/api/complaints/{complaint_id}/analyze")
def analyze_complaint(complaint_id: str, user: dict = Depends(require_user)) -> dict[str, Any]:
    db = get_db()
    complaint = db.table("complaints").select("*").eq("id", complaint_id).single().execute().data
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    profile = get_profile(user["id"])
    if complaint["student_id"] != profile["id"] and profile["role"] not in ("staff", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    text = f"{complaint['title']}\n{complaint['description']}\n{complaint.get('location_text') or ''}"
    analysis = analyze_text(complaint["title"], complaint["description"], complaint.get("location_text"))
    embedding = make_embedding(text)
    db.table("complaints").update({"embedding": embedding}).eq("id", complaint_id).execute()
    category = db.table("categories").select("id,name,default_department_id").eq("key", analysis["category_key"]).single().execute().data
    category_id = category["id"] if category else complaint["category_id"]
    department_id = category.get("default_department_id") if category else None
    similar = db.rpc("find_similar_complaints", {"query_embedding": embedding, "match_threshold": settings.similarity_threshold, "match_count": 10}).execute().data or []
    similar = [x for x in similar if x["complaint_id"] != complaint_id]
    incident_id = similar[0].get("incident_id") if similar and similar[0].get("incident_id") else None
    if incident_id:
        db.table("incident_complaints").upsert({"incident_id": incident_id, "complaint_id": complaint_id, "similarity_score": similar[0]["similarity"], "linked_by": "system"}).execute()
    else:
        incident = db.table("incidents").insert({"category_id": category_id, "department_id": department_id, "title": complaint["title"], "description": complaint["description"], "location_text": complaint.get("location_text"), "building": complaint.get("building"), "block": complaint.get("block"), "floor": complaint.get("floor"), "room": complaint.get("room"), "latitude": complaint.get("latitude"), "longitude": complaint.get("longitude"), "severity": analysis["severity"], "priority": analysis["priority"], "risk_score": analysis["risk_score"], "first_reported_at": complaint["submitted_at"], "last_reported_at": complaint["submitted_at"]}).execute().data
        incident_id = (incident or [None])[0]["id"] if incident else None
        if incident_id:
            db.table("incident_complaints").insert({"incident_id": incident_id, "complaint_id": complaint_id, "similarity_score": 1.0, "linked_by": "system"}).execute()
    analysis_row = {"complaint_id": complaint_id, "predicted_category_id": category_id, "severity": analysis["severity"], "priority": analysis["priority"], "risk_score": analysis["risk_score"], "summary": analysis["summary"], "recommended_department_id": department_id, "risk_signals": analysis["risk_signals"], "reasoning": analysis["reasoning"], "embedding_model": settings.embedding_model, "classifier_model": "rule-based prototype; replace with trained DistilBERT/TinyBERT model", "processing_status": "completed"}
    saved = db.table("ai_analysis").upsert(analysis_row, on_conflict="complaint_id").execute().data
    return {"analysis": (saved or [analysis_row])[0], "incident_id": incident_id, "similar": similar}


@app.patch("/api/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: str, payload: StatusUpdate, user: dict = Depends(require_user)) -> dict:
    db = get_db()
    profile = get_profile(user["id"])
    if profile["role"] not in ("staff", "admin"):
        raise HTTPException(status_code=403, detail="Staff access required")
    current = db.table("complaints").select("status").eq("id", complaint_id).single().execute().data
    if not current:
        raise HTTPException(status_code=404, detail="Complaint not found")
    updated = db.table("complaints").update({"status": payload.status, "resolved_at": datetime.now(timezone.utc).isoformat() if payload.status == "Resolved" else None}).eq("id", complaint_id).execute().data
    db.table("complaint_status_history").insert({"complaint_id": complaint_id, "from_status": current["status"], "to_status": payload.status, "changed_by": user["id"], "note": payload.note}).execute()
    return (updated or [current])[0]
