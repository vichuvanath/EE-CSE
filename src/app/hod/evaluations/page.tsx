"use client";

import React, { useState, useMemo } from "react";
import {
  Award,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHodEvaluations, useHodTeams } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { getTeamGuide } from "@/lib/team-guide";

export default function HodEvaluationsPage() {
  const { selectedBatch } = useHodStore();
  const allTeams = useHodTeams(selectedBatch);
  const evaluatedTeams = useHodEvaluations(selectedBatch);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...evaluatedTeams].sort((a, b) => {
      const sa = a.evaluation?.team_score || 0;
      const sb = b.evaluation?.team_score || 0;
      return sortDir === "desc" ? sb - sa : sa - sb;
    });
  }, [evaluatedTeams, sortDir]);

  const scores = evaluatedTeams
    .map((t) => t.evaluation?.team_score || 0)
    .filter((s) => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowScore = scores.length > 0 ? Math.min(...scores) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluations"
        description={`Department-wide evaluation overview for batch ${selectedBatch}.`}
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Evaluations" },
        ]}
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Evaluated</p>
            <p className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {evaluatedTeams.length}
              <span className="text-xs text-slate-400 font-normal ml-1">/ {allTeams.length}</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Average Score</p>
            <p className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">{avgScore}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Highest</p>
            <p className="text-xl font-bold text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">{highScore}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
            <TrendingDown className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Lowest</p>
            <p className="text-xl font-bold text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">{lowScore}</p>
          </div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5">Guide</th>
                <th className="py-3 px-5 text-center">Project /20</th>
                <th className="py-3 px-5 text-center">Technical /20</th>
                <th className="py-3 px-5 text-center">Presentation /20</th>
                <th className="py-3 px-5 text-center">Documentation /20</th>
                <th className="py-3 px-5 text-center">Contribution /20</th>
                <th
                  className="py-3 px-5 text-right cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
                >
                  <span className="flex items-center justify-end gap-1.5">
                    Total /100
                    {sortDir === "desc" ? (
                      <ArrowDown className="w-3 h-3 text-indigo-500" />
                    ) : (
                      <ArrowUp className="w-3 h-3 text-indigo-500" />
                    )}
                  </span>
                </th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length > 0 ? (
                sorted.map((team) => {
                  const guide = getTeamGuide(team);
                  const cs = team.evaluation?.criteria_scores;
                  const total = team.evaluation?.team_score || 0;

                  const scoreCell = (val: number | undefined) => {
                    if (val == null) return <span className="text-slate-400">—</span>;
                    const color =
                      val >= 18
                        ? "text-emerald-600 bg-emerald-50"
                        : val >= 15
                        ? "text-amber-700 bg-amber-50"
                        : "text-rose-600 bg-rose-50";
                    return (
                      <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md text-xs font-bold ${color}`}>
                        {val}
                      </span>
                    );
                  };

                  return (
                    <tr key={team.team_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900">{team.name}</span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                          {team.project_title}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-semibold text-slate-800">{guide.name}</span>
                      </td>
                      <td className="py-3.5 px-5 text-center">{scoreCell(cs?.project)}</td>
                      <td className="py-3.5 px-5 text-center">{scoreCell(cs?.technical)}</td>
                      <td className="py-3.5 px-5 text-center">{scoreCell(cs?.presentation)}</td>
                      <td className="py-3.5 px-5 text-center">{scoreCell(cs?.documentation)}</td>
                      <td className="py-3.5 px-5 text-center">{scoreCell(cs?.contribution)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className={`text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                          total >= 90 ? "text-emerald-600" : total >= 80 ? "text-amber-600" : total >= 70 ? "text-slate-700" : "text-rose-600"
                        }`}>
                          {total}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={team.evaluation_status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-xs text-slate-400">
                    No evaluated teams in this batch yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
