import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SietLogo } from "@/components/brand/siet-logo";
import { useAuthStore } from "@/stores/auth-store";

export function RootRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated, role, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (!role) {
      navigate("/login", { replace: true });
    } else if (role === "student") {
      navigate("/student/team", { replace: true });
    } else if (role === "hod" || role === "admin") {
      navigate("/hod/dashboard", { replace: true });
    } else if (role === "advisor") {
      navigate("/advisor/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, role, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <SietLogo />
        <span className="text-xs text-slate-500 font-mono">
          Initializing SIET Portal...
        </span>
      </div>
    </div>
  );
}
