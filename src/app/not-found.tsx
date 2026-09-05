"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { SietLogo } from "@/components/brand/siet-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-['Inter',sans-serif]">
      <div className="mb-6">
        <SietLogo />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0F5132] border border-emerald-200 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
        The requested portal endpoint or academic record could not be found. Please return to your active workspace.
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to SIET Portal
        </Link>
      </div>
    </div>
  );
}
