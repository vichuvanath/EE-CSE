import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Users,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  HodManagementService,
  ManagementAdvisor,
  ManagementTeam,
} from "../../../services/hod-management.service";

interface AdvisorReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisor: ManagementAdvisor | null;
  onSuccess: () => void;
}

export const AdvisorReassignModal: React.FC<AdvisorReassignModalProps> = ({
  isOpen,
  onClose,
  advisor,
  onSuccess,
}) => {
  const [assignedTeams, setAssignedTeams] = useState<ManagementTeam[]>([]);
  const [otherAdvisors, setOtherAdvisors] = useState<ManagementAdvisor[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<Record<string, string>>({});
  const [bulkAdvisorId, setBulkAdvisorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && advisor) {
      const allTeams = HodManagementService.getTeams();
      const advTeams = allTeams.filter(
        (t) => (t.advisor_id === advisor.id || t.advisor_name === advisor.name) && t.status === "Active"
      );
      setAssignedTeams(advTeams);

      const allAdvisors = HodManagementService.getAdvisors();
      const others = allAdvisors.filter((a) => a.id !== advisor.id && a.status === "Active");
      setOtherAdvisors(others);

      // Initialize team assignments mapping
      const initialMap: Record<string, string> = {};
      const defaultNewAdv = others[0]?.id || "";
      advTeams.forEach((t) => {
        initialMap[t.id] = defaultNewAdv;
      });
      setTeamAssignments(initialMap);
      setBulkAdvisorId(defaultNewAdv);
      setErrorMsg("");
    }
  }, [isOpen, advisor]);

  if (!isOpen || !advisor) return null;

  const handleBulkApply = () => {
    if (!bulkAdvisorId) return;
    const updated: Record<string, string> = {};
    assignedTeams.forEach((t) => {
      updated[t.id] = bulkAdvisorId;
    });
    setTeamAssignments(updated);
  };

  const handleSelectAdvisorForTeam = (teamId: string, newAdvId: string) => {
    setTeamAssignments((prev) => ({
      ...prev,
      [teamId]: newAdvId,
    }));
  };

  const handleReassignAndDeactivate = (deactivateAfter: boolean) => {
    // Validate that every team has a valid new advisor selected
    for (const team of assignedTeams) {
      if (!teamAssignments[team.id]) {
        setErrorMsg(`Please select a new advisor for ${team.name}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const reassignments = assignedTeams.map((t) => ({
        teamId: t.id,
        newAdvisorId: teamAssignments[t.id],
      }));

      // 1. Reassign teams
      HodManagementService.reassignAdvisorTeams(advisor.id, reassignments);

      // 2. If requested, deactivate advisor
      if (deactivateAfter) {
        HodManagementService.deactivateAdvisor(advisor.id);
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reassign teams.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 transition-all">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-200 bg-rose-50 text-rose-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Active Teams Deletion Protection</h3>
              <p className="text-xs text-rose-700/80">Mandatory team reassignment required before deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-700 hover:text-rose-900 hover:bg-rose-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Warning Message Box */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>{advisor.name}</strong> currently has{" "}
              <strong>{assignedTeams.length} active capstone team(s)</strong> assigned.
              Institutional governance requires that you reassign these teams to another active advisor before deactivating this advisor.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Bulk Reassign Bar */}
          {otherAdvisors.length > 1 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
              <div className="font-semibold text-slate-700 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-800" />
                <span>Bulk Reassign All Teams To:</span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAdvisorId}
                  onChange={(e) => setBulkAdvisorId(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#034419]"
                >
                  {otherAdvisors.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.name} ({adv.assigned_class || "General"})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkApply}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition-colors"
                >
                  Apply All
                </button>
              </div>
            </div>
          )}

          {/* Teams Reassignment Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Team Name & Project</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Current Advisor</th>
                  <th className="py-2.5 px-3">New Assigned Advisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{team.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{team.project.title}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">{team.class_name}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{advisor.name}</td>
                    <td className="py-2.5 px-3">
                      <select
                        value={teamAssignments[team.id] || ""}
                        onChange={(e) => handleSelectAdvisorForTeam(team.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034419]"
                      >
                        {otherAdvisors.map((adv) => (
                          <option key={adv.id} value={adv.id}>
                            {adv.name} ({adv.assigned_class || "General"})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleReassignAndDeactivate(false)}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Reassign Teams Only
            </button>
            <button
              type="button"
              onClick={() => handleReassignAndDeactivate(true)}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reassign & Deactivate Advisor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
