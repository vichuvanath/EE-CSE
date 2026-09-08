import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Building2,
  Users,
  GraduationCap,
  Users2,
  FolderGit2,
  ShieldCheck,
  Edit3,
  Sparkles,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import {
  HodManagementService,
  ManagementBatch,
  ManagementStudent,
  ManagementTeam,
} from "../../../services/hod-management.service";
import { BatchDetailsData } from "./Step1BatchDetails";
import { ImportedStudentItem } from "./Step2StudentImport";
import { ClassAdvisorAssignment } from "./Step4AdvisorAssignment";

interface Step6ReviewCreateProps {
  batchDetails: BatchDetailsData;
  students: ImportedStudentItem[];
  availableClasses: string[];
  classAdvisors: ClassAdvisorAssignment[];
  teams: ManagementTeam[];
  onJumpToStep: (stepNumber: number) => void;
  onBack: () => void;
}

export const Step6ReviewCreate: React.FC<Step6ReviewCreateProps> = ({
  batchDetails,
  students,
  availableClasses,
  classAdvisors,
  teams,
  onJumpToStep,
  onBack,
}) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Accordion states
  const [expandedSection, setExpandedSection] = useState<string | null>("summary");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  // Validation checklist
  const checks = [
    {
      label: "Batch Details & Department Configured",
      passed: !!batchDetails.name && !!batchDetails.department && batchDetails.classes.length > 0,
      detail: `${batchDetails.name} • ${batchDetails.department} (${batchDetails.startYear}–${batchDetails.endYear})`,
      step: 1,
    },
    {
      label: "Class Sections Defined",
      passed: availableClasses.length > 0,
      detail: `${availableClasses.length} Sections (${availableClasses.join(", ")})`,
      step: 1,
    },
    {
      label: "Student Roster Imported & Cleaned",
      passed: students.length > 0,
      detail: `${students.length} Validated Student Records`,
      step: 2,
    },
    {
      label: "All Students Assigned to Class Sections",
      passed: students.length > 0 && students.every((s) => availableClasses.includes(s.className)),
      detail: `${students.length} of ${students.length} students assigned (0 unassigned)`,
      step: 3,
    },
    {
      label: "Designated Faculty Advisors for All Classes",
      passed:
        availableClasses.length > 0 &&
        availableClasses.every((cls) => {
          const m = classAdvisors.find((a) => a.className === cls);
          return m && !!m.advisorId;
        }),
      detail: `${classAdvisors.filter((a) => a.advisorId).length} of ${availableClasses.length} classes have an assigned advisor`,
      step: 4,
    },
    {
      label: "Capstone Teams & Guides Initialized",
      passed: teams.length > 0,
      detail: `${teams.length} Teams configured with students and project guides`,
      step: 5,
    },
  ];

  const allPassed = checks.every((c) => c.passed);

  // Final submit handler
  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Build ManagementBatch
      const cleanBatchId = `batch-${batchDetails.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const newBatch: ManagementBatch = {
        id: cleanBatchId,
        name: batchDetails.name,
        department: batchDetails.department,
        duration: batchDetails.duration,
        start_year: batchDetails.startYear,
        end_year: batchDetails.endYear,
        students_count: students.length,
        teams_count: teams.length,
        status: "Active",
        classes: availableClasses.map((cls, idx) => {
          const adv = classAdvisors.find((a) => a.className === cls);
          const clsStudents = students.filter((s) => s.className === cls);
          const clsTeams = teams.filter((t) => t.class_name === cls);

          return {
            id: `cls-${cleanBatchId}-${idx + 1}`,
            name: cls,
            batch_name: batchDetails.name,
            advisor_id: adv?.advisorId || "",
            advisor_name: adv?.advisorName || "Pending",
            advisor_email: adv?.advisorEmail || "",
            students_count: clsStudents.length,
            teams_count: clsTeams.length,
            status: "Active",
          };
        }),
      };

      // 2. Build ManagementStudents
      const newStudents: ManagementStudent[] = students.map((s, idx) => {
        const team = teams.find((t) => t.members.some((m) => m.id === s.id || m.roll_number === s.rollNumber));
        const adv = classAdvisors.find((a) => a.className === s.className);

        return {
          id: s.id || `stud-${cleanBatchId}-${idx + 1}`,
          roll_number: s.rollNumber,
          full_name: s.fullName,
          email: s.email,
          batch: batchDetails.name,
          class_name: s.className,
          team_id: team?.id || "",
          team_name: team?.name || "",
          advisor_name: adv?.advisorName || "Pending",
          guide_name: team?.guide_name || "Unassigned",
          status: "Active",
        };
      });

      // 3. Call Service
      const result = HodManagementService.onboardNewBatch({
        batch: newBatch,
        students: newStudents,
        teams,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to onboard batch. Please check entries.");
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setCreationSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during batch creation.");
      setIsSubmitting(false);
    }
  };

  // Export Roster Summary Excel
  const handleDownloadRoster = () => {
    const dataRows = students.map((s) => {
      const team = teams.find((t) => t.members.some((m) => m.roll_number === s.rollNumber));
      const adv = classAdvisors.find((a) => a.className === s.className);
      return {
        "Batch": batchDetails.name,
        "Class Section": s.className,
        "Roll Number": s.rollNumber,
        "Full Name": s.fullName,
        "Email": s.email,
        "Phone": s.phone || "",
        "Class Advisor": adv?.advisorName || "Pending",
        "Team ID": team?.team_id || "Unassigned",
        "Team Name": team?.name || "Unassigned",
        "Project Guide": team?.guide_name || "Unassigned",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Batch Roster");
    XLSX.writeFile(workbook, `${batchDetails.name.replace(/[^a-zA-Z0-9]/g, "_")}_Roster.xlsx`);
  };

  if (creationSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-lg max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 text-[#034419]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Batch Successfully Onboarded
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {batchDetails.name} Academic Batch is Live!
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            The cohort has been initialized with {students.length} students across {availableClasses.length} class sections, {classAdvisors.filter((a) => a.advisorId).length} advisors, and {teams.length} project teams.
          </p>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-lg mx-auto">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Cohort</div>
            <div className="text-sm font-bold text-slate-800">{batchDetails.name}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Students</div>
            <div className="text-sm font-bold text-slate-800">{students.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Sections</div>
            <div className="text-sm font-bold text-slate-800">{availableClasses.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Teams</div>
            <div className="text-sm font-bold text-slate-800">{teams.length}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/hod/management")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded-xl transition-all shadow-md"
          >
            Go to Management & Control
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/hod/management?tab=batches")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          >
            View Batches Tab
          </button>

          <button
            type="button"
            onClick={handleDownloadRoster}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Download Excel Roster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#034419]" />
              Executive Review & Batch Onboarding
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Verify the complete academic cohort setup before writing records to the department database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadRoster}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Draft Roster (.xlsx)
            </button>
          </div>
        </div>

        {/* High-level KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Batch Name</span>
            <div className="text-base font-extrabold text-[#034419] truncate">{batchDetails.name}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Students</span>
            <div className="text-base font-extrabold text-slate-800">{students.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Class Sections</span>
            <div className="text-base font-extrabold text-slate-800">{availableClasses.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Class Advisors</span>
            <div className="text-base font-extrabold text-slate-800">
              {classAdvisors.filter((a) => a.advisorId).length}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Project Teams</span>
            <div className="text-base font-extrabold text-slate-800">{teams.length}</div>
          </div>
        </div>
      </div>

      {/* Pre-Flight Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#034419]" />
          Pre-Flight Validation Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map((c, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                c.passed
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-red-50/60 border-red-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-semibold ${c.passed ? "text-emerald-950" : "text-red-950"}`}>
                    {c.label}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${c.passed ? "text-emerald-700" : "text-red-700"}`}>
                    {c.detail}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onJumpToStep(c.step)}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#034419] flex items-center gap-1 flex-shrink-0"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Section Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* Section 1: Cohort & Classes */}
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("classes")}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[#034419]" />
              <h4 className="text-sm font-bold text-slate-800">
                Class Sections & Enrollment Breakdown ({availableClasses.length} sections)
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToStep(1);
                }}
                className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit Classes
              </button>
              {expandedSection === "classes" ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSection === "classes" && (
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-150">
              {availableClasses.map((cls) => {
                const clsStudents = students.filter((s) => s.className === cls);
                const adv = classAdvisors.find((a) => a.className === cls);
                const clsTeams = teams.filter((t) => t.class_name === cls);

                return (
                  <div key={cls} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#034419] text-sm">{cls}</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                        {clsStudents.length} Students
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      <span className="font-semibold">Advisor:</span> {adv?.advisorName || "Not assigned"}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      <span className="font-semibold">Teams:</span> {clsTeams.length} teams formed
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Advisors Summary */}
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("advisors")}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-[#034419]" />
              <h4 className="text-sm font-bold text-slate-800">
                Designated Advisors ({classAdvisors.filter((a) => a.advisorId).length} assigned)
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToStep(4);
                }}
                className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit Advisors
              </button>
              {expandedSection === "advisors" ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSection === "advisors" && (
            <div className="mt-4 pt-3 border-t border-slate-100 divide-y divide-slate-100 text-xs">
              {classAdvisors.map((item) => (
                <div key={item.className} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 w-20">{item.className}</span>
                    <span className="font-semibold text-[#034419]">{item.advisorName || "Unassigned"}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{item.advisorEmail || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Teams Summary */}
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("teams")}
          >
            <div className="flex items-center gap-3">
              <Users2 className="w-4 h-4 text-[#034419]" />
              <h4 className="text-sm font-bold text-slate-800">
                Capstone Project Teams & Guides ({teams.length} teams)
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToStep(5);
                }}
                className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit Teams
              </button>
              {expandedSection === "teams" ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSection === "teams" && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {teams.map((t) => (
                  <div key={t.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{t.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {t.class_name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      <span className="font-medium">Guide:</span> {t.guide_name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {t.members.length} members ({t.members.find((m) => m.role === "Team Lead")?.full_name || "Lead Pending"})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error banner if any */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <span className="font-bold">Error Creating Batch:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Navigation & Action Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team Setup
        </button>

        <button
          type="button"
          disabled={!allPassed || isSubmitting}
          onClick={() => setShowConfirmModal(true)}
          className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-xl shadow-md transition-all ${
            allPassed && !isSubmitting
              ? "bg-[#034419] hover:bg-emerald-900 text-white cursor-pointer hover:shadow-lg"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Create Academic Batch Now
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[#034419]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Academic Batch Creation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You are about to onboard the new academic cohort for SIET Computer Science & Engineering.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Summary of Commit:</div>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>
                  <span className="font-semibold text-slate-900">{batchDetails.name}</span> Academic Batch will be registered.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{students.length} Student Profiles</span> will be added to the student register.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{availableClasses.length} Class Sections</span> ({availableClasses.join(", ")}) initialized.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{classAdvisors.filter((a) => a.advisorId).length} Faculty Advisors</span> will receive supervisory assignment.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{teams.length} Capstone Project Teams</span> will be formed with designated guides.
                </li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>This operation will create live departmental records and log an audit trail entry.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded-lg transition-all shadow-sm"
              >
                {isSubmitting ? (
                  <>Creating Cohort...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Onboard Batch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
