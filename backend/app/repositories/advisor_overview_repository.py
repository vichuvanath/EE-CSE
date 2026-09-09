# app/repositories/advisor_overview_repository.py
from typing import Dict, Any, Optional, List
from sqlalchemy import or_, func
from app.core.database import SessionLocal
from app.core.exceptions import DatabaseError
from app.repositories.assignment_repository import get_assigned_team_ids
from app.models.academic import Team, TeamMember, Project
from app.models.submission import Submission, SubmissionFile
from app.models.evaluation import Evaluation
from app.models.student import Student
from app.models.user import User


def get_advisor_dashboard_stats(advisor_id: str) -> Dict[str, Any]:
    try:
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return {
                "total_assigned_teams": 0,
                "total_students": 0,
                "total_projects": 0,
                "total_submissions": 0,
                "pending_submission_reviews": 0,
                "pending_document_reviews": 0,
                "teams_evaluated": 0,
                "teams_not_evaluated": 0,
                "teams_in_progress": 0,
                "teams_submitted": 0,
                "teams_locked": 0,
                "total_teams": 0,
                "submitted_count": 0,
                "evaluated_count": 0,
                "pending_submissions": 0,
                "pending_evaluations": 0,
            }

        db = SessionLocal()
        try:
            total_assigned_teams = len(team_ids)

            # 1. Total distinct students in assigned teams
            student_members = (
                db.query(TeamMember.student_id)
                .filter(TeamMember.team_id.in_(team_ids))
                .distinct()
                .all()
            )
            total_students = len(student_members)

            # 2. Total projects
            total_projects = (
                db.query(Project.id)
                .filter(Project.team_id.in_(team_ids))
                .count()
            )

            # 3. Total submissions
            subs = (
                db.query(Submission)
                .filter(Submission.team_id.in_(team_ids))
                .all()
            )
            total_submissions = len(subs)
            sub_ids = [str(s.id) for s in subs]

            # 4. Evaluations for these submissions
            evaluated_sub_ids = set()
            if sub_ids:
                eval_records = (
                    db.query(Evaluation.submission_id)
                    .filter(Evaluation.submission_id.in_(sub_ids))
                    .all()
                )
                evaluated_sub_ids = {str(e[0]) for e in eval_records if e[0]}

            # Pending submission reviews:
            # Submissions whose status is not evaluated and have no evaluation record
            pending_sub_reviews = len([
                s for s in subs
                if str(s.id) not in evaluated_sub_ids and str(s.status).lower() not in ["evaluated", "approved"]
            ])

            # 5. Pending document reviews:
            # Files with categories ABSTRACT, REPORT, PPT attached to these submissions
            pending_doc_reviews = 0
            if sub_ids:
                doc_files = (
                    db.query(SubmissionFile)
                    .filter(
                        SubmissionFile.submission_id.in_(sub_ids),
                        SubmissionFile.category.in_(["ABSTRACT", "REPORT", "PPT", "abstract", "report", "ppt"])
                    )
                    .all()
                )
                pending_doc_reviews = len([
                    f for f in doc_files
                    if str(f.submission_id) not in evaluated_sub_ids
                ])

            # 6. Evaluation status breakdown per team
            subs_by_team: Dict[str, List[Submission]] = {}
            for s in subs:
                subs_by_team.setdefault(str(s.team_id), []).append(s)

            teams_not_evaluated = 0
            teams_in_progress = 0
            teams_evaluated = 0
            teams_submitted = 0
            teams_locked = 0

            for tid in team_ids:
                team_subs = subs_by_team.get(str(tid), [])
                if not team_subs:
                    teams_not_evaluated += 1
                else:
                    latest_sub = sorted(team_subs, key=lambda s: s.created_at, reverse=True)[0]
                    st = str(latest_sub.status).lower()
                    is_eval = (str(latest_sub.id) in evaluated_sub_ids) or (st in ["evaluated", "approved"])
                    if is_eval:
                        teams_evaluated += 1
                    elif st in ["in_progress", "draft"]:
                        teams_in_progress += 1
                    else:
                        teams_submitted += 1
                        teams_not_evaluated += 1

            submitted_count = len([
                tid for tid, t_subs in subs_by_team.items()
                if any(str(s.status).lower() in ["submitted", "evaluated", "approved"] for s in t_subs)
            ])
            pending_submissions = max(0, total_assigned_teams - submitted_count)
            pending_evaluations = max(0, total_assigned_teams - teams_evaluated)

            return {
                "total_assigned_teams": total_assigned_teams,
                "total_students": total_students,
                "total_projects": total_projects,
                "total_submissions": total_submissions,
                "pending_submission_reviews": pending_sub_reviews,
                "pending_document_reviews": pending_doc_reviews,
                "teams_evaluated": teams_evaluated,
                "teams_not_evaluated": teams_not_evaluated,
                "teams_in_progress": teams_in_progress,
                "teams_submitted": teams_submitted,
                "teams_locked": teams_locked,
                # Frontend convenience aliases
                "total_teams": total_assigned_teams,
                "submitted_count": submitted_count,
                "evaluated_count": teams_evaluated,
                "pending_submissions": pending_submissions,
                "pending_evaluations": pending_evaluations,
            }
        finally:
            db.close()
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_evaluations_overview(advisor_id: str) -> Dict[str, Any]:
    try:
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return {
                "total_teams": 0,
                "not_started_count": 0,
                "in_progress_count": 0,
                "evaluated_count": 0,
                "submitted_count": 0,
                "locked_count": 0,
                "teams": [],
            }

        db = SessionLocal()
        try:
            teams = db.query(Team).filter(Team.id.in_(team_ids)).all()
            projects = db.query(Project).filter(Project.team_id.in_(team_ids)).all()
            projects_by_team = {str(p.team_id): p for p in projects}

            submissions = db.query(Submission).filter(Submission.team_id.in_(team_ids)).order_by(Submission.created_at.desc()).all()
            subs_by_team: Dict[str, List[Submission]] = {}
            for s in submissions:
                subs_by_team.setdefault(str(s.team_id), []).append(s)

            sub_ids = [str(s.id) for s in submissions]
            evals = db.query(Evaluation).filter(Evaluation.submission_id.in_(sub_ids)).all() if sub_ids else []
            evals_by_sub = {str(e.submission_id): e for e in evals}

            members = db.query(TeamMember).filter(TeamMember.team_id.in_(team_ids)).all()
            members_by_team: Dict[str, List[TeamMember]] = {}
            for m in members:
                members_by_team.setdefault(str(m.team_id), []).append(m)

            not_started_count = 0
            in_progress_count = 0
            evaluated_count = 0
            submitted_count = 0
            locked_count = 0

            team_items = []
            for t in teams:
                tid = str(t.id)
                proj = projects_by_team.get(tid)
                team_subs = subs_by_team.get(tid, [])
                team_mems = members_by_team.get(tid, [])

                eval_id = None
                team_score = None
                eval_status = "NOT_STARTED"

                if team_subs:
                    latest_sub = team_subs[0]
                    eval_obj = evals_by_sub.get(str(latest_sub.id))
                    if eval_obj:
                        eval_id = str(eval_obj.id)
                        team_score = float(eval_obj.total_score) if eval_obj.total_score is not None else None
                        eval_status = "EVALUATED" if str(latest_sub.status).lower() == "evaluated" else "IN_PROGRESS"
                    elif str(latest_sub.status).lower() in ["in_progress", "draft"]:
                        eval_status = "IN_PROGRESS"
                    else:
                        eval_status = "SUBMITTED"

                if eval_status == "NOT_STARTED":
                    not_started_count += 1
                elif eval_status == "IN_PROGRESS":
                    in_progress_count += 1
                elif eval_status == "EVALUATED":
                    evaluated_count += 1
                elif eval_status == "SUBMITTED":
                    submitted_count += 1

                team_items.append({
                    "team_id": tid,
                    "team_name": t.name,
                    "batch": "2023-2027",
                    "section": "A",
                    "project_title": proj.title if proj else getattr(t, "project_title", None),
                    "evaluation_id": eval_id,
                    "evaluation_status": eval_status,
                    "team_score": team_score,
                    "student_evaluations_count": len(team_mems),
                    "total_team_members": len(team_mems),
                    "is_locked": False,
                })

            return {
                "total_teams": len(team_ids),
                "not_started_count": not_started_count,
                "in_progress_count": in_progress_count,
                "evaluated_count": evaluated_count,
                "submitted_count": submitted_count,
                "locked_count": locked_count,
                "teams": team_items,
            }
        finally:
            db.close()
    except Exception as e:
        raise DatabaseError(detail=str(e))


