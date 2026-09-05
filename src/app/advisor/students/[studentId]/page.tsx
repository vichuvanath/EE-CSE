"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  Users,
  ArrowLeft,
  Mail,
  Hash,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useAdvisorStudentDetails } from "@/hooks/use-advisor";
import { PageHeader } from "@/components/layout/page-header";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { StatusBadge } from "@/components/ui/status-badge";

export default function AdvisorStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.studentId;

  const { data: student, isLoading, error, refetch } =
    useAdvisorStudentDetails(studentId);

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Student Dossier"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/advisor/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Roster
        </Link>
      </div>

      <PageHeader
        title={student?.full_name || "Student Candidate Record"}
        description="Official individual student record, team registration, and semester evaluation summary."
        breadcrumbs={[
          { label: "SIET Portal", href: "/advisor/dashboard" },
          { label: "Students", href: "/advisor/students" },
          { label: student?.full_name || "Student" },
        ]}
      />

      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <MonogramAvatar name={student?.full_name} size="xl" variant="teal" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {student?.full_name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                {student?.roll_number}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {student?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={student?.evaluation_status || "PENDING"} />
        </div>
      </div>

      {/* Team & Academic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0F5132]" />
            Team Assignment
          </h3>
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">
              Team Name
            </span>
            <p className="text-base font-bold text-slate-900">
              {student?.team_name || "Registered Team"}
            </p>
          </div>
          {student?.team_id && (
            <Link
              href={`/advisor/teams/${student.team_id}`}
              className="text-xs font-semibold text-[#0F5132] hover:underline block pt-2"
            >
              Open Team Workspace →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#216963]" />
            Individual Evaluation Marks
          </h3>
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">
              Calculated Total Marks
            </span>
            <p className="text-2xl font-bold font-mono text-[#0F5132]">
              {student?.total_marks !== undefined && student?.total_marks !== null
                ? `${student.total_marks} / 100`
                : "Ungraded"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
