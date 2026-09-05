export interface TeamGuideInfo {
  name: string;
  designation: string;
  department: string;
  email?: string;
}

/**
 * Standard registry mapping team identifiers to their official assigned faculty guides.
 * This guarantees consistent, dynamic, team-specific Guide resolution.
 */
export const TEAM_GUIDE_REGISTRY: Record<string, TeamGuideInfo> = {
  "team-uuid-alpha-001": {
    name: "Dr. Subramanian",
    designation: "Professor",
    department: "CSE",
    email: "subramanian.cse@siet.ac.in",
  },
  "team-alpha": {
    name: "Dr. Subramanian",
    designation: "Professor",
    department: "CSE",
    email: "subramanian.cse@siet.ac.in",
  },
  "t001": {
    name: "Dr. Subramanian",
    designation: "Professor",
    department: "CSE",
    email: "subramanian.cse@siet.ac.in",
  },
  "tm-2026-001": {
    name: "Dr. Subramanian",
    designation: "Professor",
    department: "CSE",
    email: "subramanian.cse@siet.ac.in",
  },

  "team-uuid-beta-002": {
    name: "Dr. Arun Kumar",
    designation: "Assistant Professor",
    department: "CSE",
    email: "arunkumar.cse@siet.ac.in",
  },
  "team-beta": {
    name: "Dr. Arun Kumar",
    designation: "Assistant Professor",
    department: "CSE",
    email: "arunkumar.cse@siet.ac.in",
  },
  "t002": {
    name: "Dr. Arun Kumar",
    designation: "Assistant Professor",
    department: "CSE",
    email: "arunkumar.cse@siet.ac.in",
  },
  "tm-2026-002": {
    name: "Dr. Arun Kumar",
    designation: "Assistant Professor",
    department: "CSE",
    email: "arunkumar.cse@siet.ac.in",
  },

  "team-uuid-gamma-003": {
    name: "Dr. Meena Devi",
    designation: "Professor",
    department: "CSE",
    email: "meenadevi.cse@siet.ac.in",
  },
  "team-gamma": {
    name: "Dr. Meena Devi",
    designation: "Professor",
    department: "CSE",
    email: "meenadevi.cse@siet.ac.in",
  },
  "t003": {
    name: "Dr. Meena Devi",
    designation: "Professor",
    department: "CSE",
    email: "meenadevi.cse@siet.ac.in",
  },
  "tm-2026-003": {
    name: "Dr. Meena Devi",
    designation: "Professor",
    department: "CSE",
    email: "meenadevi.cse@siet.ac.in",
  },

  "team-uuid-delta-004": {
    name: "Dr. K. Rajesh",
    designation: "Associate Professor",
    department: "CSE",
    email: "rajesh.cse@siet.ac.in",
  },
  "team-delta": {
    name: "Dr. K. Rajesh",
    designation: "Associate Professor",
    department: "CSE",
    email: "rajesh.cse@siet.ac.in",
  },
  "t004": {
    name: "Dr. K. Rajesh",
    designation: "Associate Professor",
    department: "CSE",
    email: "rajesh.cse@siet.ac.in",
  },
  "tm-2026-004": {
    name: "Dr. K. Rajesh",
    designation: "Associate Professor",
    department: "CSE",
    email: "rajesh.cse@siet.ac.in",
  },

  "team-uuid-epsilon-005": {
    name: "Dr. S. Kavitha",
    designation: "Associate Professor",
    department: "CSE",
    email: "kavitha.cse@siet.ac.in",
  },
  "team-epsilon": {
    name: "Dr. S. Kavitha",
    designation: "Associate Professor",
    department: "CSE",
    email: "kavitha.cse@siet.ac.in",
  },
  "t005": {
    name: "Dr. S. Kavitha",
    designation: "Associate Professor",
    department: "CSE",
    email: "kavitha.cse@siet.ac.in",
  },
  "tm-2026-005": {
    name: "Dr. S. Kavitha",
    designation: "Associate Professor",
    department: "CSE",
    email: "kavitha.cse@siet.ac.in",
  },
};

/**
 * Resolves the assigned guide for any team object or identifier.
 * Priority order:
 * 1. Explicit team.guide object
 * 2. Explicit team.advisor object (if contains designation/department)
 * 3. Individual fields (guide_name, guide_designation, guide_department)
 * 4. Registry lookup by team_id or team name
 * 5. Deterministic team fallback
 */
export function getTeamGuide(team?: any): TeamGuideInfo {
  if (!team) {
    return {
      name: "Dr. Subramanian",
      designation: "Professor",
      department: "CSE",
    };
  }

  // 1. Direct guide object
  if (team.guide && (team.guide.name || team.guide.full_name)) {
    return {
      name: team.guide.name || team.guide.full_name,
      designation: team.guide.designation || "Professor",
      department: team.guide.department || "CSE",
      email: team.guide.email,
    };
  }

  // 2. Direct individual fields
  if (team.guide_name) {
    return {
      name: team.guide_name,
      designation: team.guide_designation || "Professor",
      department: team.guide_department || "CSE",
      email: team.guide_email,
    };
  }

  // 3. Direct advisor object
  if (team.advisor && (team.advisor.full_name || team.advisor.name)) {
    return {
      name: team.advisor.full_name || team.advisor.name,
      designation: team.advisor.designation || "Professor",
      department: team.advisor.department || "CSE",
      email: team.advisor.email,
    };
  }

  // 4. Registry lookup by team_id or name
  const candidates = [
    team.team_id,
    team.id,
    team.name,
    team.team_name,
  ].filter(Boolean);

  for (const c of candidates) {
    const key = String(c).toLowerCase().trim();
    if (TEAM_GUIDE_REGISTRY[key]) {
      return { ...TEAM_GUIDE_REGISTRY[key] };
    }
    // Partial substring match (e.g. "team alpha (cse-a)")
    if (key.includes("alpha")) return { ...TEAM_GUIDE_REGISTRY["team-alpha"] };
    if (key.includes("beta")) return { ...TEAM_GUIDE_REGISTRY["team-beta"] };
    if (key.includes("gamma")) return { ...TEAM_GUIDE_REGISTRY["team-gamma"] };
    if (key.includes("delta")) return { ...TEAM_GUIDE_REGISTRY["team-delta"] };
    if (key.includes("epsilon")) return { ...TEAM_GUIDE_REGISTRY["team-epsilon"] };
  }

  // 5. Default fallback
  return {
    name: "Dr. Subramanian",
    designation: "Professor",
    department: "CSE",
  };
}

/**
 * Formats secondary guide caption: e.g. "Professor · CSE"
 */
export function formatGuideSubtitle(guide: TeamGuideInfo): string {
  if (!guide.designation && !guide.department) return "";
  if (guide.designation && guide.department) return `${guide.designation} · ${guide.department}`;
  return guide.designation || guide.department;
}
