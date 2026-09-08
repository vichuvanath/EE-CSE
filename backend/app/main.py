from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.student_announcements import router as student_announcements_router
from app.routes.student_dashboard import router as student_dashboard_router
from app.routes.student_deadlines import router as student_deadlines_router
from app.routes.student_evaluations import router as student_evaluations_router
from app.routes.student_files import router as student_files_router
from app.routes.student_notifications import router as student_notifications_router
from app.routes.student_profile import router as student_profile_router
from app.routes.student_submissions import router as student_submissions_router
from app.routes.student_team import router as student_team_router
from app.routes.test_rbac import router as test_rbac_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Electrical Engineering Report Submission and Evaluation Portal",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    """
    Ensures all HTTP exceptions conform strictly to the standard error structure:
    {
        "error": {
            "code": "SOME_ERROR_CODE",
            "message": "Human readable message"
        }
    }
    """
    headers = getattr(exc, "headers", None)
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code, content=exc.detail, headers=headers
        )

    code = (
        "UNAUTHORIZED"
        if exc.status_code == 401
        else ("FORBIDDEN" if exc.status_code == 403 else "BAD_REQUEST")
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": str(exc.detail)}},
        headers=headers,
    )


# Configure CORS safely for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Include API Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(student_profile_router, prefix="/api/v1")
app.include_router(student_team_router, prefix="/api/v1")
app.include_router(student_deadlines_router, prefix="/api/v1")
app.include_router(student_files_router, prefix="/api/v1")
app.include_router(student_submissions_router, prefix="/api/v1")
app.include_router(student_notifications_router, prefix="/api/v1")
app.include_router(student_evaluations_router, prefix="/api/v1")
app.include_router(student_announcements_router, prefix="/api/v1")
app.include_router(student_dashboard_router, prefix="/api/v1")
app.include_router(test_rbac_router, prefix="/api/v1")


@app.get("/")
def root():
    """
    Root endpoint redirecting/pointing to API health and documentation.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "health_check": "/api/v1/health",
        "documentation": "/docs",
    }
