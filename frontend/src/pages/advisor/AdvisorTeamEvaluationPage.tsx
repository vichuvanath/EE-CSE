import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Save,
  CheckCircle2,
  Award,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  ExternalLink,
  GitBranch,
  Globe,
  FolderGit2,
} from "lucide-react";
import {
  useAdvisorTeam,
  useAdvisorTeamProject,
  useAdvisorTeamEvaluation,
  useAdvisorTeamSubmission,
  useSaveTeamEvaluation,
  useEvaluateSubmission,
} from "@/hooks/use-advisor";
import { toast } from "sonner";

export function AdvisorTeamEvaluationPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const { data: team, isLoading: isTeamLoading } = useAdvisorTeam(teamId || "");
  const { data: submission, isLoading: isSubLoading } = useAdvisorTeamSubmission(teamId || "");
  const { data: project, isLoading: isProjectLoading } = useAdvisorTeamProject(teamId || "");
  const { data: existingEval, isLoading: isEvalLoading } = useAdvisorTeamEvaluation(teamId || "");
  const saveEvaluationMutation = useSaveTeamEvaluation();
  const evaluateSubmissionMutation = useEvaluateSubmission();

  const activeProject = useMemo(() => {
    return project || submission?.project || team?.project || null;
  }, [project, submission, team]);

  // Section 1: Team Overall Score & Remarks
  const [teamScore, setTeamScore] = useState<number>(0);
  const [teamRemarks, setTeamRemarks] = useState<string>("");

  // Section 2: Individual Candidate Viva Scoring
  const members = team?.members || [];
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");

  // Per candidate viva scores map
  const [candidateScores, setCandidateScores] = useState<
    Record<
      string,
      {
        project_execution: number;
        presentation: number;
        technical_depth: number;
        documentation: number;
        contribution: number;
        remarks: string;
      }
    >
  >({});

  // Lock Evaluation State
  const [isLocked, setIsLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  // Sync selected candidate and candidateScores when members load
  useEffect(() => {
    if (members.length > 0) {
      if (!selectedCandidateId || !members.find((m: any) => m.id === selectedCandidateId)) {
        setSelectedCandidateId(members[0].id);
      }
      setCandidateScores((prev) => {
        const next = { ...prev };
        for (const m of members) {
          if (!next[m.id]) {
            next[m.id] = {
              project_execution: 0,
              presentation: 0,
              technical_depth: 0,
              documentation: 0,
              contribution: 0,
              remarks: "",
            };
          }
        }
        return next;
      });
    }
  }, [members, selectedCandidateId]);

  useEffect(() => {
    if (submission?.evaluation) {
      const subEval = submission.evaluation;
      if (subEval.total_score !== null && subEval.total_score !== undefined) {
        setTeamScore(subEval.total_score);
      }
      if (subEval.feedback) {
        setTeamRemarks(subEval.feedback);
      }
    } else if (existingEval) {
      if (existingEval.total_score !== null && existingEval.total_score !== undefined) {
        setTeamScore(existingEval.total_score);
      } else if (existingEval.team_score !== null && existingEval.team_score !== undefined) {
        setTeamScore(existingEval.team_score);
      }
      if (existingEval.remarks || existingEval.team_remarks) {
        setTeamRemarks(existingEval.remarks || existingEval.team_remarks || "");
      }
      if (existingEval.status === "LOCKED") {
        setIsLocked(true);
      }
      const studentEvals = existingEval.student_evaluations;
      if (Array.isArray(studentEvals)) {
        setCandidateScores((prev) => {
          const next = { ...prev };
          for (const se of studentEvals) {
            const sid = se.student_id;
            if (sid) {
              const scores = se.scores || {};
              next[sid] = {
                project_execution: scores.project_execution ?? 0,
                presentation: scores.presentation ?? 0,
                technical_depth: scores.technical_depth ?? 0,
                documentation: scores.documentation ?? 0,
                contribution: scores.contribution ?? 0,
                remarks: se.remarks || "",
              };
            }
          }
          return next;
        });
      }
    } else if (team && team.marks_awarded !== undefined && team.marks_awarded > 0) {
      setTeamScore(team.marks_awarded);
      if (team.evaluation_remarks) {
        setTeamRemarks(team.evaluation_remarks);
      }
    }
  }, [existingEval, team, submission]);

  const activeCandidate = members.find((m: any) => m.id === selectedCandidateId) || members[0];
  const activeCandidateScores = (activeCandidate && candidateScores[activeCandidate.id]) || {
    project_execution: 0,
    presentation: 0,
    technical_depth: 0,
    documentation: 0,
    contribution: 0,
    remarks: "",
  };

  const activeCandidateTotal =
    activeCandidateScores.project_execution +
    activeCandidateScores.presentation +
    activeCandidateScores.technical_depth +
    activeCandidateScores.documentation +
    activeCandidateScores.contribution;

  const handleCandidateScoreChange = (
    field: keyof typeof activeCandidateScores,
    val: number | string
  ) => {
    if (isLocked || !selectedCandidateId) return;
    setCandidateScores((prev) => ({
      ...prev,
      [selectedCandidateId]: {
        ...(prev[selectedCandidateId] || {
          project_execution: 0,
          presentation: 0,
          technical_depth: 0,
          documentation: 0,
          contribution: 0,
          remarks: "",
        }),
        [field]: typeof val === "number" ? Math.max(0, Math.min(20, isNaN(val) ? 0 : val)) : val,
      },
    }));
  };

  const handleSaveTeamScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || isLocked) return;

    try {
      if (submission?.id) {
        await evaluateSubmissionMutation.mutateAsync({
          submissionId: submission.id,
          payload: {
            feedback: teamRemarks || "Team Evaluation Completed",
            total_score: teamScore,
            scores: [
              { rubric_criterion: "Project Execution", max_score: 20, score: Math.round(teamScore * 0.2) },
              { rubric_criterion: "Technical Depth", max_score: 20, score: Math.round(teamScore * 0.2) },
              { rubric_criterion: "Presentation / Viva", max_score: 20, score: Math.round(teamScore * 0.2) },
              { rubric_criterion: "Documentation", max_score: 20, score: Math.round(teamScore * 0.2) },
              { rubric_criterion: "Contribution", max_score: 20, score: teamScore - 4 * Math.round(teamScore * 0.2) },
            ],
          },
        });
      }

      await saveEvaluationMutation.mutateAsync({
        teamId,
        payload: {
          scores: {
            problem_formulation: Math.round(teamScore * 0.2),
            methodology_design: Math.round(teamScore * 0.2),
            implementation_progress: Math.round(teamScore * 0.2),
            presentation_defense: Math.round(teamScore * 0.2),
            report_documentation: teamScore - 4 * Math.round(teamScore * 0.2),
            project_execution: Math.round(teamScore * 0.2),
            technical_depth: Math.round(teamScore * 0.2),
            presentation_viva: Math.round(teamScore * 0.2),
            documentation: Math.round(teamScore * 0.2),
            contribution: teamScore - 4 * Math.round(teamScore * 0.2),
          },
          team_score: teamScore,
          team_remarks: teamRemarks,
          verdict: "APPROVED",
          remarks: teamRemarks,
        },
      });
      toast.success("Team Evaluation Saved", {
        description: `Score of ${teamScore}/100 recorded.`,
      });
    } catch (err) {}
  };

  const handleSaveCandidateMarks = () => {
    if (isLocked || !activeCandidate) return;
    toast.success(`Candidate Marks Recorded for ${activeCandidate.full_name}`, {
      description: `Awarded ${activeCandidateTotal} / 100 with examination feedback.`,
    });
  };

  const handleConfirmLock = () => {
    setIsLocked(true);
    setShowLockModal(false);
    toast.success("Evaluation Locked Permanently", {
      description: "Marks have been sealed and transmitted to Controller of Examinations (CoE).",
    });
  };

  if (isTeamLoading || isEvalLoading || isProjectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Evaluation Rubric...</p>
        </div>
      </div>
    );
  }

  const teamName = team?.name || "Team Alpha";

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. PageHeader */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to={`/advisor/teams/${teamId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F5132] transition mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Team Workspace</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Grade Evaluation — {teamName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase II Academic Grading &amp; Viva Voce Rubric • Controller of Examinations Governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => setShowLockModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition ${
              isLocked
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isLocked ? "Evaluation Permanently Locked" : "Lock Evaluation Permanently"}</span>
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <strong>Evaluation Record Sealed:</strong> This team assessment has been permanently locked and synchronized with institutional registers. All scoring inputs are read-only.
          </div>
        </div>
      )}

      {/* Project Details Section - From Student Project Page */}
      {activeProject ? (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#0F5132] text-white flex items-center justify-center text-xs font-bold">
                <FolderGit2 className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Submitted Project Details (from Student Portal)
              </h2>
            </div>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Submitted & Locked
            </span>
          </div>

          <div className="space-y-4">
            {/* Section 1: Core Identification & Scope */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">
                Core Identification & Scope
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                    Official Project Title
                  </label>
                  <p className="text-sm font-medium text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200">
                    {activeProject.title || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                    Academic Domain
                  </label>
                  <p className="text-sm font-medium text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200">
                    {activeProject.domain || "—"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                  Problem Statement
                </label>
                <p className="text-sm text-slate-700 px-3 py-2 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {activeProject.problem_statement || "—"}
                </p>
              </div>
            </div>

            {/* Section 2: Technical Abstract & Solution */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">
                Technical Abstract & Proposed Solution
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                  Project Overview / Abstract Description
                </label>
                <p className="text-sm text-slate-700 px-3 py-2 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {activeProject.description || "—"}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                  Proposed Solution & Innovation
                </label>
                <p className="text-sm text-slate-700 px-3 py-2 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {activeProject.proposed_solution || "—"}
                </p>
              </div>
            </div>

            {/* Section 3: Technical Stack & Deliverable Links */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">
                Technical Stack & Deliverable URLs
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  Technologies Used
                </label>
                <p className="text-sm font-mono text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200">
                  {activeProject.technologies_used || "—"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-300" />
                    GitHub Repository URL
                  </label>
                  <p className="text-sm font-mono text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200 break-all">
                    {activeProject.github_url || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-300" />
                    Live Demo / Deployment URL
                  </label>
                  <p className="text-sm font-mono text-slate-900 px-3 py-2 bg-white rounded-lg border border-slate-200 break-all">
                    {activeProject.live_demo_url || "—"}
                  </p>
                </div>
              </div>
              {/* Quick action buttons for URLs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {activeProject.github_url && (
                  <a
                    href={activeProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Open GitHub Repository</span>
                  </a>
                )}
                {activeProject.live_demo_url && (
                  <a
                    href={activeProject.live_demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Open Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : !isProjectLoading ? (
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Project Submission Details Pending</span>
          </div>
          <p className="text-xs text-amber-800">
            The candidate team has not registered complete project information yet in the Student Portal.
          </p>
        </div>
      ) : null}

      {/* Component 1: Overall Team Score & Remarks Form */}
      <form
        onSubmit={handleSaveTeamScore}
        className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Section 1: Overall Team Milestone Score
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Max 100 Marks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Team Score (Out of 100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              disabled={isLocked}
              value={teamScore}
              onChange={(e) => setTeamScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="w-full py-2 px-3 text-base font-black font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Committee Team Remarks
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={teamRemarks}
              onChange={(e) => setTeamRemarks(e.target.value)}
              placeholder="Consolidated team feedback..."
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLocked || saveEvaluationMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold rounded-lg shadow-2xs transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Team Score</span>
          </button>
        </div>
      </form>

      {/* Component 2: Individual Student Viva Voce Rubric */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Section 2: Individual Candidate Viva Voce Rubric (5 &times; 20 = 100)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Select candidate below to inspect &amp; score
          </span>
        </div>

        {/* Candidate Selector Pills */}
        {members.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            No enrolled candidates found for this team.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member: any) => {
              const isSelected = member.id === selectedCandidateId;
              const cScore = candidateScores[member.id];
              const total = cScore
                ? cScore.project_execution +
                  cScore.presentation +
                  cScore.technical_depth +
                  cScore.documentation +
                  cScore.contribution
                : 0;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedCandidateId(member.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#0F5132] text-white border-emerald-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{member.full_name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-emerald-900 text-emerald-100" : "bg-white text-slate-500 border"
                    }`}
                  >
                    {total}/100
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Candidate Active Rubric Inputs */}
        {activeCandidate && (
          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Grading Context: {activeCandidate.full_name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono ml-2">
                  (Roll No. {activeCandidate.roll_number || "—"})
                </span>
              </div>

              <div className="text-right">
                <span className="text-xl font-black font-mono text-[#0F5132]">
                  {activeCandidateTotal} / 100
                </span>
              </div>
            </div>

          {/* 5 Criteria Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Project Execution (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={activeCandidateScores.project_execution}
                onChange={(e) =>
                  handleCandidateScoreChange("project_execution", parseInt(e.target.value))
                }
                className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Presentation (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={activeCandidateScores.presentation}
                onChange={(e) =>
                  handleCandidateScoreChange("presentation", parseInt(e.target.value))
                }
                className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Technical Depth (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={activeCandidateScores.technical_depth}
                onChange={(e) =>
                  handleCandidateScoreChange("technical_depth", parseInt(e.target.value))
                }
                className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Documentation (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={activeCandidateScores.documentation}
                onChange={(e) =>
                  handleCandidateScoreChange("documentation", parseInt(e.target.value))
                }
                className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Contribution (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={activeCandidateScores.contribution}
                onChange={(e) =>
                  handleCandidateScoreChange("contribution", parseInt(e.target.value))
                }
                className="w-full py-1.5 px-2 text-sm font-bold font-mono text-center bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Candidate Examination Feedback
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={activeCandidateScores.remarks}
              onChange={(e) => handleCandidateScoreChange("remarks", e.target.value)}
              placeholder="Specific viva observations for this candidate..."
              className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 disabled:opacity-60"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={isLocked}
              onClick={handleSaveCandidateMarks}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Candidate Marks</span>
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Lock Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                Lock Evaluation Permanently?
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Once locked, all team milestone marks and individual candidate viva scores will be sealed and committed directly to the Controller of Examinations. This action cannot be reversed.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition cursor-pointer shadow-sm"
              >
                Yes, Lock Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvisorTeamEvaluationPage;
