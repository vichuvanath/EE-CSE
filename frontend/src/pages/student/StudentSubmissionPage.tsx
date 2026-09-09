import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Lock,
  Calendar,
  Loader2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import {
  useSubmissionChecklist,
  useStudentSubmission,
  useFinalSubmission,
} from "@/hooks/use-student";
import { formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

export function StudentSubmissionPage() {
  const {
    data: checklist,
    isLoading: isLoadingChecklist,
    error: checklistError,
    refetch: refetchChecklist,
  } = useSubmissionChecklist();

  const {
    data: mySubmission,
    isLoading: isLoadingSubmission,
    error: submissionError,
    refetch: refetchSubmission,
  } = useStudentSubmission();

  const { mutateAsync: submitFinal, isPending: isSubmitting } = useFinalSubmission();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = isLoadingChecklist || isLoadingSubmission;
  const isError = checklistError || submissionError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <ErrorState
          error={checklistError || submissionError}
          onRetry={() => {
            refetchChecklist();
            refetchSubmission();
          }}
        />
      </div>
    );
  }

  const isAlreadySubmitted = mySubmission?.status === "SUBMITTED";
  const completedCount = checklist?.completed_count || 0;
  const totalCount = checklist?.total_count || 2;
  const canSubmit = completedCount === totalCount && !isAlreadySubmitted;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const checklistItems = [
    {
      key: "github",
      label: "GitHub Repository VCS Link",
      completed: checklist?.github?.completed || false,
      link: "/student/project",
    },
    {
      key: "live_demo",
      label: "Live Deployment / Video URL",
      completed: checklist?.live_demo?.completed || false,
      link: "/student/project",
    },
  ];

  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    try {
      await submitFinal();
      toast.success("Final submission locked and submitted for evaluation.");
      setConfirmModalOpen(false);
      refetchSubmission();
      refetchChecklist();
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">

      {/* State Banner: Frozen / Active */}
      {isAlreadySubmitted ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 sm:p-5 flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-100 rounded-md text-[#034419] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Dossier Frozen & Officially Submitted
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-mono text-[10px] font-semibold">
                FINAL-LOCK
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Your team deliverables have been frozen and routed to your designated Faculty Advisor and the PRC Committee for grading. Changes and file replacements are disabled.
            </p>
            {mySubmission?.submitted_at && (
              <p className="text-xs text-emerald-800 font-mono flex items-center gap-1.5 pt-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on: {formatDateTime(mySubmission.submitted_at)}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 sm:p-5 shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Submission Completeness Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All 2 requirements must be satisfied before the final submission button unlocks.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xl font-bold text-[#034419] font-mono">
                {completedCount} / {totalCount}
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Tasks Complete
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Overall Progress</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  canSubmit ? "bg-[#034419]" : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 6-POINT CHECKLIST GRID */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
        <div className="p-3.5 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Required Deliverable Verification
          </h4>
        </div>

        <div className="divide-y divide-slate-100">
          {checklistItems.map((item, idx) => (
            <div
              key={item.key}
              className="p-3.5 px-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Category ID: <code className="text-slate-600 font-mono">{item.key.toUpperCase()}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.completed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    COMPLETE
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      MISSING
                    </span>
                    {!isAlreadySubmitted && (
                      <Link
                        to={item.link}
                        className="text-xs font-semibold text-[#034419] hover:underline flex items-center gap-0.5"
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
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Autonomous Final Evaluation Phase · Academic Year 2025–26</span>
          </div>

          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => setConfirmModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold shadow-none transition-all cursor-pointer ${
              canSubmit
                ? "bg-[#034419] hover:bg-[#023112] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isAlreadySubmitted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted & Locked
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit Final Project & Lock Dossier
              </>
            )}
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-slate-200">
            <div className="flex items-center gap-2.5 text-amber-600 mb-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Confirm Final Project Freeze
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to proceed with the final submission?
            </p>

            <ul className="mt-2.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>All uploaded documents and project URLs will be locked.</li>
              <li>No further edits or uploads will be permitted.</li>
              <li>Your project will be queued for formal committee viva voce grading.</li>
            </ul>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Go Back & Review
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023112] rounded-md shadow-none transition-all disabled:opacity-50 cursor-pointer"
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
