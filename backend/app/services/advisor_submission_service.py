from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.repositories.advisor_submission_repository import (
    get_advisor_submissions_summary,
    get_submission_by_team_id,
    get_submission_by_id,
    get_submission_files,
    generate_signed_file_url,
    upsert_submission_review,
    get_submission_review,
    upsert_document_review,
    get_document_review,
)
from app.repositories.team_repository import get_team_by_id
from app.repositories.project_repository import get_project_by_team_id
from app.repositories.file_repository import get_file_by_id
from app.repositories.assignment_repository import check_assignment




def get_my_submissions_service(advisor_id: str) -> List[Dict[str, Any]]:
    return get_advisor_submissions_summary(advisor_id)


def get_team_submission_service(advisor_id: str, team_id: str) -> Dict[str, Any]:
    # 1. Team existence
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team '{team_id}' not found",
        )

    # 2. Team authorization
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team is not assigned to this advisor",
        )

    # 3. Submission existence
    sub = get_submission_by_team_id(team_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No submission found for team '{team_id}'",
        )

    return get_submission_by_id_service(advisor_id, str(sub["id"]))


def get_submission_by_id_service(advisor_id: str, submission_id: str) -> Dict[str, Any]:
    # 1. Submission existence
    sub = get_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found",
        )

    team_id = str(sub["team_id"])

    # 2. Authorization check
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Submission belongs to a team not assigned to this advisor",
        )

    project = get_project_by_team_id(team_id)
    team = get_team_by_id(team_id)
    try:
        review = get_submission_review(submission_id) or {}
    except Exception:
        review = {}

    return {
        "id": str(sub["id"]),
        "submission_id": str(sub["id"]),
        "project_id": str(sub["project_id"]),
        "team_id": team_id,
        "team_name": team.get("name") if isinstance(team, dict) else (getattr(team, "name", None) if team else None),
        "project_title": project.title if project else (team.get("project_title") if isinstance(team, dict) else getattr(team, "project_title", None)),
        "github_url": project.github_url if project else None,
        "live_demo_url": project.live_demo_url if project else None,
        "status": sub.get("status", "SUBMITTED"),
        "submitted_at": sub.get("submitted_at"),
        "review_status": review.get("status", "PENDING"),
        "review_remarks": review.get("remarks"),
        "reviewed_at": review.get("updated_at") or review.get("created_at"),
        "created_at": sub.get("created_at"),
        "updated_at": sub.get("updated_at"),
        "project": project.model_dump() if project else None,
        "team": team if isinstance(team, dict) else (team.model_dump() if team else None),
        "members": [],
    }


def get_submission_files_service(advisor_id: str, submission_id: str) -> List[Dict[str, Any]]:
    sub = get_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found",
        )

    team_id = str(sub["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Submission belongs to a team not assigned to this advisor",
        )

    return get_submission_files(submission_id)


def get_file_download_url_service(advisor_id: str, file_id: str) -> Dict[str, Any]:
    file_record = get_file_by_id(file_id)
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File '{file_id}' not found",
        )

    if not check_assignment(advisor_id, file_record.team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: File belongs to a team not assigned to this advisor",
        )

    return generate_signed_file_url(file_id)


