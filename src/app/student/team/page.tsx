"use client";

import React from "react";
import {
  Users,
  Award,
  GraduationCap,
  ShieldCheck,
  Mail,
  Hash,
  Lock,
  Calendar,
  Layers,
} from "lucide-react";
import { useMyTeam } from "@/hooks/use-student";
import { useAuthStore } from "@/stores/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";

export default function StudentTeamPage() {
  const { data: team, isLoading, error, refetch } = useMyTeam();
  const { user } = useAuthStore();

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Team Record"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Project Team & Roster"
        description="Official Department Project Review Committee team assignment, members, and designated guide."
        breadcrumbs={[
          { label: "SIET Portal", href: "/student/profile" },
          { label: "Student Workspace", href: "/student/profile" },
          { label: "My Team" },
        ]}
      />

      {/* Team Overview Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-[#0F5132] border border-emerald-200">
                TEAM
              </span>
              <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {team?.name || "Team Workspace"}
              </h2>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700">
              Project Title:{" "}
              <span className="font-semibold text-slate-900">
                {team?.project_title || "Pending Title Submission"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Batch: {team?.batch || "2023-2027"}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Section {team?.section || "A"}
            </span>
          </div>
        </div>

        {/* Faculty Advisor Card */}
        <div className="mt-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-teal-50/50 to-white border border-teal-200/70 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-teal-100 text-[#216963] shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#216963] uppercase tracking-wider">
                PRC Faculty Advisor / Guide
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5 truncate font-['Plus_Jakarta_Sans',sans-serif]">
                {team?.advisor?.full_name || "Assigned Guide"}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {team?.advisor?.email || "advisor@college.edu"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Roster Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Team Members Roster ({team?.members?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized team members for project deliverables and semester viva examination.
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-[#0F5132] border border-emerald-200 font-mono">
            Quota Filled (100%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Member Name</th>
                <th className="py-3.5 px-6">Roll Number</th>
                <th className="py-3.5 px-6">Role in Team</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team?.members?.map((member) => {
                const isCurrentUser =
                  member.roll_number === user?.roll_number ||
                  member.id === user?.id;

                return (
                  <tr
                    key={member.id || member.roll_number}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isCurrentUser ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <MonogramAvatar
                          name={member.full_name}
                          size="md"
                          variant={isCurrentUser ? "emerald" : "slate"}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {member.full_name}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#0F5132] text-white">
                                YOU
                              </span>
                            )}
                          </div>
                          {member.email && (
                            <span className="text-xs text-slate-400 font-mono">
                              {member.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-700 font-medium">
                      {member.roll_number}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <Users className="w-3 h-3 text-slate-400" />
                        Team Member
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Minimum Squad: 3 • Maximum: 4</span>
          <span className="font-mono text-[11px]">Academic Board PRC Sync Status: VERIFIED</span>
        </div>
      </div>

      {/* Governance Immutable Notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Academic Governance Notice
            </h4>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
              ROSTER-IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Team composition finalized for Final Viva Voce. Read-only roster synchronized with Department Project Review Committee (PRC) and Controller of Examinations. Any transfer or substitution requires formal endorsement by the Head of Department.
          </p>
        </div>
      </div>
    </div>
  );
}
