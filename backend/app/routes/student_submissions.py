from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
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


# --- Additional Schemas for /me and /final endpoints ---
class ChecklistItem(BaseModel):
    completed: bool
    label: str


class SubmissionChecklistResponse(BaseModel):
    abstract: ChecklistItem
    report: ChecklistItem
    ppt: ChecklistItem
    images: ChecklistItem
    github: ChecklistItem
    live_demo: ChecklistItem
    completed_count: int
    total_count: int
    all_completed: bool


class MySubmissionResponse(BaseModel):
    submission_id: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    checklist: Optional[SubmissionChecklistResponse] = None
    files: List[Dict[str, Any]] = []
    project: Optional[Dict[str, Any]] = None


class FinalSubmissionResponse(BaseModel):
    submission_id: str
    status: str
    submitted_at: datetime
    message: str

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


def _build_checklist(sub: Optional[Submission]) -> SubmissionChecklistResponse:
    """Build a submission checklist based on project details."""
    has_github = False
    has_live_demo = False
    
    if sub and sub.project:
        has_github = bool(sub.project.github_url and sub.project.github_url.strip())
        has_live_demo = bool(sub.project.live_demo_url and sub.project.live_demo_url.strip())

    completed_count = sum([has_github, has_live_demo])

    return SubmissionChecklistResponse(
        abstract=ChecklistItem(completed=False, label="Abstract"),
        report=ChecklistItem(completed=False, label="Report"),
        ppt=ChecklistItem(completed=False, label="PPT"),
        images=ChecklistItem(completed=False, label="Images"),
        github=ChecklistItem(completed=has_github, label="GitHub Repository"),
        live_demo=ChecklistItem(completed=has_live_demo, label="Live Demo"),
        completed_count=completed_count,
        total_count=2,
        all_completed=completed_count == 2,
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


@router.get("/me", response_model=MySubmissionResponse)
def get_my_submission(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get the current student's active submission with checklist and project info.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    # Get the most recent submission for this team
    submission = (
        db.query(Submission)
        .filter(Submission.team_id == team.id)
        .order_by(Submission.created_at.desc())
        .first()
    )

    checklist = _build_checklist(submission)

    files = []
    if submission and submission.files:
        files = [
            {
                "id": f.id,
                "file_name": f.file_name,
                "file_size": f.file_size,
                "mime_type": f.mime_type,
                "category": f.category,
                "download_url": StorageService.get_signed_url(f.file_path),
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f in submission.files
        ]

    project_data = None
    if project:
        project_data = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "status": project.status,
        }

    return MySubmissionResponse(
        submission_id=submission.id if submission else None,
        status=submission.status if submission else "NOT_SUBMITTED",
        submitted_at=submission.updated_at if submission and submission.status == "submitted" else None,
        checklist=checklist,
        files=files,
        project=project_data,
    )


@router.get("/history")
def get_submission_history(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get submission history for the student's team.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    submissions = (
        db.query(Submission)
        .filter(Submission.team_id == team.id)
        .order_by(Submission.created_at.desc())
        .all()
    )

    submission_records = []
    for i, sub in enumerate(submissions):
        submission_records.append({
            "id": sub.id,
            "week_number": i + 1,
            "week_title": sub.title,
            "is_current_week": i == 0,
            "submission_date": sub.created_at.isoformat() if sub.created_at else None,
            "deadline": None,
            "is_late": False,
            "status": sub.status.upper(),
            "submission_type": sub.submission_type,
            "files": [
                {
                    "name": f.file_name,
                    "category": f.category,
                    "size": f.file_size,
                    "upload_date": f.created_at.isoformat() if f.created_at else None,
                    "status": "uploaded",
                }
                for f in (sub.files if sub.files else [])
            ],
            "timeline": [
                {
                    "title": "Created",
                    "timestamp": sub.created_at.isoformat() if sub.created_at else None,
                    "status": "done",
                },
                {
                    "title": "Submitted",
                    "timestamp": sub.updated_at.isoformat() if sub.updated_at else None,
                    "status": "done" if sub.status == "submitted" else "current",
                },
            ],
        })

    return {
        "project_info": {
            "project_title": project.title if project else None,
            "domain": None,
            "team_id": team.id,
            "team_name": team.name,
            "guide_name": None,
            "guide_email": None,
            "student_roll": student.roll_number,
            "student_name": current_user.full_name,
            "problem_statement": project.description if project else None,
            "description": project.description if project else None,
            "proposed_solution": None,
            "technologies_used": None,
        },
        "summary": {
            "total_weeks": len(submissions),
            "approved_count": sum(1 for s in submissions if s.status == "evaluated"),
            "rejected_count": 0,
            "pending_count": sum(1 for s in submissions if s.status == "draft"),
            "current_progress_percentage": 0,
            "submission_rate_percentage": 100 if submissions else 0,
            "on_time_count": len(submissions),
            "total_submitted_count": sum(1 for s in submissions if s.status == "submitted"),
        },
        "submissions": submission_records,
    }


@router.post("/final", response_model=FinalSubmissionResponse)
def submit_final_submission(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Finalize and submit the current submission as final.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    submission = (
        db.query(Submission)
        .filter(Submission.team_id == team.id, Submission.status != "submitted")
        .order_by(Submission.created_at.desc())
        .first()
    )

    if not submission:
        submission = Submission(
            project_id=project.id,
            team_id=team.id,
            submitted_by=current_user.id,
            title=project.title or "Project Submission",
            description=project.description or "",
            submission_type="final_report",
            status="draft",
        )
        db.add(submission)
        db.flush()

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

    submission.status = "submitted"
    submission.submitted_by = current_user.id

    notif = Notification(
        user_id=current_user.id,
        title="Final Submission Successful",
        message=f"Your report '{submission.title}' was successfully submitted as final.",
        notification_type="submission",
        is_read=False,
    )
    db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        action="submission_finalized",
        entity_type="submission",
        entity_id=submission.id,
        details=f"Final report '{submission.title}' submitted by user {current_user.id}.",
    )
    db.add(audit)

    db.commit()
    db.refresh(submission)

    return FinalSubmissionResponse(
        submission_id=submission.id,
        status=submission.status,
        submitted_at=submission.updated_at,
        message="Final submission successful",
    )


@router.post("/reset-demo")
def reset_weekly_history_demo(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Reset weekly submission history for demo purposes.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    submissions = (
        db.query(Submission)
        .filter(Submission.team_id == team.id)
        .all()
    )

    for sub in submissions:
        db.delete(sub)

    db.commit()

    return {
        "project_info": {
            "project_title": project.title if project else None,
            "team_id": team.id,
            "team_name": team.name,
        },
        "summary": {
            "total_weeks": 0,
            "approved_count": 0,
            "rejected_count": 0,
            "pending_count": 0,
        },
        "submissions": [],
    }


@router.put("/week/{week_number}")
def update_weekly_submission(
    week_number: int,
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Update a weekly submission by week number.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    submissions = (
        db.query(Submission)
        .filter(Submission.team_id == team.id)
        .order_by(Submission.created_at.desc())
        .all()
    )

    if week_number < 1 or week_number > len(submissions):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "WEEK_NOT_FOUND",
                    "message": f"Week {week_number} submission not found",
                }
            },
        )

    submission = submissions[week_number - 1]

    if "title" in payload:
        submission.title = payload["title"]
    if "description" in payload:
        submission.description = payload["description"]

    db.commit()
    db.refresh(submission)

    return {
        "id": submission.id,
        "week_number": week_number,
        "week_title": submission.title,
        "status": submission.status.upper(),
        "submission_type": submission.submission_type,
    }


@router.post("/week/{week_number}/auto-submit-and-evaluate")
def auto_submit_and_evaluate(
    week_number: int,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Auto-submit and evaluate a weekly submission.
    """
    student, team, project = _get_student_team_and_project(db, current_user)

    submissions = (
        db.query(Submission)
        .filter(Submission.team_id == team.id)
        .order_by(Submission.created_at.desc())
        .all()
    )

    if week_number < 1 or week_number > len(submissions):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "WEEK_NOT_FOUND",
                    "message": f"Week {week_number} submission not found",
                }
            },
        )

    submission = submissions[week_number - 1]

    if submission.status == "draft":
        submission.status = "submitted"
        submission.submitted_by = current_user.id
        db.commit()
        db.refresh(submission)

    return {
        "project_info": {
            "project_title": project.title if project else None,
            "team_id": team.id,
            "team_name": team.name,
        },
        "summary": {
            "total_weeks": len(submissions),
            "approved_count": sum(1 for s in submissions if s.status == "evaluated"),
        },
        "submissions": [],
    }


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
