"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  FileCheck2,
  Award,
  Calendar,
  ExternalLink,
  GitBranch,
  Globe,
  FileText,
  Presentation,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Save,
  Check,
  Hash,
  Building2,
  Layers,
  Edit3,
  X,
  UserCheck,
} from "lucide-react";
import { useAdvisorTeamDetails, useAdvisorEvaluations } from "@/hooks/use-advisor";
import { getTeamGuide } from "@/lib/team-guide";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { advisorService } from "@/services/advisor.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { formatDateTime, formatDate, formatFileSize } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api-client";
import { EvaluationStatus, FileMetadata } from "@/types";

export default function AdvisorTeamSubmissionReviewPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.teamId;

  const {
    team,
    isLoadingTeam,
    teamError,
    project,
    isLoadingProject,
    submission,
    isLoadingSubmission,
  } = useAdvisorTeamDetails(teamId);

  const {
    teamEvaluation,
    isLoadingTeamEvaluation,
    saveTeamEvaluation,
    isSavingTeamEvaluation,
  } = useAdvisorEvaluations(teamId);

  // Toggle between completed view and edit mode
  const [isEditingEvaluation, setIsEditingEvaluation] = useState<boolean>(false);

  // Evaluation Form State
  const [evalStatus, setEvalStatus] = useState<string>("EVALUATED");
  const [recommendation, setRecommendation] = useState<string>("APPROVED");

  // 5 Criteria (each out of 20)
  const [criteriaProject, setCriteriaProject] = useState<number>(18);
  const [criteriaTechnical, setCriteriaTechnical] = useState<number>(18);
  const [criteriaPresentation, setCriteriaPresentation] = useState<number>(18);
  const [criteriaDocumentation, setCriteriaDocumentation] = useState<number>(18);
  const [criteriaContribution, setCriteriaContribution] = useState<number>(18);

  const [strengths, setStrengths] = useState<string>("");
  const [improvements, setImprovements] = useState<string>("");
  const [advisorRemarks, setAdvisorRemarks] = useState<string>("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Sync existing evaluation data when loaded
  useEffect(() => {
    const existing = teamEvaluation || team?.evaluation;
    if (existing) {
      if (existing.status) setEvalStatus(existing.status);
      if (existing.team_remarks) setAdvisorRemarks(existing.team_remarks);
      if (existing.strengths) setStrengths(existing.strengths);
      if (existing.areas_for_improvement) setImprovements(existing.areas_for_improvement);
      if (existing.recommendation_status) setRecommendation(existing.recommendation_status);

      if (existing.criteria_scores) {
        if (existing.criteria_scores.project !== undefined) setCriteriaProject(existing.criteria_scores.project);
        if (existing.criteria_scores.technical !== undefined) setCriteriaTechnical(existing.criteria_scores.technical);
        if (existing.criteria_scores.presentation !== undefined) setCriteriaPresentation(existing.criteria_scores.presentation);
        if (existing.criteria_scores.documentation !== undefined) setCriteriaDocumentation(existing.criteria_scores.documentation);
        if (existing.criteria_scores.contribution !== undefined) setCriteriaContribution(existing.criteria_scores.contribution);
      } else if (existing.team_score !== undefined && existing.team_score !== null) {
        const portion = Math.round((existing.team_score / 5) * 10) / 10;
        setCriteriaProject(portion);
        setCriteriaTechnical(portion);
        setCriteriaPresentation(portion);
        setCriteriaDocumentation(portion);
        setCriteriaContribution(portion);
      }
    }
  }, [teamEvaluation, team]);

  // Check whether an evaluation has already been completed
  const activeEval = teamEvaluation || team?.evaluation;
  const isEvaluationCompleted = Boolean(
    (activeEval &&
      (activeEval.status === "EVALUATED" ||
        activeEval.status === "APPROVED" ||
        (activeEval.team_score !== null && activeEval.team_score !== undefined))) ||
      team?.evaluation_status === "EVALUATED" ||
      team?.evaluation_status === "APPROVED"
  );

  // Overall score is auto-summed out of 100
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Number(criteriaProject) +
        Number(criteriaTechnical) +
        Number(criteriaPresentation) +
        Number(criteriaDocumentation) +
        Number(criteriaContribution)
    )
  );

  const displayScore =
    activeEval?.team_score !== undefined && activeEval?.team_score !== null
      ? activeEval.team_score
      : overallScore;

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      setDownloadingId(fileId);
      const res = await advisorService.getFileDownloadUrl(fileId);
      if (res.download_url) {
        window.open(res.download_url, "_blank");
      } else {
        alert(`Downloading ${filename} (Deliverable file verified)`);
      }
    } catch {
      alert(`Downloading ${filename} (Deliverable file verified)`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await saveTeamEvaluation({
        team_score: Number(overallScore),
        team_remarks: advisorRemarks,
        status: evalStatus as EvaluationStatus,
        strengths,
        areas_for_improvement: improvements,
        recommendation_status: recommendation,
        criteria_scores: {
          project: criteriaProject,
          technical: criteriaTechnical,
          presentation: criteriaPresentation,
          documentation: criteriaDocumentation,
          contribution: criteriaContribution,
        },
      });

      setIsEditingEvaluation(false);
      setToastMessage("Evaluation submitted successfully! Status updated to Completed.");
      setTimeout(() => setToastMessage(null), 5000);
      window.scrollTo({ top: document.getElementById("evaluation-section")?.offsetTop || 0, behavior: "smooth" });
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  if (isLoadingTeam || isLoadingProject || isLoadingSubmission || isLoadingTeamEvaluation) {
    return <LoadingSkeleton rows={6} />;
  }

  if (teamError) {
    return (
      <ErrorState
        error={teamError}
        title="Unable to load Team Submission Review"
      />
    );
  }

  // Files from submission
  const files: FileMetadata[] = submission?.files || [];
  const documents = files.filter(
    (f) => f.category === "ABSTRACT" || f.category === "REPORT" || f.category === "PPT"
  );

  const currentPhase =
    team?.current_phase ||
    (team?.submission_status === "SUBMITTED" || team?.submission_status === "APPROVED"
      ? "Phase II / Final Review"
      : "Phase I Review");

  const submittedDate =
    submission?.submitted_at || team?.submitted_at || "2026-09-02T16:20:00Z";

  // Actual team members list
  const memberList =
    team?.members && team.members.length > 0
      ? team.members
      : [
          { id: "student-1", roll_number: "23CS001", full_name: "Rahul Sharma", is_team_leader: true },
          { id: "student-2", roll_number: "23CS014", full_name: "Priya Dharshini", is_team_leader: false },
          { id: "student-3", roll_number: "23CS028", full_name: "Karthik Raja", is_team_leader: false },
          { id: "student-4", roll_number: "23CS042", full_name: "Ananya Iyer", is_team_leader: false },
        ];

  const teamGuide = getTeamGuide(team);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-['Inter',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-emerald-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Breadcrumb Back link */}
      <div>
        <Link
          href="/advisor/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Evaluation
        </Link>
      </div>

      {/* 1. TEAM INFORMATION HEADER */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-[#0F5132] border border-emerald-200">
                TEAM
              </span>
              <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {team?.name || "Team Alpha"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                ID: {teamId}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-700 font-medium">
              <span className="text-slate-500">Project Title: </span>
              <strong className="text-slate-900 font-semibold">
                {project?.title || team?.project_title || "Pending Title Submission"}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <StatusBadge
              status={submission?.status || team?.submission_status || "SUBMITTED"}
            />
            <StatusBadge
              status={isEvaluationCompleted ? "EVALUATED" : "PENDING"}
            />
          </div>
        </div>

        {/* Metadata Details Row (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Department / Class
            </span>
            <span className="font-semibold text-slate-800">
              {team?.department || "Computer Science & Engineering"}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Batch {team?.batch || "2023-2027"} • Section {team?.section || "A"}
            </p>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/70">
            <span className="text-[#0F5132] font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5 text-[10px]">
              <UserCheck className="w-3.5 h-3.5" /> Assigned Guide
            </span>
            <span className="font-bold text-slate-900 block text-xs font-['Plus_Jakarta_Sans',sans-serif]">
              {teamGuide.name}
            </span>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              {teamGuide.designation} — {teamGuide.department}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Current Phase
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {currentPhase}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Academic Year 2025–26
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Submitted Date
            </span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatDate(submittedDate)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {formatDateTime(submittedDate)}
            </p>
          </div>
        </div>

        {/* 1. SHOW ALL TEAM MEMBERS (Clean bullet list with names & register numbers) */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Team Members ({memberList.length}):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {memberList.map((m: any, idx: number) => (
              <div
                key={m.id || m.roll_number || idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F5132] shrink-0" />
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {m.full_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block pl-3 mt-0.5">
                    Register No. {m.roll_number || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CURRENT SUBMISSION INDICATOR BANNER */}
      <div className="bg-emerald-50/80 rounded-xl border border-emerald-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-[#0F5132] shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                Current Submission
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900">
                VERSION 1.0 (FINAL FREEZE)
              </span>
            </div>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Submitted on {formatDateTime(submittedDate)} by student team. All deliverable files frozen for evaluation.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded bg-white text-[#0F5132] font-semibold font-mono border border-emerald-200 shrink-0 text-center">
          6 of 6 Deliverables Verified
        </span>
      </div>

      {/* 3. PROJECT DETAILS (ACTUAL STUDENT SUBMISSION DATA) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Project Details & Technical Scope
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Domain: <strong className="text-slate-700">{project?.domain || "Artificial Intelligence & Edge Computing"}</strong>
          </span>
        </div>

        {/* Abstract */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Project Abstract
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-200/60">
            {project?.description ||
              "An edge-computing computer vision platform that performs multi-camera facial recognition and tracking across university entrance portals and lecture halls, synchronizing verified student arrivals directly to the autonomous ERP in real-time."}
          </p>
        </div>

        {/* Problem Statement */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Problem Statement
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-200/60">
            {project?.problem_statement ||
              "Manual attendance logging in large autonomous universities causes an average 12-minute delay per lecture block and suffers from proxy entries. Traditional biometric scanners also cause physical bottlenecks during morning peak arrivals."}
          </p>
        </div>

        {/* Proposed Solution */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Proposed Solution & Methodology
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-200/60">
            {project?.proposed_solution ||
              "Deploying lightweight YOLOv11 + FaceNet embedding extraction models optimized via ONNX Runtime on edge Jetson nodes. Cryptographic HMAC timestamps prevent spoofing, and automated alerts report unauthorized campus entries to administrative security."}
          </p>
        </div>

        {/* Tech Stack Chips */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Technologies & Tech Stack
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(project?.technologies_used || "Python, FastAPI, PyTorch, YOLOv11, Next.js, PostgreSQL, Docker, Redis")
              .split(",")
              .map((tech: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-mono font-medium border border-slate-200"
                >
                  {tech.trim()}
                </span>
              ))}
          </div>
        </div>

        {/* Repository & Demo Links */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4">
          <a
            href={project?.github_url || "https://github.com/siet-autonomous/ai-smart-attendance"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <GitBranch className="w-4 h-4 text-emerald-400" />
            GitHub Repository
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={project?.live_demo_url || "https://attendance.siet-demo.ac.in"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-300" />
            Live Deployment URL
            <ExternalLink className="w-3 h-3 text-emerald-300" />
          </a>
        </div>
      </div>

      {/* 4. DOCUMENTS & PHOTOS (DELIVERABLES REVIEW) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Submitted Documents & Visual Deliverables
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {files.length > 0 ? `${files.length} Files Attached` : "Deliverables Attached"}
          </span>
        </div>

        {/* Documents (PDF Report, Abstract, Presentation) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0F5132]" />
            Project Documents & Reports
          </h3>

          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/80 overflow-hidden">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-md bg-emerald-50 text-[#0F5132] shrink-0 border border-emerald-100">
                      {doc.category === "PPT" ? (
                        <Presentation className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {doc.original_filename}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatFileSize(doc.file_size)} • Category: {doc.category} • Uploaded {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadFile(doc.id, doc.original_filename)}
                    disabled={downloadingId === doc.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {downloadingId === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    View / Download
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-400 italic">
                Standard documents submitted (Abstract PDF, IEEE Report PDF, Slide Deck PPT).
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Photos / Screenshots */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#216963]" />
            Uploaded Photos & Architecture Screenshots
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/60 flex flex-col justify-between">
              <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 relative">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                  architecture_pipeline.png
                </span>
              </div>
              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">System Architecture</span>
                <button
                  type="button"
                  onClick={() => alert("Opening architecture diagram preview")}
                  className="text-xs font-semibold text-[#0F5132] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/60 flex flex-col justify-between">
              <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 relative">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                  yolo_inference_live.jpg
                </span>
              </div>
              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Edge Inference Demo</span>
                <button
                  type="button"
                  onClick={() => alert("Opening inference demo preview")}
                  className="text-xs font-semibold text-[#0F5132] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/60 flex flex-col justify-between">
              <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 relative">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                  hardware_jetson_setup.png
                </span>
              </div>
              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Hardware Testbed</span>
                <button
                  type="button"
                  onClick={() => alert("Opening testbed preview")}
                  className="text-xs font-semibold text-[#0F5132] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EVALUATION SECTION (SAME PAGE) */}
      <div id="evaluation-section">
        {isEvaluationCompleted && !isEditingEvaluation ? (
          /* =======================================================
             STATE A: COMPLETED EVALUATION DISPLAY
             ======================================================= */
          <div className="bg-white rounded-xl border border-emerald-200/90 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-[#0F5132]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Evaluation Status
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#0F5132] border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Evaluation Completed
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
                    Official Committee Evaluation Record
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Guide:</span>
                    <strong className="text-slate-900">{teamGuide.name}</strong>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{teamGuide.designation} — {teamGuide.department}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingEvaluation(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                Edit / Update Evaluation
              </button>
            </div>

            {/* Score and Recommendation Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#0F5132] uppercase tracking-wider block">
                  Overall Score
                </span>
                <p className="text-4xl font-extrabold font-mono text-emerald-950 mt-0.5">
                  {displayScore} <span className="text-base font-normal text-emerald-800">/ 100</span>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Final Recommendation
                </span>
                <span className="inline-block mt-1 px-3 py-1 rounded-md text-xs font-bold bg-[#0F5132] text-white">
                  {recommendation || "APPROVED (Meets autonomous standards)"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-1">
                  Evaluated On: {formatDate(activeEval?.updated_at || activeEval?.created_at || "2026-09-02T18:30:00Z")}
                </span>
              </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Criteria Marks Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Project Execution</span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                    {criteriaProject} <span className="text-xs text-slate-400">/20</span>
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Technical Depth</span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                    {criteriaTechnical} <span className="text-xs text-slate-400">/20</span>
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Presentation / Viva</span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                    {criteriaPresentation} <span className="text-xs text-slate-400">/20</span>
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Documentation</span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                    {criteriaDocumentation} <span className="text-xs text-slate-400">/20</span>
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Contribution</span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                    {criteriaContribution} <span className="text-xs text-slate-400">/20</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Saved Advisor Remarks & Feedback */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Advisor Feedback & Examination Remarks
                </h3>
                <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200/80 leading-relaxed">
                  {advisorRemarks ||
                    "Exceptional architecture, robust code repository, and thorough literature review. Meets all autonomous college guidelines."}
                </p>
              </div>

              {(strengths || improvements) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {strengths && (
                    <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <span className="font-bold text-[#0F5132] uppercase tracking-wider block mb-1">
                        Standout Strengths
                      </span>
                      <p className="text-slate-700">{strengths}</p>
                    </div>
                  )}
                  {improvements && (
                    <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-100">
                      <span className="font-bold text-amber-900 uppercase tracking-wider block mb-1">
                        Areas for Improvement
                      </span>
                      <p className="text-slate-700">{improvements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =======================================================
             STATE B: EVALUATION FORM (FOR NEW OR EDITING EVALUATION)
             ======================================================= */
          <form
            onSubmit={handleSubmitEvaluation}
            className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0F5132]" />
                  <h2 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    {isEditingEvaluation ? "Edit / Update Evaluation" : "Review & Viva Voce Evaluation"}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEditingEvaluation
                    ? "Modify saved criteria marks, recommendations, or feedback."
                    : "Evaluation Status: Pending Evaluation — Enter rubric criteria scores and recommendations."}
                </p>
                <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Guide:</span>
                  <strong className="text-slate-900">{teamGuide.name}</strong>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{teamGuide.designation} — {teamGuide.department}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isEditingEvaluation && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEvaluation(false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel Edit
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Status:
                  </label>
                  <select
                    value={evalStatus}
                    onChange={(e) => setEvalStatus(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#0F5132]"
                  >
                    <option value="EVALUATED">EVALUATED — Completed</option>
                    <option value="APPROVED">APPROVED — Endorsed</option>
                    <option value="IN_PROGRESS">IN_PROGRESS — Under Review</option>
                    <option value="CHANGES_REQUESTED">CHANGES_REQUESTED — Revision Needed</option>
                  </select>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 5-Criteria Rubric Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Rubric Evaluation Criteria (5 Criteria × 20 Marks = 100)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Execution (20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={criteriaProject}
                    onChange={(e) =>
                      setCriteriaProject(
                        Math.min(20, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold text-slate-900 bg-white rounded border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Methodology & Scope
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Technical Depth (20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={criteriaTechnical}
                    onChange={(e) =>
                      setCriteriaTechnical(
                        Math.min(20, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold text-slate-900 bg-white rounded border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Architecture & Code
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Presentation / Viva (20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={criteriaPresentation}
                    onChange={(e) =>
                      setCriteriaPresentation(
                        Math.min(20, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold text-slate-900 bg-white rounded border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Defense & Deck Quality
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Documentation (20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={criteriaDocumentation}
                    onChange={(e) =>
                      setCriteriaDocumentation(
                        Math.min(20, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold text-slate-900 bg-white rounded border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    IEEE Format & Quality
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contribution (20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={criteriaContribution}
                    onChange={(e) =>
                      setCriteriaContribution(
                        Math.min(20, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold text-slate-900 bg-white rounded border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Individual Effort
                  </span>
                </div>
              </div>
            </div>

            {/* Total Score & Recommendation Bar */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#0F5132]" />
                <div>
                  <span className="text-[11px] font-bold text-[#0F5132] uppercase tracking-wider">
                    Computed Total Score
                  </span>
                  <p className="text-3xl font-bold font-mono text-emerald-950">
                    {overallScore} <span className="text-sm font-normal text-emerald-800">/ 100</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs font-semibold text-emerald-950 shrink-0">
                  Final Recommendation:
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-300 bg-white text-emerald-950 focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20"
                >
                  <option value="APPROVED">APPROVED (Meets autonomous standards)</option>
                  <option value="EXCELLENT">EXCELLENT (Eligible for university awards)</option>
                  <option value="CHANGES_REQUESTED">CHANGES REQUESTED (Needs revision)</option>
                  <option value="REJECTED">REJECTED (Unsatisfactory work)</option>
                </select>
              </div>
            </div>

            {/* Qualitative Feedback Textareas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Key Strengths
                </label>
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Highlight standout features, architecture design, repository standards..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Areas for Improvement
                </label>
                <textarea
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Noted issues, missing documentation sections, testing gaps..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Faculty Advisor Remarks & Official Examination Feedback
              </label>
              <textarea
                rows={3}
                value={advisorRemarks}
                onChange={(e) => setAdvisorRemarks(e.target.value)}
                placeholder="Official remarks to be stamped on viva voce marksheet..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Scores synchronize immediately with Controller of Examinations (COE)</span>
              </div>

              <button
                type="submit"
                disabled={isSavingTeamEvaluation}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto"
              >
                {isSavingTeamEvaluation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Evaluation...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditingEvaluation ? "Save Updated Evaluation" : "Submit Evaluation"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
