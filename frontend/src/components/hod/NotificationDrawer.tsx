import React, { useState } from "react";
import {
  X,
  CheckCheck,
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";
import { Link } from "react-router-dom";

export function NotificationDrawer() {
  const {
    notifications,
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    markNotificationRead,
    markAllNotificationsRead,
  } = useHodStore();

  const [filterTab, setFilterTab] = useState<
    "ALL" | "UNREAD" | "EVALUATION" | "ADMIN"
  >("ALL");

  if (!notificationDrawerOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (filterTab === "UNREAD") return !n.is_read;
    if (filterTab === "EVALUATION") return n.type === "EVALUATION";
    if (filterTab === "ADMIN") return n.type === "ADMIN";
    return true;
  });

  const renderIcon = (category: string) => {
    switch (category) {
      case "ALERT":
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#1E293B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
                Department Alerts
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white font-mono">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Live regulatory & supervisory audit feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-3 border-b border-slate-100 bg-slate-50 overflow-x-auto text-xs">
          {[
            { key: "ALL", label: "All Alerts" },
            { key: "UNREAD", label: `Unread (${unreadCount})` },
            { key: "EVALUATION", label: "Evaluations" },
            { key: "ADMIN", label: "Admin Audits" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterTab === tab.key
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No alerts found</p>
              <p className="text-xs text-slate-400 mt-1">
                You're all caught up with department activities.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                  !item.is_read
                    ? "bg-indigo-50/40 border-indigo-200 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {!item.is_read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                )}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{renderIcon(item.category)}</div>
                  <div className="flex-1 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.timestamp}
                      </span>
                      {item.link && (
                        <Link
                          to={item.link}
                          onClick={() => setNotificationDrawerOpen(false)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                        >
                          <span>View details</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono">
          SIET Autonomous · Quality Governance Feed
        </div>
      </div>
    </div>
  );
}
