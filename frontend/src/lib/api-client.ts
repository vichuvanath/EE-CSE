import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  mockStudentProfile,
  mockTeam,
  mockProject,
  mockFiles,
  mockChecklist,
  mockSubmission,
  mockStudentUser,
  mockAdvisorUser,
  mockWeeklySubmissionHistory,
  mockAdvisorProfile,
  mockAdvisorTeams,
  mockAdvisorDashboard,
  mockAdvisorStudents,
  mockEvaluationSessions,
} from "./mock-fallback";
import {
  FileMetadata,
  MyFilesResponse,
  SubmissionChecklist,
  AdvisorTeamSummary,
  TeamEvaluationResponse,
  TeamEvaluationRequest,
  AdvisorProfile,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

let isBackendOffline = false;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 1500,
});

// Request interceptor: attach token & fast-fail if known offline
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isBackendOffline) {
      config.timeout = 60; // Immediately fallback to mock data without waiting
    }
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
  (response) => {
    isBackendOffline = false;
    return response;
  },
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

    // Isolated fallback: If backend server is unreachable
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNABORTED" ||
      (error.response?.status !== undefined && error.response.status >= 400 && error.response.status !== 401);

    if (isNetworkError && error.config?.url) {
      isBackendOffline = true;
      const url = error.config.url;
      const method = error.config.method?.toUpperCase() || "GET";

      // 1. Auth endpoints
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
      if (url.includes("/api/auth/logout")) {
        return Promise.resolve({ data: { message: "Logged out successfully" } } as any);
      }

      // 2. Student Profile endpoints
      if (url.includes("/api/student/profile")) {
        if (method === "PUT" && error.config.data) {
          const body = typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data;
          const current = typeof window !== "undefined" && localStorage.getItem("siet_student_profile")
            ? JSON.parse(localStorage.getItem("siet_student_profile")!)
            : mockStudentProfile;
          const updated = { ...current, ...body };
          if (typeof window !== "undefined") {
            localStorage.setItem("siet_student_profile", JSON.stringify(updated));
            // also update siet_user full_name
            const u = localStorage.getItem("siet_user");
            if (u) {
              const parsedU = JSON.parse(u);
              parsedU.full_name = updated.full_name;
              localStorage.setItem("siet_user", JSON.stringify(parsedU));
            }
          }
          return Promise.resolve({ data: updated } as any);
        }
        const stored = typeof window !== "undefined" ? localStorage.getItem("siet_student_profile") : null;
        if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        return Promise.resolve({ data: mockStudentProfile } as any);
      }

      // 3. Team me endpoint
      if (url.includes("/api/team/me")) {
        return Promise.resolve({ data: mockTeam } as any);
      }

      // 4. Project endpoints
      if (url.includes("/api/project/me")) {
        if (method === "PUT" && error.config.data) {
          const body = typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data;
          const current = typeof window !== "undefined" && localStorage.getItem("siet_student_project")
            ? JSON.parse(localStorage.getItem("siet_student_project")!)
            : mockProject;
          const updated = { ...current, ...body };
          if (typeof window !== "undefined") {
            localStorage.setItem("siet_student_project", JSON.stringify(updated));
          }
          return Promise.resolve({ data: updated } as any);
        }
        const stored = typeof window !== "undefined" ? localStorage.getItem("siet_student_project") : null;
        if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        return Promise.resolve({ data: mockProject } as any);
      }

      // 5. Files endpoints
      if (url.includes("/api/files/upload/")) {
        const categoryMatch = url.match(/\/api\/files\/upload\/([A-Za-z0-9_]+)/);
        const category = (categoryMatch ? categoryMatch[1] : "ABSTRACT") as any;
        const newFile: FileMetadata = {
          id: `file-uuid-${Date.now()}`,
          project_id: "proj-uuid-demo-001",
          team_id: "team-uuid-alpha-001",
          category,
          original_filename: `Upload_${category}_${new Date().toISOString().slice(0, 10)}.pdf`,
          storage_path: `teams/team-alpha/${category.toLowerCase()}_${Date.now()}.pdf`,
          mime_type: category === "PPT" ? "application/vnd.ms-powerpoint" : (category === "IMAGE" ? "image/png" : "application/pdf"),
          file_size: 2450000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const currentFiles: MyFilesResponse = typeof window !== "undefined" && localStorage.getItem("siet_student_files")
          ? JSON.parse(localStorage.getItem("siet_student_files")!)
          : mockFiles;
        
        currentFiles.files.push(newFile);
        currentFiles.count = currentFiles.files.length;
        if (typeof window !== "undefined") {
          localStorage.setItem("siet_student_files", JSON.stringify(currentFiles));
        }

        return Promise.resolve({
          data: {
            id: newFile.id,
            original_filename: newFile.original_filename,
            category: newFile.category,
            file_size: newFile.file_size,
            mime_type: newFile.mime_type,
            storage_path: newFile.storage_path,
            created_at: newFile.created_at,
          }
        } as any);
      }

      const fileDeleteMatch = url.match(/\/api\/files\/([^/]+)$/);
      if (method === "DELETE" && fileDeleteMatch) {
        const fileId = fileDeleteMatch[1];
        const currentFiles: MyFilesResponse = typeof window !== "undefined" && localStorage.getItem("siet_student_files")
          ? JSON.parse(localStorage.getItem("siet_student_files")!)
          : mockFiles;

        currentFiles.files = currentFiles.files.filter(f => f.id !== fileId);
        currentFiles.count = currentFiles.files.length;
        if (typeof window !== "undefined") {
          localStorage.setItem("siet_student_files", JSON.stringify(currentFiles));
        }
        return Promise.resolve({ data: { message: "File removed successfully", file_id: fileId } } as any);
      }

      if (url.includes("/api/files/me")) {
        const stored = typeof window !== "undefined" ? localStorage.getItem("siet_student_files") : null;
        if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        return Promise.resolve({ data: mockFiles } as any);
      }

      // 6. Submission endpoints
      if (url.includes("/api/submission/checklist")) {
        const currentFiles: MyFilesResponse = typeof window !== "undefined" && localStorage.getItem("siet_student_files")
          ? JSON.parse(localStorage.getItem("siet_student_files")!)
          : mockFiles;
        const currentProj = typeof window !== "undefined" && localStorage.getItem("siet_student_project")
          ? JSON.parse(localStorage.getItem("siet_student_project")!)
          : mockProject;

        const hasAbstract = currentFiles.files.some(f => f.category === "ABSTRACT");
        const hasReport = currentFiles.files.some(f => f.category === "REPORT");
        const hasPpt = currentFiles.files.some(f => f.category === "PPT");
        const hasImages = currentFiles.files.some(f => f.category === "IMAGE");
        const hasGithub = Boolean(currentProj.github_url && currentProj.github_url.trim().length > 0);
        const hasLiveDemo = Boolean(currentProj.live_demo_url && currentProj.live_demo_url.trim().length > 0);

        const items = [hasAbstract, hasReport, hasPpt, hasImages, hasGithub, hasLiveDemo];
        const completedCount = items.filter(Boolean).length;

        const computedChecklist: SubmissionChecklist = {
          abstract: { completed: hasAbstract, label: "Abstract Document (PDF)" },
          report: { completed: hasReport, label: "Comprehensive Project Report (PDF)" },
          ppt: { completed: hasPpt, label: "Presentation Slide Deck (PPT)" },
          images: { completed: hasImages, label: "Project Architecture & Screenshots" },
          github: { completed: hasGithub, label: "GitHub Repository VCS Link" },
          live_demo: { completed: hasLiveDemo, label: "Live Deployment / Video URL" },
          completed_count: completedCount,
          total_count: 6,
          all_completed: completedCount === 6,
        };

        return Promise.resolve({ data: computedChecklist } as any);
      }

      if (url.includes("/api/submission/me")) {
        const stored = typeof window !== "undefined" ? localStorage.getItem("siet_student_submission") : null;
        if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        return Promise.resolve({ data: mockSubmission } as any);
      }

      if (url.includes("/api/submission/final")) {
        const finalSub = {
          submission_id: "sub-uuid-demo-001",
          status: "SUBMITTED",
          submitted_at: new Date().toISOString(),
          message: "Final project submission received and locked successfully.",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("siet_student_submission", JSON.stringify(finalSub));
        }
        return Promise.resolve({ data: finalSub } as any);
      }

      // 6. Weekly Submission History endpoints
      if (
        url.includes("/api/student/submissions/history") ||
        url.includes("/api/submission/history")
      ) {
        const stored = typeof window !== "undefined" ? localStorage.getItem("siet_weekly_submission_history") : null;
        if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        if (typeof window !== "undefined") {
          localStorage.setItem("siet_weekly_submission_history", JSON.stringify(mockWeeklySubmissionHistory));
        }
        return Promise.resolve({ data: mockWeeklySubmissionHistory } as any);
      }

      if (url.includes("/auto-submit-and-evaluate")) {
        const storedStr = typeof window !== "undefined" ? localStorage.getItem("siet_weekly_submission_history") : null;
        const currentData: import("@/types").WeeklySubmissionHistoryResponse = storedStr
          ? JSON.parse(storedStr)
          : JSON.parse(JSON.stringify(mockWeeklySubmissionHistory));

        if (currentData.current_week) {
          const evaluatedWeek: import("@/types").WeeklySubmissionRecord = {
            ...currentData.current_week,
            is_current_week: false,
            is_locked: true,
            auto_submitted: true,
            is_evaluated: true,
            status: "APPROVED",
            marks_awarded: 93,
            max_marks: 100,
            grade: "A+",
            evaluated_by: "Dr. K. Senthil Kumar, M.E., Ph.D.",
            evaluated_at: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            guide_remarks:
              "Auto-submitted on milestone deadline. Phase I Jetson edge deployment benchmarks verified on hardware. High FPS inference with FP16 precision successfully attained. Excellent work.",
            criteria_scores: {
              "Edge Hardware Optimization": { score: 19, max: 20 },
              "TensorRT Batch Inference": { score: 19, max: 20 },
              "IEEE Milestone Documentation": { score: 18, max: 20 },
              "Latency & FAR Testing": { score: 18, max: 20 },
              "PRC Oral Defense": { score: 19, max: 20 },
            },
            timeline: [
              ...currentData.current_week.timeline,
              {
                title: "Auto-Submitted at Deadline",
                timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "done",
                description: "Submission window closed. Automated freeze and handover to advisor.",
              },
              {
                title: "Advisor Evaluation Completed",
                timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "done",
                description: "Marks: 93/100 (Grade A+) awarded with rubric assessment.",
              },
            ],
          };

          // Insert into evaluated submissions history at the beginning or by week number
          const remainingSubmissions = currentData.submissions.filter(s => s.id !== evaluatedWeek.id);
          currentData.submissions = [evaluatedWeek, ...remainingSubmissions].sort((a, b) => a.week_number - b.week_number);
          currentData.current_week = undefined;
          currentData.summary.approved_count += 1;
          currentData.summary.pending_count = 0;
          currentData.summary.current_progress_percentage = 85;

          if (typeof window !== "undefined") {
            localStorage.setItem("siet_weekly_submission_history", JSON.stringify(currentData));
          }
        }

        return Promise.resolve({ data: currentData } as any);
      }

      if (url.includes("/api/student/submissions/week/") && method === "PUT") {
        const storedStr = typeof window !== "undefined" ? localStorage.getItem("siet_weekly_submission_history") : null;
        const currentData: import("@/types").WeeklySubmissionHistoryResponse = storedStr
          ? JSON.parse(storedStr)
          : JSON.parse(JSON.stringify(mockWeeklySubmissionHistory));

        const body = typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data;
        if (currentData.current_week) {
          currentData.current_week = {
            ...currentData.current_week,
            ...body,
            submission_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("siet_weekly_submission_history", JSON.stringify(currentData));
          }
          return Promise.resolve({ data: currentData.current_week } as any);
        }
      }

      if (url.includes("/api/student/submissions/reset-demo")) {
        if (typeof window !== "undefined") {
          localStorage.setItem("siet_weekly_submission_history", JSON.stringify(mockWeeklySubmissionHistory));
        }
        return Promise.resolve({ data: mockWeeklySubmissionHistory } as any);
      }

      // ==========================================
      // 7. Faculty / Advisor Portal Endpoints
      // ==========================================

      // Helper to normalize and retrieve current teams state
      const normalizeTeam = (t: any): AdvisorTeamSummary => {
        const teamId = t.id || t.team_id || "team-uuid-alpha-001";
        const leader = t.members?.[0];
        const score =
          t.marks_awarded ??
          t.evaluation_score ??
          t.evaluation?.team_score ??
          (t.evaluation_status === "EVALUATED" || t.evaluation_status === "COMPLETED" ? 92 : undefined);
        let grade = t.grade;
        if (!grade && score !== undefined) {
          if (score >= 90) grade = "A+";
          else if (score >= 80) grade = "A";
          else if (score >= 70) grade = "B+";
          else if (score >= 60) grade = "B";
          else grade = "C";
        }
        return {
          ...t,
          id: teamId,
          team_id: teamId,
          leader_name: t.leader_name || leader?.full_name || "Rahul Sharma",
          leader_roll: t.leader_roll || leader?.roll_number || "23CS001",
          marks_awarded: score,
          evaluation_score: score,
          grade: grade || (score ? "A" : undefined),
          evaluated_by: t.evaluated_by || t.evaluation?.evaluated_by || "Dr. K. Senthil Kumar, M.E., Ph.D.",
          evaluated_at: t.evaluated_at || t.evaluation?.evaluated_at || "29 Aug 2026, 03:30 PM",
          evaluation_remarks:
            t.evaluation_remarks ||
            t.evaluation?.team_remarks ||
            "Demonstrated commendable progress on deliverables.",
        };
      };

      const getAdvisorTeams = (): AdvisorTeamSummary[] => {
        let list = mockAdvisorTeams;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("siet_advisor_teams");
          if (stored) {
            try {
              list = JSON.parse(stored);
            } catch (e) {}
          } else {
            localStorage.setItem("siet_advisor_teams", JSON.stringify(mockAdvisorTeams));
          }
        }
        return list.map(normalizeTeam);
      };

      // 7.1 Advisor Dashboard
      if (url.includes("/api/advisor/dashboard")) {
        const teams = getAdvisorTeams();
        const evaluated = teams.filter(
          (t) => t.evaluation_status === "COMPLETED" || t.evaluation_status === "EVALUATED"
        );
        const pending = teams.filter(
          (t) => t.evaluation_status !== "COMPLETED" && t.evaluation_status !== "EVALUATED"
        );
        const totalMarks = evaluated.reduce((acc, t) => acc + (t.marks_awarded || 0), 0);
        const avgScore = evaluated.length > 0 ? Math.round(totalMarks / evaluated.length) : 89;

        const dynamicDashboard = {
          ...mockAdvisorDashboard,
          total_teams: teams.length,
          total_students: mockAdvisorStudents.length || 20,
          submitted_count: teams.filter((t) => t.submission_status === "SUBMITTED" || t.submission_status === "APPROVED").length,
          evaluated_count: evaluated.length,
          pending_submissions: pending.length,
          pending_evaluations: pending.length,
          metrics: {
            assigned_teams: teams.length,
            evaluated_teams: evaluated.length,
            pending_reviews: pending.length,
            average_score: avgScore,
          },
          recent_submissions: teams.map((t) => ({
            team_id: t.id || t.team_id,
            team_name: t.name,
            project_title: t.project_title,
            submitted_at: t.submission_date || "22 Aug 2026, 08:22 AM",
            status: t.submission_status,
            evaluation_status: t.evaluation_status,
            marks: t.marks_awarded,
            guide: t.guide,
          })),
        };

        return Promise.resolve({ data: dynamicDashboard } as any);
      }

      // 7.2 Advisor Teams List
      if (
        url.endsWith("/api/advisor/teams") ||
        url.includes("/api/advisor/teams?") ||
        url.endsWith("/api/advisor/teams/")
      ) {
        const teams = getAdvisorTeams();
        return Promise.resolve({ data: teams } as any);
      }

      // 7.3 Save Team Evaluation (POST)
      const evalPostMatch = url.match(/\/api\/advisor\/teams\/([^/?#]+)\/evaluation/);
      if (method === "POST" && evalPostMatch) {
        const teamId = evalPostMatch[1];
        const body: TeamEvaluationRequest =
          typeof error.config.data === "string"
            ? JSON.parse(error.config.data)
            : error.config.data;

        const scores = body.scores || {
          problem_formulation: 0,
          methodology_design: 0,
          implementation_progress: 0,
          presentation_defense: 0,
          report_documentation: 0,
        };

        const totalScore =
          (scores.problem_formulation || 0) +
          (scores.methodology_design || 0) +
          (scores.implementation_progress || 0) +
          (scores.presentation_defense || 0) +
          (scores.report_documentation || 0);

        let grade = "C";
        if (totalScore >= 90) grade = "A+";
        else if (totalScore >= 80) grade = "A";
        else if (totalScore >= 70) grade = "B+";
        else if (totalScore >= 60) grade = "B";

        const evalResponse: TeamEvaluationResponse = {
          team_id: teamId,
          scores,
          total_score: totalScore,
          max_score: 100,
          grade,
          verdict: body.verdict,
          remarks: body.remarks,
          evaluated_by: "Dr. K. Senthil Kumar, M.E., Ph.D.",
          evaluated_at: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          milestone_title: "Review 3: Final System Integration & Model Validation",
          submission_week: 3,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(`siet_team_eval_${teamId}`, JSON.stringify(evalResponse));

          // Update teams state
          const currentTeams = getAdvisorTeams();
          const teamIdx = currentTeams.findIndex((t) => t.id === teamId || t.team_id === teamId);
          if (teamIdx >= 0) {
            currentTeams[teamIdx].evaluation_status = "COMPLETED";
            currentTeams[teamIdx].marks_awarded = totalScore;
            currentTeams[teamIdx].evaluation_score = totalScore;
            currentTeams[teamIdx].grade = grade;
            currentTeams[teamIdx].evaluated_at = evalResponse.evaluated_at;
            currentTeams[teamIdx].evaluated_by = evalResponse.evaluated_by;
            currentTeams[teamIdx].evaluation_remarks = body.remarks;
            currentTeams[teamIdx].submission_status =
              body.verdict === "APPROVED"
                ? "APPROVED"
                : body.verdict === "REVISION_REQUIRED"
                ? "NEEDS_REVISION"
                : "REJECTED";
            localStorage.setItem("siet_advisor_teams", JSON.stringify(currentTeams));
          }
        }

        return Promise.resolve({ data: evalResponse } as any);
      }

      // 7.4 Get Team Evaluation (GET)
      const evalGetMatch = url.match(/\/api\/advisor\/teams\/([^/?#]+)\/evaluation/);
      if (method === "GET" && evalGetMatch) {
        const teamId = evalGetMatch[1];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`siet_team_eval_${teamId}`);
          if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        }

        const teams = getAdvisorTeams();
        const team = teams.find((t) => t.id === teamId || t.team_id === teamId);
        if (team && (team.marks_awarded !== undefined || team.evaluation_score !== undefined)) {
          const score = team.marks_awarded || team.evaluation_score || 90;
          const baselineEval: TeamEvaluationResponse = {
            team_id: teamId,
            scores: {
              problem_formulation: Math.round(score * 0.2),
              methodology_design: Math.round(score * 0.2),
              implementation_progress: Math.round(score * 0.2),
              presentation_defense: Math.round(score * 0.2),
              report_documentation: score - 4 * Math.round(score * 0.2),
            },
            total_score: score,
            max_score: 100,
            grade: team.grade || "A",
            verdict: team.submission_status === "APPROVED" ? "APPROVED" : "REVISION_REQUIRED",
            remarks: team.evaluation_remarks || "Demonstrated commendable progress on deliverables.",
            evaluated_by: team.evaluated_by || "Dr. K. Senthil Kumar, M.E., Ph.D.",
            evaluated_at: team.evaluated_at || "22 Aug 2026, 01:10 PM",
            milestone_title: "Review 2: Data Preprocessing & Core Model Implementation",
            submission_week: 2,
          };
          return Promise.resolve({ data: baselineEval } as any);
        }

        return Promise.resolve({ data: null } as any);
      }

      // 7.5 Get Team Submission Details
      const teamSubMatch = url.match(/\/api\/advisor\/teams\/([^/?#]+)\/submission/);
      if (teamSubMatch) {
        const teamId = teamSubMatch[1];
        const teams = getAdvisorTeams();
        const team = teams.find((t) => t.id === teamId || t.team_id === teamId);
        if (team && team.submission_detail) {
          return Promise.resolve({ data: team.submission_detail } as any);
        }
        return Promise.resolve({ data: mockSubmission } as any);
      }

      // 7.6 Get Team Project Details
      const teamProjMatch = url.match(/\/api\/advisor\/teams\/([^/?#]+)\/project/);
      if (teamProjMatch) {
        const teamId = teamProjMatch[1];
        const teams = getAdvisorTeams();
        const team = teams.find((t) => t.id === teamId || t.team_id === teamId);
        if (team && team.project) {
          return Promise.resolve({ data: team.project } as any);
        }
        return Promise.resolve({ data: mockProject } as any);
      }

      // 7.7 Get Single Team
      const teamDetailMatch = url.match(/\/api\/advisor\/teams\/([^/?#]+)/);
      if (
        teamDetailMatch &&
        !url.includes("/evaluation") &&
        !url.includes("/submission") &&
        !url.includes("/project")
      ) {
        const teamId = teamDetailMatch[1];
        const teams = getAdvisorTeams();
        const team = teams.find((t) => t.id === teamId || t.team_id === teamId);
        if (team) return Promise.resolve({ data: team } as any);
        return Promise.resolve({ data: teams[0] } as any);
      }

      // 7.8 Get Single Student
      const studentDetailMatch = url.match(/\/api\/advisor\/students\/([^/?#]+)/);
      if (studentDetailMatch) {
        const studentId = studentDetailMatch[1];
        const student = mockAdvisorStudents.find(
          (s) => s.id === studentId || s.roll_number.toLowerCase() === studentId.toLowerCase()
        );
        if (student) return Promise.resolve({ data: student } as any);
        return Promise.resolve({ data: mockAdvisorStudents[0] } as any);
      }

      // 7.9 Get Students Roster
      if (url.includes("/api/advisor/students")) {
        return Promise.resolve({ data: mockAdvisorStudents } as any);
      }

      // 7.10 Get Evaluation Records / Sessions
      if (url.includes("/api/advisor/records") || url.includes("/api/advisor/sessions")) {
        return Promise.resolve({ data: mockEvaluationSessions } as any);
      }

      // 7.11 Advisor Profile
      if (url.includes("/api/advisor/profile")) {
        if (method === "PUT") {
          const body =
            typeof error.config.data === "string"
              ? JSON.parse(error.config.data)
              : error.config.data;
          const currentProfile =
            typeof window !== "undefined" && localStorage.getItem("siet_advisor_profile")
              ? JSON.parse(localStorage.getItem("siet_advisor_profile")!)
              : mockAdvisorProfile;
          const updatedProfile = { ...currentProfile, ...body };
          if (typeof window !== "undefined") {
            localStorage.setItem("siet_advisor_profile", JSON.stringify(updatedProfile));
          }
          return Promise.resolve({ data: updatedProfile } as any);
        }
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("siet_advisor_profile");
          if (stored) return Promise.resolve({ data: JSON.parse(stored) } as any);
        }
        return Promise.resolve({ data: mockAdvisorProfile } as any);
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
