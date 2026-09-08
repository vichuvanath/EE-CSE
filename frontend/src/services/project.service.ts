import apiClient from "@/lib/api-client";
import { ProjectResponse, ProjectUpdate } from "@/types";

export const projectService = {
  getProject: async (): Promise<ProjectResponse> => {
    const response = await apiClient.get<ProjectResponse>("/api/project/me");
    return response.data;
  },

  updateProject: async (data: ProjectUpdate): Promise<ProjectResponse> => {
    const response = await apiClient.put<ProjectResponse>(
      "/api/project/me",
      data
    );
    return response.data;
  },
};
