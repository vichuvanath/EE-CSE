"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { getTeamGuide, formatGuideSubtitle, TeamGuideInfo } from "@/lib/team-guide";

interface TeamGuideBadgeProps {
  guide?: TeamGuideInfo | null;
  team?: any;
  layout?: "compact" | "card" | "inline" | "table-cell" | "header";
  className?: string;
  showIcon?: boolean;
}

export function TeamGuideBadge({
  guide: explicitGuide,
  team,
  layout = "compact",
  className = "",
  showIcon = true,
}: TeamGuideBadgeProps) {
  const guide = explicitGuide || getTeamGuide(team);
  const subtitle = formatGuideSubtitle(guide);

  // Table cell layout: Perfect for evaluation tables
  if (layout === "table-cell") {
    return (
      <div className={`space-y-0.5 ${className}`}>
        <div className="flex items-center gap-1.5">
          {showIcon && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F5132] shrink-0" />
          )}
          <span className="font-bold text-slate-900 text-xs">
            {guide.name}
          </span>
        </div>
        {subtitle && (
          <span className="text-[11px] text-slate-500 font-medium block">
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  // Inline layout: Single line with dot separator
  if (layout === "inline") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs text-slate-700 ${className}`}>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Guide:
        </span>
        <span className="font-bold text-slate-900">{guide.name}</span>
        {subtitle && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">{subtitle}</span>
          </>
        )}
      </div>
    );
  }

  // Header banner layout: Highlighted at the top of history / records view
  if (layout === "header") {
    return (
      <div
        className={`p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0F5132] text-white shrink-0 shadow-2xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#0F5132] uppercase tracking-wider block">
              Assigned Faculty Guide
            </span>
            <span className="text-sm font-bold text-slate-900 block font-['Plus_Jakarta_Sans',sans-serif]">
              {guide.name}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-800 block">
            {guide.designation}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            Department of {guide.department}
          </span>
        </div>
      </div>
    );
  }

  // Card layout: Detailed card for workspace and modals
  if (layout === "card") {
    return (
      <div
        className={`p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#0F5132]" />
            Assigned Guide
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#0F5132] border border-emerald-200 font-semibold">
            {guide.department}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            {guide.name}
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {guide.designation}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Department of {guide.department}
          </p>
        </div>
      </div>
    );
  }

  // Default compact layout
  return (
    <div className={`space-y-0.5 ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        Guide
      </span>
      <span className="text-xs font-bold text-slate-900 block">
        {guide.name}
      </span>
      {subtitle && (
        <span className="text-[11px] text-slate-500 font-medium block">
          {subtitle}
        </span>
      )}
    </div>
  );
}
