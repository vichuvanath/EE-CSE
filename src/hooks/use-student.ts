"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { teamService } from "@/services/team.service";
import { projectService } from "@/services/project.service";
import { fileService } from "@/services/file.service";
import { submissionService } from "@/services/submission.service";
import { useAuthStore } from "@/stores/auth-store";
import {
  FileCategory,
  ProjectUpdate,
  StudentProfileUpdate,
} from "@/types";

export function useStudentProfile() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["student", "profile"],
    queryFn: () => studentService.getProfile(),
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: StudentProfileUpdate) =>
      studentService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["student", "profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return {
    ...profileQuery,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
  };
}

export function useMyTeam() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["student", "team"],
    queryFn: () => teamService.getMyTeam(),
    enabled: isAuthenticated,
  });
}

export function useMyProject() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ["student", "project"],
    queryFn: () => projectService.getMyProject(),
    enabled: isAuthenticated,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectUpdate) => projectService.updateMyProject(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["student", "project"], updated);
      queryClient.invalidateQueries({ queryKey: ["student", "submission", "checklist"] });
    },
  });

  return {
    ...projectQuery,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
    updateError: updateProjectMutation.error,
  };
}

export function useMyFiles() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const filesQuery = useQuery({
    queryKey: ["student", "files"],
    queryFn: () => fileService.getMyFiles(),
    enabled: isAuthenticated,
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({ category, file }: { category: FileCategory; file: File }) =>
      fileService.uploadFile(category, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "files"] });
      queryClient.invalidateQueries({ queryKey: ["student", "submission"] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "files"] });
      queryClient.invalidateQueries({ queryKey: ["student", "submission"] });
    },
  });

  return {
    ...filesQuery,
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
    uploadError: uploadFileMutation.error,
    deleteFile: deleteFileMutation.mutateAsync,
    isDeleting: deleteFileMutation.isPending,
    deleteError: deleteFileMutation.error,
  };
}

export function useSubmission() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const checklistQuery = useQuery({
    queryKey: ["student", "submission", "checklist"],
    queryFn: () => submissionService.getChecklist(),
    enabled: isAuthenticated,
  });

  const mySubmissionQuery = useQuery({
    queryKey: ["student", "submission", "me"],
    queryFn: () => submissionService.getMySubmission(),
    enabled: isAuthenticated,
  });

  const finalSubmitMutation = useMutation({
    mutationFn: () => submissionService.submitFinal(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "submission"] });
    },
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: (data: ProjectUpdate) =>
      submissionService.updateSubmissionProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "submission"] });
      queryClient.invalidateQueries({ queryKey: ["student", "project"] });
    },
  });

  return {
    checklist: checklistQuery.data,
    isLoadingChecklist: checklistQuery.isLoading,
    checklistError: checklistQuery.error,
    mySubmission: mySubmissionQuery.data,
    isLoadingSubmission: mySubmissionQuery.isLoading,
    refetchChecklist: checklistQuery.refetch,
    refetchSubmission: mySubmissionQuery.refetch,
    submitFinal: finalSubmitMutation.mutateAsync,
    isSubmitting: finalSubmitMutation.isPending,
    submitError: finalSubmitMutation.error,
    updateSubmission: updateSubmissionMutation.mutateAsync,
    isUpdatingSubmission: updateSubmissionMutation.isPending,
  };
}
