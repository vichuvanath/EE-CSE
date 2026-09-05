"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  FileCheck2,
  Calendar,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useSubmission } from "@/hooks/use-student";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api-client";

export default function StudentSubmissionPage() {
  const {
    checklist,
    isLoadingChecklist,
    checklistError,
    mySubmission,
    isLoadingSubmission,
    refetchChecklist,
    refetchSubmission,
    submitFinal,
    isSubmitting,
  } = useSubmission();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = isLoadingChecklist || isLoadingSubmission;

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (checklistError) {
    return (
      <ErrorState
        error={checklistError}
        onRetry={() => {
          refetchChecklist();
          refetchSubmission();
        }}
        title="Unable to load Submission Checklist"
      />
    );
  }

  const isAlreadySubmitted =
    mySubmission?.status === "SUBMITTED" ||
    mySubmission?.status === "APPROVED" ||
    mySubmission?.status === "EVALUATED";

  const checklistItems = [
    { key: "abstract", label: "Abstract Document (PDF)", completed: checklist?.abstract?.completed, link: "/student/files" },
    { key: "report", label: "Project Report Chapter Dossier (PDF)", completed: checklist?.report?.completed, link: "/student/files" },
    { key: "ppt", label: "Presentation Slide Deck (PPT/PPTX)", completed: checklist?.ppt?.completed, link: "/student/files" },
    { key: "images", label: "Project Architecture & Screenshots", completed: checklist?.images?.completed, link: "/student/files" },
    { key: "github", label: "GitHub Repository VCS Link", completed: checklist?.github?.completed, link: "/student/project" },
    { key: "live_demo", label: "Live Deployment / Video URL", completed: checklist?.live_demo?.completed, link: "/student/project" },
  ];

  const completedCount = checklist?.completed_count || 0;
  const totalCount = checklist?.total_count || 6;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const canSubmit = checklist?.all_completed && !isAlreadySubmitted;

  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    try {
      await submitFinal();
      setToastMessage("Final project submitted successfully! Dossier locked for PRC committee review.");
      setTimeout(() => setToastMessage(null), 5000);
      setConfirmModalOpen(false);
      refetchChecklist();
      refetchSubmission();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-medium rounded-xl shadow-lg border border-emerald-700/50 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Final Project Submission & Freeze"
        description="Verify the 6-point Department Project Review Committee completeness checklist before freezing your submission."
        breadcrumbs={[
          { label: "SIET Portal", href: "/student/profile" },
          { label: "Student Workspace", href: "/student/profile" },
          { label: "Final Submission" },
        ]}
        badge={
          <StatusBadge
            status={mySubmission?.status || (isAlreadySubmitted ? "SUBMITTED" : "DRAFT")}
          />
        }
      />

      {/* Submission Status Alert Card */}
      {isAlreadySubmitted ? (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 md:p-8 flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-[#0F5132] rounded-xl shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-emerald-950 font-['Plus_Jakarta_Sans',sans-serif]">
                Dossier Frozen & Officially Submitted
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-200/70 text-emerald-900">
                FINAL-LOCK
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Your team deliverables have been frozen and routed to your designated Faculty Advisor and the PRC Committee for grading. Changes and file replacements are disabled.
            </p>
            {mySubmission?.submitted_at && (
              <p className="text-xs font-mono text-emerald-700 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on: {formatDateTime(mySubmission.submitted_at)}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Submission Completeness Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All 6 requirements must be satisfied before the final submission button unlocks.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#0F5132] font-mono">
                {completedCount} / {totalCount}
              </span>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Tasks Complete
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Overall Progress</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  canSubmit ? "bg-[#0F5132]" : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 6-POINT CHECKLIST GRID */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Required Deliverable Verification
          </h4>
        </div>

        <div className="divide-y divide-slate-100">
          {checklistItems.map((item, idx) => (
            <div
              key={item.key}
              className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    Category ID: <code className="text-slate-600 font-mono">{item.key.toUpperCase()}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {item.completed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    COMPLETE
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      MISSING
                    </span>
                    {!isAlreadySubmitted && (
                      <Link
                        href={item.link}
                        className="text-xs font-semibold text-[#0F5132] hover:underline flex items-center gap-0.5"
                      >
                        Provide <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Footer */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Autonomous Final Evaluation Phase · Academic Year 2025–26</span>
          </div>

          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => setConfirmModalOpen(true)}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer ${
              canSubmit
                ? "bg-[#0F5132] hover:bg-[#0b3d26] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isAlreadySubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submitted & Locked
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Final Project & Lock Dossier
              </>
            )}
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Confirm Final Project Freeze
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to proceed with the final submission?
            </p>

            <ul className="mt-3 space-y-1.5 text-xs text-slate-500 list-disc list-inside">
              <li>All uploaded documents and project URLs will be locked.</li>
              <li>No further edits or uploads will be permitted.</li>
              <li>Your project will be queued for formal committee viva voce grading.</li>
            </ul>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Go Back & Review
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Freezing Dossier...
                  </>
                ) : (
                  "Confirm & Freeze Project"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
