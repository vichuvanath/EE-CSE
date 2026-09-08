import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  FileCheck2,
  Users,
  Award,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAdvisorTeams } from "@/hooks/use-advisor";
import { DownloadEvaluationMarks } from "@/components/advisor/DownloadEvaluationMarks";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { AdvisorTeamSummary } from "@/types";

export function AdvisorTeamsPage() {
  const { data: teams = [], isLoading } = useAdvisorTeams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const evaluatedCount = teams.filter(
    (t) => t.evaluation_status === "COMPLETED" || t.evaluation_status === "EVALUATED"
  ).length;
  const pendingCount = teams.length - evaluatedCount;

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.leader_name && team.leader_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (team.leader_roll && team.leader_roll.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (team.members &&
          team.members.some(
            (m) =>
              m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      let matchesStatus = true;
      if (statusFilter === "SUBMITTED") {
        matchesStatus = team.submission_status === "SUBMITTED";
      } else if (statusFilter === "PENDING_SUBMISSION") {
        matchesStatus = team.submission_status !== "SUBMITTED" && team.submission_status !== "APPROVED";
      } else if (statusFilter === "EVALUATED") {
        matchesStatus = team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
      } else if (statusFilter === "PENDING_EVALUATION") {
        matchesStatus = team.evaluation_status !== "COMPLETED" && team.evaluation_status !== "EVALUATED";
      }

      return matchesSearch && matchesStatus;
    });
  }, [teams, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Candidate Teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. PageHeader */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-400">
            SIET Portal / Advisor Console / Evaluation
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] mt-1">
            Evaluation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review candidate cohorts, verify document deliverables, and record official viva voce marks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DownloadEvaluationMarks teams={teams} />
        </div>
      </div>

      {/* 2. Unified Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white rounded-lg border border-slate-200/90 shadow-none">
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Assigned Teams
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-slate-900">
              {teams.length}
            </div>
            <p className="text-[11px] text-slate-400">Enrolled project cohorts</p>
          </div>
          <div className="p-2 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Evaluated Teams
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-800">
              {evaluatedCount}
            </div>
            <p className="text-[11px] text-slate-400">Scores recorded &amp; synced</p>
          </div>
          <div className="p-2 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200/80">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Viva Grading
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-amber-700">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-400">Awaiting committee review</p>
          </div>
          <div className="p-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by team, student name, roll no, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PENDING_SUBMISSION">Pending Submission</option>
              <option value="EVALUATED">Evaluation Completed</option>
              <option value="PENDING_EVALUATION">Evaluation Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Master Teams DataTable with Mantine Row Expansion */}
      <DataTable<AdvisorTeamSummary>
        withTableBorder
        withColumnBorders
        records={filteredTeams}
        idAccessor={(team) => team.id || team.team_id || ""}
        noRecordsText="No teams match your search or filter parameters."
        columns={[
          {
            accessor: "name",
            title: "TEAM NAME",
            render: (team) => {
              const members = team.members || [];
              return (
                <div>
                  <div className="font-bold text-slate-900 text-sm">{team.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {members.length} Students
                  </div>
                </div>
              );
            },
          },
          {
            accessor: "team_id",
            title: "TEAM ID",
            render: (team) => (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
                {team.id || team.team_id || "team-001"}
              </span>
            ),
          },
          {
            accessor: "guide",
            title: "ASSIGNED GUIDE",
            render: (team) => (
              <TeamGuideBadge guide={team.guide} variant="table-cell" />
            ),
          },
          {
            accessor: "department",
            title: "DEPARTMENT / CLASS",
            render: (team) => (
              <div>
                <div className="text-slate-800 font-medium">
                  {team.department || "Computer Science & Engineering"}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {team.batch || "2023-27"} • {team.section || "Sec A"}
                </div>
              </div>
            ),
          },
          {
            accessor: "members",
            title: "TEAM MEMBERS",
            render: (team) => {
              const members = team.members || [];
              return (
                <ul className="space-y-0.5 text-[11px] text-slate-700 min-w-[180px]">
                  {members.map((m, idx) => (
                    <li key={m.id || idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900">{m.full_name}</span>
                      <span className="text-slate-400 font-mono">({m.roll_number})</span>
                    </li>
                  ))}
                </ul>
              );
            },
          },
          {
            accessor: "project_title",
            title: "PROJECT TITLE",
            render: (team) => (
              <div
                className="font-medium text-slate-800 line-clamp-2 max-w-[240px] whitespace-normal"
                title={team.project_title}
              >
                {team.project_title}
              </div>
            ),
          },
          {
            accessor: "submission_status",
            title: "SUBMISSION",
            textAlignment: "center",
            render: (team) => (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  team.submission_status === "SUBMITTED" || team.submission_status === "APPROVED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {team.submission_status || "SUBMITTED"}
              </span>
            ),
          },
          {
            accessor: "current_phase",
            title: "CURRENT PHASE",
            textAlignment: "center",
            render: (team) => (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                {team.current_phase || "Phase II / Final Review"}
              </span>
            ),
          },
          {
            accessor: "submission_date",
            title: "LAST SUBMITTED",
            textAlignment: "center",
            render: (team) => (
              <span className="font-mono text-slate-500 text-[11px]">
                {team.submission_date ? team.submission_date.split(",")[0] : "Sep 2, 2026"}
              </span>
            ),
          },
          {
            accessor: "evaluation_status",
            title: "EVALUATION STATUS",
            textAlignment: "center",
            render: (team) => {
              const isEvaluated =
                team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
              return (
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isEvaluated
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isEvaluated ? "EVALUATED" : "PENDING"}
                  </span>
                  {team.marks_awarded !== undefined && (
                    <div className="mt-1 font-mono font-bold text-[#0F5132] text-[11px]">
                      Score: {team.marks_awarded} / 100
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            accessor: "action",
            title: "ACTION",
            textAlignment: "right",
            render: (team) => {
              const teamIdentifier = team.id || team.team_id || "team-001";
              return (
                <Link
                  to={`/advisor/teams/${teamIdentifier}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold transition"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>View Team Submission</span>
                </Link>
              );
            },
          },
        ]}
        rowExpansion={{
          allowMultiple: true,
          content: ({ record: team }) => {
            const members = team.members || [];
            const isEvaluated =
              team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
            return (
              <div className="p-4 bg-slate-50/60 space-y-3.5 border-t border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#034419] uppercase tracking-wider block">
                      TEAM COMPOSITION &amp; GUIDANCE OVERVIEW
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      {team.name} — {team.project_title}
                    </h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isEvaluated
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isEvaluated ? "EVALUATION COMPLETED" : "EVALUATION PENDING"}
                    </span>
                    {team.marks_awarded !== undefined && (
                      <div className="font-mono text-xs font-bold text-[#034419] mt-0.5">
                        Score: {team.marks_awarded} / 100
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Details */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Enrolled Student Cohort ({members.length} Candidates):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {members.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="p-2.5 bg-white rounded-md border border-slate-200/90 shadow-none space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {m.full_name}
                          </span>
                          <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-emerald-50 text-[#034419] border border-emerald-200">
                            PRC Verified
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {m.roll_number}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Department: {team.department || "CSE"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guide and Status Footer */}
                <div className="p-2.5 bg-white rounded-md border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Project Guide:
                    </span>
                    <TeamGuideBadge guide={team.guide} variant="inline" />
                  </div>
                  <div className="text-xs text-slate-500">
                    Phase: <span className="font-semibold text-slate-800">{team.current_phase || "Phase II"}</span> · Last Update: <span className="font-mono text-slate-700">{team.submission_date || "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          },
        }}
      />
    </div>
  );
}

export default AdvisorTeamsPage;
