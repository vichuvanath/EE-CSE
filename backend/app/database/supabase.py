from app.core.supabase import get_supabase_client, get_supabase_admin_client

# Aliases for backward compatibility with existing services/dependencies
get_supabase = get_supabase_client
get_supabase_service = get_supabase_admin_client

__all__ = [
    "get_supabase_client",
    "get_supabase_admin_client",
    "get_supabase",
    "get_supabase_service",
]

