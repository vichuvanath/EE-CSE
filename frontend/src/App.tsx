import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootRedirect } from "@/pages/RootRedirect";
import { LoginPage } from "@/pages/LoginPage";

// Student Portal
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { StudentTeamPage } from "@/pages/student/StudentTeamPage";
import { StudentProjectPage } from "@/pages/student/StudentProjectPage";
import { StudentFilesPage } from "@/pages/student/StudentFilesPage";
import { StudentSubmissionPage } from "@/pages/student/StudentSubmissionPage";
import { StudentMySubmissionsPage } from "@/pages/student/StudentMySubmissionsPage";

// Advisor Portal
import { AdvisorLayout } from "@/components/layouts/AdvisorLayout";
import { AdvisorDashboardPage } from "@/pages/advisor/AdvisorDashboardPage";
import { AdvisorTeamsPage } from "@/pages/advisor/AdvisorTeamsPage";
import { AdvisorEvaluationsPage } from "@/pages/advisor/AdvisorEvaluationsPage";
import { AdvisorTeamSubmissionReviewPage } from "@/pages/advisor/AdvisorTeamSubmissionReviewPage";
import { AdvisorTeamEvaluationPage } from "@/pages/advisor/AdvisorTeamEvaluationPage";
import { AdvisorEvaluationRecordsPage } from "@/pages/advisor/AdvisorEvaluationRecordsPage";
import { AdvisorStudentsPage } from "@/pages/advisor/AdvisorStudentsPage";
import { AdvisorStudentDetailPage } from "@/pages/advisor/AdvisorStudentDetailPage";
import { AdvisorProfilePage } from "@/pages/advisor/AdvisorProfilePage";
import { AdvisorTeamsAndGuidesPage } from "@/pages/advisor/AdvisorTeamsAndGuidesPage";
import { AdvisorChangeManagementPage } from "@/pages/advisor/AdvisorChangeManagementPage";

// HOD Portal
import { HodLayout } from "@/components/layouts/HodLayout";
import { HodDashboardPage } from "@/pages/hod/HodDashboardPage";
import { HodAdvisorsPage } from "@/pages/hod/HodAdvisorsPage";
import { HodAdvisorDetailPage } from "@/pages/hod/HodAdvisorDetailPage";
import { HodAdvisorEvaluationHistoryPage } from "@/pages/hod/HodAdvisorEvaluationHistoryPage";
import { HodTeamDetailPage } from "@/pages/hod/HodTeamDetailPage";
import { HodReportsPage } from "@/pages/hod/HodReportsPage";
import { HodChangeHistoryPage } from "@/pages/hod/HodChangeHistoryPage";
import { HodSettingsPage } from "@/pages/hod/HodSettingsPage";
import { HodProfilePage } from "@/pages/hod/HodProfilePage";
import { HodManagementPage } from "@/pages/hod/HodManagementPage";
import { HodAddNewBatchPage } from "@/pages/hod/HodAddNewBatchPage";

import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirector / Landing */}
        <Route path="/" element={<RootRedirect />} />

        {/* Authentication Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Student Workspace (Shell & Protected Children) */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/team" replace />} />
          <Route path="profile" element={<Navigate to="/student/team" replace />} />
          <Route path="team" element={<StudentTeamPage />} />
          <Route path="project" element={<StudentProjectPage />} />
          <Route path="files" element={<StudentFilesPage />} />
          <Route path="submission" element={<StudentSubmissionPage />} />
          <Route path="my-submissions" element={<StudentMySubmissionsPage />} />
          <Route path="my-submission" element={<Navigate to="/student/my-submissions" replace />} />
        </Route>

        {/* Faculty / Advisor Workspace (Shell & Protected Children) */}
        <Route path="/advisor" element={<AdvisorLayout />}>
          <Route index element={<Navigate to="/advisor/dashboard" replace />} />
          <Route path="dashboard" element={<AdvisorDashboardPage />} />
          <Route path="teams-and-guides" element={<AdvisorTeamsAndGuidesPage />} />
          <Route path="teams-management" element={<Navigate to="/advisor/teams-and-guides" replace />} />
          <Route path="change-management" element={<AdvisorChangeManagementPage />} />
          <Route path="evaluations" element={<AdvisorEvaluationsPage />} />
          <Route path="teams" element={<AdvisorTeamsPage />} />
          <Route path="teams/:teamId" element={<AdvisorTeamSubmissionReviewPage />} />
          <Route path="teams/:teamId/evaluation" element={<AdvisorTeamEvaluationPage />} />
          <Route path="records" element={<AdvisorEvaluationRecordsPage />} />
          <Route path="students" element={<AdvisorStudentsPage />} />
          <Route path="students/:studentId" element={<AdvisorStudentDetailPage />} />
          <Route path="profile" element={<AdvisorProfilePage />} />
        </Route>

        {/* Head of Department (HOD) Supervision Workspace */}
        <Route path="/hod" element={<HodLayout />}>
          <Route index element={<Navigate to="/hod/dashboard" replace />} />
          <Route path="dashboard" element={<HodDashboardPage />} />
          <Route path="management" element={<HodManagementPage />} />
          <Route path="batches/new" element={<HodAddNewBatchPage />} />
          <Route path="advisors" element={<HodAdvisorsPage />} />
          <Route path="advisors/:advisorId" element={<HodAdvisorDetailPage />} />
          <Route
            path="advisors/:advisorId/evaluation-history"
            element={<HodAdvisorEvaluationHistoryPage />}
          />
          <Route
            path="advisors/:advisorId/teams/:teamId"
            element={<HodTeamDetailPage />}
          />
          <Route path="evaluation" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="evaluation-monitoring" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="reports" element={<HodReportsPage />} />
          <Route path="change-history" element={<HodChangeHistoryPage />} />
          <Route path="settings" element={<HodSettingsPage />} />
          <Route path="profile" element={<HodProfilePage />} />

          {/* Historical Redirect Aliases */}
          <Route path="approvals" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="analytics" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="faculty" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="project-progress" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="projects" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="students" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="students-teams" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="teams" element={<Navigate to="/hod/advisors" replace />} />
          <Route path="evaluations" element={<Navigate to="/hod/advisors" replace />} />
        </Route>

        {/* 404 / Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
