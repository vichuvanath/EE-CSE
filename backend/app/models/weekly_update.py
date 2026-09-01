from datetime import datetime
from typing import Optional


class WeeklyUpdate:
    def __init__(
        self,
        id: str,
        project_id: str,
        week_number: int,
        objective: str,
        progress: Optional[str] = None,
        challenges: Optional[str] = None,
        submission_url: Optional[str] = None,
        status: str = "submitted",
        submitted_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.project_id = project_id
        self.week_number = week_number
        self.objective = objective
        self.progress = progress
        self.challenges = challenges
        self.submission_url = submission_url
        self.status = status
        self.submitted_at = submitted_at
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "WeeklyUpdate":
        return cls(
            id=data["id"],
            project_id=data["project_id"],
            week_number=data["week_number"],
            objective=data.get("objective", ""),
            progress=data.get("progress"),
            challenges=data.get("challenges"),
            submission_url=data.get("submission_url"),
            status=data.get("status", "submitted"),
            submitted_at=data.get("submitted_at"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )
