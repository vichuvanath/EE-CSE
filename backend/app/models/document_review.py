from datetime import datetime
from typing import Optional


class DocumentReview:
    def __init__(
        self,
        id: str,
        file_id: str,
        advisor_id: str,
        status: str = "PENDING",
        remarks: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.file_id = file_id
        self.advisor_id = advisor_id
        self.status = status
        self.remarks = remarks
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "DocumentReview":
        return cls(
            id=str(data["id"]),
            file_id=str(data["file_id"]),
            advisor_id=str(data["advisor_id"]),
            status=data.get("status", "PENDING"),
            remarks=data.get("remarks"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    def model_dump(self) -> dict:
        return {
            "id": self.id,
            "file_id": self.file_id,
            "advisor_id": self.advisor_id,
            "status": self.status,
            "remarks": self.remarks,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
