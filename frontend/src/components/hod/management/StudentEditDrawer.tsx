import React, { useState, useEffect } from "react";
import { X, User, Check, AlertCircle } from "lucide-react";
import {
  ManagementStudent,
  HodManagementService,
} from "@/services/hod-management.service";

interface StudentEditDrawerProps {
  isOpen: boolean;
  student: ManagementStudent | null;
  onClose: () => void;
  onSaved: () => void;
}

export function StudentEditDrawer({
  isOpen,
  student,
  onClose,
  onSaved,
}: StudentEditDrawerProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    roll_number: "",
    email: "",
    batch: "2025–2029",
    class_name: "CSE-A",
    team_id: "",
    status: "Active" as "Active" | "Inactive",
  });

  const batches = HodManagementService.getBatches();
  const teams = HodManagementService.getTeams();

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        roll_number: student.roll_number,
        email: student.email,
        batch: student.batch,
        class_name: student.class_name,
        team_id: student.team_id,
        status: student.status,
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  // Filter teams for current batch & class
  const availableTeams = teams.filter(
    (t) => t.batch === formData.batch && t.class_name === formData.class_name
  );

  const handleSave = () => {
    const selectedTeam = teams.find((t) => t.id === formData.team_id);
    HodManagementService.updateStudent(student.id, {
      full_name: formData.full_name,
      roll_number: formData.roll_number,
      email: formData.email,
      batch: formData.batch,
      class_name: formData.class_name,
      team_id: formData.team_id,
      team_name: selectedTeam ? selectedTeam.name : "Unassigned",
      advisor_name: selectedTeam ? selectedTeam.advisor_name : student.advisor_name,
      guide_name: selectedTeam ? selectedTeam.guide_name : student.guide_name,
      status: formData.status,
    });
    onSaved();
    onClose();
  };

  const isTeamMoving = formData.team_id !== student.team_id;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/15">
              <User className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Edit Candidate Information
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {student.full_name} ({student.roll_number})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Batch
              </label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Class / Section
              </label>
              <select
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium font-mono"
              >
                <option value="CSE-A">CSE-A</option>
                <option value="CSE-B">CSE-B</option>
                <option value="CSE-C">CSE-C</option>
                <option value="CSE-D">CSE-D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Assigned Project Team
            </label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium font-mono"
            >
              <option value="">Unassigned</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.project.title.slice(0, 45)}... ({t.members.length}/4 Members)
                </option>
              ))}
            </select>
            {isTeamMoving && (
              <div className="mt-2 p-2.5 rounded-md bg-purple-50 border border-purple-200 flex items-start gap-2 text-xs text-purple-900">
                <AlertCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Team Transfer Notice</strong>
                  Moving candidate from{" "}
                  <span className="font-mono font-bold">{student.team_name}</span> to{" "}
                  <span className="font-mono font-bold">
                    {teams.find((t) => t.id === formData.team_id)?.name || "Unassigned"}
                  </span>
                  . This transfer will be permanently logged in Activity History.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Enrollment Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="Active">Active (Good Standing)</option>
              <option value="Inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
