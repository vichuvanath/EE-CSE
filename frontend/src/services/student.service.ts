import apiClient from "@/lib/api-client";
import { StudentProfile, StudentProfileUpdate } from "@/types";

export const studentService = {
  getProfile: async (): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>("/api/v1/student/profile");
    return response.data;
  },

  updateProfile: async (
    data: StudentProfileUpdate
  ): Promise<StudentProfile> => {
    const response = await apiClient.put<StudentProfile>(
      "/api/v1/student/profile",
      data
    );
    return response.data;
  },
};
