// ============================================================================
// HOD CENTRAL MANAGEMENT & CONTROL SERVICE (v3)
// Institution: Sri Indu Engineering & Technology (SIET Autonomous)
// Department: Computer Science & Engineering
// ============================================================================

export interface ManagementBatch {
  id: string;
  name: string; // e.g. "2025–2029"
  department: string; // e.g. "CSE"
  duration: string; // e.g. "4 Years"
  start_year: number;
  end_year: number;
  status: "Active" | "Inactive";
  classes: ManagementClass[];
  students_count: number;
  teams_count: number;
}

export interface ManagementClass {
  id: string;
  name: string; // e.g. "CSE-A"
  batch_name: string; // e.g. "2025–2029"
  advisor_id: string;
  advisor_name: string;
  advisor_email: string;
  students_count: number;
  teams_count: number;
  status: "Active" | "Inactive";
}

export interface ManagementStudent {
  id: string;
  roll_number: string;
  full_name: string;
  email: string;
  batch: string;
  class_name: string;
  team_id: string;
  team_name: string;
  advisor_name: string;
  guide_name: string;
  status: "Active" | "Inactive";
  joined_date?: string;
}

export interface ManagementAdvisor {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  batch: string;
  assigned_class: string;
  teams_count: number;
  students_count: number;
  status: "Active" | "Inactive";
}

export interface ManagementGuide {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  batch: string;
  assigned_teams: string[]; // Team IDs
  assigned_teams_names: string[]; // Team names for quick display
  active_projects_count: number;
  max_teams_limit: number;
  status: "Active" | "Inactive";
}

export interface ManagementTeamMember {
  id: string;
  roll_number: string;
  full_name: string;
  role: string;
  email?: string;
}

export interface ManagementProjectDetails {
  title: string;
  description: string;
  domain: string;
  status: "In Progress" | "Completed" | "Review Pending" | "Approved" | string;
  github_url?: string;
  demo_url?: string;
  live_demo_url?: string;
  current_stage: string;
  problem_statement?: string;
  proposed_solution?: string;
  technologies_used?: string;
}

export interface ManagementTeam {
  id: string;
  team_id: string;
  name: string; // e.g. "Team 01"
  batch: string;
  class_name: string;
  advisor_id: string;
  advisor_name: string;
  guide_id: string;
  guide_name: string;
  members: ManagementTeamMember[];
  project: ManagementProjectDetails;
  status: "Active" | "Inactive";
  created_at: string;
  last_modified: string;
}

export interface ActivityHistoryRecord {
  id: string;
  timestamp: string;
  date_formatted: string;
  user_name: string;
  user_role: string;
  action_type:
    | "CREATE"
    | "UPDATE"
    | "ASSIGN"
    | "REASSIGN"
    | "MOVE"
    | "DEACTIVATE"
    | "DELETE";
  entity_type:
    | "BATCH"
    | "CLASS"
    | "STUDENT"
    | "ADVISOR"
    | "GUIDE"
    | "TEAM"
    | "PROJECT";
  entity_id: string;
  entity_name: string;
  description: string;
  previous_value?: string;
  new_value?: string;
}

const STORAGE_KEYS = {
  BATCHES: "siet_hod_mgmt_v4_batches",
  STUDENTS: "siet_hod_mgmt_v4_students",
  ADVISORS: "siet_hod_mgmt_v4_advisors",
  GUIDES: "siet_hod_mgmt_v4_guides",
  TEAMS: "siet_hod_mgmt_v4_teams",
  ACTIVITY_HISTORY: "siet_hod_mgmt_v4_activity_history",
};

// ============================================================================
// INITIAL SEED DATA (ALIGNED WITH PROMPT SCENARIOS)
// ============================================================================

export const initialBatches: ManagementBatch[] = [
  {
    id: "batch-2025-2029",
    name: "2025–2029",
    department: "CSE",
    duration: "4 Years",
    start_year: 2025,
    end_year: 2029,
    status: "Active",
    students_count: 42,
    teams_count: 10,
    classes: [
      {
        id: "cls-a",
        name: "CSE-A",
        batch_name: "2025–2029",
        advisor_id: "adv-arun",
        advisor_name: "Dr. Arun",
        advisor_email: "arun.cse@siet.ac.in",
        students_count: 17,
        teams_count: 4,
        status: "Active",
      },
      {
        id: "cls-b",
        name: "CSE-B",
        batch_name: "2025–2029",
        advisor_id: "adv-priya",
        advisor_name: "Dr. Priya",
        advisor_email: "priya.cse@siet.ac.in",
        students_count: 9,
        teams_count: 2,
        status: "Active",
      },
      {
        id: "cls-c",
        name: "CSE-C",
        batch_name: "2025–2029",
        advisor_id: "adv-kumar",
        advisor_name: "Dr. Kumar",
        advisor_email: "kumar.cse@siet.ac.in",
        students_count: 8,
        teams_count: 2,
        status: "Active",
      },
      {
        id: "cls-d",
        name: "CSE-D",
        batch_name: "2025–2029",
        advisor_id: "adv-meena",
        advisor_name: "Dr. Meena",
        advisor_email: "meena.cse@siet.ac.in",
        students_count: 4,
        teams_count: 1,
        status: "Active",
      },
      {
        id: "cls-e",
        name: "CSE-E",
        batch_name: "2025–2029",
        advisor_id: "adv-ravi",
        advisor_name: "Dr. Ravi",
        advisor_email: "ravi.cse@siet.ac.in",
        students_count: 4,
        teams_count: 1,
        status: "Active",
      },
    ],
  },
];

