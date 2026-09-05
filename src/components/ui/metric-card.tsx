"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    label: string;
    positive?: boolean;
  };
  variant?: "default" | "emerald" | "amber" | "teal";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className = "",
}: MetricCardProps) {
  const iconBg = {
    default: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-[#0F5132] border border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    teal: "bg-teal-50 text-[#216963] border border-teal-100",
  }[variant];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trend.positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.label}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
