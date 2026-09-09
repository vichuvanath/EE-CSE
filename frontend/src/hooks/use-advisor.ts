import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import advisorService from "@/services/advisor.service";
import { TeamEvaluationRequest, AdvisorProfile } from "@/types";
import { toast } from "sonner";

export const advisorQueryKeys = {
  dashboard: ["advisor", "dashboard"] as const,
  teams: ["advisor", "teams"] as const,
  team: (id: string) => ["advisor", "team", id] as const,
  teamProject: (id: string) => ["advisor", "team", id, "project"] as const,
  teamSubmission: (id: string) => ["advisor", "team", id, "submission"] as const,
  teamEvaluation: (id: string) => ["advisor", "team", id, "evaluation"] as const,
  students: ["advisor", "students"] as const,
  student: (id: string) => ["advisor", "student", id] as const,
  records: ["advisor", "records"] as const,
  profile: ["advisor", "profile"] as const,
};

export function useAdvisorDashboard() {
  return useQuery({
    queryKey: advisorQueryKeys.dashboard,
    queryFn: () => advisorService.getDashboard(),
  });
}

export function useAdvisorTeams() {
  return useQuery({
    queryKey: advisorQueryKeys.teams,
    queryFn: async () => {
      const result = await advisorService.getTeams();
      return Array.isArray(result) ? result : [];
    },
  });
}

export function useAdvisorTeam(teamId: string) {
  return useQuery({
    queryKey: advisorQueryKeys.team(teamId),
    queryFn: () => advisorService.getTeamById(teamId),
    enabled: Boolean(teamId),
  });
}

export function useAdvisorTeamProject(teamId: string) {
  return useQuery({
    queryKey: advisorQueryKeys.teamProject(teamId),
    queryFn: () => advisorService.getTeamProject(teamId),
    enabled: Boolean(teamId),
  });
}

export function useAdvisorTeamSubmission(teamId: string) {
  return useQuery({
    queryKey: advisorQueryKeys.teamSubmission(teamId),
    queryFn: () => advisorService.getTeamSubmission(teamId),
    enabled: Boolean(teamId),
  });
}

export function useAdvisorTeamEvaluation(teamId: string) {
  return useQuery({
    queryKey: advisorQueryKeys.teamEvaluation(teamId),
    queryFn: () => advisorService.getTeamEvaluation(teamId),
    enabled: Boolean(teamId),
  });
}

export function useSaveTeamEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: TeamEvaluationRequest }) =>
      advisorService.saveTeamEvaluation(teamId, payload),
    onSuccess: (_, variables) => {
      toast.success("Team Evaluation Saved", {
        description: "Evaluation scores and remarks recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.teams });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.team(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.teamEvaluation(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.records });
    },
    onError: (err: any) => {
      toast.error("Evaluation Save Failed", {
        description: err?.message || "Failed to commit evaluation marks.",
      });
    },
  });
}

export function useAdvisorStudents() {
  return useQuery({
    queryKey: advisorQueryKeys.students,
    queryFn: () => advisorService.getStudents(),
  });
}

export function useAdvisorStudent(studentId: string) {
  return useQuery({
    queryKey: advisorQueryKeys.student(studentId),
    queryFn: () => advisorService.getStudentById(studentId),
    enabled: Boolean(studentId),
  });
}

export function useAdvisorRecords() {
  return useQuery({
    queryKey: advisorQueryKeys.records,
    queryFn: () => advisorService.getRecords(),
  });
}

export function useAdvisorProfile() {
  return useQuery({
    queryKey: advisorQueryKeys.profile,
    queryFn: () => advisorService.getProfile(),
  });
}

export function useUpdateAdvisorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: Partial<AdvisorProfile>) => advisorService.updateProfile(profile),
    onSuccess: () => {
      toast.success("Profile Updated", {
        description: "Advisor profile credentials updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.profile });
    },
    onError: (err: any) => {
      toast.error("Update Failed", {
        description: err?.message || "Could not update advisor profile.",
      });
    },
  });
}

export function useAdvisorTeamSubmissions(teamId: string) {
  return useQuery({
    queryKey: ["advisor", "team", teamId, "submissions"] as const,
    queryFn: () => advisorService.getTeamSubmissions(teamId),
    enabled: Boolean(teamId),
  });
}

export function useEvaluateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: {
        feedback: string;
        total_score: number;
        scores?: {
          rubric_criterion: string;
          max_score: number;
          score: number;
          comments?: string;
        }[];
      };
    }) => advisorService.evaluateSubmission(submissionId, payload),
    onSuccess: (_, variables) => {
      toast.success("Evaluation Saved", {
        description: "Submission evaluation has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.teams });
      queryClient.invalidateQueries({ queryKey: advisorQueryKeys.records });
      // Invalidate all team-related queries
      queryClient.invalidateQueries({ queryKey: ["advisor", "team"] });
    },
    onError: (err: any) => {
      toast.error("Evaluation Failed", {
        description: err?.message || "Failed to save submission evaluation.",
      });
    },
  });
}

