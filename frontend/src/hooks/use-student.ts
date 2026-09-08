import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { teamService } from "@/services/team.service";
import { projectService } from "@/services/project.service";
import { fileService } from "@/services/file.service";
import { submissionService } from "@/services/submission.service";
import {
  FileCategory,
  ProjectUpdate,
  StudentProfileUpdate,
} from "@/types";
import { useAuthStore } from "@/stores/auth-store";

export const STUDENT_KEYS = {
  profile: ["student", "profile"] as const,
  team: ["student", "team"] as const,
  project: ["student", "project"] as const,
  files: ["student", "files"] as const,
  submissionChecklist: ["student", "submission", "checklist"] as const,
  mySubmission: ["student", "submission", "me"] as const,
  submissionHistory: ["student", "submissions", "history"] as const,
};

// 1. Profile Hooks
export function useStudentProfile() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.profile,
    queryFn: () => studentService.getProfile(),
    enabled: isAuthenticated,
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentProfileUpdate) =>
      studentService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(STUDENT_KEYS.profile, updated);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// 2. Team Hook
export function useStudentTeam() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.team,
    queryFn: () => teamService.getMyTeam(),
    enabled: isAuthenticated,
  });
}

// 3. Project Hooks
export function useStudentProject() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.project,
    queryFn: () => projectService.getProject(),
    enabled: isAuthenticated,
  });
}

export function useUpdateStudentProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectUpdate) => projectService.updateProject(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(STUDENT_KEYS.project, updated);
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionChecklist,
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.mySubmission,
      });
    },
  });
}

// 4. File Hooks
export function useStudentFiles() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.files,
    queryFn: () => fileService.getMyFiles(),
    enabled: isAuthenticated,
  });
}

export function useUploadStudentFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      category,
      file,
    }: {
      category: FileCategory;
      file: File;
    }) => fileService.uploadFile(category, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.files });
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionChecklist,
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.mySubmission,
      });
    },
  });
}

export function useDeleteStudentFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.files });
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionChecklist,
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.mySubmission,
      });
    },
  });
}

// 5. Submission Hooks
export function useSubmissionChecklist() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.submissionChecklist,
    queryFn: () => submissionService.getChecklist(),
    enabled: isAuthenticated,
  });
}

export function useStudentSubmission() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.mySubmission,
    queryFn: () => submissionService.getMySubmission(),
    enabled: isAuthenticated,
  });
}

export function useFinalSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submissionService.submitFinal(),
    onSuccess: (result) => {
      queryClient.setQueryData(STUDENT_KEYS.mySubmission, (old: any) => ({
        ...old,
        status: result.status,
        submitted_at: result.submitted_at,
      }));
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionChecklist,
      });
    },
  });
}

export function useStudentWeeklySubmissions() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: STUDENT_KEYS.submissionHistory,
    queryFn: () => submissionService.getWeeklySubmissionHistory(),
    enabled: isAuthenticated,
  });
}

export function useUpdateWeeklySubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      weekNumber,
      data,
    }: {
      weekNumber: number;
      data: Partial<import("@/types").WeeklySubmissionRecord>;
    }) => submissionService.updateWeeklySubmission(weekNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionHistory,
      });
    },
  });
}

export function useAutoSubmitAndEvaluate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weekNumber: number) =>
      submissionService.autoSubmitAndEvaluate(weekNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionHistory,
      });
    },
  });
}

export function useResetWeeklyHistoryDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submissionService.resetWeeklyHistoryDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.submissionHistory,
      });
    },
  });
}


