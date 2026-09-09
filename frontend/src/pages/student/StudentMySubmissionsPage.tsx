import React, { useState, useMemo } from "react";
import {
  History,
  Clock,
  Lock,
  ExternalLink,
  Search,
  Calendar,
  FileText,
  FileCheck,
  Presentation,
  Image as ImageIcon,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  X,
  FolderGit2,
  Award,
  Download,
  Zap,
  Star,
  RotateCcw,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import {
  useStudentWeeklySubmissions,
  useResetWeeklyHistoryDemo,
} from "@/hooks/use-student";
import { formatFileSize } from "@/lib/utils";
import {
  WeeklySubmissionRecord,
  WeeklySubmittedFile,
} from "@/types";
import { toast } from "sonner";

type FilterTab = "ALL" | "EVALUATED" | "PENDING" | "APPROVED" | "REJECTED";

export function StudentMySubmissionsPage() {
  const { data, isLoading, error, refetch } = useStudentWeeklySubmissions();
  const { mutateAsync: resetDemo, isPending: isResetting } = useResetWeeklyHistoryDemo();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<WeeklySubmissionRecord | null>(null);

  // Reset Demo to initial state
  const handleResetDemo = async () => {
    try {
      await resetDemo();
      toast.info("Demonstration state reset.");
    } catch {
      toast.error("Failed to reset demo state.");
    }
  };

  // SUBMISSION HISTORY: Display ALL project submissions (both evaluated and pending review)
  const allSubmissions = useMemo(() => {
    if (!data?.submissions) return [];
    return data.submissions;
  }, [data?.submissions]);

  const evaluatedCount = useMemo(() => {
    return allSubmissions.filter((sub) => sub.is_evaluated === true).length;
  }, [allSubmissions]);

  const pendingCount = useMemo(() => {
    return allSubmissions.length - evaluatedCount;
  }, [allSubmissions, evaluatedCount]);

  // Filter and Search on All Submissions
  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((sub) => {
      // 1. Tab filter
      if (activeTab === "EVALUATED" && !sub.is_evaluated) return false;
      if (activeTab === "PENDING" && sub.is_evaluated) return false;
      if (activeTab === "APPROVED" && sub.status !== "APPROVED") return false;
      if (activeTab === "REJECTED" && sub.status !== "REJECTED") return false;

      // 2. Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = (sub.week_title || "").toLowerCase().includes(q);
        const matchStatus = (sub.status || "").toLowerCase().includes(q);
        const matchDate = (sub.submission_date || "").toLowerCase().includes(q);
        const matchGuide = (sub.guide_name || "").toLowerCase().includes(q);
        const matchGrade = sub.grade ? sub.grade.toLowerCase().includes(q) : false;
        const matchMarks = sub.marks_awarded ? sub.marks_awarded.toString().includes(q) : false;
        return matchTitle || matchStatus || matchDate || matchGuide || matchGrade || matchMarks;
      }

      return true;
    });
  }, [allSubmissions, activeTab, searchQuery]);

  const getFileCategoryIcon = (category: WeeklySubmittedFile["category"]) => {
    switch (category) {
      case "ABSTRACT":
        return <FileText className="w-4 h-4 text-[#0F5132]" />;
      case "REPORT":
        return <FileCheck className="w-4 h-4 text-[#0F5132]" />;
      case "PPT":
        return <Presentation className="w-4 h-4 text-[#0F5132]" />;
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-[#0F5132]" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* SUBMISSION HISTORY (PURE PAST HISTORY ONLY) */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Submission History
              </h3>
              <span className="px-2 py-0.5 rounded text-xs font-semibold font-mono bg-emerald-50 text-[#034419] border border-emerald-200">
                {allSubmissions.length} Submissions • {evaluatedCount} Evaluated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live project submission deliverables and faculty advisor evaluations. Showing official marks, qualitative feedback, and rubric scorecards.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDemo}
              disabled={isResetting}
              title="Reset to default mock data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-md shadow-none transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(
              [
                { key: "ALL", label: `All Submissions (${allSubmissions.length})` },
                { key: "EVALUATED", label: `Evaluated (${evaluatedCount})` },
                { key: "PENDING", label: `Pending Review (${pendingCount})` },
                {
                  key: "APPROVED",
                  label: `Approved (${
                    allSubmissions.filter((s) => s.status === "APPROVED").length
                  })`,
                },
                {
                  key: "REJECTED",
                  label: `Revisions (${
                    allSubmissions.filter((s) => s.status === "REJECTED").length
                  })`,
                },
              ] as { key: FilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#034419] text-white shadow-none"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search marks, grade, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUBMISSION HISTORY CARDS GRID */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-slate-300 p-8 text-center space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            No submissions found
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Submissions will appear here as soon as your team submits milestone deliverables from the submission portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg border border-slate-200/90 shadow-none hover:border-[#034419]/50 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top */}
              <div className="p-4 space-y-3">
                {/* Badges bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      WEEK {sub.week_number}
                    </span>
                    <StatusBadge status={sub.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sub.auto_submitted && (
                      <span
                        title="Automatically submitted for advisor review"
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        Auto-Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Week Title */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#034419] transition-colors">
                    {sub.week_title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {sub.submission_date} • {sub.submission_time}
                  </p>
                </div>

                {sub.is_evaluated ? (
                  /* PROMINENT ADVISOR EVALUATION MARKS & GRADE BOX */
                  <div className="p-2.5 rounded-md bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#034419]" />
                        <span className="text-[10px] font-semibold text-[#034419] uppercase tracking-wider">
                          Advisor Evaluation
                        </span>
                      </div>
                      {sub.grade && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#034419] text-white">
                          Grade {sub.grade}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <div>
                        <span className="text-xl font-bold font-mono text-slate-900">
                          {sub.marks_awarded ?? "—"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono font-medium">
                          {" "}
                          / {sub.max_marks || 100} Marks
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-medium block">
                          Percentage
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-800">
                          {sub.marks_awarded ? Math.round((sub.marks_awarded / (sub.max_marks || 100)) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    {sub.guide_remarks && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 italic pt-1 border-t border-emerald-100">
                        "{sub.guide_remarks}"
                      </p>
                    )}
                  </div>
                ) : (
                  /* PENDING FACULTY REVIEW BOX */
                  <div className="p-2.5 rounded-md bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                          Faculty Review
                        </span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-200 text-amber-900">
                        PENDING
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 pt-0.5">
                      Deliverables submitted and queued for advisor review and evaluation.
                    </p>
                  </div>
                )}

                {/* Evaluator & Progress Information */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">
                      {sub.is_evaluated ? "Evaluated By" : "Assigned Guide"}
                    </span>
                    <span className="text-slate-800 font-medium truncate max-w-[150px] block">
                      {sub.is_evaluated
                        ? (sub.evaluated_by ? sub.evaluated_by.split(",")[0] : sub.guide_name.split(",")[0])
                        : (sub.guide_name ? sub.guide_name.split(",")[0] : "Faculty Advisor")}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">
                      Status
                    </span>
                    <span className="font-bold text-[#034419] font-mono text-[11px]">
                      {sub.is_evaluated ? `+${sub.progress_contribution || 0}% Progress` : "In Review"}
                    </span>
                  </div>
                </div>

                {/* Resubmission indicator if multi-attempt */}
                {sub.attempts && sub.attempts.length > 1 && (
                  <div className="p-2 rounded-md bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Resubmission History: {sub.attempts.length} attempts reviewed
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {sub.is_evaluated ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-800 font-medium">Evaluated &amp; Locked</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-amber-800 font-medium">Under Advisor Review</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(sub)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md shadow-none transition-colors cursor-pointer ${
                    sub.is_evaluated
                      ? "text-white bg-[#034419] hover:bg-[#023112]"
                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{sub.is_evaluated ? "View Marks & Details" : "View Submission"}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED EVALUATED SUBMISSION MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/90">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-200 text-slate-800">
                    WEEK {selectedSubmission.week_number}
                  </span>
                  <StatusBadge status={selectedSubmission.status} />
                  {selectedSubmission.grade && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#034419] text-white">
                      Grade {selectedSubmission.grade}
                    </span>
                  )}
                  {selectedSubmission.auto_submitted && (
                    <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-700" />
                      Auto-Submitted for Advisor Review
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedSubmission.week_title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Submitted: {selectedSubmission.submission_date}, {selectedSubmission.submission_time}
                </p>
              </div>

              {/* Close Button [X] */}
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
              {/* Evaluation Status Notice */}
              {selectedSubmission.is_evaluated ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Official Evaluated Record:</strong> This milestone was evaluated by your advisor. Marks and grades have been committed to the institutional PRC archive.
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center gap-3 text-xs text-amber-900">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-amber-950">Awaiting Faculty Evaluation</span>
                    <span className="text-amber-800 text-[11px] mt-0.5 block">
                      Your deliverables for {selectedSubmission.week_title} have been submitted and are currently in queue for review by {selectedSubmission.guide_name || "your faculty advisor"}. Official scores, grade, and feedback will appear here as soon as evaluation is completed.
                    </span>
                  </div>
                </div>
              )}

              {/* A. ADVISOR EVALUATION & MARKS REPORT (IF EVALUATED) */}
              {selectedSubmission.is_evaluated && (
                <div className="bg-white rounded-lg border border-emerald-200/90 p-4 space-y-4 shadow-none">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#034419]" />
                      Advisor Evaluation & Marks Report
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {selectedSubmission.evaluated_at
                        ? `Evaluated: ${selectedSubmission.evaluated_at}`
                        : "Evaluated"}
                    </span>
                  </div>

                  {/* Scorecard Hero */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-1 shadow-none">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Total Marks Awarded
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-[#034419]">
                          {selectedSubmission.marks_awarded ?? "—"}
                        </span>
                        <span className="text-xs font-semibold font-mono text-slate-400">
                          / {selectedSubmission.max_marks || 100}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold font-mono block">
                        Score: {selectedSubmission.marks_awarded ? Math.round((selectedSubmission.marks_awarded / (selectedSubmission.max_marks || 100)) * 100) : 0}%
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-1 shadow-none">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Letter Grade
                      </span>
                      <div className="pt-0.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-base font-bold font-mono bg-[#034419] text-white">
                          {selectedSubmission.grade || "N/A"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium block pt-0.5">
                        {selectedSubmission.grade === "A+"
                          ? "Distinction / Outstanding"
                          : selectedSubmission.grade === "A"
                          ? "Excellent Performance"
                          : selectedSubmission.grade === "B+"
                          ? "Good / Satisfactory"
                          : "Milestone Cleared"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-1 shadow-none">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Evaluated By
                      </span>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedSubmission.evaluated_by || selectedSubmission.guide_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        PRC Faculty Advisor
                      </p>
                      <span className="text-[11px] text-[#034419] font-mono font-bold block pt-0.5">
                        Contribution: +{selectedSubmission.progress_contribution || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Rubric Criteria Breakdown (from evaluation_scores) */}
                  {selectedSubmission.evaluation_scores && selectedSubmission.evaluation_scores.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          Criteria Rubric Breakdown
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Max 20 pts / Criterion
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {selectedSubmission.evaluation_scores.map((sc: any, idx: number) => {
                          const maxVal = sc.max_score || 20;
                          const scoreVal = sc.score ?? 0;
                          const pct = Math.round((scoreVal / maxVal) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-700">{sc.rubric_criterion}</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {scoreVal} / {maxVal} <span className="text-slate-400 font-normal">({pct}%)</span>
                                </span>
                              </div>
                              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#034419] h-full rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Rubric Criteria Breakdown */}
                {selectedSubmission.criteria_scores && (
                  <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Criteria Rubric Breakdown
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Rubric Scale: Max 20 pts / Criterion
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {Object.entries(selectedSubmission.criteria_scores).map(([criteria, val], idx) => {
                        const pct = Math.round((val.score / val.max) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-700">{criteria}</span>
                              <span className="font-mono font-bold text-slate-900">
                                {val.score} / {val.max} <span className="text-slate-400 font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#034419] h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Advisor Official Remarks */}
                <div className="p-3 rounded-lg bg-slate-50/50 border border-slate-200/90 space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Advisor Remarks & Feedback:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{selectedSubmission.guide_remarks || "No qualitative remarks logged."}"
                  </p>

                  {selectedSubmission.rejection_reason && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 mt-2">
                      <strong>Prior Revision Notice:</strong> {selectedSubmission.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* B. Resubmission History (If Multiple Attempts) */}
              {selectedSubmission.attempts && selectedSubmission.attempts.length > 1 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Resubmission History ({selectedSubmission.attempts.length} Attempts)
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {selectedSubmission.attempts.map((att) => (
                      <div
                        key={att.attempt_number}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          att.status === "APPROVED"
                            ? "bg-emerald-50/40 border-emerald-200"
                            : "bg-rose-50/40 border-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono">
                            ATTEMPT {att.attempt_number}
                          </span>
                          <StatusBadge status={att.status} size="sm" />
                        </div>
                        <p className="text-slate-600 font-mono text-[11px]">
                          Submitted: {att.submitted_at}
                        </p>
                        <p className="text-slate-700">
                          <strong>Advisor Remarks:</strong> {att.guide_remarks}
                        </p>
                        {att.rejection_reason && (
                          <p className="text-rose-700">
                            <strong>Reason:</strong> {att.rejection_reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* C. Submitted Files */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Submitted Deliverables & Documents ({selectedSubmission.files.length})
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {selectedSubmission.files.map((file, i) => (
                    <div
                      key={i}
                      className="p-3 px-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getFileCategoryIcon(file.category)}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {formatFileSize(file.size)} • Uploaded {file.upload_date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {file.status}
                        </span>
                        <a
                          href={file.url || "#"}
                          onClick={(e) => {
                            if (!file.url || file.url === "#") {
                              e.preventDefault();
                              toast.info(`Simulating secure download for ${file.name}`);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#034419] hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* D. Project Links */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Project Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {selectedSubmission.github_url ? (
                    <a
                      href={selectedSubmission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#034419] flex items-center justify-between gap-2 text-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate font-mono">
                        <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
                        {selectedSubmission.github_url}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#034419] shrink-0" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs italic">
                      No GitHub URL provided for this week.
                    </div>
                  )}

                  {selectedSubmission.live_demo_url ? (
                    <a
                      href={selectedSubmission.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#034419] flex items-center justify-between gap-2 text-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate font-mono">
                        <Award className="w-4 h-4 text-slate-400 shrink-0" />
                        {selectedSubmission.live_demo_url}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#034419] shrink-0" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs italic">
                      No Live Demo URL submitted for this week.
                    </div>
                  )}
                </div>
              </div>

              {/* E. Weekly Information Submitted */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Weekly Information (Submitted Records)
                </h4>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">
                      Problems Faced:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedSubmission.problems_faced || "None specified."}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">
                      Project Plan for Next Week:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedSubmission.next_week_plan || "None specified."}
                    </p>
                  </div>
                </div>
              </div>

              {/* F. Complete Submission Timeline */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Audit Timeline
                </h4>
                <div className="pl-3 border-l-2 border-slate-200 space-y-3.5 text-xs my-2">
                  {selectedSubmission.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-4">
                      <span
                        className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                          item.status === "done"
                            ? "bg-[#034419]"
                            : item.status === "rejected"
                            ? "bg-rose-500"
                            : "bg-amber-500 animate-pulse"
                        }`}
                      />
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.timestamp}
                      </p>
                      {item.description && (
                        <p className="text-xs text-rose-700 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>SIET Autonomous Project Review Committee (PRC)</span>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
