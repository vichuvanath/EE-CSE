import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Mail,
  Building,
  Sparkles,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";
import {
  HodManagementService,
  ManagementAdvisor,
} from "../../../services/hod-management.service";
import { ImportedStudentItem } from "./Step2StudentImport";

export interface ClassAdvisorAssignment {
  className: string;
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
}

interface Step4AdvisorAssignmentProps {
  availableClasses: string[];
  students: ImportedStudentItem[];
  assignments: ClassAdvisorAssignment[];
  onChangeAssignments: (assignments: ClassAdvisorAssignment[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4AdvisorAssignment: React.FC<Step4AdvisorAssignmentProps> = ({
  availableClasses,
  students,
  assignments,
  onChangeAssignments,
  onNext,
  onBack,
}) => {
  const [advisorsList, setAdvisorsList] = useState<ManagementAdvisor[]>([]);
  const [isAddingNewAdvisor, setIsAddingNewAdvisor] = useState(false);
  const [newAdvName, setNewAdvName] = useState("");
  const [newAdvEmail, setNewAdvEmail] = useState("");
  const [newAdvDesignation, setNewAdvDesignation] = useState("Assistant Professor");

  // Load advisors from service
  useEffect(() => {
    const data = HodManagementService.getAdvisors();
    // Supplement with standard department faculty if list is short
    const fallbackAdvisors: ManagementAdvisor[] = [
      {
        id: "adv-arun",
        name: "Dr. Arun",
        designation: "Associate Professor",
        department: "CSE",
        email: "arun.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_class: "CSE-A",
        teams_count: 4,
        students_count: 17,
        status: "Active",
      },
      {
        id: "adv-priya",
        name: "Dr. Priya",
        designation: "Associate Professor",
        department: "CSE",
        email: "priya.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_class: "CSE-B",
        teams_count: 2,
        students_count: 9,
        status: "Active",
      },
      {
        id: "adv-kumar",
        name: "Dr. Kumar",
        designation: "Professor",
        department: "CSE",
        email: "kumar.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_class: "CSE-C",
        teams_count: 2,
        students_count: 8,
        status: "Active",
      },
      {
        id: "adv-meena",
        name: "Dr. Meena",
        designation: "Professor",
        department: "CSE",
        email: "meena.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_class: "CSE-D",
        teams_count: 1,
        students_count: 4,
        status: "Active",
      },
      {
        id: "adv-ravi",
        name: "Dr. Ravi",
        designation: "Associate Professor",
        department: "CSE",
        email: "ravi.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_class: "CSE-E",
        teams_count: 1,
        students_count: 4,
        status: "Active",
      },
      {
        id: "adv-anitha",
        name: "Dr. S. Anitha",
        designation: "Associate Professor",
        department: "CSE",
        email: "anitha.cse@siet.ac.in",
        batch: "2024–2028",
        assigned_class: "None",
        teams_count: 0,
        students_count: 0,
        status: "Active",
      },
      {
        id: "adv-karthik",
        name: "Dr. R. Karthik",
        designation: "Assistant Professor",
        department: "CSE",
        email: "karthik.cse@siet.ac.in",
        batch: "2024–2028",
        assigned_class: "None",
        teams_count: 0,
        students_count: 0,
        status: "Active",
      },
    ];

    const merged = [...data];
    fallbackAdvisors.forEach((fa) => {
      if (!merged.find((m) => m.name.toLowerCase() === fa.name.toLowerCase())) {
        merged.push(fa);
      }
    });
    setAdvisorsList(merged);
  }, []);

  // Initialize or reconcile assignments with availableClasses
  useEffect(() => {
    let hasChanged = false;
    const nextAssignments = availableClasses.map((cls) => {
      const existing = assignments.find((a) => a.className === cls);
      if (existing) return existing;
      hasChanged = true;
      return {
        className: cls,
        advisorId: "",
        advisorName: "",
        advisorEmail: "",
      };
    });

    if (hasChanged || assignments.length !== availableClasses.length) {
      onChangeAssignments(nextAssignments);
    }
  }, [availableClasses]);

  // Update assignment for a class
  const handleSelectAdvisor = (className: string, advisorId: string) => {
    const advisor = advisorsList.find((a) => a.id === advisorId);
    const updated = assignments.map((item) => {
      if (item.className === className) {
        return {
          className,
          advisorId: advisor?.id || "",
          advisorName: advisor?.name || "",
          advisorEmail: advisor?.email || "",
        };
      }
      return item;
    });
    onChangeAssignments(updated);
  };

  // Auto-assign unique advisors across classes
  const handleAutoAssign = () => {
    const updated = availableClasses.map((cls, idx) => {
      const adv = advisorsList[idx % advisorsList.length];
      return {
        className: cls,
        advisorId: adv?.id || "",
        advisorName: adv?.name || "",
        advisorEmail: adv?.email || "",
      };
    });
    onChangeAssignments(updated);
  };

  // Quick add new faculty advisor
  const handleAddNewAdvisor = () => {
    if (!newAdvName.trim() || !newAdvEmail.trim()) return;
    const newId = `adv-${Date.now().toString(36)}`;
    const newAdv: ManagementAdvisor = {
      id: newId,
      name: newAdvName.trim(),
      designation: newAdvDesignation,
      department: "CSE",
      email: newAdvEmail.trim(),
      batch: "2026–2030",
      assigned_class: "Pending",
      teams_count: 0,
      students_count: 0,
      status: "Active",
    };
    const nextList = [newAdv, ...advisorsList];
    setAdvisorsList(nextList);
    setNewAdvName("");
    setNewAdvEmail("");
    setIsAddingNewAdvisor(false);
  };

  // Validation checks
  const unassignedClasses = assignments.filter((a) => !a.advisorId || !a.advisorName);
  const isAllAssigned = availableClasses.length > 0 && unassignedClasses.length === 0;

  // Track advisor frequency to warn about over-allocation
  const advisorUsage: Record<string, number> = {};
  assignments.forEach((a) => {
    if (a.advisorName) {
      advisorUsage[a.advisorName] = (advisorUsage[a.advisorName] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#034419]" />
              Class Advisor Assignment
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Designate one primary faculty advisor to oversee each class section and supervise its student projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleAutoAssign}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#034419] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Distribute Faculty
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNewAdvisor(!isAddingNewAdvisor)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Faculty
            </button>
          </div>
        </div>

        {/* Quick Modal/Form for Adding Faculty */}
        {isAddingNewAdvisor && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Register New Faculty Advisor
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNewAdvisor(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Faculty Name (e.g. Dr. Rajesh)"
                value={newAdvName}
                onChange={(e) => setNewAdvName(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
              <input
                type="email"
                placeholder="Official Email (e.g. rajesh.cse@siet.ac.in)"
                value={newAdvEmail}
                onChange={(e) => setNewAdvEmail(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
              <select
                value={newAdvDesignation}
                onChange={(e) => setNewAdvDesignation(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
              <button
                type="button"
                onClick={handleAddNewAdvisor}
                disabled={!newAdvName.trim() || !newAdvEmail.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
              >
                Save & Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Class Advisor Assignment Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#034419]" />
            <h3 className="text-sm font-bold text-slate-800">Class to Advisor Allocations</h3>
          </div>
          <span className="text-xs text-slate-500">
            {assignments.filter((a) => a.advisorId).length} of {availableClasses.length} assigned
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {availableClasses.map((className) => {
            const assignment = assignments.find((a) => a.className === className);
            const classStudentCount = students.filter((s) => s.className === className).length;
            const selectedAdvisor = advisorsList.find((a) => a.id === assignment?.advisorId);
            const isAssigned = !!assignment?.advisorId;
            const duplicateCount = selectedAdvisor ? advisorUsage[selectedAdvisor.name] || 0 : 0;

            return (
              <div
                key={className}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Class Info */}
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-extrabold text-[#034419] text-sm">
                    {className.replace("CSE-", "").replace("SEC-", "")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{className}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {classStudentCount} Students enrolled
                    </span>
                  </div>
                </div>

                {/* Center: Advisor Selector */}
                <div className="flex-1 max-w-lg">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Designated Advisor
                  </label>
                  <select
                    value={assignment?.advisorId || ""}
                    onChange={(e) => handleSelectAdvisor(className, e.target.value)}
                    className={`w-full text-xs border rounded-lg px-3 py-2 bg-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#034419] font-medium ${
                      isAssigned ? "border-slate-300 text-slate-800" : "border-amber-300 text-amber-900 bg-amber-50/40"
                    }`}
                  >
                    <option value="">-- Choose Faculty Advisor --</option>
                    {advisorsList.map((adv) => {
                      const count = assignments.filter((a) => a.advisorId === adv.id).length;
                      return (
                        <option key={adv.id} value={adv.id}>
                          {adv.name} ({adv.designation}) — {adv.email} {count > 0 ? `[Assigned: ${count}]` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Right: Advisor Card Preview */}
                <div className="min-w-[220px]">
                  {selectedAdvisor ? (
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-[#034419] flex items-center justify-between">
                        <span>{selectedAdvisor.name}</span>
                        {duplicateCount > 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold" title="Assigned to multiple classes">
                            {duplicateCount} classes
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{selectedAdvisor.email}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedAdvisor.designation} • CSE
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 text-center">
                      No Advisor Assigned
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Banner */}
      {!isAllAssigned ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <div className="font-bold">Missing Advisor Assignments</div>
            <p>
              Please assign a faculty advisor for each of the {unassignedClasses.length} remaining class section(s) before proceeding to team creation.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs text-emerald-800">
            <span className="font-bold">All Classes Assigned!</span> Each class has an active advisor ready to oversee student capstone projects.
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Class Organization
        </button>

        <button
          type="button"
          disabled={!isAllAssigned}
          onClick={onNext}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
            isAllAssigned
              ? "bg-[#034419] hover:bg-emerald-900 text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Proceed to Team Setup
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
