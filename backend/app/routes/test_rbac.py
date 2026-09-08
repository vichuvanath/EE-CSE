"""
TEMPORARY TEST ENDPOINTS FOR ROLE-BASED ACCESS CONTROL (RBAC) VERIFICATION
These routes are created strictly for development/testing Module 4 RBAC rules.
Do not put business logic here. To remove later, delete this file and unregister test_rbac_router in app/main.py.
"""

from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/test", tags=["RBAC Testing (Temporary)"])


@router.get("/student")
def test_student_access(current_user: User = Depends(require_role(UserRole.STUDENT, UserRole.ADMIN))):
    """
    Temporary endpoint accessible to users with 'student' or 'admin' role.
    """
    return {
        "status": "success",
        "message": f"Hello Student {current_user.full_name}! Access granted to Student role.",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@router.get("/advisor")
def test_advisor_access(current_user: User = Depends(require_role(UserRole.ADVISOR, UserRole.ADMIN))):
    """
    Temporary endpoint accessible to users with 'advisor' or 'admin' role.
    """
    return {
        "status": "success",
        "message": f"Hello Advisor {current_user.full_name}! Access granted to Advisor role.",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@router.get("/admin")
def test_admin_access(current_user: User = Depends(require_role(UserRole.ADMIN))):
    """
    Temporary endpoint accessible ONLY to users with 'admin' role.
    """
    return {
        "status": "success",
        "message": f"Hello Admin {current_user.full_name}! Access granted strictly to Admin role.",
        "user_id": current_user.id,
        "role": current_user.role,
    }
