from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client
from app.core.exceptions import DatabaseError
from app.repositories.assignment_repository import get_assigned_team_ids


def get_advisor_dashboard_stats(advisor_id: str) -> Dict[str, Any]:
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
        supabase = get_supabase_client()
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return {
                "query": query,
                "total_count": 0,
                "page": page,
                "page_size": page_size,
                "results": {"teams": [], "students": [], "projects": [], "evaluations": []},
            }

        q_clean = (query or "").strip().lower()
        type_clean = (search_type or "all").strip().lower()

        # 1. Fetch assigned teams
        t_res = supabase.table("teams").select("*").in_("id", team_ids).execute()
        teams = t_res.data or []

        if batch_filter:
            teams = [t for t in teams if str(t.get("batch", "")).lower() == batch_filter.lower()]
        if section_filter:
            teams = [t for t in teams if str(t.get("section", "")).lower() == section_filter.lower()]

        filtered_team_ids = [str(t["id"]) for t in teams]
        if not filtered_team_ids:
            return {
                "query": query,
                "total_count": 0,
                "page": page,
                "page_size": page_size,
                "results": {"teams": [], "students": [], "projects": [], "evaluations": []},
            }

        # 2. Fetch projects
        p_res = supabase.table("projects").select("*").in_("team_id", filtered_team_ids).execute()
        projects_by_team = {str(p["team_id"]): p for p in (p_res.data or [])}

        # 3. Fetch submissions
        sub_res = supabase.table("submissions").select("*").in_("team_id", filtered_team_ids).execute()
        subs_by_team = {str(s["team_id"]): s for s in (sub_res.data or [])}

        # 4. Fetch evaluations
        ev_res = supabase.table("evaluations").select("*").in_("team_id", filtered_team_ids).execute()
        evals_by_team = {str(e["team_id"]): e for e in (ev_res.data or [])}

        # 5. Fetch team members & profiles
        tm_res = supabase.table("team_members").select("*").in_("team_id", filtered_team_ids).execute()
        members = tm_res.data or []
        s_ids = [str(m["student_id"]) for m in members if "student_id" in m]

        profiles_by_id = {}
        if s_ids:
            prof_res = supabase.table("profiles").select("*").in_("id", s_ids).execute()
            profiles_by_id = {str(p["id"]): p for p in (prof_res.data or [])}

        team_results = []
        student_results = []
        project_results = []
        evaluation_results = []

        # Populate Team Results
        if type_clean in ["all", "team"]:
            for t in teams:
                tid = str(t["id"])
                t_name = t.get("name", "")
                proj = projects_by_team.get(tid, {})
                proj_title = proj.get("title", "")
                sub = subs_by_team.get(tid, {})
                ev = evals_by_team.get(tid, {})

                if status_filter:
                    sf = status_filter.upper()
                    if sub.get("status") != sf and ev.get("status") != sf:
                        continue

                if not q_clean or q_clean in t_name.lower() or q_clean in proj_title.lower():
                    team_results.append({
                        "team_id": tid,
                        "name": t_name,
                        "batch": t.get("batch"),
                        "section": t.get("section"),
                        "project_title": proj_title,
                        "member_count": len([m for m in members if str(m["team_id"]) == tid]),
                        "submission_status": sub.get("status", "DRAFT"),
                        "evaluation_status": ev.get("status", "NOT_STARTED"),
                    })

        # Populate Student Results
        if type_clean in ["all", "student"]:
            teams_map = {str(t["id"]): t.get("name", "") for t in teams}
            for m in members:
                tid = str(m["team_id"])
                sid = str(m["student_id"])
                p = profiles_by_id.get(sid, {})
                fname = p.get("full_name", "") or p.get("name", "")
                roll = p.get("roll_number", "") or ""
                email = p.get("email", "") or ""

                if not q_clean or q_clean in fname.lower() or q_clean in roll.lower() or q_clean in email.lower():
                    student_results.append({
                        "student_id": sid,
                        "full_name": fname,
                        "roll_number": roll,
                        "email": email,
                        "team_id": tid,
                        "team_name": teams_map.get(tid, ""),
                    })

        # Populate Project Results
        if type_clean in ["all", "project"]:
            teams_map = {str(t["id"]): t.get("name", "") for t in teams}
            for tid, proj in projects_by_team.items():
                title = proj.get("title", "")
                domain = proj.get("domain", "") or ""
                tech = proj.get("technologies_used", "") or proj.get("technologies", "") or ""
                sub = subs_by_team.get(tid, {})
                sub_status = sub.get("status", "NOT_SUBMITTED") if sub else "NOT_SUBMITTED"

                if status_filter and sub_status.upper() != status_filter.upper():
                    continue

                if not q_clean or q_clean in title.lower() or q_clean in domain.lower() or q_clean in tech.lower():
                    project_results.append({
                        "project_id": str(proj["id"]),
                        "title": title,
                        "domain": domain,
                        "technologies": tech,
                        "team_id": tid,
                        "team_name": teams_map.get(tid, ""),
                        "submission_status": sub_status,
                    })

        # Populate Evaluation Results
        if type_clean in ["all", "evaluation"]:
            teams_map = {str(t["id"]): t.get("name", "") for t in teams}
            for tid, ev in evals_by_team.items():
                st = ev.get("status", "NOT_STARTED")
                if status_filter and st != status_filter.upper():
                    continue

                if not q_clean or q_clean in teams_map.get(tid, "").lower() or q_clean in st.lower():
                    evaluation_results.append({
                        "evaluation_id": str(ev["id"]),
                        "team_id": tid,
                        "team_name": teams_map.get(tid, ""),
                        "status": st,
                        "team_score": float(ev["team_score"]) if ev.get("team_score") is not None else None,
                        "is_locked": st == "LOCKED",
                    })

        total_count = len(team_results) + len(student_results) + len(project_results) + len(evaluation_results)

        return {
            "query": query,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "results": {
                "teams": team_results,
                "students": student_results,
                "projects": project_results,
                "evaluations": evaluation_results,
            },
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_evaluations_overview(advisor_id: str) -> Dict[str, Any]:
    try:
        supabase = get_supabase_client()
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

        # 1. Teams
        t_res = supabase.table("teams").select("*").in_("id", team_ids).execute()
        teams = t_res.data or []

        # 2. Projects
        p_res = supabase.table("projects").select("*").in_("team_id", team_ids).execute()
        projects_by_team = {str(p["team_id"]): p for p in (p_res.data or [])}

        # 3. Evaluations
        ev_res = supabase.table("evaluations").select("*").in_("team_id", team_ids).execute()
        evals_by_team = {str(e["team_id"]): e for e in (ev_res.data or [])}
        eval_ids = [str(e["id"]) for e in (ev_res.data or [])]

        # 4. Student evaluations count
        student_evals_by_eval = {}
        if eval_ids:
            se_res = supabase.table("student_evaluations").select("evaluation_id").in_("evaluation_id", eval_ids).execute()
            for se in (se_res.data or []):
                eid = str(se["evaluation_id"])
                student_evals_by_eval[eid] = student_evals_by_eval.get(eid, 0) + 1

        # 5. Team members count
        tm_res = supabase.table("team_members").select("team_id").in_("team_id", team_ids).execute()
        members_by_team = {}
        for tm in (tm_res.data or []):
            tid = str(tm["team_id"])
            members_by_team[tid] = members_by_team.get(tid, 0) + 1

        items = []
        not_started = 0
        in_progress = 0
        evaluated = 0
        submitted = 0
        locked = 0

        for t in teams:
            tid = str(t["id"])
            p = projects_by_team.get(tid, {})
            ev = evals_by_team.get(tid, {})
            st = ev.get("status", "NOT_STARTED")
            eid = str(ev["id"]) if "id" in ev else None

            if st == "NOT_STARTED":
                not_started += 1
            elif st == "IN_PROGRESS":
                in_progress += 1
            elif st == "EVALUATED":
                evaluated += 1
            elif st == "SUBMITTED":
                submitted += 1
            elif st == "LOCKED":
                locked += 1

            items.append({
                "team_id": tid,
                "team_name": t.get("name", ""),
                "batch": t.get("batch"),
                "section": t.get("section"),
                "project_title": p.get("title") or t.get("name"),
                "evaluation_id": eid,
                "evaluation_status": st,
                "team_score": float(ev["team_score"]) if ev.get("team_score") is not None else None,
                "student_evaluations_count": student_evals_by_eval.get(eid, 0) if eid else 0,
                "total_team_members": members_by_team.get(tid, 0),
                "is_locked": st == "LOCKED",
            })

        return {
            "total_teams": len(teams),
            "not_started_count": not_started,
            "in_progress_count": in_progress,
            "evaluated_count": evaluated,
            "submitted_count": submitted,
            "locked_count": locked,
            "teams": items,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))
