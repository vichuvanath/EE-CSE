import React from "react";
import { Award, UserCheck } from "lucide-react";
import { formatGuideDisplay } from "@/lib/team-guide";

interface TeamGuideBadgeProps {
  guide?: string | any;
  variant?: "table-cell" | "card" | "inline";
  showRole?: boolean;
}

export function TeamGuideBadge({
  guide,
  variant = "inline",
  showRole = false,
}: TeamGuideBadgeProps) {
  const guideInfo = formatGuideDisplay(guide);
  const isSenthil = guideInfo.name.includes("Senthil");

  if (variant === "table-cell") {
    return (
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSenthil ? "bg-emerald-600" : "bg-teal-500"
            }`}
          />
          <span className="text-xs font-semibold text-slate-800 truncate">
            {guideInfo.name}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 pl-3 truncate">
          {guideInfo.designation}
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
        <div className="p-1.5 rounded-md bg-emerald-100/80 text-emerald-800">
          <Award className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-emerald-950 truncate">
            {guideInfo.name}
          </div>
          <div className="text-[10px] text-emerald-700">
            {showRole ? guideInfo.designation : "PRC Faculty Guide"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
      <UserCheck className="w-3 h-3 text-emerald-700" />
      <span>{guideInfo.name}</span>
    </span>
  );
}

export default TeamGuideBadge;
