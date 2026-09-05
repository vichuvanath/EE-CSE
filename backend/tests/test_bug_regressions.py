import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings
from app.schemas.user import UserResponse
from app.schemas.project import ProjectResponse
from app.schemas.advisor_submission import SubmissionCompletenessResponse

client = TestClient(app)


def generate_jwt(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestBug1Regression:
    """BUG 1: Submission completeness response must contain 'items' list with valid objects."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.repositories.submission_repository.get_checklist_raw_data")
    def test_submission_completeness_has_items_array(
        self, mock_raw_data, mock_check, mock_get_sub, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "adv-1", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_get_sub.return_value = {"id": "sub-101", "team_id": "team-101", "status": "SUBMITTED"}
        mock_check.return_value = True
        mock_raw_data.return_value = {
            "categories": ["ABSTRACT", "REPORT", "PPT"],
            "project": {
                "github_url": "https://github.com/myteam/proj",
                "live_demo_url": "",
            },
        }

        token = generate_jwt("adv-1", "advisor")
        response = client.get(
            "/api/advisor/submissions/sub-101/completeness",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) == 6

        # Verify item fields
        items_by_cat = {item["category"]: item for item in data["items"]}
        assert items_by_cat["ABSTRACT"]["completed"] is True
        assert items_by_cat["REPORT"]["completed"] is True
        assert items_by_cat["PPT"]["completed"] is True
        assert items_by_cat["IMAGE"]["completed"] is False
        assert items_by_cat["GITHUB"]["completed"] is True
        assert items_by_cat["LIVE_DEMO"]["completed"] is False

        assert data["all_completed"] is False
        assert data["completion_status"] == "INCOMPLETE"


class TestBug2Regression:
    """BUG 2: Advisor team summary must populate the 'leader' field."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.advisor_repository.get_supabase_client")
    @patch("app.repositories.advisor_repository.get_assigned_team_ids")
    def test_advisor_team_summary_has_leader(
        self, mock_team_ids, mock_repo_supabase, mock_auth_supabase
    ):
        mock_profile = MagicMock()
        mock_profile.data = [{"id": "adv-1", "role": "advisor"}]
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team_ids.return_value = ["team-1"]

        # Mock DB queries
        mock_teams = MagicMock(data=[{
            "id": "team-1",
            "name": "Team Alpha",
            "project_title": "AI Alpha",
            "batch": "2023-2027",
            "section": "A",
            "created_at": "2026-09-02T22:00:00Z",
        }])
        mock_projects = MagicMock(data=[{"team_id": "team-1", "title": "AI Alpha"}])
        mock_subs = MagicMock(data=[{"team_id": "team-1", "status": "SUBMITTED"}])
        mock_members = MagicMock(data=[{
            "team_id": "team-1",
            "student_id": "student-1",
            "is_team_leader": True,
        }])
        mock_student_profiles = MagicMock(data=[{
            "id": "student-1",
            "roll_number": "23CS001",
            "full_name": "Alice Leader",
            "email": "alice@college.edu",
        }])

        mock_table = mock_repo_supabase.return_value.table
        mock_table.return_value.select.return_value.in_.return_value.execute.side_effect = [
            mock_teams,
            mock_projects,
            mock_subs,
            mock_members,
            mock_student_profiles,
        ]

        token = generate_jwt("adv-1", "advisor")
        response = client.get(
            "/api/advisor/teams",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        team = data[0]
        assert team["leader"] is not None
        assert team["leader"]["full_name"] == "Alice Leader"
        assert team["leader"]["roll_number"] == "23CS001"


class TestBug3Regression:
    """BUG 3: Student /api/team/me resolves advisor via advisor_team_assignments when faculty_id is NULL."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.team_repository.get_supabase_client")
    def test_get_my_team_resolves_advisor_from_assignments(
        self, mock_repo_supabase, mock_auth_supabase
    ):
        mock_auth_profile = MagicMock(data=[{
            "id": "student-1",
            "email": "student1@example.com",
            "full_name": "Student One",
            "role": "student",
            "roll_number": "23CS001",
        }])
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_auth_profile

        # 1. membership
        mock_membership = MagicMock(data=[{"team_id": "team-101"}])
        # 2. team record (faculty_id is NULL)
        mock_team = MagicMock(data=[{
            "id": "team-101",
            "name": "Team Alpha",
            "project_title": "Project Alpha",
            "faculty_id": None,
            "batch": "2023-2027",
            "section": "A",
        }])
        # 3. team members
        mock_members = MagicMock(data=[{"team_id": "team-101", "student_id": "student-1", "is_team_leader": True}])
        # 4. student profile
        mock_profiles = MagicMock(data=[{"id": "student-1", "roll_number": "23CS001", "full_name": "Student One"}])
        # 5. advisor assignment lookup
        mock_asg = MagicMock(data=[{"advisor_id": "advisor-99"}])
        # 6. advisor profile lookup
        mock_advisor_prof = MagicMock(data=[{
            "id": "advisor-99",
            "full_name": "Dr. Assigned Advisor",
            "email": "assigned@college.edu",
        }])

        mock_repo_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_membership,
            mock_team,
            mock_members,
            mock_asg,
            mock_advisor_prof,
        ]
        mock_repo_supabase.return_value.table.return_value.select.return_value.in_.return_value.execute.return_value = mock_profiles

        token = generate_jwt("student-1", "student")
        response = client.get(
            "/api/team/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["advisor"] is not None
        assert data["advisor"]["id"] == "advisor-99"
        assert data["advisor"]["full_name"] == "Dr. Assigned Advisor"


class TestBug4Regression:
    """BUG 4: Advisor submission summary returns real review_status from submission_reviews."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.advisor_submission_repository.get_supabase_client")
    @patch("app.repositories.advisor_submission_repository.get_assigned_team_ids")
    def test_submissions_summary_real_review_status(
        self, mock_team_ids, mock_repo_supabase, mock_auth_supabase
    ):
        mock_profile = MagicMock(data=[{"id": "adv-1", "role": "advisor"}])
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team_ids.return_value = ["team-1", "team-2"]

        mock_subs = MagicMock(data=[
            {"id": "sub-1", "project_id": "proj-1", "team_id": "team-1", "status": "SUBMITTED"},
            {"id": "sub-2", "project_id": "proj-2", "team_id": "team-2", "status": "SUBMITTED"},
        ])
        mock_teams = MagicMock(data=[
            {"id": "team-1", "name": "Team 1", "project_title": "Proj 1"},
            {"id": "team-2", "name": "Team 2", "project_title": "Proj 2"},
        ])
        mock_projs = MagicMock(data=[
            {"team_id": "team-1", "title": "Proj 1"},
            {"team_id": "team-2", "title": "Proj 2"},
        ])
        mock_reviews = MagicMock(data=[
            {"submission_id": "sub-1", "status": "APPROVED"},
            # sub-2 has no review record (should default to PENDING)
        ])

        mock_repo_supabase.return_value.table.return_value.select.return_value.in_.return_value.execute.side_effect = [
            mock_subs,
            mock_teams,
            mock_projs,
            mock_reviews,
        ]

        token = generate_jwt("adv-1", "advisor")
        response = client.get(
            "/api/advisor/submissions",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        subs_by_id = {s["id"]: s for s in data}
        assert subs_by_id["sub-1"]["review_status"] == "APPROVED"
        assert subs_by_id["sub-2"]["review_status"] == "PENDING"


class TestBug5Regression:
    """BUG 5: Project search returns correct submission_status."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.repositories.advisor_overview_repository.get_supabase_client")
    @patch("app.repositories.advisor_overview_repository.get_assigned_team_ids")
    def test_project_search_has_submission_status(
        self, mock_team_ids, mock_repo_supabase, mock_auth_supabase
    ):
        mock_profile = MagicMock(data=[{"id": "adv-1", "role": "advisor"}])
        mock_auth_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile

        mock_team_ids.return_value = ["team-1"]

        mock_teams = MagicMock(data=[{"id": "team-1", "name": "Alpha Team", "batch": "2023-2027", "section": "A"}])
        mock_projs = MagicMock(data=[{"id": "proj-1", "team_id": "team-1", "title": "Machine Learning Bot", "domain": "AI"}])
        mock_subs = MagicMock(data=[{"team_id": "team-1", "status": "SUBMITTED"}])
        mock_evals = MagicMock(data=[])
        mock_members = MagicMock(data=[])

        mock_repo_supabase.return_value.table.return_value.select.return_value.in_.return_value.execute.side_effect = [
            mock_teams,
            mock_projs,
            mock_subs,
            mock_evals,
            mock_members,
        ]

        token = generate_jwt("adv-1", "advisor")
        response = client.get(
            "/api/advisor/search?type=project&q=Machine",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        projects = data["results"]["projects"]
        assert len(projects) == 1
        assert projects[0]["submission_status"] == "SUBMITTED"
        assert projects[0]["title"] == "Machine Learning Bot"


class TestBug6Regression:
    """BUG 6: Role check in add_student_to_team is case-insensitive for lowercase 'student'."""

    @patch("app.services.team_service.get_supabase_service")
    @patch("app.services.team_service.is_student_in_any_team")
    @patch("app.services.team_service.get_team_member_count")
    def test_add_student_with_lowercase_role_succeeds(
        self, mock_count, mock_in_team, mock_supabase
    ):
        from app.services.team_service import add_student_to_team

        # Stored role is lowercase "student"
        mock_profile = MagicMock(data=[{"role": "student"}])
        mock_insert = MagicMock(data=[{"id": "tm-1", "team_id": "team-1", "student_id": "student-1"}])

        mock_supabase.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile
        mock_supabase.return_value.table.return_value.insert.return_value.execute.return_value = mock_insert
        mock_in_team.return_value = False
        mock_count.return_value = 2

        result = add_student_to_team("student-1", "team-1")
        assert result["id"] == "tm-1"
        assert result["team_id"] == "team-1"


class TestBug7Regression:
    """BUG 7: Advisor authentication exceptions cannot result in authentication bypass."""

    @patch("app.repositories.user_repository.get_user_by_email")
    @patch("app.services.auth_service.get_supabase_client")
    def test_advisor_auth_exception_fails_with_401(
        self, mock_supabase, mock_get_user
    ):
        mock_get_user.return_value = UserResponse(
            id="adv-1",
            email="advisor@college.edu",
            full_name="Prof. Test",
            role="advisor",
        )
        # Supabase Auth raises unexpected AuthApiError / Exception
        mock_supabase.return_value.auth.sign_in_with_password.side_effect = Exception("Supabase Auth API Error: 400 Bad Request")

        # User provides random incorrect password
        response = client.post(
            "/api/auth/advisor-login",
            json={
                "advisor_id": "advisor@college.edu",
                "password": "ArbitraryNonBlacklistedPassword987",
            },
        )

        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]
