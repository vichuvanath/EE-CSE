from fastapi import HTTPException, status
from app.database.supabase import get_supabase, get_supabase_service


def get_all_teams() -> list[dict]:
    supabase = get_supabase()
    result = supabase.table("teams").select("*").execute()
    return result.data


def get_team_by_id(team_id: str) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("teams").select("*").eq("id", team_id).execute()
    return result.data[0] if result.data else None


def get_teams_by_faculty(faculty_id: str) -> list[dict]:
    supabase = get_supabase()
    result = supabase.table("teams").select("*").eq("faculty_id", faculty_id).execute()
    return result.data


def get_team_by_student(student_id: str) -> dict | None:
    supabase = get_supabase()
    membership = (
        supabase.table("team_members")
        .select("team_id")
        .eq("student_id", student_id)
        .execute()
    )
    if not membership.data:
        return None
    team_id = membership.data[0]["team_id"]
    return get_team_by_id(team_id)


def get_team_members(team_id: str) -> list[dict]:
    supabase = get_supabase()
    members = (
        supabase.table("team_members")
        .select("student_id")
        .eq("team_id", team_id)
        .execute()
    )
    if not members.data:
        return []
    student_ids = [m["student_id"] for m in members.data]
    result = (
        supabase.table("profiles").select("*").in_("id", student_ids).execute()
    )
    return result.data


def is_student_in_team(student_id: str, team_id: str) -> bool:
    supabase = get_supabase()
    result = (
        supabase.table("team_members")
        .select("*")
        .eq("student_id", student_id)
        .eq("team_id", team_id)
        .execute()
    )
    return len(result.data) > 0


def is_student_in_any_team(student_id: str) -> bool:
    supabase = get_supabase()
    result = (
        supabase.table("team_members")
        .select("*")
        .eq("student_id", student_id)
        .execute()
    )
    return len(result.data) > 0


def get_team_member_count(team_id: str) -> int:
    supabase = get_supabase()
    result = (
        supabase.table("team_members")
        .select("*", count="exact")
        .eq("team_id", team_id)
        .execute()
    )
    return result.count or len(result.data)


def create_team(name: str, faculty_id: str | None = None) -> dict:
    supabase = get_supabase_service()
    data = {"name": name}
    if faculty_id:
        data["faculty_id"] = faculty_id
    result = supabase.table("teams").insert(data).execute()
    return result.data[0] if result.data else {}


def update_team(team_id: str, name: str | None = None, faculty_id: str | None = None) -> dict:
    supabase = get_supabase_service()
    data = {}
    if name is not None:
        data["name"] = name
    if faculty_id is not None:
        data["faculty_id"] = faculty_id
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    result = supabase.table("teams").update(data).eq("id", team_id).execute()
    return result.data[0] if result.data else {}


def delete_team(team_id: str) -> bool:
    supabase = get_supabase_service()
    supabase.table("team_members").delete().eq("team_id", team_id).execute()
    supabase.table("teams").delete().eq("id", team_id).execute()
    return True


def add_student_to_team(student_id: str, team_id: str) -> dict:
    supabase = get_supabase_service()

    profile = (
        supabase.table("profiles").select("role").eq("id", student_id).execute()
    )
    if not profile.data or (profile.data[0].get("role") or "").strip().upper() != "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a student",
        )

    if is_student_in_any_team(student_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student already belongs to another team",
        )

    member_count = get_team_member_count(team_id)
    if member_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team already has 5 members maximum",
        )

    result = (
        supabase.table("team_members")
        .insert({"team_id": team_id, "student_id": student_id})
        .execute()
    )
    return result.data[0] if result.data else {}


def remove_student_from_team(student_id: str, team_id: str) -> bool:
    supabase = get_supabase_service()
    supabase.table("team_members").delete().eq(
        "student_id", student_id
    ).eq("team_id", team_id).execute()
    return True


def get_my_team(student_id: str) -> dict:
    from app.repositories.team_repository import get_team_details_for_student
    team_details = get_team_details_for_student(student_id)
    if not team_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )
    return team_details

