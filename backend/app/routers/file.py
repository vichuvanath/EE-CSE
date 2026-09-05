from fastapi import APIRouter, Depends, UploadFile, File
from app.schemas.file import FileUploadResponse, MyFilesResponse, FileDeleteResponse
from app.services.file_service import upload_student_file, get_my_files, delete_student_file
from app.dependencies.auth import require_student

router = APIRouter(prefix="/files", tags=["File Uploads"])


@router.post(
    "/upload/{category}",
    response_model=FileUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload Project Document or Image",
    description="Uploads a file for category (ABSTRACT, REPORT, PPT, IMAGE). Validates MIME type, extension, and file size.",
)

async def upload_file(
    category: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_student),
):
    return await upload_student_file(current_user["id"], category, file)


@router.get(
    "/me",
    response_model=MyFilesResponse,
    summary="Get Authenticated Team's Uploaded Files",
    description="Returns metadata of all files uploaded by the authenticated student's team.",
)
def get_my_uploaded_files(current_user: dict = Depends(require_student)):
    return get_my_files(current_user["id"])


@router.delete(
    "/{file_id}",
    response_model=FileDeleteResponse,
    summary="Delete Uploaded File",
    description="Deletes a file owned by the authenticated student's team from Storage and metadata database.",
)
def delete_file(
    file_id: str,
    current_user: dict = Depends(require_student),
):
    return delete_student_file(current_user["id"], file_id)
