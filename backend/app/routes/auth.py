from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.core.supabase import get_supabase_client
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user through Supabase Auth (or database fallback in local dev mode).
    Determines user application role securely from PostgreSQL database / user metadata.
    """
    supabase = get_supabase_client()
    user: Optional[User] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    # 1. Primary Authentication Path: Supabase Auth
    if supabase:
        try:
            auth_response = supabase.auth.sign_in_with_password(
                {"email": payload.email, "password": payload.password}
            )
            if auth_response and auth_response.session:
                access_token = auth_response.session.access_token
                refresh_token = auth_response.session.refresh_token
                supabase_user_id = auth_response.user.id

                # Fetch or create PostgreSQL User record
                user = (
                    db.query(User)
                    .filter((User.supabase_uid == supabase_user_id) | (User.email == payload.email))
                    .first()
                )
                if not user:
                    # Sync new Supabase user into local DB with trusted role from metadata or default student
                    meta_role = (auth_response.user.user_metadata or {}).get("role", UserRole.STUDENT)
                    if meta_role not in [UserRole.STUDENT, UserRole.ADVISOR, UserRole.ADMIN]:
                        meta_role = UserRole.STUDENT
                    full_name = (auth_response.user.user_metadata or {}).get("full_name", payload.email.split("@")[0])

                    user = User(
                        supabase_uid=supabase_user_id,
                        email=payload.email,
                        password_hash=hash_password(payload.password),
                        full_name=full_name,
                        role=meta_role,
                        is_active=True,
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                elif not user.supabase_uid:
                    user.supabase_uid = supabase_user_id
                    db.commit()
        except Exception:
            # If Supabase Auth fails (e.g. bad credentials or network error), proceed to local check fallback
            pass

    # 2. Local Development Fallback Path (if Supabase is unconfigured or local user exists)
    if not user:
        user = db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "INVALID_CREDENTIALS",
                        "message": "Invalid email or password",
                    }
                },
            )

        # Generate local JWT access & refresh tokens
        token_data = {"sub": user.id, "email": user.email, "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_access_token(
            token_data, expires_delta=timedelta(days=7)
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "USER_INACTIVE",
                    "message": "User account is inactive",
                }
            },
        )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token or access_token,
        token_type="bearer",
        expires_in=expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(authorization: Optional[str] = Header(None)):
    """
    Terminates the current user session / invalidates Supabase auth token.
    """
    supabase = get_supabase_client()
    if supabase and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            supabase.auth.sign_out()
        except Exception:
            pass

    return MessageResponse(message="Successfully logged out")


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Obtain a new access token using a valid refresh token.
    """
    supabase = get_supabase_client()
    new_access_token: Optional[str] = None
    new_refresh_token: Optional[str] = None
    user: Optional[User] = None

    if supabase:
        try:
            res = supabase.auth.refresh_session(payload.refresh_token)
            if res and res.session:
                new_access_token = res.session.access_token
                new_refresh_token = res.session.refresh_token
                user = db.query(User).filter(
                    (User.supabase_uid == res.user.id) | (User.email == res.user.email)
                ).first()
        except Exception:
            pass

    if not new_access_token:
        # Validate local JWT refresh token
        jwt_data = decode_access_token(payload.refresh_token)
        if not jwt_data or not jwt_data.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "INVALID_REFRESH_TOKEN",
                        "message": "Invalid or expired refresh token",
                    }
                },
            )
        user = db.query(User).filter(User.id == jwt_data.get("sub")).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "User associated with refresh token not found or inactive",
                    }
                },
            )

        token_data = {"sub": user.id, "email": user.email, "role": user.role}
        new_access_token = create_access_token(token_data)
        new_refresh_token = payload.refresh_token

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest):
    """
    Triggers Supabase password reset flow.
    Returns a generic message to prevent account enumeration.
    """
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.auth.reset_password_for_email(payload.email)
        except Exception:
            pass

    return MessageResponse(
        message="If the email is registered, password reset instructions have been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
):
    """
    Resets user password securely.
    """
    supabase = get_supabase_client()
    reset_successful = False

    if supabase:
        try:
            # Set session using the reset access token and update user password
            supabase.auth.set_session(payload.access_token, payload.access_token)
            res = supabase.auth.update_user({"password": payload.new_password})
            if res and res.user:
                reset_successful = True
                # Also update local password_hash in DB if user exists
                user = db.query(User).filter(User.email == res.user.email).first()
                if user:
                    user.password_hash = hash_password(payload.new_password)
                    db.commit()
        except Exception:
            pass

    if not reset_successful:
        # Fallback reset handling for local tokens
        jwt_data = decode_access_token(payload.access_token)
        if not jwt_data or not jwt_data.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "INVALID_RESET_TOKEN",
                        "message": "Invalid or expired password reset token",
                    }
                },
            )
        user = db.query(User).filter(User.id == jwt_data.get("sub")).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "User not found",
                    }
                },
            )

        user.password_hash = hash_password(payload.new_password)
        db.commit()

    return MessageResponse(message="Password has been reset successfully.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Protected endpoint returning profile info of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)
