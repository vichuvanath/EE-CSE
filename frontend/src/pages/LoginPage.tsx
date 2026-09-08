import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { mockStudentUser, mockAdvisorUser, mockHodUser } from "@/lib/mock-fallback";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").trim(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();
  const { login, isLoggingIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      await login(data);
    } catch (err) {
      setLoginError(getErrorMessage(err));
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-['IBM_Plex_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────
       * LEFT SECTION: Deep Dark Green Institutional Branding
       * ───────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#034419] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FACC15] font-['IBM_Plex_Sans',sans-serif] tracking-tight leading-tight">
            Welcome to SIET-LMS
          </h1>

          <p className="mt-6 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            The{" "}
            <strong className="text-white font-semibold">
              Sri Shakthi Institute of Engineering and Technology Learning Management System (SIET-LMS)
            </strong>{" "}
            is your dedicated online platform designed to elevate your programming skills and academic journey.
            SIET-LMS offers a comprehensive, user-friendly environment tailored to support your growth.
          </p>

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

        {/* Instant Demo Access */}
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
       * RIGHT SECTION: Single Common Login Form
       * ───────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#FACC15] p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#E8F8F0] rounded-2xl shadow-xl border border-emerald-200/80 p-6 sm:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="/siet-logo.png"
              alt="SIET Official Logo"
              className="w-24 h-24 object-contain drop-shadow-sm"
            />
            <h2 className="text-lg font-bold text-[#034419] font-['IBM_Plex_Sans',sans-serif] mt-2 tracking-tight">
              SIET Academic Portal
            </h2>
            <p className="text-xs text-emerald-700/80 mt-1">
              Sign in with your email and password
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <span className="font-semibold">Authentication Failed:</span> {loginError}
              </div>
            </div>
          )}

          {/* Single Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                aria-label="Email"
                autoComplete="email"
                {...form.register("email")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-rose-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                {...form.register("password")}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#22C55E] text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#034419] transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-rose-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs text-[#16A34A] font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
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
