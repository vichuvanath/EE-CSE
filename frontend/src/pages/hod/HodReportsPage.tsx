import React, { useState } from "react";
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Check,
  Eye,
  Layers,
  Sparkles,
  ChevronRight,
  Printer,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";
import {
  useHodAdvisors,
  useHodAdminChanges,
  useHodCompliance,
} from "@/hooks/use-hod";
import {
  exportCustomReportExcel,
  exportCustomReportPDF,
} from "@/lib/export-hod-reports";

// Datasets definitions for Dynamic Custom Report Builder
type DatasetType = "TEAMS" | "ADVISORS" | "GUIDES" | "AUDIT";

interface ColumnDef {
  key: string;
  label: string;
}

const DATASET_CONFIG: Record<
  DatasetType,
  {
    name: string;
    columns: ColumnDef[];
  }
> = {
  TEAMS: {
    name: "Project Teams & Scores",
    columns: [
      { key: "team_name", label: "Team Name" },
      { key: "project_title", label: "Project Title" },
      { key: "guide_name", label: "Faculty Guide" },
      { key: "advisor_name", label: "Faculty Advisor" },
      { key: "score", label: "Interim Score (/20)" },
      { key: "status", label: "Status" },
    ],
  },
  ADVISORS: {
    name: "Faculty Advisors Roster",
    columns: [
      { key: "name", label: "Advisor Name" },
      { key: "designation", label: "Designation" },
      { key: "department", label: "Department" },
      { key: "teams_count", label: "Assigned Teams" },
      { key: "students_count", label: "Supervised Students" },
      { key: "completion_rate", label: "Completion Rate (%)" },
    ],
  },
  GUIDES: {
    name: "Project Guides Mentoring Workload",
    columns: [
      { key: "guide_name", label: "Guide Name" },
      { key: "department", label: "Department" },
      { key: "specialization", label: "Area of Specialization" },
      { key: "assigned_teams", label: "Teams Supervised" },
      { key: "quota_status", label: "Mentoring Quota" },
    ],
  },
  AUDIT: {
    name: "Administrative Reassignment Audit",
    columns: [
      { key: "timestamp", label: "Date & Time" },
      { key: "change_type", label: "Change Event" },
      { key: "team_name", label: "Impacted Team" },
      { key: "admin_name", label: "Executed By Admin" },
      { key: "reason", label: "Administrative Justification" },
    ],
  },
};

