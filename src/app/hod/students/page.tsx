"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  GraduationCap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHodStudents } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";

type SortKey = "full_name" | "roll_number" | "total_marks";
type SortDir = "asc" | "desc";

export default function HodStudentsPage() {
  const { selectedBatch } = useHodStore();
  const students = useHodStudents(selectedBatch);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("roll_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-500" />
    );
  };

  const filtered = useMemo(() => {
    let result = students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "full_name") {
        cmp = a.full_name.localeCompare(b.full_name);
      } else if (sortKey === "roll_number") {
        cmp = a.roll_number.localeCompare(b.roll_number);
      } else if (sortKey === "total_marks") {
        cmp = (a.total_marks ?? -1) - (b.total_marks ?? -1);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [students, search, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students Directory"
        description={`All enrolled students for batch ${selectedBatch}.`}
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Students" },
        ]}
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
            {students.length} Students
          </span>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, roll number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th
                  className="py-3 px-5 cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => toggleSort("roll_number")}
                >
                  <span className="flex items-center gap-1.5">
                    Roll No <SortIcon field="roll_number" />
                  </span>
                </th>
                <th
                  className="py-3 px-5 cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => toggleSort("full_name")}
                >
                  <span className="flex items-center gap-1.5">
                    Full Name <SortIcon field="full_name" />
                  </span>
                </th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5">Guide</th>
                <th className="py-3 px-5">Status</th>
                <th
                  className="py-3 px-5 text-right cursor-pointer hover:text-slate-800 select-none"
                  onClick={() => toggleSort("total_marks")}
                >
                  <span className="flex items-center justify-end gap-1.5">
                    Marks <SortIcon field="total_marks" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-700 font-semibold">
                      {s.roll_number}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-900 text-sm">{s.full_name}</span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">{s.email}</td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-semibold text-slate-700">{s.team_name || "—"}</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                        {s.project_title || ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {s.guide ? (
                        <div>
                          <span className="text-xs font-semibold text-slate-800">{s.guide.name}</span>
                          <span className="block text-[11px] text-slate-400">
                            {s.guide.designation}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={s.evaluation_status || "PENDING"} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {s.total_marks != null ? (
                        <span className={`text-sm font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                          s.total_marks >= 90
                            ? "text-emerald-600"
                            : s.total_marks >= 80
                            ? "text-amber-600"
                            : s.total_marks >= 70
                            ? "text-slate-700"
                            : "text-rose-600"
                        }`}>
                          {s.total_marks}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-xs text-slate-400">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No students match your search.
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
