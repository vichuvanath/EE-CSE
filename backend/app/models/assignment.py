from datetime import datetime
from typing import Optional


class AdvisorTeamAssignment:
    def __init__(
        self,
        id: str,
        advisor_id: str,
        team_id: str,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.advisor_id = advisor_id
        self.team_id = team_id
        self.created_at = created_at

    @classmethod
    def from_dict(cls, data: dict) -> "AdvisorTeamAssignment":
        return cls(
            id=str(data["id"]),
            advisor_id=str(data["advisor_id"]),
            team_id=str(data["team_id"]),
            created_at=data.get("created_at"),
        )

    def model_dump(self) -> dict:
        return {
            "id": self.id,
            "advisor_id": self.advisor_id,
            "team_id": self.team_id,
            "created_at": self.created_at.isoformat() if self.created_at and hasattr(self.created_at, "isoformat") else self.created_at,
        }
