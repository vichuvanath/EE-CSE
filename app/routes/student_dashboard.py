from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.routes.student_announcements import list_student_announcements
from app.routes.student_deadlines import get_student_deadlines
from app.routes.student_evaluations import list_student_evaluations
from app.routes.student_notifications import get_student_notifications, get_unread_notification_count
from app.routes.student_profile import get_student_profile
from app.routes.student_submissions import list_student_submissions
from app.routes.student_team import get_team_info
from app.schemas.student import StudentDashboardResponse

router = APIRouter(prefix="/student/dashboard", tags=["Student Dashboard"])


@router.get("", response_model=StudentDashboardResponse)
def get_student_dashboard(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Unified dashboard endpoint for the Student Portal.
    Aggregates profile, team, project, deadlines, submissions, notifications, evaluations, and announcements.
    """
    profile = get_student_profile(current_user=current_user, db=db)

    # Fetch team info safely if assigned
    team_resp = None
    project_resp = None
    try:
        team_resp = get_team_info(current_user=current_user, db=db)
        project_resp = team_resp.project
    except Exception:
        pass

    deadlines = get_student_deadlines(upcoming_only=True, current_user=current_user, db=db)
    submissions = list_student_submissions(current_user=current_user, db=db) if team_resp else []
    notifications = get_student_notifications(current_user=current_user, db=db)
    unread_count_resp = get_unread_notification_count(current_user=current_user, db=db)
    evaluations = list_student_evaluations(current_user=current_user, db=db)
    announcements = list_student_announcements(current_user=current_user, db=db)

    return StudentDashboardResponse(
        profile=profile,
        team=team_resp,
        project=project_resp,
        deadlines=deadlines,
        submissions=submissions,
        unread_notifications_count=unread_count_resp.unread_count,
        recent_notifications=notifications[:5],
        evaluations=evaluations,
        announcements=announcements[:5],
    )
