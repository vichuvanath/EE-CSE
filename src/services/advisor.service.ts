import apiClient from "@/lib/api-client";
import {
  AdvisorProfile,
  AdvisorProfileUpdate,
  AdvisorDashboardResponse,
  AdvisorTeamSummary,
  AdvisorStudent,
  AdvisorSearchResponse,
  SubmissionCompleteness,
  SubmissionReviewRequest,
  SubmissionReviewResponse,
  DocumentReviewRequest,
  DocumentReviewResponse,
  FileDownloadResponse,
  TeamEvaluationRequest,
  TeamEvaluationResponse,
  StudentEvaluationRequest,
  StudentEvaluationResponse,
  EvaluationStatusResponse,
  DeadlineRequest,
  DeadlineResponse,
  NotificationResponse,
  NotificationListResponse,
  UnreadNotificationCountResponse,
  FileMetadata,
} from "@/types";

export const advisorService = {
  // 3.1 Profile
  getProfile: async (): Promise<AdvisorProfile> => {
    const res = await apiClient.get<AdvisorProfile>("/api/advisor/profile");
    return res.data;
  },

  updateProfile: async (
    data: AdvisorProfileUpdate
  ): Promise<AdvisorProfile> => {
    const res = await apiClient.put<AdvisorProfile>(
      "/api/advisor/profile",
      data
    );
    return res.data;
  },

  // 3.2 Dashboard & Search
  getDashboard: async (): Promise<AdvisorDashboardResponse> => {
    const res = await apiClient.get<AdvisorDashboardResponse>(
      "/api/advisor/dashboard"
    );
    return res.data;
  },

  getEvaluationsOverview: async (): Promise<any> => {
    const res = await apiClient.get("/api/advisor/evaluations/overview");
    return res.data;
  },

  search: async (params?: {
    q?: string;
    type?: string;
    status?: string;
  }): Promise<AdvisorSearchResponse> => {
    const res = await apiClient.get<AdvisorSearchResponse>(
      "/api/advisor/search",
      { params }
    );
    return res.data;
  },

  // 3.3 Teams
  getTeams: async (): Promise<AdvisorTeamSummary[]> => {
    const res = await apiClient.get<AdvisorTeamSummary[]>("/api/advisor/teams");
    return res.data;
  },

  getTeamDetails: async (teamId: string): Promise<any> => {
    const res = await apiClient.get(`/api/advisor/teams/${teamId}`);
    return res.data;
  },

  getTeamProject: async (teamId: string): Promise<any> => {
    const res = await apiClient.get(`/api/advisor/teams/${teamId}/project`);
    return res.data;
  },

  getTeamSubmission: async (teamId: string): Promise<any> => {
    const res = await apiClient.get(`/api/advisor/teams/${teamId}/submission`);
    return res.data;
  },

  // 3.4 Students
  getStudents: async (): Promise<AdvisorStudent[]> => {
    const res = await apiClient.get<AdvisorStudent[]>("/api/advisor/students");
    return res.data;
  },

  getStudentDetails: async (studentId: string): Promise<any> => {
    const res = await apiClient.get(`/api/advisor/students/${studentId}`);
    return res.data;
  },

  // 3.5 Submissions & Review Workflow
  getSubmissions: async (): Promise<any[]> => {
    const res = await apiClient.get("/api/advisor/submissions");
    return res.data;
  },

  getSubmissionById: async (submissionId: string): Promise<any> => {
    const res = await apiClient.get(`/api/advisor/submissions/${submissionId}`);
    return res.data;
  },

  getSubmissionCompleteness: async (
    submissionId: string
  ): Promise<SubmissionCompleteness> => {
    const res = await apiClient.get<SubmissionCompleteness>(
      `/api/advisor/submissions/${submissionId}/completeness`
    );
    return res.data;
  },

  getSubmissionFiles: async (
    submissionId: string
  ): Promise<FileMetadata[]> => {
    const res = await apiClient.get(
      `/api/advisor/submissions/${submissionId}/files`
    );
    return res.data;
  },

  getSubmissionReview: async (
    submissionId: string
  ): Promise<SubmissionReviewResponse> => {
    const res = await apiClient.get<SubmissionReviewResponse>(
      `/api/advisor/submissions/${submissionId}/review`
    );
    return res.data;
  },

  saveSubmissionReview: async (
    submissionId: string,
    data: SubmissionReviewRequest
  ): Promise<SubmissionReviewResponse> => {
    const res = await apiClient.post<SubmissionReviewResponse>(
      `/api/advisor/submissions/${submissionId}/review`,
      data
    );
    return res.data;
  },

  // 3.6 Documents Review & Downloads
  getFileDownloadUrl: async (
    fileId: string
  ): Promise<FileDownloadResponse> => {
    const res = await apiClient.get<FileDownloadResponse>(
      `/api/advisor/files/${fileId}/download`
    );
    return res.data;
  },

  getDocumentReview: async (
    fileId: string
  ): Promise<DocumentReviewResponse> => {
    const res = await apiClient.get<DocumentReviewResponse>(
      `/api/advisor/files/${fileId}/review`
    );
    return res.data;
  },

  saveDocumentReview: async (
    fileId: string,
    data: DocumentReviewRequest
  ): Promise<DocumentReviewResponse> => {
    const res = await apiClient.post<DocumentReviewResponse>(
      `/api/advisor/files/${fileId}/review`,
      data
    );
    return res.data;
  },

  // 3.7 Evaluations
  getTeamEvaluation: async (
    teamId: string
  ): Promise<TeamEvaluationResponse> => {
    const res = await apiClient.get<TeamEvaluationResponse>(
      `/api/advisor/teams/${teamId}/evaluation`
    );
    return res.data;
  },

  saveTeamEvaluation: async (
    teamId: string,
    data: TeamEvaluationRequest
  ): Promise<TeamEvaluationResponse> => {
    const res = await apiClient.post<TeamEvaluationResponse>(
      `/api/advisor/teams/${teamId}/evaluation`,
      data
    );
    return res.data;
  },

  getStudentEvaluationsForTeam: async (
    teamId: string
  ): Promise<StudentEvaluationResponse[]> => {
    const res = await apiClient.get<StudentEvaluationResponse[]>(
      `/api/advisor/teams/${teamId}/students/evaluations`
    );
    return res.data;
  },

  saveStudentEvaluation: async (
    teamId: string,
    studentId: string,
    data: StudentEvaluationRequest
  ): Promise<StudentEvaluationResponse> => {
    const res = await apiClient.post<StudentEvaluationResponse>(
      `/api/advisor/teams/${teamId}/students/${studentId}/evaluation`,
      data
    );
    return res.data;
  },

  getStudentEvaluationById: async (
    id: string
  ): Promise<StudentEvaluationResponse> => {
    const res = await apiClient.get<StudentEvaluationResponse>(
      `/api/advisor/student-evaluations/${id}`
    );
    return res.data;
  },

  submitEvaluation: async (
    evaluationId: string
  ): Promise<TeamEvaluationResponse> => {
    const res = await apiClient.post<TeamEvaluationResponse>(
      `/api/advisor/evaluations/${evaluationId}/submit`
    );
    return res.data;
  },

  lockEvaluation: async (
    evaluationId: string
  ): Promise<TeamEvaluationResponse> => {
    const res = await apiClient.post<TeamEvaluationResponse>(
      `/api/advisor/evaluations/${evaluationId}/lock`
    );
    return res.data;
  },

  getEvaluationStatus: async (
    evaluationId: string
  ): Promise<EvaluationStatusResponse> => {
    const res = await apiClient.get<EvaluationStatusResponse>(
      `/api/advisor/evaluations/${evaluationId}/status`
    );
    return res.data;
  },

  // 3.8 Deadlines
  getDeadlines: async (): Promise<DeadlineResponse[]> => {
    const res = await apiClient.get<DeadlineResponse[]>(
      "/api/advisor/deadlines"
    );
    return res.data;
  },

  getTeamDeadline: async (teamId: string): Promise<DeadlineResponse> => {
    const res = await apiClient.get<DeadlineResponse>(
      `/api/advisor/teams/${teamId}/deadline`
    );
    return res.data;
  },

  setTeamDeadline: async (
    teamId: string,
    data: DeadlineRequest
  ): Promise<DeadlineResponse> => {
    const res = await apiClient.post<DeadlineResponse>(
      `/api/advisor/teams/${teamId}/deadline`,
      data
    );
    return res.data;
  },

  // 3.9 Notifications
  getNotifications: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<NotificationListResponse> => {
    const res = await apiClient.get<NotificationListResponse>(
      "/api/advisor/notifications",
      { params }
    );
    return res.data;
  },

  getUnreadNotificationsCount: async (): Promise<UnreadNotificationCountResponse> => {
    const res = await apiClient.get<UnreadNotificationCountResponse>(
      "/api/advisor/notifications/unread"
    );
    return res.data;
  },

  markNotificationRead: async (
    notificationId: string
  ): Promise<NotificationResponse> => {
    const res = await apiClient.patch<NotificationResponse>(
      `/api/advisor/notifications/${notificationId}/read`
    );
    return res.data;
  },

  markAllNotificationsRead: async (): Promise<{ message: string }> => {
    const res = await apiClient.patch<{ message: string }>(
      "/api/advisor/notifications/read-all"
    );
    return res.data;
  },
};
