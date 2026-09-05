"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface SietLogoProps {
  collapsed?: boolean;
  href?: string;
  className?: string;
}

export function SietLogo({
  collapsed = false,
  href = "/",
  className = "",
}: SietLogoProps) {
  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* College Crest Icon */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F5132] to-[#0A3622] text-white shadow-md shadow-emerald-950/20 border border-emerald-600/30 shrink-0">
        <GraduationCap className="w-5 h-5 text-emerald-100" />
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
        </span>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none font-['Plus_Jakarta_Sans',sans-serif]">
              SIET <span className="text-[#0F5132]">Portal</span>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-1">
            Autonomous · Academic PM
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
