import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "warning" | "danger";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {renderIcon()}

          <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            {title}
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-3 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
              }}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition ${getButtonClass()}`}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
