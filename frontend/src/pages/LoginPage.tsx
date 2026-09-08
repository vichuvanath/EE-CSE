import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { mockStudentUser, mockAdvisorUser, mockHodUser } from "@/lib/mock-fallback";
import { useNavigate } from "react-router-dom";

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

export function LoginPage() {
  const navigate = useNavigate();
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

  const onHodSubmit = async (_data: HodFormValues) => {
    setLoginError(null);
    setIsHodLoggingIn(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setAuth(mockHodUser.user, mockHodUser.access_token);
      navigate("/hod/dashboard");
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
      navigate("/student/team");
    } else if (role === "hod") {
      setAuth(mockHodUser.user, mockHodUser.access_token);
      navigate("/hod/dashboard");
    } else {
      setAuth(mockAdvisorUser.user, mockAdvisorUser.access_token);
      navigate("/advisor/dashboard");
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
    <div className="min-h-screen flex flex-col lg:flex-row font-['IBM_Plex_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────
       * LEFT SECTION: Deep Dark Green Institutional Branding
       * (Directly matches the SIET-LMS reference screen)
       * ───────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#034419] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          {/* Main Title in Bright Accent Yellow */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FACC15] font-['IBM_Plex_Sans',sans-serif] tracking-tight leading-tight">
            Welcome to SIET-LMS
          </h1>

          {/* Description Paragraph */}
          <p className="mt-6 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            The{" "}
            <strong className="text-white font-semibold">
              Sri Shakthi Institute of Engineering and Technology Learning Management System (SIET-LMS)
            </strong>{" "}
            is your dedicated online platform designed to elevate your programming skills and academic journey.
            SIET-LMS offers a comprehensive, user-friendly environment tailored to support your growth.
          </p>

          {/* Feature List */}
          <h2 className="text-[#FACC15] font-bold text-base sm:text-lg mt-8 mb-4 font-['IBM_Plex_Sans',sans-serif]">
            SIET - LMS Provides
          </h2>

          <ul className="space-y-3 text-xs sm:text-sm text-emerald-100/90">
            <li className="flex items-start gap-2.5">
              <span className="text-[#FACC15] font-bold text-base leading-none">•</span>
              <span>A vast collection of carefully curated coding challenges and problems spanning various difficulty levels.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#FACC15] font-bold text-base leading-none">•</span>
              <span>Real-time code compilation and execution to instantly test and validate your solutions.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#FACC15] font-bold text-base leading-none">•</span>
              <span>Detailed progress tracking and personalized feedback to help you identify strengths and areas for improvement.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#FACC15] font-bold text-base leading-none">•</span>
              <span>Resources and tools aligned with competitive programming and industry-relevant software development practices.</span>
            </li>
          </ul>
        </div>

        {/* Instant Demo Access (Preserved Functionality) */}
        <div className="mt-8 pt-6 border-t border-emerald-800/80">
          <div className="flex items-start gap-3 bg-[#023312] p-4 rounded-xl border border-emerald-700/60">
            <div className="p-2 rounded-lg bg-[#16A34A] text-white shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                Instant Demo Access
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FACC15] text-[#023814] font-bold font-mono">
                  1-Click
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Quick bypass for evaluators and presentation demos:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin("student")}
                  className="px-2.5 py-1 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  Demo Student
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin("advisor")}
                  className="px-2.5 py-1 rounded-md bg-[#034419] hover:bg-[#064E1F] text-emerald-100 text-xs font-medium border border-emerald-600 transition cursor-pointer"
                >
                  Demo Advisor
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin("hod")}
                  className="px-2.5 py-1 rounded-md bg-[#034419] hover:bg-[#064E1F] text-emerald-100 text-xs font-medium border border-emerald-600 transition cursor-pointer"
                >
                  Demo HOD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
       * RIGHT SECTION: Bright Accent Yellow Background & Mint Card
       * (Directly matches the SIET-LMS reference screen)
       * ───────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#FACC15] p-6 sm:p-12 flex items-center justify-center">
        {/* Light Mint Green Login Container */}
        <div className="w-full max-w-md bg-[#E8F8F0] rounded-2xl shadow-xl border border-emerald-200/80 p-6 sm:p-8">
          {/* Official SIET Crest Logo (Uploaded Asset) */}
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="/siet-logo.png"
              alt="SIET Official Logo"
              className="w-24 h-24 object-contain drop-shadow-sm"
            />
            <h2 className="text-lg font-bold text-[#034419] font-['IBM_Plex_Sans',sans-serif] mt-2 tracking-tight">
              SIET Academic Portal
            </h2>
          </div>

          {/* Segmented Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-emerald-100/80 p-1 rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRoleTab("student");
                setLoginError(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                roleTab === "student"
                  ? "bg-[#034419] text-[#FACC15] font-bold shadow-xs"
                  : "text-[#034419] hover:bg-emerald-200/50"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("advisor");
                setLoginError(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                roleTab === "advisor"
                  ? "bg-[#034419] text-[#FACC15] font-bold shadow-xs"
                  : "text-[#034419] hover:bg-emerald-200/50"
              }`}
            >
              Advisor
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("hod");
                setLoginError(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                roleTab === "hod"
                  ? "bg-[#034419] text-[#FACC15] font-bold shadow-xs"
                  : "text-[#034419] hover:bg-emerald-200/50"
              }`}
            >
              HOD
            </button>
          </div>

          {/* Quick-fill helper */}
          <div className="mb-4 p-2.5 bg-white/90 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-[#034419]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="font-mono text-[11px] truncate max-w-[210px]">
                {roleTab === "student"
                  ? "23CS001"
                  : roleTab === "advisor"
                  ? "prof.smith@college.edu"
                  : "hod.cse@college.edu"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill(roleTab)}
              className="text-[#16A34A] font-bold hover:underline cursor-pointer text-[11px]"
            >
              Auto-fill
            </button>
          </div>

          {/* Dynamic Error Banner */}
          {loginError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <span className="font-semibold">Authentication Failed:</span> {loginError}
              </div>
            </div>
          )}

          {/* STUDENT FORM */}
          {roleTab === "student" ? (
            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Username / Roll Number"
                  aria-label="Username / Roll Number"
                  {...studentForm.register("roll_number")}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
                />
                {studentForm.formState.errors.roll_number && (
                  <p className="mt-1 text-xs text-rose-600">
                    {studentForm.formState.errors.roll_number.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Team ID (UUID)"
                  aria-label="Team ID"
                  {...studentForm.register("team_id")}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
                />
                {studentForm.formState.errors.team_id && (
                  <p className="mt-1 text-xs text-rose-600">
                    {studentForm.formState.errors.team_id.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickFill("student");
                  }}
                  className="text-xs text-[#16A34A] font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : roleTab === "advisor" ? (
            /* ADVISOR FORM */
            <form onSubmit={advisorForm.handleSubmit(onAdvisorSubmit)} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Username / Advisor Email"
                  aria-label="Advisor ID"
                  {...advisorForm.register("advisor_id")}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
                />
                {advisorForm.formState.errors.advisor_id && (
                  <p className="mt-1 text-xs text-rose-600">
                    {advisorForm.formState.errors.advisor_id.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  {...advisorForm.register("password")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {advisorForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {advisorForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickFill("advisor");
                  }}
                  className="text-xs text-[#16A34A] font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* HOD FORM */
            <form onSubmit={hodForm.handleSubmit(onHodSubmit)} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Username / HOD Email"
                  aria-label="HOD ID"
                  {...hodForm.register("hod_id")}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
                />
                {hodForm.formState.errors.hod_id && (
                  <p className="mt-1 text-xs text-rose-600">
                    {hodForm.formState.errors.hod_id.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  {...hodForm.register("password")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {hodForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {hodForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickFill("hod");
                  }}
                  className="text-xs text-[#16A34A] font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Card Footer */}
          <div className="mt-5 pt-3 border-t border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800/80">
            <span className="font-medium">SIET Autonomous</span>
            <span className="font-mono">AY 2026-27</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
