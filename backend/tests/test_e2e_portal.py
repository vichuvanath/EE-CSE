import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from jose import jwt
from app.core.config import settings
from app.schemas.user import UserResponse
from app.schemas.project import ProjectResponse
from app.schemas.team import TeamResponse
from app.schemas.file import FileMetadataResponse

client = TestClient(app)


def make_token(user_id: str, role: str, team_id: str = None) -> str:
    payload = {
        "sub": user_id,
        "email": f"{user_id}@college.edu",
        "role": role,
        "aud": "authenticated",
    }
    if team_id:
        payload["team_id"] = team_id
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


class TestStudentEndToEndWorkflow:
    """Complete end-to-end student flow."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.profile_service.get_profile_by_id")
    @patch("app.services.profile_service.update_profile_full_name")
    def test_student_profile_workflow(self, mock_update_prof, mock_get_prof, mock_auth_sb):
        mock_auth_sb.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "std-1", "roll_number": "23CS001", "full_name": "Student A", "role": "student", "email": "std1@college.edu"}]
        )
        mock_get_prof.return_value = {
            "id": "std-1", "roll_number": "23CS001", "full_name": "Student A", "role": "student", "email": "std1@college.edu"
        }
        mock_update_prof.return_value = {
            "id": "std-1", "roll_number": "23CS001", "full_name": "Student A Updated", "role": "student", "email": "std1@college.edu"
        }

        token = make_token("std-1", "student")

        # 1. GET /api/student/profile
        get_res = client.get("/api/student/profile", headers={"Authorization": f"Bearer {token}"})
        assert get_res.status_code == 200
        assert get_res.json()["full_name"] == "Student A"

        # 2. PUT /api/student/profile
        put_res = client.put("/api/student/profile", headers={"Authorization": f"Bearer {token}"}, json={"full_name": "Student A Updated"})
        assert put_res.status_code == 200
        assert put_res.json()["full_name"] == "Student A Updated"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.project_service.get_student_team")
    @patch("app.services.project_service.get_project_by_team_id")
    @patch("app.services.project_service.upsert_project")
    def test_student_project_workflow(self, mock_upsert, mock_get_proj, mock_get_team, mock_auth_sb):
        mock_auth_sb.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "std-1", "role": "student", "email": "std1@college.edu"}]
        )
        mock_get_team.return_value = TeamResponse(id="team-1", name="Alpha", project_title="Alpha Proj")
        mock_get_proj.return_value = ProjectResponse(
            id="proj-1",
            team_id="team-1",
            title="IoT Health Monitor",
            domain="Healthcare",
            github_url="https://github.com/team/health",
            live_demo_url="https://health.app",
        )
        mock_upsert.return_value = ProjectResponse(
            id="proj-1",
            team_id="team-1",
            title="IoT Health Monitor Updated",
            domain="Healthcare",
            github_url="https://github.com/team/health",
            live_demo_url="https://health.app",
        )

        token = make_token("std-1", "student")

        # 1. GET /api/project/me
        get_res = client.get("/api/project/me", headers={"Authorization": f"Bearer {token}"})
        assert get_res.status_code == 200
        assert get_res.json()["title"] == "IoT Health Monitor"

        # 2. PUT /api/project/me
        put_res = client.put(
            "/api/project/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"title": "IoT Health Monitor Updated"},
        )
        assert put_res.status_code == 200
        assert put_res.json()["title"] == "IoT Health Monitor Updated"

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.routers.submission.get_student_submission_checklist")
    @patch("app.services.submission_service.get_student_team")
    @patch("app.services.submission_service.get_project_by_team_id")
    @patch("app.services.submission_service.get_student_submission_checklist")
    @patch("app.services.submission_service.get_submission_by_project_id")
    @patch("app.services.submission_service.create_submission_record")
    def test_student_submission_final_workflow(
        self, mock_create_sub, mock_get_sub, mock_chk_svc, mock_get_proj, mock_get_team, mock_chk_router, mock_auth_sb
    ):
        mock_chk_router.return_value = {
            "abstract": {"completed": True, "label": "Abstract"},
            "report": {"completed": True, "label": "Project Report"},
            "ppt": {"completed": True, "label": "PPT"},
            "images": {"completed": True, "label": "Project Images"},
            "github": {"completed": True, "label": "GitHub Link"},
            "live_demo": {"completed": True, "label": "Live Demo Link"},
            "completed_count": 6,
            "total_count": 6,
            "all_completed": True,
        }
        mock_auth_sb.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "std-1", "role": "student"}]
        )
        mock_get_team.return_value = TeamResponse(id="team-1", name="Alpha", project_title="Alpha Proj")
        mock_get_proj.return_value = ProjectResponse(id="proj-1", team_id="team-1", title="Alpha Proj")
        mock_get_sub.return_value = None  # Not submitted yet
        mock_chk_svc.return_value = {
            "abstract": {"completed": True, "label": "Abstract"},
            "report": {"completed": True, "label": "Project Report"},
            "ppt": {"completed": True, "label": "PPT"},
            "images": {"completed": True, "label": "Project Images"},
            "github": {"completed": True, "label": "GitHub Link"},
            "live_demo": {"completed": True, "label": "Live Demo Link"},
            "completed_count": 6,
            "total_count": 6,
            "all_completed": True,
        }
        mock_create_sub.return_value = {
            "id": "sub-100",
            "project_id": "proj-1",
            "team_id": "team-1",
            "status": "SUBMITTED",
            "submitted_at": "2026-09-02T22:00:00Z",
        }

        token = make_token("std-1", "student")

        # 1. GET /api/submission/checklist
        chk_res = client.get("/api/submission/checklist", headers={"Authorization": f"Bearer {token}"})
        assert chk_res.status_code == 200
        assert chk_res.json()["all_completed"] is True

        # 2. POST /api/submission/final
        sub_res = client.post("/api/submission/final", headers={"Authorization": f"Bearer {token}"})
        assert sub_res.status_code == 200
        assert sub_res.json()["status"] == "SUBMITTED"
        assert sub_res.json()["submission_id"] == "sub-100"


class TestAdvisorEndToEndWorkflow:
    """Complete end-to-end advisor flow."""

    @patch("app.dependencies.auth.get_supabase_client")
    @patch("app.services.advisor_submission_service.check_assignment")
    @patch("app.services.advisor_submission_service.get_submission_by_id")
    @patch("app.services.advisor_submission_service.upsert_submission_review")
    @patch("app.services.advisor_evaluation_service.check_assignment")
    @patch("app.services.advisor_evaluation_service.get_team_by_id")
    @patch("app.services.advisor_evaluation_service.get_team_evaluation")
    @patch("app.services.advisor_evaluation_service.upsert_team_evaluation")
    @patch("app.services.advisor_evaluation_service.get_evaluation_by_id")
    @patch("app.services.advisor_evaluation_service.update_evaluation_status")
    def test_advisor_review_and_evaluation_workflow(
        self,
        mock_update_eval_st,
        mock_get_eval_by_id,
        mock_upsert_team_eval,
        mock_get_team_eval,
        mock_get_team,
        mock_eval_check_asg,
        mock_upsert_sub_rev,
        mock_get_sub,
        mock_sub_check_asg,
        mock_auth_sb,
    ):
        mock_auth_sb.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "adv-1", "role": "advisor", "full_name": "Prof. Smith"}]
        )
        mock_sub_check_asg.return_value = True
        mock_eval_check_asg.return_value = True
        mock_get_team.return_value = TeamResponse(id="team-1", name="Alpha Team", project_title="Alpha Proj")
        mock_get_sub.return_value = {"id": "sub-1", "team_id": "team-1", "status": "SUBMITTED"}
        mock_upsert_sub_rev.return_value = {
            "id": "rev-1",
            "submission_id": "sub-1",
            "advisor_id": "adv-1",
            "status": "APPROVED",
            "remarks": "Great job!",
        }

        token = make_token("adv-1", "advisor")

        # 1. Review Submission: POST /api/advisor/submissions/{id}/review
        rev_res = client.post(
            "/api/advisor/submissions/sub-1/review",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "APPROVED", "remarks": "Great job!"},
        )
        assert rev_res.status_code == 200
        assert rev_res.json()["status"] == "APPROVED"

        # 2. Team Evaluation: POST /api/advisor/teams/{team_id}/evaluation
        mock_get_team_eval.return_value = {"id": "eval-1", "team_id": "team-1", "status": "IN_PROGRESS"}
        mock_upsert_team_eval.return_value = {
            "id": "eval-1",
            "team_id": "team-1",
            "advisor_id": "adv-1",
            "team_score": 92.5,
            "team_remarks": "Outstanding work",
            "status": "EVALUATED",
            "student_evaluations": [],
        }

        eval_res = client.post(
            "/api/advisor/teams/team-1/evaluation",
            headers={"Authorization": f"Bearer {token}"},
            json={"team_score": 92.5, "team_remarks": "Outstanding work", "status": "EVALUATED"},
        )
        assert eval_res.status_code == 200
        assert eval_res.json()["team_score"] == 92.5

        # 3. Lock Evaluation: POST /api/advisor/evaluations/{id}/lock
        mock_get_eval_by_id.return_value = {"id": "eval-1", "team_id": "team-1", "status": "EVALUATED"}
        mock_update_eval_st.return_value = {
            "id": "eval-1",
            "team_id": "team-1",
            "advisor_id": "adv-1",
            "team_score": 92.5,
            "status": "LOCKED",
            "student_evaluations": [],
        }

        lock_res = client.post(
            "/api/advisor/evaluations/eval-1/lock",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert lock_res.status_code == 200
        assert lock_res.json()["status"] == "LOCKED"


class TestRBACAndAuthorizationSecurity:
    """Security & RBAC testing across roles and boundaries."""

    @patch("app.dependencies.auth.get_supabase_client")
    def test_student_cannot_access_advisor_routes(self, mock_auth_sb):
        mock_auth_sb.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "std-1", "role": "student"}]
        )
        student_token = make_token("std-1", "student")

        advisor_endpoints = [
            ("GET", "/api/advisor/teams"),
            ("GET", "/api/advisor/dashboard"),
            ("GET", "/api/advisor/submissions"),
            ("GET", "/api/advisor/evaluations/overview"),
            ("GET", "/api/advisor/deadlines"),
            ("GET", "/api/advisor/profile"),
        ]

        for method, endpoint in advisor_endpoints:
            if method == "GET":
                res = client.get(endpoint, headers={"Authorization": f"Bearer {student_token}"})
            assert res.status_code == 403, f"Endpoint {endpoint} should require advisor role!"
            assert "Advisor access required" in res.json()["detail"]

    @patch("app.dependencies.auth.get_supabase_client")
    def test_advisor_cannot_access_student_routes(self, mock_auth_sb):
        mock_auth_sb.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "adv-1", "role": "advisor"}]
        )
        advisor_token = make_token("adv-1", "advisor")

        student_endpoints = [
            ("GET", "/api/student/profile"),
            ("GET", "/api/team/me"),
            ("GET", "/api/project/me"),
            ("GET", "/api/files/me"),
            ("GET", "/api/submission/checklist"),
            ("POST", "/api/submission/final"),
        ]

        for method, endpoint in student_endpoints:
            if method == "GET":
                res = client.get(endpoint, headers={"Authorization": f"Bearer {advisor_token}"})
            elif method == "POST":
                res = client.post(endpoint, headers={"Authorization": f"Bearer {advisor_token}"})
            assert res.status_code == 403, f"Endpoint {endpoint} should require student role!"
            assert "Student access required" in res.json()["detail"]

    def test_unauthenticated_requests_fail_with_401(self):
        endpoints = [
            ("GET", "/api/auth/me"),
            ("GET", "/api/student/profile"),
            ("GET", "/api/team/me"),
            ("GET", "/api/project/me"),
            ("GET", "/api/advisor/dashboard"),
            ("GET", "/api/advisor/teams"),
        ]

        for method, endpoint in endpoints:
            res = client.get(endpoint)
            assert res.status_code == 401
            assert "Not authenticated" in res.json()["detail"]
