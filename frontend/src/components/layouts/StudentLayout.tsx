import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Users,
  FolderGit2,
  FileUp,
  Send,
  History,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { mockStudentUser } from "@/lib/mock-fallback";
import { SidebarNav, type SidebarNavGroup, type SidebarWorkspace } from "@/components/navigation/SidebarNav";
import { StudentProfileDrawer } from "@/components/student/StudentProfileDrawer";

const studentNavGroups: SidebarNavGroup[] = [
  {
    items: [
      { key: "team", label: "My Team", href: "/student/team", icon: Users },
      { key: "project", label: "Project Details", href: "/student/project", icon: FolderGit2 },
      { key: "files", label: "Project Files", href: "/student/files", icon: FileUp },
      { key: "submission", label: "Submission", href: "/student/submission", icon: Send },
      { key: "my-submissions", label: "My Submissions", href: "/student/my-submissions", icon: History },
    ],
  },
];

const studentWorkspace: SidebarWorkspace = {
  key: "student",
  name: "SIET-EE",
  subtitle: "Student Portal",
  monogram: "S",
  role: "Student Candidate",
};

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/student/team")) return "My Team";
  if (pathname.includes("/student/project")) return "Project Details";
  if (pathname.includes("/student/files")) return "Project Files";
  if (pathname.includes("/student/submission")) return "Final Submission";
  if (pathname.includes("/student/my-submissions") || pathname.includes("/student/my-submission")) {
    return "My Submissions";
  }
  return "Student Workspace";
};

export function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initialize, logout, setAuth } = useAuthStore();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Ensure user is authenticated as student when accessing student workspace
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("siet_access_token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("siet_user") : null;
    let parsed: any = null;
    try {
      if (userStr) parsed = JSON.parse(userStr);
    } catch {}

    if (!token || !parsed || parsed.role !== "student") {
      setAuth(mockStudentUser.user, mockStudentUser.access_token);
    }
  }, [setAuth]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Initials for top-right profile button (e.g. KS / RS)
  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SC";

  return (
    <div className="min-h-screen bg-[#F4FAF6] flex flex-col md:flex-row font-['IBM_Plex_Sans',sans-serif]">
      {/* Mobile Header: [Logo + Portal Name] [Page Title] [👤 Profile] */}
      <header className="md:hidden flex items-center justify-between p-3.5 bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/siet-logo.png"
            alt="SIET Logo"
            className="w-7 h-7 object-contain drop-shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#034419] leading-none truncate">
              SIET-EE
            </div>
            <div className="text-[11px] font-bold text-slate-900 leading-none mt-1 truncate">
              {pageTitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Profile Icon */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-[#034419] hover:bg-[#023112] text-white font-bold font-mono text-xs flex items-center justify-center border border-emerald-800 shadow-xs cursor-pointer"
            aria-label="Student Profile"
            title="Student Profile & Academic Record"
          >
            {userInitials}
          </button>
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <SidebarNav
        currentWorkspace={studentWorkspace}
        navGroups={studentNavGroups}
        brandTitle="SIET-EE"
        disableWorkspaceSwitcher
        hideCollapseButton
        hideNavSearch
        hideGroupLabels
        simpleSignOutOnly
        onSignOut={handleLogout}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Topbar: [Logo + Portal Name] [Page Title] [👤 Profile] at the top */}
        <header className="hidden md:flex items-center justify-between h-14 px-8 bg-white border-b border-slate-200/90 text-slate-900 sticky top-0 z-20 shadow-xs">
          {/* Left: [Logo + Portal Name] & [Page Title] */}
          <div className="flex items-center gap-4 min-w-0">
            {/* [Logo + Portal Name] */}
            <div className="flex items-center gap-2.5 shrink-0">
              <img
                src="/siet-logo.png"
                alt="SIET Crest"
                className="w-7 h-7 object-contain drop-shadow-xs"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#034419] tracking-tight leading-none">
                  SIET-EE
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  Student Portal
                </span>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-200 shrink-0" />

            {/* [Page Title] */}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right: [👤 Profile] */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="w-8 h-8 rounded-full bg-[#034419] hover:bg-[#023112] text-white font-bold font-mono text-xs flex items-center justify-center border border-emerald-800 shadow-xs hover:ring-2 hover:ring-[#034419]/25 transition cursor-pointer"
              title="Student Profile & Academic Record"
              aria-label="Open Student Profile"
            >
              {userInitials}
            </button>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>

      {/* Slide-over Profile Drawer (Keeps all existing profile features and functionality) */}
      <StudentProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default StudentLayout;
