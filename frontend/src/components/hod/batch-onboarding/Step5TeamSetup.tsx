import React, { useState, useEffect } from "react";
import {
  Users2,
  Sparkles,
  UserCheck,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Crown,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  RefreshCw,
  Shuffle,
  Info,
} from "lucide-react";
import {
  HodManagementService,
  ManagementTeam,
  ManagementTeamMember,
  ManagementGuide,
} from "../../../services/hod-management.service";
import { ImportedStudentItem } from "./Step2StudentImport";
import { ClassAdvisorAssignment } from "./Step4AdvisorAssignment";

interface Step5TeamSetupProps {
  batchName: string;
  students: ImportedStudentItem[];
  availableClasses: string[];
  classAdvisors: ClassAdvisorAssignment[];
  teams: ManagementTeam[];
  onChangeTeams: (teams: ManagementTeam[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5TeamSetup: React.FC<Step5TeamSetupProps> = ({
  batchName,
  students,
  availableClasses,
  classAdvisors,
  teams,
  onChangeTeams,
  onNext,
  onBack,
}) => {
  const [guidesList, setGuidesList] = useState<ManagementGuide[]>([]);
  const [teamSize, setTeamSize] = useState<number>(4);
  const [formationMode, setFormationMode] = useState<"BY_CLASS" | "CROSS_CLASS">("BY_CLASS");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("ALL");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Load guides
  useEffect(() => {
    const data = HodManagementService.getGuides();
    const fallbackGuides: ManagementGuide[] = [
      {
        id: "guide-staff-a",
        name: "Staff A",
        designation: "Assistant Professor",
        department: "CSE",
        email: "staffA.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-staff-b",
        name: "Staff B",
        designation: "Assistant Professor",
        department: "CSE",
        email: "staffB.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-staff-c",
        name: "Staff C",
        designation: "Assistant Professor",
        department: "CSE",
        email: "staffC.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-dr-revathi",
        name: "Dr. K. Revathi",
        designation: "Associate Professor",
        department: "CSE",
        email: "revathi.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-dr-vignesh",
        name: "Dr. P. Vignesh",
        designation: "Assistant Professor",
        department: "CSE",
        email: "vignesh.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-prof-manoj",
        name: "Prof. S. Manoj",
        designation: "Assistant Professor",
        department: "CSE",
        email: "manoj.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-dr-lakshmi",
        name: "Dr. M. Lakshmi",
        designation: "Professor",
        department: "CSE",
        email: "lakshmi.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-prof-deepak",
        name: "Prof. R. Deepak",
        designation: "Assistant Professor",
        department: "CSE",
        email: "deepak.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-dr-suresh",
        name: "Dr. N. Suresh",
        designation: "Associate Professor",
        department: "CSE",
        email: "suresh.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
      {
        id: "guide-prof-kavitha",
        name: "Prof. T. Kavitha",
        designation: "Assistant Professor",
        department: "CSE",
        email: "kavitha.cse@siet.ac.in",
        batch: "2025–2029",
        assigned_teams: [],
        assigned_teams_names: [],
        active_projects_count: 0,
        max_teams_limit: 5,
        status: "Active",
      },
    ];

    const merged = [...data];
    fallbackGuides.forEach((fg) => {
      if (!merged.find((m) => m.name.toLowerCase() === fg.name.toLowerCase())) {
        merged.push(fg);
      }
    });
    setGuidesList(merged);
  }, []);

  // Helper to find advisor by class
  const getAdvisorForClass = (className: string) => {
    const match = classAdvisors.find((a) => a.className === className);
    return {
      id: match?.advisorId || "adv-general",
      name: match?.advisorName || "Designated Advisor",
    };
  };

  // Auto-generate teams
  const handleAutoGenerateTeams = () => {
    if (students.length === 0) return;
    const nowIso = new Date().toISOString();
    const cleanBatchPrefix = batchName.replace(/[^0-9]/g, "").slice(0, 4) || "26";
    let globalTeamIndex = 1;
    const newTeams: ManagementTeam[] = [];

    if (formationMode === "BY_CLASS") {
      // Group students by class
      availableClasses.forEach((cls) => {
        const classStudents = students.filter((s) => s.className === cls);
        const adv = getAdvisorForClass(cls);

        // Chunk class students into groups of teamSize
        for (let i = 0; i < classStudents.length; i += teamSize) {
          const chunk = classStudents.slice(i, i + teamSize);
          const teamPadded = String(globalTeamIndex).padStart(2, "0");
          const teamId = `team-${cleanBatchPrefix}-${teamPadded}`;
          const teamCode = `T-${cleanBatchPrefix}${teamPadded}`;

          // Assign guide in round-robin fashion
          const guide = guidesList[(globalTeamIndex - 1) % Math.max(1, guidesList.length)];

          const members: ManagementTeamMember[] = chunk.map((st, mIdx) => ({
            id: st.id,
            roll_number: st.rollNumber,
            full_name: st.fullName,
            role: mIdx === 0 ? "Team Lead" : "Member",
            email: st.email,
          }));

          newTeams.push({
            id: teamId,
            team_id: teamCode,
            name: `${cls} Team ${teamPadded}`,
            batch: batchName,
            class_name: cls,
            advisor_id: adv.id,
            advisor_name: adv.name,
            guide_id: guide?.id || "",
            guide_name: guide?.name || "Unassigned",
            members,
            project: {
              title: `${cls} Project Initiative ${teamPadded}`,
              description: "Final Year Capstone Engineering Project",
              domain: "Computer Science & Engineering",
              status: "In Progress",
              current_stage: "0",
            },
            status: "Active",
            created_at: nowIso,
            last_modified: nowIso,
          });

          globalTeamIndex++;
        }
      });
    } else {
      // Cross-class chunking
      for (let i = 0; i < students.length; i += teamSize) {
        const chunk = students.slice(i, i + teamSize);
        const teamPadded = String(globalTeamIndex).padStart(2, "0");
        const teamId = `team-${cleanBatchPrefix}-${teamPadded}`;
        const teamCode = `T-${cleanBatchPrefix}${teamPadded}`;
        const primaryClass = chunk[0]?.className || availableClasses[0] || "CSE-A";
        const adv = getAdvisorForClass(primaryClass);
        const guide = guidesList[(globalTeamIndex - 1) % Math.max(1, guidesList.length)];

        const members: ManagementTeamMember[] = chunk.map((st, mIdx) => ({
          id: st.id,
          roll_number: st.rollNumber,
          full_name: st.fullName,
          role: mIdx === 0 ? "Team Lead" : "Member",
          email: st.email,
        }));

        newTeams.push({
          id: teamId,
          team_id: teamCode,
          name: `Team ${teamPadded}`,
          batch: batchName,
          class_name: primaryClass,
          advisor_id: adv.id,
          advisor_name: adv.name,
          guide_id: guide?.id || "",
          guide_name: guide?.name || "Unassigned",
          members,
          project: {
            title: `Capstone Initiative ${teamPadded}`,
            description: "Final Year Engineering Project",
            domain: "Computer Science",
            status: "In Progress",
            current_stage: "0",
          },
          status: "Active",
          created_at: nowIso,
          last_modified: nowIso,
        });

        globalTeamIndex++;
      }
    }

    onChangeTeams(newTeams);
    if (newTeams.length > 0) {
      setExpandedTeamId(newTeams[0].id);
    }
  };

  // Auto-distribute guides evenly across all created teams
  const handleAutoDistributeGuides = () => {
    if (teams.length === 0 || guidesList.length === 0) return;
    const updated = teams.map((team, idx) => {
      const guide = guidesList[idx % guidesList.length];
      return {
        ...team,
        guide_id: guide.id,
        guide_name: guide.name,
      };
    });
    onChangeTeams(updated);
  };

  // Change a team's guide
  const handleSelectGuide = (teamId: string, guideId: string) => {
    const selectedGuide = guidesList.find((g) => g.id === guideId);
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          guide_id: selectedGuide?.id || "",
          guide_name: selectedGuide?.name || "Unassigned",
        };
      }
      return t;
    });
    onChangeTeams(updated);
  };

