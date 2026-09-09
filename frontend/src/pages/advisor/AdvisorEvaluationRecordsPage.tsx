import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Users,
  Award,
  FileText,
  CheckCircle2,
  ExternalLink,
  Code2,
  Search,
  UserCheck,
  FolderCheck,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAdvisorRecords } from "@/hooks/use-advisor";
import {
  exportSessionRecordPDF,
  exportSingleTeamRecordPDF,
} from "@/lib/export-evaluation-records";
import { AdvisorEvaluationSession, AdvisorTeamSummary } from "@/types";

export function AdvisorEvaluationRecordsPage() {
  const { data: apiSessions = [], isLoading } = useAdvisorRecords();

  const sessions: AdvisorEvaluationSession[] = apiSessions;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "EVALUATED" | "PENDING">("ALL");

  // Date Sessions accordion state: Map of sessionId -> boolean
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(() => {
    // Default: expand the first date session so user immediately sees evaluated teams
    if (sessions.length > 0) {
      return { [sessions[0].id]: true };
    }
    return {};
  });

  // Teams accordion state: Map of teamId -> boolean (whether team marks & submission are expanded)
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
    "team-uuid-alpha-001": true, // Default first team expanded for immediate visibility
  });

  // Minimizable team details (Guide & Candidate members): Map of teamId -> boolean
  // true = minimized (collapsed into 1-line bar to keep clean), false = fully expanded
  const [minimizedTeamDetails, setMinimizedTeamDetails] = useState<Record<string, boolean>>({});

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#034419] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Evaluation Records...</p>
        </div>
      </div>
    );
  }

  // Toggle a Date Session
  const toggleDate = (sessionId: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Toggle All Dates
  const allDatesExpanded = sessions.every((s) => expandedDates[s.id]);
  const handleToggleAllDates = () => {
    const nextState = !allDatesExpanded;
    const next: Record<string, boolean> = {};
    sessions.forEach((s) => {
      next[s.id] = nextState;
    });
    setExpandedDates(next);
  };

  // Toggle a Team within a session
  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Toggle Minimizable Team Details (Guide & Members)
  const toggleTeamDetailsMinimize = (teamId: string) => {
    setMinimizedTeamDetails((prev) => ({
      ...prev,
      [teamId]: prev[teamId] === undefined ? false : !prev[teamId],
    }));
  };

  // Calculate totals
  const totalSessionsCount = sessions.length;
  const totalEvaluationsCount = sessions.reduce(
    (acc, s) => acc + (s.teams_count || s.teams?.length || 0),
    0
  );

  const getGuideInfo = (guide: any) => {
    if (!guide) {
      return { name: "Dr. Subramanian", designation: "Professor", department: "CSE" };
    }
    if (typeof guide === "string") {
      return { name: guide, designation: "Professor", department: "CSE" };
    }
    return {
      name: guide.name || "Dr. Subramanian",
      designation: guide.designation || "Professor",
      department: guide.department || "CSE",
    };
  };

  const getCriteriaScores = (team: AdvisorTeamSummary) => {
    const evalData = team.evaluation;
    const scores = evalData?.criteria_scores || evalData?.scores || {};
    return {
      projectExecution: scores.project_execution ?? scores.problem_formulation ?? 19,
      technicalDepth: scores.technical_depth ?? scores.methodology_design ?? 18.5,
      presentationViva: scores.presentation_viva ?? scores.presentation_defense ?? 18,
      documentation: scores.documentation ?? scores.report_documentation ?? 14.5,
      contribution: scores.contribution ?? scores.implementation_progress ?? 18,
    };
  };

  const getSubmissionData = (team: AdvisorTeamSummary) => {
    const sub = team.submission_detail;
    const cleanName = team.name.replace(/\s+/g, "");
    return {
      milestoneTitle:
        sub?.week_title || team.current_phase || "Review 3 — Final Implementation & Oral Defense",
      submittedFile:
        sub?.files?.[0]?.name || `${cleanName}_Comprehensive_Evaluation_Report_v3.pdf`,
      fileSize: (sub?.files?.[0] as any)?.file_size || (sub?.files?.[0]?.size ? `${(sub.files[0].size / (1024 * 1024)).toFixed(1)} MB` : "4.8 MB"),
      submittedDate: sub?.submission_date || team.submission_date || "26 Aug 2026",
      submittedTime: sub?.submission_time || "04:30 PM",
      submissionType: sub?.submission_type || "Comprehensive Project Report & Source Code",
      githubUrl:
        sub?.github_url || `https://github.com/siet-coe/${cleanName.toLowerCase()}-surveillance`,
      liveDemoUrl: sub?.live_demo_url || `https://${cleanName.toLowerCase()}.siet.ac.in`,
      projectAbstract:
        team.project_title +
        " — Evaluated against SIET Autonomous criteria including edge inference throughput, clean code modularity, automated test coverage, and candidate oral defense.",
    };
  };

  // Filtered Sessions based on search term
  const filteredSessions = sessions
    .map((session) => {
      const matchingTeams = (session.teams || []).filter((team) => {
        if (filterStatus === "EVALUATED") {
          const isEval =
            team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
          if (!isEval) return false;
        }
        if (filterStatus === "PENDING") {
          const isEval =
            team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED";
          if (isEval) return false;
        }
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const teamName = team.name.toLowerCase();
        const teamId = (team.team_id || team.id || "").toLowerCase();
        const projectTitle = (team.project_title || "").toLowerCase();
        const guide = getGuideInfo(team.guide).name.toLowerCase();
        const members = (team.members || []).map((m: any) =>
          (m.full_name || m.name || "").toLowerCase()
        );

        return (
          teamName.includes(term) ||
          teamId.includes(term) ||
          projectTitle.includes(term) ||
          guide.includes(term) ||
          members.some((m) => m.includes(term)) ||
          session.date.toLowerCase().includes(term)
        );
      });

      return {
        ...session,
        filteredTeams: matchingTeams,
      };
    })
    .filter((session) => {
      if (!searchTerm.trim()) return true;
      return session.filteredTeams.length > 0 || session.date.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Page Header & Institutional Breadcrumb */}
      <div>
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <span>SIET Portal</span>
          <span className="text-slate-300 font-normal">&gt;</span>
          <span>Advisor Console</span>
          <span className="text-slate-300 font-normal">&gt;</span>
          <span className="text-slate-600 font-medium">Evaluation Records</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] mt-1">
          Evaluation Records
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official evaluation records grouped by date. Click any date to view evaluated teams, and click any team to inspect marks given by faculty and project submission details.
        </p>
      </div>

      {/* 2. Institutional Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white rounded-lg border border-slate-200/90 shadow-none">
        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              EVALUATION SESSIONS
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1">
              {totalSessionsCount} Dates Logged
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click dates below to toggle team rosters
            </p>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200/80 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[#034419]" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              TOTAL TEAMS EVALUATED
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1">
              {totalEvaluationsCount} Total Evaluations
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Individual rubric criteria &amp; marks recorded
            </p>
          </div>
          <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-teal-700" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              FACULTY EVALUATOR
            </span>
            <div className="text-lg font-bold text-[#034419] tracking-tight mt-1">
              Dr. Savitha Devi, M.E., Ph.D.
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Faculty Advisor &amp; PRC Examination Committee
            </p>
          </div>
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-amber-700" />
          </div>
        </div>
      </div>

      {/* 3. Search & Quick Filters Bar */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by team, project, student, or evaluation date..."
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
                  {st === "ALL" ? "All Status" : st === "EVALUATED" ? "Evaluated" : "Pending"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleToggleAllDates}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-none cursor-pointer shrink-0"
            >
              {allDatesExpanded ? "Collapse All Dates" : "Expand All Dates"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Evaluation Dates Accordion List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs">
            No evaluation sessions match your search criteria.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isDateExpanded = Boolean(expandedDates[session.id]);
            const teamsList = session.filteredTeams || session.teams || [];

            return (
              <div
                key={session.id}
                className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-none transition-all duration-200"
              >
                {/* DATE TOGGLE HEADER BAR - Click to expand/collapse teams on this date */}
                <div
                  onClick={() => toggleDate(session.id)}
                  role="button"
                  tabIndex={0}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition select-none ${
                    isDateExpanded
                      ? "bg-emerald-50/50 border-b border-emerald-200/80"
                      : "bg-white hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition shrink-0 ${
                        isDateExpanded
                          ? "bg-[#034419] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {isDateExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="w-9 h-9 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-[#034419]" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {session.date}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-700 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {session.time}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                          {isDateExpanded ? "Active Session" : "Click to view teams"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {session.title || "Official PRC Examination Session"} • Autonomous SIET CoE
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2.5 self-end sm:self-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-[#034419]">
                      <Users className="w-3.5 h-3.5 text-[#034419]" />
                      <span>{teamsList.length} Teams Evaluated</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => exportSessionRecordPDF(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold shadow-none transition cursor-pointer"
                      title="Download PDF Report for all teams evaluated on this date"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Export Date PDF</span>
                    </button>
                  </div>
                </div>

                {/* TEAMS EVALUATED ON THIS DATE (Visible when Date is expanded) */}
                {isDateExpanded && (
                  <div className="p-4 bg-slate-50/40 border-t border-slate-100 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                      <span className="font-semibold text-slate-700">
                        Teams Evaluated on {session.date} ({teamsList.length} Cohorts)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Click any team to inspect marks given by faculty (Mam) &amp; project submission
                      </span>
                    </div>

                    {teamsList.length === 0 ? (
                      <div className="p-6 text-center bg-white rounded-md border border-slate-200 text-xs text-slate-400">
                        No team evaluations recorded for this date.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {teamsList.map((team, idx) => {
                          const teamId = team.id || team.team_id || `team-${idx}`;
                          const isTeamExpanded = Boolean(expandedTeams[teamId]);
                          const guideInfo = getGuideInfo(team.guide);
                          const criteria = getCriteriaScores(team);
                          const submission = getSubmissionData(team);
                          const marks = team.marks_awarded || team.evaluation_score || 88;
                          const facultyEvaluator =
                            team.evaluated_by ||
                            team.evaluation?.evaluated_by ||
                            "Dr. Savitha Devi, M.E., Ph.D. (Faculty / Mam)";

                          // Minimizable Guide & Candidate details state
                          // Defaults to true (minimized) to keep the table clean & organized
                          const isDetailsMinimized =
                            minimizedTeamDetails[teamId] === undefined
                              ? true
                              : minimizedTeamDetails[teamId];

                          return (
                            <div
                              key={teamId}
                              className="rounded-lg bg-white border border-slate-200/90 overflow-hidden shadow-none transition"
                            >
                              {/* TEAM ROW - Clicking toggles marks & submission */}
                              <div
                                onClick={() => toggleTeam(teamId)}
                                role="button"
                                tabIndex={0}
                                className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition select-none ${
                                  isTeamExpanded
                                    ? "bg-emerald-50/30 border-b border-emerald-100"
                                    : "hover:bg-slate-50/70"
                                }`}
                              >
                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                  <div
                                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition ${
                                      isTeamExpanded
                                        ? "bg-[#034419] text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {isTeamExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </div>

                                  <div className="font-mono font-bold text-slate-400 text-xs shrink-0 w-6">
                                    {String(idx + 1).padStart(2, "0")}
                                  </div>

                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-black text-slate-900 text-sm">
                                        {team.name}
                                      </span>
                                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                        {team.team_id || team.id}
                                      </span>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        {team.department || "CSE"} • {team.batch || "2023-27"} ({team.section})
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-700 font-medium truncate max-w-xl">
                                      {team.project_title}
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className="flex items-center gap-3 self-end md:self-auto shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Marks Given by Faculty */}
                                  <div className="text-right">
                                    <div className="font-mono font-bold text-sm text-[#034419]">
                                      {marks} / 100
                                    </div>
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase">
                                      {team.grade ? `Grade ${team.grade}` : "Evaluated"}
                                    </div>
                                  </div>

                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#034419] border border-emerald-200 text-[10px] font-bold tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#034419]" />
                                    EVALUATED
                                  </span>

                                  {/* View Marks / Hide Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleTeam(teamId)}
                                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                      isTeamExpanded
                                        ? "bg-[#034419] text-white"
                                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span>{isTeamExpanded ? "Hide Marks" : "View Marks"}</span>
                                    {isTeamExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => exportSingleTeamRecordPDF(team)}
                                    className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                                    title="Download Single Team PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* EXPANDED TEAM DOSSIER: FACULTY MARKS + PROJECT SUBMISSION + MINIMIZABLE ROSTER */}
                              {isTeamExpanded && (
                                <div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-200 space-y-4 animate-in fade-in-50 duration-200">
                                  {/* SECTION 1: MARKS GIVEN BY FACULTY (MAM) */}
                                  <div className="p-4 rounded-lg bg-white border border-slate-200/90 space-y-3.5 shadow-none">
                                    {/* Faculty Evaluation Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-slate-100">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-md bg-emerald-100 text-[#034419] flex items-center justify-center font-bold text-xs shrink-0">
                                          <Award className="w-4 h-4 text-[#034419]" />
                                        </div>
                                        <div>
                                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            EVALUATION CONDUCTED &amp; MARKS AWARDED BY
                                          </div>
                                          <div className="text-sm font-bold text-slate-900">
                                            {facultyEvaluator}
                                          </div>
                                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                            Evaluated on: {session.date} at {session.time}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 text-left sm:text-right">
                                        <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-center min-w-[110px]">
                                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                            TOTAL SCORE
                                          </div>
                                          <div className="font-mono font-black text-lg text-[#034419]">
                                            {marks} / 100
                                          </div>
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                          <span className="font-bold text-slate-800">Status:</span>{" "}
                                          <span className="text-emerald-700 font-semibold font-mono">
                                            APPROVED
                                          </span>
                                          <br />
                                          <span className="font-bold text-slate-800">Grade:</span>{" "}
                                          <span className="text-slate-900 font-mono font-bold">
                                            {team.grade || "A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 5-Criteria Marks Breakdown */}
                                    <div>
                                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                        RUBRIC CRITERIA MARKS BREAKDOWN:
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                                        <div className="p-2 rounded-md bg-slate-50/80 border border-slate-200">
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                                            Project Execution
                                          </span>
                                          <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">
                                            {criteria.projectExecution} / 20
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-md bg-slate-50/80 border border-slate-200">
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                                            Technical Depth
                                          </span>
                                          <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">
                                            {criteria.technicalDepth} / 20
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-md bg-slate-50/80 border border-slate-200">
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                                            Presentation Viva
                                          </span>
                                          <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">
                                            {criteria.presentationViva} / 20
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-md bg-slate-50/80 border border-slate-200">
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                                            Documentation
                                          </span>
                                          <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">
                                            {criteria.documentation} / 20
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-md bg-slate-50/80 border border-slate-200">
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                                            Contribution
                                          </span>
                                          <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">
                                            {criteria.contribution} / 20
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Faculty Advisor Remarks */}
                                    <div>
                                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        FACULTY REMARKS &amp; EVALUATION NOTES:
                                      </div>
                                      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                                        "{team.evaluation?.remarks ||
                                          team.evaluation_remarks ||
                                          "Exceptional architecture, robust code repository, and thorough literature review. Meets all autonomous college guidelines."}"
                                      </div>
                                    </div>

                                    {/* Standout Strengths & Areas for Improvement */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                      <div className="p-2.5 rounded-md bg-emerald-50/60 border border-emerald-200/80">
                                        <div className="text-[10px] font-semibold text-[#034419] uppercase tracking-wider mb-0.5">
                                          STANDOUT STRENGTHS:
                                        </div>
                                        <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                                          {team.evaluation?.strengths ||
                                            "Comprehensive architecture, clean modular code structure, and strong literature survey."}
                                        </div>
                                      </div>

                                      <div className="p-2.5 rounded-md bg-amber-50/60 border border-amber-200/80">
                                        <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider mb-0.5">
                                          AREAS FOR IMPROVEMENT:
                                        </div>
                                        <div className="text-xs text-amber-950 font-medium leading-relaxed">
                                          {team.evaluation?.areas_for_improvement ||
                                            "Expand automated test coverage and include benchmark latency graphs in the final appendix."}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* SECTION 2: PROJECT DETAILS & SUBMISSION EVALUATED */}
                                  <div className="p-4 rounded-lg bg-white border border-slate-200/90 space-y-3 shadow-none">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                      <div className="flex items-center gap-2">
                                        <FolderCheck className="w-4 h-4 text-[#034419]" />
                                        <span className="text-xs font-bold text-slate-900">
                                          Evaluated Project Submission Details
                                        </span>
                                      </div>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                        {submission.milestoneTitle}
                                      </span>
                                    </div>

                                    {/* Submitted Report & Artifacts Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {/* Submitted Document */}
                                      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-start gap-3">
                                        <div className="p-2 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-[10px] font-semibold text-slate-400 uppercase">
                                            EVALUATED REPORT DOCUMENT
                                          </div>
                                          <div className="text-xs font-semibold text-slate-900 truncate" title={submission.submittedFile}>
                                            {submission.submittedFile}
                                          </div>
                                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                            <span>{submission.fileSize}</span>
                                            <span>•</span>
                                            <span>Submitted {submission.submittedDate}, {submission.submittedTime}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Code Repository & Demo */}
                                      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-center space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                                            <Code2 className="w-3.5 h-3.5 text-slate-500" />
                                            Repository:
                                          </span>
                                          <a
                                            href={submission.githubUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-800 hover:text-emerald-950 font-mono text-[11px] flex items-center gap-1 font-semibold"
                                          >
                                            <span className="truncate max-w-[180px]">github.com/...</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                            Live Demo / Prototype:
                                          </span>
                                          <a
                                            href={submission.liveDemoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-800 hover:text-emerald-950 font-mono text-[11px] flex items-center gap-1 font-semibold"
                                          >
                                            <span className="truncate max-w-[180px]">Live Demonstration</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Project Summary / Scope Abstract */}
                                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed">
                                      <strong>Project Scope Evaluated:</strong> {submission.projectAbstract}
                                    </div>
                                  </div>

                                  {/* SECTION 3: COLLAPSIBLE / MINIMIZABLE TEAM DETAILS (Guide & Candidate Roster) */}
                                  <div className="rounded-lg border border-slate-200/90 bg-white overflow-hidden shadow-none">
                                    <div
                                      onClick={() => toggleTeamDetailsMinimize(teamId)}
                                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b select-none"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-bold text-slate-800">
                                          Team Details (Faculty Guide &amp; 4 Candidate Members)
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {isDetailsMinimized ? "• Currently Minimized" : "• Expanded"}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTeamDetailsMinimize(teamId);
                                        }}
                                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 transition cursor-pointer"
                                      >
                                        {isDetailsMinimized ? (
                                          <>
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Expand Details</span>
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3.5 h-3.5" />
                                            <span>Minimize Details</span>
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {/* Minimized Summary Bar */}
                                    {isDetailsMinimized ? (
                                      <div className="p-3 bg-slate-50/60 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                          <span>Assigned Faculty Guide: </span>
                                          <strong className="text-slate-900">{guideInfo.name}</strong>{" "}
                                          <span className="text-slate-400">({guideInfo.designation} • {guideInfo.department})</span>
                                          <span className="mx-2 text-slate-300">•</span>
                                          <span>4 Candidates Enrolled (Rahul Sharma, Priya, Karthik, Ananya)</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => toggleTeamDetailsMinimize(teamId)}
                                          className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline shrink-0"
                                        >
                                          Show Candidate Table
                                        </button>
                                      </div>
                                    ) : (
                                      /* Fully Expanded Details: Guide Card & Member Table */
                                      <div className="p-4 space-y-3.5 bg-slate-50/50 animate-in fade-in-50 duration-150">
                                        {/* Assigned Faculty Guide Card */}
                                        <div className="p-3 rounded-md border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-md bg-emerald-100 text-[#034419] font-bold flex items-center justify-center text-xs shrink-0">
                                              {guideInfo.name.replace("Dr. ", "").charAt(0) || "S"}
                                            </div>
                                            <div>
                                              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                ASSIGNED FACULTY GUIDE
                                              </div>
                                              <div className="text-xs font-semibold text-slate-900">
                                                {guideInfo.name}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                                            <span>{guideInfo.designation}</span>
                                            <span>•</span>
                                            <span>{guideInfo.department} Department</span>
                                          </div>
                                        </div>

                                        {/* Student Member Roster Table */}
                                        <div>
                                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            EVALUATED CANDIDATE ROSTER:
                                          </div>
                                          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                                            <table className="w-full text-xs text-left">
                                              <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                                                <tr>
                                                  <th className="py-2 px-3">#</th>
                                                  <th className="py-2 px-3">Student Name</th>
                                                  <th className="py-2 px-3">Roll Number</th>
                                                  <th className="py-2 px-3">Department</th>
                                                  <th className="py-2 px-3">Role</th>
                                                  <th className="py-2 px-3 text-right">Viva Status</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                {(team.members || [
                                                  {
                                                    name: "Rahul Sharma",
                                                    roll_no: "23CS001",
                                                    dept: "CSE",
                                                    role: "Core Contributor",
                                                  },
                                                  {
                                                    name: "Priya Dharshini",
                                                    roll_no: "23CS014",
                                                    dept: "CSE",
                                                    role: "Core Contributor",
                                                  },
                                                  {
                                                    name: "Karthik Raja",
                                                    roll_no: "23CS028",
                                                    dept: "CSE",
                                                    role: "Core Contributor",
                                                  },
                                                  {
                                                    name: "Ananya Iyer",
                                                    roll_no: "23CS042",
                                                    dept: "CSE",
                                                    role: "Core Contributor",
                                                  },
                                                ]).map((member: any, mIdx: number) => (
                                                  <tr key={member.roll_no || member.roll_number || mIdx} className="hover:bg-slate-50/50">
                                                    <td className="py-2 px-3 font-mono text-slate-400">
                                                      {mIdx + 1}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold text-slate-900">
                                                      {member.name || member.full_name}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-slate-600">
                                                      {member.roll_no || member.roll_number || "23CS00" + (mIdx + 1)}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600">
                                                      {member.dept || member.department || "CSE"}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500">
                                                      {member.role || "Core Contributor"}
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                      <span className="text-emerald-700 font-semibold text-[11px]">
                                                        COMPLETED
                                                      </span>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Institutional Footer Audit Summary */}
      <div className="p-4 bg-white rounded-lg border border-slate-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
        <div className="font-medium text-slate-600">
          Official PRC Examination Records • {totalSessionsCount} Sessions Logged with {totalEvaluationsCount} Total Team Evaluations
        </div>
        <div className="text-slate-400 font-medium">
          Autonomous Academic Governance &amp; COE Marksheet Verification
        </div>
      </div>
    </div>
  );
}

export default AdvisorEvaluationRecordsPage;
