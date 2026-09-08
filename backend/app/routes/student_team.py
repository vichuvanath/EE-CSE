from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.academic import Class, Project, Team, TeamMember
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.student import ProjectResponse, TeamMemberResponse, TeamResponse

router = APIRouter(prefix="/student/team", tags=["Student Team"])


def get_student_team(db: Session, user: User) -> Team:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "STUDENT_PROFILE_NOT_FOUND",
                    "message": "Student profile not found",
                }
            },
        )

    membership = (
        db.query(TeamMember).filter(TeamMember.student_id == student.id).first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_IN_TEAM",
                    "message": "Student is not assigned to any project team",
                }
            },
        )

    team = db.query(Team).filter(Team.id == membership.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TEAM_NOT_FOUND",
                    "message": "Assigned team not found",
                }
            },
        )

    return team


@router.get("", response_model=TeamResponse)
def get_team_info(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get current project team details for the authenticated student.
    Includes project info, class name, and team member list.
    """
    team = get_student_team(db, current_user)
    cls = db.query(Class).filter(Class.id == team.class_id).first()
    project = db.query(Project).filter(Project.team_id == team.id).first()

    memberships = (
        db.query(TeamMember, Student, User)
        .join(Student, TeamMember.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .filter(TeamMember.team_id == team.id)
        .all()
    )

    member_responses = [
        TeamMemberResponse(
            student_id=st.id,
            roll_number=st.roll_number,
            full_name=u.full_name,
            email=u.email,
            joined_at=tm.joined_at,
        )
        for tm, st, u in memberships
    ]

    project_resp = (
        ProjectResponse.model_validate(project) if project else None
    )

    return TeamResponse(
        id=team.id,
        name=team.name,
        class_id=team.class_id,
        class_name=cls.name if cls else "EE Senior Project",
        project=project_resp,
        members=member_responses,
    )


@router.get("/members", response_model=list[TeamMemberResponse])
def get_team_members(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """
    Get list of team members in the authenticated student's team.
    """
    team = get_student_team(db, current_user)
    memberships = (
        db.query(TeamMember, Student, User)
        .join(Student, TeamMember.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .filter(TeamMember.team_id == team.id)
        .all()
    )

    return [
        TeamMemberResponse(
            student_id=st.id,
            roll_number=st.roll_number,
            full_name=u.full_name,
            email=u.email,
            joined_at=tm.joined_at,
        )
        for tm, st, u in memberships
    ]
