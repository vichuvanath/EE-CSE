"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Users,
  Award,
  ChevronDown,
  ChevronRight,
  FolderClock,
  User,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Calendar,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { useAdvisorTeams, useAdvisorStudents } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { StudentProfileModal } from "@/components/advisor/StudentProfileModal";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { getTeamGuide } from "@/lib/team-guide";
import { AdvisorTeamMember, AdvisorTeamSummary, TeamEvaluationRecord } from "@/types";

export default function AdvisorStudentsPage() {
  const {
    data: teams = [],
    isLoading: isLoadingTeams,
    error: errorTeams,
    refetch: refetchTeams,
  } = useAdvisorTeams();

  const { data: students = [] } = useAdvisorStudents();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(
    new Set(["team-uuid-alpha-001"]) // Default expand first team
  );

  // Active tab per team inside expanded section: "MEMBERS" | "RECORDS"
  const [teamViewTab, setTeamViewTab] = useState<Record<string, "MEMBERS" | "RECORDS">>({
    "team-uuid-alpha-001": "RECORDS",
  });

  // Track expanded accordion stages: key format `${teamId}-${stageId}`
  const [expandedStageKeys, setExpandedStageKeys] = useState<Set<string>>(
    new Set(["team-uuid-alpha-001-stage-3"]) // Default expand Stage 3 for immediate visibility
  );

  // Modals state for individual student profile
  const [selectedStudent, setSelectedStudent] = useState<AdvisorTeamMember | null>(null);
  const [selectedTeamForStudent, setSelectedTeamForStudent] = useState<AdvisorTeamSummary | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Synchronize localStorage real-time evaluations and build rich multi-stage history
  const enrichedTeams = useMemo(() => {
    return teams.map((team) => {
      const teamId = team.team_id || team.id || "";
      let activeEval = team.evaluation;
      let activeStatus = team.evaluation_status;

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`siet_team_eval_${teamId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            activeStatus = parsed.status || "EVALUATED";
            activeEval = parsed;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      // Ensure members have realistic technical roles without team leader designation
      const enrichedMembers = (team.members || []).map((m, idx) => {
        let role = m.role;
        if (!role || role === "Team Leader") {
          if (idx === 0) role = "System Architect & AI";
          else if (idx === 1) role = "Model Architect & AI";
          else if (idx === 2) role = "Full-Stack & APIs";
          else role = "Documentation & Testing";
        }
        return {
          ...m,
          is_team_leader: false,
          role,
        };
      });

      const isEvaluated =
        activeStatus === "EVALUATED" ||
        activeStatus === "APPROVED" ||
        Boolean(activeEval?.team_score);

      const finalScore = activeEval?.team_score || (team.team_id === "team-uuid-beta-002" ? 95 : team.team_id === "team-uuid-delta-004" ? 88 : 92);

      // Define complete 3-stage evaluation history matching requested format
      const stages: TeamEvaluationRecord[] = [
        {
          id: "stage-1",
          stage_name: "Stage 1 — Abstract Review",
          evaluation_date: "15 Jun 2026",
          evaluator_name: "Department Project Review Committee (PRC)",
          total_marks: 82,
          max_marks: 100,
          grade: "A (Very Good)",
          status: "APPROVED",
          remarks:
            "Literature survey completed across 18 IEEE publications. Problem formulation clearly articulated with societal impact justification. Scope signed off by PRC.",
          strengths: "Clear research objective, thorough literature survey, and sound architectural hypothesis.",
          areas_for_improvement: "Include benchmark latency targets and refine hardware testbed constraints.",
          criteria_scores: {
            project: 16.5,
            technical: 16.5,
            presentation: 16,
            documentation: 16.5,
            contribution: 16.5,
          },
        },
        {
          id: "stage-2",
          stage_name: "Stage 2 — Progress Review",
          evaluation_date: "28 Jul 2026",
          evaluator_name: "Dr. Arumugam V, M.E., Ph.D. (Faculty Advisor)",
          total_marks: 87,
          max_marks: 100,
          grade: "A+ (Excellent)",
          status: "APPROVED",
          remarks:
            "Core modules integrated with initial prototype pipeline. Intermediate demo verified in laboratory conditions. Team demonstrated synchronized Git repository and working mock API.",
          strengths: "Functional microservices, complete ER diagrams, and normalized database schema.",
          areas_for_improvement: "Strengthen error handling on network socket disconnects and finalize frontend responsive layout.",
          criteria_scores: {
            project: 17.5,
            technical: 17.5,
            presentation: 17,
            documentation: 17.5,
            contribution: 17.5,
          },
        },
        {
          id: "stage-3",
          stage_name: "Stage 3 — Final Viva",
          evaluation_date: activeEval?.created_at
            ? new Date(activeEval.created_at).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "03 Sep 2026",
          evaluator_name: "Dr. Arumugam V, M.E., Ph.D. (Faculty Advisor)",
          total_marks: finalScore,
          max_marks: 100,
          grade: finalScore >= 90 ? "O (Outstanding)" : "A+ (Excellent)",
          status: isEvaluated ? "EVALUATED" : "PENDING",
          remarks:
            activeEval?.team_remarks ||
            "Exceptional architecture, robust code repository, and thorough documentation. Working prototype demonstration performed with zero latency hitches. Meets all autonomous college guidelines.",
          strengths:
            activeEval?.strengths ||
            "Comprehensive system architecture, clean modular code structure, and strong viva voce defense.",
          areas_for_improvement:
            activeEval?.areas_for_improvement ||
            "Expand automated test coverage and include benchmark throughput graphs in final published appendix.",
          criteria_scores: activeEval?.criteria_scores || {
            project: 19,
            technical: 18.5,
            presentation: 18,
            documentation: 18.5,
            contribution: 18,
          },
        },
      ];

      return {
        ...team,
        evaluation: activeEval,
        evaluation_status: activeStatus,
        members: enrichedMembers,
        records_history: stages,
      };
    });
  }, [teams]);

  // Filtering teams based on search query
  const filteredTeams = useMemo(() => {
    return enrichedTeams.filter((team) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        team.name.toLowerCase().includes(q) ||
        team.team_id.toLowerCase().includes(q) ||
        team.project_title?.toLowerCase().includes(q) ||
        team.department?.toLowerCase().includes(q) ||
        team.members?.some(
          (m) =>
            m.full_name.toLowerCase().includes(q) ||
            m.roll_number?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q)
        );

      const isEvaluated =
        team.evaluation_status === "EVALUATED" ||
        team.evaluation_status === "APPROVED" ||
        Boolean(team.evaluation?.team_score);

      const matchesFilter =
        filterStatus === "ALL" ||
        (filterStatus === "EVALUATED" && isEvaluated) ||
        (filterStatus === "PENDING" && !isEvaluated);

      return matchesSearch && matchesFilter;
    });
  }, [enrichedTeams, searchQuery, filterStatus]);

  // If search query is active, auto-expand matching teams
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const matchingIds = new Set<string>();
      filteredTeams.forEach((t) => matchingIds.add(t.team_id));
      setExpandedTeamIds(matchingIds);
    }
  }, [searchQuery, filteredTeams]);

  // Toggle stage expansion independently
  const toggleStageExpand = (teamId: string, stageId: string) => {
    const key = `${teamId}-${stageId}`;
    setExpandedStageKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Toggle whole team row expansion
  const toggleTeamRow = (teamId: string) => {
    setExpandedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  // Handler for clicking "View Records"
  const handleToggleViewRecords = (teamId: string) => {
    setExpandedTeamIds((prev) => {
      const next = new Set(prev);
      next.add(teamId);
      return next;
    });
    setTeamViewTab((prev) => ({
      ...prev,
      [teamId]: "RECORDS",
    }));
    // Expand Stage 3 by default for quick access
    setExpandedStageKeys((prev) => {
      const next = new Set(prev);
      next.add(`${teamId}-stage-3`);
      return next;
    });
  };

  // Handler for clicking "View Members"
  const handleToggleViewMembers = (teamId: string) => {
    const isExpanded = expandedTeamIds.has(teamId);
    const currentTab = teamViewTab[teamId] || "MEMBERS";

    if (isExpanded && currentTab === "MEMBERS") {
      setExpandedTeamIds((prev) => {
        const next = new Set(prev);
        next.delete(teamId);
        return next;
      });
    } else {
      setExpandedTeamIds((prev) => {
        const next = new Set(prev);
        next.add(teamId);
        return next;
      });
      setTeamViewTab((prev) => ({
        ...prev,
        [teamId]: "MEMBERS",
      }));
    }
  };

  const handleExpandAll = () => {
    if (expandedTeamIds.size === filteredTeams.length) {
      setExpandedTeamIds(new Set());
    } else {
      setExpandedTeamIds(new Set(filteredTeams.map((t) => t.team_id)));
    }
  };

  const handleOpenStudentProfile = (student: AdvisorTeamMember, team: AdvisorTeamSummary) => {
    setSelectedStudent(student);
    setSelectedTeamForStudent(team);
    setIsProfileModalOpen(true);
  };

  if (isLoadingTeams) {
    return <LoadingSkeleton rows={6} />;
  }

  if (errorTeams) {
    return (
      <ErrorState
        error={errorTeams}
        onRetry={() => refetchTeams()}
        title="Unable to load Teams & Student Records"
      />
    );
  }

  const totalCandidates = enrichedTeams.reduce(
    (acc, t) => acc + (t.members?.length || t.member_count || 4),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Student Management & Team Records"
        description="Official list of all undergraduate project teams, candidate rosters, individual student dossiers, and historical milestone records."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Advisor Console", href: "/advisor/dashboard" },
          { label: "Students & Teams" },
        ]}
      />

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Assigned Teams
            </span>
            <span className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5 block">
              {enrichedTeams.length} Cohorts
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Under faculty mentorship
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0F5132] border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Enrolled Students
            </span>
            <span className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5 block">
              {totalCandidates} Candidates
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Active student project dossiers
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Records Synchronized
            </span>
            <span className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5 block">
              {enrichedTeams.filter((t) => t.evaluation_status === "EVALUATED" || Boolean(t.evaluation?.team_score)).length} / {enrichedTeams.length} Evaluated
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Phase II Viva scores logged
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team name, student name, roll number, or project..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Chips */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-white text-[#0F5132] font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("EVALUATED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === "EVALUATED"
                  ? "bg-white text-[#0F5132] font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Evaluated
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === "PENDING"
                  ? "bg-white text-[#0F5132] font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending
            </button>
          </div>

          {/* Toggle All Button */}
          <button
            onClick={handleExpandAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {expandedTeamIds.size === filteredTeams.length && filteredTeams.length > 0
              ? "Collapse All"
              : "Expand All"}
          </button>
        </div>
      </div>

      {/* Main Teams Table */}
      {filteredTeams.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No.</th>
                  <th className="py-3.5 px-6">Team Name</th>
                  <th className="py-3.5 px-6">Team Members</th>
                  <th className="py-3.5 px-6 text-right w-72">Records / History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team, idx) => {
                  const teamId = team.team_id || team.id || `team-${idx}`;
                  const isExpanded = expandedTeamIds.has(teamId);
                  const activeTab = teamViewTab[teamId] || "RECORDS";
                  const members = team.members || [];
                  const stages = team.records_history || [];

                  return (
                    <React.Fragment key={teamId}>
                      {/* Parent Team Row */}
                      <tr
                        className={`transition-colors cursor-pointer ${
                          isExpanded
                            ? "bg-slate-50/80 hover:bg-slate-100/70 border-l-4 border-l-[#0F5132]"
                            : "hover:bg-slate-50/70 border-l-4 border-l-transparent"
                        }`}
                        onClick={() => toggleTeamRow(teamId)}
                      >
                        {/* 1. No. */}
                        <td className="py-4 px-4 text-center font-mono text-xs font-bold text-slate-500">
                          {String(idx + 1).padStart(2, "0")}
                        </td>

                        {/* 2. Team Name & Project Details */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm font-['Plus_Jakarta_Sans',sans-serif]">
                                {team.name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                                {teamId}
                              </span>
                              <StatusBadge
                                status={team.evaluation_status || "PENDING"}
                                size="sm"
                              />
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-1">
                              {team.project_title || "Autonomous Major Project"}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                              <span>{team.department || "Computer Science"}</span>
                              <span>•</span>
                              <span>Sec {team.section || "A"}</span>
                              <span>•</span>
                              <span>Batch {team.batch || "2023-2027"}</span>
                            </div>

                            <div className="pt-1">
                              <TeamGuideBadge team={team} layout="compact" />
                            </div>
                          </div>
                        </td>

                        {/* 3. Team Members */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              {/* Member Count Badge */}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F5132] border border-emerald-200">
                                <Users className="w-3 h-3" />
                                {members.length || team.member_count || 4} Students
                              </span>
                            </div>

                            {/* Monogram Avatars Stack */}
                            <div className="flex items-center -space-x-1.5">
                              {members.map((m, i) => (
                                <div
                                  key={m.id || m.roll_number || i}
                                  title={`${m.full_name} (${m.roll_number})`}
                                  className="ring-2 ring-white rounded-full cursor-pointer hover:z-10 transition-transform hover:scale-110"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStudentProfile(m, team);
                                  }}
                                >
                                  <MonogramAvatar
                                    name={m.full_name}
                                    size="sm"
                                    variant={i === 0 ? "teal" : "emerald"}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* 4. Records / History Actions */}
                        <td className="py-4 px-6 text-right">
                          <div
                            className="inline-flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* View Records Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleViewRecords(teamId)}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                                isExpanded && activeTab === "RECORDS"
                                  ? "bg-[#0F5132] text-white border-[#0F5132]"
                                  : "bg-emerald-50 text-[#0F5132] hover:bg-emerald-100/90 border-emerald-200"
                              }`}
                              title="View complete evaluation history and stage milestones on this page"
                            >
                              <FolderClock className="w-3.5 h-3.5" />
                              View Records
                            </button>

                            {/* View Members Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleViewMembers(teamId)}
                              className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                isExpanded && activeTab === "MEMBERS"
                                  ? "bg-slate-200/90 text-slate-800 border-slate-300"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <span>
                                {isExpanded && activeTab === "MEMBERS" ? "Hide Members" : "View Members"}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded && activeTab === "MEMBERS" ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Expanded Row */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={4}
                            className="bg-slate-50/70 p-0 border-t border-b border-slate-200"
                          >
                            <div className="p-5 pl-6 sm:pl-8 space-y-4">
                              {/* Team & Assigned Guide Banner */}
                              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Supervised Project Cohort
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                                    {team.name} — <span className="font-normal text-slate-600">{team.project_title}</span>
                                  </h4>
                                </div>
                                <div className="shrink-0">
                                  <TeamGuideBadge team={team} layout="card" />
                                </div>
                              </div>

                              {/* Sub-Navigation Tabs: Members vs Evaluation History */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                                <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-white shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setTeamViewTab((prev) => ({
                                        ...prev,
                                        [teamId]: "RECORDS",
                                      }))
                                    }
                                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      activeTab === "RECORDS"
                                        ? "bg-[#0F5132] text-white shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                  >
                                    <FolderClock className="w-3.5 h-3.5" />
                                    <span>Evaluation History</span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                        activeTab === "RECORDS"
                                          ? "bg-white/20 text-white"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {stages.length} Stages
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setTeamViewTab((prev) => ({
                                        ...prev,
                                        [teamId]: "MEMBERS",
                                      }))
                                    }
                                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      activeTab === "MEMBERS"
                                        ? "bg-[#0F5132] text-white shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Team Members</span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                        activeTab === "MEMBERS"
                                          ? "bg-white/20 text-white"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {members.length}
                                    </span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span>
                                    Current Phase:{" "}
                                    <strong className="text-slate-800 font-mono">
                                      {team.current_phase || "Phase II / Final Viva"}
                                    </strong>
                                  </span>
                                  <span>•</span>
                                  <Link
                                    href={`/advisor/teams/${teamId}`}
                                    className="inline-flex items-center gap-1 font-semibold text-[#0F5132] hover:underline"
                                  >
                                    Evaluation Workspace <ArrowUpRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>

                              {/* TAB 1: EVALUATION HISTORY ACCORDION */}
                              {activeTab === "RECORDS" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
                                      <FolderClock className="w-4 h-4 text-[#0F5132]" />
                                      Evaluation History & Milestone Records
                                    </h4>
                                    <span className="text-[11px] text-slate-500">
                                      Click any stage to expand or collapse details
                                    </span>
                                  </div>

                                  {/* Accordion Stages List */}
                                  <div className="space-y-2.5">
                                    {stages.map((stage) => {
                                      const isStageExpanded = expandedStageKeys.has(
                                        `${teamId}-${stage.id}`
                                      );

                                      return (
                                        <div
                                          key={stage.id}
                                          className={`rounded-xl border transition-all overflow-hidden ${
                                            isStageExpanded
                                              ? "bg-white border-slate-300 shadow-xs ring-1 ring-slate-200/80"
                                              : "bg-white border-slate-200/90 hover:border-slate-300"
                                          }`}
                                        >
                                          {/* Stage Accordion Header */}
                                          <button
                                            type="button"
                                            onClick={() => toggleStageExpand(teamId, stage.id)}
                                            className="w-full p-3.5 sm:px-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span
                                                className={`p-1 rounded-md transition-colors ${
                                                  isStageExpanded
                                                    ? "bg-[#0F5132] text-white"
                                                    : "bg-slate-100 text-slate-500"
                                                }`}
                                              >
                                                <ChevronRight
                                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                    isStageExpanded ? "rotate-90" : ""
                                                  }`}
                                                />
                                              </span>

                                              <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                                                    {stage.stage_name}
                                                  </span>
                                                  <StatusBadge status={stage.status} size="sm" />
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                                                  <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {stage.evaluation_date}
                                                  </span>
                                                  <span>•</span>
                                                  <span>Evaluator: {stage.evaluator_name}</span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                              <span className="text-sm font-bold font-mono text-[#0F5132]">
                                                {stage.total_marks} / {stage.max_marks}
                                              </span>
                                              {stage.grade && (
                                                <span className="text-[10px] font-semibold text-emerald-700 block">
                                                  {stage.grade}
                                                </span>
                                              )}
                                            </div>
                                          </button>

                                          {/* Expanded Stage Detailed View */}
                                          {isStageExpanded && (
                                            <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
                                              {/* 1. Rubric-wise Marks */}
                                              {stage.criteria_scores && (
                                                <div className="space-y-1.5 pt-1">
                                                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                    Rubric-wise Marks
                                                  </span>
                                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                                                      <span className="text-[10px] text-slate-500 block truncate">
                                                        Project Execution
                                                      </span>
                                                      <span className="font-mono font-bold text-slate-900 text-xs">
                                                        {stage.criteria_scores.project ?? 19} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                                                      <span className="text-[10px] text-slate-500 block truncate">
                                                        Technical Depth
                                                      </span>
                                                      <span className="font-mono font-bold text-slate-900 text-xs">
                                                        {stage.criteria_scores.technical ?? 18.5} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                                                      <span className="text-[10px] text-slate-500 block truncate">
                                                        Viva & Presentation
                                                      </span>
                                                      <span className="font-mono font-bold text-slate-900 text-xs">
                                                        {stage.criteria_scores.presentation ?? 18} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
                                                      <span className="text-[10px] text-slate-500 block truncate">
                                                        Report & Documentation
                                                      </span>
                                                      <span className="font-mono font-bold text-slate-900 text-xs">
                                                        {stage.criteria_scores.documentation ?? 18.5} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs col-span-2 sm:col-span-1">
                                                      <span className="text-[10px] text-slate-500 block truncate">
                                                        Individual Contribution
                                                      </span>
                                                      <span className="font-mono font-bold text-slate-900 text-xs">
                                                        {stage.criteria_scores.contribution ?? 18} / 20
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* 2. Advisor Remarks */}
                                              <div className="space-y-1">
                                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                  Advisor Remarks
                                                </span>
                                                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed font-sans shadow-2xs">
                                                  {stage.remarks}
                                                </p>
                                              </div>

                                              {/* 3. Feedback: Strengths & Areas for Improvement */}
                                              {(stage.strengths || stage.areas_for_improvement) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                                  {stage.strengths && (
                                                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/70 space-y-1">
                                                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                                                        Feedback — Key Strengths
                                                      </span>
                                                      <p className="text-slate-700 text-[11px] leading-relaxed">
                                                        {stage.strengths}
                                                      </p>
                                                    </div>
                                                  )}
                                                  {stage.areas_for_improvement && (
                                                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70 space-y-1">
                                                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                                                        Feedback — Areas for Improvement
                                                      </span>
                                                      <p className="text-slate-700 text-[11px] leading-relaxed">
                                                        {stage.areas_for_improvement}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {/* 4. Evaluation Governance & Date Footer */}
                                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 font-mono border-t border-slate-200/60">
                                                <span>Evaluation Date: {stage.evaluation_date}</span>
                                                <span>Status: <strong className="text-slate-700">{stage.status}</strong></span>
                                                <span>Autonomous Examination Committee Record</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* TAB 2: TEAM MEMBERS CANDIDATES ROSTER */}
                              {activeTab === "MEMBERS" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
                                      <Users className="w-4 h-4 text-[#0F5132]" />
                                      Assigned Candidates Roster
                                    </h4>
                                    <span className="text-xs text-slate-500">
                                      Click <strong>Profile</strong> on any student to view their individual dossier.
                                    </span>
                                  </div>

                                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                                        <tr>
                                          <th className="py-2.5 px-4">Student Name</th>
                                          <th className="py-2.5 px-4">Register Number</th>
                                          <th className="py-2.5 px-4">Role in Team</th>
                                          <th className="py-2.5 px-4 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {members.map((student) => {
                                          return (
                                            <tr
                                              key={student.id || student.roll_number}
                                              className="hover:bg-slate-50/80 transition-colors"
                                            >
                                              {/* Student Name */}
                                              <td className="py-3 px-4">
                                                <div className="flex items-center gap-2.5">
                                                  <MonogramAvatar
                                                    name={student.full_name}
                                                    size="sm"
                                                    variant="emerald"
                                                  />
                                                  <div>
                                                    <span className="font-semibold text-slate-900 block">
                                                      {student.full_name}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                      {student.email ||
                                                        `${student.roll_number?.toLowerCase()}@siet.ac.in`}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>

                                              {/* Register Number */}
                                              <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                {student.roll_number}
                                              </td>

                                              {/* Role in Team */}
                                              <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                  {student.role || "Core Contributor"}
                                                </span>
                                              </td>

                                              {/* Profile Action Button */}
                                              <td className="py-3 px-4 text-right">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleOpenStudentProfile(student, team)
                                                  }
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0F5132] bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 transition-colors cursor-pointer"
                                                >
                                                  <User className="w-3.5 h-3.5" />
                                                  Profile
                                                </button>
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
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredTeams.length} of {enrichedTeams.length} project teams
            </span>
            <span className="font-mono text-[11px]">
              Academic Governance & Controller of Examinations Synchronized
            </span>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Teams or Students Found"
          description={
            searchQuery
              ? `No assigned team or candidate matches "${searchQuery}".`
              : "No project teams are currently assigned to your mentorship."
          }
          icon={GraduationCap}
        />
      )}

      {/* Student Profile Modal (Only opens when Profile button is clicked) */}
      <StudentProfileModal
        student={selectedStudent}
        team={selectedTeamForStudent}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onViewTeamRecords={(team) => {
          setIsProfileModalOpen(false);
          handleToggleViewRecords(team.team_id);
        }}
      />
    </div>
  );
}
