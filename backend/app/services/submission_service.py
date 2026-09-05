from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.repositories.team_repository import get_student_team
from app.repositories.project_repository import get_project_by_team_id, upsert_project, update_project
from app.repositories.submission_repository import (
    get_checklist_raw_data,
    get_submission_by_project_id,
    create_submission_record,
)



def get_student_submission_checklist(student_id: str) -> dict:

    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    raw_data = get_checklist_raw_data(team.id)
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

    return {
        "abstract": {"completed": abstract_done, "label": "Abstract"},
        "report": {"completed": report_done, "label": "Project Report"},
        "ppt": {"completed": ppt_done, "label": "PPT"},
        "images": {"completed": images_done, "label": "Project Images"},
        "github": {"completed": github_done, "label": "GitHub Link"},
        "live_demo": {"completed": live_demo_done, "label": "Live Demo Link"},
        "completed_count": completed_count,
        "total_count": 6,
        "all_completed": completed_count == 6,
    }


def submit_final_project(student_id: str) -> dict:
    team = get_student_team(student_id)

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    project = get_project_by_team_id(team.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project information has not been created yet for this team",
        )

    # 1. Check if project has already been submitted
    existing = get_submission_by_project_id(project.id)
    if existing and existing.get("status") == "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Project has already been submitted",
        )

    # 2. Check checklist completion
    checklist = get_student_submission_checklist(student_id)
    if not checklist.get("all_completed"):
        missing_items = []
        for key in ["abstract", "report", "ppt", "images", "github", "live_demo"]:
            item = checklist.get(key, {})
            if not item.get("completed"):
                missing_items.append(item.get("label", key))

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Project cannot be submitted until all checklist requirements are completed",
                "missing_items": missing_items,
            },
        )

    # 3. Create official submission record with backend timestamp
    now = datetime.now(timezone.utc)
    submission_payload = {
        "project_id": project.id,
        "team_id": team.id,
        "status": "SUBMITTED",
        "submitted_at": now.isoformat(),
    }

    try:
        res = create_submission_record(submission_payload)
    except Exception as e:
        err_msg = f"{str(e)} {getattr(e, 'detail', '') or ''}".lower()
        if "duplicate" in err_msg or "unique" in err_msg or "23505" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Project has already been submitted",
            )
        raise e


    return {
        "message": "Project submitted successfully",
        "submission_id": str(res.get("id", "sub-123")),
        "status": "SUBMITTED",
        "submitted_at": res.get("submitted_at") or now.isoformat(),
    }



def get_my_submission_overview(student_id: str) -> dict:
    from app.repositories.file_repository import get_files_by_team_id

    team = get_student_team(student_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    project = get_project_by_team_id(team.id)
    submission_data = get_submission_by_project_id(project.id) if project else None

    if not submission_data:
        submission_data = {
            "id": "draft",
            "project_id": project.id if project else "",
            "team_id": team.id,
            "status": "DRAFT",
            "submitted_at": None,
        }

    checklist = get_student_submission_checklist(student_id)
    files = get_files_by_team_id(team.id)

    return {
        "submission": submission_data,
        "project": project,
        "checklist": checklist,
        "files": files,
    }


def update_my_submission_project(student_id: str, payload) -> dict:
    team = get_student_team(student_id)

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not assigned to a team",
        )

    project = get_project_by_team_id(team.id)

    # Check if project is already officially submitted
    if project:
        existing_sub = get_submission_by_project_id(project.id)
        if existing_sub and existing_sub.get("status") == "SUBMITTED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Submitted projects cannot be edited",
            )

    return upsert_project(team.id, payload)


