import type { FileKind } from "./types";

export function inferFileKind(fileName: string): FileKind {
  const n = fileName.toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".doc") || n.endsWith(".docx")) return "word";
  if (n.endsWith(".csv")) return "csv";
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return "excel";
  return "other";
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const acceptUpload =
  "application/pdf,.pdf,.doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,.csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
