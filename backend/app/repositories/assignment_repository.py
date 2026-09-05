from typing import Optional, List
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, DuplicateResourceError
from app.models.assignment import AdvisorTeamAssignment


def create_assignment(advisor_id: str, team_id: str) -> AdvisorTeamAssignment:
    try:
        supabase = get_supabase_admin_client()
        # Check existing
        existing = check_assignment(advisor_id, team_id)
        if existing:
            raise DuplicateResourceError(
                resource="AdvisorTeamAssignment",
                detail=f"Advisor '{advisor_id}' is already assigned to team '{team_id}'",
            )

        insert_data = {
            "advisor_id": advisor_id,
            "team_id": team_id,
        }
        res = supabase.table("advisor_team_assignments").insert(insert_data).execute()
        if not res.data:
            raise DatabaseError(message="Failed to create advisor team assignment")
        return AdvisorTeamAssignment.from_dict(res.data[0])
    except DuplicateResourceError:
        raise
    except Exception as e:
        err_msg = str(e).lower()
        if "duplicate" in err_msg or "unique" in err_msg or "23505" in err_msg:
            raise DuplicateResourceError(
                resource="AdvisorTeamAssignment",
                detail=f"Advisor '{advisor_id}' is already assigned to team '{team_id}'",
            )
        raise DatabaseError(detail=str(e))


def check_assignment(advisor_id: str, team_id: str) -> bool:
    try:
        supabase = get_supabase_client()
        # 1. Check junction table
        res = (
            supabase.table("advisor_team_assignments")
            .select("*")
            .eq("advisor_id", advisor_id)
            .eq("team_id", team_id)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return True

        # 2. Fallback check: teams.faculty_id
        team_res = (
            supabase.table("teams")
            .select("faculty_id")
            .eq("id", team_id)
            .execute()
        )
        if team_res.data and str(team_res.data[0].get("faculty_id")) == str(advisor_id):
            return True

        return False
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_assigned_team_ids(advisor_id: str) -> List[str]:
    try:
        supabase = get_supabase_client()
        team_ids = set()

        # 1. Query junction table
        res = (
            supabase.table("advisor_team_assignments")
            .select("team_id")
            .eq("advisor_id", advisor_id)
            .execute()
        )
        if res.data:
            for item in res.data:
                if "team_id" in item:
                    team_ids.add(str(item["team_id"]))

        # 2. Query teams table where faculty_id = advisor_id
        team_res = (
            supabase.table("teams")
            .select("id")
            .eq("faculty_id", advisor_id)
            .execute()
        )
        if team_res.data:
            for item in team_res.data:
                if "id" in item:
                    team_ids.add(str(item["id"]))

        return list(team_ids)
    except Exception as e:
        raise DatabaseError(detail=str(e))


def remove_assignment(advisor_id: str, team_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.table("advisor_team_assignments").delete().eq("advisor_id", advisor_id).eq("team_id", team_id).execute()
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))
