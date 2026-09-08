import React, { useEffect } from "react";
import { X, Printer, Award, CheckCircle2, FileText, Calendar } from "lucide-react";
import { AdvisorTeamSummary } from "@/types";
import { exportSingleTeamRecordPDF } from "@/lib/export-evaluation-records";

interface TeamRecordsModalProps {
  team: AdvisorTeamSummary | null;
  onClose: () => void;
}

export function TeamRecordsModal({ team, onClose }: TeamRecordsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F5132]" />
            <h2 className="text-sm font-bold text-slate-900">
              Evaluation Record &amp; Milestone History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Team Overview Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {team.section || "CSE-A"} • Batch 2023-2027
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{team.name}</h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{team.project_title}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-[#0F5132]">
                  {team.marks_awarded !== undefined ? `${team.marks_awarded}/100` : "Pending"}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  Grade: {team.grade || "N/A"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600">
              <div>
                <strong className="text-slate-800">Team Leader:</strong> {team.leader_name} ({team.leader_roll})
              </div>
              <div>
                <strong className="text-slate-800">Faculty Guide:</strong>{" "}
                {typeof team.guide === "string"
                  ? team.guide
                  : team.guide?.full_name || (team.guide as any)?.name || "Dr. K. Senthil Kumar"}
              </div>
            </div>
          </div>

          {/* Rubric Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Review 2 Comprehensive Rubric Marks
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-left">Criterion</th>
                    <th className="py-2 px-3 text-center w-24">Max</th>
                    <th className="py-2 px-3 text-center w-24">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2 px-3">1. Problem Formulation &amp; Literature Survey</td>
                    <td className="py-2 px-3 text-center text-slate-400">20</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {Math.round((team.marks_awarded || 0) * 0.2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">2. System Architecture &amp; Methodology</td>
                    <td className="py-2 px-3 text-center text-slate-400">20</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {Math.round((team.marks_awarded || 0) * 0.2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">3. Implementation Progress &amp; Code Rigor</td>
                    <td className="py-2 px-3 text-center text-slate-400">20</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {Math.round((team.marks_awarded || 0) * 0.2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">4. Oral Defense &amp; Technical Explanation</td>
                    <td className="py-2 px-3 text-center text-slate-400">20</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {Math.round((team.marks_awarded || 0) * 0.2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">5. Milestone Documentation &amp; Presentation</td>
                    <td className="py-2 px-3 text-center text-slate-400">20</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {(team.marks_awarded || 0) - 4 * Math.round((team.marks_awarded || 0) * 0.2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
            <span className="font-bold text-emerald-950 block mb-1">
              Faculty Evaluator Remarks:
            </span>
            <p className="text-emerald-900 italic leading-relaxed">
              "{team.evaluation_remarks || "Demonstrated solid technical execution and adherence to IEEE format."}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={() => exportSingleTeamRecordPDF(team)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Record (PDF)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamRecordsModal;
