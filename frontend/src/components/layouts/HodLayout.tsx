import React, { useEffect, useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  FileBarChart,
  History,
  UserCog,
  Settings,
  Bell,
  Menu,
  X,
  ChevronRight,
  FolderPlus,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationDrawer } from "@/components/hod/NotificationDrawer";
import {
  SidebarNav,
  type SidebarNavGroup,
  type SidebarWorkspace,
} from "@/components/navigation/SidebarNav";

const hodNavGroups: SidebarNavGroup[] = [
  {
    label: "MAIN",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        href: "/hod/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "ACADEMIC SUPERVISION",
    items: [
      {
        key: "management",
        label: "Management & Control",
        href: "/hod/management",
        icon: SlidersHorizontal,
        matchPrefix: "/hod/management",
      },
      {
        key: "batches-new",
        label: "Add New Batch",
        href: "/hod/batches/new",
        icon: FolderPlus,
        matchPrefix: "/hod/batches/new",
        badge: "New",
      },
      {
        key: "advisors",
        label: "Advisors & Guides",
        href: "/hod/advisors",
        icon: Users,
        matchPrefix: "/hod/advisors",
      },
    ],
  },
  {
    label: "INSIGHTS & GOVERNANCE",
    items: [
      {
        key: "reports",
        label: "Reports & Exports",
        href: "/hod/reports",
        icon: FileBarChart,
      },
      {
        key: "change-history",
        label: "Change History Audit",
        href: "/hod/change-history",
        icon: History,
        badge: "Admin",
      },
    ],
  },
  {
    label: "SYSTEM & PROFILE",
    items: [
      {
        key: "profile",
        label: "My Profile",
        href: "/hod/profile",
        icon: UserCog,
      },
      {
        key: "settings",
        label: "Settings",
        href: "/hod/settings",
        icon: Settings,
      },
    ],
  },
];

const hodWorkspace: SidebarWorkspace = {
  key: "hod",
  name: "HOD Console",
  subtitle: "EE & CSE Dept",
  monogram: "H",
  role: "Head of Department",
};

export function HodLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { academicYear, notifications, setNotificationDrawerOpen } = useHodStore();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("siet_access_token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("siet_user") : null;
    let parsed: any = null;
    try {
      if (userStr) parsed = JSON.parse(userStr);
    } catch {}

    if (!token || !parsed || (parsed.role !== "hod" && parsed.role !== "admin")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F4FAF6] flex flex-col md:flex-row font-['IBM_Plex_Sans',sans-serif]">
      {/* 1. Global Notification Drawer */}
      <NotificationDrawer />

      {/* 2. Mobile Sticky Header (SIET Dark Green) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#034419] border-b border-white/[0.08] h-14 px-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <img
            src="/siet-logo.png"
            alt="SIET Official Logo"
            className="w-8 h-8 object-contain drop-shadow-xs"
          />
          <div>
            <h1 className="text-sm font-bold font-['IBM_Plex_Sans',sans-serif] leading-none">
              HOD <span className="text-[#FACC15]">Console</span>
            </h1>
            <p className="text-[10px] text-emerald-200/90 font-mono mt-0.5">
              EE & CSE Dept · SIET
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-emerald-200 hover:text-white relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FACC15] text-[#023814] text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-emerald-200 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 3. Static Sidebar Navigation (SIET Theme - No Toggle, Simple Logout Only) */}
      <SidebarNav
        currentWorkspace={hodWorkspace}
        navGroups={hodNavGroups}
        disableWorkspaceSwitcher={true}
        hideCollapseButton={true}
        simpleSignOutOnly={true}
        onSignOut={handleSignOut}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* 4. Canvas Area: Topbar + Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Topbar (SIET Dark Green matching Sidebar, seamless continuous header) */}
        <header className="hidden md:flex h-14 bg-[#034419] border-b border-white/[0.08] px-8 items-center justify-between text-white sticky top-0 z-20 shadow-xs">
          {/* Left Breadcrumb */}
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="text-emerald-200/80 font-mono tracking-wider text-[11px] uppercase">SIET AUTONOMOUS</span>
            <span className="text-white/30">/</span>
            <span className="text-white">Department of Electrical &amp; Computer Engineering</span>
            <span className="text-white/30">/</span>
            <span className="text-white font-semibold">HOD Academic Supervision</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Academic Year Pill */}
            <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-emerald-200">
              AY {academicYear}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-2 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 text-emerald-100 hover:text-white transition relative cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FACC15] text-[#023814] text-[10px] font-bold flex items-center justify-center font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Link */}
            <Link
              to="/hod/profile"
              className="flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white transition cursor-pointer shadow-xs group"
              title="HOD Profile & Credentials"
            >
              <div className="w-7 h-7 rounded-full bg-[#16A34A] border border-[#FACC15]/60 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
                SK
              </div>
              <span className="text-xs font-semibold text-white/95 group-hover:text-white max-w-[160px] truncate hidden sm:inline">
                {user?.full_name || "Dr. K. Senthil Kumar"}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FACC15] text-[#023814] font-mono">
                HOD
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default HodLayout;
