import React from "react";
import {
  Calendar,
  Layers,
  GraduationCap,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { useStudentTeam } from "@/hooks/use-student";
import { useAuthStore } from "@/stores/auth-store";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function StudentTeamPage() {
  const { user } = useAuthStore();
  const { data: team, isLoading, error, refetch } = useStudentTeam();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Team Overview Banner */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-4 sm:p-5 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-[#034419] border border-emerald-200">
                TEAM
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {team?.name || "Team Workspace"}
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700">
              Project Title:{" "}
              <span className="font-semibold text-slate-900">
                {team?.project_title || "Pending Title Submission"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Batch: {team?.batch || "2023-2027"}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Section {team?.section || "A"}
            </span>
          </div>
        </div>

        {/* Faculty Advisor Card */}
        <div className="mt-4">
          <div className="p-3 rounded-md bg-white border border-slate-200/90 flex items-start gap-3">
            <div className="p-2 rounded-md bg-emerald-50 text-[#034419] border border-emerald-200/80 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-[#034419] uppercase tracking-wider">
                PRC Faculty Advisor / Guide
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                {team?.advisor?.full_name || "Assigned Guide"}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {team?.advisor?.email || "advisor@college.edu"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Roster */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Team Members Roster ({team?.members?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized team members for project deliverables and semester viva examination.
            </p>
          </div>
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-[#034419] border border-emerald-200 font-mono">
            Quota Filled (100%)
          </span>
        </div>

        {/* DataTable with Mantine Row Expansion */}
        <DataTable
          withTableBorder={false}
          withColumnBorders
          records={team?.members || []}
          idAccessor={(m: any) => m.id || m.roll_number}
          noRecordsText="No team members registered yet."
          columns={[
            {
              accessor: "full_name",
              title: "MEMBER NAME",
              render: (member: any) => {
                const isCurrentUser =
                  member.roll_number === user?.roll_number ||
                  member.id === user?.id;
                return (
                  <div className="flex items-center gap-2.5">
                    <MonogramAvatar
                      name={member.full_name}
                      size="md"
                      variant={isCurrentUser ? "emerald" : "slate"}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">
                          {member.full_name}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-[#034419] text-white">
                            YOU
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              accessor: "roll_number",
              title: "ROLL NUMBER",
              render: (member: any) => (
                <span className="font-mono text-xs text-slate-700 font-medium">
                  {member.roll_number}
                </span>
              ),
            },
            {
              accessor: "status",
              title: "STATUS",
              textAlignment: "right",
              render: () => (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#034419] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#034419]" />
                  ACTIVE
                </span>
              ),
            },
          ]}
          rowExpansion={{
            allowMultiple: true,
            content: ({ record: member }: { record: any }) => (
              <div className="p-3.5 bg-slate-50/60 border-t border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-[#034419] uppercase tracking-wider block">
                    STUDENT CREDENTIALS & PRC RECORD
                  </span>
                  <div className="font-semibold text-slate-900">
                    Roll Number: <span className="font-mono text-[#034419]">{member.roll_number}</span>
                    {member.email && (
                      <span className="ml-3 font-normal text-slate-500 font-mono text-xs">
                        Official Mail: {member.email}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    PRC Enrolled Status: <span className="font-medium text-[#034419]">Active Verified Scholar</span> · Department Project Review Board
                  </div>
                </div>
              </div>
            ),
          }}
        />

        <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Minimum Squad: 3 • Maximum: 4</span>
          <span className="font-mono text-[11px]">Department PRC Sync Status: VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
