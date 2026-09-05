"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  FileCheck2,
  Calendar,
  Hash,
  Building2,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAdvisorTeams } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/lib/utils";
import { DownloadEvaluationMarks } from "@/components/advisor/DownloadEvaluationMarks";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";

export default function AdvisorTeamsPage() {
  const { data: teams = [], isLoading, error, refetch } = useAdvisorTeams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Evaluation Teams"
      />
    );
  }

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.team_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members?.some((m) =>
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      team.members_names?.some((m) =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      team.leader?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const isEvaluated =
      team.evaluation_status === "EVALUATED" ||
      team.evaluation_status === "APPROVED" ||
      team.evaluation?.status === "EVALUATED";

    const matchesStatus =
      filterStatus === "ALL" ||
      team.submission_status === filterStatus ||
      (filterStatus === "EVALUATED" && isEvaluated) ||
      (filterStatus === "PENDING" && !isEvaluated);

    return matchesSearch && matchesStatus;
  });

  const totalTeamsCount = teams.length;
  const evaluatedCount = teams.filter(
    (t) =>
      t.evaluation_status === "EVALUATED" ||
      t.evaluation_status === "APPROVED" ||
      t.evaluation?.status === "EVALUATED" ||
      t.evaluation?.status === "APPROVED"
  ).length;
  const pendingCount = Math.max(0, totalTeamsCount - evaluatedCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Evaluation"
        description="Official list of undergraduate project teams assigned to you for faculty guidance and viva evaluation."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Advisor Console", href: "/advisor/dashboard" },
          { label: "Evaluation" },
        ]}
        actions={<DownloadEvaluationMarks teams={teams} />}
      />

      {/* Metrics Dashboard Responsive to Project/Evaluation Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Assigned Teams"
          value={totalTeamsCount}
          subtitle="Evaluation cohorts"
          icon={Award}
          variant="emerald"
        />
        <MetricCard
          title="Evaluated Teams"
          value={evaluatedCount}
          subtitle="Scores officially computed"
          icon={CheckCircle2}
          variant="teal"
        />
        <MetricCard
          title="Pending Viva Grading"
          value={pendingCount}
          subtitle="Awaiting final score entry"
          icon={Clock}
          variant="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team, student name, roll no, or title..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-[#0F5132]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="NOT_SUBMITTED">Pending Submission</option>
            <option value="EVALUATED">Evaluation Completed</option>
            <option value="PENDING">Evaluation Pending</option>
          </select>
        </div>
      </div>

      {/* Teams Table Card */}
      {filteredTeams.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Team Name</th>
                  <th className="py-3.5 px-5">Team ID</th>
                  <th className="py-3.5 px-5 min-w-[170px]">Assigned Guide</th>
                  <th className="py-3.5 px-5">Department / Class</th>
                  <th className="py-3.5 px-5 min-w-[220px]">Team Members</th>
                  <th className="py-3.5 px-5 min-w-[240px]">Project Title</th>
                  <th className="py-3.5 px-5">Submission</th>
                  <th className="py-3.5 px-5">Current Phase</th>
                  <th className="py-3.5 px-5">Last Submitted</th>
                  <th className="py-3.5 px-5">Evaluation Status</th>
                  <th className="py-3.5 px-5 text-right sticky right-0 bg-slate-50 shadow-xs">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeams.map((team) => {
                  const teamId = team.team_id || team.id || "";
                  const dept = team.department || "Computer Science & Engineering";

                  const currentPhase =
                    team.current_phase ||
                    (team.submission_status === "SUBMITTED" ||
                    team.submission_status === "APPROVED"
                      ? "Phase II / Final Review"
                      : "Phase I Review");

                  const isEvaluated =
                    team.evaluation_status === "EVALUATED" ||
                    team.evaluation_status === "APPROVED" ||
                    team.evaluation?.status === "EVALUATED" ||
                    team.evaluation?.status === "APPROVED";

                  const evalScore = team.evaluation?.team_score;

                  return (
                    <tr
                      key={teamId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* 1. Team Name */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 block font-['Plus_Jakarta_Sans',sans-serif] text-sm">
                          {team.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {team.member_count || team.members?.length || 4} Students Enrolled
                        </span>
                      </td>

                      {/* 2. Team ID */}
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                          {teamId}
                        </span>
                      </td>

                      {/* Assigned Guide */}
                      <td className="py-4 px-5">
                        <TeamGuideBadge team={team} layout="table-cell" />
                      </td>

                      {/* 3. Department / Class */}
                      <td className="py-4 px-5 text-slate-700">
                        <div className="font-medium">{dept}</div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Batch {team.batch || "2023-27"} • Sec {team.section || "A"}
                        </span>
                      </td>

                      {/* 4. Team Members (Actual members list with roll numbers) */}
                      <td className="py-4 px-5 text-slate-800">
                        <div className="space-y-1 py-1">
                          {team.members && team.members.length > 0 ? (
                            team.members.map((m, idx) => (
                              <div
                                key={m.id || m.roll_number || idx}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F5132] shrink-0" />
                                <span className="font-semibold text-slate-900">
                                  {m.full_name}
                                </span>
                                {m.roll_number && (
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    — {m.roll_number}
                                  </span>
                                )}
                              </div>
                            ))
                          ) : team.members_names && team.members_names.length > 0 ? (
                            team.members_names.map((name, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 text-xs text-slate-700"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F5132] shrink-0" />
                                <span>{name}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">4 Students Enrolled</span>
                          )}
                        </div>
                      </td>

                      {/* 5. Project Title */}
                      <td
                        className="py-4 px-5 font-medium text-slate-900 max-w-[260px] truncate whitespace-normal"
                        title={team.project_title}
                      >
                        {team.project_title || "Pending Title Submission"}
                      </td>

                      {/* 6. Submission Status */}
                      <td className="py-4 px-5">
                        <StatusBadge status={team.submission_status} size="sm" />
                      </td>

                      {/* 7. Current Phase */}
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-700 font-semibold">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                          {currentPhase}
                        </span>
                      </td>

                      {/* 8. Last Submitted Date */}
                      <td className="py-4 px-5 font-mono text-slate-600">
                        {team.submitted_at
                          ? formatDate(team.submitted_at)
                          : team.submission_status === "SUBMITTED" ||
                            team.submission_status === "APPROVED"
                          ? "Sep 2, 2026"
                          : "—"}
                      </td>

                      {/* 9. Evaluation Status */}
                      <td className="py-4 px-5">
                        <div>
                          <StatusBadge
                            status={isEvaluated ? "EVALUATED" : "PENDING"}
                            size="sm"
                          />
                          {evalScore !== undefined && evalScore !== null && (
                            <span className="text-[11px] font-mono font-bold text-emerald-800 block mt-1">
                              Score: {evalScore} / 100
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 10. Action Column: "View Team Submission" */}
                      <td className="py-4 px-5 text-right sticky right-0 bg-white shadow-xs">
                        <Link
                          href={`/advisor/teams/${teamId}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          View Team Submission
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredTeams.length} assigned teams</span>
            <span className="font-mono text-[11px]">Academic Governance Synchronized</span>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Teams Found"
          description={
            searchQuery
              ? `No assigned teams match your search keyword "${searchQuery}".`
              : "No project teams are currently assigned to your profile."
          }
          icon={Users}
        />
      )}
    </div>
  );
}
