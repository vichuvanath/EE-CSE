import apiClient from "@/lib/api-client";
import {
  StudentNotification,
  StudentAnnouncement,
  StudentEvaluation,
  StudentDeadline,
  StudentDashboardResponse,
} from "@/types";

export const studentNotificationService = {
  getAll: async (): Promise<StudentNotification[]> => {
    const response = await apiClient.get<StudentNotification[]>(
      "/api/v1/student/notifications"
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await apiClient.get<{ unread_count: number }>(
      "/api/v1/student/notifications/unread-count"
    );
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<StudentNotification> => {
    const response = await apiClient.patch<StudentNotification>(
      `/api/v1/student/notifications/${notificationId}/read`
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(
      "/api/v1/student/notifications/read-all"
    );
    return response.data;
  },
};

export const studentAnnouncementService = {
  getAll: async (): Promise<StudentAnnouncement[]> => {
    const response = await apiClient.get<StudentAnnouncement[]>(
      "/api/v1/student/announcements"
    );
    return response.data;
  },

  getById: async (announcementId: string): Promise<StudentAnnouncement> => {
    const response = await apiClient.get<StudentAnnouncement>(
      `/api/v1/student/announcements/${announcementId}`
    );
    return response.data;
  },

  markAsRead: async (announcementId: string): Promise<StudentAnnouncement> => {
    const response = await apiClient.patch<StudentAnnouncement>(
      `/api/v1/student/announcements/${announcementId}/read`
    );
    return response.data;
  },
};

export const studentEvaluationService = {
  getAll: async (): Promise<StudentEvaluation[]> => {
    const response = await apiClient.get<StudentEvaluation[]>(
      "/api/v1/student/evaluations"
    );
    return response.data;
  },

  getById: async (evaluationId: string): Promise<StudentEvaluation> => {
    const response = await apiClient.get<StudentEvaluation>(
      `/api/v1/student/evaluations/${evaluationId}`
    );
    return response.data;
  },
};

export const studentDeadlineService = {
  getAll: async (upcomingOnly = false): Promise<StudentDeadline[]> => {
    const response = await apiClient.get<StudentDeadline[]>(
      "/api/v1/student/deadlines",
      { params: { upcoming_only: upcomingOnly } }
    );
    return response.data;
  },
};

export const studentDashboardService = {
  get: async (): Promise<StudentDashboardResponse> => {
    const response = await apiClient.get<StudentDashboardResponse>(
      "/api/v1/student/dashboard"
    );
    return response.data;
  },
};
