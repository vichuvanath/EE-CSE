import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, Trash2, Check, UserCheck } from "lucide-react";
import {
  ManagementBatch,
  ManagementClass,
  HodManagementService,
} from "@/services/hod-management.service";

interface BatchEditDrawerProps {
  isOpen: boolean;
  batch: ManagementBatch | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BatchEditDrawer({
  isOpen,
  batch,
  onClose,
  onSaved,
}: BatchEditDrawerProps) {
  const [formData, setFormData] = useState({
    name: "",
    department: "CSE",
    start_year: 2025,
    end_year: 2029,
    status: "Active" as "Active" | "Inactive",
  });

  const [classes, setClasses] = useState<ManagementClass[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const advisors = HodManagementService.getAdvisors();

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        department: batch.department,
        start_year: batch.start_year,
        end_year: batch.end_year,
        status: batch.status,
      });
      setClasses([...batch.classes]);
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  const handleClassAdvisorChange = (classId: string, advisorId: string) => {
    const adv = advisors.find((a) => a.id === advisorId);
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          return {
            ...cls,
            advisor_id: advisorId,
            advisor_name: adv ? adv.name : "Unassigned",
            advisor_email: adv ? adv.email : "",
          };
        }
        return cls;
      })
    );
  };

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ManagementClass = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim().toUpperCase(),
      batch_name: formData.name,
      advisor_id: advisors[0]?.id || "",
      advisor_name: advisors[0]?.name || "Unassigned",
      advisor_email: advisors[0]?.email || "",
      students_count: 0,
      teams_count: 0,
      status: "Active",
    };
    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
  };

  const handleRemoveClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  };

  const handleSave = () => {
    HodManagementService.updateBatch(batch.id, {
      name: formData.name,
      department: formData.department,
      start_year: Number(formData.start_year),
      end_year: Number(formData.end_year),
      duration: `${Number(formData.end_year) - Number(formData.start_year)} Years`,
      status: formData.status,
      classes: classes,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/15">
              <Calendar className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Edit Batch Configuration
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {batch.name} • {batch.department} Department
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Batch Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
                >
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="IT">Information Technology (IT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive / Concluded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  value={formData.start_year}
                  onChange={(e) =>
                    setFormData({ ...formData, start_year: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  End Year
                </label>
                <input
                  type="number"
                  value={formData.end_year}
                  onChange={(e) =>
                    setFormData({ ...formData, end_year: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Classes & Class Advisors List */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Classes &amp; Assigned Advisors
                </h3>
                <p className="text-[11px] text-slate-400">
                  {classes.length} Section(s) configured for this batch
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 font-mono text-xs block">
                      {cls.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {cls.students_count} Students • {cls.teams_count} Teams
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={cls.advisor_id}
                        onChange={(e) => handleClassAdvisorChange(cls.id, e.target.value)}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 max-w-[170px] truncate"
                      >
                        {advisors.map((adv) => (
                          <option key={adv.id} value={adv.id}>
                            {adv.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveClass(cls.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Class Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="e.g. CSE-E"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-600 uppercase font-mono"
              />
              <button
                type="button"
                onClick={handleAddClass}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>
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
