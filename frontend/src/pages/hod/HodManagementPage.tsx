import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Building2,
  Users,
  UserCheck,
  Compass,
  FolderGit2,
  Plus,
  History,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Code,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  SlidersHorizontal,
  FolderPlus,
} from "lucide-react";
import {
  HodManagementService,
  ManagementBatch,
  ManagementStudent,
  ManagementAdvisor,
  ManagementGuide,
  ManagementTeam,
  ActivityHistoryRecord,
} from "../../services/hod-management.service";
import { ActivityHistoryDrawer } from "../../components/hod/management/ActivityHistoryDrawer";
import { BatchEditDrawer } from "../../components/hod/management/BatchEditDrawer";
import { StudentEditDrawer } from "../../components/hod/management/StudentEditDrawer";
import { AdvisorAssignDrawer } from "../../components/hod/management/AdvisorAssignDrawer";
import { GuideAssignDrawer } from "../../components/hod/management/GuideAssignDrawer";
import { TeamEditDrawer } from "../../components/hod/management/TeamEditDrawer";
import { AdvisorReassignModal } from "../../components/hod/management/AdvisorReassignModal";
import {
  CreateEntityModal,
  CreatableEntityType,
} from "../../components/hod/management/CreateEntityModal";
import { ConfirmationModal } from "../../components/hod/ConfirmationModal";

type ActiveTab = "advisors" | "guides" | "teams" | "students" | "batches";

