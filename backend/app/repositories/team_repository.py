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


def get_team_details_for_student(student_id: str) -> Optional[dict]:
    try:
        supabase = get_supabase_client()
        
        # 1. Find team_id for student
        membership = (
            supabase.table("team_members")
            .select("team_id")
            .eq("student_id", student_id)
            .execute()
        )
        if not membership.data:
            return None

        team_id = membership.data[0]["team_id"]

        # 2. Get team record
        team_res = supabase.table("teams").select("*").eq("id", team_id).execute()
        if not team_res.data:
            return None
        team_data = team_res.data[0]

        # 3. Get team members junction records
        members_res = (
            supabase.table("team_members")
            .select("*")
            .eq("team_id", team_id)
            .execute()
        )
        member_records = members_res.data or []
        student_ids = [m["student_id"] for m in member_records if "student_id" in m]

        # Map is_team_leader or leader_id
        leader_id = team_data.get("leader_id") or team_data.get("team_leader_id")

        # 4. Get student profiles
        student_profiles = []
        if student_ids:
            prof_res = supabase.table("profiles").select("*").in_("id", student_ids).execute()
            profiles_by_id = {p["id"]: p for p in (prof_res.data or [])}

            for idx, m in enumerate(member_records):
                sid = m["student_id"]
                p = profiles_by_id.get(sid, {})
                
                # Check team leader status
                is_leader = m.get("is_team_leader", False) or (leader_id and sid == leader_id) or (idx == 0 and not leader_id)

                student_profiles.append({
                    "id": sid,
                    "roll_number": p.get("roll_number"),
                    "full_name": p.get("full_name"),
                    "is_team_leader": bool(is_leader),
                })

        # Find leader info object
        leader_info = next((sp for sp in student_profiles if sp["is_team_leader"]), None)
        if not leader_info and student_profiles:
            leader_info = student_profiles[0]
            leader_info["is_team_leader"] = True

        # 5. Get advisor profile if faculty_id is assigned
        advisor_info = None
        faculty_id = team_data.get("faculty_id") or team_data.get("advisor_id")
        if faculty_id:
            fac_res = supabase.table("profiles").select("*").eq("id", faculty_id).execute()
            if fac_res.data:
                fac = fac_res.data[0]
                advisor_info = {
                    "id": fac.get("id"),
                    "full_name": fac.get("full_name"),
                    "email": fac.get("email"),
                }

        return {
            "team_id": str(team_data["id"]),
            "name": team_data.get("name"),
            "project_title": team_data.get("project_title"),
            "team_leader": leader_info,
            "members": student_profiles,
            "batch": team_data.get("batch", "2023-2027"),
            "section": team_data.get("section", "A"),
            "advisor": advisor_info,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))

