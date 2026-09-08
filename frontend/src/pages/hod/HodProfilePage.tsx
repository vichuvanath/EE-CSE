import React from "react";
import {
  UserCog,
  Building,
  Mail,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useHodStore } from "@/stores/hod-store";

export function HodProfilePage() {
  const { academicYear } = useHodStore();

  const profile = {
    name: "Dr. R. Venkatesh, M.E., Ph.D.",
    designation: "Professor & Head of Department",
    department: "Computer Science & Engineering / ECE",
    institution: "Sri Indu Engineering & Technology (SIET Autonomous)",
    email: "hod.cse@siet.ac.in",
    employee_id: "SIET-FAC-0012",
    experience: "19 Years Academic & Research Experience",
    research_areas:
      "Distributed Computing, Edge Artificial Intelligence, Autonomous System Rubrics",
    affiliation: "Affiliated to JNTU Hyderabad · Approved by AICTE, New Delhi",
    accreditation: "NAAC 'A+' Grade Accredited · NBA Tier-1 Approved",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* 1. Profile Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#1E293B] via-indigo-900 to-[#1E293B] relative">
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-mono border border-white/20">
            HOD EXECUTIVE IDENTITY
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center font-mono border-4 border-white shadow-lg shrink-0">
                RV
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    {profile.name}
                  </h1>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {profile.designation} · {profile.department}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold self-start sm:self-end">
              Role: HEAD OF DEPARTMENT
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{profile.institution}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-mono">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-mono">Academic Year {academicYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Qualifications & Academic Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Executive Credentials & Authority
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Institutional Faculty ID
              </span>
              <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                {profile.employee_id}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Academic Experience
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {profile.experience}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Specialization & Research Focus
              </span>
              <span className="text-slate-700 mt-0.5 block leading-relaxed">
                {profile.research_areas}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Autonomous Governance & Affiliation
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                University Affiliation
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {profile.affiliation}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Institutional Accreditations
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {profile.accreditation}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Project Review Committee (PRC)
              </span>
              <span className="font-mono text-slate-800 mt-0.5 block">
                System: SIET-PRC-Autonomous-v2.0 (Active)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
