from datetime import datetime
from typing import Optional


class Project:
    def __init__(
        self,
        id: str,
        team_id: str,
        title: str,
        domain: Optional[str] = None,
        problem_statement: Optional[str] = None,
        description: Optional[str] = None,
        proposed_solution: Optional[str] = None,
        technologies_used: Optional[str] = None,
        github_url: Optional[str] = None,
        live_demo_url: Optional[str] = None,
        status: str = "ongoing",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.team_id = team_id
        self.title = title
        self.domain = domain
        self.problem_statement = problem_statement
        self.description = description
        self.proposed_solution = proposed_solution
        self.technologies_used = technologies_used
        self.github_url = github_url
        self.live_demo_url = live_demo_url
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "Project":
        return cls(
            id=str(data["id"]),
            team_id=str(data["team_id"]),
            title=data.get("title", ""),
            domain=data.get("domain"),
            problem_statement=data.get("problem_statement"),
            description=data.get("description"),
            proposed_solution=data.get("proposed_solution"),
            technologies_used=data.get("technologies_used"),
            github_url=data.get("github_url"),
            live_demo_url=data.get("live_demo_url"),
            status=data.get("status", "ongoing"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


