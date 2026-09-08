import React, { useState } from "react";
import {
  X,
  History,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Layers,
  Users,
  UserCheck,
  FolderTree,
  User,
} from "lucide-react";
import {
  ActivityHistoryRecord,
  HodManagementService,
} from "@/services/hod-management.service";

interface ActivityHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityHistoryDrawer({
  isOpen,
  onClose,
}: ActivityHistoryDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");

  if (!isOpen) return null;

  const historyLogs = HodManagementService.getActivityHistory();

  const filteredLogs = historyLogs.filter((log) => {
    if (actionFilter !== "ALL" && log.action_type !== actionFilter) {
      return false;
    }
    if (entityFilter !== "ALL" && log.entity_type !== entityFilter) {
      return false;
    }
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      log.description.toLowerCase().includes(term) ||
      log.entity_name.toLowerCase().includes(term) ||
      log.user_name.toLowerCase().includes(term) ||
      log.action_type.toLowerCase().includes(term)
    );
  });

  const getActionBadgeColor = (type: ActivityHistoryRecord["action_type"]) => {
    switch (type) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "REASSIGN":
      case "ASSIGN":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "MOVE":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "UPDATE":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "DEACTIVATE":
      case "DELETE":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getEntityIcon = (type: ActivityHistoryRecord["entity_type"]) => {
    switch (type) {
      case "BATCH":
        return <Calendar className="w-3.5 h-3.5" />;
      case "CLASS":
        return <FolderTree className="w-3.5 h-3.5" />;
      case "STUDENT":
        return <User className="w-3.5 h-3.5" />;
      case "ADVISOR":
        return <UserCheck className="w-3.5 h-3.5" />;
      case "GUIDE":
        return <Users className="w-3.5 h-3.5" />;
      case "TEAM":
      case "PROJECT":
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/15">
              <History className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Management Activity History</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-emerald-200 border border-white/15">
                  Audit Log
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Automatic record of all administrative updates and reassignments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions, entities, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Filter className="w-3 h-3" />
              <span>Action:</span>
            </div>
            {(["ALL", "CREATE", "UPDATE", "ASSIGN", "REASSIGN", "MOVE", "DEACTIVATE"] as const).map(
              (act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActionFilter(act)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                    actionFilter === act
                      ? "bg-[#034419] text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {act}
                </button>
              )
            )}
          </div>
        </div>

        {/* Log Entries Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              No activity logs match your filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 shadow-none"
              >
                {/* Header: Date + Action Pill */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{log.date_formatted}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadgeColor(
                        log.action_type
                      )}`}
                    >
                      {log.action_type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {getEntityIcon(log.entity_type)}
                      <span>{log.entity_type}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-xs font-semibold text-slate-900 leading-snug">
                  {log.description}
                </div>

                {/* State Transition Diff */}
                {(log.previous_value || log.new_value) && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-mono flex items-center justify-between gap-2">
                    <div className="truncate flex-1">
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">
                        Before
                      </span>
                      <span className="text-slate-600 truncate block">
                        {log.previous_value || "None"}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="truncate flex-1 text-right">
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">
                        After
                      </span>
                      <span className="text-emerald-800 font-bold truncate block">
                        {log.new_value || "Updated"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actor Footer */}
                <div className="pt-1 flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-100">
                  <span>
                    Actor: <strong className="text-slate-600">{log.user_name}</strong>
                  </span>
                  <span>{log.user_role}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            {filteredLogs.length} of {historyLogs.length} Records Shown
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
