import React, { useState, useEffect } from "react";
import {
  X,
  FolderGit2,
  Users,
  UserPlus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Code2,
  ArrowRight,
} from "lucide-react";
import {
  HodManagementService,
  ManagementTeam,
  ManagementAdvisor,
  ManagementGuide,
  ManagementTeamMember,
} from "../../../services/hod-management.service";

interface TeamEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  team: ManagementTeam | null;
  onSaved: () => void;
}

export const TeamEditDrawer: React.FC<TeamEditDrawerProps> = ({
  isOpen,
  onClose,
  team,
  onSaved,
}) => {
  const [advisors, setAdvisors] = useState<ManagementAdvisor[]>([]);
  const [guides, setGuides] = useState<ManagementGuide[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [guideId, setGuideId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [domain, setDomain] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [status, setStatus] = useState<ManagementTeam["status"]>("Active");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [members, setMembers] = useState<ManagementTeamMember[]>([]);

  // New member quick-add
  const [newMemberRoll, setNewMemberRoll] = useState("");
  const [newMemberName, setNewMemberName] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen && team) {
      setAdvisors(HodManagementService.getAdvisors());
      setGuides(HodManagementService.getGuides());

      const batches = HodManagementService.getBatches();
      const clsSet = new Set<string>(["CSE-A", "CSE-B", "CSE-C", "CSE-D", "CSE-E"]);
      batches.forEach((b) => b.classes.forEach((c) => clsSet.add(c.name)));
      setAvailableClasses(Array.from(clsSet));

      setName(team.name);
      setClassName(team.class_name);
      setAdvisorId(team.advisor_id);
      setGuideId(team.guide_id);
      setProjectTitle(team.project.title);
      setProjectDesc(team.project.description);
      setDomain(team.project.domain);
      setCurrentStage(team.project.current_stage);
      setStatus(team.status);
      setGithubUrl(team.project.github_url || "");
      setDemoUrl(team.project.demo_url || "");
      setMembers([...team.members]);

      setNewMemberRoll("");
      setNewMemberName("");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, team]);

  if (!isOpen || !team) return null;

  const handleAddMember = () => {
    if (!newMemberRoll.trim() || !newMemberName.trim()) {
      setErrorMsg("Please provide both roll number and name for the new member.");
      return;
    }
    const newMember: ManagementTeamMember = {
      id: `tm-${Date.now()}`,
      roll_number: newMemberRoll.trim().toUpperCase(),
      full_name: newMemberName.trim(),
      role: members.length === 0 ? "Team Lead" : "Member",
    };
    setMembers([...members, newMember]);
    setNewMemberRoll("");
    setNewMemberName("");
    setErrorMsg("");
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      setErrorMsg("A team must retain at least one team member.");
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleToggleLeader = (id: string) => {
    setMembers(
      members.map((m) => ({
        ...m,
        role: m.id === id ? "Team Lead" : "Member",
      }))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Team Name is required.");
      return;
    }
    if (!projectTitle.trim()) {
      setErrorMsg("Project Title is required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const selectedAdvisor = advisors.find((a) => a.id === advisorId);
      const selectedGuide = guides.find((g) => g.id === guideId);

      const ok = HodManagementService.updateTeam(team.id, {
        name: name.trim(),
        class_name: className,
        advisor_id: advisorId,
        advisor_name: selectedAdvisor ? selectedAdvisor.name : team.advisor_name,
        guide_id: guideId,
        guide_name: selectedGuide ? selectedGuide.name : (guideId ? "Unassigned" : "Unassigned"),
        status,
        members,
        project: {
          ...team.project,
          title: projectTitle.trim(),
          description: projectDesc.trim(),
          domain: domain.trim(),
          current_stage: currentStage,
          github_url: githubUrl.trim(),
          demo_url: demoUrl.trim(),
        },
      });

      if (ok) {
        setSuccessMsg(`Team ${name} specifications and global reassignments saved.`);
        setTimeout(() => {
          setIsSaving(false);
          onSaved();
          onClose();
        }, 600);
      } else {
        setErrorMsg("Failed to update team details.");
        setIsSaving(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px] transition-all">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <FolderGit2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Manage Team & Global Reassignment</h2>
              <p className="text-xs text-emerald-100/80">
                {team.name} • Current Class: {team.class_name} ({team.batch})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
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

          {/* Section 1: Supervision & Class Reassignment */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center justify-between">
              <span>1. Institutional Mentorship & Class Assignment</span>
              <span className="text-[10px] text-emerald-800 font-semibold lowercase">
                updates reflect globally across all portals
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Team Name / Identifier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Team Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive (Archived)</option>
                </select>
              </div>
            </div>

            {/* Change Class Section */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Class Section:</span>
                <span className="text-slate-500 text-[11px]">
                  Current: <strong className="text-slate-800">{team.class_name}</strong>
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Change Class Section
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Change Advisor Section */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Faculty Class Advisor:</span>
                <span className="text-slate-500 text-[11px]">
                  Current: <strong className="text-slate-800">{team.advisor_name}</strong>
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Change Class Advisor
                </label>
                <select
                  value={advisorId}
                  onChange={(e) => setAdvisorId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                >
                  <option value="">-- Select Class Advisor --</option>
                  {advisors.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.name} ({adv.assigned_class || "General"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Change Guide Section */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Project Guide:</span>
                <span className="text-slate-500 text-[11px]">
                  Current: <strong className="text-slate-800">{team.guide_name}</strong>
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Change Project Guide
                </label>
                <select
                  value={guideId}
                  onChange={(e) => setGuideId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                >
                  <option value="">-- Select Project Guide --</option>
                  {guides.map((gd) => (
                    <option key={gd.id} value={gd.id}>
                      {gd.name} ({gd.active_projects_count}/{gd.max_teams_limit} Teams)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Project Specifications */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200">
              2. Capstone Project Specifications
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Smart Agriculture Monitoring"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Abstract / Description
              </label>
              <textarea
                rows={3}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Brief summary of engineering solution and research objectives..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technology Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, IoT"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Milestone Stage
                </label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                >
                  <option value="Proposal & Ideation">Proposal & Ideation</option>
                  <option value="Phase 1 - Architecture & Design">Phase 1 - Architecture & Design</option>
                  <option value="Phase 2 - Implementation">Phase 2 - Implementation</option>
                  <option value="Review 3 — Implementation & Oral Defense">Review 3 — Implementation & Oral Defense</option>
                  <option value="Final Defense Preparation">Final Defense Preparation</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Repository URL (GitHub / GitLab)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Live Prototype / Demo URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Student Members Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Student Members ({members.length})
              </span>
              <span className="text-[11px] text-slate-500">Click role to toggle Team Lead</span>
            </div>

            <div className="space-y-2">
              {members.map((member) => {
                const isLead = member.role === "Team Lead";
                return (
                  <div
                    key={member.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                      isLead ? "bg-amber-50/50 border-amber-300" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => handleToggleLeader(member.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                          isLead
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Click to set as Lead"
                      >
                        {member.role}
                      </button>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{member.full_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{member.roll_number}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Member */}
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1">
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Add Member to Team</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="Roll No (e.g. 25CSE045)"
                  value={newMemberRoll}
                  onChange={(e) => setNewMemberRoll(e.target.value)}
                  className="col-span-2 text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
                <input
                  type="text"
                  placeholder="Full Student Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="col-span-2 text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded px-2.5 py-1.5 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-lg shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
