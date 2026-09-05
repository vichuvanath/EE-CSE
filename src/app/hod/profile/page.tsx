"use client";

import React from "react";
import {
  UserCog,
  Building2,
  Mail,
  ShieldCheck,
  GraduationCap,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MonogramAvatar } from "@/components/ui/monogram-avatar";
import { useAuthStore } from "@/stores/auth-store";

export default function HodProfilePage() {
  const { user } = useAuthStore();

  const profileFields = [
    { label: "Full Name", value: user?.full_name || "Dr. R. Venkatesh, M.E., Ph.D.", icon: UserCog },
    { label: "Email", value: user?.email || "venkatesh.hod.cse@siet.ac.in", icon: Mail },
    { label: "Designation", value: "Professor & Head of Department", icon: Award },
    { label: "Department", value: "Computer Science & Engineering", icon: Building2 },
    { label: "Role", value: "Head of Department (HOD)", icon: ShieldCheck },
    { label: "Institution", value: "SIET Autonomous College", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Personal profile and department information."
        breadcrumbs={[
          { label: "HOD Console", href: "/hod/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="max-w-2xl">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-[#1E293B] via-indigo-900 to-indigo-800 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center">
                <MonogramAvatar
                  name={user?.full_name || "HOD"}
                  size="md"
                  variant="teal"
                />
              </div>
            </div>
          </div>

          <div className="pt-14 px-8 pb-8">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {user?.full_name || "Dr. R. Venkatesh, M.E., Ph.D."}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 uppercase">
                HOD
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Head of Department · Computer Science & Engineering
            </p>

            {/* Divider */}
            <hr className="my-6 border-slate-100" />

            {/* Profile Fields */}
            <div className="space-y-5">
              {profileFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                      <Icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">
                        {field.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Institution Info */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mb-4">
            Institution Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">College</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Sri Indu Engineering & Technology (Autonomous)
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Affiliation</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                JNTU Hyderabad / AICTE Approved
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">System</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Project Review Committee (PRC)
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Version</p>
              <p className="text-xs text-slate-700 font-mono font-medium mt-0.5">
                SIET Portal v0.1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