  // Set lead for a member
  const handleSetTeamLead = (teamId: string, memberId: string) => {
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        const updatedMembers = t.members.map((m) => ({
          ...m,
          role: m.id === memberId ? "Team Lead" : "Member",
        }));
        return { ...t, members: updatedMembers };
      }
      return t;
    });
    onChangeTeams(updated);
  };

  // Remove a team
  const handleDeleteTeam = (teamId: string) => {
    onChangeTeams(teams.filter((t) => t.id !== teamId));
  };

  // Add custom manual team
  const handleAddManualTeam = () => {
    const cleanBatchPrefix = batchName.replace(/[^0-9]/g, "").slice(0, 4) || "26";
    const teamPadded = String(teams.length + 1).padStart(2, "0");
    const defaultClass = availableClasses[0] || "CSE-A";
    const adv = getAdvisorForClass(defaultClass);

    const newTeam: ManagementTeam = {
      id: `team-${cleanBatchPrefix}-${teamPadded}`,
      team_id: `T-${cleanBatchPrefix}${teamPadded}`,
      name: `Team ${teamPadded}`,
      batch: batchName,
      class_name: defaultClass,
      advisor_id: adv.id,
      advisor_name: adv.name,
      guide_id: "",
      guide_name: "Unassigned",
      members: [],
      project: {
        title: `Project ${teamPadded}`,
        description: "Capstone project",
        domain: "CSE",
        status: "In Progress",
        current_stage: "0",
      },
      status: "Active",
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    onChangeTeams([newTeam, ...teams]);
    setExpandedTeamId(newTeam.id);
  };

  // Calculate statistics
  const assignedStudentIds = new Set(teams.flatMap((t) => t.members.map((m) => m.id)));
  const unassignedStudentsCount = Math.max(0, students.length - assignedStudentIds.size);
  const teamsWithGuideCount = teams.filter((t) => t.guide_id && t.guide_name !== "Unassigned").length;

  // Filtered teams for display
  const filteredTeams = teams.filter((t) => {
    const matchClass = filterClass === "ALL" || t.class_name === filterClass;
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.team_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.guide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.members.some(
        (m) =>
          m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Configuration & Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-[#034419]" />
              Project Teams Formation & Guide Allocation
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Form capstone teams ({students.length} students), assign team leads, and designate project guides.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-generate toolbar */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-600 font-semibold pl-1">Size:</span>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-bold text-[#034419]"
              >
                <option value={3}>3 / team</option>
                <option value={4}>4 / team (Recommended)</option>
                <option value={5}>5 / team</option>
              </select>

              <select
                value={formationMode}
                onChange={(e) => setFormationMode(e.target.value as any)}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700"
              >
                <option value="BY_CLASS">Within Class</option>
                <option value="CROSS_CLASS">Cross-Class</option>
              </select>

              <button
                type="button"
                onClick={handleAutoGenerateTeams}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate
              </button>
            </div>

            {teams.length > 0 && (
              <button
                type="button"
                onClick={handleAutoDistributeGuides}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#034419] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Distribute Guides
              </button>
            )}

            <button
              type="button"
              onClick={handleAddManualTeam}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Empty Team
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Teams Formed</span>
            <div className="text-lg font-bold text-slate-800">{teams.length} Teams</div>
          </div>
          <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-100">
            <span className="text-xs text-emerald-700 font-medium">Students in Teams</span>
            <div className="text-lg font-bold text-emerald-800">
              {assignedStudentIds.size} / {students.length}
            </div>
          </div>
          <div
            className={`rounded-lg p-3 border ${
              teamsWithGuideCount === teams.length && teams.length > 0
                ? "bg-emerald-50/70 border-emerald-100 text-emerald-800"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <span className="text-xs font-medium text-slate-500">Guides Assigned</span>
            <div className="text-lg font-bold">
              {teamsWithGuideCount} / {teams.length}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Unassigned Students</span>
            <div className="text-lg font-bold text-slate-800">
              {unassignedStudentsCount > 0 ? (
                <span className="text-amber-700 font-bold">{unassignedStudentsCount} remaining</span>
              ) : (
                <span className="text-emerald-700 font-semibold">0 (All in teams)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams, roll numbers, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034419]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Class:</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Classes ({teams.length} teams)</option>
            {availableClasses.map((cls) => {
              const count = teams.filter((t) => t.class_name === cls).length;
              return (
                <option key={cls} value={cls}>
                  {cls} ({count} teams)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Teams Grid / List */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Teams Formed Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Click &quot;Auto-Generate&quot; above to automatically group all {students.length} students into balanced capstone teams of {teamSize}, or add individual teams manually.
          </p>
          <button
            type="button"
            onClick={handleAutoGenerateTeams}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#034419] hover:bg-emerald-900 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Auto-Generate {Math.ceil(students.length / teamSize)} Teams Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((team) => {
            const isExpanded = expandedTeamId === team.id;
            const lead = team.members.find((m) => m.role === "Team Lead");

            return (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
              >
                {/* Team Card Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-[#034419] text-xs">
                      {team.team_id.replace("T-", "")}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{team.name}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-emerald-800">{team.class_name}</span>
                        <span>•</span>
                        <span>{team.members.length} members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTeam(team.id)}
                      className="p-1 text-slate-300 hover:text-red-600 rounded"
                      title="Delete team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Team Details & Guide Assignment */}
                <div className="p-4 space-y-3 bg-slate-50/40">
                  {/* Guide Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Assigned Project Guide
                    </label>
                    <select
                      value={team.guide_id}
                      onChange={(e) => handleSelectGuide(team.id, e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#034419]"
                    >
                      <option value="">-- Assign Project Guide --</option>
                      {guidesList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Members Preview */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span>Members ({team.members.length})</span>
                      <span className="text-[10px] text-slate-400 lowercase italic">
                        click crown to designate team lead
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {team.members.map((member) => {
                        const isLead = member.role === "Team Lead";
                        return (
                          <div
                            key={member.id}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                              isLead
                                ? "bg-amber-50/70 border-amber-200 text-amber-950 font-medium"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <button
                                type="button"
                                onClick={() => handleSetTeamLead(team.id, member.id)}
                                title={isLead ? "Team Lead" : "Make Team Lead"}
                                className={`p-0.5 rounded transition-colors ${
                                  isLead
                                    ? "text-amber-600 hover:text-amber-700"
                                    : "text-slate-300 hover:text-amber-500"
                                }`}
                              >
                                <Crown className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <span className="truncate">{member.full_name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({member.roll_number})
                              </span>
                            </div>

                            {isLead && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex-shrink-0">
                                Lead
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Banner */}
      {teams.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-bold">Teams Required:</span> Please generate or configure teams for the cohort before proceeding to the final review.
          </div>
        </div>
      ) : unassignedStudentsCount > 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-0.5">
            <span className="font-bold">Partial Student Allocation:</span> {unassignedStudentsCount} students are not yet assigned to any team. You may proceed and allocate them later in Management & Control, or regenerate teams now.
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs text-emerald-800">
            <span className="font-bold">All Teams Configured!</span> {teams.length} teams ready with members and guides assigned.
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
          Back to Advisors
        </button>

        <button
          type="button"
          disabled={teams.length === 0}
          onClick={onNext}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
            teams.length > 0
              ? "bg-[#034419] hover:bg-emerald-900 text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Proceed to Review & Create
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
