import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { StudentLoginRequest, AdvisorLoginRequest, UnifiedLoginRequest } from "@/types";
import { useNavigate } from "react-router-dom";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

const ROLE_REDIRECT: Record<string, string> = {
  student: "/student/team",
  advisor: "/advisor/dashboard",
  hod: "/hod/dashboard",
  admin: "/hod/dashboard",
};

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAuth, logout: clearAuthStore, isAuthenticated } = useAuthStore();

  const unifiedLoginMutation = useMutation({
    mutationFn: (data: UnifiedLoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.access_token);
      queryClient.setQueryData(AUTH_KEYS.me, response.user);
      const redirect = ROLE_REDIRECT[response.user.role] || "/login";
      navigate(redirect);
    },
  });

  const studentLoginMutation = useMutation({
    mutationFn: (data: StudentLoginRequest) => authService.loginStudent(data),
    onSuccess: (response) => {
      setAuth(response.user, response.access_token);
      queryClient.setQueryData(AUTH_KEYS.me, response.user);
      navigate("/student/team");
    },
  });

  const advisorLoginMutation = useMutation({
    mutationFn: (data: AdvisorLoginRequest) => authService.loginAdvisor(data),
    onSuccess: (response) => {
      setAuth(response.user, response.access_token);
      queryClient.setQueryData(AUTH_KEYS.me, response.user);
      navigate("/advisor/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuthStore();
      queryClient.clear();
      navigate("/login");
    },
  });

  const currentUserQuery = useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    login: unifiedLoginMutation.mutateAsync,
    isLoggingIn: unifiedLoginMutation.isPending,
    loginError: unifiedLoginMutation.error,

    loginStudent: studentLoginMutation.mutateAsync,
    isStudentLoggingIn: studentLoginMutation.isPending,
    studentLoginError: studentLoginMutation.error,

    loginAdvisor: advisorLoginMutation.mutateAsync,
    isAdvisorLoggingIn: advisorLoginMutation.isPending,
    advisorLoginError: advisorLoginMutation.error,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    currentUser: currentUserQuery.data,
    isLoadingUser: currentUserQuery.isLoading,
  };
}
