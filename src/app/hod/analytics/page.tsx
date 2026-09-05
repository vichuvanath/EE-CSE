"use client";

import React from "react";
import {
  BarChart3,
  Users,
  Award,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useHodTeams, useHodFaculty, useHodEvaluations, useHodStudents } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import { getTeamGuide } from "@/lib/team-guide";

export default function HodAnalyticsPage() {
  const { selectedBatch } = useHodStore();
  const teams = useHodTeams(selectedBatch);
  const faculty = useHodFaculty();
  const evaluatedTeams = useHodEvaluations(selectedBatch);
  const students = useHodStudents(selectedBatch);

  // Score distribution
  const scores = evaluatedTeams
    .map((t) => t.evaluation?.team_score || 0)
    .filter((s) => s > 0);
  const scoreBands = [
    { label: "90–100 (Excellent)", min: 90, max: 100, color: "bg-emerald-500" },
    { label: "80–89 (Very Good)", min: 80, max: 89, color: "bg-teal-500" },
    { label: "70–79 (Good)", min: 70, max: 79, color: "bg-amber-500" },
    { label: "60–69 (Average)", min: 60, max: 69, color: "bg-orange-500" },
    { label: "Below 60", min: 0, max: 59, color: "bg-rose-500" },
  ];
  const maxBandCount = Math.max(
    ...scoreBands.map((b) => scores.filter((s) => s >= b.min && s <= b.max).length),
    1
  );

  // Teams by section
  const sections = [...new Set(teams.map((t) => t.section))].sort();
  const maxSectionCount = Math.max(...sections.map((s) => teams.filter((t) => t.section === s).length), 1);

  // Evaluation completion rate
  const completionRate = teams.length > 0 ? Math.round((evaluatedTeams.length / teams.length) * 100) : 0;

  // Top guides by average team performance
  const guidePerf = faculty.map((f) => {
    const guideTeams = evaluatedTeams.filter((t) => {
      const g = getTeamGuide(t);
      return g.name === f.name;
    });
    const avg =
      guideTeams.length > 0
        ? Math.round(
            guideTeams.reduce((s, t) => s + (t.evaluation?.team_score || 0), 0) / guideTeams.length
          )
        : 0;
    return { name: f.name, designation: f.designation, avg, count: guideTeams.length };
  })
    .filter((g) => g.count > 0)
    .sort((a, b) => b.avg - a.avg);
  const maxGuideAvg = Math.max(...guidePerf.map((g) => g.avg), 1);

  // Status distribution
  const statusGroups = [
    { label: "Evaluated", status: "EVALUATED", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50", count: 0 },
    { label: "Submitted", status: "SUBMITTED", icon: TrendingUp, color: "text-teal-600 bg-teal-50", count: 0 },
    { label: "Pending", status: "PENDING", icon: Clock, color: "text-amber-600 bg-amber-50", count: 0 },
    { label: "Not Started", status: "NOT_STARTED", icon: AlertTriangle, color: "text-slate-500 bg-slate-50", count: 0 },
  ];
  for (const team of teams) {
    const sg = statusGroups.find((s) => s.status === team.evaluation_status);
    if (sg) sg.count++;
    else {
      const pending = statusGroups.find((s) => s.status === "PENDING");
      if (pending) pending.count++;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`Department performance analytics for batch ${selectedBatch}.`}
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Analytics" },
        ]}
      />

      {/* Status Distribution Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusGroups.map((sg) => {
          const Icon = sg.icon;
          return (
            <div key={sg.status} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg border ${sg.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase">{sg.label}</p>
                <p className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">{sg.count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Score Distribution
          </h3>
          <div className="space-y-3">
            {scoreBands.map((band) => {
              const count = scores.filter((s) => s >= band.min && s <= band.max).length;
              const pct = Math.round((count / Math.max(maxBandCount, 1)) * 100);
              return (
                <div key={band.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-36 shrink-0 font-medium">{band.label}</span>
                  <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${band.color} rounded-full transition-all duration-700 flex items-center justify-end pr-2.5`}
                      style={{ width: `${Math.max(pct, count > 0 ? 12 : 0)}%` }}
                    >
                      {count > 0 && (
                        <span className="text-[10px] font-bold text-white">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teams by Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 mb-5">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            Teams by Section
          </h3>
          <div className="space-y-4">
            {sections.map((section) => {
              const count = teams.filter((t) => t.section === section).length;
              const pct = Math.round((count / Math.max(maxSectionCount, 1)) * 100);
              return (
                <div key={section} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-700 w-20 shrink-0">
                    Section {section}
                  </span>
                  <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                      style={{ width: `${Math.max(pct, 15)}%` }}
                    >
                      <span className="text-[11px] font-bold text-white">{count} teams</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Rate */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">Evaluation Completion Rate</span>
              <span className="text-lg font-bold text-indigo-600 font-['Plus_Jakarta_Sans',sans-serif]">{completionRate}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {evaluatedTeams.length} of {teams.length} teams evaluated
            </p>
          </div>
        </div>

        {/* Top Guides */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-indigo-500" />
            Guide Performance (Avg. Team Score)
          </h3>
          <div className="space-y-3">
            {guidePerf.length > 0 ? (
              guidePerf.map((g, idx) => {
                const pct = Math.round((g.avg / Math.max(maxGuideAvg, 1)) * 100);
                return (
                  <div key={g.name} className="flex items-center gap-4">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      idx === 0
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-semibold text-slate-800 block">{g.name}</span>
                      <span className="text-[10px] text-slate-400">{g.designation} · {g.count} teams</span>
                    </div>
                    <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700 flex items-center justify-end pr-2.5"
                        style={{ width: `${Math.max(pct, 12)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{g.avg}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No evaluation data available for guide performance analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
