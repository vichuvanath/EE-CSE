from datetime import datetime
from typing import Optional


class Notification:
    def __init__(
        self,
        id: str,
        recipient_id: str,
        type: str,
        title: str,
        message: str,
        team_id: Optional[str] = None,
        is_read: bool = False,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.recipient_id = recipient_id
        self.type = type
        self.title = title
        self.message = message
        self.team_id = team_id
        self.is_read = is_read
        self.created_at = created_at

    @classmethod
    def from_dict(cls, data: dict) -> "Notification":
        return cls(
            id=str(data["id"]),
            recipient_id=str(data["recipient_id"]),
            type=data["type"],
            title=data["title"],
            message=data["message"],
            team_id=str(data["team_id"]) if data.get("team_id") else None,
            is_read=bool(data.get("is_read", False)),
            created_at=data.get("created_at"),
        )

    def model_dump(self) -> dict:
        return {
            "id": self.id,
            "recipient_id": self.recipient_id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "team_id": self.team_id,
            "is_read": self.is_read,
            "created_at": self.created_at,
        }
