"use client";

import React from "react";

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  className = "",
  size = "md",
}: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        N/A
      </span>
    );
  }

  const normalized = status.toUpperCase().replace(/\s+/g, "_");

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status.replace(/_/g, " ");

  switch (normalized) {
    case "SUBMITTED":
      styles = "bg-emerald-50 text-emerald-800 border-emerald-200";
      label = "Submitted";
      break;
    case "APPROVED":
      styles = "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold";
      label = "Approved";
      break;
    case "PENDING":
    case "IN_PROGRESS":
      styles = "bg-amber-50 text-amber-800 border-amber-200";
      label = normalized === "PENDING" ? "Pending" : "In Progress";
      break;
    case "CHANGES_REQUESTED":
    case "NEEDS_REVISION":
      styles = "bg-orange-50 text-orange-800 border-orange-200";
      label = "Changes Requested";
      break;
    case "REJECTED":
      styles = "bg-rose-50 text-rose-800 border-rose-200";
      label = "Rejected";
      break;
    case "EVALUATED":
      styles = "bg-teal-50 text-teal-800 border-teal-200";
      label = "Evaluated";
      break;
    case "LOCKED":
      styles = "bg-indigo-50 text-indigo-800 border-indigo-200";
      label = "Locked";
      break;
    case "DRAFT":
    case "NOT_SUBMITTED":
    case "NOT_STARTED":
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      label = normalized === "NOT_STARTED" ? "Not Started" : "Draft";
      break;
    default:
      styles = "bg-slate-100 text-slate-700 border-slate-200";
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] font-medium"
      : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide uppercase font-mono ${sizeClasses} ${styles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          normalized === "APPROVED" || normalized === "SUBMITTED"
            ? "bg-emerald-500"
            : normalized === "PENDING" || normalized === "IN_PROGRESS"
            ? "bg-amber-500"
            : normalized === "REJECTED"
            ? "bg-rose-500"
            : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}
