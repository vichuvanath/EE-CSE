from typing import Optional
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.schemas.student import StudentProfileResponse


def get_profile_by_id(user_id: str) -> Optional[StudentProfileResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .execute()
        )
        if not result.data:
            return None
        return StudentProfileResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_profile_full_name(user_id: str, full_name: str) -> StudentProfileResponse:
    try:
        supabase = get_supabase_admin_client()
        result = (
            supabase.table("profiles")
            .update({"full_name": full_name.strip()})
            .eq("id", user_id)
            .execute()
        )
        if not result.data:
            raise ResourceNotFoundError("Profile", user_id)
        return StudentProfileResponse(**result.data[0])
    except (ResourceNotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))
