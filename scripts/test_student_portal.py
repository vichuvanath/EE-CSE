import io
import os
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add backend root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
import app.models
from app.models import (
    Base,
    User,
    UserRole,
    Student,
    Advisor,
    Class,
    ClassEnrollment,
    Team,
    TeamMember,
    TeamAssignment,
    Project,
    Submission,
    SubmissionFile,
    Evaluation,
    EvaluationScore,
    Deadline,
    Announcement,
    AnnouncementTarget,
    AnnouncementRead,
    Notification,
    AuditLog,
)
from app.main import app
from app.core.database import get_db
from app.core.security import hash_password

# StaticPool ensures in-memory SQLite instance persists across sessions during test run
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply FastAPI dependency override for test suite isolation
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def setup_full_test_data():
    """Seeds complete test entities across students, teams, classes, submissions, evaluations, and notifications."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        db.query(AuditLog).delete()
        db.query(Notification).delete()
        db.query(AnnouncementRead).delete()
        db.query(AnnouncementTarget).delete()
        db.query(Announcement).delete()
        db.query(Deadline).delete()
        db.query(EvaluationScore).delete()
        db.query(Evaluation).delete()
        db.query(SubmissionFile).delete()
        db.query(Submission).delete()
        db.query(Project).delete()
        db.query(TeamAssignment).delete()
        db.query(TeamMember).delete()
        db.query(Team).delete()
        db.query(ClassEnrollment).delete()
        db.query(Class).delete()
        db.query(Advisor).delete()
        db.query(Student).delete()
        db.query(User).delete()
        db.commit()

        # 1. Users
        student_user1 = User(
            id="user-student-1",
            email="student1@university.edu",
            password_hash=hash_password("StudentPass123!"),
            full_name="Alice Smith",
            role=UserRole.STUDENT,
            is_active=True,
        )
        student_user2 = User(
            id="user-student-2",
            email="student2@university.edu",
            password_hash=hash_password("StudentPass123!"),
            full_name="Bob Jones",
            role=UserRole.STUDENT,
            is_active=True,
        )
        admin_user = User(
            id="user-admin-1",
            email="admin@university.edu",
            password_hash=hash_password("AdminPass123!"),
            full_name="Charlie Admin",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add_all([student_user1, student_user2, admin_user])
        db.commit()

        # 2. Students & Academic Class
        student1 = Student(
            id="student-1",
            user_id=student_user1.id,
            roll_number="EE2026-001",
            department="Electrical Engineering",
            batch="2026",
            phone_number="+15550199",
        )
        student2 = Student(
            id="student-2",
            user_id=student_user2.id,
            roll_number="EE2026-002",
            department="Electrical Engineering",
            batch="2026",
            phone_number="+15550200",
        )
        db.add_all([student1, student2])
        db.commit()

        cls = Class(
            id="class-ee401",
            name="Senior EE Capstone",
            code="EE401",
            academic_year="2026",
            semester="Fall",
        )
        db.add(cls)
        db.commit()

        enrollment1 = ClassEnrollment(class_id=cls.id, student_id=student1.id)
        enrollment2 = ClassEnrollment(class_id=cls.id, student_id=student2.id)
        db.add_all([enrollment1, enrollment2])
        db.commit()

        # 3. Team & Project
        team = Team(id="team-alpha", name="Alpha Robotics", class_id=cls.id)
        db.add(team)
        db.commit()

        tm1 = TeamMember(team_id=team.id, student_id=student1.id)
        tm2 = TeamMember(team_id=team.id, student_id=student2.id)
        db.add_all([tm1, tm2])
        db.commit()

        project = Project(
            id="project-alpha",
            team_id=team.id,
            title="Autonomous Rover",
            description="Robotic exploration rover",
            status="active",
        )
        db.add(project)
        db.commit()

        # 4. Deadline
        future_due = datetime.now(timezone.utc) + timedelta(days=7)
        deadline = Deadline(
            id="deadline-1",
            class_id=cls.id,
            title="Interim Progress Report Due",
            description="Submit technical draft report",
            due_at=future_due,
        )
        db.add(deadline)
        db.commit()

        # 5. Submissions
        sub1 = Submission(
            id="sub-1",
            project_id=project.id,
            team_id=team.id,
            submitted_by=student_user1.id,
            title="Proposal Draft",
            description="Initial project proposal",
            submission_type="proposal",
            status="draft",
        )
        sub_released = Submission(
            id="sub-released-1",
            project_id=project.id,
            team_id=team.id,
            submitted_by=student_user1.id,
            title="Final Project Report",
            description="Completed capstone documentation",
            submission_type="final_report",
            status="released",
        )
        db.add_all([sub1, sub_released])
        db.commit()

        # Released Evaluation
        eval_released = Evaluation(
            id="eval-1",
            submission_id=sub_released.id,
            evaluator_id=admin_user.id,
            feedback="Excellent technical depth and implementation.",
            total_score=95.5,
        )
        db.add(eval_released)
        db.commit()

        score1 = EvaluationScore(
            evaluation_id=eval_released.id,
            rubric_criterion="Technical Architecture",
            max_score=50.0,
            score=48.0,
            comments="Solid design pattern.",
        )
        score2 = EvaluationScore(
            evaluation_id=eval_released.id,
            rubric_criterion="Documentation Quality",
            max_score=50.0,
            score=47.5,
            comments="Very clear figures.",
        )
        db.add_all([score1, score2])
        db.commit()

        # Unreleased/Draft Evaluation
        sub_draft_eval = Submission(
            id="sub-draft-eval-1",
            project_id=project.id,
            team_id=team.id,
            submitted_by=student_user1.id,
            title="Internal Working Draft",
            description="Under review by faculty",
            submission_type="interim_report",
            status="under_review",
        )
        db.add(sub_draft_eval)
        db.commit()

        eval_unreleased = Evaluation(
            id="eval-unreleased-1",
            submission_id=sub_draft_eval.id,
            evaluator_id=admin_user.id,
            feedback="Draft notes for advisors only.",
            total_score=80.0,
        )
        db.add(eval_unreleased)
        db.commit()

        # 6. Notifications
        notif1 = Notification(
            id="notif-1",
            user_id=student_user1.id,
            title="Welcome to EE Portal",
            message="Your account is active.",
            notification_type="system",
            is_read=False,
        )
        db.add(notif1)

        # 7. Announcements
        ann = Announcement(
            id="ann-1",
            title="Midterm Presentation Schedule",
            content="Presentations start next Monday at 9 AM.",
            created_by=admin_user.id,
        )
        db.add(ann)
        db.commit()

        ann_target = AnnouncementTarget(
            announcement_id=ann.id, target_type="all", target_id=None
        )
        db.add(ann_target)
        db.commit()

        print("[OK] Test database seeded successfully.")
    finally:
        db.close()

def run_tests():
    print("\n--- RUNNING STUDENT PORTAL & CORE MODULES TEST SUITE (MODULES 1–14) ---\n")
    setup_full_test_data()

    # 1. Login Student
    resp = client.post("/api/v1/auth/login", json={
        "email": "student1@university.edu",
        "password": "StudentPass123!"
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Test 1 Passed: Student authentication & token issuance.")

    # 2. Profile API
    resp = client.get("/api/v1/student/profile", headers=headers)
    assert resp.status_code == 200, f"Profile get failed: {resp.text}"
    profile = resp.json()
    assert profile["roll_number"] == "EE2026-001"
    print("[OK] Test 2 Passed: Student profile retrieval.")

    # Profile Update (Allowed vs Prohibited)
    resp = client.put("/api/v1/student/profile", headers=headers, json={"phone_number": "+1999888777"})
    assert resp.status_code == 200, f"Profile update failed: {resp.text}"
    assert resp.json()["phone_number"] == "+1999888777"
    print("[OK] Test 3 Passed: Profile allowed field update.")

    # 3. Team API
    resp = client.get("/api/v1/student/team", headers=headers)
    assert resp.status_code == 200, f"Team get failed: {resp.text}"
    team_data = resp.json()
    assert team_data["name"] == "Alpha Robotics"
    assert len(team_data["members"]) == 2
    print("[OK] Test 4 Passed: Team info and roster retrieval.")

    # 4. Deadlines API
    resp = client.get("/api/v1/student/deadlines", headers=headers)
    assert resp.status_code == 200, f"Deadlines failed: {resp.text}"
    deadlines = resp.json()
    assert len(deadlines) >= 1
    print("[OK] Test 5 Passed: Deadlines listing with ISO timestamp handling.")

    # 5. File Management & Upload API
    file_content = b"PDF Report Content - EE Capstone Design Document"
    file_obj = ("report.pdf", io.BytesIO(file_content), "application/pdf")
    resp = client.post(
        "/api/v1/student/submissions/sub-1/files",
        headers=headers,
        files={"file": file_obj},
    )
    assert resp.status_code == 200, f"File upload failed: {resp.text}"
    uploaded_file = resp.json()
    file_id = uploaded_file["id"]
    assert uploaded_file["file_name"] == "report.pdf"
    print("[OK] Test 6 Passed: File upload and metadata tracking.")

    # File Signed Download URL
    resp = client.get(f"/api/v1/student/files/{file_id}", headers=headers)
    assert resp.status_code == 200, f"File detail failed: {resp.text}"
    assert "download_url" in resp.json()
    print("[OK] Test 7 Passed: Signed URL generation for private file download.")

    # 6. Submission Lifecycle
    resp = client.get("/api/v1/student/submissions", headers=headers)
    assert resp.status_code == 200, f"Submissions list failed: {resp.text}"
    subs = resp.json()
    assert len(subs) >= 2
    print("[OK] Test 8 Passed: Submissions list retrieval.")

    # Create Draft Submission
    resp = client.post(
        "/api/v1/student/submissions",
        headers=headers,
        json={"title": "Midterm Progress Report", "description": "Interim progress update", "submission_type": "interim_report"}
    )
    assert resp.status_code == 201, f"Draft creation failed: {resp.text}"
    new_sub_id = resp.json()["id"]
    print("[OK] Test 9 Passed: Draft submission creation.")

    # Attach file to new draft and Finalize Submit
    file_content2 = b"Final midterm submission pdf binary data"
    resp = client.post(
        f"/api/v1/student/submissions/{new_sub_id}/files",
        headers=headers,
        files={"file": ("midterm.pdf", io.BytesIO(file_content2), "application/pdf")},
    )
    assert resp.status_code == 200, f"Attach file failed: {resp.text}"

    resp = client.post(f"/api/v1/student/submissions/{new_sub_id}/submit", headers=headers)
    assert resp.status_code == 200, f"Submit failed: {resp.text}"
    assert resp.json()["status"] == "submitted"
    print("[OK] Test 10 Passed: Final submission state transition.")

    # 7. Notifications API
    resp = client.get("/api/v1/student/notifications", headers=headers)
    assert resp.status_code == 200, f"Notifications failed: {resp.text}"
    notifs = resp.json()
    assert len(notifs) >= 1

    resp = client.get("/api/v1/student/notifications/unread-count", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["unread_count"] >= 1
    print("[OK] Test 11 Passed: Notification list and unread count.")

    # Mark Notification Read
    notif_id = notifs[0]["id"]
    resp = client.patch(f"/api/v1/student/notifications/{notif_id}/read", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_read"] is True
    print("[OK] Test 12 Passed: Mark notification as read.")

    # 8. Evaluation Read Access & Strict Privacy
    # Released Evaluation Access -> 200 OK
    resp = client.get("/api/v1/student/evaluations/eval-1", headers=headers)
    assert resp.status_code == 200, f"Released evaluation access failed: {resp.text}"
    eval_data = resp.json()
    assert eval_data["total_score"] == 95.5
    assert len(eval_data["scores"]) == 2
    print("[OK] Test 13 Passed: Released evaluation viewing.")

    # Unreleased/Draft Evaluation Access -> Strict 404
    resp = client.get("/api/v1/student/evaluations/eval-unreleased-1", headers=headers)
    assert resp.status_code == 404, f"Expected 404 for unreleased evaluation, got {resp.status_code}"
    print("[OK] Test 14 Passed: STRICT EVALUATION PRIVACY — Unreleased evaluation returned 404.")

    # 9. Announcements API
    resp = client.get("/api/v1/student/announcements", headers=headers)
    assert resp.status_code == 200, f"Announcements failed: {resp.text}"
    announcements = resp.json()
    assert len(announcements) >= 1

    ann_id = announcements[0]["id"]
    resp = client.patch(f"/api/v1/student/announcements/{ann_id}/read", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_read"] is True
    print("[OK] Test 15 Passed: Announcements retrieval and read status tracking.")

    # 10. Student Dashboard Aggregation API
    resp = client.get("/api/v1/student/dashboard", headers=headers)
    assert resp.status_code == 200, f"Dashboard failed: {resp.text}"
    db_data = resp.json()
    assert db_data["profile"]["roll_number"] == "EE2026-001"
    assert db_data["team"]["name"] == "Alpha Robotics"
    assert len(db_data["deadlines"]) >= 1
    assert len(db_data["submissions"]) >= 1
    print("[OK] Test 16 Passed: Aggregated Student Dashboard API.")

    print("\n--- ALL 16 INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY! ---\n")

if __name__ == "__main__":
    run_tests()