export const initialAdvisors: ManagementAdvisor[] = [
  {
    id: "adv-arun",
    name: "Dr. Arun",
    designation: "Associate Professor",
    department: "CSE",
    email: "arun.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_class: "CSE-A",
    teams_count: 4,
    students_count: 17,
    status: "Active",
  },
  {
    id: "adv-priya",
    name: "Dr. Priya",
    designation: "Associate Professor",
    department: "CSE",
    email: "priya.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_class: "CSE-B",
    teams_count: 2,
    students_count: 9,
    status: "Active",
  },
  {
    id: "adv-kumar",
    name: "Dr. Kumar",
    designation: "Professor",
    department: "CSE",
    email: "kumar.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_class: "CSE-C",
    teams_count: 2,
    students_count: 8,
    status: "Active",
  },
  {
    id: "adv-meena",
    name: "Dr. Meena",
    designation: "Professor",
    department: "CSE",
    email: "meena.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_class: "CSE-D",
    teams_count: 1,
    students_count: 4,
    status: "Active",
  },
  {
    id: "adv-ravi",
    name: "Dr. Ravi",
    designation: "Associate Professor",
    department: "CSE",
    email: "ravi.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_class: "CSE-E",
    teams_count: 1,
    students_count: 4,
    status: "Active",
  },
];

export const initialGuides: ManagementGuide[] = [
  {
    id: "guide-staff-a",
    name: "Staff A",
    designation: "Assistant Professor",
    department: "CSE",
    email: "staffA.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_teams: ["team-01", "team-04", "team-07"],
    assigned_teams_names: ["Team 01", "Team 04", "Team 07"],
    active_projects_count: 3,
    max_teams_limit: 5,
    status: "Active",
  },
  {
    id: "guide-staff-b",
    name: "Staff B",
    designation: "Assistant Professor",
    department: "CSE",
    email: "staffB.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_teams: ["team-02", "team-05", "team-08"],
    assigned_teams_names: ["Team 02", "Team 05", "Team 08"],
    active_projects_count: 3,
    max_teams_limit: 5,
    status: "Active",
  },
  {
    id: "guide-staff-c",
    name: "Staff C",
    designation: "Associate Professor",
    department: "CSE",
    email: "staffC.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_teams: ["team-03", "team-06", "team-09"],
    assigned_teams_names: ["Team 03", "Team 06", "Team 09"],
    active_projects_count: 3,
    max_teams_limit: 5,
    status: "Active",
  },
  {
    id: "guide-staff-d",
    name: "Staff D",
    designation: "Assistant Professor",
    department: "CSE",
    email: "staffD.cse@siet.ac.in",
    batch: "2025–2029",
    assigned_teams: ["team-10"],
    assigned_teams_names: ["Team 10"],
    active_projects_count: 1,
    max_teams_limit: 5,
    status: "Active",
  },
];

