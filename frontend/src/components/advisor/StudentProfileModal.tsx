import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Mail,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { AdvisorStudent } from "@/types";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";

interface StudentProfileModalProps {
  student: AdvisorStudent | null;
  onClose: () => void;
  onViewTeamRecords?: () => void;
}

export function StudentProfileModal({
  student,
  onClose,
  onViewTeamRecords,
}: StudentProfileModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark Slate Header Banner */}
        <div className="flex items-start justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-4 min-w-0">
            <MonogramAvatar name={student.full_name} size="lg" variant="teal" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight truncate font-['Plus_Jakarta_Sans',sans-serif]">
                  {student.full_name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {student.technical_role || "Candidate Student"}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Roll No: {student.roll_number} • {student.email}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 4-Box Academic Dossier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Register Number
              </span>
              <span className="text-xs font-black font-mono text-slate-900 mt-1 block">
                {student.roll_number}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cumulative GPA
              </span>
              <span className="text-sm font-black font-mono text-[#0F5132] mt-1 block">
                {student.cgpa ? student.cgpa.toFixed(2) : "8.85"} / 10.0
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Attendance
              </span>
              <span className="text-sm font-black font-mono text-slate-800 mt-1 block">
                {student.attendance_percentage || 94}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Section &amp; Batch
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
                Sec A • 2023-27
              </span>
            </div>
          </div>

          {/* Supervised Team Card with Faculty Guide Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{student.team_name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 font-mono">
                {student.team_id || "team-uuid-alpha-001"}
              </span>
            </div>
            <div className="text-slate-600">
              <strong>Assigned Faculty Guide:</strong> Dr. K. Senthil Kumar, M.E., Ph.D. • Dept. of CSE
            </div>
          </div>

          {/* Role & Technical Scope */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1">
            <span className="font-bold text-emerald-950 block">
              Designated Role &amp; Technical Scope:
            </span>
            <p className="text-emerald-900 leading-relaxed">
              Leading the INT8 Quantization and TensorRT runtime optimization pipeline for edge camera nodes. Responsible for model benchmarks and RTSP multi-stream stress validation.
            </p>
          </div>

          {/* Viva Voce Evaluation Score Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Viva Voce Evaluation Score
              </span>
              <div className="text-2xl font-black font-mono text-[#0F5132] mt-0.5">
                92 / 100
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Academic Grade
              </span>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                Outstanding (O)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            {onViewTeamRecords && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewTeamRecords();
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                View Team Records
              </button>
            )}

            <Link
              to={`/advisor/students/${student.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-[#0F5132] hover:underline"
            >
              <span>Open Full Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileModal;
