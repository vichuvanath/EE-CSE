"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHodTeams } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { getTeamGuide } from "@/lib/team-guide";

export default function HodProjectsPage() {
  const { selectedBatch } = useHodStore();
  const teams = useHodTeams(selectedBatch);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filtered = teams.filter(
    (t) =>
      t.project_title.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects Overview"
        description={`All department projects for batch ${selectedBatch}.`}
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Projects" },
        ]}
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
            {teams.length} Projects
          </span>
        }
      />

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project title or team name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-white shadow-xs text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-white shadow-xs text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.length > 0 ? (
            filtered.map((team) => {
              const guide = getTeamGuide(team);
              const isExpanded = expandedCard === team.team_id;
              const score = team.evaluation?.team_score;

              return (
                <div
                  key={team.team_id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Header Gradient */}
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />

                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] line-clamp-2 leading-snug">
                      {team.project_title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                      {team.name} · Sec {team.section}
                    </p>

                    {/* Guide */}
                    <div className="mt-3 flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Guide:</span>
                      <span className="font-semibold text-slate-800">{guide.name}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{guide.designation}</span>
                    </div>

                    {/* Status Row */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={team.evaluation_status} size="sm" />
                      </div>
                      {score && (
                        <span className={`text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                          score >= 90 ? "text-emerald-600" : score >= 80 ? "text-amber-600" : "text-slate-700"
                        }`}>
                          {score}<span className="text-[10px] text-slate-400 font-normal">/100</span>
                        </span>
                      )}
                    </div>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : team.team_id)}
                      className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg py-1.5 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Details <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <GraduationCap className="w-3 h-3 text-slate-400" />
                          {team.member_count} Members
                        </div>
                        <div className="space-y-1">
                          {(team.members || []).map((m) => (
                            <div key={m.id} className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-700 font-medium">{m.full_name}</span>
                              <span className="text-slate-400 font-mono">{m.roll_number}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                          <span className="text-slate-400">Batch {team.batch}</span>
                          <span className="text-slate-400">{team.current_phase || "—"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No projects match your search.</p>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Project Title</th>
                  <th className="py-3 px-5">Team</th>
                  <th className="py-3 px-5">Guide</th>
                  <th className="py-3 px-5">Phase</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((team) => {
                  const guide = getTeamGuide(team);
                  return (
                    <tr key={team.team_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 max-w-[280px]">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-2">
                          {team.project_title}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                        {team.name}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-700 font-semibold">
                        {guide.name}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">
                        {team.current_phase || "—"}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={team.evaluation_status} size="sm" />
                      </td>
                      <td className="py-3.5 px-5 text-right text-sm font-bold text-slate-800">
                        {team.evaluation?.team_score || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
