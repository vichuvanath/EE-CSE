"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { SietLogo } from "@/components/brand/siet-logo";
import { useAuthStore } from "@/stores/auth-store";
import { mockStudentUser, mockAdvisorUser, mockHodUser } from "@/lib/mock-fallback";
import { useRouter } from "next/navigation";

// Form schemas
const studentSchema = z.object({
  roll_number: z.string().min(1, "Roll number is required").trim(),
  team_id: z.string().min(1, "Team ID is required").trim(),
});

const advisorSchema = z.object({
  advisor_id: z.string().min(1, "Advisor ID / Email is required").trim(),
  password: z.string().min(1, "Password is required"),
});

const hodSchema = z.object({
  hod_id: z.string().min(1, "HOD ID / Department Email is required").trim(),
  password: z.string().min(1, "Password is required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;
type AdvisorFormValues = z.infer<typeof advisorSchema>;
type HodFormValues = z.infer<typeof hodSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<"student" | "advisor" | "hod">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isHodLoggingIn, setIsHodLoggingIn] = useState(false);

  const { setAuth } = useAuthStore();
  const {
    loginStudent,
    isStudentLoggingIn,
    loginAdvisor,
    isAdvisorLoggingIn,
  } = useAuth();

  // Student Form
  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      roll_number: "",
      team_id: "",
    },
  });

  // Advisor Form
  const advisorForm = useForm<AdvisorFormValues>({
    resolver: zodResolver(advisorSchema),
    defaultValues: {
      advisor_id: "",
      password: "",
    },
  });

  // HOD Form
  const hodForm = useForm<HodFormValues>({
    resolver: zodResolver(hodSchema),
    defaultValues: {
      hod_id: "",
      password: "",
    },
  });

  const onStudentSubmit = async (data: StudentFormValues) => {
    setLoginError(null);
    try {
      await loginStudent(data);
    } catch (err) {
      setLoginError(getErrorMessage(err));
    }
  };

  const onAdvisorSubmit = async (data: AdvisorFormValues) => {
    setLoginError(null);
    try {
      await loginAdvisor(data);
    } catch (err) {
      setLoginError(getErrorMessage(err));
    }
  };

  const onHodSubmit = async (data: HodFormValues) => {
    setLoginError(null);
    setIsHodLoggingIn(true);
    try {
      // Simulate authenticating HOD credentials
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAuth(mockHodUser.user, mockHodUser.access_token);
      router.push("/hod/dashboard");
    } catch (err) {
      setLoginError(getErrorMessage(err));
    } finally {
      setIsHodLoggingIn(false);
    }
  };

  // 1-Click Instant Demo Login (Zero Friction for Presentations / Demos)
  const handleInstantDemoLogin = (role: "student" | "advisor" | "hod") => {
    if (role === "student") {
      setAuth(mockStudentUser.user, mockStudentUser.access_token);
      router.push("/student/profile");
    } else if (role === "hod") {
      setAuth(mockHodUser.user, mockHodUser.access_token);
      router.push("/hod/dashboard");
    } else {
      setAuth(mockAdvisorUser.user, mockAdvisorUser.access_token);
      router.push("/advisor/dashboard");
    }
  };

  // Fill credentials helper
  const handleQuickFill = (role: "student" | "advisor" | "hod") => {
    setRoleTab(role);
    setLoginError(null);
    if (role === "student") {
      studentForm.setValue("roll_number", "23CS001");
      studentForm.setValue("team_id", "00000000-0000-0000-0000-000000000000");
    } else if (role === "advisor") {
      advisorForm.setValue("advisor_id", "prof.smith@college.edu");
      advisorForm.setValue("password", "YourPassword123");
    } else {
      hodForm.setValue("hod_id", "hod.cse@college.edu");
      hodForm.setValue("password", "HodSecurePass2026");
    }
  };

  const isSubmitting = isStudentLoggingIn || isAdvisorLoggingIn || isHodLoggingIn;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <SietLogo />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
          Academic Project Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Department of Computer Science & Engineering · Project Review Committee
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 space-y-4">
        {/* ONE-CLICK DEMO ACCESS BAR */}
        <div className="p-4 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl shadow-md border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/80 rounded-xl text-emerald-300 shrink-0">
              <Zap className="w-4 h-4 fill-emerald-300" />
            </div>
            <div>
              <span className="text-xs font-bold block text-emerald-100 font-['Plus_Jakarta_Sans',sans-serif]">
                Instant Demo Access
              </span>
              <span className="text-[11px] text-emerald-300/80">
                1-click login with pre-configured mock data
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => handleInstantDemoLogin("student")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer text-center"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleInstantDemoLogin("advisor")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer text-center"
            >
              Demo Advisor
            </button>
            <button
              type="button"
              onClick={() => handleInstantDemoLogin("hod")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer text-center"
            >
              Demo HOD
            </button>
          </div>
        </div>

        {/* MAIN LOGIN CARD */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200/90 sm:px-10">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRoleTab("student");
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === "student"
                  ? "bg-[#0F5132] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="truncate">Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("advisor");
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === "advisor"
                  ? "bg-[#0F5132] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Faculty / Advisor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("hod");
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roleTab === "hod"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate">HOD Portal</span>
            </button>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <span className="font-semibold">Authentication Failed:</span>{" "}
                {loginError}
              </div>
            </div>
          )}

          {/* Quick Fill Credentials Helper */}
          <div className="mb-5 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px] text-slate-500">
              {roleTab === "student"
                ? "Test student: 23CS001"
                : roleTab === "advisor"
                ? "Test advisor: prof.smith@college.edu"
                : "Test HOD: hod.cse@college.edu"}
            </span>
            <button
              type="button"
              onClick={() => handleQuickFill(roleTab)}
              className={`hover:underline font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer ${
                roleTab === "hod" ? "text-indigo-600" : "text-[#0F5132]"
              }`}
            >
              <Sparkles className={`w-3 h-3 ${roleTab === "hod" ? "text-indigo-600" : "text-[#0F5132]"}`} />
              Auto-fill Form
            </button>
          </div>

          {/* STUDENT FORM */}
          {roleTab === "student" ? (
            <form
              onSubmit={studentForm.handleSubmit(onStudentSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 23CS001"
                  {...studentForm.register("roll_number")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
                />
                {studentForm.formState.errors.roll_number && (
                  <p className="mt-1 text-xs text-rose-600">
                    {studentForm.formState.errors.roll_number.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Team ID (UUID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                  {...studentForm.register("team_id")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
                />
                {studentForm.formState.errors.team_id && (
                  <p className="mt-1 text-xs text-rose-600">
                    {studentForm.formState.errors.team_id.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating Student...
                  </>
                ) : (
                  <>
                    Sign In to Student Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : roleTab === "advisor" ? (
            /* ADVISOR FORM */
            <form
              onSubmit={advisorForm.handleSubmit(onAdvisorSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Advisor ID / Institutional Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. prof.smith@college.edu"
                  {...advisorForm.register("advisor_id")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
                />
                {advisorForm.formState.errors.advisor_id && (
                  <p className="mt-1 text-xs text-rose-600">
                    {advisorForm.formState.errors.advisor_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your advisor password"
                    {...advisorForm.register("password")}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 focus:border-[#0F5132] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {advisorForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {advisorForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating Faculty...
                  </>
                ) : (
                  <>
                    Sign In to Advisor Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* HOD FORM */
            <form
              onSubmit={hodForm.handleSubmit(onHodSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  HOD ID / Department Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. hod.cse@college.edu"
                  {...hodForm.register("hod_id")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                {hodForm.formState.errors.hod_id && (
                  <p className="mt-1 text-xs text-rose-600">
                    {hodForm.formState.errors.hod_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your HOD password"
                    {...hodForm.register("password")}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {hodForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {hodForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating Department HOD...
                  </>
                ) : (
                  <>
                    Sign In to HOD Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Institutional Note */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              REST API Ready
            </span>
            <span className="font-mono">SIET Autonomous PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
