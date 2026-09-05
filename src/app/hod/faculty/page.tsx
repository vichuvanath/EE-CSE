"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useHodFaculty, useHodAllTeams } from "@/hooks/use-hod";
import { getTeamGuide } from "@/lib/team-guide";

export default function HodFacultyPage() {
  const faculty = useHodFaculty();
  const allTeams = useHodAllTeams();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const getTeamsForFaculty = (facultyId: string) => {
    return allTeams.filter((t) => {
      const guide = getTeamGuide(t);
      const fac = faculty.find((f) => f.id === facultyId);
      return fac && guide.name === fac.name;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Guides"
        description="Department faculty roster and their assigned project teams."
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Faculty & Guides" },
        ]}
      />

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium px-3 py-2 bg-white rounded-lg border border-slate-200">
          {filtered.length} Faculty Members
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 w-8"></th>
                <th className="py-3 px-6">Faculty Name</th>
                <th className="py-3 px-6">Designation</th>
                <th className="py-3 px-6">Specialization</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6 text-center">Teams</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((fac) => {
                const isExpanded = expandedId === fac.id;
                const assignedTeams = getTeamsForFaculty(fac.id);

                return (
                  <React.Fragment key={fac.id}>
                    <tr
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : fac.id)}
                    >
                      <td className="py-4 px-6">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {fac.name.split(" ").slice(-1)[0]?.[0] || "F"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{fac.name}</span>
                            <span className="text-[11px] text-slate-400">{fac.department}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {fac.designation}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 max-w-[200px] truncate">
                        {fac.specialization || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-slate-500 font-mono">{fac.email}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                          {assignedTeams.length}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded: Assigned Teams */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-indigo-50/30 px-12 py-4">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                            Assigned Teams ({assignedTeams.length})
                          </p>
                          {assignedTeams.length > 0 ? (
                            <div className="space-y-2">
                              {assignedTeams.map((team) => (
                                <div
                                  key={team.team_id}
                                  className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3"
                                >
                                  <div>
                                    <span className="text-xs font-semibold text-slate-800">
                                      {team.name}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      {team.project_title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {team.batch} · Sec {team.section}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                      <GraduationCap className="w-3 h-3" />
                                      {team.member_count} members
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              No teams currently assigned.
                            </p>
                          )}
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
