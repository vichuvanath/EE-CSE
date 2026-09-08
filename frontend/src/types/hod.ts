// ============================================================================
// HOD PORTAL TYPE DEFINITIONS
// Institution: Sri Indu Engineering & Technology (SIET Autonomous)
// Department of Electrical & Computer Engineering / Computer Science & Engineering
// ============================================================================

export interface EvaluationCriterion {
  id: string;
  title: string;
  description: string;
  max_marks: number;
}

export interface EvaluationStageScheme {
  id: string;
  stage_number: number;
  title: string;
  total_weightage: number; // e.g. 10, 15, 20
  passing_marks: number;   // e.g. 5, 10
  criteria: EvaluationCriterion[];
}

export interface EvaluationScheme {
  id: string;
  title: string;
  academic_year: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  formulated_by: string;
  instructions: string;
  stages: EvaluationStageScheme[];
  total_marks: number; // Must equal 100
  created_at: string;
  updated_at: string;
}

export interface EnrolledTeamMember {
  name: string;
  roll_number: string;
  department?: string;
  role?: string;
}

export interface HodAdvisorAssignedTeam {
  id: string;
  name: string;
  project_title: string;
  guide_name: string;
  advisor_name?: string;
  members_count: number;
  status?: "EVALUATED" | "PENDING" | "OVERDUE";
  score?: number;
  stage?: number | string;
  enrolled_members?: EnrolledTeamMember[];
}

export interface HodFacultyRecord {
  id: string;
  name: string;
  faculty_id?: string;
  role: "ADVISOR" | "GUIDE" | "BOTH";
  designation: string;
  department: string;
  email: string;
  phone?: string;
  batch?: string;
  teams_count: number;
  students_count: number;
  evaluations_completed: number;
  evaluations_pending: number;
  completion_rate: number;
  assigned_teams: HodAdvisorAssignedTeam[];
}

export type HodAdvisorRecord = HodFacultyRecord;

export interface EvaluationSessionRecord {
  id: string;
  date_label: string; // e.g. "Saturday, August 29, 2026"
  session_time: string; // e.g. "3:30 PM"
  session_title: string; // e.g. "Official PRC Examination Session"
  teams_evaluated_count: number;
  records: AdvisorEvaluationHistoryRecord[];
}

export interface AdvisorEvaluationHistoryRecord {
  id: string;
  advisor_id: string;
  advisor_name: string;
  batch: string;
  team_id: string;
  team_name: string;
  project_title: string;
  guide_name: string;
  guide_designation?: string;
  guide_department?: string;
  evaluation_stage?: string;
  session_label?: string;
  students?: string[];
  enrolled_members?: EnrolledTeamMember[];
  submission_date: string;
  submission_time: string;
  evaluation_date: string;
  evaluation_time: string;
  marks_awarded: number;
  max_marks: number;
  status: "EVALUATED" | "PENDING" | "OVERDUE";
  feedback?: string;
  standout_strengths?: string;
  areas_for_improvement?: string;
  criteria_scores?: {
    project_execution?: number;
    technical_depth?: number;
    presentation_viva?: number;
    documentation?: number;
    contribution?: number;
    problem_definition?: number;
    technical_implementation?: number;
    innovation?: number;
    presentation?: number;
  };
  submitted_content?: {
    abstract: string;
    files: { name: string; size: string; type: string }[];
    github_url?: string;
    demo_url?: string;
  };
}

export interface AssignmentChangeRecord {
  id: string;
  timestamp: string;
  change_type: "GUIDE_REASSIGNMENT" | "ADVISOR_REASSIGNMENT" | "STUDENT_TRANSFER" | "STAGE_EXTENDED";
  team_name: string;
  batch: string;
  changed_by: {
    name: string;
    email: string;
    role: string;
  };
  reason: string;
  before_state: {
    guide?: string;
    advisor?: string;
    members?: string[];
    details?: string;
  };
  after_state: {
    guide?: string;
    advisor?: string;
    members?: string[];
    details?: string;
  };
}

export interface HodNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "ALERT" | "WARNING" | "SUCCESS" | "INFO";
  type: "EVALUATION" | "ADMIN" | "GENERAL";
  is_read: boolean;
  link?: string;
}

export interface HodDashboardSummary {
  students_count: number;
  teams_count: number;
  advisors_count: number;
  guides_count: number;
  health: {
    on_track: number;
    at_risk: number;
    critical: number;
  };
  avg_score: number;
  evaluated_teams_count: number;
}

export interface HodMilestoneStage {
  id: string;
  stage_number: number;
  title: string;
  weightage_percent: number;
  completed_teams: number;
  total_teams: number;
  status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
  due_date: string;
}

export interface AttentionRequiredItem {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  description: string;
  action_label: string;
  action_link: string;
}

export interface LiveActivityEvent {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_name: string;
  timestamp: string;
}

export interface AdvisorComplianceRecord {
  id: string;
  advisor_id: string;
  advisor_name: string;
  designation: string;
  department: string;
  assigned_teams: number;
  completed_evaluations: number;
  pending_evaluations: number;
  overdue_reviews: number;
  avg_score_given: number;
  status: "COMPLETED" | "IN_PROGRESS" | "OVERDUE";
  teams_breakdown: {
    team_id: string;
    team_name: string;
    stage_number: number;
    marks_awarded?: number;
    is_overdue: boolean;
    submitted_date?: string;
    evaluated_date?: string;
  }[];
}
