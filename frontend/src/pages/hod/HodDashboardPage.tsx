import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  FolderKanban,
  Award,
  UserCheck,
  Activity,
  TrendingUp,
  History,
  FileBarChart,
  ArrowRight,
  Clock,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  useHodDashboardSummary,
  useHodMilestoneStages,
  useHodAttentionItems,
  useHodLiveActivity,
  useHodAdvisors,
} from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";

export function HodDashboardPage() {
  const { academicYear } = useHodStore();
  const { data: summary } = useHodDashboardSummary();
  const { data: stages } = useHodMilestoneStages();
  const { data: attentionItems } = useHodAttentionItems();
  const { data: liveActivity } = useHodLiveActivity();
  const { data: advisors } = useHodAdvisors();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              AY {academicYear}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              PRC Autonomous v2.0
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            HOD Academic Supervision Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive oversight of project cohorts, faculty advisor compliance, and autonomous rubrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/hod/change-history"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Admin Change History</span>
          </Link>

          <Link
            to="/hod/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <FileBarChart className="w-4 h-4 text-slate-500" />
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {/* 2. Unified High-Density KPI Metric Strip (No Isolated Bubbly Cards) */}
      <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Students */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Students
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
              {summary?.students_count || 240}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Enrolled candidates
            </div>
          </div>

          {/* Teams */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Teams
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
              {summary?.teams_count || 48}
            </div>
            <div className="text-[11px] text-[#034419] font-medium mt-0.5 truncate">
              Active project units
            </div>
          </div>

          {/* Advisors */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Advisors
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
              {summary?.advisors_count || 12}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Faculty evaluators
            </div>
          </div>

          {/* Guides */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Guides
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
              {summary?.guides_count || 18}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Technical mentors
            </div>
          </div>

          {/* Health */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Cohort Health
            </span>
            <div className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-1.5 font-mono">
              <span className="text-emerald-700">{summary?.health.on_track || 36} Track</span>
            </div>
            <div className="text-[10.5px] font-mono mt-0.5 flex items-center gap-1 text-slate-500">
              <span className="text-amber-700 font-semibold">{summary?.health.at_risk || 9} Risk</span>
              <span>·</span>
              <span className="text-rose-700 font-semibold">{summary?.health.critical || 3} Crit</span>
            </div>
          </div>

          {/* Avg Score */}
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Avg Score
            </span>
            <div className="text-2xl font-bold text-[#034419] mt-1.5 font-mono">
              {summary?.avg_score || 86.4}
              <span className="text-xs text-slate-400 font-normal ml-0.5">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {summary?.evaluated_teams_count || 42} graded
            </div>
          </div>
        </div>
      </div>

      {/* 3. Project Milestone Stages & Progression (Open, Structured Section) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Project Milestone Stages &amp; Department Progression
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Current progress across all 6 autonomous milestone evaluation phases
            </p>
          </div>
          <Link
            to="/hod/advisors"
            className="text-xs font-semibold text-[#034419] hover:underline flex items-center gap-1"
          >
            <span>View Faculty Supervision</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {(stages || []).map((stg) => {
            const pct = Math.round((stg.completed_teams / stg.total_teams) * 100);
            const isDone = pct === 100;
            const inProgress = pct > 0 && pct < 100;

            return (
              <div
                key={stg.id}
                className={`p-3.5 rounded-md border flex flex-col justify-between transition-colors ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-200"
                    : inProgress
                    ? "bg-slate-50 border-slate-200"
                    : "bg-white border-slate-200/70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isDone
                          ? "bg-emerald-200 text-emerald-900"
                          : inProgress
                          ? "bg-emerald-100 text-[#034419]"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Stage {stg.stage_number}
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-500 font-semibold">
                      {stg.weightage_percent}% Wt
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[32px]">
                    {stg.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-600">
                      {stg.completed_teams} / {stg.total_teams}
                    </span>
                    <span
                      className={`font-bold ${
                        isDone
                          ? "text-emerald-700"
                          : inProgress
                          ? "text-[#034419]"
                          : "text-slate-400"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isDone
                          ? "bg-emerald-600"
                          : inProgress
                          ? "bg-[#16A34A]"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                    <span>Due:</span>
                    <span>{stg.due_date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Split (2:1 Grid): Attention Required & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Attention Required (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200/90 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Attention Required (Quality &amp; Compliance Items)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {attentionItems?.length || 0} active flags
              </span>
            </div>

            <div className="space-y-2.5">
              {(attentionItems || []).map((item) => {
                const isCrit = item.severity === "CRITICAL";
                const isHigh = item.severity === "HIGH";

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isCrit
                        ? "bg-rose-50/40 border-rose-200"
                        : isHigh
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isCrit ? (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : isHigh ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isCrit
                                ? "bg-rose-200 text-rose-900"
                                : isHigh
                                ? "bg-amber-200 text-amber-900"
                                : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {item.severity}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={item.action_link}
                      className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold transition self-start sm:self-center ${
                        isCrit
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : isHigh
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-slate-800 hover:bg-slate-900 text-white"
                      }`}
                    >
                      {item.action_label}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated checks verified against PRC guidelines.</span>
            <Link
              to="/hod/advisors"
              className="font-semibold text-[#034419] hover:underline flex items-center gap-1"
            >
              <span>View Faculty Supervision</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Live Activity Stream (1 col) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Department Activity
              </h2>
              <span className="flex items-center gap-1 text-[11px] text-[#16A34A] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              {(liveActivity || []).map((ev) => (
                <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-100 text-[#034419] flex items-center justify-center font-bold text-[9px] shrink-0 font-mono">
                    PRC
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 leading-snug text-[11.5px]">
                      <strong className="text-slate-900 font-semibold">{ev.actor_name}</strong>{" "}
                      <span className="text-slate-500">({ev.actor_role})</span>{" "}
                      {ev.action}{" "}
                      <strong className="text-[#034419] font-semibold">{ev.target_name}</strong>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ev.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono text-center">
            Synchronized with autonomous examination server
          </div>
        </div>
      </div>

      {/* 5. Faculty Supervision Summary (Clean Structured Table Section) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Faculty Advisor Supervision Summary
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Direct supervision metrics and grading completion status across all advisors
            </p>
          </div>
          <Link
            to="/hod/advisors"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>Open Advisors Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-mono border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Faculty Advisor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Teams Assigned</th>
                <th className="py-3 px-4 text-center">Students</th>
                <th className="py-3 px-4 text-center">Evaluations</th>
                <th className="py-3 px-4">Completion Rate</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(advisors || []).map((adv) => (
                <tr key={adv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/hod/advisors/${adv.id}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 transition"
                    >
                      {adv.name}
                    </Link>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {adv.designation}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {adv.department}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {adv.teams_count}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                    {adv.students_count}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs">
                    <span className="text-emerald-700 font-bold">{adv.evaluations_completed}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-slate-500">{adv.evaluations_completed + adv.evaluations_pending}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-36">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="font-semibold text-slate-700">
                          {adv.completion_rate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            adv.completion_rate === 100
                              ? "bg-emerald-500"
                              : adv.completion_rate > 70
                              ? "bg-indigo-600"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${adv.completion_rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/hod/advisors/${adv.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
