"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Users,
  FolderGit2,
  FileUp,
  Send,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { SietLogo } from "@/components/brand/siet-logo";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const studentNavItems: NavItem[] = [
  { label: "My Profile", href: "/student/profile", icon: User },
  { label: "My Team", href: "/student/team", icon: Users },
  { label: "Project Details", href: "/student/project", icon: FolderGit2 },
  { label: "Project Files", href: "/student/files", icon: FileUp },
  { label: "Final Submission", href: "/student/submission", icon: Send },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialize, logout } = useAuthStore();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-['Inter',sans-serif]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <SietLogo href="/student/profile" />
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          {mobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-200/90 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-slate-100">
            <SietLogo href="/student/profile" />
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Student Workspace
            </p>
            <nav className="space-y-1">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#0F5132] text-white shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-emerald-100" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
            <MonogramAvatar
              name={user?.full_name || "Student User"}
              size="md"
              variant="emerald"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {user?.full_name || "Student"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono truncate">
                {user?.roll_number || "Roll Number"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between px-2 text-[10px] text-slate-400">
            <span>Academic Year 2025–26</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-[#0F5132] font-semibold border border-emerald-100">
              PRC Portal
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between h-14 px-8 bg-white/80 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-400">SIET Autonomous</span>
            <span>/</span>
            <span className="text-slate-700">Department of Computer Science & Engineering</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              Student Role
            </span>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0F5132] hover:underline inline-flex items-center gap-1 font-medium"
            >
              API Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
