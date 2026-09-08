import React, { useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  FileDown,
  Save,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";
import { exportEvaluationSchemePDF } from "@/lib/export-hod-reports";
import { ConfirmationModal } from "@/components/hod/ConfirmationModal";
import { EvaluationScheme, EvaluationStageScheme, EvaluationCriterion } from "@/types/hod";

export function HodEvaluationPage() {
  const {
    academicYear,
    evaluationSchemes,
    activeSchemeId,
    saveEvaluationScheme,
    publishEvaluationScheme,
    archiveEvaluationScheme,
  } = useHodStore();

  const currentScheme =
    evaluationSchemes.find((s) => s.id === activeSchemeId) ||
    evaluationSchemes[0];

  // Local editable draft state
  const [scheme, setScheme] = useState<EvaluationScheme>(
    JSON.parse(JSON.stringify(currentScheme))
  );

  const [selectedStageNumber, setSelectedStageNumber] = useState(1);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Calculate sum of stage weights
  const totalWeightSum = scheme.stages.reduce(
    (acc, stg) => acc + (Number(stg.total_weightage) || 0),
    0
  );
  const isValid100 = totalWeightSum === 100;

  // Selected stage
  const selectedStage =
    scheme.stages.find((s) => s.stage_number === selectedStageNumber) ||
    scheme.stages[0];

  // Handle stage total weight update
  const handleStageWeightChange = (newWeight: number) => {
    setScheme((prev) => ({
      ...prev,
      stages: prev.stages.map((stg) =>
        stg.stage_number === selectedStageNumber
          ? { ...stg, total_weightage: newWeight }
          : stg
      ),
    }));
  };

  // Handle criterion field update
  const handleUpdateCriterion = (
    critId: string,
    field: keyof EvaluationCriterion,
    value: any
  ) => {
    setScheme((prev) => ({
      ...prev,
      stages: prev.stages.map((stg) =>
        stg.stage_number === selectedStageNumber
          ? {
              ...stg,
              criteria: stg.criteria.map((c) =>
                c.id === critId ? { ...c, [field]: value } : c
              ),
            }
          : stg
      ),
    }));
  };

  // Handle adding new criterion
  const handleAddCriterion = () => {
    const newCrit: EvaluationCriterion = {
      id: `crit-${Date.now()}`,
      title: "New Evaluation Metric",
      description: "Define specific rubric directives and scoring guidelines.",
      max_marks: 5,
    };

    setScheme((prev) => ({
      ...prev,
      stages: prev.stages.map((stg) =>
        stg.stage_number === selectedStageNumber
          ? { ...stg, criteria: [...stg.criteria, newCrit] }
          : stg
      ),
    }));
  };

  // Handle deleting criterion
  const handleDeleteCriterion = (critId: string) => {
    setScheme((prev) => ({
      ...prev,
      stages: prev.stages.map((stg) =>
        stg.stage_number === selectedStageNumber
          ? {
              ...stg,
              criteria: stg.criteria.filter((c) => c.id !== critId),
            }
          : stg
      ),
    }));
  };

  // Save changes to store
  const handleSave = () => {
    saveEvaluationScheme({ ...scheme, total_marks: totalWeightSum });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // Confirm publish
  const handleConfirmPublish = () => {
    saveEvaluationScheme({ ...scheme, total_marks: totalWeightSum });
    publishEvaluationScheme(scheme.id);
    setIsPublishModalOpen(false);
  };

  // Confirm archive
  const handleConfirmArchive = () => {
    archiveEvaluationScheme(scheme.id);
    setIsArchiveModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                scheme.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              STATUS: {scheme.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AY {academicYear} Framework
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Formulate Evaluation Criteria & Rubrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative department rubric formulation, stage weight allocations, and PRC quality benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export PDF */}
          <button
            onClick={() => exportEvaluationSchemePDF(scheme)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Export PDF Rubric</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>

          {/* Publish or Archive */}
          {scheme.status !== "ACTIVE" ? (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              disabled={!isValid100}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-xs ${
                isValid100
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-400 cursor-not-allowed"
              }`}
              title={!isValid100 ? "Total weight must equal 100 marks" : ""}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Official Scheme</span>
            </button>
          ) : (
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-xs"
            >
              <Archive className="w-4 h-4" />
              <span>Archive Framework</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved Toast Alert */}
      {isSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Evaluation scheme changes saved successfully!</span>
        </div>
      )}

      {/* 2. Framework Metadata Card & Total Weight Validator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase font-mono mb-1">
              Framework Title
            </label>
            <input
              type="text"
              value={scheme.title}
              onChange={(e) =>
                setScheme((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Dynamic 100-Mark Validator */}
          <div className="shrink-0">
            <label className="block text-[11px] font-bold text-slate-600 uppercase font-mono mb-1">
              Total Weightage Validator
            </label>
            <div
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-mono font-bold ${
                isValid100
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <span>{totalWeightSum} / 100 Marks</span>
              {isValid100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
            </div>
          </div>
        </div>

        {/* HOD Directives Textarea */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase font-mono mb-1">
            Official Evaluation Directives & Instructions to Advisors
          </label>
          <textarea
            rows={2}
            value={scheme.instructions}
            onChange={(e) =>
              setScheme((prev) => ({ ...prev, instructions: e.target.value }))
            }
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide official directives to faculty advisors regarding grading rigour..."
          />
        </div>
      </div>

      {/* 3. Two-Column Authoring Layout (4:8 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Stage Selector */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase font-mono text-slate-400 tracking-wider">
              6 Milestone Stages
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Sum: {totalWeightSum}%
            </span>
          </div>

          {scheme.stages.map((stg) => {
            const isSelected = stg.stage_number === selectedStageNumber;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStageNumber(stg.stage_number)}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                        isSelected
                          ? "bg-indigo-700 text-indigo-100"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      Stage {stg.stage_number}
                    </span>
                    <span
                      className={`text-xs font-bold truncate max-w-[170px] ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {stg.title}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-mono mt-1 ${
                      isSelected ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {stg.criteria.length} Rubric Criteria · Pass: {stg.passing_marks}M
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold font-mono block ${
                      isSelected ? "text-white" : "text-indigo-600"
                    }`}
                  >
                    {stg.total_weightage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column (8 cols): Stage Configuration & Criteria Editor */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Stage Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                ACTIVE STAGE CONFIGURATION
              </span>
              <h2 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Stage {selectedStage.stage_number}: {selectedStage.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 font-mono">
                  Weightage:
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={selectedStage.total_weightage}
                  onChange={(e) =>
                    handleStageWeightChange(Number(e.target.value) || 0)
                  }
                  className="w-16 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs font-mono text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-400">
                Rubric Criteria ({selectedStage.criteria.length} Metrics)
              </h3>

              <button
                onClick={handleAddCriterion}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Criterion</span>
              </button>
            </div>

            {selectedStage.criteria.map((crit, idx) => (
              <div
                key={crit.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={crit.title}
                      onChange={(e) =>
                        handleUpdateCriterion(crit.id, "title", e.target.value)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-mono">Max:</span>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={crit.max_marks}
                        onChange={(e) =>
                          handleUpdateCriterion(
                            crit.id,
                            "max_marks",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-mono text-slate-400">M</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCriterion(crit.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete criterion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={crit.description}
                    onChange={(e) =>
                      handleUpdateCriterion(crit.id, "description", e.target.value)
                    }
                    placeholder="Scoring guideline and directive for this metric..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        title="Publish Official Evaluation Scheme?"
        description="Publishing this framework makes it the binding grading standard for all 12 Faculty Advisors. Previous schemes will be archived."
        confirmText="Publish Framework"
        variant="primary"
      />

      <ConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Archive Evaluation Scheme?"
        description="Archiving this scheme locks all current rubric edits. A new framework can be created or designated as active."
        confirmText="Archive Scheme"
        variant="warning"
      />
    </div>
  );
}
