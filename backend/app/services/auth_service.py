from typing import Dict, List, Optional
from fastapi import HTTPException, status

from app.database.supabase import get_supabase_client, get_supabase_admin_client


def get_profile(user_id: str) -> Dict:
    supabase = get_supabase_client()
    result = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return result.data[0]


def create_user(email: str, password: str, full_name: str, role: str) -> Dict:
    admin_client = get_supabase_admin_client()
    result = admin_client.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": full_name,
            "role": role,
        },
    })
    user = result.user

    supabase = get_supabase_client()
    supabase.table("profiles").insert({
        "id": user.id,
        "email": email,
        "full_name": full_name,
        "role": role,
    }).execute()

    return {"id": user.id, "email": email, "full_name": full_name, "role": role}


def delete_user(user_id: str) -> None:
    admin_client = get_supabase_admin_client()
    admin_client.auth.admin.delete_user(user_id)


def get_team_by_id(team_id: str) -> Optional[Dict]:
    supabase = get_supabase_client()
    result = supabase.table("teams").select("*").eq("id", team_id).execute()
    if result.data:
        return result.data[0]
    return None


def get_team_members(team_id: str) -> List[Dict]:
    supabase = get_supabase_client()
    result = supabase.table("team_members").select("*").eq("team_id", team_id).execute()
    return result.data or []


def get_student_team(student_id: str) -> Optional[Dict]:
    supabase = get_supabase_client()
    result = supabase.table("team_members").select("*").eq("student_id", student_id).execute()
    if result.data:
        return result.data[0]
    return None
