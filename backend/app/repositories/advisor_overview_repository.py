# app/repositories/advisor_overview_repository.py
from typing import Dict, Any
from app.core.exceptions import DatabaseError
from app.core.supabase import get_supabase_client
from app.repositories.assignment_repository import get_assigned_team_ids


class AdvisorOverviewRepository:
    """Handles data aggregation and queries for advisor dashboards and searches."""

    def get_dashboard_stats(self, advisor_id: str) -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
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
                }

            total_assigned_teams = len(team_ids)

            # 1. Total students
            m_res = supabase.table("team_members").select("student_id").in_("team_id", team_ids).execute()
            student_ids = list({str(m["student_id"]) for m in (m_res.data or []) if "student_id" in m})
            total_students = len(student_ids)

            # 2. Total projects
            p_res = supabase.table("projects").select("id").in_("team_id", team_ids).execute()
            total_projects = len(p_res.data or [])

            # 3. Total submissions
            s_res = supabase.table("submissions").select("id").in_("team_id", team_ids).execute()
            subs = s_res.data or []
            total_submissions = len(subs)
            sub_ids = [str(s["id"]) for s in subs]

            # 4. Pending submission reviews
            pending_sub_reviews = total_submissions
            if sub_ids:
                rev_res = supabase.table("submission_reviews").select("submission_id, status").in_("submission_id", sub_ids).execute()
                reviewed_sub_ids = {
                    str(r["submission_id"])
                    for r in (rev_res.data or [])
                    if r.get("status") in ["REVIEWED", "APPROVED"]
                }
                pending_sub_reviews = total_submissions - len(reviewed_sub_ids)

            # 5. Pending document reviews
            f_res = supabase.table("project_files").select("id, category").in_("team_id", team_ids).execute()
            eligible_files = [f for f in (f_res.data or []) if f.get("category", "").upper() in ["ABSTRACT", "REPORT", "PPT"]]
            total_eligible_docs = len(eligible_files)
            pending_doc_reviews = total_eligible_docs
            if eligible_files:
                file_ids = [str(f["id"]) for f in eligible_files]
                doc_rev_res = (
                    supabase.table("document_reviews")
                    .select("file_id, status")
                    .in_("file_id", file_ids)
                    .eq("advisor_id", advisor_id)
                    .execute()
                )
                approved_file_ids = {
                    str(r["file_id"])
                    for r in (doc_rev_res.data or [])
                    if r.get("status") == "APPROVED"
                }
                pending_doc_reviews = total_eligible_docs - len(approved_file_ids)

            # 6. Evaluation status breakdown
            eval_res = supabase.table("evaluations").select("team_id, status").in_("team_id", team_ids).execute()
            evals_by_team = {str(e["team_id"]): e.get("status", "NOT_STARTED") for e in (eval_res.data or [])}

            teams_not_evaluated = 0
            teams_in_progress = 0
            teams_evaluated = 0
            teams_submitted = 0
            teams_locked = 0

            for tid in team_ids:
                st = evals_by_team.get(tid, "NOT_STARTED")
                if st == "NOT_STARTED":
                    teams_not_evaluated += 1
                elif st == "IN_PROGRESS":
                    teams_in_progress += 1
                elif st in ["EVALUATED", "SUBMITTED", "LOCKED"]:
                    teams_evaluated += 1
                    if st == "SUBMITTED":
                        teams_submitted += 1
                    elif st == "LOCKED":
                        teams_locked += 1

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
            }
        except Exception as e:
            raise DatabaseError(detail=str(e))