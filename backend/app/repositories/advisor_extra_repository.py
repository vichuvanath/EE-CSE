import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.repositories.assignment_repository import get_assigned_team_ids


def compute_deadline_status(deadline_at_dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if deadline_at_dt.tzinfo is None:
        deadline_at_dt = deadline_at_dt.replace(tzinfo=timezone.utc)
    
    delta = (deadline_at_dt - now).total_seconds()
    if delta < 0:
        return "OVERDUE"
    elif delta <= 172800:  # <= 48 hours
        return "DUE_SOON"
    return "UPCOMING"


def get_deadlines_by_advisor(advisor_id: str) -> List[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        team_ids = get_assigned_team_ids(advisor_id)
        if not team_ids:
            return []
        res = supabase.table("submission_deadlines").select("*").in_("team_id", team_ids).execute()
        deadlines = res.data or []
        for d in deadlines:
            dt_str = d["deadline_at"]
            dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            d["status"] = compute_deadline_status(dt)
        return deadlines
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_deadline_by_team_id(team_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("submission_deadlines").select("*").eq("team_id", team_id).execute()
        if not res.data:
            return None
        d = res.data[0]
        dt_str = d["deadline_at"]
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        d["status"] = compute_deadline_status(dt)
        return d
    except Exception as e:
        raise DatabaseError(detail=str(e))


def upsert_team_deadline(
    team_id: str,
    advisor_id: str,
    title: str,
    deadline_at: datetime,
    description: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        existing = get_deadline_by_team_id(team_id)
        now_str = datetime.now(timezone.utc).isoformat()
        dl_str = deadline_at.isoformat()

        payload = {
            "title": title,
            "deadline_at": dl_str,
            "description": description,
            "updated_at": now_str,
        }

        if existing:
            dl_id = existing["id"]
            res = supabase.table("submission_deadlines").update(payload).eq("id", dl_id).execute()
            rec = res.data[0] if res.data else {**existing, **payload}
            rec["status"] = compute_deadline_status(deadline_at)
            return rec

        insert_data = {
            "id": str(uuid.uuid4()),
            "team_id": team_id,
            "advisor_id": advisor_id,
            "created_at": now_str,
            **payload,
        }
        res = supabase.table("submission_deadlines").insert(insert_data).execute()
        rec = res.data[0] if res.data else insert_data
        rec["status"] = compute_deadline_status(deadline_at)
        return rec
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_advisor_profile(advisor_id: str) -> Optional[Dict[str, Any]]:
    try:
        supabase = get_supabase_client()
        res = supabase.table("profiles").select("*").eq("id", advisor_id).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_advisor_profile(advisor_id: str, full_name: Optional[str]) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        existing = get_advisor_profile(advisor_id)
        if not existing:
            raise ResourceNotFoundError("Profile", advisor_id)

        now_str = datetime.now(timezone.utc).isoformat()
        update_data = {"updated_at": now_str}
        if full_name is not None and full_name.strip():
            update_data["full_name"] = full_name.strip()

        res = supabase.table("profiles").update(update_data).eq("id", advisor_id).execute()
        if res.data:
            return res.data[0]
        return {**existing, **update_data}
    except ResourceNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def create_notification(
    recipient_id: str,
    type_str: str,
    title: str,
    message: str,
    team_id: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        insert_data = {
            "id": str(uuid.uuid4()),
            "recipient_id": recipient_id,
            "team_id": team_id,
            "type": type_str,
            "title": title,
            "message": message,
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        res = supabase.table("notifications").insert(insert_data).execute()
        if res.data:
            return res.data[0]
        return insert_data
    except Exception as e:
        raise DatabaseError(detail=str(e))


def get_notifications_for_recipient(
    recipient_id: str, unread_only: bool = False, page: int = 1, page_size: int = 20
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_client()
        query = supabase.table("notifications").select("*").eq("recipient_id", recipient_id)
        if unread_only:
            query = query.eq("is_read", False)

        res = query.order("created_at", desc=True).execute()
        all_notifs = res.data or []

        total_count = len(all_notifs)
        unread_count = len([n for n in all_notifs if not n.get("is_read", False)])

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_notifs = all_notifs[start_idx:end_idx]

        return {
            "total_count": total_count,
            "unread_count": unread_count,
            "page": page,
            "page_size": page_size,
            "notifications": paged_notifs,
        }
    except Exception as e:
        raise DatabaseError(detail=str(e))


def mark_notification_as_read(notification_id: str, recipient_id: str) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin_client()
        existing = supabase.table("notifications").select("*").eq("id", notification_id).execute()
        if not existing.data:
            raise ResourceNotFoundError("Notification", notification_id)

        notif = existing.data[0]
        if str(notif["recipient_id"]) != recipient_id:
            raise ResourceNotFoundError("Notification", notification_id)

        res = supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
        if res.data:
            return res.data[0]
        return {**notif, "is_read": True}
    except ResourceNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def mark_all_notifications_as_read(recipient_id: str) -> int:
    try:
        supabase = get_supabase_admin_client()
        res = (
            supabase.table("notifications")
            .update({"is_read": True})
            .eq("recipient_id", recipient_id)
            .eq("is_read", False)
            .execute()
        )
        return len(res.data or [])
    except Exception as e:
        raise DatabaseError(detail=str(e))
