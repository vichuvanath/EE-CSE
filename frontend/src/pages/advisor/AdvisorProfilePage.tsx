import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Mail,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { useAdvisorProfile, useUpdateAdvisorProfile } from "@/hooks/use-advisor";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { toast } from "sonner";

export function AdvisorProfilePage() {
  const { data: profile, isLoading } = useAdvisorProfile();
  const updateProfileMutation = useUpdateAdvisorProfile();

  const [fullName, setFullName] = useState<string>("Dr. K. Senthil Kumar, M.E., Ph.D.");
  const [initialName, setInitialName] = useState<string>("Dr. K. Senthil Kumar, M.E., Ph.D.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
      setInitialName(profile.full_name);
    }
  }, [profile]);

  const isDirty = fullName.trim() !== initialName.trim();

  const handleDiscard = () => {
    setFullName(initialName);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters long.");
      return;
    }
    setError(null);

    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName.trim(),
      });
      setInitialName(fullName.trim());
      toast.success("Profile Details Saved", {
        description: "Your official faculty title has been updated on marksheet exports.",
      });
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Faculty Profile...</p>
        </div>
      </div>
    );
  }

  const email = profile?.email || "senthilkumar.cse@siet.ac.in";
  const department = profile?.department || "Department of Computer Science & Engineering";

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
      {/* 1. PageHeader */}
      <div>
        <div className="text-xs font-semibold text-slate-400">
          SIET Portal / Advisor Console / Profile
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Faculty Advisor Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your institutional faculty identity, review official department affiliation, and update title on marksheet reports.
        </p>
      </div>

      {/* 2. Profile Banner Card */}
      <div className="p-4 sm:p-5 rounded-lg bg-white border border-slate-200/90 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <MonogramAvatar name={fullName || "Dr. K. Senthil Kumar"} size="lg" variant="teal" />

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {fullName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#034419] border border-emerald-200">
                PRC Faculty Guide
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                ROLE: ADVISOR
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">{department}</p>
            <p className="text-xs text-slate-400 font-mono">{email}</p>
          </div>
        </div>
      </div>

      {/* 3. Faculty Information Form */}
      <form
        onSubmit={handleSave}
        className="p-4 sm:p-5 rounded-lg bg-white border border-slate-200/90 shadow-none space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <UserCheck className="w-4 h-4 text-[#034419]" />
          <h2 className="text-sm font-bold text-slate-900">
            Faculty Directory Information
          </h2>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1 max-w-md">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Full Name (Official Title)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Dr. K. Senthil Kumar, M.E., Ph.D."
              className={`w-full py-2 px-3 text-xs bg-white border rounded-md focus:outline-none focus:ring-1 transition ${
                error
                  ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-600"
                  : "border-slate-200 focus:ring-[#034419] focus:border-[#034419]"
              }`}
            />
            {error ? (
              <span className="text-[11px] text-rose-600 block">{error}</span>
            ) : (
              <span className="text-[10px] text-slate-400 block">
                This exact name is printed on official marksheets and committee evaluation records.
              </span>
            )}
          </div>

          <div className="space-y-1 max-w-md">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed font-mono"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Institutional single sign-on address managed by SIET Network Administration.
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={!isDirty}
            onClick={handleDiscard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#034419] hover:bg-[#023312] text-white text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{updateProfileMutation.isPending ? "Saving..." : "Save Profile Details"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdvisorProfilePage;
