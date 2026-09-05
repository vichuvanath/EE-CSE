import apiClient from "@/lib/api-client";
import { StudentProfile, StudentProfileUpdate } from "@/types";

export const studentService = {
  getProfile: async (): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>("/api/student/profile");
    return response.data;
  },

  updateProfile: async (
    data: StudentProfileUpdate
  ): Promise<StudentProfile> => {
    const response = await apiClient.put<StudentProfile>(
      "/api/student/profile",
      data
    );
    return response.data;
  },
};
