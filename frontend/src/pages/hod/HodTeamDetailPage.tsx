import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Award,
  Calendar,
  Clock,
  FileText,
  GitBranch,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  X,
  FileCode,
  ShieldCheck,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

interface SubmissionItem {
  id: string;
  stage_name: string;
  submission_date: string;
  submission_time: string;
  evaluation_date: string;
  evaluation_time: string;
  evaluated: boolean;
  marks_awarded: number;
  max_marks: number;
  abstract: string;
  description: string;
  github_url?: string;
  demo_url?: string;
  files: { name: string; size: string; type: string }[];
  remarks: string;
}

export function HodTeamDetailPage() {
  const { advisorId, teamId } = useParams<{
    advisorId: string;
    teamId: string;
  }>();

  const { selectedBatch } = useHodStore();
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionItem | null>(null);

  // Mock team dossier
  const team = {
    id: teamId || "team-neuro",
    name: "Team NeuroSync (ECE-A)",
    project_title: "Neuromorphic Edge Processor for EEG Spike Detection",
    domain: "Embedded Systems & Artificial Intelligence",
    advisor: "Dr. A. Nandhini, M.E., Ph.D. (Professor)",
    guide: {
      name: "Dr. V. Rajesh, M.E., Ph.D.",
      designation: "Associate Professor",
      department: "Electronics & Communication Engineering",
      email: "rajesh.v@siet.ac.in",
      specialization: "VLSI Architecture & Neuromorphic Computing",
      teams_mentoring: 3,
    },
    // STRICT CONSTRAINT: Clean roster of 4 student members, NO leader designation
    members: [
      {
        name: "Aravind R",
        reg_no: "25EC001",
        department: "ECE",
        batch: selectedBatch,
        email: "25ec001@siet.ac.in",
      },
      {
        name: "Bhavana S",
        reg_no: "25EC014",
        department: "ECE",
        batch: selectedBatch,
        email: "25ec014@siet.ac.in",
      },
      {
        name: "Dinesh K",
        reg_no: "25EC028",
        department: "ECE",
        batch: selectedBatch,
        email: "25ec028@siet.ac.in",
      },
      {
        name: "Harini M",
        reg_no: "25EC042",
        department: "ECE",
        batch: selectedBatch,
        email: "25ec042@siet.ac.in",
      },
    ],
  };

  const submissions: SubmissionItem[] = [
    {
      id: "sub-1",
      stage_name: "Stage 1: Problem Definition & Literature Survey",
      submission_date: "12 Jul 2026",
      submission_time: "15:30",
      evaluation_date: "14 Jul 2026",
      evaluation_time: "11:00",
      evaluated: true,
      marks_awarded: 9.5,
      max_marks: 10,
      abstract:
        "Comprehensive literature survey on asynchronous spiking neural networks for ultra-low power EEG biometric signal classification.",
      description:
        "Reviewed 14 peer-reviewed IEEE Transactions publications focusing on neuromorphic event-based processing. System constraints benchmarked against 65nm CMOS.",
      github_url: "https://github.com/siet-ece/neurosync-core",
      files: [
        { name: "Literature_Survey_Stage1.pdf", size: "2.4 MB", type: "PDF" },
        { name: "Scopus_Bibliography_Index.docx", size: "480 KB", type: "DOCX" },
      ],
      remarks: "Thorough literature review. Problem definition approved by PRC.",
    },
    {
      id: "sub-2",
      stage_name: "Stage 2: System Architecture & Design",
      submission_date: "08 Aug 2026",
      submission_time: "17:15",
      evaluation_date: "10 Aug 2026",
      evaluation_time: "14:30",
      evaluated: true,
      marks_awarded: 14.0,
      max_marks: 15,
      abstract:
        "Complete structural schematics, neuron crossbar topology, and Verilog RTL component breakdown.",
      description:
        "Includes leaky integrate-and-fire (LIF) neuron mathematical models, synapse array routing, and ADC interface circuit simulation in Cadence Virtuoso.",
      github_url: "https://github.com/siet-ece/neurosync-core",
      demo_url: "https://neurosync.siet.ac.in/architecture",
      files: [
        { name: "System_Architecture_Schematics.pdf", size: "5.1 MB", type: "PDF" },
        { name: "Verilog_RTL_Modules.zip", size: "14.2 MB", type: "ZIP" },
      ],
      remarks: "Neuron crossbar design is verified. Power budget meets autonomous guidelines.",
    },
    {
      id: "sub-3",
      stage_name: "Stage 3: Intermediate Implementation & Progress",
      submission_date: "04 Sep 2026",
      submission_time: "16:45",
      evaluation_date: "05 Sep 2026",
      evaluation_time: "11:30",
      evaluated: true,
      marks_awarded: 19.0,
      max_marks: 20,
      abstract:
        "Working FPGA prototype running on Xilinx Artix-7 demonstrating real-time EEG feature extraction.",
      description:
        "Real-time test vectors derived from the PhysioNet EEG dataset streamed via UART at 115200 baud with 96.4% spike detection accuracy.",
      github_url: "https://github.com/siet-ece/neurosync-core",
      demo_url: "https://neurosync.siet.ac.in/demo-v1",
      files: [
        { name: "FPGA_Synthesis_Report.pdf", size: "3.8 MB", type: "PDF" },
        { name: "PhysioNet_Validation_Logs.xlsx", size: "1.2 MB", type: "XLSX" },
      ],
      remarks:
        "Outstanding silicon simulation and FPGA verification. Proceed with packaging and final thesis writeup.",
    },
    {
      id: "sub-4",
      stage_name: "Stage 4: Complete Technical Implementation",
      submission_date: "Pending",
      submission_time: "—",
      evaluation_date: "—",
      evaluation_time: "—",
      evaluated: false,
      marks_awarded: 0,
      max_marks: 25,
      abstract: "Submission scheduled for milestone deadline (25 Sep 2026).",
      description: "Final system integration and PCB enclosure fabrication in progress.",
      files: [],
      remarks: "Milestone deliverable awaited.",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to={`/hod/advisors/${advisorId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#034419] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Advisor Dossier</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 border border-slate-200 text-slate-700">
            Cohort: {selectedBatch}
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 border border-emerald-200/80 text-[#034419]">
            PRC Status: On Track
          </span>
        </div>
      </div>

      {/* 2. Team Master Dossier Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#034419] font-bold">
                PRC PROJECT DOSSIER
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-mono text-slate-400">
                Team ID: {team.id}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 font-['IBM_Plex_Sans',sans-serif]">
              {team.name}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {team.project_title}
            </p>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Domain: {team.domain}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="px-3.5 py-2 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Faculty Advisor
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                {team.advisor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Split: Team Members (Strictly No Leader) & Guide Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Team Members: Clean 4-student roster (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200/90 shadow-none">
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#034419]" />
              <h2 className="text-sm font-bold text-slate-900 font-['IBM_Plex_Sans',sans-serif]">
                Team Member Roster ({team.members.length} Students)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Department Cohort: {selectedBatch}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[10.5px] uppercase font-mono border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">#</th>
                  <th className="py-2.5 px-3.5">Student Name</th>
                  <th className="py-2.5 px-3.5 font-mono">Register Number</th>
                  <th className="py-2.5 px-3.5">Department</th>
                  <th className="py-2.5 px-3.5">Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team.members.map((m, idx) => (
                  <tr key={m.reg_no} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {m.name}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-700">
                      {m.reg_no}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">{m.department}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">
                      {m.batch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Project Guide Card (1 col) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 font-['IBM_Plex_Sans',sans-serif]">
                Assigned Technical Guide
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-[#034419] border border-emerald-200/80">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Guide Name &amp; Designation
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {team.guide.name}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {team.guide.designation} · {team.guide.department}
                </span>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Technical Specialization
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {team.guide.specialization}
                </span>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Contact &amp; Institutional Email
                </span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {team.guide.email}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Faculty Mentoring Quota:</span>
            <span className="font-bold text-slate-800 font-mono">
              {team.guide.teams_mentoring} / 4 Teams
            </span>
          </div>
        </div>
      </div>

      {/* 4. Team Submission & Evaluation History Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-['IBM_Plex_Sans',sans-serif]">
              Team Submission &amp; Milestone Evaluation Log
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chronological records of submitted deliverables and advisor score verification
            </p>
          </div>
        </div>

        {/* Milestone Evaluation Log DataTable with Mantine Row Expansion */}
        <DataTable<SubmissionItem>
          withTableBorder={false}
          withColumnBorders
          records={submissions}
          idAccessor="id"
          noRecordsText="No milestone submissions recorded for this team."
          columns={[
            {
              accessor: "stage_name",
              title: "MILESTONE STAGE",
              render: (sub) => (
                <span className="font-bold text-slate-900">{sub.stage_name}</span>
              ),
            },
            {
              accessor: "submission_date",
              title: "SUBMISSION TIME",
              render: (sub) => (
                <span className="font-mono text-slate-600">
                  {sub.submission_date}{" "}
                  {sub.submission_time !== "—" && `· ${sub.submission_time}`}
                </span>
              ),
            },
            {
              accessor: "evaluation_date",
              title: "EVALUATION TIME",
              render: (sub) => (
                <span className="font-mono text-slate-600">
                  {sub.evaluation_date}{" "}
                  {sub.evaluation_time !== "—" && `· ${sub.evaluation_time}`}
                </span>
              ),
            },
            {
              accessor: "evaluated",
              title: "EVALUATED",
              textAlignment: "center",
              render: (sub) => (
                sub.evaluated ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    YES
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                    NO
                  </span>
                )
              ),
            },
            {
              accessor: "marks_awarded",
              title: "MARKS AWARDED",
              textAlignment: "center",
              render: (sub) => (
                sub.evaluated ? (
                  <span className="text-[#0F5132] font-mono font-bold">
                    {sub.marks_awarded} / {sub.max_marks}
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono">—</span>
                )
              ),
            },
            {
              accessor: "actions",
              title: "DETAILS",
              textAlignment: "right",
              render: (sub) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubmission(sub);
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0F5132] border border-emerald-200 transition cursor-pointer"
                >
                  See
                </button>
              ),
            },
          ]}
          rowExpansion={{
            allowMultiple: true,
            content: ({ record: sub }) => (
              <div className="p-5 bg-[#F8FDF9] space-y-4 border-t border-b border-emerald-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/80 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F5132] font-bold">
                      DELIVERABLE DOSSIER &amp; GRADING DETAILS
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      {sub.stage_name} · {team.name}
                    </h4>
                  </div>
                  <div className="text-left sm:text-right">
                    {sub.evaluated ? (
                      <div className="font-mono text-xs font-bold text-[#0F5132]">
                        Score: {sub.marks_awarded} / {sub.max_marks}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold">
                        Awaiting Advisor Evaluation
                      </span>
                    )}
                  </div>
                </div>

                {/* Abstract & Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                      Deliverable Abstract:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {sub.abstract}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                      Advisor Verification Remarks:
                    </span>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{sub.remarks}"
                    </p>
                  </div>
                </div>

                {/* Files */}
                {sub.files && sub.files.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1.5">
                      Submitted Deliverable Artifacts:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sub.files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-100 bg-white text-xs font-medium text-slate-700"
                        >
                          <FileCode className="w-3.5 h-3.5 text-[#0F5132]" />
                          <span>{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({file.size})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </div>

      {/* 5. Complete Submission Event Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#1E293B] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                  Deliverable Dossier View
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  {selectedSubmission.stage_name}
                </h3>
                <p className="text-xs text-slate-300">{team.name}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Grading Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {selectedSubmission.evaluated
                      ? "Evaluated & Certified by Faculty Advisor"
                      : "Submission Awaiting Advisor Grading"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedSubmission.remarks}
                  </span>
                </div>
                {selectedSubmission.evaluated && (
                  <div className="text-xl font-bold font-mono text-indigo-600">
                    {selectedSubmission.marks_awarded} /{" "}
                    {selectedSubmission.max_marks}
                  </div>
                )}
              </div>

              {/* Abstract */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase font-mono text-[11px] mb-1">
                  Deliverable Abstract
                </h4>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedSubmission.abstract}
                </p>
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase font-mono text-[11px] mb-1">
                  Detailed Technical Progress Description
                </h4>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedSubmission.description}
                </p>
              </div>

              {/* Attachments */}
              {selectedSubmission.files.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase font-mono text-[11px] mb-2">
                    Attached Deliverable Documents
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>{file.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({file.size})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repository & Demo Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {selectedSubmission.github_url && (
                  <a
                    href={selectedSubmission.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>View GitHub Repository</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}

                {selectedSubmission.demo_url && (
                  <a
                    href={selectedSubmission.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Launch Live Demonstration</span>
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
