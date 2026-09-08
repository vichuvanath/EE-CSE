import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  RotateCcw,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  UserCheck,
  Award,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import { AuditLogEvent, AuditLogCategory } from "@/types";
import { TeamsManagementService } from "@/services/teams-management.service";
import { exportChangeHistoryPDF } from "@/lib/export-change-history";

export function AdvisorChangeManagementPage() {
  const [searchParams] = useSearchParams();
  const initialTeamParam = searchParams.get("team") || "All Teams";

  // Data
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [teams, setTeams] = useState<{ team_id: string; name: string }[]>([]);

  // Filter States
  const [teamFilter, setTeamFilter] = useState(initialTeamParam);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLogs(TeamsManagementService.getAuditLogs());
    const managed = TeamsManagementService.getTeams();
    setTeams(managed.map((t) => ({ team_id: t.team_id, name: t.name })));
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Team Filter
      if (teamFilter !== "All Teams" && log.teamId !== teamFilter && log.teamName !== teamFilter) {
        return false;
      }
      // Category Filter
      if (categoryFilter !== "All Categories" && log.category !== categoryFilter) {
        return false;
      }
      // Date Filter
      if (dateFilter === "Today") {
        const todayStr = "07 Sep 2026";
        if (!log.dateFormatted.includes(todayStr)) return false;
      } else if (dateFilter === "September 2026") {
        if (!log.dateFormatted.includes("Sep 2026")) return false;
      } else if (dateFilter === "August 2026") {
        if (!log.dateFormatted.includes("Aug 2026")) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesTeam = log.teamName.toLowerCase().includes(q) || log.teamId.toLowerCase().includes(q);
        const matchesAuthor = log.changedBy.toLowerCase().includes(q);
        if (!matchesDesc && !matchesAction && !matchesTeam && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [logs, teamFilter, categoryFilter, dateFilter, searchQuery]);

  const handleExportPDF = () => {
    exportChangeHistoryPDF(filteredLogs, {
      teamFilter,
      categoryFilter,
      dateFilter,
      batch: "2025 – 2029",
      section: "CSE - A",
      advisorName: "Dr. K. Senthil Kumar, M.E., Ph.D. (Class Advisor)",
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <span>SIET Portal</span>
            <span className="text-slate-300 font-normal">&gt;</span>
            <span>Advisor Console</span>
            <span className="text-slate-300 font-normal">&gt;</span>
            <span className="text-slate-600 font-medium">Change Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Change Management &amp; Audit History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official immutable audit trail of all team modifications, member allocations, guide reassignments, and lifecycle events.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/advisor/teams-and-guides"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>← Back to Teams &amp; Guides</span>
          </Link>

          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#034419] hover:bg-[#023312] text-white text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download as PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Overview Metrics Strip */}
      <div className="bg-white rounded-lg border border-slate-200/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 grid grid-cols-1 sm:grid-cols-3 shadow-none overflow-hidden">
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Audit Records
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {logs.length} Events Logged
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Since academic term commencement
          </p>
        </div>

        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Active Filter Scope
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#034419] mt-0.5 truncate">
            {filteredLogs.length} Records Shown
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {teamFilter} · {categoryFilter}
          </p>
        </div>

        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Governance &amp; Accreditation
          </span>
          <div className="text-sm sm:text-base font-bold text-teal-800 mt-0.5">
            Autonomous CoE Synchronized
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
            Cryptographically HMAC timestamped
          </p>
        </div>
      </div>

      {/* 3. Main Filter & Timeline Container */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50">
          {/* Team Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Filter by Team
            </label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              aria-label="Filter audit history by Team"
              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
            >
              <option value="All Teams">All Teams</option>
              {teams.map((t) => (
                <option key={t.team_id} value={t.team_id}>
                  {t.name} ({t.team_id})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Change Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter audit history by Category"
              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
            >
              <option value="All Categories">All Categories</option>
              <option value="Member Added">Member Added</option>
              <option value="Member Removed">Member Removed</option>
              <option value="Member Moved">Member Moved</option>
              <option value="Role Changed">Role Changed</option>
              <option value="Guide Reassigned">Guide Reassigned</option>
              <option value="Team Created">Team Created</option>
              <option value="Team Disbanded">Team Disbanded</option>
              <option value="Team Updated">Team Updated</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Date Scope
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter audit history by Date Scope"
              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
            >
              <option value="All Dates">All Dates</option>
              <option value="Today">Today (07 Sep 2026)</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Live Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search description, student, guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div className="p-4 sm:p-5 divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 text-sm">No audit history records found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {log.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.category === "Member Added"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.category === "Member Removed"
                          ? "bg-rose-100 text-rose-800"
                          : log.category === "Guide Reassigned"
                          ? "bg-teal-100 text-teal-800"
                          : log.category === "Team Created"
                          ? "bg-blue-100 text-blue-800"
                          : log.category === "Team Disbanded"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {log.category}
                    </span>
                    <strong className="text-xs text-slate-900">{log.action}</strong>
                  </div>

                  <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.dateFormatted}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {log.description}
                </p>

                {log.fromState && log.toState && (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-600">
                    <span className="text-slate-400">From:</span>
                    <span className="text-slate-800">{log.fromState}</span>
                    <span className="text-[#034419] font-bold">➔ To:</span>
                    <span className="text-emerald-900 font-bold">{log.toState}</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-0.5 flex items-center justify-between">
                  <span>Authorized by: <strong>{log.changedBy}</strong></span>
                  <span className="font-mono text-[10px] text-slate-400">{log.teamName} ({log.teamId})</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Displaying {filteredLogs.length} audit trail records</span>
          <button
            type="button"
            onClick={handleExportPDF}
            className="text-xs font-bold text-[#034419] hover:underline"
          >
            Export Filtered PDF Report →
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvisorChangeManagementPage;
