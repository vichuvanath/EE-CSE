import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  GitBranch,
  Globe,
  FileText,
  Presentation,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Award,
  Save,
  Users,
  FolderGit2,
  Calendar,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Edit3,
} from "lucide-react";
import {
  useAdvisorTeam,
  useAdvisorTeamEvaluation,
  useSaveTeamEvaluation,
} from "@/hooks/use-advisor";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { TeamEvaluationCriteriaScores } from "@/types";
import { toast } from "sonner";

export function AdvisorTeamSubmissionReviewPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const { data: team, isLoading: isTeamLoading } = useAdvisorTeam(teamId || "");
  const { data: existingEval, isLoading: isEvalLoading } = useAdvisorTeamEvaluation(teamId || "");
  const saveEvaluationMutation = useSaveTeamEvaluation();

  // Rubric Scores State (5 criteria, 0 to 20 each, step 0.5)
  const [projectExecution, setProjectExecution] = useState<number>(18.5);
  const [technicalDepth, setTechnicalDepth] = useState<number>(18.5);
  const [presentationViva, setPresentationViva] = useState<number>(18.5);
  const [documentation, setDocumentation] = useState<number>(18.0);
  const [contribution, setContribution] = useState<number>(18.5);

  const [evaluationStatus, setEvaluationStatus] = useState<
    "EVALUATED" | "APPROVED" | "IN_PROGRESS" | "CHANGES_REQUESTED"
  >("EVALUATED");
  const [recommendation, setRecommendation] = useState<
    "APPROVED" | "EXCELLENT" | "CHANGES_REQUESTED" | "REJECTED"
  >("APPROVED");
  const [strengths, setStrengths] = useState<string>(
    "Robust TensorRT integration on edge hardware. Exceptional real-time inference latency under 12ms."
  );
  const [areasForImprovement, setAreasForImprovement] = useState<string>(
    "Expand false positive verification dataset across varying low-light classroom conditions."
  );
  const [remarks, setRemarks] = useState<string>(
    "Outstanding progress and systematic execution. Architecture diagrams and IEEE formatting adhered to strictly."
  );

  // Editing mode toggle for completed evaluation
  const [isEditing, setIsEditing] = useState(false);

  // Sync with existing evaluation when loaded
  useEffect(() => {
    if (existingEval) {
      const scores = existingEval.scores || existingEval.criteria_scores;
      if (scores) {
        setProjectExecution(scores.project_execution ?? scores.problem_formulation ?? 18);
        setTechnicalDepth(scores.technical_depth ?? scores.methodology_design ?? 18);
        setPresentationViva(scores.presentation_viva ?? scores.presentation_defense ?? 18);
        setDocumentation(scores.documentation ?? scores.report_documentation ?? 18);
        setContribution(scores.contribution ?? scores.implementation_progress ?? 18);
      }
      if (existingEval.verdict) {
        setRecommendation((existingEval.verdict as any) || "APPROVED");
      }
      if (existingEval.remarks) {
        setRemarks(existingEval.remarks);
      }
      if (existingEval.strengths) {
        setStrengths(existingEval.strengths);
      }
      if (existingEval.areas_for_improvement) {
        setAreasForImprovement(existingEval.areas_for_improvement);
      }
      if (existingEval.status) {
        setEvaluationStatus(existingEval.status);
      }
    } else if (team && team.marks_awarded !== undefined && team.marks_awarded > 0) {
      const perCriterion = Math.round((team.marks_awarded / 5) * 2) / 2;
      setProjectExecution(perCriterion);
      setTechnicalDepth(perCriterion);
      setPresentationViva(perCriterion);
      setDocumentation(perCriterion);
      setContribution(team.marks_awarded - 4 * perCriterion);
      if (team.evaluation_remarks) {
        setRemarks(team.evaluation_remarks);
      }
    }
  }, [existingEval, team]);

  // Compute total score dynamically
  const totalScore = useMemo(() => {
    return (
      (projectExecution || 0) +
      (technicalDepth || 0) +
      (presentationViva || 0) +
      (documentation || 0) +
      (contribution || 0)
    );
  }, [projectExecution, technicalDepth, presentationViva, documentation, contribution]);

  const handleScoreChange = (setter: React.Dispatch<React.SetStateAction<number>>, val: number) => {
    const clamped = Math.max(0, Math.min(20, isNaN(val) ? 0 : val));
    setter(clamped);
  };

  const isCompleted =
    (team?.evaluation_status === "COMPLETED" ||
      team?.evaluation_status === "EVALUATED" ||
      Boolean(existingEval?.total_score || existingEval?.team_score)) &&
    !isEditing;

  const handleCommitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    try {
      await saveEvaluationMutation.mutateAsync({
        teamId,
        payload: {
          scores: {
            problem_formulation: projectExecution,
            methodology_design: technicalDepth,
            implementation_progress: contribution,
            presentation_defense: presentationViva,
            report_documentation: documentation,
            project_execution: projectExecution,
            technical_depth: technicalDepth,
            presentation_viva: presentationViva,
            documentation,
            contribution,
          },
          team_score: totalScore,
          team_remarks: remarks,
          verdict:
            recommendation === "CHANGES_REQUESTED"
              ? "REVISION_REQUIRED"
              : recommendation === "REJECTED"
              ? "REJECTED"
              : "APPROVED",
          recommendation_status: recommendation as any,
          status: evaluationStatus,
          strengths,
          areas_for_improvement: areasForImprovement,
          remarks,
        },
      });
      setIsEditing(false);
    } catch (err) {
      // Handled by hook toast
    }
  };

  if (isTeamLoading || isEvalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Team Workspace...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Team Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested team cohort could not be located.</p>
        <Link
          to="/advisor/teams"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0F5132] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Evaluation</span>
        </Link>
      </div>
    );
  }

  const teamIdentifier = team.id || team.team_id || "team-001";
  const sub = team.submission_detail;
  const project = team.project;
  const members = team.members || [];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Breadcrumb Back Navigation */}
      <div>
        <Link
          to="/advisor/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F5132] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evaluation</span>
        </Link>
      </div>

      {/* 2. Section 1: Team Information Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] tracking-wider uppercase border border-emerald-200">
                TEAM
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {teamIdentifier}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  team.submission_status === "SUBMITTED" || team.submission_status === "APPROVED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {team.submission_status || "SUBMITTED"}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {team.evaluation_status === "COMPLETED" || team.evaluation_status === "EVALUATED"
                  ? "EVALUATED"
                  : "PENDING"}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {team.name}
            </h1>
            <p className="text-sm font-bold text-slate-700">
              {team.project_title}
            </p>
          </div>
        </div>

        {/* 4-Box Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Department / Class
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              {team.department || "Computer Science & Engineering"}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Batch {team.batch || "2023-2027"} • {team.section || "Section A"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Assigned Guide
            </span>
            <div className="mt-1">
              <TeamGuideBadge guide={team.guide} variant="table-cell" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Phase
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
              {team.current_phase || "Phase II / Final Review"}
            </span>
            <span className="text-[11px] text-emerald-800 mt-0.5 block font-medium">
              Milestone Active
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Submitted Date &amp; Time
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
              {team.submission_date || "Sep 2, 2026, 09:30 PM"}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              On-Time Freeze
            </span>
          </div>
        </div>

        {/* Team Members Roster: 4-Column Card Grid (No Leader Designation) */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
            Enrolled Team Members ({members.length} Candidates)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {members.map((member, idx) => (
              <div
                key={member.id || idx}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1"
              >
                <div className="font-bold text-slate-900 text-xs truncate">
                  {member.full_name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Register No. {member.roll_number}
                </div>
                {member.email && (
                  <div className="text-[10px] text-slate-400 truncate">
                    {member.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Section 2: Current Submission Indicator Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-100 text-[#0F5132] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">
                Official Submission Locked
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-200/70 text-emerald-900">
                VERSION 1.0 (FINAL FREEZE)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Deliverables are permanently locked and queued for Faculty Advisor &amp; PRC viva scoring.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Section 3: Project Details & Technical Scope Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Project Details &amp; Technical Scope
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Artificial Intelligence &amp; Edge Computing
          </span>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div>
            <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[11px]">
              Project Abstract
            </span>
            <p className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
              {project?.abstract ||
                "This project proposes an Edge-Accelerated Computer Vision framework deployed onto NVIDIA Jetson Orin Nano modules. Utilizing automated face identification and spatial clustering algorithms, the system processes multi-camera RTSP video feeds simultaneously, eliminating traditional roll-call delays."}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[11px]">
              Problem Statement
            </span>
            <p className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
              {project?.problem_statement ||
                "Conventional manual attendance tracking in institutional lecture halls incurs 12–15% instructional time loss, suffers from proxy manipulation, and lacks real-time verification against campus academic management ERP systems."}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[11px]">
              Proposed Solution &amp; Methodology
            </span>
            <p className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
              {project?.description ||
                "By optimizing YOLOv11 detectors with INT8 TensorRT precision quantization, the framework attains 28 FPS inference on embedded hardware. Verified attendances are cryptographically batched and securely synced via REST APIs to the central autonomous portal."}
            </p>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Identified Technologies &amp; Frameworks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Python 3.11",
              "FastAPI",
              "PyTorch",
              "YOLOv11",
              "TensorRT",
              "NVIDIA Jetson",
              "PostgreSQL",
              "Docker",
              "Next.js",
              "Redis",
            ].map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Links Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <a
            href={sub?.github_url || project?.github_url || "https://github.com/siet-autonomous/ai-smart-attendance"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>

          <a
            href={sub?.live_demo_url || project?.live_demo_url || "https://demo.siet.ac.in/edge-vision"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Deployment URL</span>
          </a>
        </div>
      </div>

      {/* 5. Section 4: Submitted Documents & Visual Deliverables */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Submitted Documents &amp; Visual Deliverables
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Phase II Review Deliverables
          </span>
        </div>

        {/* Document Items List */}
        <div className="space-y-2.5">
          {[
            {
              name: "TeamAlpha_Milestone_Review2_Comprehensive_Report.pdf",
              category: "REPORT",
              size: "3.4 MB",
              date: "02 Sep 2026",
            },
            {
              name: "Phase_II_Architecture_and_Inference_Deck.pptx",
              category: "PPT",
              size: "6.2 MB",
              date: "02 Sep 2026",
            },
          ].map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0F5132] shadow-2xs">
                  {file.category === "REPORT" ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Presentation className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {file.size} • Uploaded {file.date}
                  </span>
                </div>
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Downloading file deliverable...");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-[#0F5132] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shrink-0 ml-3"
              >
                View / Download
              </a>
            </div>
          ))}
        </div>

        {/* Photos & Screenshots Grid */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Architecture Schematics &amp; Hardware Snapshots
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "architecture_pipeline.png", label: "Pipeline Schematic" },
              { title: "yolo_inference_live.jpg", label: "Live Inference FPS" },
              { title: "hardware_jetson_setup.png", label: "Jetson Hardware Bed" },
            ].map((img, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2"
              >
                <div className="h-24 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {img.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Section 5: Evaluation Section (Dual State on Same Page) */}
      {isCompleted ? (
        /* STATE A: Completed Evaluation View */
        <div className="p-6 rounded-2xl bg-white border-2 border-emerald-600/40 shadow-sm space-y-5 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Evaluation Completed
                </span>
                <span className="text-xs text-slate-400">
                  PRC Review 2 Official Marksheet
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evaluated by Dr. K. Senthil Kumar • Department of CSE
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit / Update Evaluation</span>
            </button>
          </div>

          {/* Overall Score Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Awarded Mark
              </span>
              <div className="text-3xl font-black font-mono text-[#0F5132] mt-0.5">
                {totalScore} / 100
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Final Recommendation
              </span>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                {recommendation}
              </span>
            </div>
          </div>

          {/* 5-Criteria Marks Breakdown Grid */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Criteria Marks Breakdown (/20 Each)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Project Execution
                </span>
                <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                  {projectExecution} / 20
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Technical Depth
                </span>
                <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                  {technicalDepth} / 20
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Presentation / Viva
                </span>
                <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                  {presentationViva} / 20
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Documentation
                </span>
                <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                  {documentation} / 20
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Contribution
                </span>
                <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                  {contribution} / 20
                </span>
              </div>
            </div>
          </div>

          {/* Feedback & Remarks */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">
                Faculty Advisor Remarks &amp; Feedback:
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{remarks}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                <span className="font-bold text-emerald-950 block mb-1">
                  Standout Strengths:
                </span>
                <p className="text-emerald-900 text-[11px] leading-relaxed">
                  {strengths}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <span className="font-bold text-amber-950 block mb-1">
                  Areas for Improvement:
                </span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  {areasForImprovement}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE B: Evaluation Form (Pending or Editing) */
        <form
          onSubmit={handleCommitEvaluation}
          className="p-6 rounded-2xl bg-white border-2 border-emerald-600/40 shadow-md space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0F5132]" />
                <h2 className="text-base font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Official PRC Evaluation Form
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Input numeric rubric criteria scores (max 20 each) and examination feedback.
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Cancel Editing
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="max-w-xs space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Evaluation Status
            </label>
            <select
              value={evaluationStatus}
              onChange={(e) => setEvaluationStatus(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition text-slate-800 font-semibold"
            >
              <option value="EVALUATED">EVALUATED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CHANGES_REQUESTED">CHANGES_REQUESTED</option>
            </select>
          </div>

          {/* 5-Criteria Numeric Inputs */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              5-Criteria Rubric Scoring (20 Marks Each = Total 100)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Project Execution
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={projectExecution}
                  onChange={(e) =>
                    handleScoreChange(setProjectExecution, parseFloat(e.target.value))
                  }
                  className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block text-center">Max 20.0</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Technical Depth
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={technicalDepth}
                  onChange={(e) =>
                    handleScoreChange(setTechnicalDepth, parseFloat(e.target.value))
                  }
                  className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block text-center">Max 20.0</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Presentation / Viva
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={presentationViva}
                  onChange={(e) =>
                    handleScoreChange(setPresentationViva, parseFloat(e.target.value))
                  }
                  className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block text-center">Max 20.0</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Documentation
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={documentation}
                  onChange={(e) =>
                    handleScoreChange(setDocumentation, parseFloat(e.target.value))
                  }
                  className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block text-center">Max 20.0</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Contribution
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={contribution}
                  onChange={(e) =>
                    handleScoreChange(setContribution, parseFloat(e.target.value))
                  }
                  className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block text-center">Max 20.0</span>
              </div>
            </div>
          </div>

          {/* Computed Total Score Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Computed Total Score
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Auto-calculated sum of the 5 criteria
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-[#0F5132]">
              {totalScore} / 100
            </div>
          </div>

          {/* Final Recommendation Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Final Recommendation
            </label>
            <select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value as any)}
              className="w-full max-w-sm py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition text-slate-800 font-bold"
            >
              <option value="APPROVED">APPROVED</option>
              <option value="EXCELLENT">EXCELLENT</option>
              <option value="CHANGES_REQUESTED">CHANGES REQUESTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* Textareas */}
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Key Strengths
              </label>
              <textarea
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Highlight candidate technical mastery, prototype quality, and standout implementations..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Areas for Improvement
              </label>
              <textarea
                rows={3}
                value={areasForImprovement}
                onChange={(e) => setAreasForImprovement(e.target.value)}
                placeholder="Specify design gaps, documentation corrections, or additional benchmarking requirements..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Faculty Advisor Remarks &amp; Official Examination Feedback
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Official committee remarks recorded on examination archives..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Marks will synchronize directly with the Controller of Examinations and candidate dashboards.
            </span>

            <button
              type="submit"
              disabled={saveEvaluationMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {saveEvaluationMutation.isPending
                  ? "Saving Evaluation..."
                  : isEditing
                  ? "Save Updated Evaluation"
                  : "Submit Evaluation"}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdvisorTeamSubmissionReviewPage;
