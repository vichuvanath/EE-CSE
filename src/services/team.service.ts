import apiClient from "@/lib/api-client";
import { MyTeamResponse } from "@/types";

export const teamService = {
  getMyTeam: async (): Promise<MyTeamResponse> => {
    const response = await apiClient.get<MyTeamResponse>("/api/team/me");
    return response.data;
  },
};
