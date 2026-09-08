import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/api-client";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = "Failed to load data",
  className = "",
}: ErrorStateProps) {
  const message = getErrorMessage(error);

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-rose-200/80 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
        {title}
      </h3>
      <p className="text-sm text-rose-600 max-w-md mb-2 font-mono text-xs bg-rose-50/50 p-2.5 rounded border border-rose-100">
        {message}
      </p>
      <p className="text-xs text-slate-500 mb-4">
        Ensure the FastAPI backend server is running at{" "}
        <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
          http://127.0.0.1:8000
        </code>
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
