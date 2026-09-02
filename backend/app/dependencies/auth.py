from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.supabase import get_supabase_client
from app.core.config import settings

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )



    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject",
        )

    supabase = get_supabase_client()
    result = supabase.table("profiles").select("*").eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    profile = result.data[0]
    
    # Look up team membership if user is student
    team_id = payload.get("team_id")
    if not team_id:
        membership = supabase.table("team_members").select("team_id").eq("student_id", user_id).execute()
        if membership.data:
            team_id = membership.data[0].get("team_id")

    return {
        "id": profile["id"],
        "email": profile.get("email", ""),
        "roll_number": profile.get("roll_number") or payload.get("roll_number"),
        "role": (profile.get("role") or "student").lower(),
        "full_name": profile.get("full_name", ""),
        "team_id": team_id,
    }


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role", "").lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def require_faculty(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role", "").lower() not in ["faculty", "advisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty access required",
        )
    return current_user


async def require_advisor(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role", "").lower() not in ["advisor", "faculty"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Advisor access required",
        )
    return current_user


async def require_student(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role", "").lower() != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required",
        )
    return current_user


def verify_advisor_team_access(advisor_id: str, team_id: str) -> bool:
    from app.repositories.assignment_repository import check_assignment
    is_assigned = check_assignment(advisor_id, team_id)
    if not is_assigned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )
    return True


