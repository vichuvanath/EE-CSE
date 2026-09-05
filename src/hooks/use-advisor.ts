"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { advisorService } from "@/services/advisor.service";
import { useAuthStore } from "@/stores/auth-store";
import {
  AdvisorProfileUpdate,
  DeadlineRequest,
  DocumentReviewRequest,
  StudentEvaluationRequest,
  SubmissionReviewRequest,
  TeamEvaluationRequest,
} from "@/types";

export function useAdvisorProfile() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["advisor", "profile"],
    queryFn: () => advisorService.getProfile(),
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: (data: AdvisorProfileUpdate) =>
      advisorService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["advisor", "profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return {
    ...profileQuery,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useAdvisorDashboard() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["advisor", "dashboard"],
    queryFn: () => advisorService.getDashboard(),
    enabled: isAuthenticated,
  });
}

export function useAdvisorTeams() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["advisor", "teams"],
    queryFn: () => advisorService.getTeams(),
    enabled: isAuthenticated,
  });
}

export function useAdvisorTeamDetails(teamId: string) {
  const { isAuthenticated } = useAuthStore();
  const teamQuery = useQuery({
    queryKey: ["advisor", "teams", teamId],
    queryFn: () => advisorService.getTeamDetails(teamId),
    enabled: isAuthenticated && Boolean(teamId),
  });

  const projectQuery = useQuery({
    queryKey: ["advisor", "teams", teamId, "project"],
    queryFn: () => advisorService.getTeamProject(teamId),
    enabled: isAuthenticated && Boolean(teamId),
  });

  const submissionQuery = useQuery({
    queryKey: ["advisor", "teams", teamId, "submission"],
    queryFn: () => advisorService.getTeamSubmission(teamId),
    enabled: isAuthenticated && Boolean(teamId),
  });

  return {
    team: teamQuery.data,
    isLoadingTeam: teamQuery.isLoading,
    teamError: teamQuery.error,
    project: projectQuery.data,
    isLoadingProject: projectQuery.isLoading,
    submission: submissionQuery.data,
    isLoadingSubmission: submissionQuery.isLoading,
  };
}

export function useAdvisorStudents() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["advisor", "students"],
    queryFn: () => advisorService.getStudents(),
    enabled: isAuthenticated,
  });
}

export function useAdvisorStudentDetails(studentId: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["advisor", "students", studentId],
    queryFn: () => advisorService.getStudentDetails(studentId),
    enabled: isAuthenticated && Boolean(studentId),
  });
}

export function useAdvisorSubmissions() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["advisor", "submissions"],
    queryFn: () => advisorService.getSubmissions(),
    enabled: isAuthenticated,
  });
}

export function useAdvisorSubmissionDetails(submissionId: string) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ["advisor", "submissions", submissionId],
    queryFn: () => advisorService.getSubmissionById(submissionId),
    enabled: isAuthenticated && Boolean(submissionId),
  });

  const completenessQuery = useQuery({
    queryKey: ["advisor", "submissions", submissionId, "completeness"],
    queryFn: () => advisorService.getSubmissionCompleteness(submissionId),
    enabled: isAuthenticated && Boolean(submissionId),
  });

  const filesQuery = useQuery({
    queryKey: ["advisor", "submissions", submissionId, "files"],
    queryFn: () => advisorService.getSubmissionFiles(submissionId),
    enabled: isAuthenticated && Boolean(submissionId),
  });

  const reviewQuery = useQuery({
    queryKey: ["advisor", "submissions", submissionId, "review"],
    queryFn: () => advisorService.getSubmissionReview(submissionId),
    enabled: isAuthenticated && Boolean(submissionId),
  });

  const saveReviewMutation = useMutation({
    mutationFn: (data: SubmissionReviewRequest) =>
      advisorService.saveSubmissionReview(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["advisor", "submissions", submissionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["advisor", "submissions"],
      });
    },
  });

  return {
    submission: detailsQuery.data,
    isLoading: detailsQuery.isLoading,
    completeness: completenessQuery.data,
    files: filesQuery.data,
    review: reviewQuery.data,
    saveReview: saveReviewMutation.mutateAsync,
    isSavingReview: saveReviewMutation.isPending,
  };
}

export function useAdvisorEvaluations(teamId?: string) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: ["advisor", "evaluations", "overview"],
    queryFn: () => advisorService.getEvaluationsOverview(),
    enabled: isAuthenticated,
  });

  const teamEvaluationQuery = useQuery({
    queryKey: ["advisor", "teams", teamId, "evaluation"],
    queryFn: () => advisorService.getTeamEvaluation(teamId!),
    enabled: isAuthenticated && Boolean(teamId),
  });

  const studentEvaluationsQuery = useQuery({
    queryKey: ["advisor", "teams", teamId, "students", "evaluations"],
    queryFn: () => advisorService.getStudentEvaluationsForTeam(teamId!),
    enabled: isAuthenticated && Boolean(teamId),
  });

  const saveTeamEvaluationMutation = useMutation({
    mutationFn: (data: TeamEvaluationRequest) =>
      advisorService.saveTeamEvaluation(teamId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["advisor", "teams", teamId, "evaluation"],
      });
      queryClient.invalidateQueries({
        queryKey: ["advisor", "evaluations", "overview"],
      });
    },
  });

  const saveStudentEvaluationMutation = useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: StudentEvaluationRequest;
    }) => advisorService.saveStudentEvaluation(teamId!, studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["advisor", "teams", teamId, "students", "evaluations"],
      });
    },
  });

  return {
    overview: overviewQuery.data,
    isLoadingOverview: overviewQuery.isLoading,
    teamEvaluation: teamEvaluationQuery.data,
    isLoadingTeamEvaluation: teamEvaluationQuery.isLoading,
    studentEvaluations: studentEvaluationsQuery.data,
    isLoadingStudentEvaluations: studentEvaluationsQuery.isLoading,
    saveTeamEvaluation: saveTeamEvaluationMutation.mutateAsync,
    isSavingTeamEvaluation: saveTeamEvaluationMutation.isPending,
    saveStudentEvaluation: saveStudentEvaluationMutation.mutateAsync,
    isSavingStudentEvaluation: saveStudentEvaluationMutation.isPending,
  };
}

export function useAdvisorDeadlines() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const deadlinesQuery = useQuery({
    queryKey: ["advisor", "deadlines"],
    queryFn: () => advisorService.getDeadlines(),
    enabled: isAuthenticated,
  });

  const setDeadlineMutation = useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: DeadlineRequest;
    }) => advisorService.setTeamDeadline(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", "deadlines"] });
    },
  });

  return {
    deadlines: deadlinesQuery.data,
    isLoading: deadlinesQuery.isLoading,
    error: deadlinesQuery.error,
    refetch: deadlinesQuery.refetch,
    setDeadline: setDeadlineMutation.mutateAsync,
    isSettingDeadline: setDeadlineMutation.isPending,
  };
}

export function useAdvisorNotifications() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["advisor", "notifications"],
    queryFn: () => advisorService.getNotifications(),
    enabled: isAuthenticated,
  });

  const unreadCountQuery = useQuery({
    queryKey: ["advisor", "notifications", "unread"],
    queryFn: () => advisorService.getUnreadNotificationsCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => advisorService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", "notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => advisorService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", "notifications"] });
    },
  });

  return {
    notifications: notificationsQuery.data?.notifications || [],
    unreadCount: unreadCountQuery.data?.unread_count || 0,
    isLoading: notificationsQuery.isLoading,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
  };
}
