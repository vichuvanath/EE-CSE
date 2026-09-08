import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { SietLogo } from "@/components/brand/siet-logo";

interface ErrorPageProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

export function ErrorPage({ error, resetErrorBoundary }: ErrorPageProps) {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-['Inter',sans-serif]">
      <div className="mb-8">
        <SietLogo href="/" />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
        An Unexpected Error Occurred
      </h1>

      {error && (
        <div className="bg-rose-50 text-xs text-rose-700 font-mono p-3 rounded-lg border border-rose-200 max-w-md mb-6 break-words">
          {error.message || String(error)}
        </div>
      )}

      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        A runtime issue occurred while loading this view. You can reload the application view to refresh the state.
      </p>

      <button
        type="button"
        onClick={handleReload}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Reload Portal View
      </button>
    </div>
  );
}