export const HodManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabQuery = searchParams.get("tab") as ActiveTab;

  // Inner Tab State (Strictly ONE tab active; default is 'advisors')
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabQuery && ["advisors", "guides", "teams", "students", "batches"].includes(tabQuery)
      ? tabQuery
      : "advisors"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab") as ActiveTab;
    if (tabParam && ["advisors", "guides", "teams", "students", "batches"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // In-Page Drill-Down States
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  // Core Data Lists
  const [batches, setBatches] = useState<ManagementBatch[]>([]);
  const [students, setStudents] = useState<ManagementStudent[]>([]);
  const [advisors, setAdvisors] = useState<ManagementAdvisor[]>([]);
  const [guides, setGuides] = useState<ManagementGuide[]>([]);
  const [teams, setTeams] = useState<ManagementTeam[]>([]);
  const [historyLogs, setHistoryLogs] = useState<ActivityHistoryRecord[]>([]);

  // Expanded Team Rows state (for Teams tab collapsible rows)
  const [expandedTeamIds, setExpandedTeamIds] = useState<Record<string, boolean>>({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedAdvisorFilter, setSelectedAdvisorFilter] = useState("ALL");
  const [selectedGuideFilter, setSelectedGuideFilter] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Dropdown states
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Drawers and Modals State
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEntityType, setCreateEntityType] = useState<CreatableEntityType>("TEAM");

  const [editingBatch, setEditingBatch] = useState<ManagementBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<ManagementStudent | null>(null);
  const [assigningAdvisor, setAssigningAdvisor] = useState<ManagementAdvisor | null>(null);
  const [assigningGuide, setAssigningGuide] = useState<ManagementGuide | null>(null);
  const [editingTeam, setEditingTeam] = useState<ManagementTeam | null>(null);

  // Advisor Deletion Protection Modal State
  const [reassignAdvisor, setReassignAdvisor] = useState<ManagementAdvisor | null>(null);

  // General Deactivate Confirmation Modal
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetType: "batch" | "student" | "advisor" | "guide" | "team";
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    targetType: "team",
    targetId: "",
    targetName: "",
  });

  // Load all data from service
  const reloadData = () => {
    setBatches(HodManagementService.getBatches());
    setStudents(HodManagementService.getStudents());
    setAdvisors(HodManagementService.getAdvisors());
    setGuides(HodManagementService.getGuides());
    setTeams(HodManagementService.getTeams());
    setHistoryLogs(HodManagementService.getActivityHistory());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Close open dropdown on outside click
  useEffect(() => {
    const handleDocumentClick = () => {
      setIsAddMenuOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBatch("ALL");
    setSelectedClass("ALL");
    setSelectedAdvisorFilter("ALL");
    setSelectedGuideFilter("ALL");
    setSelectedStatus("ALL");
  };

  // Toggle Row Expansion in Teams Table
  const toggleTeamExpansion = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedTeamIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Unique Batch & Class lists for filter dropdowns
  const batchOptions = useMemo(() => {
    return Array.from(new Set(batches.map((b) => b.name)));
  }, [batches]);

  const classOptions = useMemo(() => {
    const clsSet = new Set<string>();
    batches.forEach((b) => b.classes.forEach((c) => clsSet.add(c.name)));
    return Array.from(clsSet);
  }, [batches]);

  // Selected Advisor and their active teams
  const currentAdvisor = useMemo(() => {
    if (!selectedAdvisorId) return null;
    return advisors.find((a) => a.id === selectedAdvisorId) || null;
  }, [advisors, selectedAdvisorId]);

  const advisorTeams = useMemo(() => {
    if (!currentAdvisor) return [];
    return teams.filter(
      (t) =>
        (t.advisor_id === currentAdvisor.id || t.advisor_name === currentAdvisor.name) &&
        t.status === "Active"
    );
  }, [teams, currentAdvisor]);

  // Selected Guide and their active teams
  const currentGuide = useMemo(() => {
    if (!selectedGuideId) return null;
    return guides.find((g) => g.id === selectedGuideId) || null;
  }, [guides, selectedGuideId]);

  const guideTeams = useMemo(() => {
    if (!currentGuide) return [];
    return teams.filter(
      (t) =>
        (t.guide_id === currentGuide.id || t.guide_name === currentGuide.name) &&
        t.status === "Active"
    );
  }, [teams, currentGuide]);

  // --------------------------------------------------------------------------
  // FILTERED LISTS
  // --------------------------------------------------------------------------
  const filteredAdvisors = useMemo(() => {
    return advisors.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.assigned_class.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBatch = selectedBatch === "ALL" || a.batch === selectedBatch;
      const matchesClass = selectedClass === "ALL" || a.assigned_class === selectedClass;
      const matchesStatus = selectedStatus === "ALL" || a.status === selectedStatus;
      return matchesSearch && matchesBatch && matchesClass && matchesStatus;
    });
  }, [advisors, searchQuery, selectedBatch, selectedClass, selectedStatus]);

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.assigned_teams_names.some((tn) =>
          tn.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus = selectedStatus === "ALL" || g.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [guides, searchQuery, selectedStatus]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.members.some(
          (m) =>
            m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesBatch = selectedBatch === "ALL" || t.batch === selectedBatch;
      const matchesClass = selectedClass === "ALL" || t.class_name === selectedClass;
      const matchesAdvisor =
        selectedAdvisorFilter === "ALL" ||
        t.advisor_id === selectedAdvisorFilter ||
        t.advisor_name === selectedAdvisorFilter;
      const matchesGuide =
        selectedGuideFilter === "ALL" ||
        t.guide_id === selectedGuideFilter ||
        t.guide_name === selectedGuideFilter;
      const matchesStatus = selectedStatus === "ALL" || t.status === selectedStatus;

      return (
        matchesSearch &&
        matchesBatch &&
        matchesClass &&
        matchesAdvisor &&
        matchesGuide &&
        matchesStatus
      );
    });
  }, [
    teams,
    searchQuery,
    selectedBatch,
    selectedClass,
    selectedAdvisorFilter,
    selectedGuideFilter,
    selectedStatus,
  ]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.team_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBatch = selectedBatch === "ALL" || s.batch === selectedBatch;
      const matchesClass = selectedClass === "ALL" || s.class_name === selectedClass;
      const matchesAdvisor =
        selectedAdvisorFilter === "ALL" || s.advisor_name === selectedAdvisorFilter;
      const matchesGuide =
        selectedGuideFilter === "ALL" || s.guide_name === selectedGuideFilter;
      const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

      return (
        matchesSearch &&
        matchesBatch &&
        matchesClass &&
        matchesAdvisor &&
        matchesGuide &&
        matchesStatus
      );
    });
  }, [
    students,
    searchQuery,
    selectedBatch,
    selectedClass,
    selectedAdvisorFilter,
    selectedGuideFilter,
    selectedStatus,
  ]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, selectedStatus]);

  // Handle Deactivating Advisor with Protection Check
  const handleAdvisorDeactivateClick = (advisor: ManagementAdvisor) => {
    const activeAdvisorTeams = teams.filter(
      (t) =>
        (t.advisor_id === advisor.id || t.advisor_name === advisor.name) &&
        t.status === "Active"
    );

    if (activeAdvisorTeams.length > 0) {
      // Must reassign teams first!
      setReassignAdvisor(advisor);
    } else {
      setConfirmModalState({
        isOpen: true,
        title: `Deactivate Advisor ${advisor.name}`,
        description: `Are you sure you want to deactivate Advisor ${advisor.name}? Historical supervision records will remain preserved.`,
        targetType: "advisor",
        targetId: advisor.id,
        targetName: advisor.name,
      });
    }
  };

  const handleConfirmDeactivation = () => {
    const { targetType, targetId } = confirmModalState;
    if (targetType === "team") {
      HodManagementService.deactivateTeam(targetId);
    } else if (targetType === "student") {
      HodManagementService.deactivateStudent(targetId);
    } else if (targetType === "advisor") {
      HodManagementService.deactivateAdvisor(targetId);
    } else if (targetType === "guide") {
      HodManagementService.deactivateGuide(targetId);
    } else if (targetType === "batch") {
      HodManagementService.deactivateBatch(targetId);
    }

    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    reloadData();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP INSTITUTIONAL HEADER BAR                                         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#034419] animate-pulse" />
                <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                  Management & Control
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  HOD Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized administration: Advisor → Teams → Project & Mentor Reassignment
              </p>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsActivityOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <History className="w-3.5 h-3.5 text-emerald-800" />
                <span>Activity History</span>
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-900 text-[10px] rounded-full font-bold">
                  {historyLogs.length}
                </span>
              </button>

              {/* Universal "+ Add New" Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddMenuOpen(!isAddMenuOpen);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-lg shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {isAddMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Add New Entity
                    </div>
                    <button
                      onClick={() => {
                        setCreateEntityType("TEAM");
                        setIsCreateOpen(true);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center space-x-2"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>New Capstone Team</span>
                    </button>
                    <button
                      onClick={() => {
                        setCreateEntityType("ADVISOR");
                        setIsCreateOpen(true);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center space-x-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Onboard Class Advisor</span>
                    </button>
                    <button
                      onClick={() => {
                        setCreateEntityType("GUIDE");
                        setIsCreateOpen(true);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center space-x-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Onboard Project Guide</span>
                    </button>
                    <button
                      onClick={() => {
                        setCreateEntityType("STUDENT");
                        setIsCreateOpen(true);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>New Student Record</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/hod/batches/new");
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-800 bg-emerald-50/50 hover:bg-emerald-100/70 font-semibold flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <FolderPlus className="w-3.5 h-3.5 text-[#034419]" />
                        <span>New Batch (Guided Wizard)</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#034419] text-white">
                        New
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setCreateEntityType("BATCH");
                        setIsCreateOpen(true);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center space-x-2 text-xs"
                    >
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Quick Batch Form</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────────────── */}
          {/* 2. INNER TABS NAVIGATION (STRICTLY ONE TAB VISIBLE AT A TIME)             */}
          {/* ──────────────────────────────────────────────────────────────────────── */}
          <div className="flex items-center space-x-1 mt-5 border-b border-slate-200 overflow-x-auto">
            {(
              [
                { key: "advisors", label: "Advisors", count: advisors.length, icon: UserCheck },
                { key: "guides", label: "Guides", count: guides.length, icon: Compass },
                { key: "teams", label: "Teams", count: teams.length, icon: FolderGit2 },
                { key: "students", label: "Students", count: students.length, icon: Users },
                { key: "batches", label: "Batches", count: batches.length, icon: Building2 },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelectedAdvisorId(null);
                    setSelectedGuideId(null);
                    resetFilters();
                  }}
                  className={`pb-3 px-3.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all shrink-0 ${
                    isActive
                      ? "border-[#034419] text-[#034419]"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#034419]" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-emerald-100 text-[#034419]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. BREADCRUMBS & DRILL-DOWN HEADER (WHEN IN ADVISOR OR GUIDE VIEW)      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {(selectedAdvisorId || selectedGuideId) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center justify-between bg-white border border-emerald-200/80 rounded-xl p-3 shadow-sm">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-500">Management & Control</span>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-600 capitalize">{activeTab}</span>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-[#034419]">
                {currentAdvisor?.name || currentGuide?.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedAdvisorId(null);
                setSelectedGuideId(null);
              }}
              className="px-3 py-1 text-xs font-semibold text-[#034419] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                Back to {activeTab === "advisors" ? "All Advisors" : "All Guides"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. ADAPTIVE GLOBAL FILTER BAR                                            */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {!selectedAdvisorId && !selectedGuideId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "advisors"
                      ? "Search advisor name, email, section..."
                      : activeTab === "guides"
                      ? "Search guide name, email, assigned project..."
                      : activeTab === "teams"
                      ? "Search team name, project title, members..."
                      : activeTab === "students"
                      ? "Search student name, roll number, team..."
                      : "Search batches, department..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419] transition-all"
                />
              </div>

              {/* Dynamic Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Batch Filter */}
                <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Batch:</span>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="ALL">All Batches</option>
                    {batchOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Filter */}
                {activeTab !== "batches" && (
                  <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Class:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
                    >
                      <option value="ALL">All Classes</option>
                      {classOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Advisor Filter (in Teams / Students tab) */}
                {(activeTab === "teams" || activeTab === "students") && (
                  <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Advisor:</span>
                    <select
                      value={selectedAdvisorFilter}
                      onChange={(e) => setSelectedAdvisorFilter(e.target.value)}
                      className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer max-w-[130px]"
                    >
                      <option value="ALL">All Advisors</option>
                      {advisors.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Guide Filter (in Teams / Students tab) */}
                {(activeTab === "teams" || activeTab === "students") && (
                  <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Guide:</span>
                    <select
                      value={selectedGuideFilter}
                      onChange={(e) => setSelectedGuideFilter(e.target.value)}
                      className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer max-w-[130px]"
                    >
                      <option value="ALL">All Guides</option>
                      {guides.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Filter */}
                <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Archived</option>
                  </select>
                </div>

                {/* Reset button */}
                {(searchQuery ||
                  selectedBatch !== "ALL" ||
                  selectedClass !== "ALL" ||
                  selectedAdvisorFilter !== "ALL" ||
                  selectedGuideFilter !== "ALL" ||
                  selectedStatus !== "ALL") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Reset Filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 5. MAIN CONTENT AREA (STRICTLY ONE INNER TAB VISIBLE)                    */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* ==================================================================== */}
        {/* TAB 1: ADVISORS (PRIMARY MANAGEMENT FLOW)                            */}
        {/* ==================================================================== */}
        {activeTab === "advisors" && (
          <div>
            {!selectedAdvisorId ? (
              /* --- ADVISOR LIST TABLE --- */
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-[#034419]" />
                    <span>Faculty Class Advisors Register</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {filteredAdvisors.length} of {advisors.length} advisors • Click 'Manage' to inspect assigned teams
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4">Advisor</th>
                        <th className="py-3 px-4">Batch</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4 text-center">Total Teams</th>
                        <th className="py-3 px-4 text-center">Total Students</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredAdvisors.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No class advisors match your current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredAdvisors.map((adv) => (
                          <tr
                            key={adv.id}
                            onClick={() => setSelectedAdvisorId(adv.id)}
                            className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div className="flex items-center space-x-2">
                                <span>{adv.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">{adv.email}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{adv.batch}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded font-semibold text-[11px]">
                                {adv.assigned_class}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                              {adv.teams_count}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                              {adv.students_count}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                  adv.status === "Active"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-300"
                                }`}
                              >
                                {adv.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAdvisorId(adv.id)}
                                  className="px-3 py-1 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded shadow-sm transition-colors"
                                >
                                  Manage
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdvisorDeactivateClick(adv)}
                                  className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
                                >
                                  Deactivate
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* --- SELECTED ADVISOR'S IN-PAGE DETAIL VIEW --- */
              currentAdvisor && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Advisor Information Header Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h2 className="text-lg font-bold text-slate-900">{currentAdvisor.name}</h2>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Class Advisor
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {currentAdvisor.designation} • {currentAdvisor.department} • {currentAdvisor.email}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Batch</span>
                          <span className="font-bold text-slate-800">{currentAdvisor.batch}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Section</span>
                          <span className="font-bold text-emerald-900">{currentAdvisor.assigned_class}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Teams</span>
                          <span className="font-bold text-slate-900">{advisorTeams.length} Teams</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Supervised Students</span>
                          <span className="font-bold text-slate-900">{currentAdvisor.students_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advisor's Teams Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                        <FolderGit2 className="w-4 h-4 text-[#034419]" />
                        <span>Teams Supervised by {currentAdvisor.name} ({advisorTeams.length})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Advisor → Teams → Guide → Project
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            <th className="py-3 px-4">Team</th>
                            <th className="py-3 px-4 text-center">Members</th>
                            <th className="py-3 px-4">Guide</th>
                            <th className="py-3 px-4">Project</th>
                            <th className="py-3 px-4">Class</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {advisorTeams.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400">
                                No active capstone teams are currently assigned to {currentAdvisor.name}.
                              </td>
                            </tr>
                          ) : (
                            advisorTeams.map((team) => (
                              <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-slate-900">{team.name}</td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                  {team.members.length}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-emerald-950">
                                  {team.guide_name}
                                </td>
                                <td className="py-3.5 px-4 max-w-sm">
                                  <div className="font-semibold text-slate-800 line-clamp-1">
                                    {team.project.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500 line-clamp-1">
                                    {team.project.description}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium">
                                    {team.class_name}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                      team.status === "Active"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : "bg-slate-100 text-slate-600 border-slate-300"
                                    }`}
                                  >
                                    {team.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTeam(team)}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded shadow-sm transition-colors"
                                  >
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: GUIDES (MENTORSHIP FLOW)                                      */}
        {/* ==================================================================== */}
        {activeTab === "guides" && (
          <div>
            {!selectedGuideId ? (
              /* --- GUIDE LIST TABLE --- */
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[#034419]" />
                    <span>Project Guides Mentorship Register</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {filteredGuides.length} of {guides.length} faculty guides • Click 'Manage' to view assigned teams
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4">Guide</th>
                        <th className="py-3 px-4">Batch</th>
                        <th className="py-3 px-4 text-center">Teams (Quota)</th>
                        <th className="py-3 px-4 text-center">Students</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredGuides.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No faculty guides match your current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredGuides.map((gd) => {
                          const guideTeamCount = gd.assigned_teams.length;
                          const guideStudents = teams
                            .filter((t) => gd.assigned_teams.includes(t.id))
                            .reduce((sum, t) => sum + t.members.length, 0);

                          return (
                            <tr
                              key={gd.id}
                              onClick={() => setSelectedGuideId(gd.id)}
                              className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                            >
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                <div>{gd.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{gd.email}</div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">{gd.batch}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="font-bold text-emerald-950">
                                  {guideTeamCount} / {gd.max_teams_limit}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                {guideStudents}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                    gd.status === "Active"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-slate-100 text-slate-600 border-slate-300"
                                  }`}
                                >
                                  {gd.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedGuideId(gd.id)}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded shadow-sm transition-colors"
                                  >
                                    Manage
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModalState({
                                        isOpen: true,
                                        title: `Deactivate Guide ${gd.name}`,
                                        description: `Are you sure you want to deactivate Project Guide ${gd.name}? All historical evaluation marks and feedback will be retained.`,
                                        targetType: "guide",
                                        targetId: gd.id,
                                        targetName: gd.name,
                                      });
                                    }}
                                    className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
                                  >
                                    Deactivate
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* --- SELECTED GUIDE'S IN-PAGE DETAIL VIEW --- */
              currentGuide && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Guide Information Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h2 className="text-lg font-bold text-slate-900">{currentGuide.name}</h2>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Project Guide
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {currentGuide.designation} • {currentGuide.department} • {currentGuide.email}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Teams</span>
                          <span className="font-bold text-slate-900">{guideTeams.length} Teams</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Mentorship Quota</span>
                          <span className="font-bold text-emerald-900">{currentGuide.max_teams_limit} Teams Max</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Mentored Students</span>
                          <span className="font-bold text-slate-900">
                            {guideTeams.reduce((sum, t) => sum + t.members.length, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guide's Teams Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                        <FolderGit2 className="w-4 h-4 text-[#034419]" />
                        <span>Teams Mentored by {currentGuide.name} ({guideTeams.length})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Guide → Teams → Advisor → Project
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            <th className="py-3 px-4">Team</th>
                            <th className="py-3 px-4 text-center">Members</th>
                            <th className="py-3 px-4">Advisor</th>
                            <th className="py-3 px-4">Project</th>
                            <th className="py-3 px-4">Class</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {guideTeams.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400">
                                No active capstone teams are currently assigned to {currentGuide.name}.
                              </td>
                            </tr>
                          ) : (
                            guideTeams.map((team) => (
                              <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-slate-900">{team.name}</td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                  {team.members.length}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  {team.advisor_name}
                                </td>
                                <td className="py-3.5 px-4 max-w-sm">
                                  <div className="font-semibold text-slate-800 line-clamp-1">
                                    {team.project.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500 line-clamp-1">
                                    {team.project.description}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium">
                                    {team.class_name}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                      team.status === "Active"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : "bg-slate-100 text-slate-600 border-slate-300"
                                    }`}
                                  >
                                    {team.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTeam(team)}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded shadow-sm transition-colors"
                                  >
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: TEAMS (CROSS-DEPARTMENT OVERVIEW)                             */}
        {/* ==================================================================== */}
        {activeTab === "teams" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-[#034419]" />
                <span>Capstone Project Teams Register</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredTeams.length} of {teams.length} teams across department
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3 w-8"></th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Advisor</th>
                    <th className="py-3 px-4">Guide</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4 text-center">Members</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No capstone teams match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTeams.map((team) => {
                      const isExpanded = !!expandedTeamIds[team.id];
                      return (
                        <React.Fragment key={team.id}>
                          <tr
                            onClick={() => toggleTeamExpansion(team.id)}
                            className={`cursor-pointer transition-colors ${
                              isExpanded ? "bg-emerald-50/40" : "hover:bg-slate-50/80"
                            }`}
                          >
                            <td className="py-3.5 px-3 text-slate-400 text-center">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-emerald-800" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">{team.name}</td>
                            <td className="py-3.5 px-4 text-slate-600">{team.batch}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold">
                                {team.class_name}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">{team.advisor_name}</td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">{team.guide_name}</td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-semibold text-slate-800 line-clamp-1">
                                {team.project.title}
                              </div>
                              <div className="text-[10px] text-emerald-800 font-medium">
                                {team.project.domain}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                              {team.members.length}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                  team.status === "Active"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-300"
                                }`}
                              >
                                {team.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setEditingTeam(team)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded shadow-sm transition-colors"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Detail View */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90 border-b border-emerald-100">
                              <td colSpan={10} className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Members */}
                                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 pb-1 border-b border-slate-100">
                                      <Users className="w-3.5 h-3.5 text-emerald-800" />
                                      <span>Team Members ({team.members.length})</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {team.members.map((m) => (
                                        <div
                                          key={m.id}
                                          className="p-1.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                                        >
                                          <div>
                                            <span className="font-semibold text-slate-800">{m.full_name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                                              ({m.roll_number})
                                            </span>
                                          </div>
                                          <span
                                            className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border ${
                                              m.role === "Team Lead"
                                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                            }`}
                                          >
                                            {m.role}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Project details */}
                                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2.5">
                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 pb-1 border-b border-slate-100">
                                      <FileText className="w-3.5 h-3.5 text-emerald-800" />
                                      <span>Project Details & Technical Scope</span>
                                    </div>

                                    {/* Core Identification */}
                                    <div className="space-y-1.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</span>
                                          <p className="text-xs font-semibold text-slate-800">{team.project.title}</p>
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Domain</span>
                                          <p className="text-xs font-semibold text-slate-800">{team.project.domain}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Problem Statement</span>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{team.project.problem_statement}</p>
                                      </div>
                                    </div>

                                    {/* Description & Solution */}
                                    <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</span>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{team.project.description}</p>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proposed Solution</span>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{team.project.proposed_solution}</p>
                                      </div>
                                    </div>

                                    {/* Tech Stack & Links */}
                                    <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technologies</span>
                                        <p className="text-xs font-mono text-slate-800">{team.project.technologies_used}</p>
                                      </div>
                                      <div className="flex items-center space-x-3 text-xs">
                                        {team.project.github_url && (
                                          <a
                                            href={team.project.github_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center space-x-1"
                                          >
                                            <Code className="w-3.5 h-3.5" />
                                            <span>Repository</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                        {team.project.live_demo_url && (
                                          <a
                                            href={team.project.live_demo_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center space-x-1"
                                          >
                                            <span>Live Demo</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: STUDENTS                                                      */}
        {/* ==================================================================== */}
        {activeTab === "students" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#034419]" />
                <span>Student Roster & Assignment Register</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Advisor</th>
                    <th className="py-3 px-4">Guide</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No student records match your current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.full_name}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.roll_number}</td>
                        <td className="py-3.5 px-4 text-slate-600">{s.batch}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium">
                            {s.class_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-950">{s.team_name}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{s.advisor_name}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{s.guide_name}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              s.status === "Active"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(s)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#034419] bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                          >
                            Edit / Move
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: BATCHES                                                       */}
        {/* ==================================================================== */}
        {activeTab === "batches" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#034419]" />
                <span>Academic Cohorts / Batches Register</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredBatches.length} of {batches.length} cohorts
                </span>
                <Link
                  to="/hod/batches/new"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Batch</span>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Classes</th>
                    <th className="py-3 px-4 text-center">Students</th>
                    <th className="py-3 px-4 text-center">Teams</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No academic batches match your current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{b.name}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{b.department}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                          {b.classes.length}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                          {b.students_count}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                          {b.teams_count}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              b.status === "Active"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingBatch(b)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                          >
                            Edit Batch
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 6. DRAWERS & MODALS                                                      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* Activity History Slide-over Drawer */}
      <ActivityHistoryDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* Universal Create Entity Modal */}
      <CreateEntityModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultEntity={createEntityType}
        onCreated={reloadData}
      />

      {/* Batch Edit Drawer */}
      <BatchEditDrawer
        isOpen={!!editingBatch}
        onClose={() => setEditingBatch(null)}
        batch={editingBatch}
        onSaved={reloadData}
      />

      {/* Student Edit / Move Drawer */}
      <StudentEditDrawer
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSaved={reloadData}
      />

      {/* Advisor Assign Drawer */}
      <AdvisorAssignDrawer
        isOpen={!!assigningAdvisor}
        onClose={() => setAssigningAdvisor(null)}
        advisor={assigningAdvisor}
        onSaved={reloadData}
      />

      {/* Guide Assign Drawer */}
      <GuideAssignDrawer
        isOpen={!!assigningGuide}
        onClose={() => setAssigningGuide(null)}
        guide={assigningGuide}
        onSaved={reloadData}
      />

      {/* Team Edit & Global Reassignment Drawer */}
      <TeamEditDrawer
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
        onSaved={reloadData}
      />

      {/* Advisor Deletion Protection Modal (Active Teams Reassignment Required) */}
      <AdvisorReassignModal
        isOpen={!!reassignAdvisor}
        onClose={() => setReassignAdvisor(null)}
        advisor={reassignAdvisor}
        onSuccess={reloadData}
      />

      {/* Confirmation Modal for Safe Soft Deactivations */}
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeactivation}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText="Yes, Deactivate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default HodManagementPage;
