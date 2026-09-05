"use client";

import React, { useState } from "react";
import {
  FileUp,
  FileText,
  Presentation,
  Image as ImageIcon,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Upload,
  HardDrive,
  X,
  Loader2,
  FileCheck,
} from "lucide-react";
import { useMyFiles } from "@/hooks/use-student";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { formatFileSize, formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api-client";
import { FileCategory, FileMetadata } from "@/types";

interface CategoryMeta {
  category: FileCategory;
  title: string;
  description: string;
  allowedTypes: string;
  accept: string;
  icon: React.ElementType;
}

const categories: CategoryMeta[] = [
  {
    category: "ABSTRACT",
    title: "1. Abstract Document",
    description: "One-page executive summary outlining problem, proposed solution, and expected outcome.",
    allowedTypes: "PDF (Max 25MB)",
    accept: ".pdf,application/pdf",
    icon: FileText,
  },
  {
    category: "REPORT",
    title: "2. Comprehensive Project Report",
    description: "Complete documentation chapters, IEEE style formatting, literature survey, and architecture.",
    allowedTypes: "PDF (Max 25MB)",
    accept: ".pdf,application/pdf",
    icon: FileCheck,
  },
  {
    category: "PPT",
    title: "3. Presentation Slides (PPT)",
    description: "Review-ready slide deck for PRC Phase I & Phase II committee viva examination.",
    allowedTypes: "PPT / PPTX (Max 25MB)",
    accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    icon: Presentation,
  },
  {
    category: "IMAGE",
    title: "4. Project Images & Architecture Diagrams",
    description: "High-resolution screenshots, block diagrams, CAD models, or hardware test setups.",
    allowedTypes: "PNG / JPG / JPEG (Max 25MB)",
    accept: "image/png,image/jpeg,image/jpg",
    icon: ImageIcon,
  },
];

export default function StudentFilesPage() {
  const { data: filesData, isLoading, error, refetch, uploadFile, isUploading, deleteFile, isDeleting } =
    useMyFiles();

  const [activeUploadCategory, setActiveUploadCategory] = useState<CategoryMeta | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null);

  const files = filesData?.files || [];

  const handleUpload = async () => {
    if (!activeUploadCategory || !selectedFile) return;
    setErrorMessage(null);
    try {
      await uploadFile({
        category: activeUploadCategory.category,
        file: selectedFile,
      });
      setToastMessage(`${activeUploadCategory.title} uploaded successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setActiveUploadCategory(null);
      setSelectedFile(null);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    setErrorMessage(null);
    try {
      await deleteFile(fileToDelete.id);
      setToastMessage(`File "${fileToDelete.original_filename}" removed successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setFileToDelete(null);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Unable to load Project Deliverables"
      />
    );
  }

  // Calculate total uploaded size
  const totalBytes = files.reduce((acc, f) => acc + (f.file_size || 0), 0);
  const quotaBytes = 100 * 1024 * 1024; // 100MB
  const quotaPercent = Math.min(100, Math.round((totalBytes / quotaBytes) * 100));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white text-xs font-medium rounded-xl shadow-lg border border-emerald-700/50 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Project Deliverables & Repository Dossier"
        description="Official upload repository for Review 1, Review 2, and Final Viva Voce evaluation."
        breadcrumbs={[
          { label: "SIET Portal", href: "/student/profile" },
          { label: "Student Workspace", href: "/student/profile" },
          { label: "Project Files" },
        ]}
      />

      {/* Storage Quota Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <HardDrive className="w-4 h-4 text-slate-500" />
            <span>Dossier Storage Allocation</span>
          </div>
          <span className="font-mono text-slate-500">
            {formatFileSize(totalBytes)} of 100 MB used ({quotaPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F5132] transition-all duration-300"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4 CATEGORIES */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const CatIcon = cat.icon;
          const categoryFiles = files.filter((f) => f.category === cat.category);
          const hasUploaded = categoryFiles.length > 0;

          return (
            <div
              key={cat.category}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      hasUploaded
                        ? "bg-emerald-50 text-[#0F5132] border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        {cat.title}
                      </h4>
                      {hasUploaded ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-[#0F5132] border border-emerald-200 uppercase font-mono">
                          Uploaded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase font-mono">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                    <span className="inline-block text-[11px] font-mono text-slate-400 mt-1">
                      Allowed: {cat.allowedTypes}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadCategory(cat);
                    setSelectedFile(null);
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0b3d26] text-white shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {hasUploaded ? "Upload Additional" : "Upload Document"}
                </button>
              </div>

              {/* Uploaded Files Table */}
              {hasUploaded ? (
                <div className="divide-y divide-slate-100 bg-slate-50/40">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-[#0F5132] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {file.original_filename}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {formatFileSize(file.file_size)} • Uploaded{" "}
                            {formatDateTime(file.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 px-6 text-xs text-slate-400 italic bg-slate-50/20">
                  No deliverables submitted under this category yet.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* UPLOAD MODAL */}
      {activeUploadCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Upload Deliverable — {activeUploadCategory.title}
              </h3>
              <button
                onClick={() => setActiveUploadCategory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#0F5132] transition-colors cursor-pointer">
                <input
                  type="file"
                  id="fileUploadInput"
                  accept={activeUploadCategory.accept}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="fileUploadInput"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <FileUp className="w-8 h-8 text-[#0F5132] mb-2" />
                  <span className="text-sm font-semibold text-slate-800">
                    Click to browse or drag file here
                  </span>
                  <span className="text-xs text-slate-400 mt-1 font-mono">
                    {activeUploadCategory.allowedTypes}
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-emerald-700 font-mono mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-emerald-700 hover:text-emerald-900 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveUploadCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#0b3d26] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading Deliverable...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Confirm Deliverable Deletion
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 font-mono">
                {fileToDelete.original_filename}
              </strong>
              ? This will detach the file from your PRC submission dossier.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Keep File
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
