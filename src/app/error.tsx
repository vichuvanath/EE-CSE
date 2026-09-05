"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { SietLogo } from "@/components/brand/siet-logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Portal Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-['Inter',sans-serif]">
      <div className="mb-6">
        <SietLogo />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
        An Unexpected Error Occurred
      </h1>
      <p className="text-xs text-rose-600 max-w-md mt-2 font-mono bg-rose-50 p-2.5 rounded border border-rose-200">
        {error.message || "Unknown portal application error"}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Portal View
        </button>
      </div>
    </div>
  );
}
