"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  FolderKanban,
  Briefcase,
  Award,
  ClipboardCheck,
  FileCheck2,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHodDashboard, useHodTeams, useHodApprovals } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { getTeamGuide } from "@/lib/team-guide";
import { formatDateTime } from "@/lib/utils";

export default function HodDashboardPage() {
  const stats = useHodDashboard();
  const { selectedBatch } = useHodStore();
  const teams = useHodTeams(selectedBatch);
  const approvals = useHodApprovals();

  const topTeams = [...teams]
    .filter((t) => t.evaluation?.team_score)
    .sort((a, b) => (b.evaluation?.team_score || 0) - (a.evaluation?.team_score || 0))
    .slice(0, 5);

  const pendingApprovals = approvals.filter((a) => a.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Department Overview"
        description="Centralized monitoring and administration for the Computer Science & Engineering department across all batches."
        breadcrumbs={[
          { label: "SIET Portal", href: "/hod/dashboard" },
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Dashboard" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/hod/reports"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
              Reports
            </Link>
            <Link
              href="/hod/evaluations"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              Evaluations
            </Link>
          </div>
        }
      />

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Teams"
          value={stats.total_teams}
          subtitle={`Across ${stats.batches.length} active batches`}
          icon={FolderKanban}
          variant="emerald"
        />
        <MetricCard
          title="Total Students"
          value={stats.total_students}
          subtitle="Enrolled project candidates"
          icon={GraduationCap}
          variant="teal"
        />
        <MetricCard
          title="Faculty Guides"
          value={stats.total_faculty}
          subtitle="Active department guides"
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Evaluations"
          value={`${stats.evaluations_completed} / ${stats.evaluations_completed + stats.evaluations_pending}`}
          subtitle={`${stats.evaluations_pending} pending evaluation`}
          icon={Award}
          variant="amber"
        />
      </div>

      {/* Second metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={stats.total_projects}
          subtitle="Active department projects"
          icon={Briefcase}
          variant="teal"
        />
        <MetricCard
          title="Submissions"
          value={stats.submissions_received}
          subtitle="Final dossiers received"
          icon={FileCheck2}
          variant="emerald"
        />
        <MetricCard
          title="Pending Approvals"
          value={stats.approvals_pending}
          subtitle="Awaiting HOD review"
          icon={ClipboardCheck}
          variant="amber"
        />
        <MetricCard
          title="Department"
          value="CSE"
          subtitle="Computer Science & Engineering"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Batch Distribution Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mb-4">
          Teams by Batch
        </h3>
        <div className="space-y-3">
          {stats.batches.map((batch) => {
            const batchTeams = teams.filter((t) => t.batch === batch || !selectedBatch);
            const count = useHodTeams(batch).length;
            const pct = Math.round((count / Math.max(stats.total_teams, 1)) * 100);
            return (
              <div key={batch} className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-600 w-24 shrink-0">
                  {batch}
                </span>
                <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 flex items-center justify-end pr-2.5"
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {count} teams
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 w-10 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Top Teams + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP PERFORMING TEAMS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Top Performing Teams
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest scoring teams across the department for the selected batch.
              </p>
            </div>
            <Link
              href="/hod/evaluations"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              All Evaluations <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">Team / Project</th>
                  <th className="py-3 px-6">Guide</th>
                  <th className="py-3 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topTeams.length > 0 ? (
                  topTeams.map((team, idx) => {
                    const guide = getTeamGuide(team);
                    const score = team.evaluation?.team_score || 0;
                    return (
                      <tr key={team.team_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            idx === 0
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : idx === 1
                              ? "bg-slate-200 text-slate-700"
                              : idx === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-900 block">{team.name}</span>
                          <span className="text-xs text-slate-500 truncate block max-w-sm">
                            {team.project_title}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-xs font-semibold text-slate-800">{guide.name}</span>
                          <span className="block text-[11px] text-slate-400">
                            {guide.designation}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span className={`text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                            score >= 90
                              ? "text-emerald-600"
                              : score >= 80
                              ? "text-amber-600"
                              : "text-slate-700"
                          }`}>
                            {score}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-0.5">/100</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-slate-400">
                      No evaluated teams in this batch yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PENDING APPROVALS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-500" />
              Pending Approvals
            </h4>
            <Link
              href="/hod/approvals"
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((a) => (
                <div key={a.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {a.type === "EXTENSION" ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : a.type === "GUIDE_CHANGE" ? (
                        <Users className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">{a.team_name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {a.type.replace(/_/g, " ")} — {a.guide_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {formatDateTime(a.submitted_at)}
                      </p>
                    </div>
                    <Link
                      href="/hod/approvals"
                      className="shrink-0 text-xs font-semibold text-indigo-600 hover:underline flex items-center"
                    >
                      Review <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">All approvals are up to date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
