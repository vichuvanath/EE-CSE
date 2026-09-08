import os
import re
import uuid
from typing import Optional
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.core.supabase import get_supabase_client


class StorageService:
    """
    Service for validating, uploading, generating signed URLs, and deleting submission files in Supabase Storage.
    """

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Removes unsafe characters and path traversal indicators from raw filenames.
        """
        basename = os.path.basename(filename)
        sanitized = re.sub(r"[^a-zA-Z0-9_.-]", "_", basename)
        return sanitized or "submission_file.pdf"

    @classmethod
    def validate_file(cls, file: UploadFile, content_bytes: bytes) -> None:
        """
        Validates uploaded file size and extension.
        Raises 413 Payload Too Large if size exceeds max MB limit.
        Raises 400 Bad Request if file extension is not allowed.
        """
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(content_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail={
                    "error": {
                        "code": "FILE_TOO_LARGE",
                        "message": f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB",
                    }
                },
            )

        filename = file.filename or "file.pdf"
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "INVALID_FILE_TYPE",
                        "message": (
                            f"File extension '.{ext}' is not allowed. "
                            f"Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
                        ),
                    }
                },
            )

    @classmethod
    def generate_storage_path(cls, submission_id: str, filename: str) -> str:
        """
        Generates a non-colliding, safe storage path inside the storage bucket.
        Structure: submissions/{submission_id}/{uuid4()}_{sanitized_filename}
        """
        safe_name = cls.sanitize_filename(filename)
        file_uuid = str(uuid.uuid4())
        return f"submissions/{submission_id}/{file_uuid}_{safe_name}"

    @classmethod
    def upload_file(cls, file_bytes: bytes, storage_path: str, mime_type: str) -> str:
        """
        Uploads binary file to Supabase Storage bucket.
        Returns the storage path upon success.
        """
        supabase = get_supabase_client()
        if supabase:
            try:
                supabase.storage.from_(settings.STORAGE_BUCKET).upload(
                    file=file_bytes,
                    path=storage_path,
                    file_options={"content-type": mime_type, "x-upsert": "true"},
                )
            except Exception as e:
                # Raise internal server error if upload fails
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        "error": {
                            "code": "STORAGE_UPLOAD_ERROR",
                            "message": f"Failed to upload file to storage: {str(e)}",
                        }
                    },
                )
        return storage_path

    @classmethod
    def get_signed_url(cls, storage_path: str, expires_in: int = 3600) -> str:
        """
        Generates a temporary signed download URL for private files in Supabase Storage.
        """
        supabase = get_supabase_client()
        if supabase:
            try:
                res = supabase.storage.from_(settings.STORAGE_BUCKET).create_signed_url(
                    path=storage_path, expires_in=expires_in
                )
                if isinstance(res, dict) and "signedURL" in res:
                    return res["signedURL"]
                elif hasattr(res, "signed_url"):
                    return res.signed_url
            except Exception:
                pass
        # Return fallback URL format if offline / test mode
        return f"/api/v1/student/files/download-placeholder?path={storage_path}"

    @classmethod
    def delete_file(cls, storage_path: str) -> bool:
        """
        Deletes a file object from Supabase Storage bucket.
        """
        supabase = get_supabase_client()
        if supabase:
            try:
                supabase.storage.from_(settings.STORAGE_BUCKET).remove([storage_path])
                return True
            except Exception:
                return False
        return True
