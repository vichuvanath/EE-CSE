from datetime import datetime
from typing import Optional


class Evaluation:
    def __init__(
        self,
        id: str,
        weekly_update_id: str,
        faculty_id: str,
        score: float,
        feedback: Optional[str] = None,
        graded_at: Optional[datetime] = None,
        is_published: bool = False,
        published_at: Optional[datetime] = None,
    ):
        self.id = id
        self.weekly_update_id = weekly_update_id
        self.faculty_id = faculty_id
        self.score = score
        self.feedback = feedback
        self.graded_at = graded_at
        self.is_published = is_published
        self.published_at = published_at

    @classmethod
    def from_dict(cls, data: dict) -> "Evaluation":
        return cls(
            id=data["id"],
            weekly_update_id=data["weekly_update_id"],
            faculty_id=data["faculty_id"],
            score=data.get("score", 0.0),
            feedback=data.get("feedback"),
            graded_at=data.get("graded_at"),
            is_published=data.get("is_published", False),
            published_at=data.get("published_at"),
        )
