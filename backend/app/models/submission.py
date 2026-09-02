from datetime import datetime
from typing import Optional


class Submission:
    def __init__(
        self,
        id: str,
        project_id: str,
        team_id: str,
        status: str = "SUBMITTED",
        submitted_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.project_id = project_id
        self.team_id = team_id
        self.status = status
        self.submitted_at = submitted_at
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "Submission":
        return cls(
            id=str(data["id"]),
            project_id=str(data["project_id"]),
            team_id=str(data["team_id"]),
            status=data.get("status", "SUBMITTED"),
            submitted_at=data.get("submitted_at"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )
