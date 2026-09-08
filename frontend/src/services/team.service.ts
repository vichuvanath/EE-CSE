import apiClient from "@/lib/api-client";
import { MyTeamResponse } from "@/types";

interface BackendTeamResponse {
  id: string;
  name: string;
  class_id: string;
  class_name: string;
  project?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
  } | null;
  members: {
    student_id: string;
    roll_number: string;
    full_name: string;
    email: string;
    joined_at: string;
  }[];
}

function adaptTeamResponse(raw: BackendTeamResponse): MyTeamResponse {
  const className = raw.class_name || "";
  const parts = className.split("-");
  const section = parts.length > 1 ? parts.slice(1).join("-").trim() : "";
  const batch = parts[0]?.trim() || "";

  return {
    team_id: raw.id,
    id: raw.id,
    name: raw.name,
    project_title: raw.project?.title || "",
    batch,
    section,
    class_id: raw.class_id,
    class_name: raw.class_name,
    members: raw.members.map((m, idx) => ({
      student_id: m.student_id,
      id: m.student_id,
      roll_number: m.roll_number,
      full_name: m.full_name,
      email: m.email,
      is_team_leader: idx === 0,
      joined_at: m.joined_at,
    })),
    team_leader: raw.members[0]
      ? {
          id: raw.members[0].student_id,
          roll_number: raw.members[0].roll_number,
          full_name: raw.members[0].full_name,
          is_team_leader: true,
        }
      : undefined,
    project: raw.project
      ? {
          id: raw.project.id,
          title: raw.project.title || "",
          domain: "",
          problem_statement: "",
          description: raw.project.description || "",
          proposed_solution: "",
          technologies_used: "",
          github_url: "",
          live_demo_url: "",
        }
      : undefined,
  };
}

export const teamService = {
  getMyTeam: async (): Promise<MyTeamResponse> => {
    const response = await apiClient.get<BackendTeamResponse>("/api/v1/student/team");
    return adaptTeamResponse(response.data);
  },
};
