import React, { useState } from "react";
import {
  FileText,
  FileCheck,
  Presentation,
  Image as ImageIcon,
  Upload,
  Trash2,
  HardDrive,
  FileUp,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import {
  useStudentFiles,
  useUploadStudentFile,
  useDeleteStudentFile,
} from "@/hooks/use-student";
import { formatFileSize, formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api-client";
import { FileCategory, FileMetadata } from "@/types";
import { toast } from "sonner";

interface CategoryConfig {
  key: FileCategory;
  title: string;
  description: string;
  allowedTypes: string;
  accept: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "ABSTRACT",
    title: "1. Abstract Document",
    description:
      "One-page executive summary outlining problem, proposed solution, and expected outcome.",
    allowedTypes: "PDF (Max 25MB)",
    accept: ".pdf,application/pdf",
    icon: FileText,
  },
  {
    key: "REPORT",
    title: "2. Comprehensive Project Report",
    description:
      "Complete documentation chapters, IEEE style formatting, literature survey, and architecture.",
    allowedTypes: "PDF (Max 25MB)",
    accept: ".pdf,application/pdf",
    icon: FileCheck,
  },
  {
    key: "PPT",
    title: "3. Presentation Slides (PPT)",
    description:
      "Review-ready slide deck for PRC Phase I & Phase II committee viva examination.",
    allowedTypes: "PPT / PPTX (Max 25MB)",
    accept: ".ppt,.pptx,presentation",
    icon: Presentation,
  },
  {
    key: "IMAGE",
    title: "4. Project Images & Architecture Diagrams",
    description:
      "High-resolution screenshots, block diagrams, CAD models, or hardware test setups.",
    allowedTypes: "PNG / JPG / JPEG (Max 25MB)",
    accept: "image/png,image/jpeg,image/jpg",
    icon: ImageIcon,
  },
];

export function StudentFilesPage() {
  const { data: filesData, isLoading, error, refetch } = useStudentFiles();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadStudentFile();
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteStudentFile();

  const [activeUploadCategory, setActiveUploadCategory] = useState<CategoryConfig | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalUsedBytes =
    filesData?.files.reduce((acc, f) => acc + (f.file_size || 0), 0) || 0;
  const maxStorageBytes = 100 * 1024 * 1024; // 100 MB capacity
  const usedPercentage = Math.min(
    100,
    Math.round((totalUsedBytes / maxStorageBytes) * 100)
  );

  const handleUpload = async () => {
    if (!selectedFile || !activeUploadCategory) return;
    setErrorMessage(null);
    try {
      await uploadFile({
        category: activeUploadCategory.key,
        file: selectedFile,
      });
      toast.success(`${activeUploadCategory.title} uploaded successfully.`);
      setActiveUploadCategory(null);
      setSelectedFile(null);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    setErrorMessage(null);
    try {
      await deleteFile(fileToDelete.id);
      toast.success(`File "${fileToDelete.original_filename}" removed successfully.`);
      setFileToDelete(null);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Storage Quota Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <HardDrive className="w-4 h-4 text-[#034419]" />
            <span>Dossier Storage Allocation</span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {formatFileSize(totalUsedBytes)} of 100 MB used ({usedPercentage}%)
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#034419] rounded-full transition-all duration-300"
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
      </div>

      {/* 4 Category Cards */}
      <div className="space-y-3.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const categoryFiles =
            filesData?.files.filter((f) => f.category === cat.key) || [];
          const hasUploaded = categoryFiles.length > 0;

          return (
            <div
              key={cat.key}
              className="bg-white rounded-lg border border-slate-200/90 shadow-none overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-md shrink-0 ${
                      hasUploaded
                        ? "bg-emerald-50 text-[#034419] border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {cat.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                          hasUploaded
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {hasUploaded ? "Uploaded" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Format: {cat.allowedTypes}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadCategory(cat);
                    setSelectedFile(null);
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#034419] hover:bg-[#023312] text-white transition-colors shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {hasUploaded ? "Upload Additional" : "Upload Document"}
                </button>
              </div>

              {/* Uploaded Files Table */}
              {hasUploaded ? (
                <div className="divide-y divide-slate-100 bg-slate-50/30">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#034419] shrink-0" />
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
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 px-4 sm:px-5 text-xs text-slate-400 italic bg-slate-50/20">
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
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Upload Deliverable — {activeUploadCategory.title}
              </h3>
              <button
                onClick={() => setActiveUploadCategory(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="border border-dashed border-slate-300 rounded-lg p-5 text-center hover:border-[#034419] transition-colors cursor-pointer bg-slate-50/50">
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
                  <FileUp className="w-7 h-7 text-[#034419] mb-1.5" />
                  <span className="text-xs font-semibold text-slate-800">
                    Click to browse or drag file here
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {activeUploadCategory.allowedTypes}
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="p-2.5 bg-emerald-50 rounded-md border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-emerald-700 font-mono text-[11px] mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveUploadCategory(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#034419] hover:bg-[#023312] rounded-md transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Confirm Deliverable Deletion
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 font-mono">
                {fileToDelete.original_filename}
              </strong>
              ? This will detach the file from your PRC submission dossier.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Keep File
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
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
