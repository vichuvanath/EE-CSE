from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import ClassEnrollment
from app.models.communication import Deadline
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.student import DeadlineResponse

router = APIRouter(prefix="/student/deadlines", tags=["Student Deadlines"])


@router.get("", response_model=List[DeadlineResponse])
def get_student_deadlines(
    upcoming_only: bool = Query(False, description="Filter for upcoming deadlines only"),
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get list of submission deadlines relevant to the authenticated student's enrolled classes.
    Read-only endpoint with ISO 8601 timezone-aware comparison.
    """
    now = datetime.now(timezone.utc)
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    # Find enrolled class IDs for student
    class_ids = []
    if student:
        enrollments = (
            db.query(ClassEnrollment)
            .filter(ClassEnrollment.student_id == student.id)
            .all()
        )
        class_ids = [e.class_id for e in enrollments]

    # Query deadlines
    query = db.query(Deadline)
    if class_ids:
        query = query.filter(Deadline.class_id.in_(class_ids))

    deadlines = query.order_by(Deadline.due_at.asc()).all()

    response = []
    for d in deadlines:
        due_at = d.due_at
        if due_at.tzinfo is None:
            due_at = due_at.replace(tzinfo=timezone.utc)

        is_overdue = due_at < now
        if upcoming_only and is_overdue:
            continue

        response.append(
            DeadlineResponse(
                id=d.id,
                class_id=d.class_id,
                title=d.title,
                description=d.description,
                due_at=due_at,
                is_overdue=is_overdue,
                created_at=d.created_at,
            )
        )

    return response
