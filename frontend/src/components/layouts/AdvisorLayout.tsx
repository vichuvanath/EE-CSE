import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Award,
  FolderClock,
  GraduationCap,
  Menu,
  X,
  Users,
  RotateCcw,
} from "lucide-react";
import { SietLogo } from "@/components/brand/siet-logo";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";

import { SidebarNav, type SidebarNavGroup, type SidebarWorkspace } from "@/components/navigation/SidebarNav";
import { AdvisorProfileDrawer } from "@/components/advisor/AdvisorProfileDrawer";

const advisorNavGroups: SidebarNavGroup[] = [
  {
    label: "SUPERVISION & TEAMS",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/advisor/dashboard", icon: LayoutDashboard },
      {
        key: "teams-and-guides",
        label: "Teams & Guides",
        href: "/advisor/teams-and-guides",
        icon: Users,
        matchPrefix: "/advisor/teams-and-guides",
      },
      { key: "students", label: "Students", href: "/advisor/students", icon: GraduationCap },
    ],
  },
  {
    label: "PRC EVALUATION",
    items: [
      {
        key: "evaluation",
        label: "Evaluation",
        href: "/advisor/teams",
        icon: Award,
        matchPrefix: "/advisor/teams",
      },
      { key: "records", label: "Evaluation Records", href: "/advisor/records", icon: FolderClock },
      {
        key: "change-management",
        label: "Change Management",
        href: "/advisor/change-management",
        icon: RotateCcw,
        matchPrefix: "/advisor/change-management",
      },
    ],
  },
];

const advisorWorkspace: SidebarWorkspace = {
  key: "advisor",
  name: "Advisor & Guide",
  subtitle: "PRC Supervision",
  monogram: "A",
  role: "Faculty Advisor",
};

export function AdvisorLayout() {
  const navigate = useNavigate();
  const { user, initialize, logout } = useAuthStore();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Ensure user is authenticated as advisor when accessing advisor workspace
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("siet_access_token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("siet_user") : null;
    let parsed: any = null;
    try {
      if (userStr) parsed = JSON.parse(userStr);
    } catch {}

    if (!token || !parsed || parsed.role !== "advisor") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const advisorName = user?.full_name || "Dr. K. Senthil Kumar";
  const advisorInitials =
    advisorName
      .split(" ")
      .filter((p) => !p.toLowerCase().startsWith("dr"))
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SK";

  return (
    <div className="min-h-screen bg-[#F4FAF6] flex flex-col md:flex-row font-['IBM_Plex_Sans',sans-serif]">
      {/* 1. Mobile Top Header (SIET Dark Green) */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 bg-[#034419] border-b border-white/[0.08] text-white sticky top-0 z-30">
        <SietLogo href="/advisor/dashboard" variant="dark" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-[#16A34A] text-white font-bold font-mono text-xs flex items-center justify-center border border-[#FACC15]/60 shadow-xs"
            title="Open Faculty Profile"
            aria-label="Open Faculty Profile"
          >
            {advisorInitials}
          </button>
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle Advisor Navigation"
          >
            {mobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* 2. Static Sidebar Navigation (SIET Theme - Simple Logout Only) */}
      <SidebarNav
        currentWorkspace={advisorWorkspace}
        navGroups={advisorNavGroups}
        disableWorkspaceSwitcher={true}
        hideCollapseButton={true}
        simpleSignOutOnly={true}
        onSignOut={handleLogout}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
      />

      {/* 4. Main Content Canvas */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Topbar (SIET Dark Green matching Sidebar, seamless continuous header) */}
        <header className="hidden md:flex items-center justify-between h-14 px-8 bg-[#034419] border-b border-white/[0.08] text-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="text-emerald-200/80 font-mono tracking-wider text-[11px] uppercase">SIET AUTONOMOUS</span>
            <span className="text-white/30">/</span>
            <span className="text-white font-semibold">Project Review Committee (PRC)</span>
          </div>

          {/* Right: [👤 Profile Avatar Button] */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white transition cursor-pointer shadow-xs group"
              title="Faculty Advisor Profile & Credentials"
              aria-label="Open Faculty Advisor Profile"
            >
              <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white font-bold font-mono text-xs flex items-center justify-center border border-[#FACC15]/60 shadow-xs">
                {advisorInitials}
              </div>
              <span className="text-xs font-semibold text-white/95 group-hover:text-white max-w-[160px] truncate hidden sm:inline">
                {advisorName}
              </span>
            </button>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>

      {/* Slide-over Advisor Profile Drawer */}
      <AdvisorProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default AdvisorLayout;
