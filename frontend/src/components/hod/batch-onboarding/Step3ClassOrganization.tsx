import React, { useState } from "react";
import {
  Users,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  GripVertical,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { ImportedStudentItem } from "./Step2StudentImport";

interface Step3ClassOrganizationProps {
  students: ImportedStudentItem[];
  availableClasses: string[];
  onUpdateStudents: (students: ImportedStudentItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3ClassOrganization: React.FC<Step3ClassOrganizationProps> = ({
  students,
  availableClasses,
  onUpdateStudents,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("ALL"); // 'ALL', 'UNASSIGNED', or specific className
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [targetBulkClass, setTargetBulkClass] = useState<string>(availableClasses[0] || "");
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [dragOverClass, setDragOverClass] = useState<string | null>(null);

  // Group counts
  const unassignedStudents = students.filter(
    (s) => !s.className || !availableClasses.includes(s.className)
  );
  const assignedCount = students.length - unassignedStudents.length;
  const isFullyAssigned = students.length > 0 && unassignedStudents.length === 0;

  // Filter students for left roster
  const filteredRoster = students.filter((student) => {
    // Search query
    const matchSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    // Filter by class
    if (filterClass === "ALL") return true;
    if (filterClass === "UNASSIGNED") {
      return !student.className || !availableClasses.includes(student.className);
    }
    return student.className === filterClass;
  });

  // Toggle selection of single student
  const toggleSelect = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  // Select all or none visible
  const toggleSelectAllVisible = () => {
    const allVisibleSelected = filteredRoster.every((s) => selectedStudentIds.has(s.id));
    const next = new Set(selectedStudentIds);
    if (allVisibleSelected) {
      filteredRoster.forEach((s) => next.delete(s.id));
    } else {
      filteredRoster.forEach((s) => next.add(s.id));
    }
    setSelectedStudentIds(next);
  };

  // Bulk move selected students to class
  const handleBulkMove = (targetClass: string) => {
    if (selectedStudentIds.size === 0 || !targetClass) return;
    const updated = students.map((s) =>
      selectedStudentIds.has(s.id) ? { ...s, className: targetClass } : s
    );
    onUpdateStudents(updated);
    setSelectedStudentIds(new Set());
  };

  // Move single student to a class
  const handleAssignStudent = (studentId: string, targetClass: string) => {
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, className: targetClass } : s
    );
    onUpdateStudents(updated);
  };

  // Auto-balance students evenly across available classes
  const handleAutoBalance = () => {
    if (availableClasses.length === 0 || students.length === 0) return;
    const classCount = availableClasses.length;
    const updated = students.map((s, idx) => {
      const assignedClass = availableClasses[idx % classCount];
      return { ...s, className: assignedClass };
    });
    onUpdateStudents(updated);
    setSelectedStudentIds(new Set());
  };

  // HTML5 Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedStudentId(id);
  };

  const handleDragOver = (e: React.DragEvent, className: string) => {
    e.preventDefault();
    setDragOverClass(className);
  };

  const handleDragLeave = () => {
    setDragOverClass(null);
  };

  const handleDrop = (e: React.DragEvent, targetClass: string) => {
    e.preventDefault();
    setDragOverClass(null);
    const studentId = e.dataTransfer.getData("text/plain") || draggedStudentId;
    if (studentId) {
      // If multiple selected and dragged one is selected, move all selected
      if (selectedStudentIds.has(studentId)) {
        handleBulkMove(targetClass);
      } else {
        handleAssignStudent(studentId, targetClass);
      }
    }
    setDraggedStudentId(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#034419]" />
              Class Organization & Allocation
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Organize students into defined sections ({availableClasses.join(", ")}) via drag-and-drop or batch movement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAutoBalance}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#034419] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
              title="Evenly distribute cohort students across all classes"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Auto-Distribute Evenly
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Cohort</span>
            <div className="text-lg font-bold text-slate-800">{students.length}</div>
          </div>
          <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-100">
            <span className="text-xs text-emerald-700 font-medium">Assigned</span>
            <div className="text-lg font-bold text-emerald-800">{assignedCount}</div>
          </div>
          <div
            className={`rounded-lg p-3 border ${
              unassignedStudents.length > 0
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            <span className="text-xs font-medium">Unassigned / Invalid</span>
            <div className="text-lg font-bold">
              {unassignedStudents.length > 0 ? `${unassignedStudents.length} Remaining` : "0 (All Assigned)"}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Class Count</span>
            <div className="text-lg font-bold text-slate-800">{availableClasses.length} Sections</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Roster & Bulk Tools (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#034419]" />
                <h3 className="text-sm font-bold text-slate-800">Student Roster</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {filteredRoster.length}
                </span>
              </div>

              {/* Filter Dropdown */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#034419]"
              >
                <option value="ALL">All Students ({students.length})</option>
                <option value="UNASSIGNED">Unassigned ({unassignedStudents.length})</option>
                {availableClasses.map((cls) => {
                  const count = students.filter((s) => s.className === cls).length;
                  return (
                    <option key={cls} value={cls}>
                      {cls} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search and Select All Bar */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, roll no, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={toggleSelectAllVisible}
                  className="inline-flex items-center gap-1.5 hover:text-slate-800 font-medium"
                >
                  {filteredRoster.length > 0 &&
                  filteredRoster.every((s) => selectedStudentIds.has(s.id)) ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#034419]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  Select All Visible
                </button>
                {selectedStudentIds.size > 0 && (
                  <span className="text-[#034419] font-semibold">
                    {selectedStudentIds.size} selected
                  </span>
                )}
              </div>
            </div>

            {/* Bulk Action Bar (when items selected) */}
            {selectedStudentIds.size > 0 && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 animate-in fade-in duration-200">
                <div className="text-xs font-semibold text-emerald-900">
                  Move {selectedStudentIds.size} to:
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={targetBulkClass}
                    onChange={(e) => setTargetBulkClass(e.target.value)}
                    className="text-xs border border-emerald-300 rounded px-2 py-1 bg-white text-slate-800 font-medium focus:outline-none"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleBulkMove(targetBulkClass)}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded transition-colors shadow-sm"
                  >
                    Move
                  </button>
                </div>
              </div>
            )}

            {/* Student List (Scrollable) */}
            <div className="flex-1 overflow-y-auto max-h-[520px] space-y-2 pr-1">
              {filteredRoster.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No students found matching your criteria.
                </div>
              ) : (
                filteredRoster.map((student) => {
                  const isSelected = selectedStudentIds.has(student.id);
                  const isAssigned = availableClasses.includes(student.className);

                  return (
                    <div
                      key={student.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, student.id)}
                      onClick={() => toggleSelect(student.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between select-none ${
                        isSelected
                          ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 cursor-grab" />
                        <div
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(student.id);
                          }}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#034419]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">
                            {student.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {student.rollNumber}
                          </div>
                        </div>
                      </div>

                      {/* Current Class Badge */}
                      <div className="flex-shrink-0 ml-2">
                        {isAssigned ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {student.className}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Class Sections & Drop Zones (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#034419]" />
                Class Allocation Drop Zones ({availableClasses.length})
              </h3>
              <span className="text-xs text-slate-500">
                Drag student cards or use checkboxes to allocate
              </span>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {availableClasses.map((cls) => {
                const classStudents = students.filter((s) => s.className === cls);
                const isDragOver = dragOverClass === cls;
                const isExpanded = expandedClass === cls;
                const percentage =
                  students.length > 0
                    ? Math.round((classStudents.length / students.length) * 100)
                    : 0;

                return (
                  <div
                    key={cls}
                    onDragOver={(e) => handleDragOver(e, cls)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, cls)}
                    className={`rounded-xl border transition-all duration-150 ${
                      isDragOver
                        ? "border-[#034419] bg-emerald-50/80 shadow-md ring-2 ring-[#034419]"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {/* Class Header */}
                    <div className="p-3.5 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Section
                          </span>
                          <h4 className="text-base font-extrabold text-[#034419]">{cls}</h4>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            {classStudents.length} Students
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {percentage}% of cohort
                          </div>
                        </div>
                      </div>

                      {/* Capacity / Distribution Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className="bg-[#034419] h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              (classStudents.length /
                                Math.max(1, Math.ceil(students.length / availableClasses.length))) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Class Drop Zone Area */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedClass(isExpanded ? null : cls)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Hide Roster ({classStudents.length})
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              View Roster ({classStudents.length})
                            </>
                          )}
                        </button>

                        <span className="text-[11px] text-slate-400 italic">
                          Drop students here
                        </span>
                      </div>

                      {/* Expanded Student List inside Class */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {classStudents.length === 0 ? (
                            <div className="text-xs text-slate-400 italic py-2 text-center">
                              No students in {cls} yet.
                            </div>
                          ) : (
                            classStudents.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100 text-[11px]"
                              >
                                <div className="truncate pr-2">
                                  <span className="font-semibold text-slate-800">{s.fullName}</span>
                                  <span className="text-slate-400 ml-1 font-mono">({s.rollNumber})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAssignStudent(s.id, "")}
                                  className="text-slate-400 hover:text-red-600 p-0.5"
                                  title="Remove from class (move to unassigned)"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Notice */}
          {!isFullyAssigned ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <div className="font-bold">Unassigned Students Remaining</div>
                <p>
                  There are still {unassignedStudents.length} students without an assigned class.
                  Use &quot;Auto-Distribute Evenly&quot; or assign them individually before proceeding to advisor assignment.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs text-emerald-800">
                <span className="font-bold">Cohort Balanced!</span> All {students.length} students are correctly assigned across {availableClasses.length} class sections.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Import
        </button>

        <button
          type="button"
          disabled={!isFullyAssigned}
          onClick={onNext}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
            isFullyAssigned
              ? "bg-[#034419] hover:bg-emerald-900 text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Proceed to Advisor Assignment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
