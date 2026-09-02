from fastapi import APIRouter, Depends
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate
from app.services.profile_service import get_student_profile_service, update_student_profile_service
from app.dependencies.auth import require_student

router = APIRouter(prefix="/student", tags=["Student Profile"])


@router.get(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Get Authenticated Student Profile",
    description="Returns profile information for the authenticated student.",
)
def get_student_profile(current_user: dict = Depends(require_student)):
    return get_student_profile_service(current_user["id"])


@router.put(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Update Authenticated Student Profile",
    description="Allows updating safe student profile fields (full_name). Strictly prevents changing role, email, or roll_number.",
)
def update_student_profile(
    payload: StudentProfileUpdate,
    current_user: dict = Depends(require_student),
):
    return update_student_profile_service(current_user["id"], payload)
