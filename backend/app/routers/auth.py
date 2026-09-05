from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import (
    StudentLoginRequest,
    StudentLoginResponse,
    AdvisorLoginRequest,
    AdvisorLoginResponse,
    CurrentUserResponse,
    LogoutResponse,
)
from app.services.auth_service import student_login, advisor_login
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/student-login",
    response_model=StudentLoginResponse,
    summary="Student Portal Login",
    description="Authenticate student using Roll Number and Team ID.",
)
def login_student(payload: StudentLoginRequest):
    return student_login(payload.roll_number, payload.team_id)


@router.post(
    "/advisor-login",
    response_model=AdvisorLoginResponse,
    summary="Advisor Portal Login",
    description="Authenticate advisor using Advisor ID / Email and Password.",
)
def login_advisor(payload: AdvisorLoginRequest):
    return advisor_login(payload.advisor_id, payload.password)


@router.post(
    "/advisor/login",
    response_model=AdvisorLoginResponse,
    summary="Advisor Portal Login (Alias)",
    description="Alias endpoint for Advisor authentication.",
)
def login_advisor_alias(payload: AdvisorLoginRequest):
    return advisor_login(payload.advisor_id, payload.password)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Current Authenticated User Profile",
    description="Returns profile information for the currently authenticated user (student or advisor).",
)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return CurrentUserResponse(
        id=current_user["id"],
        roll_number=current_user.get("roll_number"),
        full_name=current_user.get("full_name", ""),
        email=current_user.get("email", ""),
        role=current_user.get("role", "student"),
        team_id=current_user.get("team_id"),
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="User Logout",
    description="Provides confirmation response for ending current session.",
)
def logout_user(current_user: dict = Depends(get_current_user)):
    return LogoutResponse(message="Successfully logged out")

