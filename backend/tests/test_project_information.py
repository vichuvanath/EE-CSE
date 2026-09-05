import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings

client = TestClient(app)


def generate_student_jwt(student_id: str = "student-1", role: str = "student") -> str:
    payload = {
        "sub": student_id,
        "roll_number": "23CS001",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestProjectInformationAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    def test_get_existing_project(self, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "email": "s1@ex.com", "role": "student", "full_name": "S1"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101", name="Team 101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = [{
            "id": "proj-101",
            "team_id": "team-101",
            "title": "Smart Healthcare System",
            "domain": "Healthcare AI",
            "problem_statement": "Patient monitoring is manual and slow.",
            "description": "An AI platform for automated patient vitals tracking.",
            "proposed_solution": "Deploy IoT sensors linked to a Cloud dashboard.",
            "technologies_used": "FastAPI, React, Supabase, Python",
            "github_url": "https://github.com/example/healthcare",
            "status": "ongoing",
        }]
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/project/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["team_id"] == "team-101"
        assert data["title"] == "Smart Healthcare System"
        assert data["domain"] == "Healthcare AI"
        assert data["problem_statement"] == "Patient monitoring is manual and slow."
        assert data["proposed_solution"] == "Deploy IoT sensors linked to a Cloud dashboard."
        assert data["technologies_used"] == "FastAPI, React, Supabase, Python"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    def test_get_project_not_found(self, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "email": "s1@ex.com", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101", name="Team 101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = []
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/project/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert "not been created" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    @patch("app.repositories.project_repository.get_supabase_admin_client")
    def test_create_or_update_project(self, mock_admin_supabase, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "email": "s1@ex.com", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101", name="Team 101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = []
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        mock_insert_res = MagicMock()
        mock_insert_res.data = [{
            "id": "proj-new-123",
            "team_id": "team-101",
            "title": "New AI App",
            "domain": "Artificial Intelligence",
            "problem_statement": "Automating workflows",
            "description": "Detailed description here",
            "proposed_solution": "Cloud AI agents",
            "technologies_used": "FastAPI, Pytest",
            "status": "ongoing",
        }]
        mock_admin_supabase.return_value.table.return_value.insert.return_value.execute.return_value = mock_insert_res

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={
                "title": "New AI App",
                "domain": "Artificial Intelligence",
                "problem_statement": "Automating workflows",
                "description": "Detailed description here",
                "proposed_solution": "Cloud AI agents",
                "technologies_used": "FastAPI, Pytest",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New AI App"
        assert data["domain"] == "Artificial Intelligence"
        assert data["proposed_solution"] == "Cloud AI agents"

    def test_get_project_missing_jwt(self):
        response = client.get("/api/project/me")
        assert response.status_code == 401

    def test_get_project_invalid_jwt(self):
        response = client.get(
            "/api/project/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_get_project_non_student_role(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "faculty-1", "role": "faculty"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("faculty-1", "faculty")
        response = client.get(
            "/api/project/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    def test_update_project_empty_title_validation(self, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"title": "   "},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

