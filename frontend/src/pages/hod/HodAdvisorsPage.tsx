import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FolderKanban,
  GraduationCap,
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  FileSpreadsheet,
  UserCheck,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useHodAdvisors, useHodAdvisorEvaluations } from "@/hooks/use-hod";
import { useHodStore } from "@/stores/hod-store";
import {
  exportCyclePDF,
  exportCycleExcel,
  exportCycleCSV,
  exportSingleTeamDossierPDF,
} from "@/lib/export-hod-reports";
import {
  HodAdvisorRecord,
  AdvisorEvaluationHistoryRecord,
} from "@/types/hod";
import { DataTable } from "@/components/ui/data-table";

export function HodAdvisorsPage() {
  const { selectedBatch, setSelectedBatch, availableBatches, academicYear } =
    useHodStore();

  const { data: facultyList, isLoading } = useHodAdvisors(selectedBatch);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleTab, setRoleTab] = useState<"ALL" | "ADVISOR" | "GUIDE">("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [expandedFacultyId, setExpandedFacultyId] = useState<string | null>(null);

  // Selected Record Modal State
  const [selectedRecord, setSelectedRecord] =
    useState<AdvisorEvaluationHistoryRecord | null>(null);

  // Filter faculty members (Advisors & Guides)
  const filteredFaculty = (facultyList || []).filter((fac) => {
    // Role filter
    if (roleTab === "ADVISOR" && fac.role !== "ADVISOR" && fac.role !== "BOTH")
      return false;
    if (roleTab === "GUIDE" && fac.role !== "GUIDE" && fac.role !== "BOTH")
      return false;

    // Department filter
    if (departmentFilter !== "ALL" && !fac.department.includes(departmentFilter))
      return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = fac.name.toLowerCase().includes(q);
      const matchId = (fac.faculty_id || "").toLowerCase().includes(q);
      const matchEmail = fac.email.toLowerCase().includes(q);
      const matchDept = fac.department.toLowerCase().includes(q);
      const matchTeam = fac.assigned_teams.some(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.project_title.toLowerCase().includes(q) ||
          t.guide_name.toLowerCase().includes(q)
      );
      if (!matchName && !matchId && !matchEmail && !matchDept && !matchTeam)
        return false;
    }

    return true;
  });

  const totalAdvisorsCount = (facultyList || []).filter(
    (f) => f.role === "ADVISOR" || f.role === "BOTH"
  ).length;

  const totalGuidesCount = (facultyList || []).filter(
    (f) => f.role === "GUIDE" || f.role === "BOTH"
  ).length;

  const totalAssignedTeams = filteredFaculty.reduce(
    (acc, a) => acc + a.teams_count,
    0
  );
  const totalStudents = filteredFaculty.reduce(
    (acc, a) => acc + a.students_count,
    0
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleTab("ALL");
    setDepartmentFilter("ALL");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-50 text-[#034419] border border-emerald-200/80">
              Batch: {selectedBatch}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Academic Supervision Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#034419] font-['IBM_Plex_Sans',sans-serif]">
            Faculty Advisors &amp; Project Guides
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Master supervision console displaying faculty advisors, project guides, assigned cohorts, and evaluation logs.
          </p>
        </div>
      </div>

      {/* 2. Unified Top Metric KPI Strip (4 Columns) */}
      <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Faculty
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {filteredFaculty.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Advisors &amp; Project Guides
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Role Breakdown
            </span>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              <span className="text-[#034419]">{totalAdvisorsCount} Advisors</span>
              <span className="text-slate-300 mx-1.5">·</span>
              <span className="text-[#16A34A]">{totalGuidesCount} Guides</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Active mentoring supervision
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Teams Handled
            </span>
            <div className="text-2xl font-bold text-[#034419] mt-1 font-mono">
              {totalAssignedTeams}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Active student project units
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Students Supervised
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {totalStudents}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Candidates in cohort {selectedBatch}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Panel with Role Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-none space-y-3">
        {/* Role Quick Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setRoleTab("ALL")}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                roleTab === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Faculty ({facultyList?.length || 0})
            </button>
            <button
              onClick={() => setRoleTab("ADVISOR")}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                roleTab === "ADVISOR"
                  ? "bg-white text-[#034419] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Advisors Only ({totalAdvisorsCount})
            </button>
            <button
              onClick={() => setRoleTab("GUIDE")}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                roleTab === "GUIDE"
                  ? "bg-white text-[#034419] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Guides Only ({totalGuidesCount})
            </button>
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Batch Context:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b} {b === "2025–2029" ? "(Current Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar & Secondary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty name, ID (e.g. SIET-FAC), email, department, or assigned team..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Electronics">Electrical & Electronics / ECE</option>
            </select>
          </div>
        </div>

        {/* Clear Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredFaculty.length}</strong> faculty members in cohort <strong className="text-indigo-600 font-mono">{selectedBatch}</strong>
          </span>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Master Advisors & Guides Table with Mantine-pattern Row Expansion */}
      <DataTable<HodAdvisorRecord>
        withTableBorder
        columns={[
          {
            accessor: "name",
            title: "Faculty Member",
            render: (fac) => {
              const initials = fac.name
                .replace(/Dr\.|Prof\./g, "")
                .trim()
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("");

              return (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center font-mono shadow-xs shrink-0 ${
                      fac.role === "GUIDE"
                        ? "bg-[#16A34A] text-white"
                        : fac.role === "BOTH"
                        ? "bg-[#034419] text-[#FACC15] border border-yellow-400/40"
                        : "bg-[#034419] text-white"
                    }`}
                  >
                    {initials || "FC"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/hod/advisors/${fac.id}`}
                        className="font-bold text-[#034419] hover:text-[#16A34A] transition text-sm"
                      >
                        {fac.name}
                      </Link>
                      {fac.faculty_id && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono border border-emerald-200">
                          {fac.faculty_id}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {fac.designation} · <span className="text-slate-400">{fac.department}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {fac.email}
                      </span>
                      {fac.phone && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {fac.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            accessor: "role",
            title: "Faculty Role",
            textAlign: "center",
            render: (fac) => (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                  fac.role === "GUIDE"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : fac.role === "BOTH"
                    ? "bg-[#034419] text-[#FACC15] border border-yellow-400/40"
                    : "bg-emerald-100 text-[#034419] border border-emerald-300"
                }`}
              >
                {fac.role === "GUIDE"
                  ? "PROJECT GUIDE"
                  : fac.role === "BOTH"
                  ? "ADVISOR & GUIDE"
                  : "FACULTY ADVISOR"}
              </span>
            ),
          },
          {
            accessor: "teams_count",
            title: "Teams Handled",
            textAlign: "center",
            render: (fac) => (
              <span className="font-mono font-bold text-base text-[#034419]">
                {fac.teams_count}
              </span>
            ),
          },
          {
            accessor: "students_count",
            title: "Students",
            textAlign: "center",
            render: (fac) => (
              <span className="font-mono text-slate-700 font-semibold">
                {fac.students_count}
              </span>
            ),
          },
          {
            accessor: "id",
            title: "Action",
            textAlign: "right",
            render: (fac) => (
              <div className="flex items-center justify-end gap-2">
                <Link
                  to={`/hod/advisors/${fac.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#034419] text-white hover:bg-[#16A34A] transition shadow-xs"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ),
          },
        ]}
        records={filteredFaculty}
        idAccessor="id"
        rowExpansion={{
          allowMultiple: true,
          content: ({ record: fac }) => (
            <FacultyEvaluationSessionsCollapsible
              faculty={fac}
              batch={selectedBatch}
              onViewRecord={(rec) => setSelectedRecord(rec)}
            />
          ),
        }}
        noRecordsText="No faculty advisors or guides match the selected filters."
      />

      {/* 5. Individual Evaluation Details Modal (Fallback / Extra Detail) */}
      {selectedRecord && (
        <EvaluationDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// INLINE EXPANDABLE SESSIONS COMPONENT (STREAMLINED EVALUATION RECORDS)
// ============================================================================

interface CollapsibleProps {
  faculty: HodAdvisorRecord;
  batch: string;
  onViewRecord: (rec: AdvisorEvaluationHistoryRecord) => void;
}

function FacultyEvaluationSessionsCollapsible({
  faculty,
  batch,
  onViewRecord: _onViewRecord,
}: CollapsibleProps) {
  const { data: records, isLoading } = useHodAdvisorEvaluations(faculty.id, batch);

  const allRecords = records || [];

  // Group by session date
  const grouped = allRecords.reduce((acc, rec) => {
    const key = rec.evaluation_date || "Recent Session";
    if (!acc[key]) acc[key] = [];
    acc[key].push(rec);
    return acc;
  }, {} as Record<string, AdvisorEvaluationHistoryRecord[]>);

  const dates = Object.keys(grouped);

  // Active session date tab (defaults to first date in array, so it is always open)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const activeDate = selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0] || null;

  // Expanded Team Dossier ID (null or rec.team_id)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-slate-50/60 border-l-4 border-l-emerald-600">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 animate-pulse">
          <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Loading evaluation records for {faculty.name}...</span>
        </div>
      </div>
    );
  }

  if (allRecords.length === 0) {
    return (
      <div className="p-8 bg-slate-50/70 border-l-4 border-l-slate-300">
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center max-w-lg mx-auto shadow-2xs">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
          <h4 className="font-bold text-slate-800 text-sm font-['Plus_Jakarta_Sans',sans-serif]">
            No Evaluation Records Logged
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no evaluation session records recorded for {faculty.name} in Cohort {batch}.
          </p>
        </div>
      </div>
    );
  }

  const currentCycleRecords = activeDate ? grouped[activeDate] || [] : [];
  const sessionTime = currentCycleRecords[0]?.evaluation_time || "3:30 PM";

  return (
    <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50/95 via-slate-50/70 to-slate-100/40 border-l-4 border-l-emerald-600 space-y-4 animate-in fade-in-50 slide-in-from-top-1 duration-200">
      {/* Sleek Session Header Bar directly introducing the records */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        {/* Left: Clean Session Title & Badges */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm font-['Plus_Jakarta_Sans',sans-serif]">
                Evaluation History &amp; Records
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentCycleRecords.length} Teams Evaluated
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
              <span className="text-slate-700 font-semibold">{activeDate}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                {sessionTime}
              </span>
              <span>•</span>
              <span className="text-slate-400">Official PRC Examination</span>
            </div>
          </div>
        </div>

        {/* Right: Date Switcher Pills (if multiple sessions) & Export Session PDF */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {dates.length > 1 && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase px-2">
                Session:
              </span>
              {dates.map((d) => {
                const isSel = d === activeDate;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                      isSel
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>{d.split(",")[0]}</span>
                    <span className={`ml-1 text-[10.5px] ${isSel ? "text-emerald-200" : "text-slate-400"}`}>
                      ({grouped[d]?.length || 0})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() =>
              exportCyclePDF(
                faculty.name,
                batch,
                activeDate || "Session",
                currentCycleRecords
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-all shadow-xs"
            title="Download All Teams Dossier for this session"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Session (PDF)</span>
          </button>
        </div>
      </div>

      {/* Completed Evaluation Sessions Records Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[10.5px] uppercase tracking-wider font-mono border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3">Team ID</th>
                <th className="py-3 px-4">Team Members</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-3 text-center">Stage</th>
                <th className="py-3 px-4">Assigned Guide</th>
                <th className="py-3 px-3 text-center">Marks</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCycleRecords.map((rec) => {
                const isTeamExpanded = expandedTeamId === rec.team_id;

                return (
                  <React.Fragment key={rec.id}>
                    <tr
                      onClick={() =>
                        setExpandedTeamId(isTeamExpanded ? null : rec.team_id)
                      }
                      className={`hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer ${
                        isTeamExpanded ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      {/* Team Name with Toggle Chevron */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              isTeamExpanded
                                ? "bg-emerald-800 text-white"
                                : "text-slate-400 bg-slate-100"
                            }`}
                          >
                            {isTeamExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="font-['Plus_Jakarta_Sans',sans-serif]">
                            {rec.team_name}
                          </span>
                        </div>
                      </td>

                      {/* Team ID Pill */}
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200 whitespace-nowrap">
                          {rec.team_id}
                        </span>
                      </td>

                      {/* Team Members List */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {rec.enrolled_members?.map((m, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-medium"
                            >
                              {m.name}
                            </span>
                          )) || (
                            <span className="text-slate-400 text-[11px] italic">
                              4 Enrolled Members
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project Title */}
                      <td
                        className="py-3.5 px-4 text-slate-600 font-medium max-w-xs truncate"
                        title={rec.project_title}
                      >
                        {rec.project_title}
                      </td>

                      {/* Evaluation Stage */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[10.5px] border border-indigo-200 whitespace-nowrap">
                          {rec.evaluation_stage || "Stage 1"}
                        </span>
                      </td>

                      {/* Assigned Guide */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                          <span>{rec.guide_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.guide_designation || "Faculty Guide"} ·{" "}
                          {rec.guide_department || "CSE"}
                        </div>
                      </td>

                      {/* Marks Awarded */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="text-sm font-extrabold text-emerald-800">
                          {rec.marks_awarded}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {" "}
                          / {rec.max_marks}
                        </span>
                      </td>

                      {/* Evaluation Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {rec.status}
                        </span>
                      </td>

                      {/* Actions: Download PDF + Rubric */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => exportSingleTeamDossierPDF(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                            title="Download Team Dossier PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() =>
                              setExpandedTeamId(
                                isTeamExpanded ? null : rec.team_id
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border shadow-2xs ${
                              isTeamExpanded
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                            title="Toggle Detailed Rubric Dossier"
                          >
                            <span>{isTeamExpanded ? "Close" : "Rubric"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Team Evaluation Dossier Inline Card */}
                    {isTeamExpanded && (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-5 sm:p-6 bg-slate-50/70 border-y border-slate-200"
                        >
                          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 animate-in fade-in duration-200">
                            {/* Dossier Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold uppercase font-mono text-emerald-700 tracking-wider">
                                  OFFICIAL PRC TEAM EVALUATION DOSSIER
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                                  {rec.team_name} — {rec.project_title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Evaluated on {rec.evaluation_date} at{" "}
                                  {rec.evaluation_time} · Cohort {batch}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                                  <span className="text-[10px] font-mono text-emerald-600 uppercase block font-bold">
                                    PRC FINAL SCORE
                                  </span>
                                  <span className="text-xl font-black font-mono text-emerald-800 block">
                                    {rec.marks_awarded} / {rec.max_marks}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Enrolled Students Roster (Strictly No Team Leader Badge) */}
                            <div className="space-y-2">
                              <h6 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                <span>
                                  Evaluated Student Cohort (
                                  {rec.enrolled_members?.length || 4} Members)
                                </span>
                              </h6>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                {rec.enrolled_members?.map((m, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                  >
                                    <div className="font-bold text-slate-900 truncate">
                                      {m.name}
                                    </div>
                                    <div className="text-[10.5px] font-mono text-slate-500 mt-0.5">
                                      {m.roll_number} · {m.department}
                                    </div>
                                    <div className="text-[10px] text-indigo-700 font-mono mt-1 font-medium">
                                      {m.role || "Core Contributor"}
                                    </div>
                                  </div>
                                )) || (
                                  <div className="text-xs text-slate-400 italic">
                                    4 Students Enrolled
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Criteria Breakdown Grid */}
                            <div className="space-y-2">
                              <h6 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                                Evaluation Rubric &amp; Criteria Breakdown
                              </h6>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                    PROJECT EXECUTION
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                                    {rec.criteria_scores?.project_execution || 19} / 20
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                    TECHNICAL DEPTH
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                                    {rec.criteria_scores?.technical_depth || 18.5} / 20
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                    PRESENTATION / VIVA
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                                    {rec.criteria_scores?.presentation_viva || 18} / 20
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                    DOCUMENTATION
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                                    {rec.criteria_scores?.documentation || 14.5} / 20
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                    CONTRIBUTION
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                                    {rec.criteria_scores?.contribution || 18} / 20
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Advisor Remarks */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-[10.5px] font-bold text-slate-500 uppercase font-mono block mb-1">
                                PRC COMMITTEE EVALUATION REMARKS:
                              </span>
                              <p className="text-xs text-slate-800 leading-relaxed italic">
                                "{rec.feedback ||
                                  "Exceptional architecture, robust code repository, and thorough literature review. Meets all autonomous college guidelines."}"
                              </p>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                                <span className="text-[10.5px] font-bold text-emerald-800 uppercase font-mono block">
                                  STANDOUT STRENGTHS:
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {rec.standout_strengths ||
                                    "Comprehensive architecture, clean modular code structure, and strong literature survey."}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                                <span className="text-[10.5px] font-bold text-amber-800 uppercase font-mono block">
                                  AREAS FOR IMPROVEMENT:
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {rec.areas_for_improvement ||
                                    "Expand automated test coverage and include benchmark latency graphs in the final appendix."}
                                </p>
                              </div>
                            </div>

                            {/* Download Action Footer */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 font-mono">
                                Official PRC Examination Record · Certified by SIET COE
                              </span>
                              <button
                                onClick={() =>
                                  exportSingleTeamDossierPDF(rec)
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Team Dossier (PDF)</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sessions Footer Summary */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>
            Logged {currentCycleRecords.length} team evaluations for {activeDate}
          </span>
          <span className="text-emerald-700 font-semibold">
            Academic Governance &amp; COE Synchronized
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INDIVIDUAL EVALUATION DETAILS MODAL
interface ModalProps {
  record: AdvisorEvaluationHistoryRecord;
  onClose: () => void;
}

function EvaluationDetailsModal({ record, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-[#1E293B] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
              Evaluation Record Dossier · {record.batch}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
              {record.team_name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">{record.project_title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Evaluator
              </span>
              <span className="font-bold text-slate-800 mt-1 block">
                {record.advisor_name}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Faculty Guide
              </span>
              <span className="font-bold text-slate-800 mt-1 block">
                {record.guide_name}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Submission Date
              </span>
              <span className="font-mono text-slate-800 mt-1 block">
                {record.submission_date} · {record.submission_time}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Evaluation Date
              </span>
              <span className="font-mono text-slate-800 mt-1 block">
                {record.evaluation_date} · {record.evaluation_time}
              </span>
            </div>
          </div>

          {/* Marks Awarded Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-900 block">
                Milestone Evaluation Result
              </span>
              <span className="text-[11px] text-indigo-700">
                Official Marks Certified by Project Review Committee
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-600">
              {record.marks_awarded}{" "}
              <span className="text-sm font-normal text-slate-500">/ {record.max_marks}</span>
            </div>
          </div>

          {/* Criteria Breakdown Grid */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 font-mono uppercase text-[11px]">
              Rubric Criteria Score Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Execution</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {record.criteria_scores?.project_execution || 19} / 20
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Tech Depth</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {record.criteria_scores?.technical_depth || 18.5} / 20
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Presentation</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {record.criteria_scores?.presentation_viva || 18} / 20
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Documentation</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {record.criteria_scores?.documentation || 14.5} / 20
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Contribution</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {record.criteria_scores?.contribution || 18} / 20
                </span>
              </div>
            </div>
          </div>

          {/* Advisor Remarks */}
          {record.feedback && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Faculty Advisor Evaluation Remarks
              </span>
              <p className="text-xs text-slate-800 italic leading-relaxed">
                "{record.feedback}"
              </p>
            </div>
          )}

          {/* Submitted Work Abstract & Files */}
          {record.submitted_content && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 font-mono uppercase text-[11px]">
                Student Deliverable Submission
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {record.submitted_content.abstract}
              </p>

              {record.submitted_content.files && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {record.submitted_content.files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{f.name}</span>
                      <span className="text-[10px] text-slate-400">({f.size})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => exportSingleTeamDossierPDF(record)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Dossier</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
