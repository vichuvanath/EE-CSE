"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { StudentLoginRequest, AdvisorLoginRequest } from "@/types";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, role, setAuth, logout: storeLogout } = useAuthStore();

  const studentLoginMutation = useMutation({
    mutationFn: (data: StudentLoginRequest) => authService.loginStudent(data),
    onSuccess: (res) => {
      setAuth(res.user, res.access_token);
      queryClient.invalidateQueries();
      router.push("/student/profile");
    },
  });

  const advisorLoginMutation = useMutation({
    mutationFn: (data: AdvisorLoginRequest) => authService.loginAdvisor(data),
    onSuccess: (res) => {
      setAuth(res.user, res.access_token);
      queryClient.invalidateQueries();
      router.push("/advisor/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      router.push("/login");
    },
  });

  const currentUserQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    user,
    isAuthenticated,
    role,
    loginStudent: studentLoginMutation.mutateAsync,
    isStudentLoggingIn: studentLoginMutation.isPending,
    studentLoginError: studentLoginMutation.error,
    loginAdvisor: advisorLoginMutation.mutateAsync,
    isAdvisorLoggingIn: advisorLoginMutation.isPending,
    advisorLoginError: advisorLoginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    currentUserQuery,
  };
}
