import React from "react";

interface MonogramAvatarProps {
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "emerald" | "slate" | "teal";
}

export function MonogramAvatar({
  name,
  size = "md",
  className = "",
  variant = "emerald",
}: MonogramAvatarProps) {
  const initials = (name || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm font-semibold",
    lg: "w-12 h-12 text-base font-bold",
    xl: "w-16 h-16 text-xl font-bold",
  }[size];

  const variantClasses = {
    emerald:
      "bg-gradient-to-br from-[#0F5132] to-[#166534] text-white border border-emerald-700/20 shadow-sm",
    slate:
      "bg-gradient-to-br from-slate-700 to-slate-900 text-white border border-slate-600/20 shadow-sm",
    teal:
      "bg-gradient-to-br from-[#216963] to-[#0f4642] text-white border border-teal-700/20 shadow-sm",
  }[variant];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl select-none shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {initials}
    </div>
  );
}
