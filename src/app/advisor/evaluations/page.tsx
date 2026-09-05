"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { useAdvisorTeams } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export default function AdvisorEvaluationsPage() {
  const { data: teams = [], isLoading, error, refetch } = useAdvisorTeams();

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Evaluations Overview"
      />
    );
  }

  const evaluatedCount = teams.filter(
    (t) => t.evaluation_status === "EVALUATED" || t.evaluation_status === "SUBMITTED" || t.evaluation_status === "LOCKED"
  ).length;

  const pendingCount = teams.length - evaluatedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Evaluations & Viva Voce Grading"
        description="Official rubric grading for team milestones and individual candidate viva voce examination."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Advisor Console", href: "/advisor/dashboard" },
          { label: "Evaluations" },
        ]}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Assigned Teams"
          value={teams.length}
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

      {teams.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Team Grading Portfolios
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a team to grade individual criteria (Project, Presentation, Technical, Documentation, Contribution).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Team / Project</th>
                  <th className="py-3.5 px-6">Members</th>
                  <th className="py-3.5 px-6">Evaluation Status</th>
                  <th className="py-3.5 px-6 text-right">Rubric Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <tr
                    key={team.team_id || team.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block font-['Plus_Jakarta_Sans',sans-serif]">
                        {team.name}
                      </span>
                      <span className="text-xs text-slate-500 truncate block max-w-sm mt-0.5">
                        {team.project_title || "Pending Title Submission"}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {team.member_count || 4} Students
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={team.evaluation_status || "NOT_STARTED"} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/advisor/teams/${team.team_id || team.id}/evaluation`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] transition-colors"
                      >
                        Enter Scores <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Teams Assigned for Evaluation"
          description="Your profile currently has no assigned teams to grade."
          icon={Award}
        />
      )}
    </div>
  );
}
