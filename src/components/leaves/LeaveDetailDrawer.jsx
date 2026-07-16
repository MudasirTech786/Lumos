"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building2,
  Briefcase,
  Calendar,
  Send,
  CircleDot,
} from "lucide-react";

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    color: "text-amber-700",
    bg: "bg-amber-100",
    border: "border-amber-200",
    icon: Clock,
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    color: "text-green-700",
    bg: "bg-green-100",
    border: "border-green-200",
    icon: CheckCircle2,
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-200",
    icon: XCircle,
    dot: "bg-red-500",
  },
};

const TYPE_COLORS = {
  Annual: { bg: "bg-blue-100", text: "text-blue-700" },
  Casual: { bg: "bg-orange-100", text: "text-orange-700" },
  Sick: { bg: "bg-red-100", text: "text-red-700" },
  Emergency: { bg: "bg-amber-100", text: "text-amber-700" },
  "Maternity/Paternity": { bg: "bg-pink-100", text: "text-pink-700" },
  Unpaid: { bg: "bg-gray-100", text: "text-gray-700" },
};

const drawer = {
  hidden: { x: "100%", opacity: 0.5 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const stagger = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

export default function LeaveDetailDrawer({
  open,
  leave,
  onClose,
  canApprove = false,
  onApprove,
  onReject,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!leave) return null;

  const status = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const typeColor = TYPE_COLORS[leave.leave_type] || TYPE_COLORS.Casual;

  const employee = leave.employee || {};
  const initials = employee.name
    ? employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]">
          {/* Backdrop */}
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-[#020817]/50 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.div
            variants={drawer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 h-full w-full max-w-[540px] bg-white shadow-2xl border-l border-blue-100 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color} border ${status.border}`}>
                    {status.label}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Employee card */}
                <motion.div
                  custom={0}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-2xl border border-blue-100 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-200">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-lg truncate">
                        {employee.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        {employee.department && (
                          <span className="flex items-center gap-1">
                            <Building2 size={13} />
                            {employee.department}
                          </span>
                        )}
                        {employee.designation && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1">
                              <Briefcase size={13} />
                              {employee.designation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Leave details */}
                <motion.div
                  custom={1}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Leave Details
                    </p>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Type + Days row */}
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                        {leave.leave_type}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {leave.total_days}
                        </span>
                        {leave.total_days === 1 ? " day" : " days"}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                          From
                        </p>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {fmtDate(leave.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                          To
                        </p>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {fmtDate(leave.end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    {leave.reason && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                          Reason
                        </p>
                        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {leave.reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                  custom={2}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Approval Timeline
                    </p>
                  </div>
                  <div className="p-5">
                    <ApprovalTimeline status={leave.status} createdAt={leave.created_at} updatedAt={leave.updated_at} />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Actions footer */}
            {canApprove && leave.status === "pending" && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onReject?.(leave)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove?.(leave)}
                    className="flex-[1.5] flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition shadow-lg shadow-green-200"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                </div>
              </div>
            )}

            {/* Employee actions */}
            {!canApprove && leave.status === "pending" && canDelete && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <button
                  onClick={() => onDelete?.(leave)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                >
                  <XCircle size={16} />
                  Cancel Request
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   APPROVAL TIMELINE
   ========================================================= */

function ApprovalTimeline({ status, createdAt, updatedAt }) {
  const steps = [
    {
      label: "Applied",
      sublabel: fmtDateTime(createdAt),
      icon: Send,
      color: "bg-blue-600",
      lineColor: "bg-blue-200",
      active: true,
    },
    {
      label: "Under Review",
      sublabel: status !== "pending" ? fmtDateTime(updatedAt) : "Awaiting review",
      icon: Clock,
      color:
        status === "approved" || status === "rejected"
          ? "bg-blue-600"
          : "bg-amber-500",
      lineColor:
        status === "approved" || status === "rejected"
          ? "bg-blue-200"
          : "bg-gray-200",
      active: true,
    },
    {
      label: status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending Decision",
      sublabel:
        status === "approved" || status === "rejected"
          ? fmtDateTime(updatedAt)
          : "Awaiting decision",
      icon: status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : CircleDot,
      color:
        status === "approved"
          ? "bg-green-600"
          : status === "rejected"
            ? "bg-red-500"
            : "bg-gray-300",
      active: status !== "pending",
    },
  ];

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.active ? step.color : "bg-gray-200"
                }`}
              >
                <Icon
                  size={14}
                  className={step.active ? "text-white" : "text-gray-400"}
                />
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-8 ${step.active ? step.lineColor : "bg-gray-200"}`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-sm font-semibold ${
                  step.active ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  step.active ? "text-gray-500" : "text-gray-300"
                }`}
              >
                {step.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
