import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  FileSpreadsheet,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useHodAdvisorDetail, useHodAdvisorEvaluations } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import {
  exportCyclePDF,
  exportCycleExcel,
  exportCycleCSV,
} from "@/lib/export-hod-reports";
import { AdvisorEvaluationHistoryRecord } from "@/types/hod";

export function HodAdvisorEvaluationHistoryPage() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const { selectedBatch, setSelectedBatch, availableBatches } = useHodStore();

  const { data: advisor } = useHodAdvisorDetail(advisorId || "adv-1", selectedBatch);
  const { data: records, isLoading } = useHodAdvisorEvaluations(
    advisorId || "adv-1",
    selectedBatch
  );

  const [dateFilter, setDateFilter] = useState("ALL");
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // Group records by date
  const grouped = (records || []).reduce((acc, r) => {
    const key = r.evaluation_date || "Recent";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, AdvisorEvaluationHistoryRecord[]>);

  const allDates = Object.keys(grouped);
  const visibleDates =
    dateFilter === "ALL" ? allDates : allDates.filter((d) => d === dateFilter);

  const toggleDate = (date: string) => {
    setCollapsedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Breadcrumbs & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/hod/advisors" className="hover:text-indigo-600 transition">
            Advisors & Guides
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            to={`/hod/advisors/${advisorId}`}
            className="hover:text-indigo-600 transition font-semibold text-slate-700"
          >
            {advisor?.name || "Advisor"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-indigo-600 font-bold">Evaluation Records</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Cohort:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Strip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
            CHRONOLOGICAL EVALUATION AUDIT TRAIL
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
            Evaluation Cycles · {advisor?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete log of all milestone reviews, submitted time stamps, scores, and official PRC remarks.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10.5px] font-mono text-slate-400 uppercase block">
              Teams Handled
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 block">
              {advisor?.teams_count || 4}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
            <span className="text-[10.5px] font-mono text-indigo-600 uppercase block">
              Logged Records
            </span>
            <span className="text-lg font-bold font-mono text-indigo-700 block">
              {records?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter by Specific Evaluation Date */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter by Date:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Evaluation Dates ({allDates.length} Cycles)</option>
            {allDates.map((d) => (
              <option key={d} value={d}>
                {d} ({grouped[d].length} teams)
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {visibleDates.length} of {allDates.length} cycle sessions
        </div>
      </div>

      {/* 4. Chronological Collapsible Evaluation Cycle Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono animate-pulse">
            Loading chronological evaluation cycles...
          </div>
        ) : visibleDates.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No evaluation cycles found for this filter.
          </div>
        ) : (
          visibleDates.map((dateKey) => {
            const cycleRecords = grouped[dateKey];
            const isCollapsed = collapsedDates[dateKey];

            return (
              <div
                key={dateKey}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Date Header Strip */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleDate(dateKey)}
                  >
                    <button className="p-1 rounded-md text-slate-500 hover:text-slate-800">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {dateKey}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {cycleRecords.length} Teams Evaluated
                    </span>
                  </div>

                  {/* Bulk Exports for this specific cycle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportCyclePDF(
                          advisor?.name || "Advisor",
                          selectedBatch,
                          dateKey,
                          cycleRecords
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() =>
                        exportCycleExcel(
                          advisor?.name || "Advisor",
                          selectedBatch,
                          dateKey,
                          cycleRecords
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Excel</span>
                    </button>

                    <button
                      onClick={() =>
                        exportCycleCSV(
                          advisor?.name || "Advisor",
                          selectedBatch,
                          dateKey,
                          cycleRecords
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Body Table */}
                {!isCollapsed && (
                  <div className="p-4 space-y-4">
                    {cycleRecords.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">
                                {r.team_name}
                              </h3>
                              <span className="text-xs font-mono text-slate-400">
                                Guide: {r.guide_name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {r.project_title}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {r.evaluation_time}
                            </span>
                            <span className="font-mono font-bold text-sm px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {r.marks_awarded} / {r.max_marks}
                            </span>
                          </div>
                        </div>

                        {/* Students Roster (Clean, No Leader) */}
                        {r.students && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-mono text-slate-400 mr-1">
                              Members:
                            </span>
                            {r.students.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Criteria Scores */}
                        {r.criteria_scores && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Problem Def:</span>
                              <span className="font-bold text-slate-800">{r.criteria_scores.problem_definition} / 5</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Implementation:</span>
                              <span className="font-bold text-slate-800">{r.criteria_scores.technical_implementation} / 5</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Innovation:</span>
                              <span className="font-bold text-slate-800">{r.criteria_scores.innovation} / 5</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Presentation:</span>
                              <span className="font-bold text-slate-800">{r.criteria_scores.presentation} / 5</span>
                            </div>
                          </div>
                        )}

                        {/* Feedback */}
                        {r.feedback && (
                          <div className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
                            "{r.feedback}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
