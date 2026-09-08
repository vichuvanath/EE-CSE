from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.student_announcements import router as student_announcements_router
from app.routes.student_dashboard import router as student_dashboard_router
from app.routes.student_deadlines import router as student_deadlines_router
from app.routes.student_evaluations import router as student_evaluations_router
from app.routes.student_files import router as student_files_router
from app.routes.student_notifications import router as student_notifications_router
from app.routes.student_profile import router as student_profile_router
from app.routes.student_submissions import router as student_submissions_router
from app.routes.student_team import router as student_team_router
from app.routes.test_rbac import router as test_rbac_router

__all__ = [
    "auth_router",
    "health_router",
    "student_announcements_router",
    "student_dashboard_router",
    "student_deadlines_router",
    "student_evaluations_router",
    "student_files_router",
    "student_notifications_router",
    "student_profile_router",
    "student_submissions_router",
    "student_team_router",
    "test_rbac_router",
]
