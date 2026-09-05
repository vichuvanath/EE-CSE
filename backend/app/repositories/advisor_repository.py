from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client
from app.core.exceptions import DatabaseError
from app.repositories.assignment_repository import get_assigned_team_ids, check_assignment


def get_advisor_teams_summary(advisor_id: str) -> List[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return []

        # 1. Fetch team records
        team_res = supabase.table("teams").select("*").in_("id", team_ids).execute()
        teams = team_res.data or []
        if not teams:
            return []

        # 2. Fetch projects map
        proj_res = supabase.table("projects").select("*").in_("team_id", team_ids).execute()
        projects_by_team = {str(p["team_id"]): p for p in (proj_res.data or [])}

        # 3. Fetch submissions map
        sub_res = supabase.table("submissions").select("*").in_("team_id", team_ids).execute()
        subs_by_team = {str(s["team_id"]): s for s in (sub_res.data or [])}

        # 4. Fetch team members map
        members_res = supabase.table("team_members").select("*").in_("team_id", team_ids).execute()
        members = members_res.data or []
        student_ids = [m["student_id"] for m in members if "student_id" in m]

        profiles_by_id = {}
        if student_ids:
            prof_res = supabase.table("profiles").select("*").in_("id", student_ids).execute()
            profiles_by_id = {str(p["id"]): p for p in (prof_res.data or [])}

        members_by_team = {}
        for m in members:
            tid = str(m["team_id"])
            if tid not in members_by_team:
                members_by_team[tid] = []
            members_by_team[tid].append(m)

        summaries = []
        for team in teams:
            tid = str(team["id"])
            proj = projects_by_team.get(tid, {})
            sub = subs_by_team.get(tid, {})
            t_members = members_by_team.get(tid, [])

            leader_id = team.get("leader_id") or team.get("team_leader_id")
            leader_info = None
            for idx, m in enumerate(t_members):
                sid = str(m["student_id"])
                p = profiles_by_id.get(sid, {})
                is_leader = m.get("is_team_leader", False) or (leader_id and sid == str(leader_id)) or (idx == 0 and not leader_id)
                if is_leader:
                    leader_info = {
                        "id": sid,
                        "roll_number": p.get("roll_number"),
                        "full_name": p.get("full_name", ""),
                        "email": p.get("email"),
                        "is_team_leader": True,
                    }
                    break

            project_title = proj.get("title") or team.get("project_title") or team.get("name")
            submission_status = "SUBMITTED" if sub and sub.get("status") == "SUBMITTED" else "DRAFT"

            summaries.append({
                "team_id": tid,
                "name": team.get("name", ""),
                "project_title": project_title,
                "team_leader": leader_info,
                "member_count": len(t_members),
                "batch": team.get("batch", "2023-2027"),
                "section": team.get("section", "A"),
                "submission_status": submission_status,
                "evaluation_status": None,
            })

        return summaries
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_team_details(advisor_id: str, team_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        # Verify assignment
        if not check_assignment(advisor_id, team_id):
            return None

        # Fetch team record
        team_res = supabase.table("teams").select("*").eq("id", team_id).execute()
        if not team_res.data:
            return None
        team = team_res.data[0]

        # Fetch members
        members_res = supabase.table("team_members").select("*").eq("team_id", team_id).execute()
        member_records = members_res.data or []
        student_ids = [m["student_id"] for m in member_records if "student_id" in m]

        student_profiles = []
        leader_id = team.get("leader_id") or team.get("team_leader_id")
        if student_ids:
            prof_res = supabase.table("profiles").select("*").in_("id", student_ids).execute()
            profiles_by_id = {str(p["id"]): p for p in (prof_res.data or [])}

            for idx, m in enumerate(member_records):
                sid = str(m["student_id"])
                p = profiles_by_id.get(sid, {})
                is_leader = m.get("is_team_leader", False) or (leader_id and sid == str(leader_id)) or (idx == 0 and not leader_id)
                student_profiles.append({
                    "id": sid,
                    "roll_number": p.get("roll_number"),
                    "full_name": p.get("full_name", ""),
                    "email": p.get("email"),
                    "is_team_leader": bool(is_leader),
                })

        leader_info = next((sp for sp in student_profiles if sp["is_team_leader"]), None)
        if not leader_info and student_profiles:
            leader_info = student_profiles[0]
            leader_info["is_team_leader"] = True

        # Fetch advisor profile
        advisor_info = None
        faculty_id = team.get("faculty_id") or advisor_id
        if faculty_id:
            fac_res = supabase.table("profiles").select("*").eq("id", faculty_id).execute()
            if fac_res.data:
                fac = fac_res.data[0]
                advisor_info = {
                    "id": str(fac["id"]),
                    "full_name": fac.get("full_name", ""),
                    "email": fac.get("email"),
                }

        # Fetch project
        proj_res = supabase.table("projects").select("*").eq("team_id", team_id).execute()
        project_data = proj_res.data[0] if proj_res.data else None

        # Fetch submission
        sub_res = supabase.table("submissions").select("*").eq("team_id", team_id).execute()
        submission_data = sub_res.data[0] if sub_res.data else None

        return {
            "team_id": str(team["id"]),
            "name": team.get("name", ""),
            "project_title": project_data.get("title") if project_data else team.get("project_title"),
            "batch": team.get("batch", "2023-2027"),
            "section": team.get("section", "A"),
            "member_count": len(student_profiles),
            "team_leader": leader_info,
            "advisor": advisor_info,
            "members": student_profiles,
            "project": project_data,
            "submission": submission_data,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_students_list(advisor_id: str) -> List[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return []

        # Fetch team records map
        teams_res = supabase.table("teams").select("*").in_("id", team_ids).execute()
        teams_by_id = {str(t["id"]): t for t in (teams_res.data or [])}

        # Fetch members
        members_res = supabase.table("team_members").select("*").in_("team_id", team_ids).execute()
        member_records = members_res.data or []
        student_ids = [m["student_id"] for m in member_records if "student_id" in m]

        if not student_ids:
            return []

        prof_res = supabase.table("profiles").select("*").in_("id", student_ids).execute()
        profiles_by_id = {str(p["id"]): p for p in (prof_res.data or [])}

        students = []
        for m in member_records:
            sid = str(m["student_id"])
            tid = str(m["team_id"])
            p = profiles_by_id.get(sid, {})
            t = teams_by_id.get(tid, {})

            leader_id = t.get("leader_id") or t.get("team_leader_id")
            is_leader = m.get("is_team_leader", False) or (leader_id and sid == str(leader_id))

            students.append({
                "id": sid,
                "full_name": p.get("full_name", ""),
                "roll_number": p.get("roll_number"),
                "email": p.get("email"),
                "role": p.get("role", "student"),
                "batch": t.get("batch", "2023-2027"),
                "section": t.get("section", "A"),
                "team_id": tid,
                "team_name": t.get("name", ""),
                "is_team_leader": bool(is_leader),
                "evaluation_status": None,
            })

        return students
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_student_detail(advisor_id: str, student_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        # 1. Find team membership
        mem_res = supabase.table("team_members").select("*").eq("student_id", student_id).execute()
        if not mem_res.data:
            return None
        membership = mem_res.data[0]
        team_id = str(membership["team_id"])

        # 2. Verify advisor access to team
        if not check_assignment(advisor_id, team_id):
            return None

        # 3. Fetch profile and team data
        prof_res = supabase.table("profiles").select("*").eq("id", student_id).execute()
        if not prof_res.data:
            return None
        profile = prof_res.data[0]

        team_res = supabase.table("teams").select("*").eq("id", team_id).execute()
        team = team_res.data[0] if team_res.data else {}

        leader_id = team.get("leader_id") or team.get("team_leader_id")
        is_leader = membership.get("is_team_leader", False) or (leader_id and str(student_id) == str(leader_id))

        return {
            "id": str(profile["id"]),
            "full_name": profile.get("full_name", ""),
            "roll_number": profile.get("roll_number"),
            "email": profile.get("email"),
            "role": profile.get("role", "student"),
            "batch": team.get("batch", "2023-2027"),
            "section": team.get("section", "A"),
            "team_id": team_id,
            "team_name": team.get("name", ""),
            "is_team_leader": bool(is_leader),
            "evaluation_status": None,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_project_info(advisor_id: str, team_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        # Verify assignment
        if not check_assignment(advisor_id, team_id):
            return None

        # Fetch project
        proj_res = supabase.table("projects").select("*").eq("team_id", team_id).execute()
        if not proj_res.data:
            return None
        project = proj_res.data[0]

        # Fetch project files
        files_res = supabase.table("project_files").select("*").eq("team_id", team_id).execute()
        files_data = files_res.data or []

        project["files"] = files_data
        return project
    except Exception as e:
        raise DatabaseError(detail=str(e))
