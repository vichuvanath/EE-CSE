from typing import Optional, List
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.schemas.file import FileMetadataResponse

STORAGE_BUCKET = "project-files"


def create_file_record(data: dict) -> FileMetadataResponse:
    try:
        supabase = get_supabase_admin_client()
        result = supabase.table("project_files").insert(data).execute()
        if not result.data:
            raise DatabaseError(message="Failed to insert project file record")
        return FileMetadataResponse(**result.data[0])
    except DatabaseError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_files_by_team_id(team_id: str) -> List[FileMetadataResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("project_files")
            .select("*")
            .eq("team_id", team_id)
            .execute()
        )
        return [FileMetadataResponse(**item) for item in (result.data or [])]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_file_by_category_and_team(category: str, team_id: str) -> Optional[FileMetadataResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("project_files")
            .select("*")
            .eq("category", category)
            .eq("team_id", team_id)
            .execute()
        )
        if not result.data:
            return None
        return FileMetadataResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_file_by_id(file_id: str) -> Optional[FileMetadataResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("project_files")
            .select("*")
            .eq("id", file_id)
            .execute()
        )
        if not result.data:
            return None
        return FileMetadataResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def delete_file_record(file_id: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        result = supabase.table("project_files").delete().eq("id", file_id).execute()
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))


def upload_file_to_storage(bucket: str, path: str, content: bytes, mime_type: str) -> str:
    try:
        supabase = get_supabase_admin_client()
        supabase.storage.from_(bucket).upload(
            path=path,
            file=content,
            file_options={"content-type": mime_type, "upsert": "true"},
        )
        return path
    except Exception as e:
        raise DatabaseError(detail=f"Storage upload error: {str(e)}")


def delete_file_from_storage(bucket: str, path: str) -> bool:
    try:
        supabase = get_supabase_admin_client()
        supabase.storage.from_(bucket).remove([path])
        return True
    except Exception as e:
        raise DatabaseError(detail=f"Storage deletion error: {str(e)}")
