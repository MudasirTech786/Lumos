import { Info, CheckCheck, AlertTriangle, XCircle, AlertOctagon } from "lucide-react";

export const typeConfig = {
  info: { icon: Info, color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.18)", label: "Info" },
  success: { icon: CheckCheck, color: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.18)", label: "Success" },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.18)", label: "Warning" },
  error: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.18)", label: "Error" },
  critical: { icon: AlertOctagon, color: "#dc2626", bg: "rgba(220,38,38,0.12)", border: "rgba(220,38,38,0.22)", label: "Critical" },
};

export const moduleColors = {
  productions: { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", label: "Productions" },
  inventory: { color: "#f97316", bg: "rgba(249,115,22,0.10)", label: "Inventory" },
  leaves: { color: "#06b6d4", bg: "rgba(6,182,212,0.10)", label: "Leaves" },
  finance: { color: "#10b981", bg: "rgba(16,185,129,0.10)", label: "Finance" },
  users: { color: "#6366f1", bg: "rgba(99,102,241,0.10)", label: "Users" },
  crew: { color: "#ec4899", bg: "rgba(236,72,153,0.10)", label: "Crew" },
  employees: { color: "#14b8a6", bg: "rgba(20,184,166,0.10)", label: "Employees" },
};

export const priorityConfig = {
  low: { color: "#94a3b8", label: "Low" },
  normal: { color: "#3b82f6", label: "Normal" },
  high: { color: "#f59e0b", label: "High" },
  urgent: { color: "#dc2626", label: "Urgent" },
};

export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeAgoLong(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
