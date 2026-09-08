import {
  ManagedTeam,
  ManagedTeamMember,
  ManagedFacultyGuide,
  UnassignedStudent,
  AuditLogEvent,
  AuditLogCategory,
  TeamRole,
  ManagedTeamStatus,
} from "@/types";

const STORAGE_KEYS = {
  TEAMS: "siet_advisor_managed_teams",
  UNASSIGNED: "siet_advisor_unassigned_students",
  GUIDES: "siet_advisor_faculty_guides",
  AUDIT_LOGS: "siet_advisor_change_history",
};

// Initial 18 Faculty Guides
export const initialFacultyGuides: ManagedFacultyGuide[] = [
  {
    id: "guide-1",
    name: "Dr. K. Senthil Kumar",
    designation: "Associate Professor",
    department: "CSE",
    email: "senthilkumar.cse@siet.ac.in",
    current_teams_count: 4,
    max_teams_limit: 6,
    current_students_count: 16,
  },
  {
    id: "guide-2",
    name: "Dr. Subramanian",
    designation: "Professor",
    department: "CSE",
    email: "subramanian.cse@siet.ac.in",
    current_teams_count: 5,
    max_teams_limit: 6,
    current_students_count: 20,
  },
  {
    id: "guide-3",
    name: "Dr. Arun Kumar",
    designation: "Assistant Professor",
    department: "CSE",
    email: "arunkumar.cse@siet.ac.in",
    current_teams_count: 3,
    max_teams_limit: 6,
    current_students_count: 12,
  },
  {
    id: "guide-4",
    name: "Dr. Meena Devi",
    designation: "Professor",
    department: "CSE",
    email: "meenadevi.cse@siet.ac.in",
    current_teams_count: 4,
    max_teams_limit: 6,
    current_students_count: 16,
  },
  {
    id: "guide-5",
    name: "Dr. K. Rajesh",
    designation: "Associate Professor",
    department: "CSE",
    email: "rajesh.cse@siet.ac.in",
    current_teams_count: 6,
    max_teams_limit: 6,
    current_students_count: 24,
  },
  {
    id: "guide-6",
    name: "Dr. R. Kavitha",
    designation: "Professor",
    department: "CSE",
    email: "kavitha.cse@siet.ac.in",
    current_teams_count: 3,
    max_teams_limit: 6,
    current_students_count: 12,
  },
  {
    id: "guide-7",
    name: "Dr. P. Mohanraj",
    designation: "Associate Professor",
    department: "CSE",
    email: "mohanraj.cse@siet.ac.in",
    current_teams_count: 2,
    max_teams_limit: 6,
    current_students_count: 8,
  },
  {
    id: "guide-8",
    name: "Dr. M. Suresh",
    designation: "Associate Professor",
    department: "CSE",
    email: "suresh.cse@siet.ac.in",
    current_teams_count: 4,
    max_teams_limit: 6,
    current_students_count: 16,
  },
  {
    id: "guide-9",
    name: "Dr. A. Venkatesh",
    designation: "Associate Professor",
    department: "CSE",
    email: "venkatesh.cse@siet.ac.in",
    current_teams_count: 3,
    max_teams_limit: 6,
    current_students_count: 12,
  },
  {
    id: "guide-10",
    name: "Dr. Priya S",
    designation: "Assistant Professor",
    department: "CSE",
    email: "priya.cse@siet.ac.in",
    current_teams_count: 2,
    max_teams_limit: 6,
    current_students_count: 8,
  },
  {
    id: "guide-11",
    name: "Dr. S. Karthikeyan",
    designation: "Professor",
    department: "EEE",
    email: "karthikeyan.eee@siet.ac.in",
    current_teams_count: 1,
    max_teams_limit: 6,
    current_students_count: 4,
  },
  {
    id: "guide-12",
    name: "Dr. V. Lakshmi",
    designation: "Assistant Professor",
    department: "Mech",
    email: "lakshmi.mech@siet.ac.in",
    current_teams_count: 1,
    max_teams_limit: 6,
    current_students_count: 4,
  },
  {
    id: "guide-13",
    name: "Dr. N. Balakrishnan",
    designation: "Professor",
    department: "ECE",
    email: "balakrishnan.ece@siet.ac.in",
    current_teams_count: 1,
    max_teams_limit: 6,
    current_students_count: 4,
  },
  {
    id: "guide-14",
    name: "Dr. Deepa Chandran",
    designation: "Associate Professor",
    department: "CSE",
    email: "deepa.cse@siet.ac.in",
    current_teams_count: 1,
    max_teams_limit: 6,
    current_students_count: 4,
  },
  {
    id: "guide-15",
    name: "Dr. G. Saravanan",
    designation: "Assistant Professor",
    department: "CSE",
    email: "saravanan.cse@siet.ac.in",
    current_teams_count: 1,
    max_teams_limit: 6,
    current_students_count: 4,
  },
  {
    id: "guide-16",
    name: "Dr. Hema Malini",
    designation: "Associate Professor",
    department: "IT",
    email: "hemamalini.it@siet.ac.in",
    current_teams_count: 0,
    max_teams_limit: 6,
    current_students_count: 0,
  },
  {
    id: "guide-17",
    name: "Dr. R. Manickam",
    designation: "Professor",
    department: "CSE",
    email: "manickam.cse@siet.ac.in",
    current_teams_count: 0,
    max_teams_limit: 6,
    current_students_count: 0,
  },
  {
    id: "guide-18",
    name: "Dr. B. Thilagavathi",
    designation: "Assistant Professor",
    department: "CSE",
    email: "thilagavathi.cse@siet.ac.in",
    current_teams_count: 1,
    max_teams_limit: 6,
    current_students_count: 4,
  },
];

