from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.supabase import get_supabase_client
from app.models.user import User

# HTTP Bearer token security scheme (auto_error=False allows custom 401 JSON error payload)
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and validates the Bearer JWT token from the Authorization header.
    Validates token via Supabase Auth (or JWT verification).
    Returns the authenticated User entity from PostgreSQL database containing trusted role.
    Raises 401 Unauthorized for missing or invalid tokens.
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

    # 1. Primary Token Validation: Validate via Supabase Auth Client
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase_user_resp = supabase.auth.get_user(token)
            if supabase_user_resp and supabase_user_resp.user:
                user_id = supabase_user_resp.user.id
                email = supabase_user_resp.user.email
        except Exception:
            pass

    # 2. Secondary Token Validation: Decode JWT payload if Supabase is unconfigured / local test token
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

    # 3. Look up user in PostgreSQL database to fetch trusted application role
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

    return user


def require_role(*allowed_roles: str) -> Callable:
    """
    FastAPI dependency factory for Role-Based Access Control (RBAC).
    Enforces that the authenticated user possesses one of the allowed trusted roles.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
    """

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": "FORBIDDEN",
                        "message": (
                            f"Permission denied. Role '{current_user.role}' is not authorized. "
                            f"Required role: {', '.join(allowed_roles)}"
                        ),
                    }
                },
            )
        return current_user

    return role_checker
