"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { SietLogo } from "@/components/brand/siet-logo";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (role === "advisor" || role === "faculty" || role === "admin") {
          router.replace("/advisor/dashboard");
        } else {
          router.replace("/student/profile");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, role, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <SietLogo />
        <p className="text-xs text-slate-500 font-mono">Initializing SIET Portal...</p>
      </div>
    </div>
  );
}
