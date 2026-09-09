import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  RotateCcw,
  GitBranch,
  Globe,
  Tag,
  AlertCircle,
  Send,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { useStudentProject, useUpdateStudentProject, useFinalSubmission, useStudentSubmission } from "@/hooks/use-student";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

const projectSchema = z.object({
  title: z
    .string()
    .min(5, "Project title must contain at least 5 characters")
    .max(200, "Project title must not exceed 200 characters")
    .trim(),
  domain: z
    .string()
    .min(2, "Domain must contain at least 2 characters")
    .trim(),
  problem_statement: z
    .string()
    .min(10, "Problem statement must contain at least 10 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Abstract description must contain at least 10 characters")
    .trim(),
  proposed_solution: z
    .string()
    .min(10, "Proposed solution must contain at least 10 characters")
    .trim(),
  technologies_used: z
    .string()
    .min(2, "Please specify at least one technology")
    .trim(),
  github_url: z
    .string()
    .refine(
      (val) => val === "" || val.startsWith("http://") || val.startsWith("https://"),
      "Please enter a valid URL starting with http:// or https://"
    ),
  live_demo_url: z
    .string()
    .refine(
      (val) => val === "" || val.startsWith("http://") || val.startsWith("https://"),
      "Please enter a valid URL starting with http:// or https://"
    ),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function StudentProjectPage() {
  const { data: project, isLoading, error, refetch } = useStudentProject();
  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateStudentProject();
  const { mutateAsync: submitFinal, isPending: isSubmitting } = useFinalSubmission();
  const { data: mySubmission, refetch: refetchSubmission } = useStudentSubmission();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Check if project is submitted/locked
  const isSubmitted = mySubmission?.status === "SUBMITTED";

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      domain: "",
      problem_statement: "",
      description: "",
      proposed_solution: "",
      technologies_used: "",
      github_url: "",
      live_demo_url: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title || "",
        domain: project.domain || "",
        problem_statement: project.problem_statement || "",
        description: project.description || "",
        proposed_solution: project.proposed_solution || "",
        technologies_used: project.technologies_used || "",
        github_url: project.github_url || "",
        live_demo_url: project.live_demo_url || "",
      });
    }
  }, [project, reset]);

  const onSubmit = async (values: ProjectFormValues) => {
    if (isSubmitted) return;
    setErrorMessage(null);
    try {
      await updateProject(values);
      reset(values);
      toast.success("Project information saved and synchronized with guide review queue.");
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitted) return;
    setErrorMessage(null);
    try {
      await submitFinal();
      toast.success("Final submission locked and submitted for evaluation.");
      setConfirmModalOpen(false);
      await refetchSubmission();
      await refetch();
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    if (isSubmitted) return;
    if (project) {
      reset({
        title: project.title || "",
        domain: project.domain || "",
        problem_statement: project.problem_statement || "",
        description: project.description || "",
        proposed_solution: project.proposed_solution || "",
        technologies_used: project.technologies_used || "",
        github_url: project.github_url || "",
        live_demo_url: project.live_demo_url || "",
      });
    }
    setErrorMessage(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSubmitted ? (
        // Read-only view after submission
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Project Submitted & Locked</p>
              <p className="text-xs text-emerald-700">
                This project has been submitted for evaluation. All details are now read-only and visible to your advisor and evaluation committee.
              </p>
            </div>
          </div>

          {/* SECTION 1: Core Identification & Scope */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200 font-mono text-xs font-bold">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Core Identification & Scope
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official Project Title
                </label>
                <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium">
                  {project?.title || "—"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Domain
                </label>
                <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium">
                  {project?.domain || "—"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Problem Statement
              </label>
              <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 whitespace-pre-wrap">
                {project?.problem_statement || "—"}
              </p>
            </div>
          </div>

          {/* SECTION 2: Technical Abstract & Solution */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200 font-mono text-xs font-bold">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Technical Abstract & Proposed Solution
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Overview / Abstract Description
              </label>
              <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 whitespace-pre-wrap">
                {project?.description || "—"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Proposed Solution & Innovation
              </label>
              <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 whitespace-pre-wrap">
                {project?.proposed_solution || "—"}
              </p>
            </div>
          </div>

          {/* SECTION 3: Technical Stack & Deliverable Links */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200 font-mono text-xs font-bold">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Technical Stack & Deliverable URLs
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Technologies Used
              </label>
              <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono">
                {project?.technologies_used || "—"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                  GitHub Repository URL
                </label>
                <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono break-all">
                  {project?.github_url || "—"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Live Demo / Deployment URL
                </label>
                <p className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono break-all">
                  {project?.live_demo_url || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Project details have been submitted to the evaluation committee.{" "}
              <span className="font-semibold text-[#034419]">No further edits allowed.</span>
            </p>
          </div>
        </div>
      ) : (
        // Editable form before submission
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* SECTION 1: Core Identification & Scope */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200 font-mono text-xs font-bold">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Core Identification & Scope
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g. AI-Powered Smart Attendance & Campus Surveillance System"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Domain <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("domain")}
                  placeholder="e.g. Artificial Intelligence / Cloud"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
                />
                {errors.domain && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.domain.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Problem Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register("problem_statement")}
                placeholder="State the core technical challenge, target audience, and existing bottlenecks..."
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
              />
              {errors.problem_statement && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.problem_statement.message}
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: Technical Abstract & Solution */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200 font-mono text-xs font-bold">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Technical Abstract & Proposed Solution
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Overview / Abstract Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                {...register("description")}
                placeholder="Detailed summary of methodology, system modules, and intended impact..."
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Proposed Solution & Innovation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register("proposed_solution")}
                placeholder="Explain what makes this architecture innovative compared to standard benchmarks..."
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
              />
              {errors.proposed_solution && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.proposed_solution.message}
                </p>
              )}
            </div>
          </div>

          {/* SECTION 3: Technical Stack & Deliverable Links */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-none p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200 font-mono text-xs font-bold">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Technical Stack & Deliverable URLs
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Technologies Used (Comma-Separated) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("technologies_used")}
                placeholder="e.g. Next.js, FastAPI, PostgreSQL, OpenCV, Docker, TailwindCSS"
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
              />
              {errors.technologies_used && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.technologies_used.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  {...register("github_url")}
                  placeholder="https://github.com/organization/repo"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
                />
                {errors.github_url && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.github_url.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Live Demo / Deployment URL
                </label>
                <input
                  type="text"
                  {...register("live_demo_url")}
                  placeholder="https://myproject.demo.app"
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#034419] transition-colors"
                />
                {errors.live_demo_url && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.live_demo_url.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-none flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isDirty ? (
                <span className="text-amber-600 font-medium">
                  ● Unsaved changes detected
                </span>
              ) : (
                "Synchronized with PRC registry"
              )}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || isUpdating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023112] rounded-md shadow-none transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdating ? "Saving Project Data..." : "Save Project Details"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-md shadow-none transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Final Project
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-slate-200">
            <div className="flex items-center gap-2.5 text-amber-600 mb-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Confirm Final Project Submission
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to submit your project details for evaluation?
            </p>

            <ul className="mt-2.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>Your project information will be locked.</li>
              <li>No further edits will be permitted after submission.</li>
              <li>Your project will be queued for formal committee review.</li>
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
                    Submitting...
                  </>
                ) : (
                  "Confirm & Submit Project"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
