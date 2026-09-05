"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserCheck,
  Lock,
  Mail,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useAdvisorProfile } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { getErrorMessage } from "@/lib/api-client";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(3, "Name must contain at least 3 characters")
    .max(100)
    .trim(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AdvisorProfilePage() {
  const { data: profile, isLoading, error, refetch, updateProfile, isUpdating } =
    useAdvisorProfile();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setToastMessage(null);
    setErrorMessage(null);
    try {
      await updateProfile(values);
      setToastMessage("Advisor profile updated in institutional directory.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleReset = () => {
    if (profile) {
      reset({ full_name: profile.full_name });
      setErrorMessage(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Advisor Profile"
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
        title="Faculty Advisor Profile"
        description="Official academic profile synchronized with the Department Project Review Committee."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Advisor Console", href: "/advisor/dashboard" },
          { label: "Profile" },
        ]}
      />

      {/* Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <MonogramAvatar
            name={profile?.full_name}
            size="xl"
            variant="teal"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {profile?.full_name || "Faculty Guide"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#216963] border border-teal-200">
                <ShieldCheck className="w-3 h-3" />
                PRC Faculty Guide
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile?.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department of CSE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
          <span>ROLE:</span>
          <span className="font-bold text-[#216963] uppercase">{profile?.role || "ADVISOR"}</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Faculty Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your name is stamped onto student evaluation dossiers and viva marksheet exports.
          </p>
        </div>

        {errorMessage && (
          <div className="m-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name (Official Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("full_name")}
                placeholder="e.g. Dr. John Smith, M.E., Ph.D."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Official Email Address
                </label>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-slate-400" /> Read Only
                </span>
              </div>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || isUpdating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard
            </button>
            <button
              type="submit"
              disabled={!isDirty || isUpdating}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isUpdating ? "Saving Profile..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
