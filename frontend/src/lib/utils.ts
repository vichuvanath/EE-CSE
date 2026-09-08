import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (!isValid(d)) return dateString;
    return format(d, "dd MMM yyyy, hh:mm a");
  } catch {
    return dateString;
  }
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (!isValid(d)) return dateString;
    return format(d, "dd MMM yyyy");
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
