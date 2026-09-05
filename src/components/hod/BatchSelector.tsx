"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { useHodStore } from "@/stores/hod-store";

const BATCHES = [
  { value: "2023-2027", label: "2023–2027" },
  { value: "2024-2028", label: "2024–2028" },
  { value: "2025-2029", label: "2025–2029" },
];

export function BatchSelector() {
  const { selectedBatch, setSelectedBatch } = useHodStore();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
      <select
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
        className="text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 appearance-none cursor-pointer pr-7 transition-colors hover:bg-slate-700"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.4rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.2em 1.2em",
        }}
      >
        {BATCHES.map((b) => (
          <option key={b.value} value={b.value}>
            Batch {b.label}
          </option>
        ))}
      </select>
    </div>
  );
}
