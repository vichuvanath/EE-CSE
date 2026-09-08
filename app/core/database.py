from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# Create SQLAlchemy Engine (PostgreSQL / Supabase driver)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Test connections before using them to prevent stale connections
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class for declarative SQLAlchemy models
class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    """
    FastAPI dependency that provides a transactional database session per request.
    Automatically closes session upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    """
    Utility function to test whether the database connection is working.
    Executes a simple SELECT 1 query against the database engine.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
