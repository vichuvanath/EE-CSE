import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.academic import Project, Team
    from app.models.evaluation import Evaluation


class Submission(Base):
    """
    Represents a report or project milestone submission made by a student / team.
    """

    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submitted_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submission_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="interim_report"
    )  # e.g., proposal, interim_report, final_report
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="submitted"
    )  # e.g., draft, submitted, under_review, evaluated

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
    project: Mapped["Project"] = relationship("Project", back_populates="submissions")
    team: Mapped["Team"] = relationship("Team", back_populates="submissions")
    submitter: Mapped[Optional["User"]] = relationship("User", back_populates="submissions")
    files: Mapped[List["SubmissionFile"]] = relationship(
        "SubmissionFile", back_populates="submission", cascade="all, delete-orphan"
    )
    evaluations: Mapped[List["Evaluation"]] = relationship(
        "Evaluation", back_populates="submission", cascade="all, delete-orphan"
    )


class SubmissionFile(Base):
    """
    Stores file metadata and storage paths for report submissions.
    Binary files are stored in Supabase Storage, NOT in PostgreSQL.
    """

    __tablename__ = "submission_files"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True
    )

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)  # Path inside Supabase Storage bucket
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Size in bytes
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # ABSTRACT, REPORT, PPT, IMAGE
    storage_bucket: Mapped[str] = mapped_column(
        String(100), nullable=False, default="reports"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    submission: Mapped["Submission"] = relationship("Submission", back_populates="files")
