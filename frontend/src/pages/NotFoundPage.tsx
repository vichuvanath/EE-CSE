import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { SietLogo } from "@/components/brand/siet-logo";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-['Inter',sans-serif]">
      <div className="mb-8">
        <SietLogo href="/" />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0F5132] border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
        404 — Page Not Found
      </h1>

      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        The requested portal endpoint or academic record could not be found. Please return to your active workspace.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to SIET Portal
      </Link>
    </div>
  );
}
