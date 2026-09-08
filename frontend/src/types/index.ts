// Common Enums
export type UserRole = "student" | "advisor" | "faculty" | "hod" | "admin";

export type FileCategory = "ABSTRACT" | "REPORT" | "PPT" | "IMAGE";

export type SubmissionStatus =
  | "DRAFT"
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export type SubmissionReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export type DocumentReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "NEEDS_REVISION"
  | "REJECTED";

export type EvaluationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "EVALUATED"
  | "SUBMITTED"
  | "LOCKED";

// 1. Auth Types
export interface AuthUser {
  id: string;
  roll_number?: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  team_id?: string | null;
}

export interface StudentLoginRequest {
  roll_number: string;
  team_id: string;
}

export interface AdvisorLoginRequest {
  advisor_id: string;
  password: string;
}

export interface HodLoginRequest {
  hod_id: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  roll_number?: string | null;
  team_id?: string | null;
}

export interface LogoutResponse {
  message: string;
}

// 2. Student & Team Types
export interface StudentProfile {
  id: string;
  roll_number: string;
  full_name: string;
  email: string;
  role: string;
  team_id?: string | null;
}

export interface StudentProfileUpdate {
  full_name: string;
}

export interface TeamMember {
  id: string;
  roll_number: string;
  full_name: string;
  is_team_leader: boolean;
  email?: string;
}

export interface TeamLeader {
  id: string;
  roll_number: string;
  full_name: string;
  is_team_leader: boolean;
}

export interface TeamAdvisor {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  designation?: string;
  department?: string;
}

export interface TeamGuide {
  id?: string;
  name: string;
  full_name?: string;
  designation: string;
  department: string;
  email?: string;
}

export interface MyTeamResponse {
  team_id: string;
  name: string;
  project_title: string;
  batch: string;
  section: string;
  team_leader: TeamLeader;
  members: TeamMember[];
  advisor: TeamAdvisor;
}

