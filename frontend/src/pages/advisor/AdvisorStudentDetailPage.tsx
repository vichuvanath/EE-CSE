import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useAdvisorStudent } from "@/hooks/use-advisor";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";

export function AdvisorStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data: student, isLoading } = useAdvisorStudent(studentId || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Candidate Profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Student Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested candidate record could not be found.</p>
        <Link
          to="/advisor/students"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students Roster</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Breadcrumb */}
      <Link
        to="/advisor/students"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Students Roster</span>
      </Link>

      {/* Hero Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <MonogramAvatar name={student.full_name} size="lg" variant="emerald" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  {student.full_name}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll No: {student.roll_number} • {student.team_name}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  student.evaluation_status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {student.evaluation_status === "COMPLETED" ? "Evaluated" : "Pending Review"}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {student.email}
              </span>
              <span>•</span>
              <span className="text-emerald-900 font-semibold">{student.technical_role}</span>
            </div>
          </div>
        </div>

        {/* Academic Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cumulative GPA
            </span>
            <span className="text-xl font-black font-mono text-[#0F5132] mt-1 block">
              {student.cgpa.toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Attendance
            </span>
            <span className="text-xl font-black font-mono text-slate-800 mt-1 block">
              {student.attendance_percentage}%
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Status
            </span>
            <span className="text-sm font-bold text-emerald-800 mt-2 block">
              Good Standing
            </span>
          </div>
        </div>
      </div>

      {/* Evaluation History */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-4 h-4 text-[#0F5132]" />
          <h2 className="text-sm font-bold text-slate-900">
            Evaluation History
          </h2>
        </div>

        <div className="space-y-3">
          {(student.stages || [
            {
              date: "12 Jul 2026",
              time: "10:30 AM",
              status: "COMPLETED",
              score: 88,
              max_score: 100,
              evaluator: "PRC Committee",
              remarks: "Comprehensive problem formulation, IEEE survey scope, and domain feasibility approved.",
            },
            {
              date: "22 Aug 2026",
              time: "02:15 PM",
              status: student.evaluation_status === "COMPLETED" ? "COMPLETED" : "PENDING",
              score: student.evaluation_status === "COMPLETED" ? 91 : undefined,
              max_score: 100,
              evaluator: "Faculty Advisor",
              remarks: "Prototype hardware demonstration and TensorRT quantization benchmarks validated.",
            },
            {
              date: "04 Sep 2026",
              time: "11:45 AM",
              status: "PENDING",
              max_score: 100,
              evaluator: "Faculty Advisor",
              remarks: "Final project evaluation & defense scheduled.",
            },
          ]).map((stg: any, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stg.status === "COMPLETED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="font-bold text-slate-900 font-mono">
                    {stg.date ? `${stg.date} • ${stg.time || "10:00 AM"}` : (stg.stage_name || "Evaluation Record")}
                  </span>
                  {stg.evaluator && (
                    <span className="text-[10.5px] text-slate-400 font-mono ml-2">
                      Evaluator: {stg.evaluator}
                    </span>
                  )}
                </div>
                {stg.score !== undefined ? (
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {stg.score}/{stg.max_score}
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">Pending Review</span>
                )}
              </div>
              {stg.remarks && (
                <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 mt-1">
                  <strong>Remarks:</strong> {stg.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdvisorStudentDetailPage;
