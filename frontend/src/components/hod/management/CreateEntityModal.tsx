import React, { useState, useEffect } from "react";
import {
  X,
  PlusCircle,
  FolderPlus,
  UserPlus,
  Users,
  Compass,
  Building2,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";
import {
  HodManagementService,
  ManagementBatch,
  ManagementAdvisor,
  ManagementGuide,
} from "../../../services/hod-management.service";

export type CreatableEntityType = "BATCH" | "STUDENT" | "ADVISOR" | "GUIDE" | "TEAM";

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntity?: CreatableEntityType;
  onCreated: () => void;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
  isOpen,
  onClose,
  defaultEntity = "STUDENT",
  onCreated,
}) => {
  const [activeType, setActiveType] = useState<CreatableEntityType>(defaultEntity);

  // Available data for selectors
  const [batches, setBatches] = useState<ManagementBatch[]>([]);
  const [advisors, setAdvisors] = useState<ManagementAdvisor[]>([]);
  const [guides, setGuides] = useState<ManagementGuide[]>([]);

  // BATCH FORM
  const [batchName, setBatchName] = useState("");
  const [batchDept, setBatchDept] = useState("CSE");
  const [batchDuration, setBatchDuration] = useState("4 Years");
  const [startYear, setStartYear] = useState("2027");
  const [endYear, setEndYear] = useState("2031");

  // STUDENT FORM
  const [studentRoll, setStudentRoll] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentBatch, setStudentBatch] = useState("");
  const [studentClass, setStudentClass] = useState("");

  // ADVISOR FORM
  const [advisorName, setAdvisorName] = useState("");
  const [advisorDesignation, setAdvisorDesignation] = useState("Assistant Professor");
  const [advisorEmail, setAdvisorEmail] = useState("");
  const [advisorBatch, setAdvisorBatch] = useState("");
  const [advisorClass, setAdvisorClass] = useState("");

  // GUIDE FORM
  const [guideName, setGuideName] = useState("");
  const [guideDesignation, setGuideDesignation] = useState("Associate Professor");
  const [guideEmail, setGuideEmail] = useState("");
  const [guideMaxTeams, setGuideMaxTeams] = useState(4);

  // TEAM FORM
  const [teamName, setTeamName] = useState("");
  const [teamBatch, setTeamBatch] = useState("");
  const [teamClass, setTeamClass] = useState("");
  const [teamAdvisorId, setTeamAdvisorId] = useState("");
  const [teamGuideId, setTeamGuideId] = useState("");
  const [teamProjectTitle, setTeamProjectTitle] = useState("");
  const [teamDomain, setTeamDomain] = useState("");
  const [teamLeadRoll, setTeamLeadRoll] = useState("");
  const [teamLeadName, setTeamLeadName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveType(defaultEntity);
      const bList = HodManagementService.getBatches();
      const aList = HodManagementService.getAdvisors();
      const gList = HodManagementService.getGuides();
      setBatches(bList);
      setAdvisors(aList);
      setGuides(gList);

      const defaultB = bList[0]?.name || "";
      const defaultC = bList[0]?.classes[0]?.name || "";
      setStudentBatch(defaultB);
      setStudentClass(defaultC);
      setAdvisorBatch(defaultB);
      setTeamBatch(defaultB);
      setTeamClass(defaultC);

      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, defaultEntity]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      if (activeType === "BATCH") {
        if (!batchName.trim()) throw new Error("Batch Name is required (e.g. 2027–2031)");
        HodManagementService.createBatch({
          name: batchName.trim(),
          department: batchDept,
          duration: batchDuration,
          start_year: parseInt(startYear) || 2027,
          end_year: parseInt(endYear) || 2031,
          status: "Active",
          classes: [
            {
              id: `cls-${Date.now()}-a`,
              name: `${batchDept}-A`,
              batch_name: batchName.trim(),
              advisor_id: "",
              advisor_name: "Unassigned",
              advisor_email: "",
              students_count: 0,
              teams_count: 0,
              status: "Active",
            },
          ],
          students_count: 0,
          teams_count: 0,
        });
        setSuccessMsg(`Academic Batch ${batchName} initialized successfully.`);
      } else if (activeType === "STUDENT") {
        if (!studentRoll.trim()) throw new Error("Student Roll Number is required.");
        if (!studentName.trim()) throw new Error("Student Full Name is required.");
        HodManagementService.createStudent({
          roll_number: studentRoll.trim().toUpperCase(),
          full_name: studentName.trim(),
          email: studentEmail.trim() || `${studentRoll.trim().toLowerCase()}@siet.ac.in`,
          batch: studentBatch,
          class_name: studentClass,
          team_id: "",
          team_name: "Unassigned",
          advisor_name: "Class Advisor",
          guide_name: "Unassigned",
          status: "Active",
          joined_date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        });
        setSuccessMsg(`Student ${studentName} (${studentRoll.toUpperCase()}) enrolled successfully.`);
      } else if (activeType === "ADVISOR") {
        if (!advisorName.trim()) throw new Error("Faculty Name is required.");
        HodManagementService.createAdvisor({
          name: advisorName.trim(),
          designation: advisorDesignation,
          department: "CSE",
          email: advisorEmail.trim() || `${advisorName.toLowerCase().replace(/\s+/g, "")}@siet.ac.in`,
          batch: advisorBatch,
          assigned_class: advisorClass || "General",
          teams_count: 0,
          students_count: 0,
          status: "Active",
        });
        setSuccessMsg(`Advisor ${advisorName} onboarded successfully.`);
      } else if (activeType === "GUIDE") {
        if (!guideName.trim()) throw new Error("Faculty Name is required.");
        HodManagementService.createGuide({
          name: guideName.trim(),
          designation: guideDesignation,
          department: "CSE",
          email: guideEmail.trim() || `${guideName.toLowerCase().replace(/\s+/g, "")}@siet.ac.in`,
          batch: "All Batches",
          assigned_teams: [],
          assigned_teams_names: [],
          active_projects_count: 0,
          max_teams_limit: Number(guideMaxTeams) || 4,
          status: "Active",
        });
        setSuccessMsg(`Project Guide ${guideName} onboarded successfully.`);
      } else if (activeType === "TEAM") {
        if (!teamName.trim()) throw new Error("Team Name is required (e.g. Team 09).");
        if (!teamProjectTitle.trim()) throw new Error("Project Title is required.");
        if (!teamLeadName.trim() || !teamLeadRoll.trim())
          throw new Error("Initial Team Lead name and roll number are required.");

        const adv = advisors.find((a) => a.id === teamAdvisorId);
        const gd = guides.find((g) => g.id === teamGuideId);

        HodManagementService.createTeam({
          team_id: `TM-${Date.now().toString().slice(-4)}`,
          name: teamName.trim(),
          batch: teamBatch,
          class_name: teamClass,
          advisor_id: teamAdvisorId,
          advisor_name: adv ? adv.name : "Unassigned",
          guide_id: teamGuideId,
          guide_name: gd ? gd.name : "Unassigned",
          members: [
            {
              id: `tm-${Date.now()}`,
              roll_number: teamLeadRoll.trim().toUpperCase(),
              full_name: teamLeadName.trim(),
              role: "Team Lead",
            },
          ],
          project: {
            title: teamProjectTitle.trim(),
            description: "Initial proposal submitted for departmental approval.",
            domain: teamDomain.trim() || "General Engineering",
            status: "In Progress",
            current_stage: "Proposal & Ideation",
          },
          status: "Active",
        });
        setSuccessMsg(`Capstone ${teamName} created and registered.`);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onCreated();
        onClose();
      }, 600);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 transition-all">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <PlusCircle className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="text-base font-semibold">Institutional Entity Onboarding</h2>
              <p className="text-xs text-emerald-100/80">Add record to academic department register</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Type Picker Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-2">
          {(
            [
              { type: "BATCH", label: "Batch", icon: Building2 },
              { type: "STUDENT", label: "Student", icon: UserPlus },
              { type: "ADVISOR", label: "Advisor", icon: Users },
              { type: "GUIDE", label: "Guide", icon: Compass },
              { type: "TEAM", label: "Team", icon: FolderPlus },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = activeType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  setActiveType(item.type);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-all ${
                  isSelected
                    ? "border-[#034419] text-[#034419]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
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

          {/* BATCH FORM FIELDS */}
          {activeType === "BATCH" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Batch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2027–2031"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={batchDept}
                    onChange={(e) => setBatchDept(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics & Communication)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="IT">IT (Information Technology)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={batchDuration}
                    onChange={(e) => setBatchDuration(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STUDENT FORM FIELDS */}
          {activeType === "STUDENT" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll / Register Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21SIET019"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A. Vignesh"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="vignesh.cse21@siet.ac.in"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Batch
                  </label>
                  <select
                    value={studentBatch}
                    onChange={(e) => setStudentBatch(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class Section
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="CSE-A">CSE-A</option>
                    <option value="CSE-B">CSE-B</option>
                    <option value="CSE-C">CSE-C</option>
                    <option value="CSE-D">CSE-D</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ADVISOR FORM FIELDS */}
          {activeType === "ADVISOR" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. K. Rajesh"
                    value={advisorName}
                    onChange={(e) => setAdvisorName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={advisorDesignation}
                    onChange={(e) => setAdvisorDesignation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Email
                </label>
                <input
                  type="email"
                  placeholder="rajesh.cse@siet.ac.in"
                  value={advisorEmail}
                  onChange={(e) => setAdvisorEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Batch
                  </label>
                  <select
                    value={advisorBatch}
                    onChange={(e) => setAdvisorBatch(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Class Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE-A"
                    value={advisorClass}
                    onChange={(e) => setAdvisorClass(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GUIDE FORM FIELDS */}
          {activeType === "GUIDE" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Guide Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. M. Anitha"
                    value={guideName}
                    onChange={(e) => setGuideName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={guideDesignation}
                    onChange={(e) => setGuideDesignation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Email
                  </label>
                  <input
                    type="email"
                    placeholder="anitha.cse@siet.ac.in"
                    value={guideEmail}
                    onChange={(e) => setGuideEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Mentorship Teams Quota
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guideMaxTeams}
                    onChange={(e) => setGuideMaxTeams(parseInt(e.target.value) || 4)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TEAM FORM FIELDS */}
          {activeType === "TEAM" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Team 09"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Batch
                  </label>
                  <select
                    value={teamBatch}
                    onChange={(e) => setTeamBatch(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class
                  </label>
                  <select
                    value={teamClass}
                    onChange={(e) => setTeamClass(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="CSE-A">CSE-A</option>
                    <option value="CSE-B">CSE-B</option>
                    <option value="CSE-C">CSE-C</option>
                    <option value="CSE-D">CSE-D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class Advisor
                  </label>
                  <select
                    value={teamAdvisorId}
                    onChange={(e) => setTeamAdvisorId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="">-- Select Advisor --</option>
                    {advisors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.assigned_class || "General"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Guide
                  </label>
                  <select
                    value={teamGuideId}
                    onChange={(e) => setTeamGuideId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  >
                    <option value="">-- Select Guide --</option>
                    {guides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.active_projects_count}/{g.max_teams_limit} Teams)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI-Powered Smart Grid Energy Distribution System"
                  value={teamProjectTitle}
                  onChange={(e) => setTeamProjectTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IoT / Cloud"
                    value={teamDomain}
                    onChange={(e) => setTeamDomain(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Roll <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21SIET020"
                    value={teamLeadRoll}
                    onChange={(e) => setTeamLeadRoll(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. K. Praveen"
                    value={teamLeadName}
                    onChange={(e) => setTeamLeadName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-lg shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Registering..." : `Create ${activeType}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
