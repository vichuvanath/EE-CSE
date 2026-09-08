import React from "react";
import { Link } from "react-router-dom";

interface SietLogoProps {
  collapsed?: boolean;
  href?: string;
  className?: string;
  variant?: "light" | "dark";
}

export function SietLogo({
  collapsed = false,
  href = "/",
  className = "",
  variant = "light",
}: SietLogoProps) {
  const isDark = variant === "dark";

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official College Crest Logo from User Asset */}
      <img
        src="/siet-logo.png"
        alt="SIET Official Crest"
        className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
      />

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold text-lg tracking-tight leading-none font-['IBM_Plex_Sans',sans-serif] ${
                isDark ? "text-white" : "text-[#034419]"
              }`}
            >
              SIET <span className="text-[#FACC15]">LMS</span>
            </span>
          </div>
          <span
            className={`text-[10px] font-bold font-mono tracking-wider uppercase mt-1 ${
              isDark ? "text-emerald-200/80" : "text-emerald-800"
            }`}
          >
            Autonomous · Academic Portal
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

export default SietLogo;
