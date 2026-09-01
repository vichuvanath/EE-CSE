from datetime import datetime
from typing import Optional, List


class Team:
    def __init__(
        self,
        id: str,
        name: str,
        faculty_id: Optional[str] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.faculty_id = faculty_id
        self.created_at = created_at

    @classmethod
    def from_dict(cls, data: dict) -> "Team":
        return cls(
            id=data["id"],
            name=data.get("name", ""),
            faculty_id=data.get("faculty_id"),
            created_at=data.get("created_at"),
        )


class TeamMember:
    def __init__(
        self,
        id: str,
        team_id: str,
        student_id: str,
        joined_at: Optional[datetime] = None,
    ):
        self.id = id
        self.team_id = team_id
        self.student_id = student_id
        self.joined_at = joined_at

    @classmethod
    def from_dict(cls, data: dict) -> "TeamMember":
        return cls(
            id=data["id"],
            team_id=data["team_id"],
            student_id=data["student_id"],
            joined_at=data.get("joined_at"),
        )
