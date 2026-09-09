from fastapi import Header, HTTPException
from supabase import Client, create_client
from .config import get_settings


def get_db() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)


def require_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Bearer access token required")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid access token")
    try:
        user = get_db().auth.get_user(token).user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid access token")
        return {"id": user.id, "email": user.email}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Unable to validate access token") from exc


def get_profile(user_id: str) -> dict:
    result = get_db().table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=403, detail="Profile not found")
    return result.data
