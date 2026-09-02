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


class TestProjectLinksAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    @patch("app.repositories.project_repository.get_supabase_admin_client")
    def test_put_valid_github_url_success(self, mock_admin_supabase, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = [{"id": "p-101", "team_id": "team-101", "title": "My App"}]
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        mock_update_rec = MagicMock()
        mock_update_rec.data = [{
            "id": "p-101",
            "team_id": "team-101",
            "title": "My App",
            "github_url": "https://github.com/myuser/myapp",
            "live_demo_url": None,
        }]
        mock_admin_supabase.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_rec

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"github_url": "https://github.com/myuser/myapp"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["github_url"] == "https://github.com/myuser/myapp"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    def test_github_url_non_github_domain_rejected(self, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile
        mock_get_team.return_value = MagicMock(id="team-101")

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"github_url": "https://google.com/myuser/myapp"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422
        assert "github.com" in str(response.json())

    @patch("app.dependencies.auth.get_supabase_client")
    def test_github_url_unsafe_scheme_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"github_url": "javascript:alert(1)"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    @patch("app.dependencies.auth.get_supabase_client")
    def test_github_url_ftp_scheme_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"github_url": "ftp://github.com/user/repo"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    @patch("app.repositories.project_repository.get_supabase_admin_client")
    def test_put_valid_live_demo_url_success(self, mock_admin_supabase, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = [{"id": "p-101", "team_id": "team-101", "title": "My App"}]
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        mock_update_rec = MagicMock()
        mock_update_rec.data = [{
            "id": "p-101",
            "team_id": "team-101",
            "title": "My App",
            "github_url": None,
            "live_demo_url": "https://myapp.vercel.app",
        }]
        mock_admin_supabase.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_rec

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"live_demo_url": "https://myapp.vercel.app"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["live_demo_url"] == "https://myapp.vercel.app"

    @patch("app.dependencies.auth.get_supabase_client")
    def test_live_demo_unsafe_javascript_scheme_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"live_demo_url": "javascript:void(0)"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    @patch("app.dependencies.auth.get_supabase_client")
    def test_live_demo_ftp_scheme_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"live_demo_url": "ftp://files.example.com/demo"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    @patch("app.dependencies.auth.get_supabase_client")
    def test_urls_oversized_rejected(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("student-1", "student")
        long_url = "https://github.com/user/" + ("a" * 550)
        response = client.put(
            "/api/project/me",
            json={"github_url": long_url},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422


    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    def test_get_project_returns_links(self, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = [{
            "id": "p-101",
            "team_id": "team-101",
            "title": "Smart App",
            "github_url": "https://github.com/org/smartapp",
            "live_demo_url": "https://smartapp.netlify.app",
        }]
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/project/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["github_url"] == "https://github.com/org/smartapp"
        assert data["live_demo_url"] == "https://smartapp.netlify.app"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.repositories.project_repository.get_supabase_client")
    @patch("app.repositories.project_repository.get_supabase_admin_client")
    def test_clear_project_links(self, mock_admin_supabase, mock_proj_supabase, mock_get_team, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "student-1", "role": "student"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_get_team.return_value = MagicMock(id="team-101")

        mock_proj_rec = MagicMock()
        mock_proj_rec.data = [{"id": "p-101", "team_id": "team-101", "github_url": "https://github.com/org/repo"}]
        mock_proj_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_proj_rec

        mock_update_rec = MagicMock()
        mock_update_rec.data = [{
            "id": "p-101",
            "team_id": "team-101",
            "github_url": None,
            "live_demo_url": None,
        }]
        mock_admin_supabase.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_rec

        token = generate_student_jwt("student-1", "student")
        response = client.put(
            "/api/project/me",
            json={"github_url": None, "live_demo_url": None},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["github_url"] is None
        assert data["live_demo_url"] is None

    def test_project_links_missing_jwt(self):
        response = client.get("/api/project/me")
        assert response.status_code == 401

    def test_project_links_invalid_jwt(self):
        response = client.get(
            "/api/project/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_project_links_non_student_role(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{"id": "faculty-1", "role": "faculty"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("faculty-1", "faculty")
        response = client.put(
            "/api/project/me",
            json={"github_url": "https://github.com/org/repo"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
