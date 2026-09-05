from fastapi import HTTPException, status
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate
from app.repositories.profile_repository import get_profile_by_id, update_profile_full_name


def get_student_profile_service(student_id: str) -> StudentProfileResponse:
    profile = get_profile_by_id(student_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )
    return profile


def update_student_profile_service(student_id: str, payload: StudentProfileUpdate) -> StudentProfileResponse:
    profile = get_profile_by_id(student_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    if payload.full_name is not None and payload.full_name.strip():
        return update_profile_full_name(student_id, payload.full_name)
    
    return profile
