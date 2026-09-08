import { TeamAdvisor } from "@/types";

export interface GuideInfo {
  name: string;
  designation?: string;
  department?: string;
  isCurrentUser?: boolean;
}

export function formatGuideDisplay(guide?: string | TeamAdvisor | GuideInfo): {
  name: string;
  designation: string;
  department: string;
} {
  if (!guide) {
    return {
      name: "Dr. K. Senthil Kumar",
      designation: "Associate Professor & PRC Guide",
      department: "Dept. of Computer Science & Engineering",
    };
  }

  if (typeof guide === "string") {
    return {
      name: guide,
      designation: "PRC Guide / Faculty Advisor",
      department: "Dept. of Computer Science & Engineering",
    };
  }

  const name = (guide as any).name || (guide as any).full_name || "Dr. K. Senthil Kumar";
  const designation = (guide as any).designation || "PRC Guide / Faculty Advisor";
  const department = (guide as any).department || "Dept. of Computer Science & Engineering";

  return {
    name,
    designation,
    department,
  };
}
