import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.advisor import Advisor
    from app.models.submission import Submission
    from app.models.evaluation import Evaluation
    from app.models.communication import Announcement, AnnouncementRead, Notification
    from app.models.audit import AuditLog


class UserRole:
    STUDENT = "student"
    ADVISOR = "advisor"
    ADMIN = "admin"


class User(Base):
    """
    Represents authentication and core application users.
    Supported roles: student, advisor, admin.
    """

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('student', 'advisor', 'admin')", name="ck_user_role_valid"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    supabase_uid: Mapped[Optional[str]] = mapped_column(
        String(36), unique=True, nullable=True, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, default=UserRole.STUDENT, index=True
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    student_profile: Mapped[Optional["Student"]] = relationship(
        "Student", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    advisor_profile: Mapped[Optional["Advisor"]] = relationship(
        "Advisor", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    submissions: Mapped[List["Submission"]] = relationship(
        "Submission", back_populates="submitter"
    )
    evaluations: Mapped[List["Evaluation"]] = relationship(
        "Evaluation", back_populates="evaluator"
    )
    announcements_created: Mapped[List["Announcement"]] = relationship(
        "Announcement", back_populates="creator"
    )
    announcement_reads: Mapped[List["AnnouncementRead"]] = relationship(
        "AnnouncementRead", back_populates="user"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="user"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="user"
    )