// Initial Unassigned Students
export const initialUnassignedStudents: UnassignedStudent[] = [
  {
    id: "u-1",
    roll_number: "23CSE021",
    full_name: "Student A (Harish Raghav)",
    email: "harish.23cs@siet.ac.in",
    batch: "2023 – 2027",
    section: "CSE - A",
    cgpa: 8.65,
    status: "Unassigned",
  },
  {
    id: "u-2",
    roll_number: "23CSE035",
    full_name: "Student B (Nandhini R)",
    email: "nandhini.23cs@siet.ac.in",
    batch: "2023 – 2027",
    section: "CSE - A",
    cgpa: 8.92,
    status: "Unassigned",
  },
  {
    id: "u-3",
    roll_number: "23CSE054",
    full_name: "Gowtham S",
    email: "gowtham.23cs@siet.ac.in",
    batch: "2023 – 2027",
    section: "CSE - A",
    cgpa: 8.41,
    status: "Unassigned",
  },
  {
    id: "u-4",
    roll_number: "23CSE078",
    full_name: "Abinaya Murugan",
    email: "abinaya.23cs@siet.ac.in",
    batch: "2023 – 2027",
    section: "CSE - A",
    cgpa: 8.78,
    status: "Unassigned",
  },
  {
    id: "u-5",
    roll_number: "23CSE099",
    full_name: "Karthikeyan B",
    email: "karthi.23cs@siet.ac.in",
    batch: "2023 – 2027",
    section: "CSE - A",
    cgpa: 8.15,
    status: "Unassigned",
  },
  {
    id: "u-6",
    roll_number: "23CSE112",
    full_name: "Varshini Devi",
    email: "varshini.23cs@siet.ac.in",
    batch: "2023 – 2027",
    section: "CSE - A",
    cgpa: 8.84,
    status: "Unassigned",
  },
];

