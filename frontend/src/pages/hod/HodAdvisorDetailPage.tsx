import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FolderKanban,
  Mail,
  Phone,
  Building,
  Award,
  ChevronRight,
  ExternalLink,
  History,
} from "lucide-react";
import { useHodAdvisorDetail } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function HodAdvisorDetailPage() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const navigate = useNavigate();
  const { selectedBatch, setSelectedBatch, availableBatches } = useHodStore();

  const { data: advisor, isLoading } = useHodAdvisorDetail(
    advisorId || "adv-1",
    selectedBatch
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-mono animate-pulse">
        Loading advisor profile & batch assignments...
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-sm font-semibold text-slate-800">Advisor not found</p>
        <Link
          to="/hod/advisors"
          className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Advisors Roster
        </Link>
      </div>
    );
  }

  const initials = advisor.name
    .replace(/Dr\.|Prof\./g, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/hod/advisors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#034419] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Advisors ({selectedBatch})</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Batch Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono">Cohort:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-none"
            >
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Link to Full Evaluation History */}
          <Link
            to={`/hod/advisors/${advisor.id}/evaluation-history`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#034419] hover:bg-[#023312] text-white text-xs font-semibold transition shadow-none"
          >
            <History className="w-3.5 h-3.5" />
            <span>View Evaluation Record</span>
          </Link>
        </div>
      </div>

      {/* 2. Advisor Hero Dossier Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-emerald-50 border border-emerald-200 text-[#034419] font-bold text-base flex items-center justify-center font-mono shrink-0">
              {initials || "FA"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-['IBM_Plex_Sans',sans-serif]">
                  {advisor.name}
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#034419] border border-emerald-200/80 font-mono">
                  FACULTY ADVISOR
                </span>
              </div>

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>{advisor.designation}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{advisor.department}</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{advisor.email}</span>
                </span>
                {advisor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{advisor.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="px-3.5 py-2 rounded-md bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                Teams Handled
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 block">
                {advisor.teams_count}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-md bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                Students Supervised
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 block">
                {advisor.students_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Batch Assigned Teams Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-['IBM_Plex_Sans',sans-serif]">
              Assigned Project Teams · Batch {selectedBatch}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active teams under the supervision of {advisor.name}
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {advisor.assigned_teams.length} Teams
          </span>
        </div>

        <DataTable
          withTableBorder={false}
          withColumnBorders
          records={advisor.assigned_teams}
          idAccessor="id"
          noRecordsText="No assigned teams found for this advisor."
          columns={[
            {
              accessor: "name",
              title: "TEAM NAME",
              render: (team) => (
                <span className="font-bold text-slate-900">{team.name}</span>
              ),
            },
            {
              accessor: "project_title",
              title: "PROJECT TITLE",
              render: (team) => (
                <div className="text-slate-600 max-w-sm">
                  <div>{team.project_title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Batch {selectedBatch}
                  </div>
                </div>
              ),
            },
            {
              accessor: "members_count",
              title: "STUDENTS",
              textAlignment: "center",
              render: (team) => (
                <span className="font-mono font-bold text-slate-800">
                  {team.members_count}
                </span>
              ),
            },
            {
              accessor: "guide_name",
              title: "ASSIGNED GUIDE",
              render: (team) => (
                <span className="text-slate-700 font-medium">{team.guide_name}</span>
              ),
            },
            {
              accessor: "action",
              title: "ACTION",
              textAlignment: "right",
              render: (team) => (
                <Link
                  to={`/hod/advisors/${advisor.id}/teams/${team.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#034419] transition"
                >
                  <span>Inspect Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ),
            },
          ]}
          rowExpansion={{
            allowMultiple: true,
            content: ({ record: team }) => (
              <div className="p-4 bg-[#F8FDF9] border-t border-b border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] font-mono">
                    TEAM SUMMARY · {team.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Cohort {selectedBatch}
                  </span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Project: <strong>{team.project_title}</strong>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Assigned Faculty Guide: <strong className="text-slate-800">{team.guide_name}</strong></span>
                  <span>•</span>
                  <span>Enrolled Scholars: <strong className="text-slate-800">{team.members_count} Students</strong></span>
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
