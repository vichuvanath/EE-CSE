import apiClient from "@/lib/api-client";
import { ProjectResponse, ProjectUpdate } from "@/types";

export const projectService = {
  getProject: async (): Promise<ProjectResponse> => {
    const response = await apiClient.get<ProjectResponse>("/api/v1/student/project");
    return response.data;
  },

  updateProject: async (data: ProjectUpdate): Promise<ProjectResponse> => {
    const response = await apiClient.put<ProjectResponse>(
      "/api/v1/student/project",
      data
    );
    return response.data;
  },
};
