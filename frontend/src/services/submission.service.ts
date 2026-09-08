import apiClient from "@/lib/api-client";
import {
  SubmissionChecklist,
  MySubmissionResponse,
  FinalSubmissionResponse,
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

  getWeeklySubmissionHistory: async (): Promise<import("@/types").WeeklySubmissionHistoryResponse> => {
    const response = await apiClient.get<import("@/types").WeeklySubmissionHistoryResponse>(
      "/api/student/submissions/history"
    );
    return response.data;
  },

  updateWeeklySubmission: async (
    weekNumber: number,
    data: Partial<import("@/types").WeeklySubmissionRecord>
  ): Promise<import("@/types").WeeklySubmissionRecord> => {
    const response = await apiClient.put<import("@/types").WeeklySubmissionRecord>(
      `/api/student/submissions/week/${weekNumber}`,
      data
    );
    return response.data;
  },

  autoSubmitAndEvaluate: async (
    weekNumber: number
  ): Promise<import("@/types").WeeklySubmissionHistoryResponse> => {
    const response = await apiClient.post<import("@/types").WeeklySubmissionHistoryResponse>(
      `/api/student/submissions/week/${weekNumber}/auto-submit-and-evaluate`
    );
    return response.data;
  },

  resetWeeklyHistoryDemo: async (): Promise<import("@/types").WeeklySubmissionHistoryResponse> => {
    const response = await apiClient.post<import("@/types").WeeklySubmissionHistoryResponse>(
      "/api/student/submissions/reset-demo"
    );
    return response.data;
  },
};