// Helper to generate 42 initial realistic teams
function generateInitialTeams(): ManagedTeam[] {
  const titles = [
    { name: "Team Alpha", code: "T01", domain: "AI / ML", title: "AI-Powered Smart Attendance & Campus Surveillance System" },
    { name: "Team Beta", code: "T02", domain: "IoT", title: "Autonomous Drone Delivery for Hospital Emergency Supplies" },
    { name: "Team Gamma", code: "T03", domain: "IoT", title: "IoT Sensor Fusion for Precision Agriculture & Irrigation" },
    { name: "Team Delta", code: "T04", domain: "Cyber Security", title: "Decentralized Credential Verification using Polygon Blockchain" },
    { name: "Team Epsilon", code: "T05", domain: "AI / ML", title: "Real-Time Brain Tumor Segmentation from 3D MRI Scans" },
    { name: "Team Zeta", code: "T06", domain: "Data Science", title: "Autonomous EV Fleet Charging & Route Optimization" },
    { name: "Team Eta", code: "T07", domain: "Cyber Security", title: "Secure Federated Learning for Multihospital Analytics" },
    { name: "Team Theta", code: "T08", domain: "AI / ML", title: "Smart Grid Fault Detection using Wavelet Analysis & Edge AI" },
    { name: "Team Iota", code: "T09", domain: "Mobile Application", title: "AI Robotic Arm for Precision Electronic Assembly" },
    { name: "Team Kappa", code: "T10", domain: "AI / ML", title: "NLP-Based Multi-Lingual Legal Case Summarization" },
    { name: "Team Lambda", code: "T11", domain: "Web Development", title: "Underwater Autonomous ROV for Marine Pipeline Inspection" },
    { name: "Team Mu", code: "T12", domain: "Cyber Security", title: "Quantum Key Distribution Simulation for Bank Networks" },
    { name: "Team Nu", code: "T13", domain: "Data Science", title: "Predictive Maintenance in Wind Turbine Gearboxes" },
    { name: "Team Xi", code: "T14", domain: "Web Development", title: "Decentralized Micro-Grid Energy Trading Marketplace" },
    { name: "Team Omicron", code: "T15", domain: "Mobile Application", title: "AR Assistive Navigation for Visually Impaired Persons" },
    { name: "Team Pi", code: "T16", domain: "AI / ML", title: "Zero-Shot DeepFake Video & Audio Detector" },
    { name: "Team Rho", code: "T17", domain: "IoT", title: "Smart Traffic Light Controller with Emergency Vehicle Priority" },
    { name: "Team Sigma", code: "T18", domain: "AI / ML", title: "Automated Defect Detection on PCB Manufacturing Lines" },
    { name: "Team Tau", code: "T19", domain: "Cyber Security", title: "End-to-End Encrypted Telemedicine Consultation Portal" },
    { name: "Team Upsilon", code: "T20", domain: "Data Science", title: "Automated Satellite Imagery Analysis for Forest Fire Prediction" },
    { name: "Team Phi", code: "T21", domain: "Web Development", title: "Micro-SaaS Multi-Tenant Cloud Cost Optimizer" },
    { name: "Team Chi", code: "T22", domain: "AI / ML", title: "Autonomous Underwater Vehicle for Coral Reef Health Survey" },
    { name: "Team Psi", code: "T23", domain: "IoT", title: "LoRaWAN Smart Water Metering and Leakage Detection" },
    { name: "Team Omega", code: "T24", domain: "AI / ML", title: "Edge-AI Wearable for Cardiac Arrhythmia Detection" },
  ];

  // Extend to 42 teams with variations
  const fullList: ManagedTeam[] = [];

  for (let i = 0; i < 42; i++) {
    const template = titles[i % titles.length];
    const num = i + 1;
    const teamId = `TEAM-${String(num).padStart(3, "0")}`;
    const name = i < titles.length ? template.name : `Team Innovation ${num}`;
    const guideIndex = i % initialFacultyGuides.length;
    const guide = initialFacultyGuides[guideIndex];
    const section = "CSE - A";
    const batch = "2023 – 2027";
    const status: ManagedTeamStatus = i === 3 ? "Completed" : i === 12 ? "Inactive" : "Active";

    const members: ManagedTeamMember[] = [
      {
        id: `m-${num}-1`,
        roll_number: `23CSE${String(num * 4 - 3).padStart(3, "0")}`,
        full_name: `Student ${num}A`,
        email: `student${num}a@siet.ac.in`,
        role: "Team Member",
        joined_date: "01 Jun 2026",
        status: "Active",
      },
      {
        id: `m-${num}-2`,
        roll_number: `23CSE${String(num * 4 - 2).padStart(3, "0")}`,
        full_name: `Student ${num}B`,
        email: `student${num}b@siet.ac.in`,
        role: "Team Member",
        joined_date: "01 Jun 2026",
        status: "Active",
      },
      {
        id: `m-${num}-3`,
        roll_number: `23CSE${String(num * 4 - 1).padStart(3, "0")}`,
        full_name: `Student ${num}C`,
        email: `student${num}c@siet.ac.in`,
        role: "Team Member",
        joined_date: "01 Jun 2026",
        status: "Active",
      },
      {
        id: `m-${num}-4`,
        roll_number: `23CSE${String(num * 4).padStart(3, "0")}`,
        full_name: `Student ${num}D`,
        email: `student${num}d@siet.ac.in`,
        role: "Team Member",
        joined_date: "01 Jun 2026",
        status: "Active",
      },
    ];

    fullList.push({
      id: `team-id-${num}`,
      team_id: teamId,
      name: name,
      project_title: i < titles.length ? template.title : `${template.title} (Phase ${num})`,
      project_domain: template.domain,
      description: "Comprehensive capstone project addressing autonomous industry standards, IEEE rubrics, and high-impact institutional application.",
      batch: batch,
      section: section,
      status: status,
      last_modified: "07 Sep 2026",
      created_at: "01 Jun 2026",
      guide: guide,
      members: members,
    });
  }

  return fullList;
}

