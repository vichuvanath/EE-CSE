import apiClient from "@/lib/api-client";
import {
  StudentLoginRequest,
  AdvisorLoginRequest,
  LoginResponse,
  CurrentUserResponse,
  LogoutResponse,
} from "@/types";

export const authService = {
  loginStudent: async (data: StudentLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/auth/student-login",
      data
    );
    return response.data;
  },

  loginAdvisor: async (data: AdvisorLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/auth/advisor-login",
      data
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await apiClient.get<CurrentUserResponse>("/api/auth/me");
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/api/auth/logout");
    return response.data;
  },
};
