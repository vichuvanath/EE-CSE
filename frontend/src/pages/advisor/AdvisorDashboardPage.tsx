import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  FileCheck,
  Award,
  FolderClock,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useAdvisorDashboard, useAdvisorTeams } from "@/hooks/use-advisor";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";

export function AdvisorDashboardPage() {
  const { data: dashboard, isLoading: isDashboardLoading } = useAdvisorDashboard();
  const { data: teamsData, isLoading: isTeamsLoading } = useAdvisorTeams();
  const teams = Array.isArray(teamsData) ? teamsData : [];

  if (isDashboardLoading || isTeamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Faculty Advisor Dashboard...</p>
        </div>
      </div>
    );
  }

  const totalTeams = teams.length || dashboard?.total_teams || 5;
  const totalStudents = dashboard?.total_students || 20;
  const submittedCount = teams.filter((t) => t.submission_status === "SUBMITTED" || t.submission_status === "APPROVED").length;
  const evaluatedCount = teams.filter((t) => t.evaluation_status === "COMPLETED" || t.evaluation_status === "EVALUATED").length;
  const pendingSubmissions = Math.max(0, totalTeams - submittedCount);
  const pendingEvaluations = Math.max(0, totalTeams - evaluatedCount);

  const recentSubmissions = teams.slice(0, 5);

  const committeeActivities = dashboard?.activity_stream || [
    {
      id: "act-1",
      title: "Review 2 Submission Window Closed",
      timestamp: "Today, 08:30 AM",
    },
    {
      id: "act-2",
      title: "Team Alpha (CSE-A) Milestone Evaluated (92/100)",
      timestamp: "Today, 01:10 PM",
    },
    {
      id: "act-3",
      title: "Team Beta (CSE-A) Evaluated & Approved (86/100)",
      timestamp: "Yesterday, 04:45 PM",
    },
    {
      id: "act-4",
      title: "PRC Committee Examination Session Scheduled",
      timestamp: "28 Aug 2026",
    },
    {
      id: "act-5",
      title: "Phase II Jetson Hardware Deliverables Received",
      timestamp: "26 Aug 2026",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* 1. PageHeader */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div>
          <div className="text-[11px] font-medium text-slate-400 font-mono">
            SIET Portal / Advisor Console / Dashboard
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#034419] tracking-tight mt-1 font-['IBM_Plex_Sans',sans-serif]">
            Faculty Advisor Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor project progress, assigned candidate cohorts, document submissions, and evaluation milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/advisor/records"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-none"
          >
            <FolderClock className="w-3.5 h-3.5 text-slate-500" />
            <span>Evaluation Records</span>
          </Link>

          <Link
            to="/advisor/teams"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#034419] hover:bg-[#023312] text-white text-xs font-bold transition shadow-none"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Evaluate Teams</span>
          </Link>
        </div>
      </div>

      {/* 2. Unified Metric Strip (4 Columns, No Isolated Bubbly Cards) */}
      <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Card 1: Assigned Teams */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Assigned Teams
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {totalTeams}
              </span>
              <span className="text-xs text-slate-500 font-medium">Teams</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">Cap-controlled project teams</p>
          </div>

          {/* Card 2: Supervised Students */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Supervised Students
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {totalStudents}
              </span>
              <span className="text-xs text-slate-500 font-medium">Candidates</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">Enrolled project candidates</p>
          </div>

          {/* Card 3: Submissions Received */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Submissions Received
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {submittedCount} / {totalTeams}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {pendingSubmissions > 0 ? `${pendingSubmissions} teams pending` : "All submissions received"}
            </p>
          </div>

          {/* Card 4: Evaluations Completed */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Evaluations Completed
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#034419]">
                {evaluatedCount} / {totalTeams}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {pendingEvaluations > 0 ? `${pendingEvaluations} pending grading` : "All teams evaluated"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Split Workspace (2:1 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Recent Team Submissions */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Team Submissions
              </h2>
              <p className="text-[11px] text-slate-500">
                Latest milestone submissions for Phase II project review
              </p>
            </div>
            <Link
              to="/advisor/teams"
              className="text-xs font-semibold text-[#034419] hover:underline inline-flex items-center gap-1"
            >
              <span>View Teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#E8F8F0] text-[#034419] font-bold text-[11px] uppercase tracking-wider font-mono border-b border-emerald-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Team / Project</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSubmissions.map((team) => (
                    <tr key={team.id || team.team_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-xs">{team.name}</div>
                        <div className="text-slate-500 text-[11px] truncate max-w-[280px]">
                          {team.project_title}
                        </div>
                        <div className="mt-1">
                          <TeamGuideBadge guide={team.guide} variant="inline" />
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {team.submission_date || "22 Aug 2026, 08:22 AM"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED"
                              ? "bg-emerald-50 text-[#034419] border border-emerald-200/80"
                              : "bg-amber-50 text-amber-900 border border-amber-200/80"
                          }`}
                        >
                          {team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED"
                            ? "EVALUATED"
                            : team.submission_status || "SUBMITTED"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <Link
                          to={`/advisor/teams/${team.id || team.team_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#034419] hover:underline"
                        >
                          <span>Evaluate</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Recent Committee Activity */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              COMMITTEE ACTIVITY
            </h2>
          </div>

          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 space-y-3.5">
            <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              {committeeActivities.map((activity, idx) => (
                <div key={activity.id || idx} className="relative">
                  {/* Emerald Dot */}
                  <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-[#034419] ring-3 ring-white" />
                  <div className="text-xs font-semibold text-slate-800 leading-snug">
                    {activity.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvisorDashboardPage;
