from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .auth import get_db, get_profile, require_user

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)
    student_id: str | None = None
    department: str | None = None
    program: str | None = None
    year: int | None = Field(default=None, ge=1, le=6)
    section: str | None = None
    residence_type: str | None = None
    residence: str | None = None
    room: str | None = None
    bus_number: str | None = None


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=128)


@router.post("/signup")
def signup(payload: SignupRequest) -> dict[str, Any]:
    email = payload.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    if payload.residence_type not in (None, "hosteller", "dayscholar"):
        raise HTTPException(status_code=422, detail="Invalid residence type")

    db = get_db()
    try:
        response = db.auth.sign_up({
            "email": email,
            "password": payload.password,
            "options": {
                "data": {
                    "full_name": payload.full_name.strip(),
                    "student_id": payload.student_id,
                    "department": payload.department,
                    "program": payload.program,
                    "year": payload.year,
                    "section": payload.section,
                    "residence_type": payload.residence_type,
                    "residence": payload.residence,
                    "room": payload.room,
                    "bus_number": payload.bus_number,
                }
            },
        })
    except Exception as exc:
        message = str(exc).lower()
        if "already registered" in message or "already exists" in message:
            raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
        if "password" in message and ("weak" in message or "short" in message):
            raise HTTPException(status_code=422, detail="Password must be at least 8 characters") from exc
        raise HTTPException(status_code=400, detail="Unable to create account") from exc

    user = getattr(response, "user", None)
    session = getattr(response, "session", None)
    if not user:
        raise HTTPException(status_code=400, detail="Unable to create account")

    return {
        "user": {"id": user.id, "email": user.email},
        "access_token": getattr(session, "access_token", None) if session else None,
        "refresh_token": getattr(session, "refresh_token", None) if session else None,
        "requires_email_confirmation": session is None,
    }


@router.post("/login")
def login(payload: LoginRequest) -> dict[str, Any]:
    email = payload.email.strip().lower()
    db = get_db()
    try:
        response = db.auth.sign_in_with_password({"email": email, "password": payload.password})
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc

    session = getattr(response, "session", None)
    user = getattr(response, "user", None)
    if not session or not user:
        raise HTTPException(status_code=401, detail="Email confirmation may be required before signing in")

    profile = get_profile(user.id)
    if not profile.get("is_active", True):
        raise HTTPException(status_code=403, detail="This account is inactive")

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "expires_in": session.expires_in,
        "user": {"id": user.id, "email": user.email},
        "profile": profile,
    }


@router.get("/me")
def me(authorization: str | None = None) -> dict[str, Any]:
    user = require_user(authorization)
    return {"user": user, "profile": get_profile(user["id"])}
