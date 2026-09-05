"use client";

import React from "react";
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  GraduationCap,
  FolderKanban,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useHodTeams, useHodFaculty, useHodStudents } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { useHodAllTeams } from "@/hooks/use-hod";
import {
  exportAllTeamsEvaluation,
  exportFacultyWorkload,
  exportStudentMarks,
  exportBatchSummary,
} from "@/lib/export-hod-reports";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  formats: { label: string; ext: "xlsx" | "csv" | "pdf"; icon: React.ElementType }[];
  onExport: (format: "xlsx" | "csv" | "pdf") => void;
}

export default function HodReportsPage() {
  const { selectedBatch } = useHodStore();
  const teams = useHodTeams(selectedBatch);
  const allTeams = useHodAllTeams();
  const faculty = useHodFaculty();
  const students = useHodStudents(selectedBatch);

  const reports: ReportCard[] = [
    {
      title: "All Teams Evaluation Report",
      description: "Complete evaluation data for all teams including criteria scores, guide information, and final marks.",
      icon: FolderKanban,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
      formats: [
        { label: "Excel (.xlsx)", ext: "xlsx", icon: FileSpreadsheet },
        { label: "CSV (.csv)", ext: "csv", icon: FileText },
        { label: "PDF", ext: "pdf", icon: FileBarChart },
      ],
      onExport: (format) => exportAllTeamsEvaluation(teams, format, selectedBatch),
    },
    {
      title: "Faculty Workload Report",
      description: "Faculty roster with team assignments, designations, specializations, and workload distribution.",
      icon: Users,
      iconColor: "text-violet-600 bg-violet-50 border-violet-100",
      formats: [
        { label: "Excel (.xlsx)", ext: "xlsx", icon: FileSpreadsheet },
        { label: "CSV (.csv)", ext: "csv", icon: FileText },
      ],
      onExport: (format) => exportFacultyWorkload(faculty, allTeams, format as "xlsx" | "csv"),
    },
    {
      title: "Student Marks Summary",
      description: "All student marks with roll numbers, team assignments, guide information, and evaluation status.",
      icon: GraduationCap,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      formats: [
        { label: "Excel (.xlsx)", ext: "xlsx", icon: FileSpreadsheet },
        { label: "CSV (.csv)", ext: "csv", icon: FileText },
        { label: "PDF", ext: "pdf", icon: FileBarChart },
      ],
      onExport: (format) => exportStudentMarks(students, format, selectedBatch),
    },
    {
      title: "Batch-wise Project Summary",
      description: "Comprehensive batch summary with project details, team compositions, guide assignments, and scores.",
      icon: FileBarChart,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
      formats: [
        { label: "PDF", ext: "pdf", icon: FileBarChart },
      ],
      onExport: () => exportBatchSummary(teams, selectedBatch),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Downloads"
        description="Generate and download department-level reports for evaluation, faculty, and students."
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Reports" },
        ]}
      />

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.title}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border ${report.iconColor} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {report.formats.map((fmt) => {
                    const FmtIcon = fmt.icon;
                    return (
                      <button
                        key={fmt.ext}
                        onClick={() => report.onExport(fmt.ext)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        {fmt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <FileBarChart className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-indigo-900">
            Reports are generated for Batch {selectedBatch}
          </p>
          <p className="text-[11px] text-indigo-700 mt-0.5">
            Change the batch from the header dropdown to generate reports for a different batch.
            All exports include assigned Guide information for every team.
          </p>
        </div>
      </div>
    </div>
  );
}
