"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  FileCheck2,
  Award,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Send,
  FolderClock,
} from "lucide-react";
import { useAdvisorDashboard } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { formatDateTime } from "@/lib/utils";
import { getTeamGuide } from "@/lib/team-guide";

export default function AdvisorDashboardPage() {
  const { data: dashboard, isLoading, error, refetch } = useAdvisorDashboard();

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Advisor Dashboard"
      />
    );
  }

  const recentSubmissions = dashboard?.recent_submissions || [];
  const recentActivities = dashboard?.recent_activities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Faculty Advisor Dashboard"
        description="Monitor project progress, assigned candidate cohorts, document submissions, and evaluation milestones."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Advisor Console", href: "/advisor/dashboard" },
          { label: "Dashboard" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/advisor/records"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FolderClock className="w-3.5 h-3.5 text-slate-500" />
              Evaluation Records
            </Link>
            <Link
              href="/advisor/teams"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white shadow-xs transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              Evaluate Teams
            </Link>
          </div>
        }
      />

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Teams"
          value={dashboard?.total_teams ?? 0}
          subtitle="Cap-controlled project teams"
          icon={Users}
          variant="emerald"
        />
        <MetricCard
          title="Supervised Students"
          value={dashboard?.total_students ?? 0}
          subtitle="Enrolled project candidates"
          icon={GraduationCap}
          variant="teal"
        />
        <MetricCard
          title="Submissions Received"
          value={`${dashboard?.submitted_count ?? 0} / ${dashboard?.total_teams ?? 0}`}
          subtitle={`${dashboard?.pending_submissions ?? 0} teams pending`}
          icon={FileCheck2}
          variant="default"
        />
        <MetricCard
          title="Evaluations Completed"
          value={`${dashboard?.evaluated_count ?? 0} / ${dashboard?.total_teams ?? 0}`}
          subtitle={`${dashboard?.pending_evaluations ?? 0} pending grading`}
          icon={Award}
          variant="amber"
        />
      </div>

      {/* TWO COLUMN WORKSPACE: Submissions & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT SUBMISSIONS (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Recent Team Submissions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest final project dossiers submitted for committee evaluation.
              </p>
            </div>
            <Link
              href="/advisor/teams"
              className="text-xs font-semibold text-[#0F5132] hover:underline flex items-center gap-1"
            >
              View Teams <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Team / Project</th>
                  <th className="py-3 px-6">Submitted At</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((sub, idx) => {
                    const guide = getTeamGuide(sub);
                    return (
                      <tr key={sub.submission_id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-900 block">
                            {sub.team_name}
                          </span>
                          <span className="text-xs text-slate-500 truncate block max-w-xs">
                            {sub.project_title}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Guide:</span>
                            <span className="font-bold text-slate-900">{guide.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">{guide.designation} ({guide.department})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                          {formatDateTime(sub.submitted_at)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={sub.status || "SUBMITTED"} size="sm" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href="/advisor/teams"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F5132] hover:underline"
                          >
                            Evaluate <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-slate-400">
                      No project submissions received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT COMMITTEE ACTIVITY FEED (1 Column) */}
        <div className="space-y-6">

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Recent Committee Activity
            </h4>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#0F5132] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">{act.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {act.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                No recent activity recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
