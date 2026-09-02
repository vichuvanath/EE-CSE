from typing import Optional
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse


def get_project_by_team_id(team_id: str) -> Optional[ProjectResponse]:
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("projects")
            .select("*")
            .eq("team_id", team_id)
            .execute()
        )
        if not result.data:
            return None
        return ProjectResponse(**result.data[0])
    except Exception:
        return None



def create_project(team_id: str, data: ProjectUpdate) -> ProjectResponse:
    try:
        supabase = get_supabase_admin_client()
        
        insert_data = {
            "team_id": team_id,
            "title": (data.title or "").strip() if data.title else "Untitled Project",
        }
        if data.domain is not None:
            insert_data["domain"] = data.domain.strip()
        if data.problem_statement is not None:
            insert_data["problem_statement"] = data.problem_statement.strip()
        if data.description is not None:
            insert_data["description"] = data.description.strip()
        if data.proposed_solution is not None:
            insert_data["proposed_solution"] = data.proposed_solution.strip()
        if data.technologies_used is not None:
            insert_data["technologies_used"] = data.technologies_used.strip()
        if data.github_url is not None:
            insert_data["github_url"] = data.github_url.strip() if isinstance(data.github_url, str) else data.github_url
        if data.live_demo_url is not None:
            insert_data["live_demo_url"] = data.live_demo_url.strip() if isinstance(data.live_demo_url, str) else data.live_demo_url

        result = supabase.table("projects").insert(insert_data).execute()

        if not result.data:
            raise DatabaseError(message="Failed to create project record")
        
        project = ProjectResponse(**result.data[0])

        # Synchronize title to teams.project_title for Module 2 compatibility
        if project.title:
            try:
                supabase.table("teams").update({"project_title": project.title}).eq("id", team_id).execute()
            except Exception:
                pass

        return project
    except DatabaseError:
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def update_project(team_id: str, data: ProjectUpdate) -> ProjectResponse:
    try:
        supabase = get_supabase_admin_client()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            existing = get_project_by_team_id(team_id)
            if not existing:
                raise ResourceNotFoundError("Project", team_id)
            return existing

        # Clean whitespace for strings
        for k, v in update_data.items():
            if isinstance(v, str):
                update_data[k] = v.strip()

        result = (
            supabase.table("projects")
            .update(update_data)
            .eq("team_id", team_id)
            .execute()
        )
        if not result.data:
            raise ResourceNotFoundError("Project", team_id)

        project = ProjectResponse(**result.data[0])

        # Synchronize title to teams.project_title for Module 2 compatibility
        if "title" in update_data and update_data["title"]:
            try:
                supabase.table("teams").update({"project_title": update_data["title"]}).eq("id", team_id).execute()
            except Exception:
                pass

        return project
    except (ResourceNotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise DatabaseError(detail=str(e))


def upsert_project(team_id: str, data: ProjectUpdate) -> ProjectResponse:
    existing = get_project_by_team_id(team_id)
    if existing:
        return update_project(team_id, data)
    else:
        return create_project(team_id, data)
