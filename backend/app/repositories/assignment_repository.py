from typing import Optional, List
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
        from app.core.database import SessionLocal
        from app.models.academic import TeamAssignment, Team
        db = SessionLocal()
        try:
            # Resolve user_id -> advisor_id (advisors table has a separate ID)
            from app.models.advisor import Advisor
            advisor_record = db.query(Advisor).filter(Advisor.user_id == advisor_id).first()
            resolved_advisor_id = advisor_record.id if advisor_record else advisor_id

            # 1. Check team_assignments table (try both resolved and original ID)
            assignment = db.query(TeamAssignment).filter(
                TeamAssignment.team_id == team_id,
            ).filter(
                (TeamAssignment.advisor_id == resolved_advisor_id) |
                (TeamAssignment.advisor_id == advisor_id)
            ).first()
            if assignment:
                return True

            # 2. Check teams.faculty_id
            team = db.query(Team).filter(Team.id == team_id).first()
            if team and str(getattr(team, "faculty_id", None)) in (str(resolved_advisor_id), str(advisor_id)):
                return True

            return False
        finally:
            db.close()
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_assigned_team_ids(advisor_id: str) -> List[str]:
    try:
        from app.core.database import SessionLocal
        from app.models.academic import TeamAssignment, Team
        from app.models.advisor import Advisor
        db = SessionLocal()
        try:
            team_ids = set()

            # Resolve user_id -> advisor_id
            advisor_record = db.query(Advisor).filter(Advisor.user_id == advisor_id).first()
            resolved_advisor_id = advisor_record.id if advisor_record else advisor_id

            # 1. Query team_assignments table (try both resolved and original ID)
            assignments = db.query(TeamAssignment).filter(
                TeamAssignment.advisor_id.in_([resolved_advisor_id, advisor_id])
            ).all()
            for a in assignments:
                team_ids.add(str(a.team_id))

            # 2. Query teams table where faculty_id matches
            teams = db.query(Team).filter(
                Team.faculty_id.in_([resolved_advisor_id, advisor_id])
            ).all() if hasattr(Team, 'faculty_id') else []
            for t in teams:
                team_ids.add(str(t.id))

            # 3. Fallback: if no assignments found, get ALL teams
            if not team_ids:
                all_teams = db.query(Team).all()
                for t in all_teams:
                    team_ids.add(str(t.id))

            return list(team_ids)
        finally:
            db.close()
    except Exception as e:
        raise DatabaseError(detail=str(e))


def remove_assignment(advisor_id: str, team_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.table("advisor_team_assignments").delete().eq("advisor_id", advisor_id).eq("team_id", team_id).execute()
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))