// Initial Audit History Log
export const initialAuditLogs: AuditLogEvent[] = [
  {
    id: "LOG-106",
    timestamp: new Date().toISOString(),
    dateFormatted: "07 Sep 2026, 12:40 PM",
    teamId: "TEAM-001",
    teamName: "Team Alpha",
    category: "Member Added",
    action: "Student Added to Team",
    description: "Added Priya Sundaram (23CS002) as Presentation Lead to Team Alpha.",
    fromState: "3 Members",
    toState: "4 Members",
    changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
  },
  {
    id: "LOG-105",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    dateFormatted: "07 Sep 2026, 09:30 AM",
    teamId: "TEAM-005",
    teamName: "Team Epsilon",
    category: "Guide Reassigned",
    action: "Faculty Guide Reassigned",
    description: "Reassigned project guide from Dr. Subramanian to Dr. K. Senthil Kumar due to MRI specialization matching.",
    fromState: "Guide: Dr. Subramanian",
    toState: "Guide: Dr. K. Senthil Kumar",
    changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
  },
  {
    id: "LOG-104",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    dateFormatted: "06 Sep 2026, 04:15 PM",
    teamId: "TEAM-004",
    teamName: "Team Delta",
    category: "Role Changed",
    action: "Member Role Updated",
    description: "Elevated Arun Prakash (23CS061) to Technical Lead for smart contract development.",
    fromState: "Team Member",
    toState: "Technical Lead",
    changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
  },
  {
    id: "LOG-103",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    dateFormatted: "05 Sep 2026, 02:20 PM",
    teamId: "TEAM-003",
    teamName: "Team Gamma",
    category: "Member Moved",
    action: "Student Moved Between Teams",
    description: "Moved Sanjay K (23CS021) from Team Beta to Team Gamma to balance LoRa hardware tasks.",
    fromState: "Team Beta (4 Members)",
    toState: "Team Gamma (4 Members)",
    changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
  },
  {
    id: "LOG-102",
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    dateFormatted: "04 Sep 2026, 11:00 AM",
    teamId: "TEAM-002",
    teamName: "Team Beta",
    category: "Team Updated",
    action: "Project Title Updated",
    description: "Revised project scope from 'Drone Logistics' to 'Autonomous Drone Delivery for Hospital Emergency Supplies'.",
    fromState: "Drone Logistics",
    toState: "Autonomous Drone Delivery for Hospital Emergency Supplies",
    changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
  },
  {
    id: "LOG-101",
    timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
    dateFormatted: "03 Sep 2026, 10:15 AM",
    teamId: "TEAM-001",
    teamName: "Team Alpha",
    category: "Team Created",
    action: "Initial Team Created",
    description: "Registered Team Alpha with Project Guide Dr. Subramanian and 4 founding members.",
    fromState: "[Unassigned]",
    toState: "Team Alpha (4 Members)",
    changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
  },
];

