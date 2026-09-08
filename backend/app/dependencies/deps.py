from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.supabase import get_supabase_client
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


def get_current_advisor(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """
    FastAPI dependency that validates the Bearer JWT token and ensures
    the user has an advisor or admin role.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Authentication token is missing",
                }
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    user_id: Optional[str] = None
    email: Optional[str] = None

    # 1. Primary: Validate via Supabase
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase_user_resp = supabase.auth.get_user(token)
            if supabase_user_resp and supabase_user_resp.user:
                user_id = supabase_user_resp.user.id
                email = supabase_user_resp.user.email
        except Exception:
            pass

    # 2. Fallback: Decode local JWT
    if not user_id and not email:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid or expired authentication token",
                    }
                },
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = payload.get("sub") or payload.get("id")
        email = payload.get("email")

    # 3. Look up user in database
    user: Optional[User] = None
    if user_id:
        user = (
            db.query(User)
            .filter((User.supabase_uid == user_id) | (User.id == user_id))
            .first()
        )
    if not user and email:
        user = db.query(User).filter(User.email == email).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Authenticated user not found or is inactive",
                }
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.role not in ["advisor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "Advisor access required",
                }
            },
        )

    return {
        "id": user.id,
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
    }
