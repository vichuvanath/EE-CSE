"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Award,
  Save,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Calculator,
} from "lucide-react";
import { useAdvisorEvaluations, useAdvisorTeamDetails } from "@/hooks/use-advisor";
import { advisorService } from "@/services/advisor.service";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { getErrorMessage } from "@/lib/api-client";
import { StudentEvaluationRequest } from "@/types";

export default function TeamEvaluationGradingPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.teamId;

  const { team, isLoadingTeam } = useAdvisorTeamDetails(teamId);
  const {
    teamEvaluation,
    isLoadingTeamEvaluation,
    studentEvaluations = [],
    isLoadingStudentEvaluations,
    saveTeamEvaluation,
    isSavingTeamEvaluation,
    saveStudentEvaluation,
  } = useAdvisorEvaluations(teamId);

  const [teamScore, setTeamScore] = useState<number>(0);
  const [teamRemarks, setTeamRemarks] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active student grading state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [projectMarks, setProjectMarks] = useState<number>(18);
  const [presentationMarks, setPresentationMarks] = useState<number>(18);
  const [technicalMarks, setTechnicalMarks] = useState<number>(18);
  const [documentationMarks, setDocumentationMarks] = useState<number>(18);
  const [contributionMarks, setContributionMarks] = useState<number>(18);
  const [studentRemarks, setStudentRemarks] = useState<string>("");
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  useEffect(() => {
    if (teamEvaluation) {
      if (teamEvaluation.team_score !== undefined) setTeamScore(teamEvaluation.team_score);
      if (teamEvaluation.team_remarks) setTeamRemarks(teamEvaluation.team_remarks);
    }
  }, [teamEvaluation]);

  // When student list is available, default to first student
  useEffect(() => {
    if (team?.members && team.members.length > 0 && !selectedStudentId) {
      setSelectedStudentId(team.members[0].id || team.members[0].student_id);
    }
  }, [team, selectedStudentId]);

  // Load selected student's marks if existing
  useEffect(() => {
    if (selectedStudentId && studentEvaluations.length > 0) {
      const existing = studentEvaluations.find(
        (se) => se.student_id === selectedStudentId
      );
      if (existing) {
        setProjectMarks(existing.project_marks || 0);
        setPresentationMarks(existing.presentation_marks || 0);
        setTechnicalMarks(existing.technical_marks || 0);
        setDocumentationMarks(existing.documentation_marks || 0);
        setContributionMarks(existing.contribution_marks || 0);
        setStudentRemarks(existing.remarks || "");
      }
    }
  }, [selectedStudentId, studentEvaluations]);

  const totalCalculated =
    Number(projectMarks) +
    Number(presentationMarks) +
    Number(technicalMarks) +
    Number(documentationMarks) +
    Number(contributionMarks);

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await saveTeamEvaluation({
        team_score: Number(teamScore),
        team_remarks: teamRemarks,
        status: "EVALUATED",
      });
      setToastMessage("Team evaluation score and remarks saved.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleSaveStudentMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setErrorMessage(null);
    setIsSavingStudent(true);
    try {
      await saveStudentEvaluation({
        studentId: selectedStudentId,
        data: {
          project_marks: Number(projectMarks),
          presentation_marks: Number(presentationMarks),
          technical_marks: Number(technicalMarks),
          documentation_marks: Number(documentationMarks),
          contribution_marks: Number(contributionMarks),
          remarks: studentRemarks,
        },
      });
      setToastMessage("Candidate individual marks saved successfully.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleLockEvaluation = async () => {
    const evalId = teamEvaluation?.id || teamEvaluation?.evaluation_id;
    if (!evalId) {
      alert("No active evaluation ID found to lock.");
      return;
    }
    if (!confirm("Are you sure you want to PERMANENTLY LOCK this evaluation? Locked evaluations cannot be altered.")) return;
    try {
      await advisorService.lockEvaluation(evalId);
      setToastMessage("Evaluation officially LOCKED and committed to Controller of Examinations.");
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isLocked = teamEvaluation?.status === "LOCKED";

  if (isLoadingTeam || isLoadingTeamEvaluation) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-medium rounded-xl shadow-lg border border-emerald-700/50 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <Link
          href={`/advisor/teams/${teamId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Team Workspace
        </Link>
      </div>

      <PageHeader
        title={`Grade Evaluation — ${team?.name || "Team"}`}
        description="Record comprehensive team milestone score and individual 5-criteria rubric marks for viva voce."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Evaluations", href: "/advisor/evaluations" },
          { label: team?.name || "Team" },
          { label: "Grading Rubric" },
        ]}
        badge={<StatusBadge status={teamEvaluation?.status || "IN_PROGRESS"} />}
        actions={
          !isLocked && (
            <button
              type="button"
              onClick={handleLockEvaluation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Evaluation Permanently
            </button>
          )
        }
      />

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. TEAM LEVEL EVALUATION FORM */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-3 border-b border-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#0F5132]" />
          1. Overall Team Score & Remarks
        </h3>

        <form onSubmit={handleSaveTeam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Team Score (Out of 100)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                disabled={isLocked}
                value={teamScore}
                onChange={(e) => setTeamScore(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-[#0F5132] focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Committee Team Remarks
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={teamRemarks}
                onChange={(e) => setTeamRemarks(e.target.value)}
                placeholder="e.g. Excellent overall architecture and deliverable standards."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132]"
              />
            </div>
          </div>

          {!isLocked && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingTeamEvaluation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] transition-colors cursor-pointer"
              >
                {isSavingTeamEvaluation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Team Score
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. INDIVIDUAL STUDENT 5-CRITERIA RUBRIC */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            2. Individual Student Viva Voce Rubric (5 Criteria × 20 = 100)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select each candidate to grade individual performance, presentation, and technical contribution.
          </p>
        </div>

        {/* Student Selector Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {team?.members?.map((m: any) => {
            const sid = m.id || m.student_id;
            const isSelected = selectedStudentId === sid;
            const studentEval = studentEvaluations.find((se) => se.student_id === sid);

            return (
              <button
                key={sid}
                type="button"
                onClick={() => setSelectedStudentId(sid)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0F5132] text-white border-[#0F5132] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{m.full_name}</span>
                {studentEval?.total_marks !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-emerald-950 text-emerald-200" : "bg-emerald-100 text-[#0F5132]"
                    }`}
                  >
                    {studentEval.total_marks}/100
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5-Criteria Sliders/Inputs */}
        <form onSubmit={handleSaveStudentMarks} className="pt-4 border-t border-slate-100 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Criteria 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Execution (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={projectMarks}
                onChange={(e) => setProjectMarks(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full mt-2 px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
              />
            </div>

            {/* Criteria 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Presentation (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={presentationMarks}
                onChange={(e) => setPresentationMarks(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full mt-2 px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
              />
            </div>

            {/* Criteria 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Technical Depth (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={technicalMarks}
                onChange={(e) => setTechnicalMarks(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full mt-2 px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
              />
            </div>

            {/* Criteria 4 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Documentation (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={documentationMarks}
                onChange={(e) => setDocumentationMarks(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full mt-2 px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
              />
            </div>

            {/* Criteria 5 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contribution (20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                disabled={isLocked}
                value={contributionMarks}
                onChange={(e) => setContributionMarks(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full mt-2 px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Total & Remarks Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-[#0F5132]" />
              <div>
                <span className="text-[11px] font-bold text-[#0F5132] uppercase tracking-wider">
                  Auto-Summed Total Marks
                </span>
                <p className="text-2xl font-bold font-mono text-emerald-950">
                  {totalCalculated} / 100
                </p>
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <input
                type="text"
                disabled={isLocked}
                value={studentRemarks}
                onChange={(e) => setStudentRemarks(e.target.value)}
                placeholder="Candidate remarks (e.g. Strong backend architectural leadership)..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            {!isLocked && (
              <button
                type="submit"
                disabled={isSavingStudent}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] transition-colors shrink-0 cursor-pointer"
              >
                {isSavingStudent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Candidate Marks
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
