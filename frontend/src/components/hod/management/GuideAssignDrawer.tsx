import React, { useState, useEffect } from "react";
import {
  X,
  Compass,
  Check,
  AlertCircle,
  Save,
  CheckCircle2,
  FolderGit2,
  Users,
  Search,
} from "lucide-react";
import {
  HodManagementService,
  ManagementGuide,
  ManagementTeam,
} from "../../../services/hod-management.service";

interface GuideAssignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guide: ManagementGuide | null;
  onSaved: () => void;
}

export const GuideAssignDrawer: React.FC<GuideAssignDrawerProps> = ({
  isOpen,
  onClose,
  guide,
  onSaved,
}) => {
  const [allTeams, setAllTeams] = useState<ManagementTeam[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("ALL");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen && guide) {
      const teams = HodManagementService.getTeams();
      setAllTeams(teams);
      setSelectedTeamIds([...guide.assigned_teams]);
      setSearchQuery("");
      setFilterBatch("ALL");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, guide]);

  if (!isOpen || !guide) return null;

  const batches = Array.from(new Set(allTeams.map((t) => t.batch)));

  const filteredTeams = allTeams.filter((team) => {
    const matchesBatch = filterBatch === "ALL" || team.batch === filterBatch;
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.class_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const toggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      if (selectedTeamIds.length >= guide.max_teams_limit) {
        setErrorMsg(`Guide workload limit reached (${guide.max_teams_limit} teams max). Please deselect another team first.`);
        return;
      }
      setErrorMsg("");
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    try {
      const selectedNames = allTeams
        .filter((t) => selectedTeamIds.includes(t.id))
        .map((t) => t.name);

      const ok = HodManagementService.updateGuideTeams(guide.id, selectedTeamIds, selectedNames);
      if (ok) {
        setSuccessMsg(`Assignments updated for ${guide.name} (${selectedTeamIds.length} teams).`);
        setTimeout(() => {
          setIsSaving(false);
          onSaved();
          onClose();
        }, 600);
      } else {
        setErrorMsg("Failed to update guide assignments.");
        setIsSaving(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
      setIsSaving(false);
    }
  };

  const quotaPercent = Math.min(100, Math.round((selectedTeamIds.length / guide.max_teams_limit) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px] transition-all">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-[#034419] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Compass className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Assign Project Teams to Guide</h2>
              <p className="text-xs text-emerald-100/80">Manage capstone mentorship allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Overview & Quota Meter */}
        <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">{guide.name}</div>
              <div className="text-xs text-slate-500 font-medium">{guide.designation} • {guide.department}</div>
              <div className="text-xs text-slate-400 mt-0.5">{guide.email}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-950">
                {selectedTeamIds.length} / {guide.max_teams_limit} Teams
              </div>
              <div className="text-[10px] text-slate-500">Mentorship Quota</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  selectedTeamIds.length >= guide.max_teams_limit ? "bg-amber-600" : "bg-[#034419]"
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Drawer Body Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

          {/* Quick Filter Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
              />
            </div>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
            >
              <option value="ALL">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Teams Selection List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Available Capstone Teams ({filteredTeams.length})
            </div>

            {filteredTeams.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No teams match your search criteria.
              </div>
            ) : (
              filteredTeams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.id);
                const isOtherGuide = team.guide_id && team.guide_id !== guide.id;

                return (
                  <div
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/40"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="space-y-1 flex-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{team.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-600 rounded">
                          {team.class_name} • {team.batch}
                        </span>
                        {isOtherGuide && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            Assigned to: {team.guide_name}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 font-medium line-clamp-1">
                        {team.project.title}
                      </div>

                      <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{team.members.length} Members</span>
                        </span>
                        <span>•</span>
                        <span>Stage: {team.project.current_stage}</span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 mt-1 transition-colors ${
                        isSelected
                          ? "bg-[#034419] border-[#034419] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <strong>{selectedTeamIds.length}</strong> of {guide.max_teams_limit} teams selected
          </div>
          <div className="flex items-center space-x-3">
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
              <span>{isSaving ? "Saving..." : "Save Assignments"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
