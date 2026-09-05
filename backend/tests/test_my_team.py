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


class TestMyTeamAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.team_repository.get_supabase_client")
    def test_get_my_team_success(self, mock_repo_supabase, mock_auth_supabase):
        # Auth profile lookup
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{
            "id": "student-1",
            "email": "student1@example.com",
            "full_name": "Student One",
            "role": "student",
            "roll_number": "23CS001",
        }]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        # Repo lookups
        # 1. membership
        mock_membership = MagicMock()
        mock_membership.data = [{"team_id": "team-101"}]
        
        # 2. team record
        mock_team = MagicMock()
        mock_team.data = [{
            "id": "team-101",
            "name": "Team Alpha",
            "project_title": "Smart Healthcare System",
            "faculty_id": "faculty-1",
            "leader_id": "student-1",
            "batch": "2023-2027",
            "section": "A",
        }]

        # 3. team members junction
        mock_members = MagicMock()
        mock_members.data = [
            {"team_id": "team-101", "student_id": "student-1", "is_team_leader": True},
            {"team_id": "team-101", "student_id": "student-2", "is_team_leader": False},
        ]

        # 4. student profiles
        mock_profiles = MagicMock()
        mock_profiles.data = [
            {"id": "student-1", "roll_number": "23CS001", "full_name": "Student One"},
            {"id": "student-2", "roll_number": "23CS002", "full_name": "Student Two"},
        ]

        # 5. advisor profile
        mock_advisor = MagicMock()
        mock_advisor.data = [{
            "id": "faculty-1",
            "full_name": "Dr. Advisor",
            "email": "advisor@example.com",
        }]

        mock_repo_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_membership,
            mock_team,
            mock_members,
            mock_advisor,
        ]
        mock_repo_supabase.return_value.table.return_value.select.return_value.in_.return_value.execute.return_value = mock_profiles

        token = generate_student_jwt("student-1", "student")
        response = client.get(
            "/api/team/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["team_id"] == "team-101"
        assert data["project_title"] == "Smart Healthcare System"
        assert data["batch"] == "2023-2027"
        assert data["section"] == "A"
        assert len(data["members"]) == 2
        assert data["members"][0]["roll_number"] == "23CS001"
        assert data["members"][0]["is_team_leader"] is True
        assert data["team_leader"]["roll_number"] == "23CS001"
        assert data["advisor"]["full_name"] == "Dr. Advisor"

    def test_get_my_team_missing_jwt(self):
        response = client.get("/api/team/me")
        assert response.status_code == 401

    def test_get_my_team_invalid_jwt(self):
        response = client.get(
            "/api/team/me",
            headers={"Authorization": "Bearer invalid_token_xyz"},
        )
        assert response.status_code == 401

    @patch("app.dependencies.auth.get_supabase_client")
    def test_get_my_team_non_student_role(self, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{
            "id": "faculty-1",
            "email": "faculty@example.com",
            "full_name": "Faculty Member",
            "role": "faculty",
        }]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        token = generate_student_jwt("faculty-1", "faculty")
        response = client.get(
            "/api/team/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.team_repository.get_supabase_client")
    def test_get_my_team_student_without_team(self, mock_repo_supabase, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{
            "id": "student-no-team",
            "email": "noteam@example.com",
            "full_name": "No Team Student",
            "role": "student",
        }]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        # Empty membership
        mock_membership = MagicMock()
        mock_membership.data = []
        mock_repo_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_membership

        token = generate_student_jwt("student-no-team", "student")
        response = client.get(
            "/api/team/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 404
        assert "not assigned" in response.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.team_repository.get_supabase_client")
    def test_team_isolation(self, mock_repo_supabase, mock_auth_supabase):
        mock_auth_profile = MagicMock()
        mock_auth_profile.data = [{
            "id": "student-a",
            "email": "studenta@example.com",
            "full_name": "Student A",
            "role": "student",
        }]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        mock_membership = MagicMock()
        mock_membership.data = [{"team_id": "team-a"}]

        mock_team = MagicMock()
        mock_team.data = [{
            "id": "team-a",
            "name": "Team A",
            "project_title": "Project A",
        }]

        mock_members = MagicMock()
        mock_members.data = [{"team_id": "team-a", "student_id": "student-a"}]

        mock_profiles = MagicMock()
        mock_profiles.data = [{"id": "student-a", "roll_number": "23CS001", "full_name": "Student A"}]

        mock_repo_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_membership,
            mock_team,
            mock_members,
        ]
        mock_repo_supabase.return_value.table.return_value.select.return_value.in_.return_value.execute.return_value = mock_profiles

        token = generate_student_jwt("student-a", "student")
        response = client.get(
            "/api/team/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["team_id"] == "team-a"
