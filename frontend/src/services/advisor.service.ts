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
    const { data } = await apiClient.get<AdvisorDashboardResponse>("/api/advisor/dashboard");
    return data;
  },

  async getTeams(): Promise<AdvisorTeamSummary[]> {
    const { data } = await apiClient.get<AdvisorTeamSummary[]>("/api/advisor/teams");
    return data;
  },

  async getTeamById(teamId: string): Promise<AdvisorTeamSummary> {
    const { data } = await apiClient.get<AdvisorTeamSummary>(`/api/advisor/teams/${teamId}`);
    return data;
  },

  async getTeamProject(teamId: string): Promise<ProjectDetail | null> {
    const { data } = await apiClient.get<ProjectDetail | null>(`/api/advisor/teams/${teamId}/project`);
    return data;
  },

  async getTeamSubmission(teamId: string): Promise<WeeklySubmissionRecord | null> {
    const { data } = await apiClient.get<WeeklySubmissionRecord | null>(`/api/advisor/teams/${teamId}/submission`);
    return data;
  },

  async getTeamEvaluation(teamId: string): Promise<TeamEvaluationResponse | null> {
    const { data } = await apiClient.get<TeamEvaluationResponse | null>(`/api/advisor/teams/${teamId}/evaluation`);
    return data;
  },

  async saveTeamEvaluation(
    teamId: string,
    payload: TeamEvaluationRequest
  ): Promise<TeamEvaluationResponse> {
    const { data } = await apiClient.post<TeamEvaluationResponse>(
      `/api/advisor/teams/${teamId}/evaluation`,
      payload
    );
    return data;
  },

  async getStudents(): Promise<AdvisorStudent[]> {
    const { data } = await apiClient.get<AdvisorStudent[]>("/api/advisor/students");
    return data;
  },

  async getStudentById(studentId: string): Promise<AdvisorStudent> {
    const { data } = await apiClient.get<AdvisorStudent>(`/api/advisor/students/${studentId}`);
    return data;
  },

  async getRecords(): Promise<AdvisorEvaluationSession[]> {
    const { data } = await apiClient.get<AdvisorEvaluationSession[]>("/api/advisor/records");
    return data;
  },

  async getProfile(): Promise<AdvisorProfile> {
    const { data } = await apiClient.get<AdvisorProfile>("/api/advisor/profile");
    return data;
  },

  async updateProfile(profile: Partial<AdvisorProfile>): Promise<AdvisorProfile> {
    const { data } = await apiClient.put<AdvisorProfile>("/api/advisor/profile", profile);
    return data;
  },
};

export default advisorService;
