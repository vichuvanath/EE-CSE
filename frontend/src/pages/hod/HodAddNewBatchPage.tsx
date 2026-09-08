import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Building2,
  Upload,
  Layers,
  GraduationCap,
  Users2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Save,
  Check,
} from "lucide-react";
import {
  HodManagementService,
  ManagementTeam,
} from "../../services/hod-management.service";
import {
  Step1BatchDetails,
  BatchDetailsData,
} from "../../components/hod/batch-onboarding/Step1BatchDetails";
import {
  Step2StudentImport,
  ImportedStudentItem,
} from "../../components/hod/batch-onboarding/Step2StudentImport";
import { Step3ClassOrganization } from "../../components/hod/batch-onboarding/Step3ClassOrganization";
import {
  Step4AdvisorAssignment,
  ClassAdvisorAssignment,
} from "../../components/hod/batch-onboarding/Step4AdvisorAssignment";
import { Step5TeamSetup } from "../../components/hod/batch-onboarding/Step5TeamSetup";
import { Step6ReviewCreate } from "../../components/hod/batch-onboarding/Step6ReviewCreate";

interface BatchDraftState {
  currentStep: number;
  batchDetails: BatchDetailsData;
  students: ImportedStudentItem[];
  classAdvisors: ClassAdvisorAssignment[];
  teams: ManagementTeam[];
  savedAt: string;
}

const STEP_DEFINITIONS = [
  {
    step: 1,
    title: "Batch Details",
    desc: "Name, duration & sections",
    icon: Calendar,
  },
  {
    step: 2,
    title: "Student Import",
    desc: "Upload Excel/CSV roster",
    icon: Upload,
  },
  {
    step: 3,
    title: "Class Allocation",
    desc: "Organize students to sections",
    icon: Layers,
  },
  {
    step: 4,
    title: "Advisor Assignment",
    desc: "Designate faculty advisors",
    icon: GraduationCap,
  },
  {
    step: 5,
    title: "Team Setup",
    desc: "Form capstone teams & guides",
    icon: Users2,
  },
  {
    step: 6,
    title: "Review & Create",
    desc: "Pre-flight check & commit",
    icon: ShieldCheck,
  },
];

