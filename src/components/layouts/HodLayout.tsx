"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  GraduationCap,
  Briefcase,
  Award,
  ClipboardCheck,
  FileBarChart,
  BarChart3,
  UserCog,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { BatchSelector } from "@/components/hod/BatchSelector";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export function HodLayout({ children }: { children: React.ReactNode }) {
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

  const hodNavItems: NavItem[] = [
    { label: "Dashboard", href: "/hod/dashboard", icon: LayoutDashboard },
    { label: "Faculty & Guides", href: "/hod/faculty", icon: Users },
    { label: "Teams", href: "/hod/teams", icon: FolderKanban },
    { label: "Students", href: "/hod/students", icon: GraduationCap },
    { label: "Projects", href: "/hod/projects", icon: Briefcase },
    { label: "Evaluations", href: "/hod/evaluations", icon: Award },
    { label: "Approvals", href: "/hod/approvals", icon: ClipboardCheck, badge: 3 },
    { label: "Reports", href: "/hod/reports", icon: FileBarChart },
    { label: "Analytics", href: "/hod/analytics", icon: BarChart3 },
    { label: "My Profile", href: "/hod/profile", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col md:flex-row font-['Inter',sans-serif]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#1E293B] border-b border-slate-700 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">HOD Console</span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
          aria-label="Toggle Navigation"
        >
          {mobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[270px] bg-[#1E293B] flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Branding */}
          <div className="p-5 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-900/30 border border-indigo-500/30 shrink-0">
                <Building2 className="w-5 h-5 text-indigo-100" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border-2 border-[#1E293B]"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white leading-none font-['Plus_Jakarta_Sans',sans-serif]">
                  SIET <span className="text-indigo-400">HOD</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase mt-1">
                  Department Console
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-4">
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Department Management
            </p>
            <nav className="space-y-0.5">
              {hodNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/hod/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/30 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-indigo-200" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-700/80 bg-[#172033]">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/80 border border-slate-600/40">
            <MonogramAvatar
              name={user?.full_name || "Head of Department"}
              size="md"
              variant="teal"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {user?.full_name || "HOD"}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.email || "hod@college.edu"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between px-2 text-[10px] text-slate-500">
            <span>Department Console</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300 font-semibold border border-indigo-700/40">
              HOD · CSE
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between h-14 px-8 bg-[#1E293B]/95 backdrop-blur-sm border-b border-slate-700/60 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="text-slate-500">SIET Autonomous</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Computer Science & Engineering</span>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-400 font-semibold">Head of Department</span>
          </div>

          <div className="flex items-center gap-4">
            <BatchSelector />
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-700/40 font-mono">
              HOD Console
            </span>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
