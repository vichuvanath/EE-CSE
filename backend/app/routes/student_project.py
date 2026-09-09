from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import Project, Team, TeamMember
from app.models.student import Student
from app.models.user import User, UserRole

router = APIRouter(prefix="/student/project", tags=["Student Project"])


class ProjectResponse(BaseModel):
    id: Optional[str] = None
    team_id: Optional[str] = None
    title: str
    domain: str = ""
    problem_statement: str = ""
    description: str = ""
    proposed_solution: str = ""
    technologies_used: str = ""
    github_url: str = ""
    live_demo_url: str = ""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    domain: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    proposed_solution: Optional[str] = None
    technologies_used: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None


def _get_student_team_and_project(db: Session, user: User):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "STUDENT_PROFILE_NOT_FOUND", "message": "Student profile not found"}},
        )
    membership = db.query(TeamMember).filter(TeamMember.student_id == student.id).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "NO_TEAM_ASSIGNED", "message": "Student is not assigned to a team"}},
        )
    team = db.query(Team).filter(Team.id == membership.team_id).first()
    project = db.query(Project).filter(Project.team_id == team.id).first()
    return student, team, project


@router.get("", response_model=ProjectResponse)
def get_student_project(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Get the project details for the student's team."""
    student, team, project = _get_student_team_and_project(db, current_user)

    if not project:
        return ProjectResponse(
            title=f"{team.name} Senior Project",
            domain="",
            problem_statement="",
            description="",
            proposed_solution="",
            technologies_used="",
            github_url="",
            live_demo_url="",
        )

    return ProjectResponse(
        id=project.id,
        team_id=project.team_id,
        title=project.title,
        domain=getattr(project, "domain", "") or "",
        problem_statement=getattr(project, "problem_statement", "") or "",
        description=project.description or "",
        proposed_solution=getattr(project, "proposed_solution", "") or "",
        technologies_used=getattr(project, "technologies_used", "") or "",
        github_url=getattr(project, "github_url", "") or "",
        live_demo_url=getattr(project, "live_demo_url", "") or "",
        created_at=project.created_at.isoformat() if project.created_at else None,
        updated_at=project.updated_at.isoformat() if project.updated_at else None,
    )


@router.put("", response_model=ProjectResponse)
def update_student_project(
    payload: ProjectUpdate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Update project details for the student's team."""
    student, team, project = _get_student_team_and_project(db, current_user)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "No project found for your team"}},
        )

    if payload.title is not None:
        project.title = payload.title.strip()
    if payload.domain is not None:
        project.domain = payload.domain
    if payload.problem_statement is not None:
        project.problem_statement = payload.problem_statement
    if payload.description is not None:
        project.description = payload.description
    if payload.proposed_solution is not None:
        project.proposed_solution = payload.proposed_solution
    if payload.technologies_used is not None:
        project.technologies_used = payload.technologies_used
    if payload.github_url is not None:
        project.github_url = payload.github_url
    if payload.live_demo_url is not None:
        project.live_demo_url = payload.live_demo_url

    # Synchronize submissions for this team to point to project
    from app.models.submission import Submission
    submissions = db.query(Submission).filter(Submission.team_id == team.id).all()
    for sub in submissions:
        if not sub.project_id or sub.project_id != project.id:
            sub.project_id = project.id
        if payload.title is not None and (not sub.title or sub.title.startswith("Team ") or sub.title == "Project Submission"):
            sub.title = payload.title.strip()

    db.commit()
    db.refresh(project)

    return ProjectResponse(
        id=project.id,
        team_id=project.team_id,
        title=project.title,
        domain=getattr(project, "domain", "") or "",
        problem_statement=getattr(project, "problem_statement", "") or "",
        description=project.description or "",
        proposed_solution=getattr(project, "proposed_solution", "") or "",
        technologies_used=getattr(project, "technologies_used", "") or "",
        github_url=getattr(project, "github_url", "") or "",
        live_demo_url=getattr(project, "live_demo_url", "") or "",
        created_at=project.created_at.isoformat() if project.created_at else None,
        updated_at=project.updated_at.isoformat() if project.updated_at else None,
    )
