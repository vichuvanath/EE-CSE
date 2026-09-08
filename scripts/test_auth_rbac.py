import os
import sys
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
    poolclass=StaticPool
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

def setup_test_users():
    """Seeds test users for student, advisor, and admin roles in the test database."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        # Delete existing test users if any
        db.query(User).filter(User.email.in_([
            "student_test@example.com",
            "advisor_test@example.com",
            "admin_test@example.com"
        ])).delete(synchronize_session=False)
        db.commit()

        # Create Student user
        student = User(
            email="student_test@example.com",
            password_hash=hash_password("StudentPass123!"),
            full_name="Alice Student",
            role=UserRole.STUDENT,
            is_active=True
        )
        # Create Advisor user
        advisor = User(
            email="advisor_test@example.com",
            password_hash=hash_password("AdvisorPass123!"),
            full_name="Dr. Bob Advisor",
            role=UserRole.ADVISOR,
            is_active=True
        )
        # Create Admin user
        admin = User(
            email="admin_test@example.com",
            password_hash=hash_password("AdminPass123!"),
            full_name="Carol Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add_all([student, advisor, admin])
        db.commit()
        print("[OK] Test users seeded successfully.")
    finally:
        db.close()

def run_tests():
    print("\n--- STARTING MODULE 3 & MODULE 4 AUTH & RBAC VERIFICATION ---\n")
    setup_test_users()

    # 1. Successful Login (Student)
    resp = client.post("/api/v1/auth/login", json={
        "email": "student_test@example.com",
        "password": "StudentPass123!"
    })
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    student_data = resp.json()
    student_token = student_data["access_token"]
    student_refresh = student_data["refresh_token"]
    assert student_data["user"]["role"] == "student"
    print("[OK] Test 1 Passed: Successful student login.")

    # 2. Invalid Login
    resp = client.post("/api/v1/auth/login", json={
        "email": "student_test@example.com",
        "password": "WrongPassword!"
    })
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    assert resp.json()["error"]["code"] == "INVALID_CREDENTIALS"
    print("[OK] Test 2 Passed: Invalid login returned 401 Unauthorized.")

    # 3. GET /api/v1/auth/me without token -> 401
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"
    print("[OK] Test 3 Passed: /auth/me without token returned 401 Unauthorized.")

    # 4. GET /api/v1/auth/me with valid token -> success
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    assert resp.json()["email"] == "student_test@example.com"
    assert resp.json()["role"] == "student"
    print("[OK] Test 4 Passed: /auth/me with valid token returned profile.")

    # 5. Invalid / Expired Token -> 401
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token_12345"})
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"
    print("[OK] Test 5 Passed: Invalid token returned 401 Unauthorized.")

    # Login Advisor & Admin for RBAC testing
    advisor_token = client.post("/api/v1/auth/login", json={
        "email": "advisor_test@example.com",
        "password": "AdvisorPass123!"
    }).json()["access_token"]

    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin_test@example.com",
        "password": "AdminPass123!"
    }).json()["access_token"]

    # 6. Role-protected endpoint using student role
    resp = client.get("/api/v1/test/student", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("[OK] Test 6 Passed: Student role accessed student test endpoint.")

    # 7. Student attempting admin-protected endpoint -> 403 Forbidden
    resp = client.get("/api/v1/test/admin", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    assert resp.json()["error"]["code"] == "FORBIDDEN"
    print("[OK] Test 7 Passed: Student accessing admin endpoint returned 403 Forbidden.")

    # 8. Advisor attempting admin-protected endpoint -> 403 Forbidden
    resp = client.get("/api/v1/test/admin", headers={"Authorization": f"Bearer {advisor_token}"})
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    assert resp.json()["error"]["code"] == "FORBIDDEN"
    print("[OK] Test 8 Passed: Advisor accessing admin endpoint returned 403 Forbidden.")

    # 9. Admin accessing admin-protected endpoint -> 200 Success
    resp = client.get("/api/v1/test/admin", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("[OK] Test 9 Passed: Admin role accessed admin test endpoint.")

    # 10. Logout
    resp = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert resp.json()["message"] == "Successfully logged out"
    print("[OK] Test 10 Passed: Logout endpoint returned success.")

    # 11. Token Refresh
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": student_refresh})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert "access_token" in resp.json()
    print("[OK] Test 11 Passed: Token refresh issued new access token.")

    # 12. Forgot Password Flow
    resp = client.post("/api/v1/auth/forgot-password", json={"email": "student_test@example.com"})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert "If the email is registered" in resp.json()["message"]
    print("[OK] Test 12 Passed: Forgot password flow returned generic success response.")

    # 13. Reset Password Flow
    resp = client.post("/api/v1/auth/reset-password", json={
        "access_token": student_token,
        "new_password": "NewStudentPass456!"
    })
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert resp.json()["message"] == "Password has been reset successfully."

    # Verify login with new password
    resp = client.post("/api/v1/auth/login", json={
        "email": "student_test@example.com",
        "password": "NewStudentPass456!"
    })
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("[OK] Test 13 Passed: Password reset and re-login with new password verified.")

    print("\n--- ALL 13 TEST CASES PASSED SUCCESSFULLY! ---\n")

if __name__ == "__main__":
    run_tests()
