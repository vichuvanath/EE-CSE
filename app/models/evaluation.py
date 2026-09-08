import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.submission import Submission


class Evaluation(Base):
    """
    Represents evaluation feedback and overall score assigned to a submission by an advisor/evaluator.
    """

    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evaluator_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

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
    submission: Mapped["Submission"] = relationship("Submission", back_populates="evaluations")
    evaluator: Mapped[Optional["User"]] = relationship("User", back_populates="evaluations")
    scores: Mapped[List["EvaluationScore"]] = relationship(
        "EvaluationScore", back_populates="evaluation", cascade="all, delete-orphan"
    )


class EvaluationScore(Base):
    """
    Stores individual rubric criteria breakdown scores for an evaluation.
    """

    __tablename__ = "evaluation_scores"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    evaluation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False, index=True
    )

    rubric_criterion: Mapped[str] = mapped_column(String(255), nullable=False)
    max_score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="scores")
