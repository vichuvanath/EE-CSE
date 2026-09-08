"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Check,
  Search,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
} from "lucide-react";
import GlideMenu from "@/components/primitives/GlideMenu";

/* ─────────────────────────────────────────────────────────
 * SIDEBAR MOTION TOKENS (Matching Reference Storyboard)
 * ───────────────────────────────────────────────────────── */
export const SIDEBAR_MOTION = {
  expandedWidth: 240,
  collapsedWidth: 64,
  duration: 280,
  copyDuration: 180,
  copyOffset: 8,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

const CHAT_SEARCH_MOTION = {
  duration: 180,
  closedWidth: 32,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

export interface SidebarNavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  count?: string;
  matchPrefix?: string;
}

export interface SidebarNavGroup {
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarWorkspace {
  key: "student" | "advisor" | "hod";
  name: string;
  subtitle?: string;
  monogram: string;
  role: string;
}

export const ALL_WORKSPACES: SidebarWorkspace[] = [
  {
    key: "advisor",
    name: "Advisor & Guide",
    subtitle: "PRC Supervision",
    monogram: "A",
    role: "Faculty Advisor",
  },
  {
    key: "student",
    name: "Student Portal",
    subtitle: "Project Workspace",
    monogram: "S",
    role: "Student Candidate",
  },
  {
    key: "hod",
    name: "HOD Supervision",
    subtitle: "Dept Administration",
    monogram: "H",
    role: "Head of Department",
  },
];

interface SidebarNavProps {
  currentWorkspace: SidebarWorkspace;
  navGroups: SidebarNavGroup[];
  user?: {
    name: string;
    subtext: string;
    avatarMonogram?: string;
  };
  variant?: "light" | "dark";
  onSignOut?: () => void;
  footerCallout?: ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  brandTitle?: string;
  disableWorkspaceSwitcher?: boolean;
  hideNavSearch?: boolean;
  hideGroupLabels?: boolean;
  simpleSignOutOnly?: boolean;
  hideCollapseButton?: boolean;
}

/* ─────────────────────────────────────────────────────────
 * WORKSPACE SWITCHER MODAL PORTAL (SIET-LMS Theme)
 * ───────────────────────────────────────────────────────── */
function WorkspaceDropdownMenu({
  position,
  activeKey,
  onClose,
  onSignOut,
}: {
  position: { top: number; left: number };
  activeKey: string;
  onClose: () => void;
  onSignOut?: () => void;
}) {
  const navigate = useNavigate();

  const handleSwitch = (key: string) => {
    onClose();
    if (key === "advisor") navigate("/advisor/dashboard");
    else if (key === "student") navigate("/student/profile");
    else if (key === "hod") navigate("/hod/dashboard");
  };

  return createPortal(
    <div
      data-workspace-menu
      className="fixed z-50 w-72 rounded-2xl p-2 shadow-overlay animate-pop-in bg-[#034419] border border-emerald-800 text-white"
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: "top left",
      }}
    >
      <GlideMenu
        className="flex flex-col gap-1"
        highlightClassName="inset-x-0 rounded-xl bg-[#064E1F] border border-emerald-700/50"
      >
        <div className="px-2.5 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider text-[#FACC15]">
          SWITCH PORTAL WORKSPACE
        </div>

        {ALL_WORKSPACES.map((ws) => {
          const isSelected = ws.key === activeKey;
          return (
            <button
              key={ws.key}
              data-row
              type="button"
              onClick={() => handleSwitch(ws.key)}
              className={`relative z-10 flex h-11 w-full items-center gap-2.5 rounded-xl px-2.5 text-left transition-colors ${
                isSelected
                  ? "bg-[#16A34A] text-white font-semibold shadow-xs border border-yellow-400/40"
                  : "text-emerald-100 hover:text-white"
              }`}
            >
              {/* Official SIET Crest Image */}
              <img
                src="/siet-logo.png"
                alt="SIET Crest"
                className="size-7 object-contain shrink-0 drop-shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-white flex items-center gap-1.5">
                  {ws.name}
                  {isSelected && (
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#FACC15] text-[#023814] font-bold font-mono">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="truncate text-[10px] text-[#FACC15]/90 font-mono">
                  {ws.subtitle}
                </div>
              </div>
              {isSelected && (
                <span className="shrink-0 text-[#FACC15]">
                  <Check size={16} />
                </span>
              )}
            </button>
          );
        })}

        <div className="my-1 h-px bg-emerald-900" />

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="relative z-10 flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-xs text-left text-emerald-200 hover:text-[#FACC15] transition-colors"
        >
          <ExternalLink size={14} className="shrink-0" />
          <span className="flex-1 truncate">Backend API Swagger Docs</span>
        </a>

        {onSignOut && (
          <button
            data-row
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="relative z-10 flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-xs text-left transition-colors text-rose-300 hover:bg-rose-950/40 hover:text-rose-100"
          >
            <LogOut size={14} className="shrink-0" />
            <span className="truncate">Sign out</span>
          </button>
        )}
      </GlideMenu>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────
 * MAIN SIDEBAR NAV COMPONENT (SIET-LMS Official Theme)
 * ───────────────────────────────────────────────────────── */
export function SidebarNav({
  currentWorkspace,
  navGroups,
  user,
  onSignOut,
  footerCallout,
  mobileOpen = false,
  onMobileClose,
  brandTitle,
  disableWorkspaceSwitcher = false,
  hideNavSearch = false,
  hideGroupLabels = false,
  simpleSignOutOnly = false,
  hideCollapseButton = false,
}: SidebarNavProps) {
  const location = useLocation();

  // Persistent collapsed state from localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (hideCollapseButton) return false;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("siet_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });

  const isCollapsed = hideCollapseButton ? false : collapsed;

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspacePosition, setWorkspacePosition] = useState({
    top: 0,
    left: 0,
  });

  const workspaceButtonRef = useRef<HTMLButtonElement>(null);

  // Sync collapsed state to localStorage
  const toggleCollapse = (next: boolean) => {
    setCollapsed(next);
    setWorkspaceOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("siet_sidebar_collapsed", String(next));
    }
  };

  // Close workspace menu when clicking outside
  useEffect(() => {
    if (!workspaceOpen) return;
    const handleClose = (e: PointerEvent) => {
      const target = e.target as Element;
      if (
        !target.closest("[data-workspace-trigger]") &&
        !target.closest("[data-workspace-menu]")
      ) {
        setWorkspaceOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClose);
    return () => document.removeEventListener("pointerdown", handleClose);
  }, [workspaceOpen]);



  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      <aside
        data-sidebar-collapsed={isCollapsed}
        aria-label="Workspace navigation"
        className={`fixed md:sticky top-0 left-0 h-screen shrink-0 overflow-hidden select-none z-50 md:z-20 transition-[width,transform] duration-280 bg-[#034419] border-r border-white/[0.08] text-white ${
          mobileOpen
            ? "translate-x-0 w-[240px] shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }`}
        style={
          {
            width: mobileOpen
              ? SIDEBAR_MOTION.expandedWidth
              : isCollapsed
              ? SIDEBAR_MOTION.collapsedWidth
              : SIDEBAR_MOTION.expandedWidth,
            transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
            transitionTimingFunction: SIDEBAR_MOTION.easing,
            "--sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
            "--sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
            "--sidebar-easing": SIDEBAR_MOTION.easing,
          } as CSSProperties
        }
      >
        {/* Fixed-width inner column preserves icon alignment perfectly */}
        <div className="flex min-h-0 w-[240px] h-full shrink-0 flex-col justify-between">
          {/* TOP SECTION */}
          <div className="flex flex-col min-h-0 flex-1">
            {/* 1. Header with Official SIET Logo & Workspace Switcher */}
            <div className="relative h-14 shrink-0 px-3 flex items-center border-b border-white/[0.08]">
              {/* Workspace Switcher or Fixed Brand Title */}
              {disableWorkspaceSwitcher ? (
                <div
                  className="flex h-10 w-full items-center px-1 select-none"
                  aria-hidden={isCollapsed}
                >
                  {/* Official College Crest Logo */}
                  <img
                    src="/siet-logo.png"
                    alt="SIET Official Crest"
                    className="size-8 object-contain shrink-0 drop-shadow-xs"
                  />
                  <div className="sidebar-copy ml-2.5 min-w-0 flex-1">
                    <div className="truncate text-xs font-bold font-['IBM_Plex_Sans',sans-serif] text-white">
                      {brandTitle || currentWorkspace.name}
                    </div>
                    {currentWorkspace.subtitle && (
                      <div className="truncate text-[10.5px] text-[#FACC15] font-semibold font-mono">
                        {currentWorkspace.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  ref={workspaceButtonRef}
                  data-workspace-trigger
                  type="button"
                  aria-expanded={workspaceOpen}
                  aria-hidden={isCollapsed}
                  tabIndex={isCollapsed ? -1 : 0}
                  onClick={() => {
                    if (!workspaceOpen && workspaceButtonRef.current) {
                      const rect =
                        workspaceButtonRef.current.getBoundingClientRect();
                      setWorkspacePosition({
                        top: rect.bottom + 6,
                        left: rect.left,
                      });
                    }
                    setWorkspaceOpen((prev) => !prev);
                  }}
                  className={`sidebar-workspace-control ${
                    hideCollapseButton
                      ? "flex h-10 w-full items-center justify-between rounded-lg px-2 text-left transition-all duration-100 hover:bg-white/10 active:scale-[0.99]"
                      : "absolute left-2 top-2 flex h-10 w-[180px] items-center rounded-md px-2 text-left transition-all duration-100 hover:bg-white/10 active:scale-[0.99]"
                  }`}
                  title="Switch Workspace Portal"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Official College Crest Logo from Asset */}
                    <img
                      src="/siet-logo.png"
                      alt="SIET Official Crest"
                      className="sidebar-logo size-8 object-contain shrink-0 drop-shadow-xs"
                    />
                    <div className="sidebar-copy min-w-0 flex-1">
                      <div className="truncate text-xs font-bold font-['IBM_Plex_Sans',sans-serif] text-white">
                        {currentWorkspace.name}
                      </div>
                      <div className="truncate text-[10.5px] text-[#FACC15] font-semibold font-mono">
                        {currentWorkspace.subtitle || "SIET-LMS"}
                      </div>
                    </div>
                  </div>
                  <span className="sidebar-copy ml-1 flex shrink-0 text-emerald-300">
                    <ChevronDown size={14} />
                  </span>
                </button>
              )}

              {/* Workspace Switcher Dropdown */}
              {!disableWorkspaceSwitcher && workspaceOpen && (
                <WorkspaceDropdownMenu
                  position={workspacePosition}
                  activeKey={currentWorkspace.key}
                  onClose={() => setWorkspaceOpen(false)}
                  onSignOut={onSignOut}
                />
              )}

              {/* Collapse Button (Visible when Expanded and not hidden) */}
              {!hideCollapseButton && (
                <button
                  type="button"
                  aria-label="Collapse sidebar"
                  aria-hidden={isCollapsed}
                  tabIndex={isCollapsed ? -1 : 0}
                  onClick={() => toggleCollapse(true)}
                  className="sidebar-collapse-control absolute right-2 top-3 flex size-8 items-center justify-center rounded-lg text-emerald-300 hover:text-[#FACC15] hover:bg-white/10 transition-all duration-150"
                  title="Collapse sidebar (icons only)"
                >
                  <PanelLeftClose size={17} />
                </button>
              )}

              {/* Compact Logo & Expand Button (Visible when Collapsed and not hidden) */}
              {!hideCollapseButton && (
                <div
                  className="sidebar-expand-control absolute left-2 top-2 flex flex-col items-center justify-center w-12"
                  aria-hidden={!isCollapsed}
                >
                  <button
                    type="button"
                    tabIndex={isCollapsed ? 0 : -1}
                    onClick={() => toggleCollapse(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-[#FACC15] transition-all"
                    title="Expand sidebar"
                    aria-label="Expand sidebar"
                  >
                    <img
                      src="/siet-logo.png"
                      alt="SIET Official Logo"
                      className="size-8 object-contain drop-shadow-xs"
                    />
                    <div className="mt-1 flex justify-center text-emerald-300 hover:text-[#FACC15]">
                      <PanelLeftOpen size={16} />
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Groups with GlideMenu Hover Highlight */}
            <div className="flex-1 overflow-y-auto px-1 pt-3 space-y-3 scrollbar-none">
              {navGroups.map((grp, gIdx) => {
                const visibleItems = grp.items;

                return (
                  <div key={grp.label || gIdx} className="space-y-0.5">
                    {!hideGroupLabels && grp.label && (
                      <div className="sidebar-copy px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider text-[#FACC15]">
                        {grp.label}
                      </div>
                    )}

                    <GlideMenu
                      rowSelector="[data-row]"
                      highlightClassName="rounded-lg bg-white/[0.07] border border-white/[0.08]"
                      className="flex flex-col gap-0.5"
                    >
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isExactActive =
                          location.pathname === item.href ||
                          (Boolean(item.matchPrefix) &&
                            (location.pathname === item.matchPrefix ||
                              location.pathname.startsWith(
                                `${item.matchPrefix}/`
                              )));

                        return (
                          <Link
                            key={item.key}
                            data-row
                            to={item.href}
                            onClick={() => onMobileClose?.()}
                            title={isCollapsed ? item.label : undefined}
                            className={`sidebar-row relative z-10 mx-2.5 flex h-9.5 items-center rounded-lg px-3 text-left transition-all duration-150 active:scale-[0.98] ${
                              isExactActive
                                ? "bg-white/[0.12] text-white font-semibold shadow-xs border-l-[3px] border-[#FACC15]"
                                : "text-emerald-100/90 hover:text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            <span
                              className={`flex size-5 shrink-0 items-center justify-center ${
                                isExactActive
                                  ? "text-[#FACC15]"
                                  : "text-emerald-300"
                              }`}
                            >
                              <Icon size={17} />
                            </span>
                            <span
                              className={`sidebar-copy ml-2.5 min-w-0 flex-1 truncate text-xs font-medium ${
                                isExactActive
                                  ? "text-white font-semibold"
                                  : "text-emerald-100/90"
                              }`}
                            >
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`sidebar-copy ml-1 shrink-0 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                  isExactActive
                                    ? "bg-[#FACC15] text-[#023814]"
                                    : "bg-white/[0.08] text-emerald-200 border border-white/10"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.count && (
                              <span className="sidebar-copy ml-1 shrink-0 text-[10px] font-mono tabular-nums text-emerald-300">
                                {item.count}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </GlideMenu>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM FOOTER SECTION */}
          <div className="shrink-0 p-3 bg-[#034419] border-t border-white/[0.08]">
            {simpleSignOutOnly ? (
              onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0" : "justify-center gap-2.5 px-3"
                  } py-2.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-emerald-100 hover:text-rose-200 border border-white/[0.08] hover:border-rose-500/30 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-2xs`}
                  title="Sign out"
                >
                  <LogOut size={15} className="text-emerald-300 hover:text-rose-300 shrink-0" />
                  {!isCollapsed && <span className="sidebar-copy">Logout</span>}
                </button>
              )
            ) : (
              <>
                {/* Optional Callout / Academic Phase pill */}
                {footerCallout && (
                  <div className="sidebar-copy mb-2 px-1 text-xs">
                    {footerCallout}
                  </div>
                )}

                {/* User Profile Summary Card */}
                {user && (
                  <div className="flex items-center gap-2 p-1.5 rounded-xl border bg-white/[0.05] border-white/[0.08] text-emerald-100 shadow-2xs">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 text-white bg-[#16A34A] border border-[#FACC15]/60 shadow-xs"
                      title={user.name}
                    >
                      {user.avatarMonogram || user.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="sidebar-copy min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-white">
                        {user.name}
                      </div>
                      <div className="truncate text-[10px] text-[#FACC15] font-mono">
                        {user.subtext}
                      </div>
                    </div>

                    {onSignOut && (
                      <button
                        type="button"
                        onClick={onSignOut}
                        className="sidebar-copy p-1.5 rounded-lg text-emerald-300 hover:text-[#FACC15] hover:bg-white/10 transition shrink-0 cursor-pointer"
                        title="Sign out"
                      >
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarNav;