export const initialTeams: ManagementTeam[] = [
  {
    id: "team-01",
    team_id: "T01",
    name: "Team 01",
    batch: "2025–2029",
    class_name: "CSE-A",
    advisor_id: "adv-arun",
    advisor_name: "Dr. Arun",
    guide_id: "guide-staff-a",
    guide_name: "Staff A",
    status: "Active",
    created_at: "01 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Smart Agriculture Monitoring",
      description: "AI-powered crop monitoring, soil health assessment, and disease prediction system.",
      domain: "Artificial Intelligence & Edge Vision",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/smart-agriculture-ai",
      demo_url: "https://agriculture.siet.ac.in",
      current_stage: "Review 3 — Implementation & Oral Defense",
    },
    members: [
      { id: "m-1", roll_number: "25CSE001", full_name: "Student A", role: "Team Lead", email: "studentA@siet.ac.in" },
      { id: "m-2", roll_number: "25CSE002", full_name: "Student B", role: "Member", email: "studentB@siet.ac.in" },
      { id: "m-3", roll_number: "25CSE003", full_name: "Student C", role: "Member", email: "studentC@siet.ac.in" },
      { id: "m-4", roll_number: "25CSE004", full_name: "Student D", role: "Member", email: "studentD@siet.ac.in" },
    ],
  },
  {
    id: "team-02",
    team_id: "T02",
    name: "Team 02",
    batch: "2025–2029",
    class_name: "CSE-A",
    advisor_id: "adv-arun",
    advisor_name: "Dr. Arun",
    guide_id: "guide-staff-b",
    guide_name: "Staff B",
    status: "Active",
    created_at: "01 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Waste AI & Robotic Segregation",
      description: "Automated municipal dry and wet recyclable waste sorting pipeline with robotic vision.",
      domain: "Robotics & Computer Vision",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/waste-ai-segregation",
      demo_url: "https://wasteai.siet.ac.in",
      current_stage: "Review 3 — Model Verification",
    },
    members: [
      { id: "m-5", roll_number: "25CSE005", full_name: "Rahul Sharma", role: "Team Lead", email: "rahul.25cs@siet.ac.in" },
      { id: "m-6", roll_number: "25CSE006", full_name: "Priya Dharshini", role: "Member", email: "priya.25cs@siet.ac.in" },
      { id: "m-7", roll_number: "25CSE007", full_name: "Karthik Raja", role: "Member", email: "karthik.25cs@siet.ac.in" },
      { id: "m-8", roll_number: "25CSE008", full_name: "Ananya Iyer", role: "Member", email: "ananya.25cs@siet.ac.in" },
      { id: "m-9", roll_number: "25CSE009", full_name: "Naveen Raj", role: "Member", email: "naveen.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-03",
    team_id: "T03",
    name: "Team 03",
    batch: "2025–2029",
    class_name: "CSE-A",
    advisor_id: "adv-arun",
    advisor_name: "Dr. Arun",
    guide_id: "guide-staff-c",
    guide_name: "Staff C",
    status: "Active",
    created_at: "02 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Health AI Cardiovascular Telemetry",
      description: "Non-invasive ECG signal anomaly detection using lightweight transformers.",
      domain: "Healthcare AI & Deep Learning",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/health-ai-ecg",
      demo_url: "https://healthai.siet.ac.in",
      current_stage: "Review 3 — Clinical Dataset Validation",
    },
    members: [
      { id: "m-10", roll_number: "25CSE010", full_name: "Siddharth B", role: "Team Lead", email: "siddharth.25cs@siet.ac.in" },
      { id: "m-11", roll_number: "25CSE011", full_name: "Meera T", role: "Member", email: "meera.25cs@siet.ac.in" },
      { id: "m-12", roll_number: "25CSE012", full_name: "Ashwin K", role: "Member", email: "ashwin.25cs@siet.ac.in" },
      { id: "m-13", roll_number: "25CSE013", full_name: "Pavithra S", role: "Member", email: "pavithra.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-04",
    team_id: "T04",
    name: "Team 04",
    batch: "2025–2029",
    class_name: "CSE-A",
    advisor_id: "adv-arun",
    advisor_name: "Dr. Arun",
    guide_id: "guide-staff-a",
    guide_name: "Staff A",
    status: "Active",
    created_at: "03 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Water Management & Urban Drainage IoT",
      description: "Low-power LoRa mesh sensor network predicting localized flash floods.",
      domain: "Internet of Things (IoT)",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/water-iot-mesh",
      demo_url: "https://water.siet.ac.in",
      current_stage: "Review 2 — Sensor Calibration",
    },
    members: [
      { id: "m-14", roll_number: "25CSE014", full_name: "Sanjay K", role: "Team Lead", email: "sanjay.25cs@siet.ac.in" },
      { id: "m-15", roll_number: "25CSE015", full_name: "Deepa R", role: "Member", email: "deepa.25cs@siet.ac.in" },
      { id: "m-16", roll_number: "25CSE016", full_name: "Vignesh M", role: "Member", email: "vignesh.25cs@siet.ac.in" },
      { id: "m-17", roll_number: "25CSE017", full_name: "Divya S", role: "Member", email: "divya.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-05",
    team_id: "T05",
    name: "Team 05",
    batch: "2025–2029",
    class_name: "CSE-B",
    advisor_id: "adv-priya",
    advisor_name: "Dr. Priya",
    guide_id: "guide-staff-b",
    guide_name: "Staff B",
    status: "Active",
    created_at: "04 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Solar Grid Optimization & Energy Trading",
      description: "Microgrid peer-to-peer renewable energy dispatch engine using smart contracts.",
      domain: "Energy Systems & Blockchain",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/solar-grid-trading",
      demo_url: "https://solargrid.siet.ac.in",
      current_stage: "Review 3 — Simulation Verification",
    },
    members: [
      { id: "m-18", roll_number: "25CSE018", full_name: "Arun Prakash", role: "Team Lead", email: "arun.prakash@siet.ac.in" },
      { id: "m-19", roll_number: "25CSE019", full_name: "Swathi M", role: "Member", email: "swathi.25cs@siet.ac.in" },
      { id: "m-20", roll_number: "25CSE020", full_name: "Bhavana V", role: "Member", email: "bhavana.25cs@siet.ac.in" },
      { id: "m-21", roll_number: "25CSE021", full_name: "Kishore R", role: "Member", email: "kishore.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-06",
    team_id: "T06",
    name: "Team 06",
    batch: "2025–2029",
    class_name: "CSE-B",
    advisor_id: "adv-priya",
    advisor_name: "Dr. Priya",
    guide_id: "guide-staff-c",
    guide_name: "Staff C",
    status: "Active",
    created_at: "05 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "EV Fleet Telemetry & Smart Charging",
      description: "Reinforcement learning for dynamic battery state forecasting and fleet queue scheduling.",
      domain: "CleanTech & RL",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/ev-fleet-telemetry",
      demo_url: "https://evtelemetry.siet.ac.in",
      current_stage: "Review 2 — Queue Simulation",
    },
    members: [
      { id: "m-22", roll_number: "25CSE022", full_name: "Gokul N", role: "Team Lead", email: "gokul.25cs@siet.ac.in" },
      { id: "m-23", roll_number: "25CSE023", full_name: "Sandhya V", role: "Member", email: "sandhya.25cs@siet.ac.in" },
      { id: "m-24", roll_number: "25CSE024", full_name: "Harish S", role: "Member", email: "harish.25cs@siet.ac.in" },
      { id: "m-25", roll_number: "25CSE025", full_name: "Keerthana M", role: "Member", email: "keerthana.25cs@siet.ac.in" },
      { id: "m-26", roll_number: "25CSE026", full_name: "Manoj K", role: "Member", email: "manoj.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-07",
    team_id: "T07",
    name: "Team 07",
    batch: "2025–2029",
    class_name: "CSE-C",
    advisor_id: "adv-kumar",
    advisor_name: "Dr. Kumar",
    guide_id: "guide-staff-a",
    guide_name: "Staff A",
    status: "Active",
    created_at: "06 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Automated Soil Moisture Sensing & Drip Control",
      description: "Sub-surface dielectric moisture measurement with cloud edge actuators for precision farms.",
      domain: "IoT & Embedded Systems",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/soil-moisture-drip",
      demo_url: "https://soilmoisture.siet.ac.in",
      current_stage: "Review 3 — Actuator Calibration",
    },
    members: [
      { id: "m-27", roll_number: "25CSE027", full_name: "Lavanya T", role: "Team Lead", email: "lavanya.25cs@siet.ac.in" },
      { id: "m-28", roll_number: "25CSE028", full_name: "Saravanan P", role: "Member", email: "saravanan.25cs@siet.ac.in" },
      { id: "m-29", roll_number: "25CSE029", full_name: "Geetha K", role: "Member", email: "geetha.25cs@siet.ac.in" },
      { id: "m-30", roll_number: "25CSE030", full_name: "Dinesh B", role: "Member", email: "dinesh.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-08",
    team_id: "T08",
    name: "Team 08",
    batch: "2025–2029",
    class_name: "CSE-C",
    advisor_id: "adv-kumar",
    advisor_name: "Dr. Kumar",
    guide_id: "guide-staff-b",
    guide_name: "Staff B",
    status: "Active",
    created_at: "07 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Predictive Fault Diagnosis for Wind Turbines",
      description: "Vibration frequency spectrum anomaly identification via edge 1D CNNs.",
      domain: "Machine Learning & Industrial IoT",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/turbine-fault-ai",
      demo_url: "https://windfault.siet.ac.in",
      current_stage: "Review 2 — Acoustic Testing",
    },
    members: [
      { id: "m-31", roll_number: "25CSE031", full_name: "Venkat R", role: "Team Lead", email: "venkat.25cs@siet.ac.in" },
      { id: "m-32", roll_number: "25CSE032", full_name: "Divyashree C", role: "Member", email: "divyashree.25cs@siet.ac.in" },
      { id: "m-33", roll_number: "25CSE033", full_name: "Ramesh M", role: "Member", email: "ramesh.25cs@siet.ac.in" },
      { id: "m-34", roll_number: "25CSE034", full_name: "Shalini S", role: "Member", email: "shalini.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-09",
    team_id: "T09",
    name: "Team 09",
    batch: "2025–2029",
    class_name: "CSE-D",
    advisor_id: "adv-meena",
    advisor_name: "Dr. Meena",
    guide_id: "guide-staff-c",
    guide_name: "Staff C",
    status: "Active",
    created_at: "08 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Drone Wildfire Detection & Thermal Mapping",
      description: "UAV infrared thermal imaging pipeline detecting forest smoldering anomalies.",
      domain: "Computer Vision & Autonomous Drones",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/drone-wildfire-vision",
      demo_url: "https://wildfire.siet.ac.in",
      current_stage: "Review 3 — Flight Verification",
    },
    members: [
      { id: "m-35", roll_number: "25CSE035", full_name: "Balaji V", role: "Team Lead", email: "balaji.25cs@siet.ac.in" },
      { id: "m-36", roll_number: "25CSE036", full_name: "Shobana K", role: "Member", email: "shobana.25cs@siet.ac.in" },
      { id: "m-37", roll_number: "25CSE037", full_name: "Karthikeyan L", role: "Member", email: "karthikeyan.25cs@siet.ac.in" },
      { id: "m-38", roll_number: "25CSE038", full_name: "Monika R", role: "Member", email: "monika.25cs@siet.ac.in" },
    ],
  },
  {
    id: "team-10",
    team_id: "T10",
    name: "Team 10",
    batch: "2025–2029",
    class_name: "CSE-E",
    advisor_id: "adv-ravi",
    advisor_name: "Dr. Ravi",
    guide_id: "guide-staff-d",
    guide_name: "Staff D",
    status: "Active",
    created_at: "09 Jul 2026",
    last_modified: "08 Sep 2026",
    project: {
      title: "Smart Traffic Flow AI & Congestion Mitigation",
      description: "Multi-agent deep reinforcement learning for adaptive traffic intersection signal control.",
      domain: "Smart Cities & Intelligent Systems",
      status: "In Progress",
      github_url: "https://github.com/siet-coe/smart-traffic-flow-ai",
      demo_url: "https://traffic.siet.ac.in",
      current_stage: "Review 3 — City Simulator Testing",
    },
    members: [
      { id: "m-39", roll_number: "25CSE039", full_name: "Rajarajan S", role: "Team Lead", email: "rajarajan.25cs@siet.ac.in" },
      { id: "m-40", roll_number: "25CSE040", full_name: "Nithya P", role: "Member", email: "nithya.25cs@siet.ac.in" },
      { id: "m-41", roll_number: "25CSE041", full_name: "Prabhu G", role: "Member", email: "prabhu.25cs@siet.ac.in" },
      { id: "m-42", roll_number: "25CSE042", full_name: "Archana M", role: "Member", email: "archana.25cs@siet.ac.in" },
    ],
  },
];

// Helper to seed students directly from initial teams
export const initialStudents: ManagementStudent[] = initialTeams.flatMap((team) =>
  team.members.map((member) => ({
    id: `s-${member.id}`,
    roll_number: member.roll_number,
    full_name: member.full_name,
    email: member.email || `${member.roll_number.toLowerCase()}@siet.ac.in`,
    batch: team.batch,
    class_name: team.class_name,
    team_id: team.id,
    team_name: team.name,
    advisor_name: team.advisor_name,
    guide_name: team.guide_name,
    status: team.status,
    joined_date: "01 Jul 2026",
  }))
);

export const initialActivityHistory: ActivityHistoryRecord[] = [
  {
    id: "act-201",
    timestamp: "2026-09-08T11:30:00Z",
    date_formatted: "08 Sep 2026 • 11:30 AM",
    user_name: "Dr. K. Senthil Kumar",
    user_role: "Head of Department",
    action_type: "CREATE",
    entity_type: "TEAM",
    entity_id: "team-01",
    entity_name: "Team 01",
    description: "HOD approved Team 01 (CSE-A • 2025–2029) with Guide: Staff A and Advisor: Dr. Arun",
    previous_value: "None",
    new_value: "Team 01 • Smart Agriculture Monitoring",
  },
  {
    id: "act-202",
    timestamp: "2026-09-08T11:15:00Z",
    date_formatted: "08 Sep 2026 • 11:15 AM",
    user_name: "Dr. K. Senthil Kumar",
    user_role: "Head of Department",
    action_type: "ASSIGN",
    entity_type: "ADVISOR",
    entity_id: "adv-arun",
    entity_name: "Dr. Arun",
    description: "HOD confirmed Dr. Arun as Class Advisor for CSE-A (2025–2029)",
    previous_value: "Unassigned",
    new_value: "Dr. Arun (CSE-A)",
  },
  {
    id: "act-203",
    timestamp: "2026-09-08T11:00:00Z",
    date_formatted: "08 Sep 2026 • 11:00 AM",
    user_name: "Dr. K. Senthil Kumar",
    user_role: "Head of Department",
    action_type: "ASSIGN",
    entity_type: "GUIDE",
    entity_id: "guide-staff-a",
    entity_name: "Staff A",
    description: "HOD assigned Project Guide Staff A to mentor Team 01, Team 04, and Team 07",
    previous_value: "None",
    new_value: "3 Teams Allocated",
  },
];

// ============================================================================
// SERVICE CLASS WITH GLOBAL INTERCONNECTED PERSISTENCE
// ============================================================================

let memBatches = [...initialBatches];
let memStudents = [...initialStudents];
let memAdvisors = [...initialAdvisors];
let memGuides = [...initialGuides];
let memTeams = [...initialTeams];
let memActivity = [...initialActivityHistory];
let memDraft: unknown = null;

export class HodManagementService {
  // 1. Batches
  static getBatches(): ManagementBatch[] {
    if (typeof window === "undefined") return memBatches;
    const stored = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(initialBatches));
      return initialBatches;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialBatches;
    }
  }

  static saveBatches(batches: ManagementBatch[]): void {
    memBatches = batches;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    }
  }

  // 2. Students
  static getStudents(): ManagementStudent[] {
    if (typeof window === "undefined") return memStudents;
    const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
      return initialStudents;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialStudents;
    }
  }

  static saveStudents(students: ManagementStudent[]): void {
    memStudents = students;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }

  // 3. Advisors
  static getAdvisors(): ManagementAdvisor[] {
    if (typeof window === "undefined") return memAdvisors;
    const stored = localStorage.getItem(STORAGE_KEYS.ADVISORS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ADVISORS, JSON.stringify(initialAdvisors));
      return initialAdvisors;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialAdvisors;
    }
  }

  static saveAdvisors(advisors: ManagementAdvisor[]): void {
    memAdvisors = advisors;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ADVISORS, JSON.stringify(advisors));
    }
  }

  // 4. Guides
  static getGuides(): ManagementGuide[] {
    if (typeof window === "undefined") return memGuides;
    const stored = localStorage.getItem(STORAGE_KEYS.GUIDES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(initialGuides));
      return initialGuides;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialGuides;
    }
  }

  static saveGuides(guides: ManagementGuide[]): void {
    memGuides = guides;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
    }
  }

  // 5. Teams
  static getTeams(): ManagementTeam[] {
    if (typeof window === "undefined") return memTeams;
    const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(initialTeams));
      return initialTeams;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialTeams;
    }
  }

  static saveTeams(teams: ManagementTeam[]): void {
    memTeams = teams;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    }
  }

  // 6. Activity History
  static getActivityHistory(): ActivityHistoryRecord[] {
    if (typeof window === "undefined") return memActivity;
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_HISTORY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_HISTORY, JSON.stringify(initialActivityHistory));
      return initialActivityHistory;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return initialActivityHistory;
    }
  }

  static recordActivity(
    record: Omit<ActivityHistoryRecord, "id" | "timestamp" | "date_formatted">
  ): ActivityHistoryRecord {
    const history = this.getActivityHistory();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newRecord: ActivityHistoryRecord = {
      ...record,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toISOString(),
      date_formatted: dateFormatted,
    };

    const updated = [newRecord, ...history];
    memActivity = updated;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_HISTORY, JSON.stringify(updated));
    }
    return newRecord;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GLOBAL ENTITY RECALCULATION HELPER
  // ──────────────────────────────────────────────────────────────────────────
  static syncEntityCounts(): void {
    const teams = this.getTeams();
    const advisors = this.getAdvisors();
    const guides = this.getGuides();
    const batches = this.getBatches();

    // 1. Recalculate advisors
    advisors.forEach((adv) => {
      const activeAdvisorTeams = teams.filter(
        (t) => (t.advisor_id === adv.id || t.advisor_name === adv.name) && t.status === "Active"
      );
      adv.teams_count = activeAdvisorTeams.length;
      adv.students_count = activeAdvisorTeams.reduce(
        (sum, t) => sum + (t.members?.length || 0),
        0
      );
    });
    this.saveAdvisors(advisors);

    // 2. Recalculate guides
    guides.forEach((guide) => {
      const activeGuideTeams = teams.filter(
        (t) => (t.guide_id === guide.id || t.guide_name === guide.name) && t.status === "Active"
      );
      guide.assigned_teams = activeGuideTeams.map((t) => t.id);
      guide.assigned_teams_names = activeGuideTeams.map((t) => t.name);
      guide.active_projects_count = activeGuideTeams.length;
    });
    this.saveGuides(guides);

    // 3. Recalculate batches and classes
    batches.forEach((batch) => {
      let bStudents = 0;
      let bTeams = 0;
      batch.classes.forEach((cls) => {
        const classTeams = teams.filter(
          (t) => t.batch === batch.name && t.class_name === cls.name && t.status === "Active"
        );
        cls.teams_count = classTeams.length;
        cls.students_count = classTeams.reduce(
          (sum, t) => sum + (t.members?.length || 0),
          0
        );
        bTeams += cls.teams_count;
        bStudents += cls.students_count;
      });
      batch.teams_count = bTeams;
      batch.students_count = bStudents;
    });
    this.saveBatches(batches);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HIGHER LEVEL MANAGEMENT ACTIONS (WITH GLOBAL REASSIGNMENT)
  // ──────────────────────────────────────────────────────────────────────────

  // Edit Batch
  static updateBatch(
    batchId: string,
    updates: Partial<ManagementBatch>
  ): ManagementBatch | null {
    const batches = this.getBatches();
    const idx = batches.findIndex((b) => b.id === batchId);
    if (idx === -1) return null;

    const prev = batches[idx];
    const updated = { ...prev, ...updates };
    batches[idx] = updated;
    this.saveBatches(batches);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "UPDATE",
      entity_type: "BATCH",
      entity_id: batchId,
      entity_name: updated.name,
      description: `HOD updated batch configuration for ${updated.name}`,
      previous_value: `Status: ${prev.status}, Classes: ${prev.classes.length}`,
      new_value: `Status: ${updated.status}, Classes: ${updated.classes.length}`,
    });

    return updated;
  }

  // Create Batch
  static createBatch(batchData: Omit<ManagementBatch, "id">): ManagementBatch {
    const batches = this.getBatches();
    const newBatch: ManagementBatch = {
      ...batchData,
      id: `batch-${Date.now()}`,
    };
    batches.unshift(newBatch);
    this.saveBatches(batches);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "CREATE",
      entity_type: "BATCH",
      entity_id: newBatch.id,
      entity_name: newBatch.name,
      description: `HOD created new batch ${newBatch.name} (${newBatch.department} - ${newBatch.duration})`,
      previous_value: "None",
      new_value: `${newBatch.name} (${newBatch.classes.length} classes)`,
    });

    return newBatch;
  }

  // Edit Student (Move team / update info)
  static updateStudent(
    studentId: string,
    updates: Partial<ManagementStudent>
  ): ManagementStudent | null {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === studentId);
    if (idx === -1) return null;

    const prev = students[idx];
    const updated = { ...prev, ...updates };
    students[idx] = updated;
    this.saveStudents(students);

    const isTeamMoved = updates.team_id && updates.team_id !== prev.team_id;

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: isTeamMoved ? "MOVE" : "UPDATE",
      entity_type: "STUDENT",
      entity_id: studentId,
      entity_name: `${updated.full_name} (${updated.roll_number})`,
      description: isTeamMoved
        ? `HOD transferred student ${updated.full_name} from ${prev.team_name} to ${updated.team_name}`
        : `HOD updated student information for ${updated.full_name}`,
      previous_value: `Team: ${prev.team_name}, Class: ${prev.class_name}`,
      new_value: `Team: ${updated.team_name}, Class: ${updated.class_name}`,
    });

    return updated;
  }

  // Create Student
  static createStudent(studentData: Omit<ManagementStudent, "id">): ManagementStudent {
    const students = this.getStudents();
    const newStudent: ManagementStudent = {
      ...studentData,
      id: `s-${Date.now()}`,
    };
    students.unshift(newStudent);
    this.saveStudents(students);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "CREATE",
      entity_type: "STUDENT",
      entity_id: newStudent.id,
      entity_name: `${newStudent.full_name} (${newStudent.roll_number})`,
      description: `HOD enrolled student ${newStudent.full_name} in ${newStudent.batch} (${newStudent.class_name})`,
      previous_value: "None",
      new_value: `Assigned to ${newStudent.team_name || "Unassigned"}`,
    });

    return newStudent;
  }

  // Assign / Reassign Class Advisor
  static reassignClassAdvisor(
    classId: string,
    batchName: string,
    className: string,
    newAdvisorId: string,
    newAdvisorName: string
  ): boolean {
    const batches = this.getBatches();
    const batch = batches.find((b) => b.name === batchName);
    if (!batch) return false;

    const cls = batch.classes.find((c) => c.name === className || c.id === classId);
    if (!cls) return false;

    const prevAdvisorName = cls.advisor_name;
    cls.advisor_id = newAdvisorId;
    cls.advisor_name = newAdvisorName;
    this.saveBatches(batches);

    // Also update Advisors list assigned_class
    const advisors = this.getAdvisors();
    advisors.forEach((adv) => {
      if (adv.id === newAdvisorId) {
        adv.assigned_class = className;
        adv.batch = batchName;
      }
    });
    this.saveAdvisors(advisors);

    // Sync all teams in this class to the new advisor
    const teams = this.getTeams();
    teams.forEach((t) => {
      if (t.batch === batchName && t.class_name === className) {
        t.advisor_id = newAdvisorId;
        t.advisor_name = newAdvisorName;
      }
    });
    this.saveTeams(teams);

    // Sync students in this class
    const students = this.getStudents();
    students.forEach((st) => {
      if (st.batch === batchName && st.class_name === className) {
        st.advisor_name = newAdvisorName;
      }
    });
    this.saveStudents(students);

    this.syncEntityCounts();

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "REASSIGN",
      entity_type: "ADVISOR",
      entity_id: classId,
      entity_name: `${className} (${batchName})`,
      description: `HOD changed Class Advisor for ${className}: ${prevAdvisorName} → ${newAdvisorName}`,
      previous_value: prevAdvisorName,
      new_value: newAdvisorName,
    });

    return true;
  }

  // Update Guide Team Assignments
  static updateGuideTeams(
    guideId: string,
    newTeamIds: string[],
    newTeamNames: string[]
  ): boolean {
    const guides = this.getGuides();
    const guide = guides.find((g) => g.id === guideId);
    if (!guide) return false;

    const prevTeamNames = [...guide.assigned_teams_names];
    guide.assigned_teams = newTeamIds;
    guide.assigned_teams_names = newTeamNames;
    guide.active_projects_count = newTeamIds.length;
    this.saveGuides(guides);

    // Update teams guide
    const teams = this.getTeams();
    teams.forEach((t) => {
      if (newTeamIds.includes(t.id)) {
        t.guide_id = guide.id;
        t.guide_name = guide.name;
      } else if (t.guide_id === guide.id) {
        t.guide_id = "";
        t.guide_name = "Unassigned";
      }
    });
    this.saveTeams(teams);

    // Sync students
    const students = this.getStudents();
    students.forEach((st) => {
      if (newTeamIds.includes(st.team_id)) {
        st.guide_name = guide.name;
      } else if (st.guide_name === guide.name) {
        st.guide_name = "Unassigned";
      }
    });
    this.saveStudents(students);

    this.syncEntityCounts();

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "ASSIGN",
      entity_type: "GUIDE",
      entity_id: guideId,
      entity_name: guide.name,
      description: `HOD updated team assignments for Guide ${guide.name} (${newTeamIds.length} Teams)`,
      previous_value: prevTeamNames.join(", ") || "None",
      new_value: newTeamNames.join(", ") || "None",
    });

    return true;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE TEAM (GLOBAL ATOMIC REASSIGNMENT ENGINE)
  // ──────────────────────────────────────────────────────────────────────────
  static updateTeam(
    teamId: string,
    updates: Partial<ManagementTeam>
  ): ManagementTeam | null {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === teamId || t.team_id === teamId);
    if (idx === -1) return null;

    const prev = teams[idx];
    const updated: ManagementTeam = {
      ...prev,
      ...updates,
      last_modified: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    teams[idx] = updated;
    this.saveTeams(teams);

    const isGuideChanged = updates.guide_id && updates.guide_id !== prev.guide_id;
    const isAdvisorChanged = updates.advisor_id && updates.advisor_id !== prev.advisor_id;
    const isClassChanged = updates.class_name && updates.class_name !== prev.class_name;

    // Synchronize all students belonging to this team!
    const students = this.getStudents();
    let studentsModified = false;
    students.forEach((st) => {
      if (st.team_id === updated.id || st.team_id === updated.team_id || st.team_name === prev.name) {
        st.team_name = updated.name;
        st.class_name = updated.class_name;
        st.batch = updated.batch;
        st.advisor_name = updated.advisor_name;
        st.guide_name = updated.guide_name;
        studentsModified = true;
      }
    });
    if (studentsModified) {
      this.saveStudents(students);
    }

    // Sync all entity counters across advisors, guides, and batches!
    this.syncEntityCounts();

    // Prepare clear, precise audit log
    let desc = `HOD updated ${updated.name} details`;
    let actionType: ActivityHistoryRecord["action_type"] = "UPDATE";

    if (isAdvisorChanged && isGuideChanged) {
      desc = `HOD reassigned ${updated.name}: Advisor (${prev.advisor_name} → ${updated.advisor_name}), Guide (${prev.guide_name} → ${updated.guide_name})`;
      actionType = "REASSIGN";
    } else if (isAdvisorChanged) {
      desc = `HOD changed advisor for ${updated.name}: ${prev.advisor_name} → ${updated.advisor_name}`;
      actionType = "REASSIGN";
    } else if (isGuideChanged) {
      desc = `HOD changed guide for ${updated.name}: ${prev.guide_name} → ${updated.guide_name}`;
      actionType = "REASSIGN";
    } else if (isClassChanged) {
      desc = `HOD moved ${updated.name}: ${prev.class_name} → ${updated.class_name}`;
      actionType = "MOVE";
    }

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: actionType,
      entity_type: "TEAM",
      entity_id: teamId,
      entity_name: updated.name,
      description: desc,
      previous_value: `Advisor: ${prev.advisor_name} | Guide: ${prev.guide_name} | Class: ${prev.class_name}`,
      new_value: `Advisor: ${updated.advisor_name} | Guide: ${updated.guide_name} | Class: ${updated.class_name}`,
    });

    return updated;
  }

  // Create Team
  static createTeam(teamData: Omit<ManagementTeam, "id" | "created_at" | "last_modified">): ManagementTeam {
    const teams = this.getTeams();
    const nowStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const newTeam: ManagementTeam = {
      ...teamData,
      id: `team-${Date.now()}`,
      created_at: nowStr,
      last_modified: nowStr,
    };
    teams.unshift(newTeam);
    this.saveTeams(teams);

    // Sync member students
    const students = this.getStudents();
    newTeam.members.forEach((m) => {
      students.unshift({
        id: `s-${m.id}`,
        roll_number: m.roll_number,
        full_name: m.full_name,
        email: m.email || `${m.roll_number.toLowerCase()}@siet.ac.in`,
        batch: newTeam.batch,
        class_name: newTeam.class_name,
        team_id: newTeam.id,
        team_name: newTeam.name,
        advisor_name: newTeam.advisor_name,
        guide_name: newTeam.guide_name,
        status: "Active",
        joined_date: nowStr,
      });
    });
    this.saveStudents(students);

    this.syncEntityCounts();

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "CREATE",
      entity_type: "TEAM",
      entity_id: newTeam.id,
      entity_name: newTeam.name,
      description: `HOD created ${newTeam.name} (${newTeam.class_name} • ${newTeam.batch}) with Project: ${newTeam.project.title}`,
      previous_value: "None",
      new_value: `${newTeam.name} • Advisor: ${newTeam.advisor_name} • Guide: ${newTeam.guide_name}`,
    });

    return newTeam;
  }

  // Soft Delete / Deactivate Team (Preserving evaluation history)
  static deactivateTeam(teamId: string): boolean {
    const teams = this.getTeams();
    const team = teams.find((t) => t.id === teamId || t.team_id === teamId);
    if (!team) return false;

    team.status = "Inactive";
    this.saveTeams(teams);

    this.syncEntityCounts();

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "DEACTIVATE",
      entity_type: "TEAM",
      entity_id: teamId,
      entity_name: team.name,
      description: `HOD deactivated ${team.name}. Historical evaluation records are preserved.`,
      previous_value: "Active",
      new_value: "Inactive (Archived)",
    });

    return true;
  }

  // Soft Delete / Deactivate Student
  static deactivateStudent(studentId: string): boolean {
    const students = this.getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) return false;

    student.status = "Inactive";
    this.saveStudents(students);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "DEACTIVATE",
      entity_type: "STUDENT",
      entity_id: studentId,
      entity_name: `${student.full_name} (${student.roll_number})`,
      description: `HOD deactivated student ${student.full_name}. Academic history preserved.`,
      previous_value: "Active",
      new_value: "Inactive",
    });

    return true;
  }

  // Create Advisor
  static createAdvisor(advisorData: Omit<ManagementAdvisor, "id">): ManagementAdvisor {
    const advisors = this.getAdvisors();
    const newAdvisor: ManagementAdvisor = {
      ...advisorData,
      id: `adv-${Date.now()}`,
    };
    advisors.unshift(newAdvisor);
    this.saveAdvisors(advisors);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "CREATE",
      entity_type: "ADVISOR",
      entity_id: newAdvisor.id,
      entity_name: newAdvisor.name,
      description: `HOD onboarded Class Advisor ${newAdvisor.name} for ${newAdvisor.assigned_class || "Unassigned"} (${newAdvisor.batch || "General"})`,
      previous_value: "None",
      new_value: `${newAdvisor.name} • ${newAdvisor.designation}`,
    });

    return newAdvisor;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADVISOR DELETION PROTECTION & BULK REASSIGNMENT
  // ──────────────────────────────────────────────────────────────────────────

  // Reassign all or specific teams from one advisor to another
  static reassignAdvisorTeams(
    advisorId: string,
    reassignments: { teamId: string; newAdvisorId: string }[]
  ): boolean {
    const advisors = this.getAdvisors();
    const currentAdv = advisors.find((a) => a.id === advisorId);
    const oldName = currentAdv ? currentAdv.name : "Advisor";

    reassignments.forEach(({ teamId, newAdvisorId }) => {
      const targetAdv = advisors.find((a) => a.id === newAdvisorId);
      if (targetAdv) {
        this.updateTeam(teamId, {
          advisor_id: targetAdv.id,
          advisor_name: targetAdv.name,
        });
      }
    });

    this.syncEntityCounts();

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "REASSIGN",
      entity_type: "ADVISOR",
      entity_id: advisorId,
      entity_name: oldName,
      description: `HOD reassigned ${reassignments.length} teams from ${oldName} to new faculty advisors`,
      previous_value: `Supervised by ${oldName}`,
      new_value: `Reassigned to new department advisors`,
    });

    return true;
  }

  // Deactivate Advisor (Protected against active team dependencies)
  static deactivateAdvisor(advisorId: string): {
    success: boolean;
    activeTeamsCount?: number;
    error?: string;
  } {
    const teams = this.getTeams();
    const advisors = this.getAdvisors();
    const advisor = advisors.find((a) => a.id === advisorId);
    if (!advisor) return { success: false, error: "Advisor record not found." };

    const activeTeams = teams.filter(
      (t) => (t.advisor_id === advisorId || t.advisor_name === advisor.name) && t.status === "Active"
    );

    if (activeTeams.length > 0) {
      return {
        success: false,
        activeTeamsCount: activeTeams.length,
        error: `${advisor.name} currently has ${activeTeams.length} active teams assigned. You must reassign these teams to another advisor before deleting this advisor.`,
      };
    }

    advisor.status = "Inactive";
    this.saveAdvisors(advisors);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "DEACTIVATE",
      entity_type: "ADVISOR",
      entity_id: advisorId,
      entity_name: advisor.name,
      description: `HOD deactivated Advisor ${advisor.name}. Historical supervision records preserved.`,
      previous_value: "Active",
      new_value: "Inactive",
    });

    return { success: true };
  }

  // Create Guide
  static createGuide(guideData: Omit<ManagementGuide, "id">): ManagementGuide {
    const guides = this.getGuides();
    const newGuide: ManagementGuide = {
      ...guideData,
      id: `gd-${Date.now()}`,
    };
    guides.unshift(newGuide);
    this.saveGuides(guides);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "CREATE",
      entity_type: "GUIDE",
      entity_id: newGuide.id,
      entity_name: newGuide.name,
      description: `HOD onboarded Project Guide ${newGuide.name} (Max Teams: ${newGuide.max_teams_limit})`,
      previous_value: "None",
      new_value: `${newGuide.name} • ${newGuide.designation}`,
    });

    return newGuide;
  }

  // Deactivate Guide
  static deactivateGuide(guideId: string): boolean {
    const guides = this.getGuides();
    const guide = guides.find((g) => g.id === guideId);
    if (!guide) return false;

    guide.status = "Inactive";
    this.saveGuides(guides);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "DEACTIVATE",
      entity_type: "GUIDE",
      entity_id: guideId,
      entity_name: guide.name,
      description: `HOD deactivated Project Guide ${guide.name}. Historical mentoring and evaluation records preserved.`,
      previous_value: "Active",
      new_value: "Inactive",
    });

    return true;
  }

  // Deactivate Batch
  static deactivateBatch(batchId: string): boolean {
    const batches = this.getBatches();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return false;

    batch.status = "Inactive";
    this.saveBatches(batches);

    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "DEACTIVATE",
      entity_type: "BATCH",
      entity_id: batchId,
      entity_name: batch.name,
      description: `HOD archived Batch ${batch.name}. All class and team records remain accessible.`,
      previous_value: "Active",
      new_value: "Inactive",
    });

    return true;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COMPLETE NEW BATCH ONBOARDING WORKFLOW
  // ──────────────────────────────────────────────────────────────────────────

  static onboardNewBatch(batchData: {
    batch: ManagementBatch;
    students: ManagementStudent[];
    teams: ManagementTeam[];
  }): { success: boolean; error?: string } {
    const batches = this.getBatches();
    const existing = batches.find(
      (b) => b.name.trim().toLowerCase() === batchData.batch.name.trim().toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        error: `Batch "${batchData.batch.name}" already exists in the department register.`,
      };
    }

    // 1. Add new batch
    batches.unshift(batchData.batch);
    this.saveBatches(batches);

    // 2. Add students
    const students = this.getStudents();
    this.saveStudents([...batchData.students, ...students]);

    // 3. Add teams
    const teams = this.getTeams();
    this.saveTeams([...batchData.teams, ...teams]);

    // 4. Update advisor assignments from the classes
    const advisors = this.getAdvisors();
    batchData.batch.classes.forEach((cls) => {
      if (cls.advisor_id) {
        const adv = advisors.find((a) => a.id === cls.advisor_id || a.name === cls.advisor_name);
        if (adv) {
          adv.assigned_class = cls.name;
          adv.batch = batchData.batch.name;
        }
      }
    });
    this.saveAdvisors(advisors);

    // 5. Sync all counts
    this.syncEntityCounts();

    // 6. Record Activity Log
    this.recordActivity({
      user_name: "Dr. K. Senthil Kumar",
      user_role: "Head of Department",
      action_type: "CREATE",
      entity_type: "BATCH",
      entity_id: batchData.batch.id,
      entity_name: batchData.batch.name,
      description: `HOD onboarded new academic cohort: ${batchData.batch.name} (${batchData.students.length} students, ${batchData.batch.classes.length} classes, ${batchData.teams.length} teams)`,
      previous_value: "None",
      new_value: `${batchData.batch.name} • ${batchData.students.length} Students • ${batchData.teams.length} Teams`,
    });

    // Clear draft if any
    this.clearBatchDraft();

    return { success: true };
  }

  // Draft persistence
  static saveBatchDraft(draft: unknown): void {
    memDraft = draft;
    if (typeof window !== "undefined") {
      localStorage.setItem("siet_new_batch_draft_v1", JSON.stringify(draft));
    }
  }

  static getBatchDraft<T = unknown>(): T | null {
    if (typeof window === "undefined") return memDraft as T | null;
    const item = localStorage.getItem("siet_new_batch_draft_v1");
    if (!item) return memDraft as T | null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  static clearBatchDraft(): void {
    memDraft = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("siet_new_batch_draft_v1");
    }
  }
}

