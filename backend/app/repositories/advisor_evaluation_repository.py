import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError


def get_team_evaluation(team_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("evaluations").select("*").eq("team_id", team_id).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_evaluation_by_id(evaluation_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("evaluations").select("*").eq("id", evaluation_id).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def upsert_team_evaluation(
    team_id: str,
    advisor_id: str,
    team_score: Optional[float] = None,
    team_remarks: Optional[str] = None,
    status_val: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        existing = get_team_evaluation(team_id)
        now_str = datetime.now(timezone.utc).isoformat()

        if existing:
            eval_id = existing["id"]
            update_data = {"updated_at": now_str}
            if team_score is not None:
                update_data["team_score"] = float(team_score)
            if team_remarks is not None:
                update_data["team_remarks"] = team_remarks
            if status_val:
                update_data["status"] = status_val

            res = supabase.table("evaluations").update(update_data).eq("id", eval_id).execute()
            if res.data:
                return res.data[0]
            return {**existing, **update_data}

        insert_data = {
            "id": str(uuid.uuid4()),
            "team_id": team_id,
            "advisor_id": advisor_id,
            "status": status_val or "NOT_STARTED",
            "team_score": float(team_score) if team_score is not None else None,
            "team_remarks": team_remarks,
            "created_at": now_str,
            "updated_at": now_str,
        }
        res = supabase.table("evaluations").insert(insert_data).execute()
        if res.data:
            return res.data[0]
        return insert_data
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_evaluation_status(evaluation_id: str, new_status: str) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        now_str = datetime.now(timezone.utc).isoformat()
        update_data = {
            "status": new_status,
            "updated_at": now_str,
        }
        res = supabase.table("evaluations").update(update_data).eq("id", evaluation_id).execute()
        if res.data:
            return res.data[0]
        existing = get_evaluation_by_id(evaluation_id) or {}
        return {**existing, **update_data}
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_student_evaluations_for_team(team_id: str) -> List[Dict[str, Any]]:
    try:
        eval_record = get_team_evaluation(team_id)
        if not eval_record:
            return []
        eval_id = eval_record["id"]
        supabase = get_supabase_client()
        res = supabase.table("student_evaluations").select("*").eq("evaluation_id", eval_id).execute()
        return res.data or []
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_student_evaluation_by_id(student_eval_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("student_evaluations").select("*").eq("id", student_eval_id).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_student_evaluation_by_eval_and_student(evaluation_id: str, student_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = (
            supabase.table("student_evaluations")
            .select("*")
            .eq("evaluation_id", evaluation_id)
            .eq("student_id", student_id)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def upsert_student_evaluation(
    evaluation_id: str,
    student_id: str,
    project_marks: float,
    presentation_marks: float,
    technical_marks: float,
    documentation_marks: float,
    contribution_marks: float,
    total_marks: float,
    remarks: Optional[str],
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        existing = get_student_evaluation_by_eval_and_student(evaluation_id, student_id)
        now_str = datetime.now(timezone.utc).isoformat()

        payload = {
            "project_marks": float(project_marks),
            "presentation_marks": float(presentation_marks),
            "technical_marks": float(technical_marks),
            "documentation_marks": float(documentation_marks),
            "contribution_marks": float(contribution_marks),
            "total_marks": float(total_marks),
            "remarks": remarks,
            "updated_at": now_str,
        }

        if existing:
            student_eval_id = existing["id"]
            res = supabase.table("student_evaluations").update(payload).eq("id", student_eval_id).execute()
            if res.data:
                return res.data[0]
            return {**existing, **payload}

        insert_data = {
            "id": str(uuid.uuid4()),
            "evaluation_id": evaluation_id,
            "student_id": student_id,
            "created_at": now_str,
            **payload,
        }
        res = supabase.table("student_evaluations").insert(insert_data).execute()
        if res.data:
            return res.data[0]
        return insert_data
    except Exception as e:
        raise DatabaseError(detail=str(e))
