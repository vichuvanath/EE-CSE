import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Building2,
  Users,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";
import {
  HodManagementService,
  ManagementAdvisor,
  ManagementBatch,
} from "../../../services/hod-management.service";

interface AdvisorAssignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  advisor: ManagementAdvisor | null;
  onSaved: () => void;
}

export const AdvisorAssignDrawer: React.FC<AdvisorAssignDrawerProps> = ({
  isOpen,
  onClose,
  advisor,
  onSaved,
}) => {
  const [batches, setBatches] = useState<ManagementBatch[]>([]);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen && advisor) {
      const bList = HodManagementService.getBatches();
      setBatches(bList);
      setSelectedBatchName(advisor.batch || (bList[0]?.name ?? ""));
      setSelectedClassName(advisor.assigned_class || "");
      setNotes("");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, advisor]);

  if (!isOpen || !advisor) return null;

  const currentBatch = batches.find((b) => b.name === selectedBatchName);
  const availableClasses = currentBatch?.classes || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchName) {
      setErrorMsg("Please select a batch.");
      return;
    }
    if (!selectedClassName) {
      setErrorMsg("Please select a class section.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const targetClass = availableClasses.find((c) => c.name === selectedClassName);
      const classId = targetClass?.id || `cls-${Date.now()}`;

      const ok = HodManagementService.reassignClassAdvisor(
        classId,
        selectedBatchName,
        selectedClassName,
        advisor.id,
        advisor.name
      );

      if (ok) {
        setSuccessMsg(`Class ${selectedClassName} successfully assigned to ${advisor.name}.`);
        setTimeout(() => {
          setIsSaving(false);
          onSaved();
          onClose();
        }, 600);
      } else {
        setErrorMsg("Failed to update class advisor. Please check batch information.");
        setIsSaving(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px] transition-all">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <UserCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Assign Class Advisor</h2>
              <p className="text-xs text-emerald-100/80">Manage academic advisor class supervision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisor Brief Overview */}
        <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">{advisor.name}</div>
              <div className="text-xs text-slate-500 font-medium">{advisor.designation} • {advisor.department}</div>
              <div className="text-xs text-slate-400 mt-0.5">{advisor.email}</div>
            </div>
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded border ${
                advisor.status === "Active"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-300"
              }`}
            >
              {advisor.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-200/60 text-xs">
            <div className="bg-white p-2 rounded border border-emerald-100">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Currently Assigned</span>
              <span className="font-semibold text-emerald-900">{advisor.assigned_class || "Unassigned"}</span>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-100">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Supervised Scope</span>
              <span className="font-semibold text-slate-800">{advisor.students_count} Students ({advisor.teams_count} Teams)</span>
            </div>
          </div>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Batch Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Academic Batch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedBatchName}
                onChange={(e) => {
                  setSelectedBatchName(e.target.value);
                  setSelectedClassName("");
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#034419] transition-all"
              >
                <option value="">-- Select Academic Batch --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.department} • {b.duration})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Section Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Assigned Class Section <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedClassName}
                onChange={(e) => setSelectedClassName(e.target.value)}
                disabled={!selectedBatchName || availableClasses.length === 0}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#034419] transition-all disabled:opacity-50"
              >
                <option value="">-- Select Class Section --</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name} (Current Advisor: {cls.advisor_name})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Reassigning will transfer class mentorship and evaluation notifications to {advisor.name}.
            </p>
          </div>

          {/* Summary / Impact Box */}
          {selectedClassName && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Supervision Impact</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                By setting <strong>{advisor.name}</strong> as Class Advisor for <strong>{selectedClassName}</strong> ({selectedBatchName}), this faculty member will hold statutory oversight over all capstone teams in this section.
              </p>
            </div>
          )}

          {/* Departmental Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              HOD Administrative Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned for Semester VII-VIII Major Project Cycle"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#034419] transition-all resize-none"
            />
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-lg shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving Assignment..." : "Confirm Assignment"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
