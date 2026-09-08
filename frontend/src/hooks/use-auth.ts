import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { StudentLoginRequest, AdvisorLoginRequest } from "@/types";
import { useNavigate } from "react-router-dom";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAuth, logout: clearAuthStore, isAuthenticated } = useAuthStore();

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
