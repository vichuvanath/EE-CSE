import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserCheck,
  Building2,
  Mail,
  Hash,
  Lock,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  User,
} from "lucide-react";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { useStudentProfile, useUpdateStudentProfile } from "@/hooks/use-student";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(3, "Name must contain at least 3 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface StudentProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileDrawer({ isOpen, onClose }: StudentProfileDrawerProps) {
  const { data: profile, isLoading, error, refetch } = useStudentProfile();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateStudentProfile();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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
        full_name: profile.full_name,
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
      await updateProfile(values);
      reset({ full_name: values.full_name });
      toast.success("Profile name updated successfully in academic register.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    if (profile) {
      reset({
        full_name: profile.full_name,
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
          {/* Drawer Top Header */}
          <div className="p-4 sm:px-6 bg-[#034419] text-white flex items-center justify-between border-b border-[#022B0F]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#064E1F] border border-emerald-600/50 flex items-center justify-center text-emerald-200">
                <User className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Student Identity &amp; Profile
                </h2>
                <p className="text-[11px] text-emerald-200/80">
                  Official enrollment details synchronized with Examination Cell
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-emerald-200 hover:text-white hover:bg-[#064E1F] transition cursor-pointer"
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
                {/* Candidate Verified Banner */}
                <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <MonogramAvatar
                      name={profile?.full_name}
                      size="md"
                      variant="emerald"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {profile?.full_name || "Enrolled Student"}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-[#034419] border border-emerald-200">
                          <UserCheck className="w-3 h-3" />
                          Verified Candidate
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {profile?.roll_number}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {profile?.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-800 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          CSE Dept
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px] text-slate-600 font-mono self-start sm:self-auto">
                    <span>ROLE:</span>
                    <span className="font-bold text-[#034419] uppercase">{profile?.role || "STUDENT"}</span>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Personal &amp; Academic Information
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Roll number and official institutional email are locked to your university registration.
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
                        Full Name (Official) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("full_name")}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#034419] focus:border-[#034419] transition-colors"
                        placeholder="Enter official candidate name"
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">
                          {errors.full_name.message}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">
                        Official name recognized on semester grade cards and viva voce rosters.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Roll Number (Read-only) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                            Roll Number
                          </label>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Lock className="w-3 h-3 text-slate-400" /> Read Only
                          </span>
                        </div>
                        <input
                          type="text"
                          value={profile?.roll_number || ""}
                          disabled
                          className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono cursor-not-allowed"
                        />
                      </div>

                      {/* Role (Read-only) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                            Clearance
                          </label>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Lock className="w-3 h-3 text-slate-400" /> Read Only
                          </span>
                        </div>
                        <input
                          type="text"
                          value="PROJECT CANDIDATE"
                          disabled
                          className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                          College Institutional Email
                        </label>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Lock className="w-3 h-3 text-slate-400" /> Read Only
                        </span>
                      </div>
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono cursor-not-allowed"
                      />
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023112] rounded-md transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isUpdating ? "Saving..." : "Save Profile Details"}
                      </button>
                    </div>
                  </form>
                </div>

              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">SIET Autonomous LMS</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileDrawer;
