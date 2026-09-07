from fastapi import APIRouter, HTTPException, status
from app.core.database import check_database_connection

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", status_code=status.HTTP_200_OK)
def health_check():
    """
    Basic health check endpoint to verify backend service status.
    """
    return {"status": "ok"}


@router.get("/database", status_code=status.HTTP_200_OK)
def database_health_check():
    """
    Database health check endpoint to verify PostgreSQL/database connectivity.
    """
    is_connected = check_database_connection()
    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "error",
                "database": "disconnected",
                "message": "Database connection failed",
            },
        )
    return {
        "status": "ok",
        "database": "connected",
    }
