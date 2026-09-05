import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  mockStudentProfile,
  mockTeam,
  mockProject,
  mockFiles,
  mockChecklist,
  mockSubmission,
  mockAdvisorDashboard,
  mockAdvisorTeams,
  mockAdvisorStudents,
  mockCompleteness,
  mockTeamEvaluation,
  mockDeadlines,
  mockNotifications,
  mockStudentUser,
  mockAdvisorUser,
} from "./mock-fallback";

// Environment variable is single source of truth; falls back to 127.0.0.1:8000
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("siet_access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 & isolated demo fallback if backend is offline
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | { msg?: string }[] }>) => {
    // If it's an explicit 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/login")) {
          localStorage.removeItem("siet_access_token");
          localStorage.removeItem("siet_user");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    // Isolated fallback: If backend server is unreachable (e.g. offline during demo preview)
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNREFUSED";

    if (isNetworkError && error.config?.url) {
      const url = error.config.url;
      const method = error.config.method?.toUpperCase() || "GET";

      // Match endpoints and serve realistic demo fallback
      if (url.includes("/api/auth/student-login")) {
        return Promise.resolve({ data: mockStudentUser } as any);
      }
      if (url.includes("/api/auth/advisor-login") || url.includes("/api/auth/advisor/login")) {
        return Promise.resolve({ data: mockAdvisorUser } as any);
      }
      if (url.includes("/api/auth/me")) {
        const stored = typeof window !== "undefined" ? localStorage.getItem("siet_user") : null;
        if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        return Promise.resolve({ data: mockStudentUser.user } as any);
      }
      if (url.includes("/api/student/profile")) {
        if (method === "PUT" && error.config.data) {
          const body = typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data;
          return Promise.resolve({ data: { ...mockStudentProfile, ...body } } as any);
        }
        return Promise.resolve({ data: mockStudentProfile } as any);
      }
      if (url.includes("/api/team/me")) {
        return Promise.resolve({ data: mockTeam } as any);
      }
      if (url.includes("/api/project/me")) {
        if (method === "PUT" && error.config.data) {
          const body = typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data;
          return Promise.resolve({ data: { ...mockProject, ...body } } as any);
        }
        return Promise.resolve({ data: mockProject } as any);
      }
      if (url.includes("/api/files/me")) {
        return Promise.resolve({ data: mockFiles } as any);
      }
      if (url.includes("/api/submission/checklist")) {
        return Promise.resolve({ data: mockChecklist } as any);
      }
      if (url.includes("/api/submission/me")) {
        return Promise.resolve({ data: mockSubmission } as any);
      }
      if (url.includes("/api/submission/final")) {
        return Promise.resolve({
          data: {
            submission_id: "sub-uuid-demo-001",
            status: "SUBMITTED",
            submitted_at: new Date().toISOString(),
            message: "Final submission received successfully (Demo Fallback)",
          },
        } as any);
      }
      if (url.includes("/api/advisor/dashboard")) {
        return Promise.resolve({ data: mockAdvisorDashboard } as any);
      }

      // Check if it's team evaluation endpoint: /api/advisor/teams/{teamId}/evaluation
      if (url.includes("/api/advisor/teams/") && url.includes("/evaluation")) {
        const teamIdMatch = url.match(/\/api\/advisor\/teams\/([^/]+)\/evaluation/);
        const teamId = teamIdMatch ? teamIdMatch[1] : "team-uuid-alpha-001";

        if (method === "POST" && error.config.data) {
          const body = typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data;
          const updatedEval = {
            id: `eval-uuid-${teamId}`,
            evaluation_id: `eval-uuid-${teamId}`,
            team_id: teamId,
            team_score: body.team_score,
            team_remarks: body.team_remarks,
            status: body.status || "EVALUATED",
            strengths: body.strengths,
            areas_for_improvement: body.areas_for_improvement,
            recommendation_status: body.recommendation_status,
            criteria_scores: body.criteria_scores,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };

          if (typeof window !== "undefined") {
            localStorage.setItem(`siet_team_eval_${teamId}`, JSON.stringify(updatedEval));
          }

          // Update memory array too
          const targetTeam = mockAdvisorTeams.find(t => t.team_id === teamId || t.id === teamId);
          if (targetTeam) {
            targetTeam.evaluation_status = body.status || "EVALUATED";
            targetTeam.evaluation = updatedEval;
          }

          return Promise.resolve({ data: updatedEval } as any);
        }

        // GET team evaluation
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`siet_team_eval_${teamId}`);
          if (stored) {
            return Promise.resolve({ data: JSON.parse(stored) } as any);
          }
        }
        const targetTeam = mockAdvisorTeams.find(t => t.team_id === teamId || t.id === teamId);
        if (targetTeam?.evaluation) {
          return Promise.resolve({ data: targetTeam.evaluation } as any);
        }
        return Promise.resolve({
          data: {
            id: `eval-pending-${teamId}`,
            team_id: teamId,
            status: "PENDING",
            team_score: null,
            team_remarks: null,
          }
        } as any);
      }

      if (url.includes("/api/advisor/teams/") && url.includes("/project")) {
        const teamIdMatch = url.match(/\/api\/advisor\/teams\/([^/]+)\/project/);
        const teamId = teamIdMatch ? teamIdMatch[1] : "team-uuid-alpha-001";
        const targetTeam = mockAdvisorTeams.find(t => t.team_id === teamId || t.id === teamId);
        return Promise.resolve({
          data: {
            ...mockProject,
            team_id: teamId,
            title: targetTeam?.project_title || mockProject.title,
          }
        } as any);
      }

      if (url.includes("/api/advisor/teams/") && url.includes("/submission")) {
        const teamIdMatch = url.match(/\/api\/advisor\/teams\/([^/]+)\/submission/);
        const teamId = teamIdMatch ? teamIdMatch[1] : "team-uuid-alpha-001";
        const targetTeam = mockAdvisorTeams.find(t => t.team_id === teamId || t.id === teamId);
        return Promise.resolve({
          data: {
            ...mockSubmission,
            submission_id: `sub-uuid-${teamId}`,
            status: targetTeam?.submission_status || "SUBMITTED",
            submitted_at: targetTeam?.submitted_at || mockSubmission.submitted_at,
          }
        } as any);
      }

      if (url.includes("/api/advisor/teams/") && url.includes("/students/evaluations")) {
        return Promise.resolve({
          data: mockAdvisorStudents.map((s) => ({
            id: s.id,
            student_id: s.id,
            team_id: "team-uuid-alpha-001",
            project_marks: 19,
            presentation_marks: 19,
            technical_marks: 18,
            documentation_marks: 19,
            contribution_marks: 18,
            total_marks: s.total_marks || 93,
            remarks: "Commendable technical contribution.",
          })),
        } as any);
      }

      // Check single team details: /api/advisor/teams/{teamId}
      const singleTeamMatch = url.match(/\/api\/advisor\/teams\/([^/?]+)(?:\?.*)?$/);
      if (singleTeamMatch) {
        const teamId = singleTeamMatch[1];
        let targetTeam = mockAdvisorTeams.find(t => t.team_id === teamId || t.id === teamId);
        if (!targetTeam) {
          targetTeam = mockAdvisorTeams[0];
        }

        if (typeof window !== "undefined") {
          const storedEval = localStorage.getItem(`siet_team_eval_${teamId}`);
          if (storedEval) {
            const parsed = JSON.parse(storedEval);
            targetTeam.evaluation_status = parsed.status || "EVALUATED";
            targetTeam.evaluation = parsed;
          }
        }

        return Promise.resolve({
          data: {
            ...targetTeam,
            members: targetTeam.members || [],
            member_count: targetTeam.members?.length || targetTeam.member_count || 4,
          }
        } as any);
      }

      // All assigned teams: /api/advisor/teams
      if (url.includes("/api/advisor/teams")) {
        if (typeof window !== "undefined") {
          mockAdvisorTeams.forEach((t) => {
            const stored = localStorage.getItem(`siet_team_eval_${t.team_id}`);
            if (stored) {
              const parsed = JSON.parse(stored);
              t.evaluation_status = parsed.status || "EVALUATED";
              t.evaluation = parsed;
            }
          });
        }
        return Promise.resolve({ data: mockAdvisorTeams } as any);
      }
      if (url.includes("/api/advisor/students/")) {
        return Promise.resolve({ data: mockAdvisorStudents[0] } as any);
      }
      if (url.includes("/api/advisor/students")) {
        return Promise.resolve({ data: mockAdvisorStudents } as any);
      }
      if (url.includes("/api/advisor/submissions/") && url.includes("/completeness")) {
        return Promise.resolve({ data: mockCompleteness } as any);
      }
      if (url.includes("/api/advisor/submissions/") && url.includes("/files")) {
        return Promise.resolve({ data: mockFiles.files } as any);
      }
      if (url.includes("/api/advisor/submissions/") && url.includes("/review")) {
        return Promise.resolve({
          data: {
            submission_id: "sub-uuid-demo-001",
            status: "APPROVED",
            remarks: "Project documentation meets all requirements.",
          },
        } as any);
      }
      if (url.includes("/api/advisor/submissions")) {
        return Promise.resolve({
          data: mockAdvisorDashboard.recent_submissions.map((s) => ({
            id: s.submission_id,
            submission_id: s.submission_id,
            team_name: s.team_name,
            project_title: s.project_title,
            submitted_at: s.submitted_at,
            status: s.status,
          })),
        } as any);
      }
      if (url.includes("/api/advisor/deadlines")) {
        return Promise.resolve({ data: mockDeadlines } as any);
      }
      if (url.includes("/api/advisor/notifications/unread")) {
        return Promise.resolve({ data: { unread_count: 1 } } as any);
      }
      if (url.includes("/api/advisor/notifications")) {
        return Promise.resolve({ data: { notifications: mockNotifications, total: 3 } } as any);
      }
      if (url.includes("/api/advisor/profile")) {
        return Promise.resolve({
          data: {
            id: "advisor-uuid-demo-001",
            full_name: "Dr. K. Senthil Kumar, M.E., Ph.D.",
            email: "senthilkumar.cse@siet.ac.in",
            role: "advisor",
          },
        } as any);
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please check backend connection.";
}

export default apiClient;
