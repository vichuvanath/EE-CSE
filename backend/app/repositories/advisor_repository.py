from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import DatabaseError
from app.models.academic import Team, TeamMember, Project, TeamAssignment
from app.models.submission import Submission, SubmissionFile
from app.models.student import Student
from app.models.user import User


def _get_db() -> Session:
    return next(get_db())


def _get_evaluation_status_map(team_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    """Batch-fetch evaluation status and scores from Supabase for all team IDs."""
    try:
        from app.core.supabase import get_supabase_admin_client
        supabase = get_supabase_admin_client()
        if not supabase or not team_ids:
            return {}
        res = supabase.table("evaluations").select("team_id, status, team_score, id").in_("team_id", team_ids).execute()
        result = {}
        for row in (res.data or []):
            result[row["team_id"]] = row
        return result
    except Exception:
        return {}


def _get_guide_info_map(team_ids: List[str], db: Session) -> Dict[str, Dict[str, Any]]:
    """Batch-fetch guide/advisor info for all team IDs."""
    if not team_ids:
        return {}
    assignments = (
        db.query(TeamAssignment)
        .filter(TeamAssignment.team_id.in_(team_ids))
        .all()
    )
    advisor_ids = list(set(str(a.advisor_id) for a in assignments))
    advisors_by_id = {}
    if advisor_ids:
        from app.models.advisor import Advisor
        from app.models.user import User
        advisors = (
            db.query(Advisor, User)
            .join(User, Advisor.user_id == User.id)
            .filter(Advisor.id.in_(advisor_ids))
            .all()
        )
        for advisor, user in advisors:
            advisors_by_id[str(advisor.id)] = {
                "id": str(advisor.id),
                "name": user.full_name or "",
                "full_name": user.full_name or "",
                "email": user.email or "",
                "designation": advisor.designation or "",
                "department": advisor.department or "",
            }

    guide_map = {}
    for a in assignments:
        tid = str(a.team_id)
        if tid not in guide_map:
            guide_info = advisors_by_id.get(str(a.advisor_id))
            if guide_info:
                guide_map[tid] = guide_info
    return guide_map


def get_advisor_team_ids(db: Session, advisor_id: str) -> List[str]:
    """Get team IDs assigned to an advisor via SQLAlchemy + Supabase (bypasses RLS)."""
    assignments = db.query(TeamAssignment).filter(TeamAssignment.advisor_id == advisor_id).all()
    team_ids = [str(a.team_id) for a in assignments]

    # Also check teams.faculty_id via Supabase (column not in SQLAlchemy model)
    try:
        from app.core.supabase import get_supabase_admin_client
        supabase = get_supabase_admin_client()
        if supabase:
            res = supabase.table("teams").select("id").eq("faculty_id", advisor_id).execute()
            for row in (res.data or []):
                tid = str(row["id"])
                if tid not in team_ids:
                    team_ids.append(tid)
    except Exception:
        pass

    # Fallback: if no assignments, get all teams
    if not team_ids:
        all_teams = db.query(Team).all()
        team_ids = [str(t.id) for t in all_teams]

    return team_ids


def get_advisor_teams_summary(advisor_id: str) -> List[Dict[str, Any]]:
    try:
        db = _get_db()
        team_ids = get_advisor_team_ids(db, advisor_id)
        if not team_ids:
            return []

        teams = db.query(Team).filter(Team.id.in_(team_ids)).all()
        if not teams:
            return []

        projects = db.query(Project).filter(Project.team_id.in_(team_ids)).all()
        projects_by_team = {str(p.team_id): p for p in projects}

        submissions = db.query(Submission).filter(Submission.team_id.in_(team_ids)).all()
        subs_by_team = {}
        for s in submissions:
            tid = str(s.team_id)
            if tid not in subs_by_team:
                subs_by_team[tid] = s

        members = db.query(TeamMember).filter(TeamMember.team_id.in_(team_ids)).all()
        student_ids = [str(m.student_id) for m in members]

        profiles_by_id = {}
        if student_ids:
            users = db.query(User).filter(User.id.in_(student_ids)).all()
            profiles_by_id = {str(u.id): u for u in users}

        members_by_team: Dict[str, list] = {}
        for m in members:
            tid = str(m.team_id)
            if tid not in members_by_team:
                members_by_team[tid] = []
            members_by_team[tid].append(m)

        eval_map = _get_evaluation_status_map(team_ids)
        guide_map = _get_guide_info_map(team_ids, db)

        summaries = []
        for team in teams:
            tid = str(team.id)
            proj = projects_by_team.get(tid)
            sub = subs_by_team.get(tid)
            t_members = members_by_team.get(tid, [])

            members_list = []
            leader_info = None
            for idx, m in enumerate(t_members):
                sid = str(m.student_id)
                u = profiles_by_id.get(sid)
                member_entry = {
                    "id": sid,
                    "full_name": (u.full_name or "") if u else "",
                    "roll_number": getattr(u, "roll_number", None) if u else None,
                    "email": u.email if u else "",
                    "role": getattr(u, "role", "student") if u else "student",
                }
                members_list.append(member_entry)
                if idx == 0:
                    leader_info = {**member_entry, "is_team_leader": True}

            project_title = proj.title if proj else team.name
            submission_status = "SUBMITTED" if sub and sub.status == "submitted" else "DRAFT"

            eval_info = eval_map.get(tid, {})
            evaluation_status = eval_info.get("status", "NOT_STARTED")
            marks_awarded = eval_info.get("team_score")

            summaries.append({
                "id": tid,
                "team_id": tid,
                "name": team.name or "",
                "project_title": project_title,
                "team_leader": leader_info,
                "members": members_list,
                "member_count": len(t_members),
                "batch": getattr(team, "batch", "2023-2027") or "2023-2027",
                "section": getattr(team, "section", "A") or "A",
                "submission_status": submission_status,
                "evaluation_status": evaluation_status,
                "marks_awarded": marks_awarded,
                "guide": guide_map.get(tid, {}),
            })

        return summaries
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_team_details(advisor_id: str, team_id: str) -> Optional[Dict[str, Any]]:
    try:
        db = _get_db()
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            return None

        member_records = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
        student_ids = [str(m.student_id) for m in member_records]

        student_profiles = []
        if student_ids:
            users = db.query(User).filter(User.id.in_(student_ids)).all()
            users_by_id = {str(u.id): u for u in users}

            for idx, m in enumerate(member_records):
                sid = str(m.student_id)
                u = users_by_id.get(sid)
                student_profiles.append({
                    "id": sid,
                    "roll_number": getattr(u, "roll_number", None) if u else None,
                    "full_name": u.full_name if u else "",
                    "email": u.email if u else "",
                    "is_team_leader": idx == 0,
                })

        project = db.query(Project).filter(Project.team_id == team_id).first()
        submission = db.query(Submission).filter(Submission.team_id == team_id).order_by(Submission.created_at.desc()).first()

        eval_map = _get_evaluation_status_map([team_id])
        eval_info = eval_map.get(team_id, {})
        guide_map = _get_guide_info_map([team_id], db)

        submission_status = "SUBMITTED" if submission and submission.status == "submitted" else "DRAFT"
        submission_date = submission.created_at.strftime("%b %d, %Y, %I:%M %p") if submission and submission.created_at else None

        return {
            "id": str(team.id),
            "team_id": str(team.id),
            "name": team.name or "",
            "project_title": project.title if project else team.name,
            "batch": getattr(team, "batch", "2023-2027") or "2023-2027",
            "section": getattr(team, "section", "A") or "A",
            "member_count": len(student_profiles),
            "team_leader": student_profiles[0] if student_profiles else None,
            "members": student_profiles,
            "project": {
                "id": project.id,
                "title": project.title,
                "domain": getattr(project, "domain", "") or "",
                "problem_statement": getattr(project, "problem_statement", "") or "",
                "description": project.description or "",
                "proposed_solution": getattr(project, "proposed_solution", "") or "",
                "technologies_used": getattr(project, "technologies_used", "") or "",
                "github_url": getattr(project, "github_url", "") or "",
                "live_demo_url": getattr(project, "live_demo_url", "") or "",
                "status": project.status,
            } if project else None,
            "submission_detail": {
                "id": submission.id,
                "title": submission.title,
                "status": submission.status,
                "submission_type": submission.submission_type,
                "created_at": submission.created_at.isoformat() if submission.created_at else None,
            } if submission else None,
            "submission_status": submission_status,
            "submission_date": submission_date,
            "evaluation_status": eval_info.get("status", "NOT_STARTED"),
            "marks_awarded": eval_info.get("team_score"),
            "guide": guide_map.get(team_id, {}),
            "current_phase": "Final Review / Viva",
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_students_list(advisor_id: str) -> List[Dict[str, Any]]:
    try:
        db = _get_db()
        team_ids = get_advisor_team_ids(db, advisor_id)
        if not team_ids:
            return []

        members = db.query(TeamMember).filter(TeamMember.team_id.in_(team_ids)).all()
        student_ids = [str(m.student_id) for m in members]
        if not student_ids:
            return []

        users = db.query(User).filter(User.id.in_(student_ids)).all()
        users_by_id = {str(u.id): u for u in users}

        teams = db.query(Team).filter(Team.id.in_(team_ids)).all()
        teams_by_id = {str(t.id): t for t in teams}

        eval_map = _get_evaluation_status_map(team_ids)

        students = []
        for m in members:
            sid = str(m.student_id)
            tid = str(m.team_id)
            u = users_by_id.get(sid)
            t = teams_by_id.get(tid)

            eval_info = eval_map.get(tid, {})

            students.append({
                "id": sid,
                "full_name": u.full_name if u else "",
                "roll_number": getattr(u, "roll_number", None) if u else None,
                "email": u.email if u else "",
                "role": u.role if u else "student",
                "batch": getattr(t, "batch", "2023-2027") if t else "2023-2027",
                "section": getattr(t, "section", "A") if t else "A",
                "team_id": tid,
                "team_name": t.name if t else "",
                "is_team_leader": False,
                "evaluation_status": eval_info.get("status", "NOT_STARTED"),
            })

        return students
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_student_detail(advisor_id: str, student_id: str) -> Optional[Dict[str, Any]]:
    try:
        db = _get_db()
        membership = db.query(TeamMember).filter(TeamMember.student_id == student_id).first()
        if not membership:
            return None
        team_id = str(membership.team_id)

        team = db.query(Team).filter(Team.id == team_id).first()
        user = db.query(User).filter(User.id == student_id).first()
        if not user:
            return None

        eval_map = _get_evaluation_status_map([team_id])
        eval_info = eval_map.get(team_id, {})

        return {
            "id": str(user.id),
            "full_name": user.full_name or "",
            "roll_number": getattr(user, "roll_number", None),
            "email": user.email,
            "role": user.role,
            "batch": getattr(team, "batch", "2023-2027") if team else "2023-2027",
            "section": getattr(team, "section", "A") if team else "A",
            "team_id": team_id,
            "team_name": team.name if team else "",
            "is_team_leader": False,
            "evaluation_status": eval_info.get("status", "NOT_STARTED"),
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_project_info(advisor_id: str, team_id: str) -> Optional[Dict[str, Any]]:
    try:
        db = _get_db()
        project = db.query(Project).filter(Project.team_id == team_id).first()
        if not project:
            return None

        return {
            "id": project.id,
            "team_id": project.team_id,
            "title": project.title,
            "domain": getattr(project, "domain", "") or "",
            "problem_statement": getattr(project, "problem_statement", "") or "",
            "description": project.description or "",
            "proposed_solution": getattr(project, "proposed_solution", "") or "",
            "technologies_used": getattr(project, "technologies_used", "") or "",
            "github_url": getattr(project, "github_url", "") or "",
            "live_demo_url": getattr(project, "live_demo_url", "") or "",
            "status": project.status,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))
