from typing import Optional, Dict, Any, List
from app.core.supabase import get_supabase_client
from app.core.exceptions import DatabaseError


def get_checklist_raw_data(team_id: str) -> Dict[str, Any]:
    try:
        supabase = get_supabase_client()
        
        # 1. Fetch project record for links
        proj_res = (
            supabase.table("projects")
            .select("*")
            .eq("team_id", team_id)
            .execute()
        )
        project_data = proj_res.data[0] if proj_res.data else None

        # 2. Fetch uploaded file categories for team
        files_res = (
            supabase.table("project_files")
            .select("category")
            .eq("team_id", team_id)
            .execute()
        )
        categories = list({f["category"].upper() for f in (files_res.data or []) if "category" in f})

        return {
            "project": project_data,
            "categories": categories,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_submission_by_project_id(project_id: str) -> Optional[dict]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("submissions")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        if not result.data:
            return None
        return result.data[0]
    except Exception:
        return None



def create_submission_record(data: dict) -> dict:
    try:
        from app.core.supabase import get_supabase_admin_client
        supabase = get_supabase_admin_client()
        result = supabase.table("submissions").insert(data).execute()
        if not result.data:
            raise DatabaseError(message="Failed to insert final submission record")
        return result.data[0]
    except DatabaseError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))

