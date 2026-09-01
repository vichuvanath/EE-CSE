from datetime import datetime
from typing import Optional


class Project:
    def __init__(
        self,
        id: str,
        team_id: str,
        title: str,
        description: Optional[str] = None,
        github_url: Optional[str] = None,
        status: str = "ongoing",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.team_id = team_id
        self.title = title
        self.description = description
        self.github_url = github_url
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "Project":
        return cls(
            id=data["id"],
            team_id=data["team_id"],
            title=data.get("title", ""),
            description=data.get("description"),
            github_url=data.get("github_url"),
            status=data.get("status", "ongoing"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )
