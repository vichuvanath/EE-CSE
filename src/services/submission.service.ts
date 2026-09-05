import apiClient from "@/lib/api-client";
import {
  SubmissionChecklist,
  FinalSubmissionResponse,
  MySubmissionResponse,
  ProjectUpdate,
  ProjectResponse,
} from "@/types";

export const submissionService = {
  getChecklist: async (): Promise<SubmissionChecklist> => {
    const response = await apiClient.get<SubmissionChecklist>(
      "/api/submission/checklist"
    );
    return response.data;
  },

  getMySubmission: async (): Promise<MySubmissionResponse> => {
    const response = await apiClient.get<MySubmissionResponse>(
      "/api/submission/me"
    );
    return response.data;
  },

  submitFinal: async (): Promise<FinalSubmissionResponse> => {
    const response = await apiClient.post<FinalSubmissionResponse>(
      "/api/submission/final"
    );
    return response.data;
  },

  updateSubmissionProject: async (
    data: ProjectUpdate
  ): Promise<ProjectResponse> => {
    const response = await apiClient.put<ProjectResponse>(
      "/api/submission/me",
      data
    );
    return response.data;
  },
};
