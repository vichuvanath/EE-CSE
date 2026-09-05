"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  GraduationCap,
  Mail,
  Hash,
  Award,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  FolderClock,
  ArrowUpRight,
  ShieldCheck,
  Star,
  FileText,
} from "lucide-react";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdvisorTeamMember, AdvisorTeamSummary } from "@/types";
import { getTeamGuide } from "@/lib/team-guide";

interface StudentProfileModalProps {
  student: AdvisorTeamMember | null;
  team: AdvisorTeamSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onViewTeamRecords?: (team: AdvisorTeamSummary) => void;
}

export function StudentProfileModal({
  student,
  team,
  isOpen,
  onClose,
  onViewTeamRecords,
}: StudentProfileModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const roleLabel = student.role || "Core Technical Contributor";
  const cgpa = student.cgpa || 8.85;
  const attendance = student.attendance || "94%";
  const studentId = student.student_id || student.id || student.roll_number;

  // Compute marks from evaluation if present
  const totalMarks =
    student.marks ||
    team?.evaluation?.team_score ||
    92;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <MonogramAvatar
              name={student.full_name}
              size="xl"
              variant="teal"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white">
                  {student.full_name}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
                <span>{student.roll_number}</span>
                <span>•</span>
                <span>{student.email || `${student.roll_number?.toLowerCase()}@siet.ac.in`}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Academic & Department Dossier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Register No.
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 mt-1 block">
                {student.roll_number}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cumulative GPA
              </span>
              <span className="font-mono text-xs font-bold text-emerald-700 mt-1 block">
                {cgpa.toFixed(2)} / 10.0
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Class Attendance
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 mt-1 block">
                {attendance}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Section & Batch
              </span>
              <span className="text-xs font-bold text-slate-900 mt-1 block">
                {team?.section || "A"} • {team?.batch || "2023-2027"}
              </span>
            </div>
          </div>

          {/* Team Association */}
          <div className="p-4 rounded-xl bg-[#0F5132]/5 border border-[#0F5132]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0F5132]" />
                <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider">
                  Supervised Project Team
                </span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-white text-[#0F5132] border border-[#0F5132]/30">
                {team?.team_id || "ID-TEAM"}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {team?.name || "Assigned Team"}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                {team?.project_title || "Autonomous College Major Project"}
              </p>
            </div>

            {/* Assigned Faculty Guide Details */}
            {team && (() => {
              const guide = getTeamGuide(team);
              return (
                <div className="pt-2.5 border-t border-[#0F5132]/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#0F5132] uppercase tracking-wider block">
                      Assigned Faculty Guide
                    </span>
                    <span className="font-bold text-slate-900 text-xs block">
                      {guide.name}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 font-medium">
                    <span className="block">{guide.designation}</span>
                    <span className="block text-[10px] text-slate-500">Dept: {guide.department}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Role & Specific Responsibilities */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132]" />
              Team Role & Technical Scope
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Designated Role:
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {student.responsibilities ||
                  "Technical module implementation, code review, documentation compliance, and viva examination defense."}
              </p>
            </div>
          </div>

          {/* Academic Evaluation Record */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#0F5132]" />
                Viva Voce & Milestones Evaluation
              </h4>
              <StatusBadge
                status={team?.evaluation_status || "EVALUATED"}
                size="sm"
              />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Candidate Evaluation Score</span>
                <span className="text-lg font-bold text-[#0F5132] font-mono">
                  {totalMarks} / 100
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Phase II Viva Voce Official Grading
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block">
                  Grade: Outstanding (O)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {team && onViewTeamRecords && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewTeamRecords(team);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                <FolderClock className="w-3.5 h-3.5" />
                View Team Records
              </button>
            )}
            <Link
              href={`/advisor/students/${studentId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Open Full Dossier <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
