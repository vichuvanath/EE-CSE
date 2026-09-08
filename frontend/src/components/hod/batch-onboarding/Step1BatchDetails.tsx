import React from "react";
import {
  Building2,
  Calendar,
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";

export interface BatchDetailsData {
  name: string;
  department: string;
  startYear: number;
  endYear: number;
  duration: string;
  classes: string[];
}

interface Step1BatchDetailsProps {
  data: BatchDetailsData;
  onChange: (updated: Partial<BatchDetailsData>) => void;
  onNext: () => void;
  existingBatchNames: string[];
}

export const Step1BatchDetails: React.FC<Step1BatchDetailsProps> = ({
  data,
  onChange,
  onNext,
  existingBatchNames,
}) => {
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleClassCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(10, count));
    const deptPrefix = data.department.includes("Computer") || data.department === "CSE" ? "CSE" : "SEC";
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    const newClasses: string[] = [];
    for (let i = 0; i < validCount; i++) {
      if (data.classes[i]) {
        newClasses.push(data.classes[i]);
      } else {
        newClasses.push(`${deptPrefix}-${letters[i] || i + 1}`);
      }
    }
    onChange({ classes: newClasses });
  };

  const handleClassNameChange = (idx: number, val: string) => {
    const updated = [...data.classes];
    updated[idx] = val.trim();
    onChange({ classes: updated });
  };

  const handleAddClass = () => {
    if (data.classes.length >= 10) return;
    const deptPrefix = data.department.includes("Computer") || data.department === "CSE" ? "CSE" : "SEC";
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const nextName = `${deptPrefix}-${letters[data.classes.length] || data.classes.length + 1}`;
    onChange({ classes: [...data.classes, nextName] });
  };

  const handleRemoveClass = (idx: number) => {
    if (data.classes.length <= 1) {
      setErrorMsg("At least one class section is required.");
      return;
    }
    const updated = data.classes.filter((_, i) => i !== idx);
    onChange({ classes: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!data.name.trim()) {
      setErrorMsg("Batch Name is required (e.g. 2026–2030).");
      return;
    }

    // Check duplicate
    const isDuplicate = existingBatchNames.some(
      (b) => b.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg(`Batch "${data.name}" already exists in the department register.`);
      return;
    }

    if (!data.department.trim()) {
      setErrorMsg("Department is required.");
      return;
    }

    if (data.startYear >= data.endYear) {
      setErrorMsg("End Year must be greater than Start Year.");
      return;
    }

    if (data.classes.length === 0) {
      setErrorMsg("At least one class section must be defined.");
      return;
    }

    // Check for empty or duplicate class names
    const classSet = new Set<string>();
    for (const cls of data.classes) {
      if (!cls.trim()) {
        setErrorMsg("Class section names cannot be empty.");
        return;
      }
      if (classSet.has(cls.trim().toUpperCase())) {
        setErrorMsg(`Duplicate class section name: "${cls}". All sections must be unique.`);
        return;
      }
      classSet.add(cls.trim().toUpperCase());
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">{errorMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Cols */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#034419]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Cohort Specification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batch Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g. 2026–2030"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
              <p className="text-[11px] text-slate-400 mt-1">Must be unique across department cohorts</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.department}
                onChange={(e) => onChange({ department: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
                <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering (EEE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering (ECE)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={data.startYear}
                onChange={(e) => {
                  const s = parseInt(e.target.value) || 2026;
                  onChange({
                    startYear: s,
                    name: `${s}–${data.endYear}`,
                  });
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={data.endYear}
                onChange={(e) => {
                  const en = parseInt(e.target.value) || 2030;
                  onChange({
                    endYear: en,
                    name: `${data.startYear}–${en}`,
                  });
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={data.duration}
                onChange={(e) => onChange({ duration: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
            </div>
          </div>

          {/* Class Sections Configuration */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Class Sections ({data.classes.length})
                </label>
                <p className="text-[11px] text-slate-500">Specify section identifiers for student organization</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Count:</span>
                <select
                  value={data.classes.length}
                  onChange={(e) => handleClassCountChange(parseInt(e.target.value) || 1)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} Classes
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {data.classes.map((cls, idx) => (
                <div key={idx} className="relative group">
                  <input
                    type="text"
                    value={cls}
                    onChange={(e) => handleClassNameChange(idx, e.target.value)}
                    className="w-full text-xs font-semibold text-center bg-slate-50 border border-slate-300 rounded-lg py-2 px-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                  {data.classes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveClass(idx)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-600 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove section"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {data.classes.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddClass}
                  className="py-2 px-3 border border-dashed border-slate-300 hover:border-[#034419] hover:bg-emerald-50 text-slate-500 hover:text-[#034419] rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Live Summary Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#034419]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Batch Summary
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Cohort Name</span>
              <span className="font-bold text-sm text-slate-900">{data.name || "—"}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
              <span className="font-semibold text-slate-800">{data.department}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Span</span>
                <span className="font-bold text-slate-800">{data.startYear} – {data.endYear}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Classes</span>
                <span className="font-bold text-emerald-900">{data.classes.length} Sections</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#034419]" />
                <span>Onboarding Status</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Step 1 of 6. Advancing will initialize the academic cohort container for student import.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Continue Button */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          type="submit"
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-lg shadow-sm flex items-center space-x-2 transition-all active:scale-95"
        >
          <span>Continue to Student Import</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
