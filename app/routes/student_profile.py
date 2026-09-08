from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate

router = APIRouter(prefix="/student/profile", tags=["Student Profile"])


def _get_or_create_student_profile(db: Session, user: User) -> Student:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        # Create a default student profile if not already seeded
        student = Student(
            user_id=user.id,
            roll_number=f"ROLL-{user.id[:8]}",
            department="Electrical Engineering",
            batch="2026",
            phone_number=None,
        )
        db.add(student)
        db.commit()
        db.refresh(student)
    return student


@router.get("", response_model=StudentProfileResponse)
def get_student_profile(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get profile information of the currently authenticated student.
    Determines student identity automatically from Bearer token.
    """
    student = _get_or_create_student_profile(db, current_user)
    return StudentProfileResponse(
        id=student.id,
        user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        roll_number=student.roll_number,
        department=student.department,
        batch=student.batch,
        phone_number=student.phone_number,
        is_active=current_user.is_active,
    )


@router.put("", response_model=StudentProfileResponse)
def update_student_profile(
    payload: StudentProfileUpdate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Update allowed profile fields for the authenticated student.
    Prohibits modifying role, department, roll number, or user ID.
    """
    student = _get_or_create_student_profile(db, current_user)
    if payload.phone_number is not None:
        student.phone_number = payload.phone_number.strip()
        db.commit()
        db.refresh(student)

    return StudentProfileResponse(
        id=student.id,
        user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        roll_number=student.roll_number,
        department=student.department,
        batch=student.batch,
        phone_number=student.phone_number,
        is_active=current_user.is_active,
    )
