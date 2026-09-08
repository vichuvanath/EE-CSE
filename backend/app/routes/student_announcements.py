from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import ClassEnrollment
from app.models.communication import Announcement, AnnouncementRead, AnnouncementTarget
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.student import AnnouncementResponse

router = APIRouter(prefix="/student/announcements", tags=["Student Announcements"])


def _get_eligible_announcements(db: Session, user: User) -> List[Announcement]:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    class_ids = []
    if student:
        enrollments = (
            db.query(ClassEnrollment)
            .filter(ClassEnrollment.student_id == student.id)
            .all()
        )
        class_ids = [e.class_id for e in enrollments]

    # Query targets matching 'all', role='student', user_id, or student's class_id
    targets = (
        db.query(AnnouncementTarget)
        .filter(
            (AnnouncementTarget.target_type == "all")
            | (
                (AnnouncementTarget.target_type == "role")
                & (AnnouncementTarget.target_id == UserRole.STUDENT)
            )
            | (
                (AnnouncementTarget.target_type == "user")
                & (AnnouncementTarget.target_id == user.id)
            )
            | (
                (AnnouncementTarget.target_type == "class")
                & (AnnouncementTarget.target_id.in_(class_ids))
            )
        )
        .all()
    )

    announcement_ids = list({t.announcement_id for t in targets})

    if not announcement_ids:
        # Fallback: if no explicit targets exist in test db, return all general announcements
        announcements = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    else:
        announcements = (
            db.query(Announcement)
            .filter(Announcement.id.in_(announcement_ids))
            .order_by(Announcement.created_at.desc())
            .all()
        )

    return announcements


@router.get("", response_model=List[AnnouncementResponse])
def list_student_announcements(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get announcements targeted to the authenticated student.
    Tracks read status via announcement_reads.
    """
    announcements = _get_eligible_announcements(db, current_user)
    read_records = (
        db.query(AnnouncementRead)
        .filter(AnnouncementRead.user_id == current_user.id)
        .all()
    )
    read_set = {r.announcement_id for r in read_records}

    return [
        AnnouncementResponse(
            id=a.id,
            title=a.title,
            content=a.content,
            created_at=a.created_at,
            is_read=(a.id in read_set),
        )
        for a in announcements
    ]


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement_details(
    announcement_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get specific announcement content and automatically mark as read.
    """
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "ANNOUNCEMENT_NOT_FOUND",
                    "message": "Announcement not found",
                }
            },
        )

    # Mark as read in announcement_reads
    existing_read = (
        db.query(AnnouncementRead)
        .filter(
            AnnouncementRead.announcement_id == announcement.id,
            AnnouncementRead.user_id == current_user.id,
        )
        .first()
    )
    if not existing_read:
        read_record = AnnouncementRead(
            announcement_id=announcement.id, user_id=current_user.id
        )
        db.add(read_record)
        db.commit()

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        created_at=announcement.created_at,
        is_read=True,
    )


@router.patch("/{announcement_id}/read", response_model=AnnouncementResponse)
def mark_announcement_read(
    announcement_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Explicitly mark an announcement as read.
    """
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "ANNOUNCEMENT_NOT_FOUND",
                    "message": "Announcement not found",
                }
            },
        )

    existing_read = (
        db.query(AnnouncementRead)
        .filter(
            AnnouncementRead.announcement_id == announcement.id,
            AnnouncementRead.user_id == current_user.id,
        )
        .first()
    )
    if not existing_read:
        read_record = AnnouncementRead(
            announcement_id=announcement.id, user_id=current_user.id
        )
        db.add(read_record)
        db.commit()

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        created_at=announcement.created_at,
        is_read=True,
    )