export function HodReportsPage() {
  const { academicYear, selectedBatch } = useHodStore();

  const { data: advisors } = useHodAdvisors(selectedBatch);
  const { data: adminChanges } = useHodAdminChanges();
  const { data: compliance } = useHodCompliance();

  // Dynamic Custom Report Builder State
  const [activeDataset, setActiveDataset] = useState<DatasetType>("TEAMS");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "team_name",
    "project_title",
    "guide_name",
    "score",
    "status",
  ]);

  // Handle dataset switch
  const handleDatasetChange = (ds: DatasetType) => {
    setActiveDataset(ds);
    setSelectedColumns(DATASET_CONFIG[ds].columns.map((c) => c.key));
  };

  // Toggle column
  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length === 1) return; // Keep at least one
      setSelectedColumns(selectedColumns.filter((c) => c !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  // Generate data rows for selected dataset
  const getDataRows = () => {
    if (activeDataset === "TEAMS") {
      return (advisors || []).flatMap((a) =>
        a.assigned_teams.map((t) => ({
          team_name: t.name,
          project_title: t.project_title,
          guide_name: t.guide_name,
          advisor_name: a.name,
          score: t.score !== undefined ? `${t.score} / 20` : "Pending",
          status: t.status || "In Progress",
        }))
      );
    }
    if (activeDataset === "ADVISORS") {
      return (advisors || []).map((a) => ({
        name: a.name,
        designation: a.designation,
        department: a.department,
        teams_count: a.teams_count,
        students_count: a.students_count,
        completion_rate: `${a.completion_rate}%`,
      }));
    }
    if (activeDataset === "GUIDES") {
      return [
        {
          guide_name: "Dr. M. Senthil Nathan",
          department: "CSE",
          specialization: "Cybersecurity & Edge Computing",
          assigned_teams: 4,
          quota_status: "4/4 (Max Quota)",
        },
        {
          guide_name: "Dr. P. Suresh",
          department: "CSE",
          specialization: "Robotics & Embedded Systems",
          assigned_teams: 3,
          quota_status: "3/4 (Capacity Open)",
        },
        {
          guide_name: "Dr. V. Rajesh",
          department: "ECE",
          specialization: "VLSI Architecture",
          assigned_teams: 3,
          quota_status: "3/4 (Capacity Open)",
        },
        {
          guide_name: "Dr. T. Geetha",
          department: "CSE",
          specialization: "Biomedical Devices & AI",
          assigned_teams: 2,
          quota_status: "2/4 (Capacity Open)",
        },
        {
          guide_name: "Dr. R. Kavitha",
          department: "CSE",
          specialization: "Distributed Smart Grids",
          assigned_teams: 2,
          quota_status: "2/4 (Capacity Open)",
        },
      ];
    }
    if (activeDataset === "AUDIT") {
      return (adminChanges || []).map((chg) => ({
        timestamp: chg.timestamp,
        change_type: chg.change_type,
        team_name: chg.team_name,
        admin_name: chg.changed_by.name,
        reason: chg.reason,
      }));
    }
    return [];
  };

  const rawRows = getDataRows();
  const currentConfig = DATASET_CONFIG[activeDataset];
  const activeColDefs = currentConfig.columns.filter((c) =>
    selectedColumns.includes(c.key)
  );

  // Download triggers for Dynamic Report Builder
  const handleDownloadCustomExcel = () => {
    exportCustomReportExcel(
      `SIET_${currentConfig.name}_${selectedBatch}`,
      activeColDefs,
      rawRows
    );
  };

  const handleDownloadCustomPDF = () => {
    exportCustomReportPDF(
      `SIET_${currentConfig.name}_${selectedBatch}`,
      activeColDefs,
      rawRows
    );
  };

  // Standard Dossier Downloads
  const handleStandardDossierExcel = (name: string) => {
    const cols = DATASET_CONFIG.TEAMS.columns;
    const rows = (advisors || []).flatMap((a) =>
      a.assigned_teams.map((t) => ({
        team_name: t.name,
        project_title: t.project_title,
        guide_name: t.guide_name,
        advisor_name: a.name,
        score: t.score !== undefined ? `${t.score} / 20` : "Pending",
        status: t.status || "In Progress",
      }))
    );
    exportCustomReportExcel(`SIET_${name}_${selectedBatch}`, cols, rows);
  };

  const handleStandardDossierPDF = (name: string) => {
    const cols = DATASET_CONFIG.TEAMS.columns;
    const rows = (advisors || []).flatMap((a) =>
      a.assigned_teams.map((t) => ({
        team_name: t.name,
        project_title: t.project_title,
        guide_name: t.guide_name,
        advisor_name: a.name,
        score: t.score !== undefined ? `${t.score} / 20` : "Pending",
        status: t.status || "In Progress",
      }))
    );
    exportCustomReportPDF(`SIET_${name}_${selectedBatch}`, cols, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              Department Reporting Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AY {academicYear} · Batch {selectedBatch}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Reports & Department Dossier Exports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional dossiers, workload audits, student mark sheets, and dynamic customizable report generators.
          </p>
        </div>
      </div>

      {/* 2. Standard Department Dossiers (5 Pre-Formatted Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Standard Department Dossiers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              One-click official institutional reports formatted for academic council and accreditation reviews
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: All Teams Evaluation Dossier */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Evaluation Dossier (All Teams)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Full score matrix with criteria breakdowns, faculty guide notes, and milestone marks for all 48 teams.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleStandardDossierExcel("All_Teams_Evaluation")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => handleStandardDossierPDF("All_Teams_Evaluation")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Card 2: Faculty Guide Workload */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Faculty Guide Roster (Workload)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Directory of all technical project guides, designations, research domains, and active team mentoring counts.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleStandardDossierExcel("Faculty_Guide_Workload")}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Workload Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Admin Change Audit Log */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Admin Change Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Immutable audit trail of administrative reassignments, guide switches, deadline sanctions, and justifications.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleStandardDossierExcel("Admin_Change_Audit")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => handleStandardDossierPDF("Admin_Change_Audit")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Card 4: Student Marks Roll */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Student Marks Roll (Official)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Alphabetical student roster with university register numbers, project titles, guide allocations, and rubric totals.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleStandardDossierExcel("Student_Marks_Roll")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleStandardDossierPDF("Student_Marks_Roll")}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Card 5: Executive Batch Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  ACADEMIC COUNCIL
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Executive Batch Summary & PRC Quality Report
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Comprehensive executive dossier containing stage turnaround analytics, high/low scoring distributions, advisor compliance metrics, and PRC quality flags.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleStandardDossierPDF("Executive_Batch_Summary")}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Executive PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Custom Report Builder */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Dynamic Custom Report Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select datasets, toggle custom column attributes, preview data in real time, and download custom spreadsheets or PDFs.
          </p>
        </div>

        {/* Dataset Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs">
          {(["TEAMS", "ADVISORS", "GUIDES", "AUDIT"] as DatasetType[]).map(
            (ds) => (
              <button
                key={ds}
                onClick={() => handleDatasetChange(ds)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  activeDataset === ds
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {DATASET_CONFIG[ds].name}
              </button>
            )
          )}
        </div>

        {/* Column Selector Pills */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase font-mono mb-2">
            Toggle Report Columns ({selectedColumns.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {currentConfig.columns.map((col) => {
              const isSelected = selectedColumns.includes(col.key);
              return (
                <button
                  key={col.key}
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                      isSelected ? "bg-indigo-600 text-white" : "border border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Table Preview (First 5 records) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              Live Preview (First 5 Records of {rawRows.length})
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    {activeColDefs.map((c) => (
                      <th key={c.key} className="py-2.5 px-4">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      {activeColDefs.map((c) => (
                        <td key={c.key} className="py-2.5 px-4 font-medium">
                          {(row as Record<string, any>)[c.key] !== undefined
                            ? (row as Record<string, any>)[c.key]
                            : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 font-mono">
            {rawRows.length} total rows matched in current dataset
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadCustomExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Custom Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleDownloadCustomPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Download Custom PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
