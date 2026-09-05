"use client";

import React, { useState } from "react";
import {
  Search,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Users,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHodTeams } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { getTeamGuide } from "@/lib/team-guide";

export default function HodTeamsPage() {
  const { selectedBatch } = useHodStore();
  const teams = useHodTeams(selectedBatch);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = teams.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.project_title.toLowerCase().includes(search.toLowerCase());
    const matchSection = sectionFilter === "all" || t.section === sectionFilter;
    const matchStatus =
      statusFilter === "all" || t.evaluation_status === statusFilter;
    return matchSearch && matchSection && matchStatus;
  });

  const sections = [...new Set(teams.map((t) => t.section))].sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams Management"
        description={`All project teams for batch ${selectedBatch}. Click any team to view members and evaluation details.`}
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Teams" },
        ]}
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
            {teams.length} Teams
          </span>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by team name or project title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="all">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="EVALUATED">Evaluated</option>
            <option value="PENDING">Pending</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 w-8"></th>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5">Project Title</th>
                <th className="py-3 px-5">Guide</th>
                <th className="py-3 px-5 text-center">Section</th>
                <th className="py-3 px-5 text-center">Members</th>
                <th className="py-3 px-5">Submission</th>
                <th className="py-3 px-5">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((team) => {
                  const guide = getTeamGuide(team);
                  const isExpanded = expandedId === team.team_id;
                  return (
                    <React.Fragment key={team.team_id}>
                      <tr
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : team.team_id)
                        }
                      >
                        <td className="py-3.5 px-5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-slate-900">{team.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {team.team_id.slice(0, 18)}…
                          </span>
                        </td>
                        <td className="py-3.5 px-5 max-w-[250px]">
                          <span className="text-xs text-slate-600 line-clamp-2">
                            {team.project_title}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-xs font-semibold text-slate-800">{guide.name}</span>
                          <span className="block text-[11px] text-slate-400">
                            {guide.designation}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {team.section}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            {team.member_count}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={team.submission_status} size="sm" />
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={team.evaluation_status} size="sm" />
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="bg-indigo-50/20 px-12 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Members */}
                              <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                                  Team Members ({team.member_count})
                                </p>
                                <div className="space-y-1.5">
                                  {(team.members || []).map((m) => (
                                    <div
                                      key={m.id}
                                      className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-2"
                                    >
                                      <div>
                                        <span className="text-xs font-semibold text-slate-800">
                                          {m.full_name}
                                        </span>
                                        {(m.is_team_leader || m.is_leader) && (
                                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                                            Leader
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        {m.roll_number}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Evaluation Info */}
                              <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                                  Project Details
                                </p>
                                <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Guide</span>
                                    <span className="text-xs font-semibold text-slate-800">
                                      {guide.name} · {guide.designation}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Batch</span>
                                    <span className="text-xs font-mono text-slate-600">{team.batch}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Phase</span>
                                    <span className="text-xs text-slate-600">{team.current_phase || "—"}</span>
                                  </div>
                                  {team.evaluation?.team_score && (
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Score</span>
                                      <span className="text-lg font-bold text-indigo-600 font-['Plus_Jakarta_Sans',sans-serif]">
                                        {team.evaluation.team_score}
                                        <span className="text-[11px] text-slate-400 font-normal ml-0.5">/100</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-xs text-slate-400">
                    No teams match your filters.
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
