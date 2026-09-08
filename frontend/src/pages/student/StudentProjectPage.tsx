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
} from "lucide-react";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { useStudentProject, useUpdateStudentProject } from "@/hooks/use-student";
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleReset = () => {
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
          </div>
        </div>
      </form>
    </div>
  );
}
