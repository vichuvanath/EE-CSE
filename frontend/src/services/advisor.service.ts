import apiClient from "@/lib/api-client";
import {
  AdvisorDashboardResponse,
  AdvisorTeamSummary,
  TeamEvaluationResponse,
  TeamEvaluationRequest,
  AdvisorStudent,
  AdvisorProfile,
  AdvisorEvaluationSession,
  ProjectDetail,
  WeeklySubmissionRecord,
} from "@/types";

export const advisorService = {
  async getDashboard(): Promise<AdvisorDashboardResponse> {
    const { data } = await apiClient.get<AdvisorDashboardResponse>("/api/v1/advisors/dashboard");
    return data;
  },

  async getTeams(): Promise<AdvisorTeamSummary[]> {
    const { data } = await apiClient.get<AdvisorTeamSummary[]>("/api/v1/advisors/teams");
    return data;
  },

  async getTeamById(teamId: string): Promise<AdvisorTeamSummary> {
    const { data } = await apiClient.get<AdvisorTeamSummary>(`/api/v1/advisors/teams/${teamId}`);
    return data;
  },

  async getTeamProject(teamId: string): Promise<ProjectDetail | null> {
    const { data } = await apiClient.get<ProjectDetail | null>(`/api/v1/advisors/teams/${teamId}/project`);
    return data;
  },

  async getTeamSubmission(teamId: string): Promise<WeeklySubmissionRecord | null> {
    const { data } = await apiClient.get<WeeklySubmissionRecord | null>(`/api/v1/advisors/teams/${teamId}/submission`);
    return data;
  },

  async getTeamEvaluation(teamId: string): Promise<TeamEvaluationResponse | null> {
    const { data } = await apiClient.get<TeamEvaluationResponse | null>(`/api/v1/advisors/teams/${teamId}/evaluation`);
    return data;
  },

  async saveTeamEvaluation(
    teamId: string,
    payload: TeamEvaluationRequest
  ): Promise<TeamEvaluationResponse> {
    const { data } = await apiClient.post<TeamEvaluationResponse>(
      `/api/v1/advisors/teams/${teamId}/evaluation`,
      payload
    );
    return data;
  },

  async getStudents(): Promise<AdvisorStudent[]> {
    const { data } = await apiClient.get<AdvisorStudent[]>("/api/v1/advisors/students");
    return data;
  },

  async getStudentById(studentId: string): Promise<AdvisorStudent> {
    const { data } = await apiClient.get<AdvisorStudent>(`/api/v1/advisors/students/${studentId}`);
    return data;
  },

  async getRecords(): Promise<AdvisorEvaluationSession[]> {
    const { data } = await apiClient.get<AdvisorEvaluationSession[]>("/api/v1/advisors/records");
    return data;
  },

  async getProfile(): Promise<AdvisorProfile> {
    const { data } = await apiClient.get<AdvisorProfile>("/api/v1/advisors/profile");
    return data;
  },

  async updateProfile(profile: Partial<AdvisorProfile>): Promise<AdvisorProfile> {
    const { data } = await apiClient.put<AdvisorProfile>("/api/v1/advisors/profile", profile);
    return data;
  },

  // Submissions
  async getSubmissions(): Promise<any[]> {
    const { data } = await apiClient.get<any[]>("/api/v1/advisors/submissions");
    return data;
  },

  async getSubmissionById(submissionId: string): Promise<any> {
    const { data } = await apiClient.get<any>(`/api/v1/advisors/submissions/${submissionId}`);
    return data;
  },

  async getSubmissionFiles(submissionId: string): Promise<any[]> {
    const { data } = await apiClient.get<any[]>(`/api/v1/advisors/submissions/${submissionId}/files`);
    return data;
  },

  async getTeamSubmissions(teamId: string): Promise<any[]> {
    const { data } = await apiClient.get<any[]>(`/api/v1/advisors/teams/${teamId}/submissions`);
    return data;
  },

  async updateSubmissionStatus(
    submissionId: string,
    status: string,
    remarks?: string
  ): Promise<any> {
    const { data } = await apiClient.patch<any>(
      `/api/v1/advisors/submissions/${submissionId}/status`,
      { status, remarks }
    );
    return data;
  },

  async evaluateSubmission(
    submissionId: string,
    payload: {
      feedback: string;
      total_score: number;
      scores?: {
        rubric_criterion: string;
        max_score: number;
        score: number;
        comments?: string;
      }[];
    }
  ): Promise<any> {
    const { data } = await apiClient.post<any>(
      `/api/v1/advisors/submissions/${submissionId}/evaluate`,
      payload
    );
    return data;
  },

  // Evaluations
  async getEvaluations(): Promise<any[]> {
    const { data } = await apiClient.get<any[]>("/api/v1/advisors/evaluations");
    return data;
  },

  async createTeamEvaluation(teamId: string, payload: any): Promise<any> {
    const { data } = await apiClient.post<any>(
      `/api/v1/advisors/teams/${teamId}/evaluations`,
      payload
    );
    return data;
  },

  async getEvaluation(evaluationId: string): Promise<any> {
    const { data } = await apiClient.get<any>(`/api/v1/advisors/evaluations/${evaluationId}`);
    return data;
  },

  async updateEvaluation(evaluationId: string, payload: any): Promise<any> {
    const { data } = await apiClient.patch<any>(
      `/api/v1/advisors/evaluations/${evaluationId}`,
      payload
    );
    return data;
  },

  async submitEvaluation(evaluationId: string): Promise<any> {
    const { data } = await apiClient.post<any>(
      `/api/v1/advisors/evaluations/${evaluationId}/submit`
    );
    return data;
  },

  async updateEvaluationVisibility(evaluationId: string, visible: boolean): Promise<any> {
    const { data } = await apiClient.patch<any>(
      `/api/v1/advisors/evaluations/${evaluationId}/visibility`,
      { is_visible: visible }
    );
    return data;
  },

  async releaseEvaluation(evaluationId: string, releaseDate?: string): Promise<any> {
    const { data } = await apiClient.patch<any>(
      `/api/v1/advisors/evaluations/${evaluationId}/release`,
      { release_date: releaseDate }
    );
    return data;
  },

  async getTeamEvaluations(teamId: string): Promise<any[]> {
    const { data } = await apiClient.get<any[]>(`/api/v1/advisors/teams/${teamId}/evaluations`);
    return data;
  },

  // Classes
  async getClasses(): Promise<any[]> {
    const { data } = await apiClient.get<any[]>("/api/v1/advisors/classes");
    return data;
  },

  async createClass(payload: any): Promise<any> {
    const { data } = await apiClient.post<any>("/api/v1/advisors/classes", payload);
    return data;
  },

  async getClassDetails(classId: string): Promise<any> {
    const { data } = await apiClient.get<any>(`/api/v1/advisors/classes/${classId}`);
    return data;
  },

  async updateClass(classId: string, payload: any): Promise<any> {
    const { data } = await apiClient.patch<any>(`/api/v1/advisors/classes/${classId}`, payload);
    return data;
  },

  async deleteClass(classId: string): Promise<any> {
    const { data } = await apiClient.delete<any>(`/api/v1/advisors/classes/${classId}`);
    return data;
  },

  async getClassStudents(classId: string): Promise<any[]> {
    const { data } = await apiClient.get<any[]>(`/api/v1/advisors/classes/${classId}/students`);
    return data;
  },

  async enrollClassStudent(classId: string, payload: any): Promise<any> {
    const { data } = await apiClient.post<any>(
      `/api/v1/advisors/classes/${classId}/students`,
      payload
    );
    return data;
  },

  async removeClassStudent(classId: string, studentId: string): Promise<any> {
    const { data } = await apiClient.delete<any>(
      `/api/v1/advisors/classes/${classId}/students/${studentId}`
    );
    return data;
  },

  // Announcements
  async getAnnouncements(): Promise<any[]> {
    const { data } = await apiClient.get<any[]>("/api/v1/advisors/announcements");
    return data;
  },

  async createAnnouncement(payload: any): Promise<any> {
    const { data } = await apiClient.post<any>("/api/v1/advisors/announcements", payload);
    return data;
  },

  async editAnnouncement(announcementId: string, payload: any): Promise<any> {
    const { data } = await apiClient.patch<any>(
      `/api/v1/advisors/announcements/${announcementId}`,
      payload
    );
    return data;
  },

  async deleteAnnouncement(announcementId: string): Promise<any> {
    const { data } = await apiClient.delete<any>(
      `/api/v1/advisors/announcements/${announcementId}`
    );
    return data;
  },
};

export default advisorService;
