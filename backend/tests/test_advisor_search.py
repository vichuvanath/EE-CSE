import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings

client = TestClient(app)


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestAdvisorSearchAPI:

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_overview_service.search_advisor_records")
    def test_search_records_success(self, mock_search, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_search.return_value = {
            "query": "smart",
            "total_count": 2,
            "page": 1,
            "page_size": 20,
            "results": {
                "teams": [
                    {
                        "team_id": "team-01",
                        "name": "Team Smart",
                        "batch": "2023-2027",
                        "section": "A",
                        "project_title": "Smart Assistant",
                        "member_count": 4,
                        "submission_status": "SUBMITTED",
                        "evaluation_status": "IN_PROGRESS",
                    }
                ],
                "students": [
                    {
                        "student_id": "student-01",
                        "full_name": "Smart Student",
                        "roll_number": "21CSE001",
                        "email": "smart@college.edu",
                        "team_id": "team-01",
                        "team_name": "Team Smart",
                    }
                ],
                "projects": [],
                "evaluations": [],
            },
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/search?q=smart",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "smart"
        assert data["total_count"] == 2
        assert len(data["results"]["teams"]) == 1
        assert len(data["results"]["students"]) == 1

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_overview_service.search_advisor_records")
    def test_search_cross_advisor_unauthorized_isolation(self, mock_search, mock_auth_supabase):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "advisor-a", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        # Searching Advisor B's student roll number yields 0 results for Advisor A!
        mock_search.return_value = {
            "query": "21CSE999",
            "total_count": 0,
            "page": 1,
            "page_size": 20,
            "results": {"teams": [], "students": [], "projects": [], "evaluations": []},
        }

        token = generate_jwt("advisor-a", "advisor")
        response = client.get(
            "/api/advisor/search?q=21CSE999",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 0
        assert len(data["results"]["students"]) == 0
