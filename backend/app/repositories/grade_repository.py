from typing import Optional
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import (
    ResourceNotFoundError,
    DatabaseError,
    GradePermissionError,
)
from app.schemas.grade import GradeCreate, GradeUpdate, GradeResponse, GradeVisibilityUpdate


def create_grade(data: GradeCreate, faculty_id: str) -> GradeResponse:
    try:
        supabase = get_supabase_admin_client()

        existing = get_grade_by_progress(data.progress_report_id)
        if existing:
            raise DatabaseError(message="A grade already exists for this progress report")

        insert_data = {
            "progress_report_id": data.progress_report_id,
            "faculty_id": faculty_id,
            "grade": float(data.grade),
        }
        if data.feedback:
            insert_data["feedback"] = data.feedback

        result = supabase.table("grades").insert(insert_data).execute()
        if not result.data:
            raise DatabaseError(message="Failed to create grade")
        return GradeResponse(**result.data[0])
    except DatabaseError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_grade_by_id(grade_id: str) -> Optional[GradeResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("grades").select("*").eq("id", grade_id).execute()
        if not result.data:
            return None
        return GradeResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_grade_by_progress(progress_id: str) -> Optional[GradeResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("grades")
            .select("*")
            .eq("progress_report_id", progress_id)
            .execute()
        )
        if not result.data:
            return None
        return GradeResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_grades_by_team(team_id: str) -> list[GradeResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("grades")
            .select("*, progress_reports!inner(team_id)")
            .eq("progress_reports.team_id", team_id)
            .execute()
        )
        return [GradeResponse(
            id=grade["id"],
            progress_report_id=grade["progress_report_id"],
            faculty_id=grade["faculty_id"],
            grade=grade["grade"],
            feedback=grade.get("feedback"),
            is_visible=grade.get("is_visible", False),
            graded_at=grade.get("graded_at"),
            updated_at=grade.get("updated_at"),
        ) for grade in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_grade(grade_id: str, data: GradeUpdate, faculty_id: str) -> GradeResponse:
    try:
        supabase = get_supabase_admin_client()

        existing = get_grade_by_id(grade_id)
        if not existing:
            raise ResourceNotFoundError("Grade", grade_id)

        update_data = data.model_dump(exclude_unset=True)
        if "grade" in update_data:
            update_data["grade"] = float(update_data["grade"])
        if not update_data:
            raise DatabaseError(message="No fields to update")

        result = (
            supabase.table("grades")
            .update(update_data)
            .eq("id", grade_id)
            .execute()
        )
        if not result.data:
            raise ResourceNotFoundError("Grade", grade_id)
        return GradeResponse(**result.data[0])
    except (ResourceNotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_grade_visibility(grade_id: str, data: GradeVisibilityUpdate) -> GradeResponse:
    try:
        supabase = get_supabase_admin_client()

        existing = get_grade_by_id(grade_id)
        if not existing:
            raise ResourceNotFoundError("Grade", grade_id)

        result = (
            supabase.table("grades")
            .update({"is_visible": data.is_visible})
            .eq("id", grade_id)
            .execute()
        )
        if not result.data:
            raise ResourceNotFoundError("Grade", grade_id)
        return GradeResponse(**result.data[0])
    except ResourceNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def delete_grade(grade_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.table("grades").delete().eq("id", grade_id).execute()
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))
