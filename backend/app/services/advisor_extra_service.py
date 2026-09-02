from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.repositories.advisor_extra_repository import (
    get_deadlines_by_advisor,
    get_deadline_by_team_id,
    upsert_team_deadline,
    get_advisor_profile,
    update_advisor_profile,
    create_notification,
    get_notifications_for_recipient,
    mark_notification_as_read,
    mark_all_notifications_as_read,
)
from app.repositories.team_repository import get_team_by_id
from app.repositories.assignment_repository import check_assignment
from app.core.exceptions import ResourceNotFoundError


def get_my_deadlines_service(advisor_id: str) -> List[Dict[str, Any]]:
    return get_deadlines_by_advisor(advisor_id)


def get_team_deadline_service(advisor_id: str, team_id: str) -> Dict[str, Any]:
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    dl = get_deadline_by_team_id(team_id)
    if not dl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No submission deadline set for team '{team_id}'",
        )
    return dl


def save_team_deadline_service(
    advisor_id: str,
    team_id: str,
    title: Optional[str],
    deadline_at: datetime,
    description: Optional[str],
) -> Dict[str, Any]:
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    clean_title = (title or "Final Project Submission Deadline").strip()
    dl_record = upsert_team_deadline(
        team_id=team_id,
        advisor_id=advisor_id,
        title=clean_title,
        deadline_at=deadline_at,
        description=description,
    )

    # Trigger deadline alert notification for advisor
    try:
        create_notification(
            recipient_id=advisor_id,
            team_id=team_id,
            type_str="DEADLINE_ALERT",
            title=f"Deadline Set: {clean_title}",
            message=f"Submission deadline for team '{team.name}' has been updated to {deadline_at.isoformat()}.",
        )
    except Exception:
        pass

    return dl_record


def get_advisor_profile_service(advisor_id: str) -> Dict[str, Any]:
    prof = get_advisor_profile(advisor_id)
    if not prof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Advisor profile '{advisor_id}' not found",
        )
    return prof


def update_advisor_profile_service(advisor_id: str, full_name: Optional[str]) -> Dict[str, Any]:
    try:
        return update_advisor_profile(advisor_id, full_name)
    except ResourceNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Advisor profile '{advisor_id}' not found",
        )


def get_advisor_notifications_service(
    advisor_id: str, page: int = 1, page_size: int = 20
) -> Dict[str, Any]:
    safe_page = max(1, page)
    safe_size = max(1, min(100, page_size))
    return get_notifications_for_recipient(
        recipient_id=advisor_id, unread_only=False, page=safe_page, page_size=safe_size
    )


def get_unread_notifications_service(advisor_id: str) -> Dict[str, Any]:
    res = get_notifications_for_recipient(recipient_id=advisor_id, unread_only=True, page=1, page_size=100)
    return {"unread_count": res.get("unread_count", 0)}


def mark_notification_read_service(advisor_id: str, notification_id: str) -> Dict[str, Any]:
    try:
        return mark_notification_as_read(notification_id, advisor_id)
    except ResourceNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found or access denied",
        )


def mark_all_notifications_read_service(advisor_id: str) -> Dict[str, Any]:
    count = mark_all_notifications_as_read(advisor_id)
    return {"message": f"Marked {count} notifications as read", "updated_count": count}
