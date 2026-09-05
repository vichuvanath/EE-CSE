"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  FolderClock,
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
  ChevronRight,
  User,
  Star,
  Users,
} from "lucide-react";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdvisorTeamMember, AdvisorTeamSummary, TeamEvaluationRecord } from "@/types";
import { getTeamGuide } from "@/lib/team-guide";

interface TeamRecordsModalProps {
  team: AdvisorTeamSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (student: AdvisorTeamMember, team: AdvisorTeamSummary) => void;
}

export function TeamRecordsModal({
  team,
  isOpen,
  onClose,
  onSelectStudent,
}: TeamRecordsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !team) return null;

  // Build or resolve complete records history
  const isEvaluated =
    team.evaluation_status === "EVALUATED" ||
    team.evaluation_status === "APPROVED" ||
    Boolean(team.evaluation?.team_score);

  const currentScore = team.evaluation?.team_score || 92;

  // Dynamic historical records
  const defaultHistory: TeamEvaluationRecord[] = [
    {
      id: "rec-phase-2",
      stage_name: "Phase II — Final Viva Voce & Demonstration",
      evaluation_date: team.evaluation?.created_at
        ? new Date(team.evaluation.created_at).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "02 Sep 2026",
      evaluator_name: "Dr. Arumugam V, M.E., Ph.D. (Faculty Advisor)",
      total_marks: currentScore,
      max_marks: 100,
      grade: currentScore >= 90 ? "O (Outstanding)" : currentScore >= 80 ? "A+ (Excellent)" : "A (Very Good)",
      status: isEvaluated ? "EVALUATED" : "PENDING",
      remarks:
        team.evaluation?.team_remarks ||
        "Exceptional architecture, robust code repository, and thorough literature review. Working demonstration completed with zero latency hitches. Meets all autonomous college guidelines.",
      strengths:
        team.evaluation?.strengths ||
        "Comprehensive architecture, clean modular code structure, and strong literature survey.",
      areas_for_improvement:
        team.evaluation?.areas_for_improvement ||
        "Expand automated test coverage and include benchmark latency graphs in the final appendix.",
      criteria_scores: team.evaluation?.criteria_scores || {
        project: 19,
        technical: 18.5,
        presentation: 18,
        documentation: 18.5,
        contribution: 18,
      },
    },
    {
      id: "rec-phase-1",
      stage_name: "Phase I — Mid-Semester Prototype & Architecture Review",
      evaluation_date: "28 Jul 2026",
      evaluator_name: "Dr. Arumugam V (Faculty Advisor) & PRC Committee",
      total_marks: 88,
      max_marks: 100,
      grade: "A+ (Excellent)",
      status: "APPROVED",
      remarks:
        "Hardware components integrated with prototype API. Sensor calibration verified in laboratory conditions. Team demonstrated modular pipeline and synchronized git repository.",
      strengths: "Functional mock services, complete ER diagrams and database schema normalization.",
      areas_for_improvement: "Strengthen error handling on socket disconnects and complete mobile responsiveness.",
      criteria_scores: {
        project: 18,
        technical: 17.5,
        presentation: 17.5,
        documentation: 17.5,
        contribution: 17.5,
      },
    },
    {
      id: "rec-phase-0",
      stage_name: "Zeroth Review — Problem Formulation & Scope Approval",
      evaluation_date: "15 Jun 2026",
      evaluator_name: "Department Project Review Committee (PRC)",
      total_marks: 85,
      max_marks: 100,
      grade: "A (Very Good)",
      status: "APPROVED",
      remarks:
        "Literature survey completed across 18 IEEE and Scopus-indexed publications. Problem statement aligned with autonomous department mandate and societal problem solving goals.",
      strengths: "Clear research objective, well-formulated technical roadmap.",
      areas_for_improvement: "Ensure ethical review clearance for camera surveillance data collection.",
      criteria_scores: {
        project: 17,
        technical: 17,
        presentation: 17,
        documentation: 17,
        contribution: 17,
      },
    },
  ];

  const records: TeamEvaluationRecord[] = team.records_history || defaultHistory;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F5132] p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/15 text-white border border-white/20">
                TEAM RECORDS & HISTORY
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-slate-300 border border-white/15">
                ID: {team.team_id}
              </span>
              <StatusBadge status={team.evaluation_status || "EVALUATED"} size="sm" />
            </div>

            <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white">
              {team.name}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1">
              {team.project_title}
            </p>
          </div>
        </div>

        {/* Assigned Faculty Guide Strip */}
        {(() => {
          const guide = getTeamGuide(team);
          return (
            <div className="bg-emerald-50/90 border-b border-emerald-100 px-6 py-2.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Assigned Faculty Guide:
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {guide.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-slate-700">
                  {guide.designation}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-slate-700">
                  Dept: {guide.department}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Quick Stats Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200/90 px-6 py-3 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
              Latest Final Score
            </span>
            <span className="font-mono font-bold text-sm text-[#0F5132]">
              {currentScore} / 100
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
              Reviews History
            </span>
            <span className="font-mono font-bold text-sm text-slate-800">
              {records.length} Stages Recorded
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
              Current Academic Phase
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {team.current_phase || "Phase II / Final Viva"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
              Class & Department
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {team.department || "CSE"} • Sec {team.section}
            </span>
          </div>
        </div>

        {/* Team Members Quick Switch Strip */}
        {team.members && team.members.length > 0 && (
          <div className="px-6 py-2.5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-[#0F5132] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Team Members:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {team.members.map((member) => (
                <button
                  key={member.id || member.roll_number}
                  type="button"
                  onClick={() => onSelectStudent && onSelectStudent(member, team)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-emerald-200 text-slate-700 hover:text-[#0F5132] hover:border-[#0F5132] transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{member.full_name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body - Historical Milestones */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderClock className="w-4 h-4 text-[#0F5132]" />
              Official Review Records & Marks History
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              Autonomous College Examination Record
            </span>
          </div>

          <div className="space-y-4">
            {records.map((rec, index) => (
              <div
                key={rec.id || index}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Stage Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 text-slate-700">
                        STAGE {records.length - index}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        {rec.stage_name}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Date: {rec.evaluation_date}
                      </span>
                      <span>•</span>
                      <span>Evaluator: {rec.evaluator_name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-[#0F5132] block">
                        {rec.total_marks} / {rec.max_marks}
                      </span>
                      {rec.grade && (
                        <span className="text-[10px] font-semibold text-emerald-700 block">
                          {rec.grade}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={rec.status} size="sm" />
                  </div>
                </div>

                {/* Stage Body */}
                <div className="p-4 space-y-3.5">
                  {/* Rubric Breakdown if available */}
                  {rec.criteria_scores && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Rubric Criteria Breakdown
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                          <span className="text-[10px] text-slate-500 block truncate">
                            Project Exec
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.criteria_scores.project || 18} / 20
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                          <span className="text-[10px] text-slate-500 block truncate">
                            Tech Depth
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.criteria_scores.technical || 18} / 20
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                          <span className="text-[10px] text-slate-500 block truncate">
                            Viva / Pres
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.criteria_scores.presentation || 18} / 20
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                          <span className="text-[10px] text-slate-500 block truncate">
                            Report / Doc
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.criteria_scores.documentation || 18} / 20
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-center col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-500 block truncate">
                            Individual
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.criteria_scores.contribution || 18} / 20
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Advisor Remarks & Feedback
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/70 leading-relaxed font-sans">
                      {rec.remarks}
                    </p>
                  </div>

                  {/* Strengths & Improvement notes */}
                  {(rec.strengths || rec.areas_for_improvement) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {rec.strengths && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Key Strengths
                          </span>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            {rec.strengths}
                          </p>
                        </div>
                      )}
                      {rec.areas_for_improvement && (
                        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 space-y-1">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                            Areas for Improvement
                          </span>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            {rec.areas_for_improvement}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <Link
            href={`/advisor/teams/${team.team_id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            Open Team Evaluation Workspace <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

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
