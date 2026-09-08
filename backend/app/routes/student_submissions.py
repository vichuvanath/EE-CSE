from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import Project, Team, TeamMember
from app.models.audit import AuditLog
from app.models.communication import Deadline, Notification
from app.models.student import Student
from app.models.submission import Submission, SubmissionFile
from app.models.user import User, UserRole
from app.schemas.student import (
    SubmissionCreate,
    SubmissionFileResponse,
    SubmissionResponse,
    SubmissionUpdate,
)
from app.services.storage_service import StorageService

router = APIRouter(prefix="/student/submissions", tags=["Student Submissions"])


def _get_student_team_and_project(db: Session, user: User) -> tuple[Student, Team, Project]:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "STUDENT_PROFILE_NOT_FOUND",
                    "message": "Student profile not found",
                }
            },
        )

    membership = (
        db.query(TeamMember).filter(TeamMember.student_id == student.id).first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "NO_TEAM_ASSIGNED",
                    "message": "Student is not assigned to a team",
                }
            },
        )

    team = db.query(Team).filter(Team.id == membership.team_id).first()
    project = db.query(Project).filter(Project.team_id == team.id).first()
    if not project:
        # Create a default project entry for team if missing
        project = Project(
            team_id=team.id,
            title=f"{team.name} Senior EE Project",
            description="Electrical Engineering Senior Design Project",
            status="active",
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    return student, team, project


def _format_submission_response(sub: Submission) -> SubmissionResponse:
    file_responses = [
        SubmissionFileResponse(
            id=f.id,
            submission_id=f.submission_id,
            file_name=f.file_name,
            file_size=f.file_size,
            mime_type=f.mime_type,
            storage_bucket=f.storage_bucket,
            download_url=StorageService.get_signed_url(f.file_path),
            created_at=f.created_at,
        )
        for f in sub.files
    ]

    return SubmissionResponse(
        id=sub.id,
        project_id=sub.project_id,
        team_id=sub.team_id,
        submitted_by=sub.submitted_by,
        title=sub.title,
        description=sub.description,
        submission_type=sub.submission_type,
        status=sub.status,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        files=file_responses,
    )


@router.get("", response_model=List[SubmissionResponse])
def list_student_submissions(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    List all submissions belonging to the authenticated student's team/project.
    """
    student, team, project = _get_student_team_and_project(db, current_user)
    submissions = (
        db.query(Submission)
        .filter(Submission.team_id == team.id)
        .order_by(Submission.created_at.desc())
        .all()
    )

    return [_format_submission_response(s) for s in submissions]


@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission_details(
    submission_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get detailed information and file attachments for a specific submission.
    Verifies team ownership.
    """
    student, team, project = _get_student_team_and_project(db, current_user)
    sub = (
        db.query(Submission)
        .filter(Submission.id == submission_id, Submission.team_id == team.id)
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "SUBMISSION_NOT_FOUND",
                    "message": "Submission not found or access denied",
                }
            },
        )

    return _format_submission_response(sub)


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_draft_submission(
    payload: SubmissionCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Create a new draft submission for the student's team project.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    new_sub = Submission(
        project_id=project.id,
        team_id=team.id,
        submitted_by=current_user.id,
        title=payload.title.strip(),
        description=payload.description,
        submission_type=payload.submission_type,
        status="draft",
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)

    # Log audit event
    audit = AuditLog(
        user_id=current_user.id,
        action="submission_draft_created",
        entity_type="submission",
        entity_id=new_sub.id,
        details=f"Draft submission '{new_sub.title}' created.",
    )
    db.add(audit)
    db.commit()

    return _format_submission_response(new_sub)


@router.put("/{submission_id}", response_model=SubmissionResponse)
def update_draft_submission(
    submission_id: str,
    payload: SubmissionUpdate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Update a draft submission before final submission.
    Modification is rejected if submission has already been submitted or evaluated.
    """
    student, team, project = _get_student_team_and_project(db, current_user)
    sub = (
        db.query(Submission)
        .filter(Submission.id == submission_id, Submission.team_id == team.id)
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "SUBMISSION_NOT_FOUND",
                    "message": "Submission not found or access denied",
                }
            },
        )

    if sub.status not in ["draft"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "SUBMISSION_FINALIZED",
                    "message": f"Cannot edit submission with status '{sub.status}'",
                }
            },
        )

    if payload.title is not None:
        sub.title = payload.title.strip()
    if payload.description is not None:
        sub.description = payload.description
    if payload.submission_type is not None:
        sub.submission_type = payload.submission_type

    db.commit()
    db.refresh(sub)
    return _format_submission_response(sub)


@router.post("/{submission_id}/submit", response_model=SubmissionResponse)
def finalize_submission(
    submission_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Finalize and submit a report.
    Validates class deadline, checks at least 1 file attachment, updates status to 'submitted',
    and generates notification & audit log entries.
    """
    student, team, project = _get_student_team_and_project(db, current_user)
    sub = (
        db.query(Submission)
        .filter(Submission.id == submission_id, Submission.team_id == team.id)
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "SUBMISSION_NOT_FOUND",
                    "message": "Submission not found",
                }
            },
        )

    if sub.status == "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "ALREADY_SUBMITTED",
                    "message": "Report has already been submitted",
                }
            },
        )

    # Validate file presence
    if not sub.files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "NO_FILES_ATTACHED",
                    "message": "Cannot submit report without attaching at least one file",
                }
            },
        )

    # Validate class deadline if exists
    now = datetime.now(timezone.utc)
    deadline = (
        db.query(Deadline)
        .filter(Deadline.class_id == team.class_id)
        .order_by(Deadline.due_at.desc())
        .first()
    )
    if deadline:
        due_at = deadline.due_at
        if due_at.tzinfo is None:
            due_at = due_at.replace(tzinfo=timezone.utc)
        if now > due_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "DEADLINE_PASSED",
                        "message": f"Submission deadline passed on {due_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
                    }
                },
            )

    # Update status to submitted
    sub.status = "submitted"
    sub.submitted_by = current_user.id

    # Create notification for student
    notif = Notification(
        user_id=current_user.id,
        title="Submission Successful",
        message=f"Your report '{sub.title}' was successfully submitted.",
        notification_type="submission",
        is_read=False,
    )
    db.add(notif)

    # Create audit log entry
    audit = AuditLog(
        user_id=current_user.id,
        action="submission_finalized",
        entity_type="submission",
        entity_id=sub.id,
        details=f"Report '{sub.title}' submitted by user {current_user.id}.",
    )
    db.add(audit)

    db.commit()
    db.refresh(sub)
    return _format_submission_response(sub)
