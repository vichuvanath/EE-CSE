import apiClient from "@/lib/api-client";
import {
  FileCategory,
  FileUploadResponse,
  MyFilesResponse,
  FileDeleteResponse,
} from "@/types";

export const fileService = {
  getMyFiles: async (): Promise<MyFilesResponse> => {
    const response = await apiClient.get<MyFilesResponse>("/api/files/me");
    return response.data;
  },

  uploadFile: async (
    category: FileCategory,
    file: File
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<FileUploadResponse>(
      `/api/files/upload/${category}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<FileDeleteResponse> => {
    const response = await apiClient.delete<FileDeleteResponse>(
      `/api/files/${fileId}`
    );
    return response.data;
  },
};
