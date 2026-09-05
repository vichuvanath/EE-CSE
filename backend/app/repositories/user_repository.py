from typing import Optional
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import (
    ResourceNotFoundError,
    DatabaseError,
    SupabaseConnectionError,
)
from app.schemas.user import UserCreate, UserUpdate, UserResponse


def get_user_by_id(user_id: str) -> Optional[UserResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not result.data:
            return None
        return UserResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_user_by_email(email: str) -> Optional[UserResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("email", email).execute()
        if not result.data:
            return None
        return UserResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_user_by_roll_number(roll_number: str) -> Optional[UserResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("roll_number", roll_number).execute()
        if not result.data:
            return None
        return UserResponse(**result.data[0])
    except Exception as e:
        raise DatabaseError(detail=str(e))



def get_all_users() -> list[UserResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").execute()
        return [UserResponse(**user) for user in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_all_students() -> list[UserResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("role", "student").execute()
        return [UserResponse(**user) for user in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_all_faculty() -> list[UserResponse]:
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("role", "faculty").execute()
        return [UserResponse(**user) for user in result.data]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def create_student_account(data: UserCreate) -> UserResponse:
    try:
        admin_client = get_supabase_admin_client()
        result = admin_client.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": data.full_name,
                "role": "student",
            },
        })
        user = result.user
        return UserResponse(
            id=user.id,
            email=data.email,
            full_name=data.full_name,
            role="student",
        )
    except Exception as e:
        raise DatabaseError(detail=str(e))


def create_faculty_account(data: UserCreate) -> UserResponse:
    try:
        admin_client = get_supabase_admin_client()
        result = admin_client.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": data.full_name,
                "role": "faculty",
            },
        })
        user = result.user
        return UserResponse(
            id=user.id,
            email=data.email,
            full_name=data.full_name,
            role="faculty",
        )
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_user_profile(user_id: str, data: UserUpdate) -> UserResponse:
    try:
        supabase = get_supabase_client()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise DatabaseError(message="No fields to update")
        result = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        if not result.data:
            raise ResourceNotFoundError("User", user_id)
        return UserResponse(**result.data[0])
    except ResourceNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def delete_user(user_id: str) -> bool:
    try:
        admin_client = get_supabase_admin_client()
        admin_client.auth.admin.delete_user(user_id)
        return True
    except Exception as e:
        raise DatabaseError(detail=str(e))
