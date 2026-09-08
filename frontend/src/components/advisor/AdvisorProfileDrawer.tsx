import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserCheck,
  Building2,
  Mail,
  Lock,
  Save,
  RotateCcw,
  AlertCircle,
  X,
  ShieldCheck,
  Award,
} from "lucide-react";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { useAdvisorProfile, useUpdateAdvisorProfile } from "@/hooks/use-advisor";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(3, "Title & name must contain at least 3 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface AdvisorProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvisorProfileDrawer({ isOpen, onClose }: AdvisorProfileDrawerProps) {
  const { data: profile, isLoading, error, refetch } = useAdvisorProfile();
  const updateProfileMutation = useUpdateAdvisorProfile();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
    },
  });

  // Sync profile values when data is loaded
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "Dr. K. Senthil Kumar, M.E., Ph.D.",
      });
    }
  }, [profile, reset]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const onSubmit = async (values: ProfileFormValues) => {
    setErrorMessage(null);
    try {
      await updateProfileMutation.mutateAsync({ full_name: values.full_name });
      reset({ full_name: values.full_name });
      toast.success("Faculty profile updated successfully in academic register.");
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    if (profile) {
      reset({
        full_name: profile.full_name || "Dr. K. Senthil Kumar, M.E., Ph.D.",
      });
    }
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-['IBM_Plex_Sans',sans-serif]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 animate-in slide-in-from-right">
          {/* Drawer Top Header (SIET Green) */}
          <div className="p-4 sm:px-6 bg-[#034419] text-white flex items-center justify-between border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/10 border border-white/15 flex items-center justify-center text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Faculty Advisor Profile
                </h2>
                <p className="text-[11px] text-emerald-200/80">
                  Project Review Committee (PRC) Supervision Credentials
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : error ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <>
                {/* Advisor Verified Card */}
                <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <MonogramAvatar
                      name={profile?.full_name || "Dr. K. Senthil Kumar"}
                      size="md"
                      variant="emerald"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {profile?.full_name || "Dr. K. Senthil Kumar, M.E., Ph.D."}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-[#034419] border border-emerald-200">
                          <UserCheck className="w-3 h-3" />
                          Verified Faculty
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {profile?.email || "senthilkumar.cse@siet.ac.in"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-800 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {profile?.department || "CSE Department"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FACC15] text-[#023814] text-[11px] font-mono font-bold border border-yellow-400/40 self-start sm:self-auto">
                    <Award className="w-3.5 h-3.5" />
                    <span>PRC GUIDE</span>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Faculty Details &amp; Marksheet Attribution
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your title will appear on exported evaluation marksheet PDFs and project rubrics.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2 text-xs text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    {/* Full Name (Editable) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name &amp; Academic Credentials <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("full_name")}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition text-slate-900"
                        placeholder="e.g. Dr. K. Senthil Kumar, M.E., Ph.D."
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-[11px] text-rose-600 font-medium">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {/* Department (Read-only) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Academic Department
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 cursor-not-allowed">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">
                          {profile?.department || "Department of Computer Science & Engineering"}
                        </span>
                        <Lock className="w-3 h-3 text-slate-400 ml-auto" />
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Official Institutional Email
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 font-mono cursor-not-allowed">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profile?.email || "senthilkumar.cse@siet.ac.in"}</span>
                        <Lock className="w-3 h-3 text-slate-400 ml-auto" />
                      </div>
                    </div>

                    {/* Form Action Controls */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={!isDirty || updateProfileMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Discard
                      </button>

                      <button
                        type="submit"
                        disabled={!isDirty || updateProfileMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Academic Governance Pill */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>FACULTY ADVISOR</span>
                  <span className="text-emerald-800 font-bold">SRI SHAKTHI INSTITUTE • EE &amp; CSE</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