def search_advisor_records(
    advisor_id: str,
    query: Optional[str] = None,
    search_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    batch_filter: Optional[str] = None,
    section_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    try:
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return {
                "query": query,
                "total_count": 0,
                "page": page,
                "page_size": page_size,
                "results": {"teams": [], "students": [], "projects": [], "evaluations": []},
            }

        db = SessionLocal()
        try:
            q_str = (query or "").strip().lower()

            # Teams
            team_query = db.query(Team).filter(Team.id.in_(team_ids))
            if q_str:
                team_query = team_query.filter(func.lower(Team.name).contains(q_str))
            matching_teams = team_query.all()

            # Members & Users
            student_results = []
            members = (
                db.query(TeamMember, User)
                .join(Student, TeamMember.student_id == Student.id)
                .join(User, Student.user_id == User.id)
                .filter(TeamMember.team_id.in_(team_ids))
            )
            if q_str:
                members = members.filter(
                    or_(
                        func.lower(User.full_name).contains(q_str),
                        func.lower(User.email).contains(q_str),
                        func.lower(Student.roll_number).contains(q_str),
                    )
                )
            for tm, u in members.all():
                team_obj = db.query(Team).filter(Team.id == tm.team_id).first()
                student_results.append({
                    "student_id": str(tm.student_id),
                    "full_name": u.full_name,
                    "roll_number": getattr(u, "roll_number", None) or tm.student_id,
                    "email": u.email,
                    "team_id": str(tm.team_id),
                    "team_name": team_obj.name if team_obj else "",
                })

            teams_res = [
                {
                    "team_id": str(t.id),
                    "name": t.name,
                    "batch": "2023-2027",
                    "section": "A",
                    "project_title": getattr(t, "project_title", None),
                    "member_count": db.query(TeamMember).filter(TeamMember.team_id == t.id).count(),
                    "submission_status": "SUBMITTED",
                    "evaluation_status": "NOT_STARTED",
                }
                for t in matching_teams
            ]

            total_count = len(teams_res) + len(student_results)
            return {
                "query": query,
                "total_count": total_count,
                "page": page,
                "page_size": page_size,
                "results": {
                    "teams": teams_res,
                    "students": student_results,
                    "projects": [],
                    "evaluations": [],
                },
            }
        finally:
            db.close()
    except Exception as e:
        raise DatabaseError(detail=str(e))


class AdvisorOverviewRepository:
    """Handles data aggregation and queries for advisor dashboards and searches."""

    def get_dashboard_stats(self, advisor_id: str) -> Dict[str, Any]:
        return get_advisor_dashboard_stats(advisor_id)

    def search_records(
        self,
        advisor_id: str,
        query: Optional[str] = None,
        search_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        batch_filter: Optional[str] = None,
        section_filter: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        return search_advisor_records(
            advisor_id=advisor_id,
            query=query,
            search_type=search_type,
            status_filter=status_filter,
            batch_filter=batch_filter,
            section_filter=section_filter,
            page=page,
            page_size=page_size,
        )

    def get_evaluations_overview(self, advisor_id: str) -> Dict[str, Any]:
        return get_advisor_evaluations_overview(advisor_id)