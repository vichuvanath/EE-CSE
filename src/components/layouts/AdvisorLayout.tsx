"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Award,
  FolderClock,
  UserCheck,
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
  badge?: number;
}

export function AdvisorLayout({ children }: { children: React.ReactNode }) {
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

  const advisorNavItems: NavItem[] = [
    { label: "Dashboard", href: "/advisor/dashboard", icon: LayoutDashboard },
    { label: "Evaluation", href: "/advisor/teams", icon: Award },
    { label: "Evaluation Records", href: "/advisor/records", icon: FolderClock },
    { label: "Students", href: "/advisor/students", icon: GraduationCap },
    { label: "My Profile", href: "/advisor/profile", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-['Inter',sans-serif]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <SietLogo href="/advisor/dashboard" />
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
        className={`fixed md:sticky top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-200/90 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div>
          <div className="p-5 border-b border-slate-100">
            <SietLogo href="/advisor/dashboard" />
          </div>

          <div className="px-3 py-4">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Faculty / Advisor Console
            </p>
            <nav className="space-y-1">
              {advisorNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/advisor/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-[#0F5132] text-white shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-100" : "text-slate-500"
                          }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
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
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
            <MonogramAvatar
              name={user?.full_name || "Faculty Advisor"}
              size="md"
              variant="teal"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {user?.full_name || "Advisor"}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {user?.email || "advisor@college.edu"}
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
            <span>Advisor Console</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-teal-50 text-[#216963] font-semibold border border-teal-100">
              PRC Guide
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
            <span className="text-slate-700">Project Review Committee (PRC)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              Faculty / Advisor Role
            </span>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0F5132] hover:underline inline-flex items-center gap-1 font-medium"
            >
              API Swagger <ExternalLink className="w-3 h-3" />
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
