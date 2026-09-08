from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import TeamMember
from app.models.evaluation import Evaluation, EvaluationScore
from app.models.student import Student
from app.models.submission import Submission
from app.models.user import User, UserRole
from app.schemas.student import EvaluationResponse, EvaluationScoreResponse

router = APIRouter(prefix="/student/evaluations", tags=["Student Evaluations"])


def _format_evaluation_response(ev: Evaluation) -> EvaluationResponse:
    score_responses = [
        EvaluationScoreResponse(
            id=s.id,
            rubric_criterion=s.rubric_criterion,
            max_score=s.max_score,
            score=s.score,
            comments=s.comments,
        )
        for s in ev.scores
    ]
    return EvaluationResponse(
        id=ev.id,
        submission_id=ev.submission_id,
        feedback=ev.feedback,
        total_score=ev.total_score,
        created_at=ev.created_at,
        scores=score_responses,
    )


@router.get("", response_model=List[EvaluationResponse])
def list_student_evaluations(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    List released evaluations for the authenticated student's team submissions.
    STRICT PRIVACY: Unreleased or draft evaluations are completely hidden.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return []

    membership = (
        db.query(TeamMember).filter(TeamMember.student_id == student.id).first()
    )
    if not membership:
        return []

    # Get team's submissions that are in 'evaluated' or 'released' status
    submissions = (
        db.query(Submission)
        .filter(
            Submission.team_id == membership.team_id,
            Submission.status.in_(["evaluated", "released"]),
        )
        .all()
    )
    sub_ids = [s.id for s in submissions]

    if not sub_ids:
        return []

    # Retrieve evaluations attached to these released submissions
    evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.submission_id.in_(sub_ids))
        .all()
    )

    return [_format_evaluation_response(ev) for ev in evaluations]


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation_details(
    evaluation_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get specific released evaluation feedback and rubric scores.
    STRICT SECURITY: Returns 404 if evaluation does not exist, belongs to another team, or is not yet released.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "EVALUATION_NOT_FOUND",
                    "message": "Evaluation not found or not released",
                }
            },
        )

    membership = (
        db.query(TeamMember).filter(TeamMember.student_id == student.id).first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "EVALUATION_NOT_FOUND",
                    "message": "Evaluation not found or not released",
                }
            },
        )

    ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "EVALUATION_NOT_FOUND",
                    "message": "Evaluation not found or not released",
                }
            },
        )

    # Verify submission belongs to team and is in released status
    submission = (
        db.query(Submission)
        .filter(
            Submission.id == ev.submission_id,
            Submission.team_id == membership.team_id,
            Submission.status.in_(["evaluated", "released"]),
        )
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "EVALUATION_NOT_FOUND",
                    "message": "Evaluation not found or not released",
                }
            },
        )

    return _format_evaluation_response(ev)
