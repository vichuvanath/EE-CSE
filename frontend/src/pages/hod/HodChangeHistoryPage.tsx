import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Info,
  Clock,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useHodAdminChanges } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { AssignmentChangeRecord } from "@/types/hod";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function HodChangeHistoryPage() {
  const { academicYear, selectedBatch } = useHodStore();
  const { data: changes, isLoading } = useHodAdminChanges();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedChange, setSelectedChange] =
    useState<AssignmentChangeRecord | null>(null);

  const filtered = (changes || []).filter((chg) => {
    if (typeFilter !== "ALL" && chg.change_type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeam = chg.team_name.toLowerCase().includes(q);
      const matchAdmin = chg.changed_by.name.toLowerCase().includes(q);
      const matchReason = chg.reason.toLowerCase().includes(q);
      if (!matchTeam && !matchAdmin && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
              ADMIN AUDIT LOG
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Institutional Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] font-['IBM_Plex_Sans',sans-serif]">
            Administrative Change History Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of all centralized reassignments, guide allocations, and deadline alterations executed by Central Admin.
          </p>
        </div>
      </div>

      {/* 2. Institutional Separation of Concerns Dark Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-lg border border-slate-800 shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-['IBM_Plex_Sans',sans-serif]">
              Institutional Separation of Concerns Notice
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed max-w-3xl">
              Student cohort enrollment, project guide provisioning, and official re-allocations are maintained exclusively by the <strong>Central Academic Administration</strong>. The Head of Department (HOD) console maintains real-time supervisory audit transparency and side-by-side state verification.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Audit Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team, administrator, or justification..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono">Change Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Administrative Events</option>
            <option value="GUIDE_REASSIGNMENT">Guide Reassignment</option>
            <option value="ADVISOR_REASSIGNMENT">Advisor Reassignment</option>
            <option value="STUDENT_TRANSFER">Student Transfer</option>
            <option value="STAGE_EXTENDED">Deadline Extension</option>
          </select>
        </div>
      </div>

      {/* 4. Audit Table with Mantine DataTable Row Expansion */}
      <DataTable<AssignmentChangeRecord>
        withTableBorder
        withColumnBorders
        records={filtered}
        idAccessor="id"
        noRecordsText="No administrative change events match the active filters"
        columns={[
          {
            accessor: "timestamp",
            title: "TIMESTAMP",
            render: (chg) => (
              <span className="font-mono text-slate-500 whitespace-nowrap">
                {chg.timestamp}
              </span>
            ),
          },
          {
            accessor: "change_type",
            title: "CHANGE EVENT",
            render: (chg) => (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                  chg.change_type === "GUIDE_REASSIGNMENT"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : chg.change_type === "STAGE_EXTENDED"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
              >
                {chg.change_type.replace("_", " ")}
              </span>
            ),
          },
          {
            accessor: "team_name",
            title: "IMPACTED TEAM",
            render: (chg) => (
              <span className="font-bold text-slate-900">
                {chg.team_name}
              </span>
            ),
          },
          {
            accessor: "changed_by",
            title: "EXECUTED BY (ADMIN)",
            render: (chg) => (
              <div>
                <div className="font-semibold text-slate-800">
                  {chg.changed_by.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {chg.changed_by.email}
                </div>
              </div>
            ),
          },
          {
            accessor: "reason",
            title: "RECORDED JUSTIFICATION",
            render: (chg) => (
              <div className="text-slate-600 max-w-sm leading-relaxed truncate">
                {chg.reason}
              </div>
            ),
          },
          {
            accessor: "actions",
            title: "AUDIT ACTION",
            textAlignment: "right",
            render: (chg) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChange(chg);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0F5132] border border-emerald-200 transition cursor-pointer"
              >
                Compare
              </button>
            ),
          },
        ]}
        rowExpansion={{
          allowMultiple: true,
          content: ({ record: chg }) => (
            <div className="p-5 bg-[#F8FDF9] space-y-4 border-t border-b border-emerald-100/80">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F5132] font-bold">
                    AUDIT TRAIL STATE COMPARISON
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                    {chg.team_name} · {chg.change_type.replace("_", " ")}
                  </h4>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  Executed by{" "}
                  <span className="font-semibold text-slate-800">
                    {chg.changed_by.name}
                  </span>{" "}
                  ({chg.timestamp})
                </div>
              </div>

              {/* Side by side before & after */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Card */}
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h5 className="text-[11px] font-bold uppercase font-mono text-rose-800 tracking-wider">
                      Previous State (Before)
                    </h5>
                  </div>
                  {chg.before_state.guide && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Prior Guide:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {chg.before_state.guide}
                      </span>
                    </div>
                  )}
                  {chg.before_state.advisor && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Prior Advisor:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {chg.before_state.advisor}
                      </span>
                    </div>
                  )}
                  {chg.before_state.details && (
                    <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-rose-100 leading-relaxed font-mono text-[11px]">
                      {chg.before_state.details}
                    </div>
                  )}
                </div>

                {/* After Card */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h5 className="text-[11px] font-bold uppercase font-mono text-emerald-800 tracking-wider">
                      Updated State (After)
                    </h5>
                  </div>
                  {chg.after_state.guide && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Newly Assigned Guide:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {chg.after_state.guide}
                      </span>
                    </div>
                  )}
                  {chg.after_state.advisor && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Newly Assigned Advisor:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {chg.after_state.advisor}
                      </span>
                    </div>
                  )}
                  {chg.after_state.details && (
                    <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed font-mono text-[11px]">
                      {chg.after_state.details}
                    </div>
                  )}
                </div>
              </div>

              {/* Justification Block */}
              <div className="p-3.5 rounded-xl bg-white border border-emerald-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Recorded Administrative Justification:
                </span>
                <p className="text-xs text-slate-800 italic leading-relaxed">
                  "{chg.reason}"
                </p>
                <div className="text-[10px] text-slate-400 font-mono mt-1.5 pt-1.5 border-t border-slate-100">
                  Certified by: {chg.changed_by.name} ({chg.changed_by.role})
                </div>
              </div>
            </div>
          ),
        }}
      />

      {/* 5. Side-by-Side Before/After Comparison Modal */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedChange(null)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#1E293B] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                  Side-by-Side Audit Comparison
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  {selectedChange.team_name} · {selectedChange.change_type.replace("_", " ")}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Executed by {selectedChange.changed_by.name} ({selectedChange.timestamp})
                </p>
              </div>
              <button
                onClick={() => setSelectedChange(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Diff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Card */}
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-bold uppercase font-mono text-rose-800 tracking-wider">
                      Previous State (Before)
                    </h4>
                  </div>

                  {selectedChange.before_state.guide && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Prior Guide:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {selectedChange.before_state.guide}
                      </span>
                    </div>
                  )}

                  {selectedChange.before_state.advisor && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Prior Advisor:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {selectedChange.before_state.advisor}
                      </span>
                    </div>
                  )}

                  {selectedChange.before_state.details && (
                    <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-rose-100 leading-relaxed font-mono text-[11px]">
                      {selectedChange.before_state.details}
                    </div>
                  )}
                </div>

                {/* After Card */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-bold uppercase font-mono text-emerald-800 tracking-wider">
                      Updated State (After)
                    </h4>
                  </div>

                  {selectedChange.after_state.guide && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Newly Assigned Guide:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {selectedChange.after_state.guide}
                      </span>
                    </div>
                  )}

                  {selectedChange.after_state.advisor && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Newly Assigned Advisor:
                      </span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {selectedChange.after_state.advisor}
                      </span>
                    </div>
                  )}

                  {selectedChange.after_state.details && (
                    <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed font-mono text-[11px]">
                      {selectedChange.after_state.details}
                    </div>
                  )}
                </div>
              </div>

              {/* Justification Block */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Recorded Administrative Justification
                </span>
                <p className="text-xs text-slate-800 italic leading-relaxed">
                  "{selectedChange.reason}"
                </p>
                <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200">
                  Certified by: {selectedChange.changed_by.name} ({selectedChange.changed_by.role})
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedChange(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
