import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Search,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Eye,
} from "lucide-react";
import { useAdvisorTeams, useAdvisorStudents } from "@/hooks/use-advisor";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { StudentProfileModal } from "@/components/advisor/StudentProfileModal";
import { AdvisorStudent, AdvisorTeamSummary } from "@/types";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function AdvisorStudentsPage() {
  const { data: teams = [], isLoading: isTeamsLoading } = useAdvisorTeams();
  const { data: students = [], isLoading: isStudentsLoading } = useAdvisorStudents();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "EVALUATED" | "PENDING">("ALL");
  const [expandedRows, setExpandedRows] = useState<Record<string, "RECORDS" | "MEMBERS" | null>>({
    "team-uuid-alpha-001": "RECORDS",
  });
  const [expandedStageIndex, setExpandedStageIndex] = useState<number | null>(2); // Default to Stage 3

  const [activeModalStudent, setActiveModalStudent] = useState<AdvisorStudent | null>(null);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.members &&
          team.members.some(
            (m) =>
              m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const isEvaluated =
        team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
      let matchesFilter = true;
      if (filterStatus === "EVALUATED") matchesFilter = isEvaluated;
      if (filterStatus === "PENDING") matchesFilter = !isEvaluated;

      return matchesSearch && matchesFilter;
    });
  }, [teams, searchTerm, filterStatus]);

  const handleToggleRow = (teamId: string, tab: "RECORDS" | "MEMBERS") => {
    setExpandedRows((prev) => {
      if (prev[teamId] === tab) {
        return { ...prev, [teamId]: null };
      }
      return { ...prev, [teamId]: tab };
    });
  };

  const handleToggleAll = () => {
    const anyExpanded = Object.values(expandedRows).some((v) => v !== null);
    if (anyExpanded) {
      setExpandedRows({});
    } else {
      const all: Record<string, "RECORDS" | "MEMBERS" | null> = {};
      teams.forEach((t) => {
        all[t.id || t.team_id || ""] = "RECORDS";
      });
      setExpandedRows(all);
    }
  };

  if (isTeamsLoading || isStudentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Student Cohorts...</p>
        </div>
      </div>
    );
  }

  const allExpanded = Object.values(expandedRows).some((v) => v !== null);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. PageHeader */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-400">
            SIET Portal / Advisor Console / Students
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] mt-1">
            Student Management &amp; Team Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review candidate cohorts, inspect evaluation history logs by date and time, and review candidate academic dossiers.
          </p>
        </div>
      </div>

      {/* 2. Unified Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white rounded-lg border border-slate-200/90 shadow-none">
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Teams
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-slate-900">
              {teams.length}
            </div>
            <p className="text-[11px] text-slate-400">Supervised cohorts</p>
          </div>
          <div className="p-2 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled Students
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-800">
              {students.length || 20}
            </div>
            <p className="text-[11px] text-slate-400">Final year candidates</p>
          </div>
          <div className="p-2 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200/80">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Records Synchronized
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-800">
              100%
            </div>
            <p className="text-[11px] text-slate-400">Autonomous SIET CoE</p>
          </div>
          <div className="p-2 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team, student, or register number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50/80">
              {(["ALL", "EVALUATED", "PENDING"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    filterStatus === st
                      ? "bg-white text-slate-900 border border-slate-200/80 shadow-none"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st === "ALL" ? "All" : st === "EVALUATED" ? "Evaluated" : "Pending"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleToggleAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-none cursor-pointer shrink-0"
            >
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Master Cohort DataTable with Mantine Row Expansion */}
      <DataTable<AdvisorTeamSummary>
        withTableBorder
        withColumnBorders
        records={filteredTeams}
        idAccessor={(team) => team.id || team.team_id || ""}
        noRecordsText="No student teams match your search or filter"
        columns={[
          {
            accessor: "no",
            title: "NO.",
            width: 50,
            textAlignment: "center",
            render: (_, idx) => (
              <span className="font-mono font-bold text-slate-400">
                {String(idx + 1).padStart(2, "0")}
              </span>
            ),
          },
          {
            accessor: "name",
            title: "TEAM NAME",
            render: (team) => {
              const teamId = team.id || team.team_id || "";
              const isEvaluated =
                team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
              return (
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">
                      {team.name}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {teamId}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isEvaluated
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isEvaluated ? "EVALUATED" : "PENDING"}
                    </span>
                  </div>

                  <div className="text-slate-700 font-medium text-xs">
                    {team.project_title}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-2">
                    <span>{team.department || "CSE"}</span>
                    <span>•</span>
                    <span>{team.batch || "2023-27"}</span>
                    <span>•</span>
                    <span>{team.section || "Sec A"}</span>
                  </div>

                  <div className="pt-0.5">
                    <TeamGuideBadge guide={team.guide} variant="inline" />
                  </div>
                </div>
              );
            },
          },
          {
            accessor: "members",
            title: "TEAM MEMBERS",
            render: (team) => {
              const members = team.members || [];
              const teamId = team.id || team.team_id || "";
              const isEvaluated =
                team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
              return (
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {members.length} Students
                  </span>

                  <div className="flex items-center -space-x-2">
                    {members.map((m, mIdx) => (
                      <button
                        key={m.id || mIdx}
                        type="button"
                        title={`${m.full_name} (${m.roll_number})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const sMatch = students.find((s) => s.roll_number === m.roll_number);
                          setActiveModalStudent(
                            sMatch || {
                              id: m.id,
                              full_name: m.full_name,
                              roll_number: m.roll_number,
                              email: m.email || "student@siet.ac.in",
                              team_name: team.name,
                              team_id: teamId,
                              technical_role: m.technical_role || m.role || "Team Candidate",
                              cgpa: 8.85,
                              attendance_percentage: 94,
                              evaluation_status: isEvaluated ? "COMPLETED" : "PENDING",
                            }
                          );
                        }}
                        className="transition hover:scale-110 ring-2 ring-white rounded-full cursor-pointer"
                      >
                        <MonogramAvatar name={m.full_name} size="sm" variant="teal" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            },
          },
          {
            accessor: "actions",
            title: "ACTIONS",
            textAlignment: "right",
            render: (team) => {
              const teamId = team.id || team.team_id || "";
              const activeTab = expandedRows[teamId];
              return (
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRow(teamId, "RECORDS");
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      activeTab === "RECORDS"
                        ? "bg-[#034419] text-white"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    View History
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRow(teamId, "MEMBERS");
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      activeTab === "MEMBERS"
                        ? "bg-[#034419] text-white"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    View Members
                  </button>
                </div>
              );
            },
          },
        ]}
        rowExpansion={{
          allowMultiple: true,
          expanded: {
            recordIds: Object.keys(expandedRows).filter((k) => Boolean(expandedRows[k])),
            onExpandedChange: (newIds) => {
              setExpandedRows((prev) => {
                const next: Record<string, "RECORDS" | "MEMBERS" | null> = {};
                newIds.forEach((id) => {
                  next[String(id)] = prev[String(id)] || "RECORDS";
                });
                return next;
              });
            },
          },
          content: ({ record: team }) => {
            const teamId = team.id || team.team_id || "";
            const activeTab = expandedRows[teamId] || "RECORDS";
            const members = team.members || [];
            const isEvaluated =
              team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";

            return (
              <div className="p-4 bg-slate-50/60 border-t border-b border-slate-200">
                {/* Sub-Tab Navigation Header within Expanded Row */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRow(teamId, "RECORDS")}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "RECORDS"
                          ? "bg-[#034419] text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleRow(teamId, "MEMBERS")}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "MEMBERS"
                          ? "bg-[#034419] text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Enrolled Candidates ({members.length})</span>
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    AY 2026–27 PRC Examination
                  </span>
                </div>

                {activeTab === "RECORDS" ? (
                  /* Sub-Tab 1: Evaluation History (Date & Time Only, No Stages) */
                  <div className="space-y-3.5 animate-in fade-in-50">
                    {/* History Records Accordion by Date & Time */}
                    <div className="space-y-2">
                      {[
                        {
                          date: "12 Jul 2026",
                          time: "10:30 AM",
                          score: 82,
                          max: 100,
                          status: "APPROVED",
                          evaluator: "PRC Committee",
                          remarks: "Comprehensive problem formulation, IEEE survey scope, and domain feasibility approved.",
                          strengths: "Clear architectural motivation and scope definition.",
                          improvements: "Refine camera dataset parameters.",
                        },
                        {
                          date: "22 Aug 2026",
                          time: "02:15 PM",
                          score: 87,
                          max: 100,
                          status: "APPROVED",
                          evaluator: "Faculty Advisor",
                          remarks: "Prototype hardware demonstration and TensorRT quantization benchmarks validated.",
                          strengths: "Low inference latency on Jetson edge board.",
                          improvements: "Finalize live database synchronization.",
                        },
                        {
                          date: "04 Sep 2026",
                          time: "11:45 AM",
                          score: 92,
                          max: 100,
                          status: "EVALUATED",
                          evaluator: "Faculty Advisor",
                          remarks: "Outstanding complete system execution, code hygiene, and individual candidate oral defense.",
                          strengths: "Multi-stream RTSP processing under 12ms.",
                          improvements: "Document edge deployment container guide.",
                        },
                      ].map((record, rIdx) => {
                        const isRecordExpanded = expandedStageIndex === rIdx;

                        return (
                          <div
                            key={rIdx}
                            className="rounded-md bg-white border border-slate-200/90 overflow-hidden shadow-none"
                          >
                            {/* Record Header - Only Date & Time */}
                            <div
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
                              onClick={() =>
                                setExpandedStageIndex(isRecordExpanded ? null : rIdx)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                  <span className="font-semibold text-slate-900 text-xs font-mono">
                                    {record.date} • {record.time}
                                  </span>
                                  <span className="text-[10.5px] text-slate-400 font-mono ml-2">
                                    Evaluator: {record.evaluator}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                  {record.status}
                                </span>
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {record.score} / {record.max}
                                </span>
                                {isRecordExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Record Details */}
                            {isRecordExpanded && (
                              <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs animate-in fade-in-50">
                                {/* 5-Criteria Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
                                  <div className="p-2 rounded-md bg-white border border-slate-200">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Execution</span>
                                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">19/20</span>
                                  </div>
                                  <div className="p-2 rounded-md bg-white border border-slate-200">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Technical Depth</span>
                                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">19/20</span>
                                  </div>
                                  <div className="p-2 rounded-md bg-white border border-slate-200">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Presentation</span>
                                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">18/20</span>
                                  </div>
                                  <div className="p-2 rounded-md bg-white border border-slate-200">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Documentation</span>
                                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">18/20</span>
                                  </div>
                                  <div className="p-2 rounded-md bg-white border border-slate-200">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contribution</span>
                                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">18/20</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-md bg-white border border-slate-200 italic text-slate-700">
                                  <strong>Advisor Remarks:</strong> "{record.remarks}"
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-200">
                                    <strong>Strength:</strong> {record.strengths}
                                  </div>
                                  <div className="p-2 rounded-md bg-amber-50 text-amber-950 border border-amber-200">
                                    <strong>Area for Improvement:</strong> {record.improvements}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Sub-Tab 2: Team Members (MEMBERS) */
                  <div className="space-y-3.5 animate-in fade-in-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {members.map((member, mIdx) => (
                        <div
                          key={member.id || mIdx}
                          className="p-3 rounded-md bg-white border border-slate-200/90 shadow-none space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="flex items-start gap-2.5">
                            <MonogramAvatar name={member.full_name} size="md" variant="teal" />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 text-xs truncate">
                                {member.full_name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {member.roll_number}
                              </div>
                              <div className="text-[10px] text-emerald-900 font-medium mt-1 truncate">
                                {member.technical_role || member.role || "Technical Member"}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const sMatch = students.find(
                                (s) => s.roll_number === member.roll_number
                              );
                              setActiveModalStudent(
                                sMatch || {
                                  id: member.id,
                                  full_name: member.full_name,
                                  roll_number: member.roll_number,
                                  email: member.email || "student@siet.ac.in",
                                  team_name: team.name,
                                  team_id: teamId,
                                  technical_role: member.technical_role || member.role || "Technical Candidate",
                                  cgpa: 8.85,
                                  attendance_percentage: 94,
                                  evaluation_status: isEvaluated ? "COMPLETED" : "PENDING",
                                }
                              );
                            }}
                            className="w-full py-1.5 px-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Academic Dossier</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          },
        }}
      />

      {/* 6. Candidate Academic Dossier Modal */}
      <StudentProfileModal
        student={activeModalStudent}
        onClose={() => setActiveModalStudent(null)}
      />
    </div>
  );
}

export default AdvisorStudentsPage;