export class TeamsManagementService {
  // 1. Teams
  static getTeams(): ManagedTeam[] {
    if (typeof window === "undefined") return generateInitialTeams();
    const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!stored) {
      const initial = generateInitialTeams();
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return generateInitialTeams();
    }
  }

  static saveTeams(teams: ManagedTeam[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    }
  }

  // 2. Unassigned Students
  static getUnassignedStudents(): UnassignedStudent[] {
    if (typeof window === "undefined") return initialUnassignedStudents;
    const stored = localStorage.getItem(STORAGE_KEYS.UNASSIGNED);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.UNASSIGNED, JSON.stringify(initialUnassignedStudents));
      return initialUnassignedStudents;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialUnassignedStudents;
    }
  }

  static saveUnassignedStudents(students: UnassignedStudent[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.UNASSIGNED, JSON.stringify(students));
    }
  }

  // 3. Faculty Guides
  static getGuides(): ManagedFacultyGuide[] {
    if (typeof window === "undefined") return initialFacultyGuides;
    const stored = localStorage.getItem(STORAGE_KEYS.GUIDES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(initialFacultyGuides));
      return initialFacultyGuides;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialFacultyGuides;
    }
  }

  static saveGuides(guides: ManagedFacultyGuide[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
    }
  }

  // 4. Audit History Logs
  static getAuditLogs(): AuditLogEvent[] {
    if (typeof window === "undefined") return initialAuditLogs;
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
      return initialAuditLogs;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialAuditLogs;
    }
  }

  static recordAuditLog(event: Omit<AuditLogEvent, "id" | "timestamp" | "dateFormatted">): AuditLogEvent {
    const logs = this.getAuditLogs();
    const newId = `LOG-${String(logs.length + 101).padStart(3, "0")}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newEntry: AuditLogEvent = {
      ...event,
      id: newId,
      timestamp: now.toISOString(),
      dateFormatted,
    };

    const updatedLogs = [newEntry, ...logs];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updatedLogs));
    }
    return newEntry;
  }

  // 5. High-Level Mutation Methods

  /** Create New Team */
  static createTeam(
    data: Omit<ManagedTeam, "id" | "team_id" | "last_modified" | "created_at">,
    assignedStudentIds: string[]
  ): ManagedTeam {
    const teams = this.getTeams();
    const unassigned = this.getUnassignedStudents();
    const guides = this.getGuides();

    const teamNum = teams.length + 1;
    const teamId = `TEAM-${String(teamNum).padStart(3, "0")}`;
    const nowFormatted = "07 Sep 2026";

    // Selected students from unassigned pool
    const selectedStudents = unassigned.filter((u) => assignedStudentIds.includes(u.id));
    const newMembers: ManagedTeamMember[] = selectedStudents.map((s, idx) => ({
      id: `m-${teamNum}-${idx + 1}`,
      roll_number: s.roll_number,
      full_name: s.full_name,
      email: s.email,
      role: idx === 0 ? "Team Leader" : "Team Member",
      joined_date: nowFormatted,
      status: "Active",
    }));

    // If user provided manual members in data
    const finalMembers = data.members && data.members.length > 0 ? data.members : newMembers;

    const newTeam: ManagedTeam = {
      ...data,
      id: `team-id-${teamNum}`,
      team_id: teamId,
      members: finalMembers,
      last_modified: nowFormatted,
      created_at: nowFormatted,
    };

    // Remove assigned students from unassigned pool
    const updatedUnassigned = unassigned.filter((u) => !assignedStudentIds.includes(u.id));
    this.saveUnassignedStudents(updatedUnassigned);

    // Update Guide workload
    const guideIdx = guides.findIndex((g) => g.id === data.guide.id || g.name === data.guide.name);
    if (guideIdx >= 0) {
      guides[guideIdx].current_teams_count += 1;
      guides[guideIdx].current_students_count += finalMembers.length;
      this.saveGuides(guides);
    }

    const updatedTeams = [newTeam, ...teams];
    this.saveTeams(updatedTeams);

    // Log event
    this.recordAuditLog({
      teamId: newTeam.team_id,
      teamName: newTeam.name,
      category: "Team Created",
      action: "New Team Registered",
      description: `Created ${newTeam.name} (${newTeam.team_id}) with ${finalMembers.length} members and Guide ${newTeam.guide.name}.`,
      fromState: "[Unassigned Pool]",
      toState: `${newTeam.name} (${finalMembers.length} Members)`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return newTeam;
  }

  /** Edit Team Information */
  static updateTeamInfo(
    teamId: string,
    updates: Partial<Pick<ManagedTeam, "name" | "project_title" | "project_domain" | "description" | "status" | "batch" | "section">>
  ): ManagedTeam | null {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.team_id === teamId || t.id === teamId);
    if (idx === -1) return null;

    const oldTeam = teams[idx];
    const updated: ManagedTeam = {
      ...oldTeam,
      ...updates,
      last_modified: "07 Sep 2026",
    };

    teams[idx] = updated;
    this.saveTeams(teams);

    this.recordAuditLog({
      teamId: updated.team_id,
      teamName: updated.name,
      category: "Team Updated",
      action: "Team Information Modified",
      description: `Updated project dossier for ${updated.name}: Title "${updated.project_title}", Domain: ${updated.project_domain}, Status: ${updated.status}.`,
      fromState: `${oldTeam.project_title} (${oldTeam.status})`,
      toState: `${updated.project_title} (${updated.status})`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return updated;
  }

  /** Reassign Faculty Guide */
  static reassignGuide(
    teamId: string,
    newGuideId: string,
    reason: string = "Specialization alignment",
    effectiveDate: string = "07 Sep 2026"
  ): ManagedTeam | null {
    const teams = this.getTeams();
    const guides = this.getGuides();

    const teamIdx = teams.findIndex((t) => t.team_id === teamId || t.id === teamId);
    if (teamIdx === -1) return null;

    const newGuide = guides.find((g) => g.id === newGuideId);
    if (!newGuide) return null;

    const oldGuide = teams[teamIdx].guide;

    // Update old guide counts
    const oldGuideIdx = guides.findIndex((g) => g.id === oldGuide.id);
    if (oldGuideIdx >= 0) {
      guides[oldGuideIdx].current_teams_count = Math.max(0, guides[oldGuideIdx].current_teams_count - 1);
      guides[oldGuideIdx].current_students_count = Math.max(0, guides[oldGuideIdx].current_students_count - teams[teamIdx].members.length);
    }

    // Update new guide counts
    const newGuideIdx = guides.findIndex((g) => g.id === newGuide.id);
    if (newGuideIdx >= 0) {
      guides[newGuideIdx].current_teams_count += 1;
      guides[newGuideIdx].current_students_count += teams[teamIdx].members.length;
    }
    this.saveGuides(guides);

    // Update team
    teams[teamIdx].guide = newGuide;
    teams[teamIdx].last_modified = effectiveDate;
    this.saveTeams(teams);

    this.recordAuditLog({
      teamId: teams[teamIdx].team_id,
      teamName: teams[teamIdx].name,
      category: "Guide Reassigned",
      action: "Project Guide Reassigned",
      description: `Reassigned Guide from ${oldGuide.name} to ${newGuide.name}. Reason: ${reason}. Effective: ${effectiveDate}.`,
      fromState: `Guide: ${oldGuide.name}`,
      toState: `Guide: ${newGuide.name}`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return teams[teamIdx];
  }

  /** Add Student to Existing Team */
  static addStudentToTeam(
    teamId: string,
    unassignedStudentId: string,
    role: TeamRole = "Team Member"
  ): { team: ManagedTeam; student: UnassignedStudent } | null {
    const teams = this.getTeams();
    const unassigned = this.getUnassignedStudents();

    const teamIdx = teams.findIndex((t) => t.team_id === teamId || t.id === teamId);
    if (teamIdx === -1) return null;

    const studentIdx = unassigned.findIndex((s) => s.id === unassignedStudentId);
    if (studentIdx === -1) return null;

    const targetStudent = unassigned[studentIdx];
    const team = teams[teamIdx];

    // Check capacity
    if (team.members.length >= 4) {
      throw new Error("This team already has the maximum capacity of 4 members.");
    }

    // Add to team
    const newMember: ManagedTeamMember = {
      id: `m-${Date.now()}`,
      roll_number: targetStudent.roll_number,
      full_name: targetStudent.full_name,
      email: targetStudent.email,
      role: role,
      joined_date: "07 Sep 2026",
      status: "Active",
    };

    const fromCount = team.members.length;
    team.members.push(newMember);
    team.last_modified = "07 Sep 2026";
    teams[teamIdx] = team;
    this.saveTeams(teams);

    // Remove from unassigned
    unassigned.splice(studentIdx, 1);
    this.saveUnassignedStudents(unassigned);

    // Update Guide student count
    const guides = this.getGuides();
    const gIdx = guides.findIndex((g) => g.id === team.guide.id);
    if (gIdx >= 0) {
      guides[gIdx].current_students_count += 1;
      this.saveGuides(guides);
    }

    this.recordAuditLog({
      teamId: team.team_id,
      teamName: team.name,
      category: "Member Added",
      action: "Student Added to Team",
      description: `Added ${targetStudent.full_name} (${targetStudent.roll_number}) as ${role} to ${team.name}.`,
      fromState: `[${fromCount} Members]`,
      toState: `[${team.members.length} Members (+${targetStudent.full_name})]`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return { team, student: targetStudent };
  }

  /** Remove Student from Team (returns to unassigned pool) */
  static removeStudentFromTeam(
    teamId: string,
    memberId: string,
    reason: string = "Advisor modification"
  ): { team: ManagedTeam; removedMember: ManagedTeamMember; teamAutoDeleted: boolean } | null {
    const teams = this.getTeams();
    const unassigned = this.getUnassignedStudents();

    const teamIdx = teams.findIndex((t) => t.team_id === teamId || t.id === teamId);
    if (teamIdx === -1) return null;

    const team = teams[teamIdx];
    const memberIdx = team.members.findIndex((m) => m.id === memberId || m.roll_number === memberId);
    if (memberIdx === -1) return null;

    const removedMember = team.members[memberIdx];
    const fromCount = team.members.length;

    // Remove member
    team.members.splice(memberIdx, 1);
    team.last_modified = "07 Sep 2026";

    // Return to unassigned pool
    const newUnassigned: UnassignedStudent = {
      id: `u-${Date.now()}`,
      roll_number: removedMember.roll_number,
      full_name: removedMember.full_name,
      email: removedMember.email,
      batch: team.batch,
      section: team.section,
      cgpa: 8.5,
      status: "Unassigned",
    };
    unassigned.push(newUnassigned);
    this.saveUnassignedStudents(unassigned);

    // Check if team is now empty (0 members) -> trigger auto-delete & auto-decrement
    let teamAutoDeleted = false;
    if (team.members.length === 0) {
      this.deleteEmptyTeamAndAutoDecrement(team.team_id, "Automatic cleanup: 0 members remaining");
      teamAutoDeleted = true;
    } else {
      teams[teamIdx] = team;
      this.saveTeams(teams);
    }

    this.recordAuditLog({
      teamId: team.team_id,
      teamName: team.name,
      category: "Member Removed",
      action: "Student Detached from Team",
      description: `Removed ${removedMember.full_name} (${removedMember.roll_number}) from ${team.name}. Reason: ${reason}. Returned to Unassigned pool.`,
      fromState: `[${fromCount} Members]`,
      toState: teamAutoDeleted ? "[Team Deleted (0 Members)]" : `[${team.members.length} Members (-${removedMember.full_name})]`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return { team, removedMember, teamAutoDeleted };
  }

  /** Move Student Between Teams */
  static moveStudent(
    fromTeamId: string,
    toTeamId: string,
    memberId: string,
    newRole: TeamRole = "Team Member",
    reason: string = "Rebalancing cohorts"
  ): boolean {
    const teams = this.getTeams();
    const fromIdx = teams.findIndex((t) => t.team_id === fromTeamId || t.id === fromTeamId);
    const toIdx = teams.findIndex((t) => t.team_id === toTeamId || t.id === toTeamId);

    if (fromIdx === -1 || toIdx === -1) return false;
    const fromTeam = teams[fromIdx];
    const toTeam = teams[toIdx];

    if (toTeam.members.length >= 4) {
      throw new Error(`Target ${toTeam.name} is already at max capacity (4 members).`);
    }

    const memberIdx = fromTeam.members.findIndex((m) => m.id === memberId || m.roll_number === memberId);
    if (memberIdx === -1) return false;

    const [member] = fromTeam.members.splice(memberIdx, 1);
    member.role = newRole;
    member.joined_date = "07 Sep 2026";
    toTeam.members.push(member);

    fromTeam.last_modified = "07 Sep 2026";
    toTeam.last_modified = "07 Sep 2026";

    this.saveTeams(teams);

    this.recordAuditLog({
      teamId: toTeam.team_id,
      teamName: `${fromTeam.name} ➔ ${toTeam.name}`,
      category: "Member Moved",
      action: "Student Transferred Between Teams",
      description: `Transferred ${member.full_name} (${member.roll_number}) from ${fromTeam.name} to ${toTeam.name} as ${newRole}. Reason: ${reason}.`,
      fromState: `${fromTeam.name} (${fromTeam.members.length + 1} ➔ ${fromTeam.members.length})`,
      toState: `${toTeam.name} (${toTeam.members.length - 1} ➔ ${toTeam.members.length})`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return true;
  }

  /** Change Member Role */
  static changeMemberRole(teamId: string, memberId: string, newRole: TeamRole): boolean {
    const teams = this.getTeams();
    const teamIdx = teams.findIndex((t) => t.team_id === teamId || t.id === teamId);
    if (teamIdx === -1) return false;

    const team = teams[teamIdx];
    const member = team.members.find((m) => m.id === memberId || m.roll_number === memberId);
    if (!member) return false;

    const oldRole = member.role;

    // If making leader, demote previous leader to Team Member
    if (newRole === "Team Leader") {
      team.members.forEach((m) => {
        if (m.id !== member.id && m.role === "Team Leader") {
          m.role = "Team Member";
        }
      });
    }

    member.role = newRole;
    team.last_modified = "07 Sep 2026";
    this.saveTeams(teams);

    this.recordAuditLog({
      teamId: team.team_id,
      teamName: team.name,
      category: "Role Changed",
      action: "Team Member Role Modified",
      description: `Updated role of ${member.full_name} (${member.roll_number}) in ${team.name} from ${oldRole} to ${newRole}.`,
      fromState: `Role: ${oldRole}`,
      toState: `Role: ${newRole}`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return true;
  }

  /** Delete Empty Team & Auto-Decrement Team Numbers */
  static deleteEmptyTeamAndAutoDecrement(teamId: string, reason: string = "Empty team disbanded"): boolean {
    let teams = this.getTeams();
    const unassigned = this.getUnassignedStudents();

    const targetIdx = teams.findIndex((t) => t.team_id === teamId || t.id === teamId);
    if (targetIdx === -1) return false;

    const deletedTeam = teams[targetIdx];

    // Return any lingering members to unassigned pool
    deletedTeam.members.forEach((m) => {
      unassigned.push({
        id: `u-${Date.now()}-${m.roll_number}`,
        roll_number: m.roll_number,
        full_name: m.full_name,
        email: m.email,
        batch: deletedTeam.batch,
        section: deletedTeam.section,
        cgpa: 8.5,
        status: "Unassigned",
      });
    });
    this.saveUnassignedStudents(unassigned);

    // Remove the team
    teams.splice(targetIdx, 1);

    // Auto-Decrement / Re-sequence team numbers sequentially (TEAM-001 to TEAM-041)
    teams = teams.map((team, idx) => {
      const newNum = idx + 1;
      const newTeamId = `TEAM-${String(newNum).padStart(3, "0")}`;
      return {
        ...team,
        team_id: newTeamId,
      };
    });

    this.saveTeams(teams);

    this.recordAuditLog({
      teamId: deletedTeam.team_id,
      teamName: deletedTeam.name,
      category: "Team Disbanded",
      action: "Team Disbanded & Sequential Numbers Auto-Decremented",
      description: `Permanently removed ${deletedTeam.name} (${deletedTeam.team_id}). Re-sequenced remaining ${teams.length} teams sequentially without gaps. Reason: ${reason}.`,
      fromState: `${deletedTeam.name} Active`,
      toState: `Team Disbanded & Numbers Auto-Decremented (Total: ${teams.length})`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return true;
  }

  /** Bulk Assign Students to Team */
  static bulkAssignStudents(
    studentIds: string[],
    targetTeamId: string,
    role: TeamRole = "Team Member"
  ): boolean {
    const teams = this.getTeams();
    const unassigned = this.getUnassignedStudents();

    const teamIdx = teams.findIndex((t) => t.team_id === targetTeamId || t.id === targetTeamId);
    if (teamIdx === -1) return false;

    const team = teams[teamIdx];
    const availableSlots = 4 - team.members.length;
    if (studentIds.length > availableSlots) {
      throw new Error(`Target ${team.name} only has ${availableSlots} open member slot(s).`);
    }

    const studentsToAssign = unassigned.filter((u) => studentIds.includes(u.id));

    studentsToAssign.forEach((student) => {
      team.members.push({
        id: `m-${Date.now()}-${student.roll_number}`,
        roll_number: student.roll_number,
        full_name: student.full_name,
        email: student.email,
        role: role,
        joined_date: "07 Sep 2026",
        status: "Active",
      });
    });

    team.last_modified = "07 Sep 2026";
    this.saveTeams(teams);

    const updatedUnassigned = unassigned.filter((u) => !studentIds.includes(u.id));
    this.saveUnassignedStudents(updatedUnassigned);

    this.recordAuditLog({
      teamId: team.team_id,
      teamName: team.name,
      category: "Member Added",
      action: "Bulk Students Assigned",
      description: `Bulk assigned ${studentsToAssign.length} student(s) (${studentsToAssign.map((s) => s.full_name).join(", ")}) to ${team.name}.`,
      fromState: `[${team.members.length - studentsToAssign.length} Members]`,
      toState: `[${team.members.length} Members]`,
      changedBy: "Dr. K. Senthil Kumar (Class Advisor)",
    });

    return true;
  }
}
