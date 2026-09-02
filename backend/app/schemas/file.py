from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict

FileCategoryType = Literal["ABSTRACT", "REPORT", "PPT", "IMAGE"]


class FileMetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    team_id: str
    category: str
    original_filename: str
    storage_path: str
    mime_type: str
    file_size: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FileUploadResponse(BaseModel):
    message: str
    file: FileMetadataResponse


class MyFilesResponse(BaseModel):
    files: List[FileMetadataResponse]
    count: int


class FileDeleteResponse(BaseModel):
    message: str
    file_id: str