def get_submission_completeness_service(advisor_id: str, submission_id: str) -> Dict[str, Any]:
    sub = get_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found",
        )

    team_id = str(sub["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Submission belongs to a team not assigned to this advisor",
        )

    # Use existing checklist repository function
    from app.repositories.submission_repository import get_checklist_raw_data
    raw_data = get_checklist_raw_data(team_id)
    categories = raw_data.get("categories", [])
    project = raw_data.get("project") or {}

    abstract_done = "ABSTRACT" in categories
    report_done = "REPORT" in categories
    ppt_done = "PPT" in categories
    images_done = "IMAGE" in categories

    github_url = project.get("github_url")
    github_done = bool(github_url and isinstance(github_url, str) and github_url.strip())

    live_demo_url = project.get("live_demo_url")
    live_demo_done = bool(live_demo_url and isinstance(live_demo_url, str) and live_demo_url.strip())

    completed_count = sum([
        abstract_done,
        report_done,
        ppt_done,
        images_done,
        github_done,
        live_demo_done,
    ])

    items = [
        {"category": "ABSTRACT", "label": "Abstract", "completed": abstract_done},
        {"category": "REPORT", "label": "Project Report", "completed": report_done},
        {"category": "PPT", "label": "PPT Presentation", "completed": ppt_done},
        {"category": "IMAGE", "label": "Project Images", "completed": images_done},
        {"category": "GITHUB", "label": "GitHub Link", "completed": github_done},
        {"category": "LIVE_DEMO", "label": "Live Demo Link", "completed": live_demo_done},
    ]

    components = [
        {"name": "Abstract", "category": "ABSTRACT", "is_completed": abstract_done, "description": "Project abstract file"},
        {"name": "Project Report", "category": "REPORT", "is_completed": report_done, "description": "Final project report document"},
        {"name": "PPT Presentation", "category": "PPT", "is_completed": ppt_done, "description": "Presentation slides"},
        {"name": "Project Images", "category": "IMAGE", "is_completed": images_done, "description": "Screenshots / diagrams"},
        {"name": "GitHub Link", "category": "GITHUB", "is_completed": github_done, "description": "Source code repository URL"},
        {"name": "Live Demo Link", "category": "LIVE_DEMO", "is_completed": live_demo_done, "description": "Deployment / Live demo URL"},
    ]

    all_completed = completed_count == 6

    return {
        "submission_id": str(sub["id"]),
        "team_id": team_id,
        "status": sub.get("status", "SUBMITTED"),
        "completion_status": "COMPLETE" if all_completed else "INCOMPLETE",
        "completed_count": completed_count,
        "total_count": 6,
        "all_completed": all_completed,
        "items": items,
        "components": components,
    }



def save_submission_review_service(
    advisor_id: str, submission_id: str, status_val: str, remarks: Optional[str]
) -> Dict[str, Any]:
    sub = get_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found",
        )

    team_id = str(sub["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Submission belongs to a team not assigned to this advisor",
        )

    valid_statuses = ["PENDING", "IN_REVIEW", "REVIEWED", "APPROVED", "CHANGES_REQUESTED"]
    clean_status = status_val.upper().strip()
    if clean_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid review status '{status_val}'. Allowed: {', '.join(valid_statuses)}",
        )

    return upsert_submission_review(submission_id, advisor_id, clean_status, remarks)


def get_submission_review_service(advisor_id: str, submission_id: str) -> Dict[str, Any]:
    sub = get_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found",
        )

    team_id = str(sub["team_id"])
    if not check_assignment(advisor_id, team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Submission belongs to a team not assigned to this advisor",
        )

    review = get_submission_review(submission_id)
    if not review:
        return {
            "id": "unreviewed",
            "submission_id": submission_id,
            "advisor_id": advisor_id,
            "status": "PENDING",
            "remarks": None,
            "created_at": None,
            "updated_at": None,
        }
    return review


def get_document_review_service(advisor_id: str, file_id: str) -> Dict[str, Any]:
    file_record = get_file_by_id(file_id)
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File '{file_id}' not found",
        )

    cat = file_record.category.upper()
    if cat not in ["ABSTRACT", "REPORT", "PPT"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File category '{cat}' is not eligible for document review. Only ABSTRACT, REPORT, and PPT can be reviewed.",
        )

    if not check_assignment(advisor_id, file_record.team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: File belongs to a team not assigned to this advisor",
        )

    review = get_document_review(file_id, advisor_id)
    if not review:
        return {
            "id": "unreviewed",
            "file_id": file_id,
            "advisor_id": advisor_id,
            "category": cat,
            "status": "PENDING",
            "remarks": None,
            "created_at": None,
            "updated_at": None,
        }
    review["category"] = cat
    return review


def save_document_review_service(
    advisor_id: str, file_id: str, status_val: str, remarks: Optional[str]
) -> Dict[str, Any]:
    file_record = get_file_by_id(file_id)
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File '{file_id}' not found",
        )

    cat = file_record.category.upper()
    if cat not in ["ABSTRACT", "REPORT", "PPT"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File category '{cat}' is not eligible for document review. Only ABSTRACT, REPORT, and PPT can be reviewed.",
        )

    if not check_assignment(advisor_id, file_record.team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: File belongs to a team not assigned to this advisor",
        )

    valid_statuses = ["PENDING", "IN_REVIEW", "APPROVED", "NEEDS_REVISION"]
    clean_status = status_val.upper().strip()
    if clean_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document review status '{status_val}'. Allowed: {', '.join(valid_statuses)}",
        )

    review = upsert_document_review(file_id, advisor_id, clean_status, remarks)
    review["category"] = cat
    return review
