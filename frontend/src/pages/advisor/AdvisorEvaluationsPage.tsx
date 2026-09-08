import React from "react";
import { Link } from "react-router-dom";
import { Award, Users, Clock, ArrowRight, FileCheck2, ChevronRight, UserCheck, BookOpen, GraduationCap } from "lucide-react";
import { useAdvisorTeams } from "@/hooks/use-advisor";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

export function AdvisorEvaluationsPage() {
  const { data: teams = [], isLoading } = useAdvisorTeams();

  const evaluatedCount = teams.filter(
    (t) => t.evaluation_status === "COMPLETED" || t.evaluation_status === "EVALUATED"
  ).length;
  const pendingCount = teams.length - evaluatedCount;

  const columns: DataTableColumn<any>[] = [
    {
      accessor: "name",
      title: "Team / Project",
      render: (team) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{team.name}</div>
          <div className="text-slate-500 text-[11px] truncate max-w-[280px]">
            {team.project_title}
          </div>
        </div>
      ),
    },
    {
      accessor: "guide",
      title: "Faculty Guide",
      render: (team) => <TeamGuideBadge guide={team.guide} variant="table-cell" />,
    },
    {
      accessor: "members",
      title: "Members",
      textAlign: "center",
      render: (team) => (
        <span className="font-mono text-slate-700">
          {(team.members || []).length} Candidates
        </span>
      ),
    },
    {
      accessor: "evaluation_status",
      title: "Evaluation Status",
      textAlign: "center",
      render: (team) => {
        const isEvaluated =
          team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isEvaluated
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {isEvaluated ? "EVALUATED" : "PENDING"}
          </span>
        );
      },
    },
    {
      accessor: "marks_awarded",
      title: "Current Score",
      textAlign: "center",
      render: (team) => (
        <span className="font-mono font-bold text-slate-900">
          {team.marks_awarded !== undefined ? `${team.marks_awarded} / 100` : "-"}
        </span>
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      textAlign: "right",
      render: (team) => {
        const teamId = team.id || team.team_id || "team-001";
        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/advisor/teams/${teamId}/evaluation`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold transition"
            >
              <span>Enter Scores</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#034419] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Evaluations Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* PageHeader */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div>
          <div className="text-[11px] font-medium text-slate-400 font-mono">
            SIET Portal / Advisor Console / Evaluations Overview
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#034419] tracking-tight mt-1 font-['IBM_Plex_Sans',sans-serif]">
            Academic Evaluations Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Portfolio overview of assigned candidate teams, viva scores, and examination completion progress. Click any row to expand details.
          </p>
        </div>
      </div>

      {/* 3 Metrics (Unified High-Density Strip) */}
      <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Assigned Teams
            </span>
            <div className="mt-1.5 text-2xl font-bold font-mono text-slate-900">
              {teams.length}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">Enrolled cohorts</p>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Evaluated Teams
            </span>
            <div className="mt-1.5 text-2xl font-bold font-mono text-[#034419]">
              {evaluatedCount}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">Completed &amp; synchronized</p>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pending Viva Grading
            </span>
            <div className="mt-1.5 text-2xl font-bold font-mono text-amber-700">
              {pendingCount}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">Awaiting score submission</p>
          </div>
        </div>
      </div>

      {/* Portfolio Table with Smooth 450ms Row Expansion Animation */}
      <DataTable
        withTableBorder
        withColumnBorders
        columns={columns}
        records={teams}
        idAccessor={(team) => team.id || team.team_id || "team-001"}
        noRecordsText="No assigned evaluation teams found."
        rowExpansion={{
          allowMultiple: true,
          content: ({ record: team }) => {
            const members = team.members || [];
            const isEvaluated =
              team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";

            return (
              <div className="p-4 space-y-3.5 bg-slate-50/60 rounded-md border border-slate-200 text-xs">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#034419]" />
                    <span className="font-bold text-slate-900">
                      Project Dossier: {team.project_title || "Untitled Project"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        isEvaluated
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isEvaluated ? "Evaluated" : "Pending Evaluation"}
                    </span>
                    {team.marks_awarded !== undefined && (
                      <span className="font-mono font-bold text-[#034419] bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Score: {team.marks_awarded}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Candidates Roster */}
                  <div className="bg-white p-3 rounded-md border border-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                      <GraduationCap className="w-3.5 h-3.5 text-[#034419]" />
                      <span>Enrolled Candidates ({members.length})</span>
                    </div>
                    {members.length === 0 ? (
                      <div className="text-slate-400 italic py-2">No students registered.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {members.map((m: any, idx: number) => (
                          <div
                            key={m.id || m.reg_no || m.roll_number || idx}
                            className="py-1.5 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-semibold text-slate-700">
                              {m.name || m.full_name}
                            </span>
                            <span className="font-mono text-slate-400">
                              {m.roll_no || m.reg_no || m.roll_number || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Guide & Academic Details */}
                  <div className="bg-white p-3 rounded-md border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#034419]" />
                      <span>Assigned Faculty Guide</span>
                    </div>
                    {team.guide ? (
                      <div className="text-[11px] space-y-1">
                        <div className="font-semibold text-slate-900">
                          {typeof team.guide === "string"
                            ? team.guide
                            : (team.guide as any)?.name || "Faculty Guide"}
                        </div>
                        {typeof team.guide === "object" && (team.guide as any)?.designation && (
                          <div className="text-slate-500">{(team.guide as any).designation}</div>
                        )}
                        {typeof team.guide === "object" && (team.guide as any)?.email && (
                          <div className="font-mono text-slate-400">{(team.guide as any).email}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">
                        No guide currently allocated.
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Milestone Stage</span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {team.current_phase || "Final Review / Viva"}
                      </span>
                    </div>
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

export default AdvisorEvaluationsPage;
