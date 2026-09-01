from typing import Optional
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import (
    ResourceNotFoundError,
    DatabaseError,
    DuplicateWeekReportError,
)
from app.schemas.progress import ProgressCreate, ProgressUpdate, ProgressResponse


def create_progress_report(data: ProgressCreate, submitted_by: Optional[str] = None) -> ProgressResponse:
    try:
        supabase = get_supabase_admin_client()

        existing = _check_week_report_exists(data.team_id, data.week_number)
        if existing:
            raise DuplicateWeekReportError(data.team_id, data.week_number)

        insert_data = {
            "team_id": data.team_id,
            "week_number": data.week_number,
            "title": data.title,
            "content": data.content,
        }
        if submitted_by:
            insert_data["submitted_by"] = submitted_by

        result = supabase.table("progress_reports").insert(insert_data).execute()
        if not result.data:
            raise DatabaseError(message="Failed to create progress report")
        return ProgressResponse(**result.data[0])
    except (DuplicateWeekReportError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_progress_by_id(progress_id: str) -> Optional[ProgressResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("progress_reports").select("*").eq("id", progress_id).execute()
        if not result.data:
            return None
        return ProgressResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_progress_by_team(team_id: str) -> list[ProgressResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("progress_reports")
            .select("*")
            .eq("team_id", team_id)
            .order("week_number", desc=False)
            .execute()
        )
        return [ProgressResponse(**report) for report in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_progress_by_team_and_week(team_id: str, week_number: int) -> Optional[ProgressResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("progress_reports")
            .select("*")
            .eq("team_id", team_id)
            .eq("week_number", week_number)
            .execute()
        )
        if not result.data:
            return None
        return ProgressResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_latest_progress(team_id: str) -> Optional[ProgressResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("progress_reports")
            .select("*")
            .eq("team_id", team_id)
            .order("week_number", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        return ProgressResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_all_progress_reports() -> list[ProgressResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("progress_reports")
            .select("*")
            .order("week_number", desc=False)
            .execute()
        )
        return [ProgressResponse(**report) for report in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_progress_report(progress_id: str, data: ProgressUpdate) -> ProgressResponse:
    try:
        supabase = get_supabase_admin_client()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise DatabaseError(message="No fields to update")
        result = (
            supabase.table("progress_reports")
            .update(update_data)
            .eq("id", progress_id)
            .execute()
        )
        if not result.data:
            raise ResourceNotFoundError("Progress report", progress_id)
        return ProgressResponse(**result.data[0])
    except (ResourceNotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def delete_progress_report(progress_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.table("progress_reports").delete().eq("id", progress_id).execute()
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))


def _check_week_report_exists(team_id: str, week_number: int) -> bool:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("progress_reports")
            .select("id")
            .eq("team_id", team_id)
            .eq("week_number", week_number)
            .execute()
        )
        return len(result.data) > 0
    except Exception:
        return False
