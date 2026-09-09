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
  Download,
} from "lucide-react";
import {
  useAdvisorTeam,
  useAdvisorTeamProject,
  useAdvisorTeamEvaluation,
  useAdvisorTeamSubmission,
  useAdvisorTeamSubmissions,
  useSaveTeamEvaluation,
  useEvaluateSubmission,
} from "@/hooks/use-advisor";
import { TeamGuideBadge } from "@/components/advisor/TeamGuideBadge";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export function AdvisorTeamSubmissionReviewPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const { data: team, isLoading: isTeamLoading } = useAdvisorTeam(teamId || "");
  const { data: teamProject, isLoading: isProjectLoading } = useAdvisorTeamProject(teamId || "");
  const { data: submission, isLoading: isSubmissionLoading } = useAdvisorTeamSubmission(teamId || "");
  const { data: teamSubmissions = [] } = useAdvisorTeamSubmissions(teamId || "");
  const { data: existingEval, isLoading: isEvalLoading } = useAdvisorTeamEvaluation(teamId || "");

  const saveEvaluationMutation = useSaveTeamEvaluation();
  const evaluateSubmissionMutation = useEvaluateSubmission();

  const [fallbackFiles, setFallbackFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Rubric Scores State (5 criteria, 0 to 20 each, step 0.5)
  const [projectExecution, setProjectExecution] = useState<number>(0);
  const [technicalDepth, setTechnicalDepth] = useState<number>(0);
  const [presentationViva, setPresentationViva] = useState<number>(0);
  const [documentation, setDocumentation] = useState<number>(0);
  const [contribution, setContribution] = useState<number>(0);

  const [evaluationStatus, setEvaluationStatus] = useState<
    "EVALUATED" | "APPROVED" | "IN_PROGRESS" | "CHANGES_REQUESTED"
  >("IN_PROGRESS");
  const [recommendation, setRecommendation] = useState<
    "APPROVED" | "EXCELLENT" | "CHANGES_REQUESTED" | "REJECTED"
  >("APPROVED");
  const [strengths, setStrengths] = useState<string>("");
  const [areasForImprovement, setAreasForImprovement] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [isEditing, setIsEditing] = useState(false);

  // Fetch files if not already in submission object
  useEffect(() => {
    if (!teamId || (submission?.files && submission.files.length > 0)) return;
    setFilesLoading(true);
    const fetchFiles = async () => {
      try {
        const res = await apiClient.get<any>(`/api/v1/advisors/submissions`);
        const allSubs = Array.isArray(res?.data) ? res.data : [];
        const teamSub = allSubs.find((s: any) => s.team_id === teamId);
        if (teamSub?.id) {
          const filesRes = await apiClient.get<any>(`/api/v1/advisors/submissions/${teamSub.id}/files`);
          setFallbackFiles(Array.isArray(filesRes?.data) ? filesRes.data : []);
        } else {
          setFallbackFiles([]);
        }
      } catch {
        setFallbackFiles([]);
      } finally {
        setFilesLoading(false);
      }
    };
    fetchFiles();
  }, [teamId, submission]);

  useEffect(() => {
    // 1. Prioritize evaluation on the latest submission
    if (submission?.evaluation) {
      const subEval = submission.evaluation;
      if (subEval.feedback) setRemarks(subEval.feedback);
      if (subEval.scores && subEval.scores.length > 0) {
        for (const sc of subEval.scores) {
          const crit = (sc.rubric_criterion || "").toLowerCase();
          if (crit.includes("execution")) setProjectExecution(sc.score);
          else if (crit.includes("depth") || crit.includes("method")) setTechnicalDepth(sc.score);
          else if (crit.includes("presentation") || crit.includes("viva")) setPresentationViva(sc.score);
          else if (crit.includes("documentation") || crit.includes("report")) setDocumentation(sc.score);
          else if (crit.includes("contribution") || crit.includes("progress")) setContribution(sc.score);
        }
      } else if (subEval.total_score !== null && subEval.total_score !== undefined) {
        const perCriterion = Math.round((subEval.total_score / 5) * 2) / 2;
        setProjectExecution(perCriterion);
        setTechnicalDepth(perCriterion);
        setPresentationViva(perCriterion);
        setDocumentation(perCriterion);
        setContribution(subEval.total_score - 4 * perCriterion);
      }
      setEvaluationStatus("EVALUATED");
    } else if (existingEval) {
      // 2. Fall back to team-level evaluation if present
      const scores = existingEval.scores || existingEval.criteria_scores;
      if (scores) {
        setProjectExecution(scores.project_execution ?? scores.problem_formulation ?? 0);
        setTechnicalDepth(scores.technical_depth ?? scores.methodology_design ?? 0);
        setPresentationViva(scores.presentation_viva ?? scores.presentation_defense ?? 0);
        setDocumentation(scores.documentation ?? scores.report_documentation ?? 0);
        setContribution(scores.contribution ?? scores.implementation_progress ?? 0);
      }
      if (existingEval.verdict) {
        setRecommendation((existingEval.verdict as any) || "APPROVED");
      }
      if (existingEval.remarks || existingEval.team_remarks) {
        setRemarks(existingEval.remarks || existingEval.team_remarks || "");
      }
      if (existingEval.strengths) {
        setStrengths(existingEval.strengths);
      }
      if (existingEval.areas_for_improvement) {
        setAreasForImprovement(existingEval.areas_for_improvement);
      }
      if (existingEval.status) {
        setEvaluationStatus(existingEval.status as any);
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
  }, [existingEval, team, submission]);

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
      submission?.status === "evaluated" ||
      Boolean(submission?.evaluation) ||
      Boolean(existingEval?.total_score || existingEval?.team_score)) &&
    !isEditing;

  const handleCommitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    try {
      // 1. Evaluate against the specific submission if present
      if (submission?.id) {
        await evaluateSubmissionMutation.mutateAsync({
          submissionId: submission.id,
          payload: {
            feedback: remarks || strengths || "Evaluated by Faculty Advisor",
            total_score: totalScore,
            scores: [
              { rubric_criterion: "Project Execution", max_score: 20, score: projectExecution },
              { rubric_criterion: "Technical Depth", max_score: 20, score: technicalDepth },
              { rubric_criterion: "Presentation / Viva", max_score: 20, score: presentationViva },
              { rubric_criterion: "Documentation", max_score: 20, score: documentation },
              { rubric_criterion: "Contribution", max_score: 20, score: contribution },
            ],
          },
        });
      }

      // 2. Also save team evaluation for institutional committee records
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

  if (isTeamLoading || isEvalLoading || isSubmissionLoading) {
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
          to="/advisor/evaluations"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0F5132] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Evaluation</span>
        </Link>
      </div>
    );
  }

  const teamIdentifier = team.id || team.team_id || "team-001";
  const activeSubmission = submission || team.submission_detail;
  const project = activeSubmission?.project || teamProject || team.project;
  const members = team.members || [];
  const hasSubmission = Boolean(activeSubmission);
  const activeFiles =
    activeSubmission?.files && activeSubmission.files.length > 0
      ? activeSubmission.files
      : fallbackFiles;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Breadcrumb Back Navigation */}
      <div>
        <Link
          to="/advisor/evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F5132] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evaluation</span>
        </Link>
      </div>

      {/* 2. Team Information Header */}
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
                  (activeSubmission?.status || team.submission_status)?.toUpperCase() === "SUBMITTED" ||
                  (activeSubmission?.status || team.submission_status)?.toUpperCase() === "EVALUATED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {(activeSubmission?.status || team.submission_status || "NOT SUBMITTED").toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSubmission?.status === "evaluated" ||
                  team.evaluation_status === "COMPLETED" ||
                  team.evaluation_status === "EVALUATED" ||
                  Boolean(activeSubmission?.evaluation)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {activeSubmission?.status === "evaluated" ||
                team.evaluation_status === "COMPLETED" ||
                team.evaluation_status === "EVALUATED" ||
                Boolean(activeSubmission?.evaluation)
                  ? "EVALUATED"
                  : "PENDING"}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {team.name}
            </h1>
            <p className="text-sm font-bold text-slate-700">
              {project?.title || team.project_title}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to={`/advisor/teams/${teamIdentifier}/evaluation`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F5132] hover:bg-[#0b3c25] text-white text-xs font-bold transition shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span>Full Viva Evaluation Rubric</span>
            </Link>
          </div>
        </div>

        {/* 4-Box Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Department / Class
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              {team.department || "—"}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Batch {team.batch || "—"} • {team.section || "—"}
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
              Current Phase / Type
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
              {activeSubmission?.submission_type || team.current_phase || "Phase II"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Submitted Date &amp; Time
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
              {activeSubmission?.created_at
                ? new Date(activeSubmission.created_at).toLocaleString()
                : team.submission_date || "—"}
            </span>
          </div>
        </div>

        {/* Team Members Roster */}
        {members.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Enrolled Team Members ({members.length} Candidates)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {members.map((member: any, idx: number) => (
                <div
                  key={member.id || idx}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1"
                >
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {member.full_name || "—"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {member.roll_number || "—"}
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
        )}
      </div>

      {/* 3. Submission Status Banner */}
      {hasSubmission ? (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-100 text-[#0F5132] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-950">
                  {activeSubmission?.title || "Project Submission Deliverable"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-200/70 text-emerald-900">
                  {(activeSubmission?.status || "SUBMITTED").toUpperCase()}
                </span>
                {activeSubmission?.submission_type && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {activeSubmission.submission_type}
                  </span>
                )}
                {activeSubmission?.submitter_name && (
                  <span className="text-[11px] text-emerald-800 font-medium">
                    • Submitted by {activeSubmission.submitter_name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                {activeSubmission?.description || "Deliverables are submitted, archived, and queued for faculty review and evaluation."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center gap-4">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-900">No Submission Yet</span>
            <p className="text-[11px] text-amber-700 mt-0.5">
              This team has not submitted their project deliverables yet.
            </p>
          </div>
        </div>
      )}

      {/* 4. Project Details & Technical Scope */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Project Details &amp; Technical Scope
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
            Submitted &amp; Locked
          </span>
        </div>

        <div className="space-y-4">
          {/* Section 1: Core Identification & Scope */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">
              Core Identification &amp; Scope
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                  Official Project Title
                </label>
                <p className="text-sm font-medium text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200">
                  {project?.title || "—"}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                  Academic Domain
                </label>
                <p className="text-sm font-medium text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200">
                  {project?.domain || "—"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                Problem Statement
              </label>
              <p className="text-sm text-slate-700 px-3 py-2 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                {project?.problem_statement || "—"}
              </p>
            </div>
          </div>

          {/* Section 2: Technical Abstract & Proposed Solution */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">
              Technical Abstract &amp; Proposed Solution
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                Project Overview / Abstract Description
              </label>
              <p className="text-sm text-slate-700 px-3 py-2 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                {project?.description || "—"}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                Proposed Solution &amp; Innovation
              </label>
              <p className="text-sm text-slate-700 px-3 py-2 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                {project?.proposed_solution || "—"}
              </p>
            </div>
          </div>

          {/* Section 3: Technical Stack & Deliverable URLs */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">
              Technical Stack &amp; Deliverable URLs
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" />
                Technologies Used
              </label>
              <p className="text-sm font-mono text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200">
                {project?.technologies_used || "—"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  GitHub Repository URL
                </label>
                <p className="text-sm font-mono text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200 break-all">
                  {project?.github_url || "—"}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  Live Demo / Deployment URL
                </label>
                <p className="text-sm font-mono text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200 break-all">
                  {project?.live_demo_url || "—"}
                </p>
              </div>
            </div>
            {/* Link buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project?.github_url ? (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              ) : null}
              {project?.live_demo_url ? (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Deployment URL</span>
                </a>
              ) : null}
              {!project?.github_url && !project?.live_demo_url && (
                <span className="text-xs text-slate-400 italic">No project links provided.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Submitted Documents */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Submitted Documents
            </h2>
          </div>
        </div>

        {filesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeFiles.length > 0 ? (
          <div className="space-y-2.5">
            {activeFiles.map((file: any, idx: number) => (
              <div
                key={file.id || idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0F5132] shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {file.file_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                      {file.category ? ` • ${file.category}` : ""}
                      {file.created_at ? ` • ${new Date(file.created_at).toLocaleDateString()}` : ""}
                    </span>
                  </div>
                </div>
                {file.download_url && (
                  <a
                    href={file.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / View</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No submission files found for this team.
          </div>
        )}
      </div>

      {/* Submission Versions History */}
      {teamSubmissions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F5132]" />
              <h2 className="text-sm font-bold text-slate-900">
                All Submission Versions ({teamSubmissions.length})
              </h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {teamSubmissions.map((s: any, sIdx: number) => (
              <div key={s.id || sIdx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {s.title || `Submission #${teamSubmissions.length - sIdx}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {(s.status || "SUBMITTED").toUpperCase()}
                    </span>
                    {s.submission_type && (
                      <span className="text-[10px] font-mono text-slate-500">
                        ({s.submission_type})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {s.created_at ? new Date(s.created_at).toLocaleString() : ""}
                    {s.submitter_name ? ` • by ${s.submitter_name}` : ""}
                    {s.evaluation ? ` • Scored ${s.evaluation.total_score}/100` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    {(s.files || []).length} file(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Evaluation Section */}
      {isCompleted ? (
        /* STATE A: Completed Evaluation View */
        <div className="p-6 rounded-2xl bg-white border-2 border-emerald-600/40 shadow-sm space-y-5 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Evaluation Completed
                </span>
              </div>
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
              {[
                { label: "Project Execution", value: projectExecution },
                { label: "Technical Depth", value: technicalDepth },
                { label: "Presentation / Viva", value: presentationViva },
                { label: "Documentation", value: documentation },
                { label: "Contribution", value: contribution },
              ].map((c) => (
                <div key={c.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {c.label}
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                    {c.value} / 20
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Remarks */}
          <div className="space-y-3 pt-2 text-xs">
            {remarks && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Faculty Advisor Remarks &amp; Feedback:
                </span>
                <p className="text-slate-700 leading-relaxed italic">
                  "{remarks}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {strengths && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                  <span className="font-bold text-emerald-950 block mb-1">
                    Standout Strengths:
                  </span>
                  <p className="text-emerald-900 text-[11px] leading-relaxed">
                    {strengths}
                  </p>
                </div>
              )}

              {areasForImprovement && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                  <span className="font-bold text-amber-950 block mb-1">
                    Areas for Improvement:
                  </span>
                  <p className="text-amber-900 text-[11px] leading-relaxed">
                    {areasForImprovement}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* STATE B: Evaluation Form */
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
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="EVALUATED">EVALUATED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="CHANGES_REQUESTED">CHANGES_REQUESTED</option>
            </select>
          </div>

          {/* 5-Criteria Numeric Inputs */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              5-Criteria Rubric Scoring (20 Marks Each = Total 100)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { label: "Project Execution", value: projectExecution, setter: setProjectExecution },
                { label: "Technical Depth", value: technicalDepth, setter: setTechnicalDepth },
                { label: "Presentation / Viva", value: presentationViva, setter: setPresentationViva },
                { label: "Documentation", value: documentation, setter: setDocumentation },
                { label: "Contribution", value: contribution, setter: setContribution },
              ].map((c) => (
                <div key={c.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {c.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={c.value}
                    onChange={(e) =>
                      handleScoreChange(c.setter, parseFloat(e.target.value))
                    }
                    className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">Max 20.0</span>
                </div>
              ))}
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
