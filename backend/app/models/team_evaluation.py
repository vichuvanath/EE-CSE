from datetime import datetime
from typing import Optional


class TeamEvaluation:
    def __init__(
        self,
        id: str,
        team_id: str,
        advisor_id: str,
        status: str = "NOT_STARTED",
        team_score: Optional[float] = None,
        team_remarks: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.team_id = team_id
        self.advisor_id = advisor_id
        self.status = status
        self.team_score = team_score
        self.team_remarks = team_remarks
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "TeamEvaluation":
        return cls(
            id=str(data["id"]),
            team_id=str(data["team_id"]),
            advisor_id=str(data["advisor_id"]),
            status=data.get("status", "NOT_STARTED"),
            team_score=float(data["team_score"]) if data.get("team_score") is not None else None,
            team_remarks=data.get("team_remarks"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    def model_dump(self) -> dict:
        return {
            "id": self.id,
            "team_id": self.team_id,
            "advisor_id": self.advisor_id,
            "status": self.status,
            "team_score": self.team_score,
            "team_remarks": self.team_remarks,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
