import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, Printer, ChevronDown } from "lucide-react";
import { AdvisorTeamSummary } from "@/types";
import {
  exportEvaluationsToCSV,
  exportEvaluationsToExcel,
  exportEvaluationsToPDF,
} from "@/lib/export-evaluations";

interface DownloadEvaluationMarksProps {
  teams: AdvisorTeamSummary[];
  className?: string;
}

export function DownloadEvaluationMarks({ teams, className = "" }: DownloadEvaluationMarksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    exportEvaluationsToCSV(teams);
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    exportEvaluationsToExcel(teams);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    exportEvaluationsToPDF(teams);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs hover:border-slate-400 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>Download Marks</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-lg bg-white shadow-lg border border-slate-200 z-50 py-1.5 focus:outline-hidden animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Export Marksheets
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition text-left cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">Excel Workbook (.xls)</span>
              <span className="text-[10px] text-slate-400">Formatted spreadsheet data</span>
            </div>
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition text-left cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">CSV Delimited (.csv)</span>
              <span className="text-[10px] text-slate-400">Standard tabulated values</span>
            </div>
          </button>

          <button
            onClick={handleExportPDF}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">Print Official Marksheet (PDF)</span>
              <span className="text-[10px] text-slate-400">With SIET PRC letterhead</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default DownloadEvaluationMarks;
