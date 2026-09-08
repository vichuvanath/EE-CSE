import apiClient from "@/lib/api-client";
import {
  FileCategory,
  FileUploadResponse,
  MyFilesResponse,
  FileDeleteResponse,
  FileMetadata,
} from "@/types";

export const fileService = {
  getMyFiles: async (): Promise<MyFilesResponse> => {
    const response = await apiClient.get<MyFilesResponse>("/api/v1/student/files");
    return response.data;
  },

  uploadFile: async (
    category: FileCategory,
    file: File
  ): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<FileUploadResponse>(
      `/api/v1/student/files/upload/${category}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const data = response.data;
    if (data.file) {
      return data.file;
    }
    return {
      id: data.id || "",
      original_filename: data.original_filename || file.name,
      category: data.category || category,
      file_size: data.file_size || file.size,
      mime_type: data.mime_type || file.type,
      storage_path: data.storage_path || "",
      created_at: data.created_at || new Date().toISOString(),
    };
  },

  deleteFile: async (fileId: string): Promise<FileDeleteResponse> => {
    const response = await apiClient.delete<FileDeleteResponse>(
      `/api/v1/student/files/${fileId}`
    );
    return response.data;
  },
};
