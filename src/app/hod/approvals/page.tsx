"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  FileText,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useHodApprovals } from "@/hooks/use-hod";
import { formatDateTime } from "@/lib/utils";
import type { HodApprovalRecord } from "@/types";

export default function HodApprovalsPage() {
  const allApprovals = useHodApprovals();
  const [tab, setTab] = useState<"PENDING" | "COMPLETED">("PENDING");
  const [localApprovals, setLocalApprovals] = useState<HodApprovalRecord[]>(allApprovals);
  const [remarksModal, setRemarksModal] = useState<{
    id: string;
    action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [remarksText, setRemarksText] = useState("");

  const pending = localApprovals.filter((a) => a.status === "PENDING");
  const completed = localApprovals.filter((a) => a.status !== "PENDING");
  const display = tab === "PENDING" ? pending : completed;

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setRemarksModal({ id, action });
    setRemarksText("");
  };

  const confirmAction = () => {
    if (!remarksModal) return;
    setLocalApprovals((prev) =>
      prev.map((a) =>
        a.id === remarksModal.id
          ? { ...a, status: remarksModal.action, remarks: remarksText || a.remarks }
          : a
      )
    );
    setRemarksModal(null);
    setRemarksText("");
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "PROJECT_PROPOSAL":
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case "GUIDE_CHANGE":
        return <Users className="w-4 h-4 text-violet-500" />;
      case "EXTENSION":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "FINAL_SUBMISSION":
        return <Send className="w-4 h-4 text-emerald-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Review and manage pending approval requests from teams and faculty."
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Approvals" },
        ]}
        badge={
          pending.length > 0 ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-semibold animate-pulse">
              {pending.length} Pending
            </span>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setTab("PENDING")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === "PENDING"
              ? "bg-white shadow-xs text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab("COMPLETED")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === "COMPLETED"
              ? "bg-white shadow-xs text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5">Project Title</th>
                <th className="py-3 px-5">Guide</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Submitted</th>
                <th className="py-3 px-5">Status</th>
                {tab === "PENDING" && (
                  <th className="py-3 px-5 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {display.length > 0 ? (
                display.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 text-sm">
                      {a.team_name}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 max-w-[220px] truncate">
                      {a.project_title}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-semibold text-slate-700">
                      {a.guide_name}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        {typeIcon(a.type)}
                        <span className="text-xs text-slate-600 font-medium">
                          {a.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">
                      {formatDateTime(a.submitted_at)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(a.status)}
                        <span className={`text-xs font-semibold ${
                          a.status === "APPROVED"
                            ? "text-emerald-700"
                            : a.status === "REJECTED"
                            ? "text-rose-700"
                            : "text-amber-700"
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </td>
                    {tab === "PENDING" && (
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(a.id, "APPROVED")}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(a.id, "REJECTED")}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tab === "PENDING" ? 7 : 6} className="p-10 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">
                      {tab === "PENDING"
                        ? "No pending approvals. All caught up!"
                        : "No completed approvals yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks Modal */}
      {remarksModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {remarksModal.action === "APPROVED" ? "Approve" : "Reject"} Request
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Add optional remarks for this {remarksModal.action === "APPROVED" ? "approval" : "rejection"}.
              </p>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                placeholder="Enter remarks (optional)..."
                rows={3}
                className="w-full mt-4 px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRemarksModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer ${
                    remarksModal.action === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Confirm {remarksModal.action === "APPROVED" ? "Approval" : "Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
