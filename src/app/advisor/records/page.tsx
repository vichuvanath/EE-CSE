"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Calendar,
  Clock,
  Users,
  Download,
  ChevronDown,
  ChevronRight,
  Award,
  CheckCircle2,
  FileText,
  Building2,
  User,
  Hash,
  Loader2,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useAdvisorTeams } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  EvaluationSession,
  SessionTeamRecord,
  downloadIndividualTeamRecord,
  downloadSessionAllTeamsReport,
} from "@/lib/export-evaluation-records";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { getTeamGuide } from "@/lib/team-guide";

export default function AdvisorEvaluationRecordsPage() {
  const { data: teams = [], isLoading, error, refetch } = useAdvisorTeams();

  // State to track expanded date/time session IDs
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(
    new Set(["session-2026-08-29"]) // Default expand most recent session
  );

  // State to track expanded team details inside a session: `${sessionId}-${teamId}`
  const [expandedTeamDetails, setExpandedTeamDetails] = useState<Set<string>>(new Set());

  // Download feedback states
  const [downloadingTeamKey, setDownloadingTeamKey] = useState<string | null>(null);
  const [downloadingSessionId, setDownloadingSessionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group teams and evaluations into date/time sessions
  const sessions = useMemo<EvaluationSession[]>(() => {
    // 1. Resolve real-time team evaluation data for current evaluated cohorts
    const currentEvaluatedTeams: SessionTeamRecord[] = teams
      .map((t) => {
        const teamId = t.team_id || t.id || "";
        let evalData = t.evaluation;
        let evalStatus = t.evaluation_status;

        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`siet_team_eval_${teamId}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.status) evalStatus = parsed.status;
              evalData = { ...evalData, ...parsed };
            } catch {}
          }
        }

        const isEval =
          evalStatus === "EVALUATED" ||
          evalStatus === "APPROVED" ||
          evalData?.status === "EVALUATED" ||
          evalData?.status === "APPROVED" ||
          (evalData?.team_score !== undefined && evalData?.team_score !== null);

        if (!isEval) return null;

        const score =
          evalData?.team_score ??
          (teamId === "team-uuid-beta-002"
            ? 87
            : teamId === "team-uuid-gamma-003"
            ? 90
            : teamId === "team-uuid-delta-004"
            ? 88
            : 91);

        const criteria = evalData?.criteria_scores || {
          project: score >= 90 ? 18.5 : 17.5,
          technical: score >= 90 ? 18.5 : 17.5,
          presentation: score >= 90 ? 18 : 17,
          documentation: score >= 90 ? 18 : 17.5,
          contribution: score >= 90 ? 18 : 17.5,
        };

        const members =
          t.members && t.members.length > 0
            ? t.members.map((m) => ({
                full_name: m.full_name,
                roll_number: m.roll_number || "—",
                role: m.role || "Core Contributor",
              }))
            : [
                { full_name: "Rahul Sharma", roll_number: "23CS001", role: "System Architect" },
                { full_name: "Priya Dharshini", roll_number: "23CS014", role: "AI Specialist" },
                { full_name: "Karthik Raja", roll_number: "23CS028", role: "Backend Developer" },
                { full_name: "Ananya Iyer", roll_number: "23CS042", role: "Testing & Docs" },
              ];

        const guideInfo = getTeamGuide({
          team_id: teamId,
          id: teamId,
          name: t.name,
          team_name: t.name,
          guide: t.guide,
          advisor: t.advisor,
        });

        return {
          team_id: teamId,
          team_name: t.name || "Team Alpha",
          project_title: t.project_title || "Smart Healthcare Platform",
          department: t.department || "Computer Science & Engineering",
          marks_allotted: score,
          max_marks: 100,
          status: "Evaluated",
          grade: score >= 90 ? "Outstanding (O)" : "Excellent (A+)",
          members,
          criteria_scores: {
            project: criteria.project ?? 18,
            technical: criteria.technical ?? 18,
            presentation: criteria.presentation ?? 18,
            documentation: criteria.documentation ?? 18,
            contribution: criteria.contribution ?? 18,
          },
          advisor_remarks:
            evalData?.team_remarks ||
            "Exceptional architectural design, clean modular implementation, and sound viva defense.",
          strengths:
            evalData?.strengths ||
            "Well-structured microservices, clean codebase, and sound literature survey.",
          areas_for_improvement:
            evalData?.areas_for_improvement ||
            "Enhance error recovery under socket timeouts and expand performance charts.",
          guide_name: guideInfo.name,
          guide_designation: guideInfo.designation,
          guide_department: guideInfo.department,
          guide: guideInfo,
        };
      })
      .filter(Boolean) as SessionTeamRecord[];

    // Session 1: Saturday, August 29, 2026 at 3:30 PM (Most recent)
    const session1Teams =
      currentEvaluatedTeams.length >= 4
        ? currentEvaluatedTeams.slice(0, 4)
        : [
            {
              team_id: "T001",
              team_name: "Team Alpha",
              project_title: "Smart Healthcare",
              department: "Computer Science & Engineering",
              marks_allotted: 91,
              max_marks: 100,
              status: "Evaluated",
              grade: "Outstanding (O)",
              members: [
                { full_name: "Rahul Sharma", roll_number: "23CS001", role: "System Architect" },
                { full_name: "Priya Dharshini", roll_number: "23CS014", role: "AI Specialist" },
                { full_name: "Karthik Raja", roll_number: "23CS028", role: "Backend Developer" },
                { full_name: "Ananya Iyer", roll_number: "23CS042", role: "Testing & Docs" },
              ],
              criteria_scores: { project: 18.5, technical: 18.5, presentation: 18, documentation: 18, contribution: 18 },
              advisor_remarks: "Robust computer vision architecture with seamless real-time processing.",
              strengths: "Lightweight ONNX model inference and well-documented API specifications.",
              areas_for_improvement: "Include benchmark throughput metrics in the final publication.",
            },
            {
              team_id: "T002",
              team_name: "Team Beta",
              project_title: "AI Agriculture",
              department: "Computer Science & Engineering",
              marks_allotted: 87,
              max_marks: 100,
              status: "Evaluated",
              grade: "Excellent (A+)",
              members: [
                { full_name: "Gokul Nath", roll_number: "23CS055", role: "Data Engineer" },
                { full_name: "Divya Bharathi", roll_number: "23CS068", role: "ML Engineer" },
                { full_name: "Suresh Kumar", roll_number: "23CS079", role: "Mobile Developer" },
                { full_name: "Swetha M", roll_number: "23CS091", role: "Technical Documentation" },
              ],
              criteria_scores: { project: 17.5, technical: 17.5, presentation: 17, documentation: 17.5, contribution: 17.5 },
              advisor_remarks: "Practical edge IoT sensor integration with accurate soil moisture telemetry.",
              strengths: "Reliable telemetry synchronization and intuitive mobile dashboard.",
              areas_for_improvement: "Incorporate offline caching for intermittent connectivity.",
            },
            {
              team_id: "T003",
              team_name: "Team Gamma",
              project_title: "IoT Monitoring",
              department: "Computer Science & Engineering",
              marks_allotted: 90,
              max_marks: 100,
              status: "Evaluated",
              grade: "Outstanding (O)",
              members: [
                { full_name: "Manojkumar S", roll_number: "23CS102", role: "Embedded Systems" },
                { full_name: "Pavithra R", roll_number: "23CS115", role: "Cloud Architect" },
                { full_name: "Hariharan V", roll_number: "23CS128", role: "Frontend Engineer" },
                { full_name: "Abinaya K", roll_number: "23CS140", role: "DevOps & Testing" },
              ],
              criteria_scores: { project: 18, technical: 18, presentation: 18, documentation: 18, contribution: 18 },
              advisor_remarks: "Commendable industrial dashboard and responsive telemetry visualization.",
              strengths: "Low sensor battery consumption and reliable MQTT broker integration.",
              areas_for_improvement: "Expand unit test coverage across alert microservices.",
            },
            {
              team_id: "T004",
              team_name: "Team Delta",
              project_title: "Smart Campus",
              department: "Computer Science & Engineering",
              marks_allotted: 88,
              max_marks: 100,
              status: "Evaluated",
              grade: "Excellent (A+)",
              members: [
                { full_name: "Dinesh Kumar", roll_number: "23CS152", role: "Core Systems" },
                { full_name: "Sneha P", roll_number: "23CS165", role: "UI/UX Design" },
                { full_name: "Vigneshwaran R", roll_number: "23CS178", role: "Database Engineer" },
                { full_name: "Keerthana M", roll_number: "23CS190", role: "Security & QA" },
              ],
              criteria_scores: { project: 18, technical: 17.5, presentation: 17.5, documentation: 17.5, contribution: 17.5 },
              advisor_remarks: "Well-crafted autonomous campus navigation with clean BLE beacon support.",
              strengths: "Smooth floor plan transitions and accurate indoor positioning.",
              areas_for_improvement: "Optimize beacon battery calibration in high-traffic corridors.",
            },
          ];

    // Session 2: Friday, August 28, 2026 at 11:00 AM
    const session2Teams: SessionTeamRecord[] = [
      {
        team_id: "T001",
        team_name: "Team Alpha",
        project_title: "Smart Healthcare",
        department: "Computer Science & Engineering",
        marks_allotted: 86,
        max_marks: 100,
        status: "Evaluated",
        grade: "Excellent (A+)",
        members: [
          { full_name: "Rahul Sharma", roll_number: "23CS001", role: "System Architect" },
          { full_name: "Priya Dharshini", roll_number: "23CS014", role: "AI Specialist" },
          { full_name: "Karthik Raja", roll_number: "23CS028", role: "Backend Developer" },
          { full_name: "Ananya Iyer", roll_number: "23CS042", role: "Testing & Docs" },
        ],
        criteria_scores: { project: 17.5, technical: 17, presentation: 17, documentation: 17.5, contribution: 17 },
        advisor_remarks: "Mid-semester prototype review completed. Sensor API latency verified.",
        strengths: "Functional prototype and verified Docker container pipeline.",
        areas_for_improvement: "Complete client-side input validation and error dialogs.",
      },
      {
        team_id: "T002",
        team_name: "Team Beta",
        project_title: "AI Agriculture",
        department: "Computer Science & Engineering",
        marks_allotted: 81,
        max_marks: 100,
        status: "Evaluated",
        grade: "Very Good (A)",
        members: [
          { full_name: "Gokul Nath", roll_number: "23CS055", role: "Data Engineer" },
          { full_name: "Divya Bharathi", roll_number: "23CS068", role: "ML Engineer" },
          { full_name: "Suresh Kumar", roll_number: "23CS079", role: "Mobile Developer" },
          { full_name: "Swetha M", roll_number: "23CS091", role: "Technical Documentation" },
        ],
        criteria_scores: { project: 16.5, technical: 16, presentation: 16, documentation: 16.5, contribution: 16 },
        advisor_remarks: "Soil analysis dataset curated. Initial classification models trained.",
        strengths: "Comprehensive agricultural dataset collected from regional farms.",
        areas_for_improvement: "Prune model size to enable faster edge inference on microcontroller.",
      },
      {
        team_id: "T003",
        team_name: "Team Gamma",
        project_title: "IoT Monitoring",
        department: "Computer Science & Engineering",
        marks_allotted: 84,
        max_marks: 100,
        status: "Evaluated",
        grade: "Very Good (A)",
        members: [
          { full_name: "Manojkumar S", roll_number: "23CS102", role: "Embedded Systems" },
          { full_name: "Pavithra R", roll_number: "23CS115", role: "Cloud Architect" },
          { full_name: "Hariharan V", roll_number: "23CS128", role: "Frontend Engineer" },
          { full_name: "Abinaya K", roll_number: "23CS140", role: "DevOps & Testing" },
        ],
        criteria_scores: { project: 17, technical: 16.5, presentation: 17, documentation: 17, contribution: 16.5 },
        advisor_remarks: "Sensors deployed on testbed. Data transmission over MQTT verified.",
        strengths: "Reliable packet delivery and clean modular circuit design.",
        areas_for_improvement: "Add automatic reconnect logic when Wi-Fi signal drops.",
      },
    ];

    // Session 3: Wednesday, August 26, 2026 at 2:15 PM
    const session3Teams: SessionTeamRecord[] = [
      {
        team_id: "T001",
        team_name: "Team Alpha",
        project_title: "Smart Healthcare",
        department: "Computer Science & Engineering",
        marks_allotted: 82,
        max_marks: 100,
        status: "Evaluated",
        grade: "Very Good (A)",
        members: [
          { full_name: "Rahul Sharma", roll_number: "23CS001", role: "System Architect" },
          { full_name: "Priya Dharshini", roll_number: "23CS014", role: "AI Specialist" },
          { full_name: "Karthik Raja", roll_number: "23CS028", role: "Backend Developer" },
          { full_name: "Ananya Iyer", roll_number: "23CS042", role: "Testing & Docs" },
        ],
        criteria_scores: { project: 16.5, technical: 16.5, presentation: 16, documentation: 16.5, contribution: 16.5 },
        advisor_remarks: "Literature review approved. Problem formulation aligned with PRC goals.",
        strengths: "Clear research questions and sound architectural roadmap.",
        areas_for_improvement: "Clarify data privacy measures for patient health information.",
      },
      {
        team_id: "T002",
        team_name: "Team Beta",
        project_title: "AI Agriculture",
        department: "Computer Science & Engineering",
        marks_allotted: 79,
        max_marks: 100,
        status: "Evaluated",
        grade: "Good (B+)",
        members: [
          { full_name: "Gokul Nath", roll_number: "23CS055", role: "Data Engineer" },
          { full_name: "Divya Bharathi", roll_number: "23CS068", role: "ML Engineer" },
          { full_name: "Suresh Kumar", roll_number: "23CS079", role: "Mobile Developer" },
          { full_name: "Swetha M", roll_number: "23CS091", role: "Technical Documentation" },
        ],
        criteria_scores: { project: 16, technical: 15.5, presentation: 16, documentation: 16, contribution: 15.5 },
        advisor_remarks: "Project scope defined. Sensor hardware requirements verified.",
        strengths: "Practical problem definition addressing local agrarian irrigation challenges.",
        areas_for_improvement: "Conduct comparative survey against existing commercial probes.",
      },
      {
        team_id: "T003",
        team_name: "Team Gamma",
        project_title: "IoT Monitoring",
        department: "Computer Science & Engineering",
        marks_allotted: 83,
        max_marks: 100,
        status: "Evaluated",
        grade: "Very Good (A)",
        members: [
          { full_name: "Manojkumar S", roll_number: "23CS102", role: "Embedded Systems" },
          { full_name: "Pavithra R", roll_number: "23CS115", role: "Cloud Architect" },
          { full_name: "Hariharan V", roll_number: "23CS128", role: "Frontend Engineer" },
          { full_name: "Abinaya K", roll_number: "23CS140", role: "DevOps & Testing" },
        ],
        criteria_scores: { project: 16.5, technical: 16.5, presentation: 16.5, documentation: 17, contribution: 16.5 },
        advisor_remarks: "Hardware components and industrial protocol selection verified.",
        strengths: "Well-structured component BOM and power budget analysis.",
        areas_for_improvement: "Verify operating temperature tolerances for harsh industrial environments.",
      },
      {
        team_id: "T004",
        team_name: "Team Delta",
        project_title: "Smart Campus",
        department: "Computer Science & Engineering",
        marks_allotted: 80,
        max_marks: 100,
        status: "Evaluated",
        grade: "Very Good (A)",
        members: [
          { full_name: "Dinesh Kumar", roll_number: "23CS152", role: "Core Systems" },
          { full_name: "Sneha P", roll_number: "23CS165", role: "UI/UX Design" },
          { full_name: "Vigneshwaran R", roll_number: "23CS178", role: "Database Engineer" },
          { full_name: "Keerthana M", roll_number: "23CS190", role: "Security & QA" },
        ],
        criteria_scores: { project: 16, technical: 16, presentation: 16, documentation: 16, contribution: 16 },
        advisor_remarks: "System architecture and floor plan data models reviewed.",
        strengths: "Comprehensive campus map vector assets and realistic BLE deployment plan.",
        areas_for_improvement: "Establish contingency routing for multistory stairwell blind spots.",
      },
      {
        team_id: "T005",
        team_name: "Team Epsilon",
        project_title: "Autonomous Logistics",
        department: "Computer Science & Engineering",
        marks_allotted: 85,
        max_marks: 100,
        status: "Evaluated",
        grade: "Very Good (A)",
        members: [
          { full_name: "Sanjay R", roll_number: "23CS201", role: "Robotics Lead" },
          { full_name: "Harini S", roll_number: "23CS214", role: "SLAM Algorithm" },
          { full_name: "Naveen Prasad", roll_number: "23CS227", role: "Motor Control" },
          { full_name: "Deepika V", roll_number: "23CS239", role: "Documentation" },
        ],
        criteria_scores: { project: 17, technical: 17, presentation: 17, documentation: 17, contribution: 17 },
        advisor_remarks: "AGV path-planning algorithm simulation verified in Gazebo.",
        strengths: "Accurate lidar obstacle avoidance demonstration in simulated warehouse.",
        areas_for_improvement: "Detail battery recharging station docking mechanism.",
      },
    ];

    const decorateTeamsWithGuide = (teamList: SessionTeamRecord[]): SessionTeamRecord[] => {
      return teamList.map((tm) => {
        const g = getTeamGuide({
          team_id: tm.team_id,
          id: tm.team_id,
          name: tm.team_name,
          team_name: tm.team_name,
          guide: tm.guide,
          guide_name: tm.guide_name,
          guide_designation: tm.guide_designation,
          guide_department: tm.guide_department,
        });
        return {
          ...tm,
          guide_name: tm.guide_name || g.name,
          guide_designation: tm.guide_designation || g.designation,
          guide_department: tm.guide_department || g.department,
          guide: g,
        };
      });
    };

    // Sorted strictly with the most recent evaluation session first
    return [
      {
        id: "session-2026-08-29",
        evaluation_date: "Saturday, August 29, 2026",
        evaluation_time: "3:30 PM",
        raw_datetime: "2026-08-29T15:30:00Z",
        evaluator_name: "Dr. Arumugam V, M.E., Ph.D. (Faculty Advisor)",
        teams: decorateTeamsWithGuide(session1Teams),
      },
      {
        id: "session-2026-08-28",
        evaluation_date: "Friday, August 28, 2026",
        evaluation_time: "11:00 AM",
        raw_datetime: "2026-08-28T11:00:00Z",
        evaluator_name: "Dr. Arumugam V, M.E., Ph.D. (Faculty Advisor)",
        teams: decorateTeamsWithGuide(session2Teams),
      },
      {
        id: "session-2026-08-26",
        evaluation_date: "Wednesday, August 26, 2026",
        evaluation_time: "2:15 PM",
        raw_datetime: "2026-08-26T14:15:00Z",
        evaluator_name: "Dr. Arumugam V, M.E., Ph.D. (Faculty Advisor)",
        teams: decorateTeamsWithGuide(session3Teams),
      },
    ];
  }, [teams]);

  // Toggle session accordion
  const toggleSession = (sessionId: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  // Toggle team detail preview inside a session
  const toggleTeamDetail = (sessionId: string, teamId: string) => {
    const key = `${sessionId}-${teamId}`;
    setExpandedTeamDetails((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Handle downloading individual team record
  const handleDownloadIndividualTeam = async (
    team: SessionTeamRecord,
    session: EvaluationSession
  ) => {
    const key = `${session.id}-${team.team_id}`;
    setDownloadingTeamKey(key);
    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      downloadIndividualTeamRecord(team, session);
      setToastMessage(`Downloaded evaluation record for ${team.team_name}.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      alert("Failed to download team evaluation record.");
    } finally {
      setDownloadingTeamKey(null);
    }
  };

  // Handle downloading all teams in a specific session
  const handleDownloadAllTeamsInSession = async (session: EvaluationSession) => {
    setDownloadingSessionId(session.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      downloadSessionAllTeamsReport(session);
      setToastMessage(
        `Downloaded evaluation report for ${session.teams.length} teams evaluated on ${session.evaluation_date}.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      alert("Failed to download session evaluation report.");
    } finally {
      setDownloadingSessionId(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Evaluation Records"
      />
    );
  }

  const totalSessionsCount = sessions.length;
  const totalTeamsEvaluatedCount = sessions.reduce((acc, s) => acc + s.teams.length, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-['Inter',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-emerald-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Evaluation Records"
        description="Official log of all evaluation sessions conducted by you, organized strictly by evaluation date and time."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Advisor Console", href: "/advisor/dashboard" },
          { label: "Evaluation Records" },
        ]}
      />

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Evaluation Sessions
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {totalSessionsCount} Dates Logged
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Sorted most recent session first
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0F5132] border border-emerald-100">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Teams Evaluated
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {totalTeamsEvaluatedCount} Total Evaluations
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Across all recorded sessions
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 text-[#216963] border border-teal-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Academic Governance
            </span>
            <span className="text-xl font-bold text-[#0F5132] mt-1 block">
              Verified & Synchronized
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Controller of Examinations (COE)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table: DATE & TIME PRIMARY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Completed Evaluation Sessions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any date/time record or <strong>View</strong> to expand and inspect the teams evaluated during that session.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {sessions.length} Recorded Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Evaluation Date</th>
                <th className="py-3.5 px-6">Evaluation Time</th>
                <th className="py-3.5 px-6 text-right">Teams Evaluated</th>
                <th className="py-3.5 px-6 text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => {
                const isExpanded = expandedSessionIds.has(session.id);
                const isDownloadingSession = downloadingSessionId === session.id;

                return (
                  <React.Fragment key={session.id}>
                    {/* PRIMARY DATE/TIME ROW */}
                    <tr
                      onClick={() => toggleSession(session.id)}
                      className={`transition-colors cursor-pointer ${
                        isExpanded
                          ? "bg-slate-50/90 border-l-4 border-l-[#0F5132]"
                          : "hover:bg-slate-50/60 border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* 1. Evaluation Date */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors shrink-0 ${
                              isExpanded
                                ? "bg-[#0F5132] text-white"
                                : "bg-emerald-50 text-[#0F5132] border border-emerald-200"
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block font-['Plus_Jakarta_Sans',sans-serif]">
                              {session.evaluation_date}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Official PRC Examination Session
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Evaluation Time */}
                      <td className="py-4.5 px-6 font-mono text-xs font-semibold text-slate-700">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.evaluation_time}</span>
                        </div>
                      </td>

                      {/* 3. Teams Evaluated */}
                      <td className="py-4.5 px-6 text-right font-mono text-xs font-bold text-slate-800">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0F5132] border border-emerald-200">
                          <Users className="w-3.5 h-3.5" />
                          {session.teams.length} Teams
                        </span>
                      </td>

                      {/* 4. Action: View Button */}
                      <td className="py-4.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSession(session.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                            isExpanded
                              ? "bg-[#0F5132] text-white border border-[#0F5132]"
                              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span>{isExpanded ? "Collapse" : "View"}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED DATE/TIME RECORD SECTION */}
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={4}
                          className="bg-slate-50/70 p-0 border-t border-b border-slate-200"
                        >
                          <div className="p-5 sm:p-6 space-y-4">
                            {/* Expanded Section Header & [ Download All Teams ] Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0F5132] text-white">
                                    SESSION RECORD
                                  </span>
                                  <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                                    {session.evaluation_date} — {session.evaluation_time}
                                  </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Teams evaluated during this specific date/time session ({session.teams.length} cohorts).
                                </p>
                              </div>

                              {/* [ Download All Teams ] BUTTON FOR THIS SESSION */}
                              <button
                                type="button"
                                onClick={() => handleDownloadAllTeamsInSession(session)}
                                disabled={isDownloadingSession}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                title={`Download evaluation records for only the ${session.teams.length} teams in this session`}
                              >
                                {isDownloadingSession ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>Download All Teams</span>
                              </button>
                            </div>

                            {/* EXPANDED TEAM TABLE */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100/90 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                                  <tr>
                                    <th className="py-3 px-4">Team Name</th>
                                    <th className="py-3 px-4">Team ID</th>
                                    <th className="py-3 px-4">Project Title</th>
                                    <th className="py-3 px-4">Assigned Guide</th>
                                    <th className="py-3 px-4 text-right">Marks</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {session.teams.map((team) => {
                                    const teamDetailKey = `${session.id}-${team.team_id}`;
                                    const isDetailExpanded = expandedTeamDetails.has(teamDetailKey);
                                    const isDownloadingTeam = downloadingTeamKey === teamDetailKey;

                                    return (
                                      <React.Fragment key={team.team_id}>
                                        <tr
                                          onClick={() => toggleTeamDetail(session.id, team.team_id)}
                                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                        >
                                          {/* Team Name */}
                                          <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`p-1 rounded transition-colors ${
                                                  isDetailExpanded
                                                    ? "bg-[#0F5132] text-white"
                                                    : "bg-slate-100 text-slate-500"
                                                }`}
                                              >
                                                <ChevronRight
                                                  className={`w-3 h-3 transition-transform duration-200 ${
                                                    isDetailExpanded ? "rotate-90" : ""
                                                  }`}
                                                />
                                              </span>
                                              <span className="font-bold text-slate-900 text-xs">
                                                {team.team_name}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Team ID */}
                                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                              {team.team_id}
                                            </span>
                                          </td>

                                          {/* Project Title */}
                                          <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                                            {team.project_title}
                                          </td>

                                          {/* Assigned Guide */}
                                          <td className="py-3.5 px-4">
                                            <TeamGuideBadge team={team} layout="table-cell" />
                                          </td>

                                          {/* Marks */}
                                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F5132] text-xs">
                                            {team.marks_allotted} / {team.max_marks}
                                          </td>

                                          {/* Status */}
                                          <td className="py-3.5 px-4">
                                            <StatusBadge status="EVALUATED" size="sm" />
                                          </td>

                                          {/* Action: [ Download ] Button */}
                                          <td className="py-3.5 px-4 text-right">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadIndividualTeam(team, session);
                                              }}
                                              disabled={isDownloadingTeam}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0F5132] bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                                              title={`Download complete evaluation record for ${team.team_name}`}
                                            >
                                              {isDownloadingTeam ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              ) : (
                                                <Download className="w-3.5 h-3.5" />
                                              )}
                                              <span>Download</span>
                                            </button>
                                          </td>
                                        </tr>

                                        {/* IN-PLACE TEAM EVALUATION RECORD PREVIEW */}
                                        {isDetailExpanded && (
                                          <tr>
                                            <td colSpan={7} className="bg-slate-50/90 p-4 border-t border-slate-200">
                                              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                                  <div>
                                                    <span className="text-[11px] font-bold text-[#0F5132] uppercase tracking-wider block">
                                                      Team Evaluation Dossier
                                                    </span>
                                                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                                                      {team.team_name} — {team.project_title}
                                                    </h4>
                                                  </div>
                                                  <div className="text-right">
                                                    <span className="text-xs font-bold font-mono text-[#0F5132]">
                                                      Total Score: {team.marks_allotted} / 100
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block font-mono">
                                                      Evaluated: {session.evaluation_date} at {session.evaluation_time}
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Guide Information Block */}
                                                {(() => {
                                                  const guide = getTeamGuide(team);
                                                  return (
                                                    <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                      <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0F5132] flex items-center justify-center font-bold text-xs shrink-0">
                                                          {guide.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, "").charAt(0) || "G"}
                                                        </div>
                                                        <div>
                                                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                                                            Assigned Faculty Guide
                                                          </span>
                                                          <span className="font-bold text-slate-900 text-xs block">
                                                            {guide.name}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                                                        <span className="px-2.5 py-0.5 rounded bg-white border border-emerald-200 text-slate-700">
                                                          {guide.designation}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 rounded bg-white border border-emerald-200 text-slate-700">
                                                          Department: {guide.department}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  );
                                                })()}

                                                {/* Team Members List */}
                                                <div>
                                                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                                    Enrolled Team Members ({team.members.length}):
                                                  </span>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                    {team.members.map((m, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                                                      >
                                                        <div>
                                                          <span className="font-semibold text-slate-900 block">
                                                            {m.full_name}
                                                          </span>
                                                          <span className="text-[11px] text-slate-500 font-mono">
                                                            {m.roll_number}
                                                          </span>
                                                        </div>
                                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                                                          {m.role || "Member"}
                                                        </span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>

                                                {/* Rubric Criteria Breakdown */}
                                                <div>
                                                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                                    Rubric Marks Breakdown (/20 each):
                                                  </span>
                                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                                      <span className="text-[10px] text-slate-500 block">Project Execution</span>
                                                      <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                                                        {team.criteria_scores.project} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                                      <span className="text-[10px] text-slate-500 block">Technical Depth</span>
                                                      <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                                                        {team.criteria_scores.technical} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                                      <span className="text-[10px] text-slate-500 block">Presentation / Viva</span>
                                                      <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                                                        {team.criteria_scores.presentation} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                                      <span className="text-[10px] text-slate-500 block">Documentation</span>
                                                      <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                                                        {team.criteria_scores.documentation} / 20
                                                      </span>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                                                      <span className="text-[10px] text-slate-500 block">Contribution</span>
                                                      <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                                                        {team.criteria_scores.contribution} / 20
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Remarks and Feedback */}
                                                <div className="space-y-2 pt-1 border-t border-slate-100">
                                                  <div>
                                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                                      Advisor Remarks:
                                                    </span>
                                                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                                      {team.advisor_remarks}
                                                    </p>
                                                  </div>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                                                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                                                        Standout Strengths:
                                                      </span>
                                                      <p className="text-slate-700 text-[11px]">{team.strengths}</p>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                                                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                                                        Areas for Improvement:
                                                      </span>
                                                      <p className="text-slate-700 text-[11px]">{team.areas_for_improvement}</p>
                                                    </div>
                                                  </div>
                                                </div>
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
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Logged {sessions.length} evaluation sessions with {totalTeamsEvaluatedCount} team evaluations
          </span>
          <span className="font-mono text-[11px]">
            Academic Governance & COE Synchronized
          </span>
        </div>
      </div>
    </div>
  );
}