// 3. Project Types
export interface ProjectResponse {
  id?: string;
  team_id?: string;
  title: string;
  domain: string;
  problem_statement: string;
  description: string;
  proposed_solution: string;
  technologies_used: string;
  github_url: string;
  live_demo_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectUpdate {
  title?: string;
  domain?: string;
  problem_statement?: string;
  description?: string;
  proposed_solution?: string;
  technologies_used?: string;
  github_url?: string;
  live_demo_url?: string;
}

// 4. File Types
export interface FileMetadata {
  id: string;
  project_id: string;
  team_id: string;
  category: FileCategory;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface MyFilesResponse {
  count: number;
  files: FileMetadata[];
}

export interface FileUploadResponse {
  id: string;
  original_filename: string;
  category: FileCategory;
  file_size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

export interface FileDeleteResponse {
  message: string;
  file_id: string;
}

// 5. Submission Types
export interface ChecklistItem {
  completed: boolean;
  label: string;
}

export interface SubmissionChecklist {
  abstract: ChecklistItem;
  report: ChecklistItem;
  ppt: ChecklistItem;
  images: ChecklistItem;
  github: ChecklistItem;
  live_demo: ChecklistItem;
  completed_count: number;
  total_count: number;
  all_completed: boolean;
}

export interface FinalSubmissionResponse {
  submission_id: string;
  status: string;
  submitted_at: string;
  message: string;
}

export interface MySubmissionResponse {
  submission_id?: string;
  status: string;
  submitted_at?: string | null;
  checklist?: SubmissionChecklist;
  files?: FileMetadata[];
  project?: ProjectResponse;
}

// 6. Weekly Submission & History Types
export type WeeklySubmissionStatus =
  | "DRAFT"
  | "UPLOADING"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "RESUBMITTED"
  | "APPROVED"
  | "LOCKED";

export interface WeeklySubmittedFile {
  name: string;
  category: "ABSTRACT" | "REPORT" | "PPT" | "IMAGE";
  size: number;
  upload_date: string;
  status: string;
  url?: string;
}

export interface WeeklyTimelineEvent {
  title: string;
  timestamp: string;
  description?: string;
  status?: "done" | "current" | "rejected";
}

export interface WeeklySubmissionAttempt {
  attempt_number: number;
  submitted_at: string;
  submission_time: string;
  status: WeeklySubmissionStatus;
  is_late: boolean;
  deadline: string;
  guide_remarks?: string;
  rejection_reason?: string;
  files: WeeklySubmittedFile[];
  problems_faced?: string;
  next_week_plan?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  is_evaluated?: boolean;
  marks_awarded?: number;
  max_marks?: number;
  grade?: string;
  timeline: WeeklyTimelineEvent[];
}

export interface WeeklySubmissionRecord {
  id: string;
  week_number: number;
  week_title: string;
  is_current_week: boolean;
  submission_date: string;
  submission_time: string;
  deadline: string;
  deadline_timestamp?: string;
  is_late: boolean;
  status: WeeklySubmissionStatus;
  submission_type: string;
  guide_name: string;
  guide_designation?: string;
  guide_email?: string;
  progress_contribution: number;
  guide_remarks?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  is_locked: boolean;
  is_evaluated: boolean;
  marks_awarded?: number;
  max_marks?: number;
  grade?: string;
  evaluated_by?: string;
  evaluated_at?: string;
  criteria_scores?: Record<string, { score: number; max: number }>;
  auto_submitted?: boolean;
  github_url?: string;
  live_demo_url?: string;
  problems_faced?: string;
  next_week_plan?: string;
  files: WeeklySubmittedFile[];
  attempts: WeeklySubmissionAttempt[];
  timeline: WeeklyTimelineEvent[];
}

export interface WeeklySubmissionSummary {
  total_weeks: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  current_progress_percentage: number;
  submission_rate_percentage: number;
  on_time_count: number;
  total_submitted_count: number;
}

export interface WeeklySubmissionHistoryResponse {
  project_info: {
    project_title: string;
    domain: string;
    team_id: string;
    team_name: string;
    guide_name: string;
    guide_email: string;
    student_roll: string;
    student_name: string;
    problem_statement: string;
    description: string;
    proposed_solution: string;
    technologies_used: string;
  };
  summary: WeeklySubmissionSummary;
  current_week?: WeeklySubmissionRecord;
  submissions: WeeklySubmissionRecord[];
}

// Export ProjectDetail alias for ProjectResponse
export type ProjectDetail = ProjectResponse;

// 7. Faculty / Advisor Portal Types
export interface TeamEvaluationCriteriaScores {
  problem_formulation?: number; // 0 to 20
  methodology_design?: number; // 0 to 20
  implementation_progress?: number; // 0 to 20
  presentation_defense?: number; // 0 to 20
  report_documentation?: number; // 0 to 20
  // Alternative / legacy criteria names:
  project_execution?: number;
  technical_depth?: number;
  presentation_viva?: number;
  documentation?: number;
  contribution?: number;
}

export type EvaluationRecommendationStatus =
  | "APPROVED"
  | "EXCELLENT"
  | "NEEDS_REVISION"
  | "REJECTED";

export type AdvisorEvaluationReviewStatus =
  | "EVALUATED"
  | "APPROVED"
  | "IN_PROGRESS"
  | "CHANGES_REQUESTED";

export interface TeamEvaluationResponse {
  id?: string;
  team_id?: string;
  scores?: TeamEvaluationCriteriaScores;
  criteria_scores?: TeamEvaluationCriteriaScores;
  total_score?: number; // 0 to 100
  max_score?: number;
  grade?: string;
  verdict?: "APPROVED" | "REVISION_REQUIRED" | "REJECTED" | string;
  remarks?: string;
  team_score?: number;
  team_remarks?: string;
  status?: AdvisorEvaluationReviewStatus;
  strengths?: string;
  areas_for_improvement?: string;
  recommendation_status?: EvaluationRecommendationStatus;
  evaluated_at?: string;
  evaluated_by?: string;
  milestone_title?: string;
  submission_week?: number;
}

export interface TeamEvaluationRequest {
  scores?: TeamEvaluationCriteriaScores;
  remarks?: string;
  verdict?: "APPROVED" | "REVISION_REQUIRED" | "REJECTED";
  team_score?: number;
  team_remarks?: string;
  status?: AdvisorEvaluationReviewStatus;
  strengths?: string;
  areas_for_improvement?: string;
  recommendation_status?: EvaluationRecommendationStatus;
  criteria_scores?: TeamEvaluationCriteriaScores;
}

export interface AdvisorRecentSubmission {
  team_id: string;
  team_name: string;
  project_title: string;
  submitted_at: string;
  status: SubmissionStatus | string;
  evaluation_status?: string;
  marks?: number;
  guide?: TeamAdvisor | string;
}

export interface AdvisorActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: string;
}

export interface AdvisorDashboardResponse {
  total_teams?: number;
  total_students?: number;
  submitted_count?: number;
  evaluated_count?: number;
  pending_submissions?: number;
  pending_evaluations?: number;
  metrics?: {
    assigned_teams: number;
    evaluated_teams: number;
    pending_reviews: number;
    average_score: number;
  };
  recent_submissions: AdvisorRecentSubmission[];
  activity_stream?: AdvisorActivityItem[];
  recent_activities?: AdvisorActivityItem[];
}

export interface AdvisorTeamMember {
  id: string;
  full_name: string;
  roll_number: string;
  role?: string;
  technical_role?: string;
  email?: string;
}

export interface AdvisorTeamSummary {
  id?: string;
  team_id?: string;
  name: string;
  project_title: string;
  batch?: string;
  section: string;
  department?: string;
  current_phase?: string;
  submission_date?: string;
  submission_status: SubmissionStatus | string;
  evaluation_status: "COMPLETED" | "EVALUATED" | "PENDING" | "IN_PROGRESS" | "NOT_SUBMITTED" | string;
  evaluation_score?: number;
  marks_awarded?: number;
  grade?: string;
  evaluated_at?: string;
  evaluated_by?: string;
  evaluation_remarks?: string;
  leader_name?: string;
  leader_roll?: string;
  members: AdvisorTeamMember[];
  guide: TeamAdvisor | TeamGuide | string;
  evaluation?: TeamEvaluationResponse;
  submission_detail?: WeeklySubmissionRecord;
  project?: ProjectResponse | any;
}

export interface StudentStageRecord {
  stage_name?: string;
  stage_number?: number;
  stage_title?: string;
  date?: string;
  evaluator?: string;
  marks?: number;
  score?: number;
  max_marks?: number;
  max_score?: number;
  grade?: string;
  status?: string;
  remarks?: string;
  criteria_breakdown?: Record<string, { score: number; max: number }>;
}

export interface AdvisorStudent {
  id: string;
  roll_number: string;
  full_name: string;
  email: string;
  team_name: string;
  team_id: string;
  technical_role: string;
  cgpa: number;
  attendance_percentage: number;
  evaluation_status: "COMPLETED" | "EVALUATED" | "PENDING" | string;
  total_marks?: number;
  guide?: TeamAdvisor | TeamGuide | string;
  stages?: StudentStageRecord[];
  evaluation_records?: StudentStageRecord[];
}

export interface AdvisorProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  employee_id?: string;
  phone?: string;
  office_location?: string;
  office_hours?: string;
  highest_degree?: string;
  specialization?: string[];
}

export interface AdvisorEvaluationSession {
  id: string;
  title: string;
  date: string;
  time: string;
  teams_count: number;
  teams: AdvisorTeamSummary[];
}

export type TeamRole =
  | "Team Leader"
  | "Team Member"
  | "Technical Lead"
  | "Documentation Lead"
  | "Presentation Lead";

export type ManagedTeamStatus =
  | "Active"
  | "Completed"
  | "Inactive"
  | "Archived";

export interface ManagedTeamMember {
  id: string;
  roll_number: string;
  full_name: string;
  email: string;
  role: TeamRole;
  joined_date: string;
  status: "Active" | "Inactive";
}

export interface ManagedFacultyGuide {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  current_teams_count: number;
  max_teams_limit: number;
  current_students_count: number;
  assigned_team_ids?: string[];
}

export interface ManagedTeam {
  id: string;
  team_id: string;
  name: string;
  project_title: string;
  project_domain: string;
  description: string;
  batch: string;
  section: string;
  status: ManagedTeamStatus;
  last_modified: string;
  created_at: string;
  guide: ManagedFacultyGuide;
  members: ManagedTeamMember[];
}

export interface UnassignedStudent {
  id: string;
  roll_number: string;
  full_name: string;
  email: string;
  batch: string;
  section: string;
  cgpa?: number;
  status: "Unassigned";
}

export type AuditLogCategory =
  | "Member Added"
  | "Member Removed"
  | "Member Moved"
  | "Role Changed"
  | "Guide Reassigned"
  | "Team Created"
  | "Team Disbanded"
  | "Team Updated"
  | "Marks Updated"
  | "Title Status";

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  dateFormatted: string;
  teamId: string;
  teamName: string;
  category: AuditLogCategory;
  action: string;
  description: string;
  fromState?: string;
  toState?: string;
  changedBy: string;
}

export * from "./hod";
