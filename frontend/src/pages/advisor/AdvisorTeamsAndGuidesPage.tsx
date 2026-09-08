import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Upload,
  Layers,
  ChevronDown,
  ChevronRight,
  Award,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  X,
  Edit3,
  Building,
  GraduationCap,
  Sparkles,
  FileText,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  ManagedTeam,
  ManagedTeamMember,
  ManagedFacultyGuide,
  UnassignedStudent,
  TeamRole,
  ManagedTeamStatus,
} from "@/types";
import { TeamsManagementService } from "@/services/teams-management.service";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function AdvisorTeamsAndGuidesPage() {
  const navigate = useNavigate();

  // 1. Data State
  const [teams, setTeams] = useState<ManagedTeam[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [guides, setGuides] = useState<ManagedFacultyGuide[]>([]);
  const [activeTab, setActiveTab] = useState<"teams" | "unassigned" | "guides">("teams");

  // 2. Single Assigned Class Scope for Advisor
  const ASSIGNED_CLASS = {
    batch: "2023 – 2027",
    section: "CSE - A",
    department: "Computer Science & Engineering",
  };

  // 3. Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");
  const [guideFilter, setGuideFilter] = useState("All");
  const [teamSizeFilter, setTeamSizeFilter] = useState("Any");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // 4. Toast notification state
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: "success" | "warning" | "error" } | null>(null);

  // 5. Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ManagedTeam | null>(null);
  const [teamDrawerTab, setTeamDrawerTab] = useState<"overview" | "members" | "guide">("overview");

  // Specific Sub-Modals
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<ManagedTeamMember | null>(null);

  const [isMoveStudentModalOpen, setIsMoveStudentModalOpen] = useState(false);
  const [studentToMove, setStudentToMove] = useState<ManagedTeamMember | null>(null);
  const [targetTeamId, setTargetTeamId] = useState("");

  const [isChangeGuideModalOpen, setIsChangeGuideModalOpen] = useState(false);
  const [newGuideId, setNewGuideId] = useState("");

  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [selectedUnassignedIds, setSelectedUnassignedIds] = useState<string[]>([]);
  const [bulkTargetTeamId, setBulkTargetTeamId] = useState("");

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Load initial data
  const refreshData = () => {
    setTeams(TeamsManagementService.getTeams());
    setUnassignedStudents(TeamsManagementService.getUnassignedStudents());
    setGuides(TeamsManagementService.getGuides());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (title: string, desc: string, type: "success" | "warning" | "error" = "success") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync selectedTeam whenever teams list updates
  useEffect(() => {
    if (selectedTeam) {
      const refreshed = teams.find((t) => t.team_id === selectedTeam.team_id);
      if (refreshed) {
        setSelectedTeam(refreshed);
      }
    }
  }, [teams]);

  // Filtered Teams based on Batch, Section, Search & Filters
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Status
      if (statusFilter !== "All" && team.status !== statusFilter) return false;
      // Domain
      if (domainFilter !== "All" && team.project_domain !== domainFilter) return false;
      // Guide
      if (guideFilter !== "All" && team.guide.id !== guideFilter) return false;
      // Team Size
      if (teamSizeFilter === "1–2" && (team.members.length < 1 || team.members.length > 2)) return false;
      if (teamSizeFilter === "3–4" && (team.members.length < 3 || team.members.length > 4)) return false;
      if (teamSizeFilter === "5+" && team.members.length < 5) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(q);
        const matchesId = team.team_id.toLowerCase().includes(q);
        const matchesProject = team.project_title.toLowerCase().includes(q);
        const matchesGuide = team.guide.name.toLowerCase().includes(q);
        const matchesMember = team.members.some(
          (m) => m.full_name.toLowerCase().includes(q) || m.roll_number.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesId && !matchesProject && !matchesGuide && !matchesMember) {
          return false;
        }
      }

      return true;
    });
  }, [teams, statusFilter, domainFilter, guideFilter, teamSizeFilter, searchQuery]);

  // Filtered Unassigned Students (Single Class Scope)
  const filteredUnassigned = useMemo(() => {
    return unassignedStudents.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.full_name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q);
      }
      return true;
    });
  }, [unassignedStudents, searchQuery]);

  // Statistics calculation for single assigned class
  const stats = useMemo(() => {
    const assignedStudentsCount = teams.reduce((sum, t) => sum + t.members.length, 0);
    const unassignedCount = unassignedStudents.length;

    return {
      totalTeams: teams.length,
      totalStudents: assignedStudentsCount + unassignedCount,
      assignedStudents: assignedStudentsCount,
      unassignedStudents: unassignedCount,
      activeGuides: guides.filter((g) => g.current_teams_count > 0).length,
    };
  }, [teams, unassignedStudents, guides]);

  // Handlers for Drawer & Sub-Modals
  const handleOpenManageTeam = (team: ManagedTeam, tab: "overview" | "members" | "guide" = "overview") => {
    setSelectedTeam(team);
    setTeamDrawerTab(tab);
    setIsManageDrawerOpen(true);
  };

  const handleConfirmRemoveStudent = () => {
    if (!selectedTeam || !studentToRemove) return;
    const result = TeamsManagementService.removeStudentFromTeam(
      selectedTeam.team_id,
      studentToRemove.id,
      "Advisor adjustment"
    );
    if (result) {
      const updatedTeams = TeamsManagementService.getTeams();
      setTeams(updatedTeams);
      setUnassignedStudents(TeamsManagementService.getUnassignedStudents());
      setGuides(TeamsManagementService.getGuides());
      setIsRemoveStudentModalOpen(false);
      setStudentToRemove(null);
      if (result.teamAutoDeleted) {
        setIsManageDrawerOpen(false);
        showToast(
          "Empty Team Disbanded & Sequential Numbers Auto-Decremented",
          `Team had 0 members remaining and was deleted. All subsequent team numbers were re-sequenced.`,
          "warning"
        );
      } else {
        const refreshedSelected = updatedTeams.find((t) => t.team_id === selectedTeam.team_id);
        if (refreshedSelected) {
          setSelectedTeam(refreshedSelected);
        }
        showToast(
          "Student Removed from Team",
          `${result.removedMember.full_name} was removed and returned to the Unassigned Students pool.`
        );
      }
    }
  };

  const handleConfirmMoveStudent = () => {
    if (!selectedTeam || !studentToMove || !targetTeamId) return;
    try {
      const success = TeamsManagementService.moveStudent(
        selectedTeam.team_id,
        targetTeamId,
        studentToMove.id,
        "Team Member",
        "Advisor transfer"
      );
      if (success) {
        const updatedTeams = TeamsManagementService.getTeams();
        setTeams(updatedTeams);
        setUnassignedStudents(TeamsManagementService.getUnassignedStudents());
        setGuides(TeamsManagementService.getGuides());
        const refreshedSelected = updatedTeams.find((t) => t.team_id === selectedTeam.team_id);
        if (refreshedSelected) {
          setSelectedTeam(refreshedSelected);
        }
        setIsMoveStudentModalOpen(false);
        setStudentToMove(null);
        setTargetTeamId("");
        showToast("Student Transferred", `Successfully transferred student to target team.`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to move student.");
    }
  };

  const handleConfirmChangeGuide = () => {
    if (!selectedTeam || !newGuideId) return;
    const updated = TeamsManagementService.reassignGuide(
      selectedTeam.team_id,
      newGuideId,
      "Academic alignment",
      "07 Sep 2026"
    );
    if (updated) {
      const updatedTeams = TeamsManagementService.getTeams();
      setTeams(updatedTeams);
      setGuides(TeamsManagementService.getGuides());
      const refreshedSelected = updatedTeams.find((t) => t.team_id === selectedTeam.team_id);
      if (refreshedSelected) {
        setSelectedTeam(refreshedSelected);
      }
      setIsChangeGuideModalOpen(false);
      setNewGuideId("");
      showToast(
        "Project Guide Reassigned",
        `Assigned new guide ${updated.guide.name}. Changes automatically recorded in Change Management.`
      );
    }
  };

  const handleDeleteTeamDirectly = (team: ManagedTeam) => {
    if (
      window.confirm(
        `Are you sure you want to disband and delete ${team.name} (${team.team_id})? All subsequent team numbers will be re-sequenced automatically.`
      )
    ) {
      TeamsManagementService.deleteEmptyTeamAndAutoDecrement(team.team_id, "Manual advisor disband");
      refreshData();
      setIsManageDrawerOpen(false);
      showToast(
        "Team Disbanded & Sequential Numbers Auto-Decremented",
        `${team.name} removed. Team numbers re-sequenced sequentially without gaps.`,
        "warning"
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 font-['Plus_Jakarta_Sans',sans-serif] pb-16">
      {/* 1. Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <span>SIET Portal</span>
            <span className="text-slate-300 font-normal">&gt;</span>
            <span>Advisor Console</span>
            <span className="text-slate-300 font-normal">&gt;</span>
            <span className="text-slate-600 font-medium">Teams &amp; Guides</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] mt-1">
            Teams &amp; Guides
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student teams, members, project guides, and assignments.
          </p>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Link to separate Change History Page */}
          <Link
            to="/advisor/change-management"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-none transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
            <span>View Change History</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Import / Bulk Manage Menu */}
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-none transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import / Bulk</span>
            </button>
          </div>

          {/* Primary CTA: + Create Team */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold shadow-none transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* 2. Assigned Class Indicator Banner */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 sm:p-4 shadow-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#034419] shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Class
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-[#034419] border border-emerald-200">
                Active Cohort
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-0.5">
              Class: {ASSIGNED_CLASS.section} <span className="text-slate-300 font-normal">|</span> Batch {ASSIGNED_CLASS.batch}
            </h2>
          </div>
        </div>

        {/* Informative indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/70">
          <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Class Advisor Console — Managing capstone teams &amp; students for your assigned section.</span>
        </div>
      </div>

      {/* 3. Unified Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white rounded-lg border border-slate-200/90 shadow-none">
        {/* Total Teams */}
        <div className="p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Teams
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1">
            {stats.totalTeams}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active Teams</p>
        </div>

        {/* Total Students */}
        <div className="p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Students
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1">
            {stats.totalStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Class: {ASSIGNED_CLASS.section}</p>
        </div>

        {/* Assigned Students */}
        <div className="p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Assigned Students
          </span>
          <div className="text-xl font-bold font-mono text-emerald-800 tracking-tight mt-1">
            {stats.assignedStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Currently Assigned</p>
        </div>

        {/* Unassigned Students */}
        <div
          onClick={() => setActiveTab("unassigned")}
          className={`p-3.5 cursor-pointer transition ${
            stats.unassignedStudents > 0
              ? "bg-amber-50/40 hover:bg-amber-50/70"
              : "hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 block">
            Unassigned Students
          </span>
          <div className="text-xl font-bold font-mono text-amber-900 tracking-tight mt-1">
            {stats.unassignedStudents}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
            {stats.unassignedStudents > 0 ? "Need Assignment" : "All Assigned"}
          </p>
        </div>

        {/* Active Guides */}
        <div
          onClick={() => setActiveTab("guides")}
          className="p-3.5 cursor-pointer hover:bg-slate-50 transition"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Guides
          </span>
          <div className="text-xl font-bold font-mono text-teal-800 tracking-tight mt-1">
            {guides.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Faculty Guides</p>
        </div>
      </div>

      {/* 4. Navigation Sub-Tabs & Workspace Header */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
        {/* Tab Selection Row */}
        <div className="px-4 pt-3 pb-0 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("teams")}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "teams"
                  ? "border-[#034419] text-[#034419]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              All Teams ({filteredTeams.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unassigned")}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "unassigned"
                  ? "border-[#034419] text-[#034419]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Unassigned Students</span>
              {stats.unassignedStudents > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                  {stats.unassignedStudents}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guides")}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "guides"
                  ? "border-[#034419] text-[#034419]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Guides &amp; Workload ({guides.length})
            </button>
          </div>

          {/* Search & Filter Trigger */}
          <div className="flex items-center gap-2 pb-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search team, student, register no, or guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-64 sm:w-72 text-xs bg-slate-50/70 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#034419] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition cursor-pointer ${
                showFilterDrawer || statusFilter !== "All" || domainFilter !== "All"
                  ? "bg-emerald-50 text-[#034419] border-emerald-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterDrawer && (
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in-50 duration-150">
            {/* Status Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Team Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Team Status"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Project Domain */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Project Domain
              </label>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                aria-label="Filter by Project Domain"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="All">All Domains</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Web Development">Web Development</option>
                <option value="IoT">IoT</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Team Size */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Team Size
              </label>
              <select
                value={teamSizeFilter}
                onChange={(e) => setTeamSizeFilter(e.target.value)}
                aria-label="Filter by Team Size"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="Any">Any Size</option>
                <option value="1–2">1 – 2 Students</option>
                <option value="3–4">3 – 4 Students</option>
                <option value="5+">5+ Students</option>
              </select>
            </div>

            {/* Guide Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Faculty Guide
              </label>
              <select
                value={guideFilter}
                onChange={(e) => setGuideFilter(e.target.value)}
                aria-label="Filter by Faculty Guide"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="All">All Guides</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="sm:col-span-4 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("All");
                  setDomainFilter("All");
                  setGuideFilter("All");
                  setTeamSizeFilter("Any");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* 5. Main Content According to Active Tab */}

        {/* TAB 1: ALL TEAMS WITH MANTINE ROW EXPANSION */}
        {activeTab === "teams" && (
          <DataTable<ManagedTeam>
            withTableBorder={false}
            withColumnBorders
            records={filteredTeams}
            idAccessor={(team) => team.id || team.team_id}
            noRecordsText="No teams found. Try adjusting your search query or filters."
            columns={[
              {
                accessor: "name",
                title: "TEAM",
                render: (team) => (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{team.name}</span>
                    {team.members.length === 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                        Empty
                      </span>
                    )}
                  </div>
                ),
              },
              {
                accessor: "team_id",
                title: "TEAM ID",
                render: (team) => (
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md inline-block">
                    {team.team_id}
                  </span>
                ),
              },
              {
                accessor: "members",
                title: "MEMBERS",
                textAlignment: "center",
                render: (team) => {
                  const isFull = team.members.length >= 4;
                  return (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenManageTeam(team, "members");
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition cursor-pointer ${
                        team.members.length === 0
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : isFull
                          ? "bg-emerald-50 text-[#0F5132] border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>{team.members.length} Members</span>
                    </button>
                  );
                },
              },
              {
                accessor: "guide",
                title: "ASSIGNED GUIDE",
                render: (team) => (
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                      <span>{team.guide.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-3 truncate">
                      {team.guide.designation} · {team.guide.department}
                    </div>
                  </div>
                ),
              },
              {
                accessor: "project_title",
                title: "PROJECT TITLE",
                render: (team) => (
                  <div>
                    <div
                      className="text-xs text-slate-800 font-semibold truncate max-w-[240px]"
                      title={team.project_title}
                    >
                      {team.project_title}
                    </div>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                      {team.project_domain}
                    </div>
                  </div>
                ),
              },
              {
                accessor: "status",
                title: "STATUS",
                textAlignment: "center",
                render: (team) => (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      team.status === "Active"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : team.status === "Completed"
                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {team.status}
                  </span>
                ),
              },
              {
                accessor: "last_modified",
                title: "LAST MODIFIED",
                textAlignment: "center",
                render: (team) => (
                  <span className="text-[11px] font-mono text-slate-400">
                    {team.last_modified}
                  </span>
                ),
              },
              {
                accessor: "actions",
                title: "ACTIONS",
                textAlignment: "right",
                render: (team) => (
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenManageTeam(team, "overview");
                      }}
                      className="px-2.5 py-1.5 rounded-md bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold transition shadow-none cursor-pointer"
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeamDirectly(team);
                      }}
                      title="Disband & Delete Team"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            rowExpansion={{
              allowMultiple: true,
              content: ({ record: team }) => (
                <div className="p-4 bg-slate-50/60 space-y-3 border-t border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#034419] font-mono">
                        TEAM ROSTER &amp; GUIDE ALLOCATION
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                        {team.name} ({team.team_id}) — {team.project_title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-emerald-800">
                        Domain: {team.project_domain}
                      </span>
                    </div>
                  </div>

                  {/* Student Members Grid */}
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Assigned Students ({team.members.length}/4 Quota):
                    </div>
                    {team.members.length === 0 ? (
                      <div className="p-2.5 bg-white rounded-md border border-rose-200 text-xs text-rose-700 italic">
                        No students assigned yet. Click 'Manage' to add candidates.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {team.members.map((m) => (
                          <div
                            key={m.id}
                            className="p-2.5 bg-white rounded-md border border-slate-200/90 shadow-none"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {m.full_name}
                              </span>
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                {m.role}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              {m.roll_number}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Guide Info */}
                  <div className="p-2.5 bg-white rounded-md border border-slate-200/90 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      Assigned Faculty Guide: <strong className="text-slate-900">{team.guide.name}</strong> ({team.guide.designation}, {team.guide.department})
                    </div>
                    <div className="font-mono text-slate-400 text-[11px]">
                      Last Updated: {team.last_modified}
                    </div>
                  </div>
                </div>
              ),
            }}
          />
        )}

        {/* TAB 2: UNASSIGNED STUDENTS */}
        {activeTab === "unassigned" && (
          <div className="p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-50/60 border border-amber-200 p-3.5 rounded-lg">
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  Unassigned Students Pool ({filteredUnassigned.length})
                </h2>
                <p className="text-xs text-amber-700 mt-0.5">
                  Students who have not been allocated to any capstone project team yet.
                </p>
              </div>

              {selectedUnassignedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsBulkAssignModalOpen(true)}
                  className="px-3 py-1.5 bg-[#034419] hover:bg-[#023112] text-white text-xs font-semibold rounded-md shadow-none transition cursor-pointer"
                >
                  Bulk Assign ({selectedUnassignedIds.length}) Students
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-200/90 rounded-lg">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all unassigned students"
                        checked={
                          selectedUnassignedIds.length > 0 &&
                          selectedUnassignedIds.length === filteredUnassigned.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUnassignedIds(filteredUnassigned.map((s) => s.id));
                          } else {
                            setSelectedUnassignedIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-3">Register Number</th>
                    <th className="py-2.5 px-3">Batch</th>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUnassigned.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        All students in this batch and section are assigned to project teams!
                      </td>
                    </tr>
                  ) : (
                    filteredUnassigned.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Select student ${student.full_name}`}
                            checked={selectedUnassignedIds.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUnassignedIds([...selectedUnassignedIds, student.id]);
                              } else {
                                setSelectedUnassignedIds(
                                  selectedUnassignedIds.filter((id) => id !== student.id)
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {student.full_name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {student.roll_number}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{student.batch}</td>
                        <td className="py-2.5 px-3 text-slate-500">{student.section}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Unassigned
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUnassignedIds([student.id]);
                              setIsBulkAssignModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#034419] border border-emerald-200 text-xs font-semibold rounded-md transition"
                          >
                            Assign Team
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

        {/* TAB 3: GUIDES & WORKLOAD */}
        {activeTab === "guides" && (
          <div className="p-4 space-y-3.5">
            <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-lg">
              <h2 className="text-sm font-bold text-slate-900">
                Faculty Project Guides &amp; Workload Distribution ({guides.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recommended institutional workload ceiling: Maximum 6 teams per faculty advisor.
              </p>
            </div>

            <DataTable<ManagedFacultyGuide>
              withTableBorder
              withColumnBorders
              records={guides}
              idAccessor="id"
              noRecordsText="No faculty guides found."
              columns={[
                {
                  accessor: "name",
                  title: "GUIDE NAME",
                  render: (g) => <span className="font-bold text-slate-900">{g.name}</span>,
                },
                {
                  accessor: "designation",
                  title: "DESIGNATION",
                  render: (g) => <span className="text-slate-600">{g.designation}</span>,
                },
                {
                  accessor: "department",
                  title: "DEPARTMENT",
                  render: (g) => (
                    <span className="text-slate-600 font-semibold">{g.department}</span>
                  ),
                },
                {
                  accessor: "current_teams_count",
                  title: "ASSIGNED TEAMS",
                  textAlignment: "center",
                  render: (g) => (
                    <span className="font-mono font-bold text-slate-900">
                      {g.current_teams_count} Teams
                    </span>
                  ),
                },
                {
                  accessor: "current_students_count",
                  title: "STUDENTS",
                  textAlignment: "center",
                  render: (g) => (
                    <span className="font-mono text-slate-500">
                      {g.current_students_count} Students
                    </span>
                  ),
                },
                {
                  accessor: "workload",
                  title: "WORKLOAD CEILING",
                  render: (g) => {
                    const isAtCeiling = g.current_teams_count >= g.max_teams_limit;
                    const percent = Math.min(100, (g.current_teams_count / g.max_teams_limit) * 100);
                    return (
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-slate-700">
                            {g.current_teams_count} / {g.max_teams_limit}
                          </span>
                          {isAtCeiling && (
                            <span className="text-[9px] font-bold text-rose-700">Full</span>
                          )}
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isAtCeiling
                                ? "bg-rose-500"
                                : percent > 60
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                },
                {
                  accessor: "actions",
                  title: "ACTIONS",
                  textAlignment: "right",
                  render: (g) => (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGuideFilter(g.id);
                        setActiveTab("teams");
                        setShowFilterDrawer(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0F5132] hover:underline cursor-pointer"
                    >
                      View Teams →
                    </button>
                  ),
                },
              ]}
              rowExpansion={{
                allowMultiple: true,
                content: ({ record: g }) => {
                  const guideTeams = teams.filter((t) => t.guide.id === g.id || t.guide.name === g.name);
                  return (
                    <div className="p-4 bg-[#F8FDF9] space-y-3 border-t border-b border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#0F5132] uppercase tracking-wider">
                          ASSIGNED TEAMS UNDER {g.name.toUpperCase()} ({guideTeams.length} TEAMS)
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Workload Limit: {g.max_teams_limit} Teams Max
                        </span>
                      </div>
                      {guideTeams.length === 0 ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                          No teams assigned to this faculty guide yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {guideTeams.map((t) => (
                            <div
                              key={t.id}
                              className="p-3 bg-white rounded-xl border border-emerald-100/80 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">{t.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {t.team_id}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 truncate" title={t.project_title}>
                                {t.project_title}
                              </div>
                              <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                                {t.members.length} Members · {t.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </div>
        )}

        {/* Footer Summary */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing {filteredTeams.length} teams · {stats.unassignedStudents} unassigned students in Class {ASSIGNED_CLASS.section} ({ASSIGNED_CLASS.batch})
          </div>
          <div className="text-slate-400">
            Every modification is automatically logged in Change Management
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MANAGE TEAM WORKSPACE DRAWER / MODAL                                  */}
      {/* ========================================================================= */}
      {isManageDrawerOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                    {selectedTeam.team_id}
                  </span>
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {selectedTeam.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {selectedTeam.project_title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsManageDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="px-5 border-b border-slate-100 flex items-center gap-4 bg-white">
              <button
                type="button"
                onClick={() => setTeamDrawerTab("overview")}
                className={`py-3 text-xs font-bold border-b-2 transition ${
                  teamDrawerTab === "overview"
                    ? "border-[#0F5132] text-[#0F5132]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setTeamDrawerTab("members")}
                className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  teamDrawerTab === "members"
                    ? "border-[#0F5132] text-[#0F5132]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Members ({selectedTeam.members.length})</span>
                {selectedTeam.members.length === 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTeamDrawerTab("guide")}
                className={`py-3 text-xs font-bold border-b-2 transition ${
                  teamDrawerTab === "guide"
                    ? "border-[#0F5132] text-[#0F5132]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Guide Assignment
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Alert if Team has 0 members */}
              {selectedTeam.members.length === 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Empty Team Alert: No students remaining in this team!</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    Saving or disbanding this empty team will automatically re-sequence subsequent team numbers sequentially.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteTeamDirectly(selectedTeam)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition"
                  >
                    Delete Empty Team &amp; Auto-Decrement Numbers
                  </button>
                </div>
              )}

              {/* OVERVIEW TAB */}
              {teamDrawerTab === "overview" && (
                <div className="space-y-4">
                  {/* Meta Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Team Dossier Summary
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Batch &amp; Section:</span>
                        <strong className="text-slate-900">{selectedTeam.batch} • {selectedTeam.section}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Domain:</span>
                        <strong className="text-emerald-800">{selectedTeam.project_domain}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Status:</span>
                        <strong className="text-slate-900">{selectedTeam.status}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Last Activity:</span>
                        <span className="font-mono text-slate-600">{selectedTeam.last_modified}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guide Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assigned Project Guide
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {selectedTeam.guide.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedTeam.guide.designation} · {selectedTeam.guide.department}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTeamDrawerTab("guide")}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0F5132] border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                    >
                      Change Guide
                    </button>
                  </div>

                  {/* Members Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Current Members ({selectedTeam.members.length} / 4)
                      </span>
                      <button
                        type="button"
                        onClick={() => setTeamDrawerTab("members")}
                        className="text-xs font-semibold text-[#0F5132] hover:underline"
                      >
                        Manage Members →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {selectedTeam.members.map((m, idx) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{idx + 1}. {m.full_name}</span>
                            <span className="font-mono text-slate-400 text-[11px] ml-2">({m.roll_number})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Link to Change History for this Team */}
                  <div className="pt-2">
                    <Link
                      to={`/advisor/change-management?team=${encodeURIComponent(selectedTeam.team_id)}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#0F5132] hover:underline"
                    >
                      <span>View Change History for {selectedTeam.name} →</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* MEMBERS TAB */}
              {teamDrawerTab === "members" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Enrolled Members ({selectedTeam.members.length} / 4 max)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Add members, move students to other teams, or remove students.
                      </p>
                    </div>

                    {selectedTeam.members.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setIsAddStudentModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold rounded-lg shadow-2xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Student</span>
                      </button>
                    )}
                  </div>

                  {selectedTeam.members.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                      No members currently enrolled. Click Add Student above.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                <span>{member.full_name}</span>
                              </div>
                              <div className="font-mono text-slate-400 text-[11px]">
                                {member.roll_number} · Joined {member.joined_date}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5">
                              {/* Move Student */}
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentToMove(member);
                                  setIsMoveStudentModalOpen(true);
                                }}
                                title="Move to Another Team"
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              {/* Remove Student */}
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentToRemove(member);
                                  setIsRemoveStudentModalOpen(true);
                                }}
                                title="Remove from Team"
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* GUIDE ASSIGNMENT TAB */}
              {teamDrawerTab === "guide" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Currently Assigned Guide
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {selectedTeam.guide.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedTeam.guide.designation} · {selectedTeam.guide.department}
                    </p>
                    <div className="text-xs text-emerald-800 font-semibold pt-1">
                      Current Workload: {selectedTeam.guide.current_teams_count} / {selectedTeam.guide.max_teams_limit} Teams
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewGuideId(selectedTeam.guide.id);
                      setIsChangeGuideModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold shadow-xs transition"
                  >
                    Change Faculty Guide Assignment
                  </button>

                  <p className="text-[11px] text-slate-400">
                    Note: Reassigning the guide will update workloads across both faculty members and log the transition in the official Change Management audit trail.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CREATE NEW TEAM MODAL                                                  */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <CreateTeamModal
          guides={guides}
          unassignedStudents={unassignedStudents}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newTeam) => {
            refreshData();
            setIsCreateModalOpen(false);
            showToast("Team Created Successfully", `Created ${newTeam.name} with ID ${newTeam.team_id}.`);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. SUB-MODALS: REMOVE STUDENT CONFIRMATION                                */}
      {/* ========================================================================= */}
      {isRemoveStudentModalOpen && studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Remove Student from Team
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{studentToRemove.full_name}</strong> ({studentToRemove.roll_number}) from <strong>{selectedTeam?.name}</strong>?
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
              The student will immediately return to the Unassigned Students pool and this action will be logged in Change Management.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRemoveStudentModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveStudent}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
              >
                Confirm &amp; Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SUB-MODALS: MOVE STUDENT TO ANOTHER TEAM                               */}
      {/* ========================================================================= */}
      {isMoveStudentModalOpen && studentToMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Move Student to Another Team
            </h3>
            <p className="text-xs text-slate-600">
              Transfer <strong>{studentToMove.full_name}</strong> ({studentToMove.roll_number}) from <strong>{selectedTeam?.name}</strong>.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Destination Team *
              </label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                aria-label="Select Destination Team"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              >
                <option value="">-- Select Destination Team --</option>
                {teams
                  .filter((t) => t.team_id !== selectedTeam?.team_id)
                  .map((t) => {
                    const isFull = t.members.length >= 4;
                    const availableSlots = 4 - t.members.length;
                    return (
                      <option key={t.team_id} value={t.team_id} disabled={isFull}>
                        {t.name} ({t.team_id}) · {t.members.length}/4 Members {isFull ? "— [FULL / Max Capacity]" : `— [${availableSlots} slot${availableSlots > 1 ? "s" : ""} available]`}
                      </option>
                    );
                  })}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Teams at maximum capacity (4 members) are disabled and cannot be selected.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMoveStudentModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!targetTeamId}
                onClick={handleConfirmMoveStudent}
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SUB-MODALS: CHANGE GUIDE MODAL                                        */}
      {/* ========================================================================= */}
      {isChangeGuideModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Change Project Guide for {selectedTeam.name}
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Current Guide:</div>
              <div className="font-bold text-slate-900">{selectedTeam.guide.name} ({selectedTeam.guide.department})</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select New Guide *
              </label>
              <select
                value={newGuideId}
                onChange={(e) => setNewGuideId(e.target.value)}
                aria-label="Select New Faculty Guide"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-semibold"
              >
                <option value="">-- Choose Faculty Guide --</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} · {g.department} ({g.current_teams_count}/{g.max_teams_limit} Teams)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangeGuideModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newGuideId || newGuideId === selectedTeam.guide.id}
                onClick={handleConfirmChangeGuide}
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-2xs"
              >
                Confirm Guide Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. SUB-MODALS: ADD STUDENT TO TEAM                                       */}
      {/* ========================================================================= */}
      {isAddStudentModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Add Student to {selectedTeam.name}
            </h3>

            {unassignedStudents.length === 0 ? (
              <p className="text-xs text-slate-500">
                No unassigned students currently available in the pool.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select an available student from the unassigned pool:
                </p>
                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2">
                  {unassignedStudents.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{s.full_name}</div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {s.roll_number} · {s.batch} {s.section}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            TeamsManagementService.addStudentToTeam(selectedTeam.team_id, s.id, "Team Member");
                            refreshData();
                            setIsAddStudentModalOpen(false);
                            showToast("Student Added", `Added ${s.full_name} to ${selectedTeam.name}.`);
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0F5132] border border-emerald-200 rounded-md font-bold text-xs"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. SUB-MODALS: BULK ASSIGN STUDENTS                                      */}
      {/* ========================================================================= */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Bulk Team Assignment ({selectedUnassignedIds.length} Students)
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Assign to Target Team *
              </label>
              <select
                value={bulkTargetTeamId}
                onChange={(e) => setBulkTargetTeamId(e.target.value)}
                aria-label="Select Target Team for Bulk Assignment"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              >
                <option value="">-- Choose Team with Open Slots --</option>
                {teams
                  .filter((t) => 4 - t.members.length >= selectedUnassignedIds.length)
                  .map((t) => (
                    <option key={t.team_id} value={t.team_id}>
                      {t.name} ({t.team_id}) · {4 - t.members.length} slots open
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!bulkTargetTeamId}
                onClick={() => {
                  try {
                    TeamsManagementService.bulkAssignStudents(
                      selectedUnassignedIds,
                      bulkTargetTeamId,
                      "Team Member"
                    );
                    refreshData();
                    setSelectedUnassignedIds([]);
                    setIsBulkAssignModalOpen(false);
                    showToast("Bulk Assignment Complete", `Assigned students to target team.`);
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-2xs"
              >
                Confirm Bulk Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. SUB-MODALS: IMPORT DATA MODAL                                         */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Import Student &amp; Team Data
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload institutional CSV or Excel spreadsheet containing team assignments and student roll numbers.
            </p>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 space-y-2">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                Drag and drop your spreadsheet here or browse
              </div>
              <p className="text-[11px] text-slate-400">Supported formats: .CSV, .XLSX</p>
              <button
                type="button"
                onClick={() => alert("Sample template downloaded: siet_team_allocation_template.csv")}
                className="text-xs font-semibold text-[#0F5132] hover:underline block mx-auto pt-2"
              >
                Download Official CSV Template
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  showToast("Data Validated & Ready", "All 42 records verified against Autonomous ERP database.");
                }}
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] text-white rounded-lg text-xs font-bold"
              >
                Validate &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. TOAST NOTIFICATION                                                    */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#0F5132] text-white p-4 rounded-2xl shadow-xl border border-emerald-700 flex items-start gap-3 max-w-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold">{toastMessage.title}</div>
              <p className="text-[11px] text-emerald-100 mt-0.5 leading-relaxed">
                {toastMessage.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CREATE TEAM MODAL COMPONENT (4-Step Wizard)
// ============================================================================
interface CreateTeamModalProps {
  guides: ManagedFacultyGuide[];
  unassignedStudents: UnassignedStudent[];
  onClose: () => void;
  onSuccess: (team: ManagedTeam) => void;
}

function CreateTeamModal({ guides, unassignedStudents, onClose, onSuccess }: CreateTeamModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State (Advisor is assigned to single class)
  const [name, setName] = useState("Team Omega");
  const batch = "2023 – 2027";
  const section = "CSE - A";

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState(guides[0]?.id || "");

  const selectedGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];
  const selectedStudents = unassignedStudents.filter((u) => selectedStudentIds.includes(u.id));

  const handleCreate = () => {
    if (!name.trim() || !selectedGuide) {
      alert("Please enter Team Name and select a Project Guide.");
      return;
    }

    const created = TeamsManagementService.createTeam(
      {
        name: name.trim(),
        project_title: "Project Topic Unassigned",
        project_domain: "General",
        description: "Capstone project details to be assigned by student team and guide.",
        batch,
        section,
        status: "Active",
        guide: selectedGuide,
        members: [],
      },
      selectedStudentIds
    );

    onSuccess(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create New Team</h3>
            <p className="text-xs text-slate-500">
              Step {step} of 4: {step === 1 ? "Team Name" : step === 2 ? "Assign Members" : step === 3 ? "Project Guide" : "Review & Confirm"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-center">
          <div className={`py-1 rounded ${step === 1 ? "bg-[#0F5132] text-white" : "text-slate-500"}`}>1. Team Name</div>
          <div className={`py-1 rounded ${step === 2 ? "bg-[#0F5132] text-white" : "text-slate-500"}`}>2. Members</div>
          <div className={`py-1 rounded ${step === 3 ? "bg-[#0F5132] text-white" : "text-slate-500"}`}>3. Guide</div>
          <div className={`py-1 rounded ${step === 4 ? "bg-[#0F5132] text-white" : "text-slate-500"}`}>4. Review</div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Team Alpha"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:bg-white"
                />
              </div>

              {/* Fixed Assigned Class Banner */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Class</span>
                  <span className="font-bold text-[#0F5132]">CSE - A (Batch 2023 – 2027)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-[#0F5132]">Single Class Advisor</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Project title and domain are finalized collaboratively by the assigned guide and students during synopsis review.
              </div>
            </div>
          )}

          {/* STEP 2: MEMBERS */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Select Members from Available Pool ({selectedStudentIds.length} / 4)
                </span>
              </div>

              {unassignedStudents.length === 0 ? (
                <p className="text-slate-400">No unassigned students currently available.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2">
                  {unassignedStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between transition ${
                          isSelected ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-100"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{s.full_name}</div>
                          <div className="font-mono text-[11px] text-slate-400">
                            {s.roll_number} · {s.batch} {s.section}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStudentIds(selectedStudentIds.filter((id) => id !== s.id));
                            } else {
                              if (selectedStudentIds.length >= 4) {
                                alert("Maximum 4 members allowed per team.");
                                return;
                              }
                              setSelectedStudentIds([...selectedStudentIds, s.id]);
                            }
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                            isSelected
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-[#0F5132] hover:bg-emerald-200"
                          }`}
                        >
                          {isSelected ? "Remove" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: GUIDE */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="font-bold text-slate-700 block">
                Assign Faculty Project Guide
              </label>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2">
                {guides.map((g) => {
                  const isSelected = selectedGuideId === g.id;
                  const isFull = g.current_teams_count >= g.max_teams_limit;

                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGuideId(g.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-400 shadow-2xs"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{g.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {g.designation} · {g.department}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-700">
                          {g.current_teams_count} / {g.max_teams_limit} Teams
                        </span>
                        {isFull && (
                          <span className="block text-[10px] font-bold text-rose-600">
                            At Recommended Limit
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                Review New Team Allocation
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">Team:</span>
                  <strong className="text-slate-900">{name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Class / Batch:</span>
                  <strong className="text-slate-900">{section} • {batch}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Guide:</span>
                  <strong className="text-emerald-800">{selectedGuide?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Members:</span>
                  <strong className="text-slate-900">{selectedStudents.length} Students Selected</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold rounded-lg shadow-2xs"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0b3d26] text-white text-xs font-bold rounded-lg shadow-2xs"
              >
                Create Team &amp; Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvisorTeamsAndGuidesPage;
