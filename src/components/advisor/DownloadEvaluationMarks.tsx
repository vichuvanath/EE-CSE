"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileType,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdvisorTeamSummary } from "@/types";
import {
  getEvaluatedTeamsData,
  exportToCsv,
  exportToExcel,
  exportToPdf,
} from "@/lib/export-evaluations";

interface DownloadEvaluationMarksProps {
  teams: AdvisorTeamSummary[];
}

export function DownloadEvaluationMarks({ teams }: DownloadEvaluationMarksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingType, setLoadingType] = useState<"excel" | "csv" | "pdf" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleExport = async (type: "excel" | "csv" | "pdf") => {
    setErrorMessage(null);
    setLoadingType(type);

    try {
      // Small tick to allow UI to render the loading spinner
      await new Promise((resolve) => setTimeout(resolve, 80));

      const evaluatedRows = getEvaluatedTeamsData(teams);

      if (evaluatedRows.length === 0) {
        throw new Error("No evaluated teams found. Please grade at least one team before exporting marks.");
      }

      const dateSuffix = new Date().toISOString().split("T")[0];

      if (type === "csv") {
        exportToCsv(evaluatedRows, `Advisor_Team_Evaluation_Marks_${dateSuffix}.csv`);
        setToastMessage("Evaluation marks exported as CSV (.csv).");
      } else if (type === "excel") {
        exportToExcel(evaluatedRows, `Advisor_Team_Evaluation_Marks_${dateSuffix}.xlsx`);
        setToastMessage("Evaluation marks exported as Excel (.xlsx).");
      } else if (type === "pdf") {
        exportToPdf(evaluatedRows, `Advisor_Team_Evaluation_Marks_${dateSuffix}.pdf`);
        setToastMessage("Evaluation marks exported as PDF report.");
      }

      setIsOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate evaluation export.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-emerald-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-rose-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-rose-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loadingType !== null}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {loadingType ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>Download Evaluation Marks</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-200 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Menu Header */}
          <div className="px-4 py-3 bg-slate-50/80 rounded-t-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Download as
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Official records for all evaluated teams
            </span>
          </div>

          {/* Menu Options */}
          <div className="p-1.5 space-y-1">
            {/* 1. Excel (.xlsx) */}
            <button
              type="button"
              onClick={() => handleExport("excel")}
              disabled={loadingType !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50/70 text-slate-700 hover:text-[#0F5132] transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-[#0F5132] shrink-0">
                  {loadingType === "excel" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Excel (.xlsx)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Structured spreadsheet table
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                .XLSX
              </span>
            </button>

            {/* 2. CSV (.csv) */}
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={loadingType !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                  {loadingType === "csv" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    CSV (.csv)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Comma-separated values
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                .CSV
              </span>
            </button>

            {/* 3. PDF */}
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={loadingType !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-rose-50/70 text-slate-700 hover:text-rose-700 transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                  {loadingType === "pdf" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileType className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    PDF
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Official academic printable report
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                .PDF
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
