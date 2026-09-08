from typing import Optional
from supabase import Client, create_client
from app.core.config import settings


def is_supabase_configured() -> bool:
    """
    Returns True if valid Supabase URL and ANON key are provided in configuration.
    """
    url = settings.SUPABASE_URL.strip()
    key = settings.SUPABASE_ANON_KEY.strip()
    if not url or not key:
        return False
    if "your-supabase-project" in url or "your-supabase-anon-key" in key:
        return False
    return True


_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase Python Client instance.
    Returns None if Supabase credentials are not configured.
    """
    global _supabase_client
    if not is_supabase_configured():
        return None

    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY
        )
    return _supabase_client
