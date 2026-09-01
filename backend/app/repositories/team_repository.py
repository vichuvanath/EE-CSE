from typing import Optional
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import (
    ResourceNotFoundError,
    DatabaseError,
    TeamCapacityError,
    StudentAlreadyAssignedError,
    StudentNotAssignedError,
)
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberResponse,
    TeamWithMembers,
)

MAX_TEAM_CAPACITY = 5


def create_team(data: TeamCreate, created_by: Optional[str] = None) -> TeamResponse:
    try:
        supabase = get_supabase_admin_client()
        insert_data = {
            "name": data.name,
            "project_title": data.project_title,
        }
        if data.faculty_id:
            insert_data["faculty_id"] = data.faculty_id
        result = supabase.table("teams").insert(insert_data).execute()
        if not result.data:
            raise DatabaseError(message="Failed to create team")
        return TeamResponse(**result.data[0])
    except DatabaseError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_team_by_id(team_id: str) -> Optional[TeamResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("teams").select("*").eq("id", team_id).execute()
        if not result.data:
            return None
        return TeamResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_all_teams() -> list[TeamResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("teams").select("*").execute()
        return [TeamResponse(**team) for team in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_teams_by_faculty(faculty_id: str) -> list[TeamResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("teams").select("*").eq("faculty_id", faculty_id).execute()
        return [TeamResponse(**team) for team in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_team(team_id: str, data: TeamUpdate) -> TeamResponse:
    try:
        supabase = get_supabase_admin_client()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise DatabaseError(message="No fields to update")
        result = supabase.table("teams").update(update_data).eq("id", team_id).execute()
        if not result.data:
            raise ResourceNotFoundError("Team", team_id)
        return TeamResponse(**result.data[0])
    except (ResourceNotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def delete_team(team_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.table("team_members").delete().eq("team_id", team_id).execute()
        supabase.table("teams").delete().eq("id", team_id).execute()
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))


def add_student_to_team(team_id: str, student_id: str, added_by: Optional[str] = None) -> TeamMemberResponse:
    try:
        supabase = get_supabase_admin_client()

        existing = check_student_team_membership(student_id)
        if existing:
            raise StudentAlreadyAssignedError(student_id)

        member_count = get_team_member_count(team_id)
        if member_count >= MAX_TEAM_CAPACITY:
            raise TeamCapacityError(team_id, MAX_TEAM_CAPACITY)

        insert_data = {"team_id": team_id, "student_id": student_id}
        if added_by:
            insert_data["added_by"] = added_by

        result = supabase.table("team_members").insert(insert_data).execute()
        if not result.data:
            raise DatabaseError(message="Failed to add student to team")
        return TeamMemberResponse(**result.data[0])
    except (StudentAlreadyAssignedError, TeamCapacityError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def remove_student_from_team(team_id: str, student_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        result = (
            supabase.table("team_members")
            .delete()
            .eq("team_id", team_id)
            .eq("student_id", student_id)
            .execute()
        )
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_team_members(team_id: str) -> list[dict]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("team_members")
            .select("*")
            .eq("team_id", team_id)
            .execute()
        )
        return result.data or []
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_student_team(student_id: str) -> Optional[TeamResponse]:
    try:
        supabase = get_supabase_client()
        membership = (
            supabase.table("team_members")
            .select("team_id")
            .eq("student_id", student_id)
            .execute()
        )
        if not membership.data:
            return None
        team_id = membership.data[0]["team_id"]
        return get_team_by_id(team_id)
    except Exception as e:
        raise DatabaseError(detail=str(e))


def check_student_team_membership(student_id: str) -> bool:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("team_members")
            .select("*")
            .eq("student_id", student_id)
            .execute()
        )
        return len(result.data) > 0
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_team_member_count(team_id: str) -> int:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("team_members")
            .select("*", count="exact")
            .eq("team_id", team_id)
            .execute()
        )
        return result.count or len(result.data)
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_team_with_members(team_id: str) -> Optional[TeamWithMembers]:
    try:
        team = get_team_by_id(team_id)
        if not team:
            return None
        members = get_team_members(team_id)
        return TeamWithMembers(
            id=team.id,
            name=team.name,
            project_title=team.project_title,
            faculty_id=team.faculty_id,
            members=members,
            member_count=len(members),
            created_at=team.created_at,
        )
    except Exception as e:
        raise DatabaseError(detail=str(e))
