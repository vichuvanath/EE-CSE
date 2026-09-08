import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  FileDown,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useHodCompliance } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";

export function HodEvaluationMonitoringPage() {
  const { academicYear } = useHodStore();
  const { data: complianceList, isLoading } = useHodCompliance();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedAdvisorId, setExpandedAdvisorId] = useState<string | null>(null);

  const filtered = (complianceList || []).filter((comp) => {
    if (statusFilter === "OVERDUE" && comp.overdue_reviews === 0) return false;
    if (statusFilter === "IN_PROGRESS" && comp.status !== "IN_PROGRESS") return false;
    if (statusFilter === "COMPLETED" && comp.status !== "COMPLETED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = comp.advisor_name.toLowerCase().includes(q);
      const matchDept = comp.department.toLowerCase().includes(q);
      if (!matchName && !matchDept) return false;
    }
    return true;
  });

  const totalCompleted = (complianceList || []).reduce(
    (acc, c) => acc + c.completed_evaluations,
    0
  );
  const totalPending = (complianceList || []).reduce(
    (acc, c) => acc + c.pending_evaluations,
    0
  );
  const totalOverdue = (complianceList || []).reduce(
    (acc, c) => acc + c.overdue_reviews,
    0
  );
  const overallPct =
    totalCompleted + totalPending > 0
      ? Math.round((totalCompleted / (totalCompleted + totalPending)) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              PRC Quality Compliance
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AY {academicYear}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Advisor Evaluation Monitoring & Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance tracker monitoring faculty grading turnaround, overdue review bottlenecks, and average distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hod/advisors"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <span>Advisors Roster</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Summary KPI Strip (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Evaluations Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {totalCompleted}
            <span className="text-xs text-emerald-600 font-semibold ml-2">
              ({overallPct}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Certified by faculty advisors
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Pending Evaluations
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2 font-mono">
            {totalPending}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Awaiting advisor reviews
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Overdue Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
            {totalOverdue}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-0.5">
            Exceeding 7-day review window
          </div>
        </div>

        {/* Avg Dept Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Avg Dept Score Given
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2 font-mono">
            86.4
            <span className="text-xs text-slate-400 font-normal ml-0.5">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Mean department distribution
          </div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search advisor name or department..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Advisors</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">100% Completed</option>
          </select>
        </div>
      </div>

      {/* 4. Monitoring Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-mono border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Faculty Advisor</th>
                <th className="py-3 px-4 text-center">Assigned Teams</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-center">Pending</th>
                <th className="py-3 px-4 text-center">Overdue</th>
                <th className="py-3 px-4 text-center">Avg Score Given</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((comp) => {
                const isExpanded = expandedAdvisorId === comp.id;

                return (
                  <React.Fragment key={comp.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition ${
                        isExpanded ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <Link
                          to={`/hod/advisors/${comp.advisor_id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition text-sm"
                        >
                          {comp.advisor_name}
                        </Link>
                        <div className="text-[11px] text-slate-400">
                          {comp.designation} · {comp.department}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {comp.assigned_teams}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                        {comp.completed_evaluations}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {comp.pending_evaluations}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {comp.overdue_reviews > 0 ? (
                          <span className="text-rose-600 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                            {comp.overdue_reviews} Overdue
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        {comp.avg_score_given} / 100
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                            comp.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : comp.status === "OVERDUE"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {comp.status === "COMPLETED"
                            ? "100% COMPLETED"
                            : comp.status === "OVERDUE"
                            ? "OVERDUE BOTTLENECK"
                            : "IN PROGRESS"}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() =>
                            setExpandedAdvisorId(isExpanded ? null : comp.id)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <span>{isExpanded ? "Hide" : "Inspect"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Breakdown Sub-grid */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-4 bg-slate-50/70 border-y border-indigo-100">
                          <div className="space-y-3 animate-in fade-in-50 duration-150">
                            <h4 className="text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider">
                              Assigned Teams Breakdown · {comp.advisor_name}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {comp.teams_breakdown.map((t) => (
                                <div
                                  key={t.team_id}
                                  className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-2 ${
                                    t.is_overdue
                                      ? "border-rose-200 ring-1 ring-rose-200"
                                      : "border-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-slate-900 text-xs">
                                      {t.team_name}
                                    </h5>
                                    {t.is_overdue ? (
                                      <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-rose-100 text-rose-800 font-mono">
                                        OVERDUE
                                      </span>
                                    ) : t.marks_awarded !== undefined ? (
                                      <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                                        EVALUATED
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-amber-100 text-amber-800 font-mono">
                                        PENDING
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-500 font-mono">
                                    Stage {t.stage_number} Review
                                  </div>

                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-slate-400">Score:</span>
                                    <span className="font-bold text-slate-800">
                                      {t.marks_awarded !== undefined
                                        ? `${t.marks_awarded} / 20`
                                        : "Awaiting review"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
