import React from "react";

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 animate-pulse p-4 bg-white rounded-xl border border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="h-24 bg-slate-100 rounded-xl" />
        <div className="h-24 bg-slate-100 rounded-xl" />
        <div className="h-24 bg-slate-100 rounded-xl" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  );
}
