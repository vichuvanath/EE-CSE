from app.core.database import Base
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.advisor import Advisor
from app.models.academic import (
    Class,
    ClassEnrollment,
    Team,
    TeamMember,
    TeamAssignment,
    Project,
)
from app.models.submission import Submission, SubmissionFile
from app.models.evaluation import Evaluation, EvaluationScore
from app.models.communication import (
    Deadline,
    Announcement,
    AnnouncementTarget,
    AnnouncementRead,
    Notification,
)
from app.models.audit import AuditLog

__all__ = [
    "Base",
    "User",
    "UserRole",
    "Student",
    "Advisor",
    "Class",
    "ClassEnrollment",
    "Team",
    "TeamMember",
    "TeamAssignment",
    "Project",
    "Submission",
    "SubmissionFile",
    "Evaluation",
    "EvaluationScore",
    "Deadline",
    "Announcement",
    "AnnouncementTarget",
    "AnnouncementRead",
    "Notification",
    "AuditLog",
]
