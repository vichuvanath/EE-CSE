from datetime import datetime
from typing import Optional


class StudentEvaluation:
    def __init__(
        self,
        id: str,
        evaluation_id: str,
        student_id: str,
        project_marks: float = 0.0,
        presentation_marks: float = 0.0,
        technical_marks: float = 0.0,
        documentation_marks: float = 0.0,
        contribution_marks: float = 0.0,
        total_marks: float = 0.0,
        remarks: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.evaluation_id = evaluation_id
        self.student_id = student_id
        self.project_marks = project_marks
        self.presentation_marks = presentation_marks
        self.technical_marks = technical_marks
        self.documentation_marks = documentation_marks
        self.contribution_marks = contribution_marks
        self.total_marks = total_marks
        self.remarks = remarks
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dict(cls, data: dict) -> "StudentEvaluation":
        return cls(
            id=str(data["id"]),
            evaluation_id=str(data["evaluation_id"]),
            student_id=str(data["student_id"]),
            project_marks=float(data.get("project_marks", 0.0)),
            presentation_marks=float(data.get("presentation_marks", 0.0)),
            technical_marks=float(data.get("technical_marks", 0.0)),
            documentation_marks=float(data.get("documentation_marks", 0.0)),
            contribution_marks=float(data.get("contribution_marks", 0.0)),
            total_marks=float(data.get("total_marks", 0.0)),
            remarks=data.get("remarks"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    def model_dump(self) -> dict:
        return {
            "id": self.id,
            "evaluation_id": self.evaluation_id,
            "student_id": self.student_id,
            "project_marks": self.project_marks,
            "presentation_marks": self.presentation_marks,
            "technical_marks": self.technical_marks,
            "documentation_marks": self.documentation_marks,
            "contribution_marks": self.contribution_marks,
            "total_marks": self.total_marks,
            "remarks": self.remarks,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
