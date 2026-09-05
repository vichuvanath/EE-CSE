from datetime import datetime
from typing import Optional


class SubmissionDeadline:
    def __init__(
        self,
        id: str,
        team_id: str,
        advisor_id: str,
        title: str,
        deadline_at: datetime,
        description: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.team_id = team_id
        self.advisor_id = advisor_id
        self.title = title
        self.deadline_at = deadline_at
        self.description = description
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "SubmissionDeadline":
        return cls(
            id=str(data["id"]),
            team_id=str(data["team_id"]),
            advisor_id=str(data["advisor_id"]),
            title=data.get("title", "Final Project Submission Deadline"),
            deadline_at=data["deadline_at"],
            description=data.get("description"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    def model_dump(self) -> dict:
        return {
            "id": self.id,
            "team_id": self.team_id,
            "advisor_id": self.advisor_id,
            "title": self.title,
            "deadline_at": self.deadline_at,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
