from datetime import datetime
from typing import Optional


class UserProfile:
    def __init__(
        self,
        id: str,
        email: str,
        full_name: str,
        role: str,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.role = role
        self.created_at = created_at

    @classmethod
    def from_dict(cls, data: dict) -> "UserProfile":
        return cls(
            id=data["id"],
            email=data.get("email", ""),
            full_name=data.get("full_name", ""),
            role=data.get("role", "STUDENT"),
            created_at=data.get("created_at"),
        )