export const HodAddNewBatchPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step State (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [highestReachedStep, setHighestReachedStep] = useState<number>(1);

  // Existing batch names for uniqueness check
  const [existingBatchNames, setExistingBatchNames] = useState<string[]>([]);

  // Step 1 State: Batch Details
  const [batchDetails, setBatchDetails] = useState<BatchDetailsData>({
    name: "2026–2030",
    department: "Computer Science and Engineering",
    startYear: 2026,
    endYear: 2030,
    duration: "4 Years (UG)",
    classes: ["CSE-A", "CSE-B", "CSE-C", "CSE-D", "CSE-E"],
  });

  // Step 2 & 3 State: Students
  const [students, setStudents] = useState<ImportedStudentItem[]>([]);

  // Step 4 State: Class Advisors
  const [classAdvisors, setClassAdvisors] = useState<ClassAdvisorAssignment[]>([]);

  // Step 5 State: Teams
  const [teams, setTeams] = useState<ManagementTeam[]>([]);

  // Draft indicator
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState<{
    batchName: string;
    savedAt: string;
    data: BatchDraftState;
  } | null>(null);
  const [justSavedNotice, setJustSavedNotice] = useState(false);

  // Load existing batches from management service
  useEffect(() => {
    const batches = HodManagementService.getBatches();
    setExistingBatchNames(batches.map((b) => b.name));

    // Check for draft
    const draft = HodManagementService.getBatchDraft<BatchDraftState>();
    if (draft && draft.batchDetails?.name) {
      setDraftPrompt({
        batchName: draft.batchDetails.name,
        savedAt: draft.savedAt || "Recently",
        data: draft,
      });
    }
  }, []);

  // Update highest step reached
  const advanceStep = (nextStep: number) => {
    setCurrentStep(nextStep);
    if (nextStep > highestReachedStep) {
      setHighestReachedStep(nextStep);
    }
    // Auto-save draft on step navigation
    persistDraft(nextStep);
  };

  // Save draft logic
  const persistDraft = (stepToSave: number = currentStep) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const draftState: BatchDraftState = {
      currentStep: stepToSave,
      batchDetails,
      students,
      classAdvisors,
      teams,
      savedAt: now,
    };
    HodManagementService.saveBatchDraft(draftState);
    setDraftSavedTime(now);
    setJustSavedNotice(true);
    setTimeout(() => setJustSavedNotice(false), 2500);
  };

  // Restore draft
  const handleRestoreDraft = () => {
    if (!draftPrompt) return;
    const d = draftPrompt.data;
    if (d.batchDetails) setBatchDetails(d.batchDetails);
    if (d.students) setStudents(d.students);
    if (d.classAdvisors) setClassAdvisors(d.classAdvisors);
    if (d.teams) setTeams(d.teams);
    if (d.currentStep) {
      setCurrentStep(d.currentStep);
      setHighestReachedStep(Math.max(d.currentStep, highestReachedStep));
    }
    setDraftSavedTime(d.savedAt || "Restored");
    setDraftPrompt(null);
  };

  const handleDismissDraft = () => {
    HodManagementService.clearBatchDraft();
    setDraftPrompt(null);
  };

  // Navigation handlers
  const handleNextFromStep1 = () => {
    advanceStep(2);
  };

  const handleNextFromStep2 = () => {
    advanceStep(3);
  };

  const handleNextFromStep3 = () => {
    advanceStep(4);
  };

  const handleNextFromStep4 = () => {
    advanceStep(5);
  };

  const handleNextFromStep5 = () => {
    advanceStep(6);
  };

  const handleBackToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Breadcrumbs */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <Link
              to="/hod/management"
              className="hover:text-[#034419] font-medium flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Management & Control
            </Link>
            <span>/</span>
            <Link
              to="/hod/management?tab=batches"
              className="hover:text-[#034419] text-slate-600 font-medium transition-colors"
            >
              Batches
            </Link>
            <span>/</span>
            <span className="text-[#034419] font-bold">Add New Batch</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#034419] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                Add New Academic Batch
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                6-Step Guided Onboarding Wizard for Cohort {batchDetails.name || "Setup"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Draft Actions */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {draftSavedTime && (
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Draft saved at {draftSavedTime}
            </span>
          )}

          <button
            type="button"
            onClick={() => persistDraft()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
            title="Save current progress as draft"
          >
            {justSavedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-500" />
                Save Draft
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to exit? Any unsaved changes will remain in draft.")) {
                navigate("/hod/management");
              }
            }}
            className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Exit Wizard
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Draft Restore Alert */}
        {draftPrompt && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#034419] flex-shrink-0" />
              <div className="text-xs text-emerald-950">
                <span className="font-bold">Previous Draft Found:</span> Would you like to resume
                your setup for <span className="font-semibold">{draftPrompt.batchName}</span> (saved at{" "}
                {draftPrompt.savedAt})?
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded-lg transition-colors shadow-sm"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={handleDismissDraft}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Stepper Navigation Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STEP_DEFINITIONS.map((def) => {
              const isActive = currentStep === def.step;
              const isCompleted = currentStep > def.step;
              const isAccessible = def.step <= highestReachedStep;
              const IconComp = def.icon;

              return (
                <button
                  key={def.step}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => isAccessible && setCurrentStep(def.step)}
                  className={`p-2.5 rounded-lg text-left transition-all relative flex flex-col justify-between select-none ${
                    isActive
                      ? "bg-emerald-50 border-2 border-[#034419] shadow-sm ring-2 ring-emerald-600/20"
                      : isCompleted
                      ? "bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                      : "bg-white border border-slate-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isActive
                          ? "bg-[#034419] text-white"
                          : isCompleted
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : def.step}
                    </div>

                    <IconComp
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-[#034419]"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-slate-300"
                      }`}
                    />
                  </div>

                  <div>
                    <div
                      className={`text-xs font-bold leading-tight ${
                        isActive ? "text-[#034419]" : "text-slate-800"
                      }`}
                    >
                      {def.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{def.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Content Container */}
        <div className="transition-all duration-200">
          {currentStep === 1 && (
            <Step1BatchDetails
              data={batchDetails}
              onChange={(updated) => setBatchDetails((prev) => ({ ...prev, ...updated }))}
              onNext={handleNextFromStep1}
              existingBatchNames={existingBatchNames}
            />
          )}

          {currentStep === 2 && (
            <Step2StudentImport
              students={students}
              availableClasses={batchDetails.classes}
              batchName={batchDetails.name}
              onUpdateStudents={(newStudents) => setStudents(newStudents)}
              onNext={handleNextFromStep2}
              onBack={() => handleBackToStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3ClassOrganization
              students={students}
              availableClasses={batchDetails.classes}
              onUpdateStudents={(newStudents) => setStudents(newStudents)}
              onNext={handleNextFromStep3}
              onBack={() => handleBackToStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4AdvisorAssignment
              availableClasses={batchDetails.classes}
              students={students}
              assignments={classAdvisors}
              onChangeAssignments={(newAssignments) => setClassAdvisors(newAssignments)}
              onNext={handleNextFromStep4}
              onBack={() => handleBackToStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5TeamSetup
              batchName={batchDetails.name}
              students={students}
              availableClasses={batchDetails.classes}
              classAdvisors={classAdvisors}
              teams={teams}
              onChangeTeams={(newTeams) => setTeams(newTeams)}
              onNext={handleNextFromStep5}
              onBack={() => handleBackToStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6ReviewCreate
              batchDetails={batchDetails}
              students={students}
              availableClasses={batchDetails.classes}
              classAdvisors={classAdvisors}
              teams={teams}
              onJumpToStep={(step) => setCurrentStep(step)}
              onBack={() => handleBackToStep(5)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
