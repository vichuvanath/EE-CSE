import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 lg:p-12 bg-white rounded-xl border border-dashed border-slate-300 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
