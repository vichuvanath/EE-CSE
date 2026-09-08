import apiClient from "@/lib/api-client";
import {
  StudentLoginRequest,
  AdvisorLoginRequest,
  UnifiedLoginRequest,
  LoginResponse,
  CurrentUserResponse,
  LogoutResponse,
} from "@/types";

export const authService = {
  login: async (data: UnifiedLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/v1/auth/login",
      data
    );
    return response.data;
  },

  loginStudent: async (data: StudentLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/v1/auth/student-login",
      data
    );
    return response.data;
  },

  loginAdvisor: async (data: AdvisorLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/v1/auth/advisor-login",
      data
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await apiClient.get<CurrentUserResponse>("/api/v1/auth/me");
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/api/v1/auth/logout");
    return response.data;
  },
};
