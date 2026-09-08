import apiClient from "@/lib/api-client";
import {
  SubmissionChecklist,
  MySubmissionResponse,
  FinalSubmissionResponse,
} from "@/types";

interface BackendSubmissionDetail {
  id: string;
  project_id: string;
  team_id: string;
  status: string;
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface BackendMySubmissionResponse {
  submission?: BackendSubmissionDetail | null;
  project?: any;
  checklist: SubmissionChecklist;
  files: any[];
}

function adaptMySubmission(raw: BackendMySubmissionResponse): MySubmissionResponse {
  return {
    submission_id: raw.submission?.id,
    status: raw.submission?.status || "NOT_SUBMITTED",
    submitted_at: raw.submission?.submitted_at || null,
    checklist: raw.checklist,
    files: raw.files,
    project: raw.project,
  };
}

const defaultChecklist: SubmissionChecklist = {
  abstract: { completed: false, label: "Abstract" },
  report: { completed: false, label: "Report" },
  ppt: { completed: false, label: "PPT" },
  images: { completed: false, label: "Images" },
  github: { completed: false, label: "GitHub Repository" },
  live_demo: { completed: false, label: "Live Demo" },
  completed_count: 0,
  total_count: 6,
  all_completed: false,
};

export const submissionService = {
  getChecklist: async (): Promise<SubmissionChecklist> => {
    try {
      const response = await apiClient.get<BackendMySubmissionResponse>(
        "/api/v1/student/submissions/me"
      );
      return response.data.checklist || defaultChecklist;
    } catch {
      return defaultChecklist;
    }
  },

  getMySubmission: async (): Promise<MySubmissionResponse> => {
    const response = await apiClient.get<BackendMySubmissionResponse>(
      "/api/v1/student/submissions/me"
    );
    return adaptMySubmission(response.data);
  },

  submitFinal: async (): Promise<FinalSubmissionResponse> => {
    const response = await apiClient.post<FinalSubmissionResponse>(
      "/api/v1/student/submissions/final"
    );
    return response.data;
  },

  getWeeklySubmissionHistory: async (): Promise<import("@/types").WeeklySubmissionHistoryResponse> => {
    const response = await apiClient.get<import("@/types").WeeklySubmissionHistoryResponse>(
      "/api/v1/student/submissions/history"
    );
    return response.data;
  },

  updateWeeklySubmission: async (
    weekNumber: number,
    data: Partial<import("@/types").WeeklySubmissionRecord>
  ): Promise<import("@/types").WeeklySubmissionRecord> => {
    const response = await apiClient.put<import("@/types").WeeklySubmissionRecord>(
      `/api/v1/student/submissions/week/${weekNumber}`,
      data
    );
    return response.data;
  },

  autoSubmitAndEvaluate: async (
    weekNumber: number
  ): Promise<import("@/types").WeeklySubmissionHistoryResponse> => {
    const response = await apiClient.post<import("@/types").WeeklySubmissionHistoryResponse>(
      `/api/v1/student/submissions/week/${weekNumber}/auto-submit-and-evaluate`
    );
    return response.data;
  },

  resetWeeklyHistoryDemo: async (): Promise<import("@/types").WeeklySubmissionHistoryResponse> => {
    const response = await apiClient.post<import("@/types").WeeklySubmissionHistoryResponse>(
      "/api/v1/student/submissions/reset-demo"
    );
    return response.data;
  },
};
