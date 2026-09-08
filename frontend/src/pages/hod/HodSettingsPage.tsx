import React, { useState } from "react";
import {
  Settings,
  Calendar,
  Sliders,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";

export function HodSettingsPage() {
  const {
    academicYear,
    setAcademicYear,
    selectedBatch,
    setSelectedBatch,
    availableBatches,
  } = useHodStore();

  const [passingThreshold, setPassingThreshold] = useState(50);
  const [maxTeamsPerGuide, setMaxTeamsPerGuide] = useState(4);
  const [reviewWindowDays, setReviewWindowDays] = useState(7);

  const [alertsEnabled, setAlertsEnabled] = useState({
    critical: true,
    overdue: true,
    adminAudit: true,
    weeklyDigest: false,
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              Department Configuration
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AY {academicYear}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            HOD Governance & Portal Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department parameters, PRC regulatory passing thresholds, faculty review grace windows, and notification triggers.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs self-start sm:self-center"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Governance settings updated successfully across the department!</span>
        </div>
      )}

      {/* 2. Section 1: Academic Calendar & Batch Context */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Academic Calendar & Batch Context
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Active Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="2026-27">2026-27 (Current Active)</option>
              <option value="2025-26">2025-26 (Archived)</option>
              <option value="2024-25">2024-25 (Archived)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Determines official rubric standards and reports generation context.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Supervision Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Initial student cohort loaded on Advisors & Guides supervision console.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section 2: Academic Governance & PRC Parameters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Academic Governance & PRC Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Passing Mark Threshold (/100)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={35}
                max={75}
                value={passingThreshold}
                onChange={(e) => setPassingThreshold(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 font-mono">Marks</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Teams scoring below this value trigger automated PRC review alerts.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Max Teams Per Guide Guideline
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={8}
                value={maxTeamsPerGuide}
                onChange={(e) => setMaxTeamsPerGuide(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 font-mono">Teams</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Workload recommendation flag for faculty mentoring allocation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Evaluation Review Window
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={21}
                value={reviewWindowDays}
                onChange={(e) => setReviewWindowDays(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 font-mono">Days</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Advisor turnaround grace period before reviews are flagged as OVERDUE.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Section 3: Alert & Notification Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Alert & Supervisory Feeds Preferences
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={alertsEnabled.critical}
              onChange={(e) =>
                setAlertsEnabled({ ...alertsEnabled, critical: e.target.checked })
              }
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Critical Quality & Score Failure Alerts
              </span>
              <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                Instant notification when any project team scores below the 50% passing threshold or receives PRC intervention.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={alertsEnabled.overdue}
              onChange={(e) =>
                setAlertsEnabled({ ...alertsEnabled, overdue: e.target.checked })
              }
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Advisor Overdue Evaluation Reminders
              </span>
              <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                Flags advisor reviews that remain pending past the designated 7-day review window.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={alertsEnabled.adminAudit}
              onChange={(e) =>
                setAlertsEnabled({ ...alertsEnabled, adminAudit: e.target.checked })
              }
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Administrative Reassignment Real-Time Feeds
              </span>
              <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                Displays live alerts whenever Central Admin executes guide or advisor re-allocations.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 5. Role Boundary Architecture Note */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">
            Institutional Role Boundary Architecture Note
          </strong>
          SIET Autonomous Governance maintains strict separation of duties: HOD formulates criteria schemes, monitors faculty compliance, and certifies academic quality. Student enrollment and guide master records are managed centrally by the Registrar & Admin division.
        </div>
      </div>
    </div>
  );
}
