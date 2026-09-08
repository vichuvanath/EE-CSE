from fastapi import Depends
from app.repositories.advisor_overview_repository import AdvisorOverviewRepository

class AdvisorService:
    def __init__(self, repository: AdvisorOverviewRepository = Depends()):
        self.repository = repository

    def get_dashboard_stats(self, advisor_id: str):
        return self.repository.get_dashboard_stats(advisor_id)