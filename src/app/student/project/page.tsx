"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Tag,
  GitBranch,
} from "lucide-react";
import { useMyProject } from "@/hooks/use-student";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { getErrorMessage } from "@/lib/api-client";
import { ProjectUpdate } from "@/types";

const projectSchema = z.object({
  title: z.string().min(5, "Project title must be at least 5 characters").max(200),
  domain: z.string().min(2, "Select or enter a domain"),
  problem_statement: z.string().min(10, "Problem statement must be at least 10 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  proposed_solution: z.string().min(10, "Proposed solution must be at least 10 characters"),
  technologies_used: z.string().min(2, "List key technologies used"),
  github_url: z.string().url("Enter a valid GitHub URL").or(z.literal("")),
  live_demo_url: z.string().url("Enter a valid URL").or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function StudentProjectPage() {
  const { data: project, isLoading, error, refetch, updateProject, isUpdating } =
    useMyProject();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      domain: "Artificial Intelligence & ML",
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
        domain: project.domain || "Artificial Intelligence & ML",
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
    setToastMessage(null);
    setErrorMessage(null);
    try {
      await updateProject(values as ProjectUpdate);
      setToastMessage("Project information saved and synchronized with guide review queue.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleReset = () => {
    if (project) {
      reset({
        title: project.title || "",
        domain: project.domain || "Artificial Intelligence & ML",
        problem_statement: project.problem_statement || "",
        description: project.description || "",
        proposed_solution: project.proposed_solution || "",
        technologies_used: project.technologies_used || "",
        github_url: project.github_url || "",
        live_demo_url: project.live_demo_url || "",
      });
      setErrorMessage(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Project Details"
      />
    );
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

      {/* Header */}
      <PageHeader
        title="Project Details & Technical Scope"
        description="Comprehensive technical formulation, problem statement, technology stack, and repository links."
        breadcrumbs={[
          { label: "SIET Portal", href: "/student/profile" },
          { label: "Student Workspace", href: "/student/profile" },
          { label: "Project Details" },
        ]}
      />


      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1: Core Identification & Scope */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-[#0F5132] font-mono text-xs font-bold">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Core Identification & Scope
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="e.g. AI-Powered Smart Attendance & Surveillance System"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Domain <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("domain")}
                placeholder="e.g. Artificial Intelligence / Cloud"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
              />
              {errors.domain && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.domain.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Problem Statement <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...register("problem_statement")}
              placeholder="State the core technical challenge, target audience, and existing bottlenecks..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
            />
            {errors.problem_statement && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.problem_statement.message}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: Technical Abstract & Solution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-[#0F5132] font-mono text-xs font-bold">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Technical Abstract & Proposed Solution
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Overview / Abstract Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register("description")}
              placeholder="Detailed summary of methodology, system modules, and intended impact..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Proposed Solution & Innovation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...register("proposed_solution")}
              placeholder="Explain what makes this architecture innovative compared to standard benchmarks..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
            />
            {errors.proposed_solution && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.proposed_solution.message}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 3: Technical Stack & Deliverable Links */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-[#0F5132] font-mono text-xs font-bold">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Technical Stack & Deliverable URLs
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Technologies Used (Comma-Separated) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("technologies_used")}
              placeholder="e.g. Next.js, FastAPI, PostgreSQL, OpenCV, Docker, TailwindCSS"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
            />
            {errors.technologies_used && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.technologies_used.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                GitHub Repository URL
              </label>
              <input
                type="text"
                {...register("github_url")}
                placeholder="https://github.com/organization/repo"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
              />
              {errors.github_url && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.github_url.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Live Demo / Deployment URL
              </label>
              <input
                type="text"
                {...register("live_demo_url")}
                placeholder="https://myproject.demo.app"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
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
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isDirty ? (
              <span className="text-amber-600 font-medium">
                ● Unsaved changes detected
              </span>
            ) : (
              "Synchronized with PRC registry"
            )}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || isUpdating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard
            </button>
            <button
              type="submit"
              disabled={!isDirty || isUpdating}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
