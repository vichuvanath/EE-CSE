from typing import Optional, Dict, Any
from app.repositories.advisor_overview_repository import (
    get_advisor_dashboard_stats,
    search_advisor_records,
    get_advisor_evaluations_overview,
)


def get_dashboard_overview_service(advisor_id: str) -> Dict[str, Any]:
    return get_advisor_dashboard_stats(advisor_id)


def search_records_service(
    advisor_id: str,
    q: Optional[str] = None,
    search_type: Optional[str] = None,
    status: Optional[str] = None,
    batch: Optional[str] = None,
    section: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    safe_page = max(1, page)
    safe_size = max(1, min(100, page_size))
    return search_advisor_records(
        advisor_id=advisor_id,
        query=q,
        search_type=search_type,
        status_filter=status,
        batch_filter=batch,
        section_filter=section,
        page=safe_page,
        page_size=safe_size,
    )


def get_evaluations_overview_service(advisor_id: str) -> Dict[str, Any]:
    return get_advisor_evaluations_overview(advisor_id)
