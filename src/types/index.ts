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
  id: string;
  full_name: string;
  email: string;
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

// 6. Advisor Types
export interface AdvisorProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AdvisorProfileUpdate {
  full_name: string;
}

export interface AdvisorDashboardResponse {
  advisor_id: string;
  total_teams: number;
  total_students: number;
  submitted_count: number;
  pending_submissions: number;
  evaluated_count: number;
  pending_evaluations: number;
  recent_submissions: Array<{
    submission_id: string;
    team_name: string;
    project_title: string;
    submitted_at: string;
    status: string;
    guide?: TeamGuide;
  }>;
  recent_activities: Array<{
    id: string;
    title: string;
    timestamp: string;
    type: string;
  }>;
}

export interface TeamEvaluationRecord {
  id: string;
  stage_name: string;
  evaluation_date: string;
  evaluator_name: string;
  total_marks: number;
  max_marks: number;
  grade?: string;
  status: string;
  remarks: string;
  strengths?: string;
  areas_for_improvement?: string;
  criteria_scores?: {
    project?: number;
    technical?: number;
    presentation?: number;
    documentation?: number;
    contribution?: number;
  };
}

export interface AdvisorTeamMember {
  id: string;
  student_id?: string;
  roll_number?: string;
  full_name: string;
  email?: string;
  is_team_leader?: boolean;
  is_leader?: boolean;
  role?: string;
  department?: string;
  cgpa?: number;
  attendance?: string;
  responsibilities?: string;
  marks?: number;
}

export interface AdvisorTeamSummary {
  team_id: string;
  id?: string;
  name: string;
  project_title: string;
  batch: string;
  section: string;
  records_history?: TeamEvaluationRecord[];
  department?: string;
  members_names?: string[];
  members?: AdvisorTeamMember[];
  current_phase?: string;
  submitted_at?: string;
  submission_status: string;
  evaluation_status: string;
  evaluation?: {
    id?: string;
    team_score?: number;
    team_remarks?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    strengths?: string;
    areas_for_improvement?: string;
    recommendation_status?: string;
    criteria_scores?: Record<string, number>;
  };
  member_count: number;
  guide?: TeamGuide;
  advisor?: TeamAdvisor | TeamGuide;
  leader?: {
    id: string;
    student_id?: string;
    roll_number: string;
    full_name: string;
    email?: string;
    is_team_leader?: boolean;
  };
}

export interface AdvisorStudent {
  id: string;
  student_id?: string;
  roll_number: string;
  full_name: string;
  email: string;
  team_name?: string;
  team_id?: string;
  project_title?: string;
  evaluation_status?: string;
  total_marks?: number | null;
  guide?: TeamGuide;
  guide_name?: string;
  guide_designation?: string;
  guide_department?: string;
}

export interface AdvisorSearchResponse {
  results: any[];
  total: number;
  page?: number;
  page_size?: number;
}

// 7. Review & Completeness
export interface CompletenessItem {
  category: string;
  label: string;
  completed: boolean;
}

export interface SubmissionCompleteness {
  submission_id: string;
  team_id: string;
  all_completed: boolean;
  completed_count: number;
  total_count: number;
  completion_status: string;
  items: CompletenessItem[];
}

export interface SubmissionReviewRequest {
  status: SubmissionReviewStatus;
  remarks: string;
}

export interface SubmissionReviewResponse {
  submission_id: string;
  status: SubmissionReviewStatus;
  remarks: string;
  updated_at?: string;
}

export interface DocumentReviewRequest {
  status: DocumentReviewStatus;
  remarks: string;
}

export interface DocumentReviewResponse {
  file_id: string;
  status: DocumentReviewStatus;
  remarks: string;
  updated_at?: string;
}

export interface FileDownloadResponse {
  file_id: string;
  download_url: string;
  expires_in?: number;
}

// 8. Evaluations
export interface TeamEvaluationRequest {
  team_score: number;
  team_remarks: string;
  status?: string;
  strengths?: string;
  areas_for_improvement?: string;
  recommendation_status?: string;
  criteria_scores?: Record<string, number>;
}

export interface TeamEvaluationResponse {
  id?: string;
  evaluation_id?: string;
  team_id: string;
  team_score: number;
  team_remarks: string;
  status: EvaluationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface StudentEvaluationRequest {
  project_marks: number;
  presentation_marks: number;
  technical_marks: number;
  documentation_marks: number;
  contribution_marks: number;
  remarks: string;
}

export interface StudentEvaluationResponse {
  id: string;
  student_id: string;
  team_id: string;
  project_marks: number;
  presentation_marks: number;
  technical_marks: number;
  documentation_marks: number;
  contribution_marks: number;
  total_marks: number;
  remarks: string;
  created_at?: string;
  updated_at?: string;
}

export interface EvaluationStatusResponse {
  evaluation_id: string;
  status: EvaluationStatus;
  is_locked: boolean;
}

// 9. Deadlines
export interface DeadlineRequest {
  title: string;
  description: string;
  deadline_at: string;
}

export interface DeadlineResponse {
  id: string;
  team_id?: string;
  title: string;
  description: string;
  deadline_at: string;
  created_at: string;
}

// 10. Notifications
export interface NotificationResponse {
  id: string;
  advisor_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unread_count?: number;
}

export interface UnreadNotificationCountResponse {
  unread_count: number;
}

// 11. HOD Types
export type HodApprovalType =
  | "PROJECT_PROPOSAL"
  | "GUIDE_CHANGE"
  | "EXTENSION"
  | "FINAL_SUBMISSION";

export type HodApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface HodFacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  teams_assigned: number;
  specialization?: string;
}

export interface HodDashboardStats {
  total_teams: number;
  total_students: number;
  total_faculty: number;
  total_projects: number;
  evaluations_completed: number;
  evaluations_pending: number;
  approvals_pending: number;
  submissions_received: number;
  batches: string[];
}

export interface HodApprovalRecord {
  id: string;
  team_name: string;
  team_id: string;
  project_title: string;
  guide_name: string;
  type: HodApprovalType;
  status: HodApprovalStatus;
  submitted_at: string;
  remarks?: string;
}

