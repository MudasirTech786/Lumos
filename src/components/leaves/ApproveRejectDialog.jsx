"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  X,
  CalendarDays,
  Clock,
  User,
  FileText,
} from "lucide-react";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const dialog = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 340, mass: 0.65 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

export default function ApproveRejectDialog({
  open,
  mode = "approve",
  leave,
  onClose,
  onConfirm,
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const isApprove = mode === "approve";
  const color = isApprove ? "#059669" : "#DC2626";
  const hoverColor = isApprove ? "#047857" : "#B91C1C";
  const Icon = isApprove ? CheckCircle2 : XCircle;

  useEffect(() => {
    if (open) {
      setNotes("");
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(leave, notes);
    } finally {
      setLoading(false);
    }
  };

  if (!leave) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={loading ? undefined : onClose}
        >
          <div className="absolute inset-0 bg-[#020817]/60 backdrop-blur-md" />

          <motion.div
            variants={dialog}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] bg-white rounded-2xl border border-gray-200 overflow-hidden"
            style={{
              boxShadow: "0 24px 64px -16px rgba(15,23,42,0.2), 0 0 0 1px rgba(15,23,42,0.02)",
            }}
          >
            {/* Top accent */}
            <div className="h-[3px] w-full" style={{ backgroundColor: color }} />

            <div className="px-7 pt-7 pb-6">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: isApprove ? "#F0FDF4" : "#FEF2F2",
                    boxShadow: `0 0 0 6px ${isApprove ? "rgba(5,150,105,0.12)" : "rgba(220,38,38,0.12)"}`,
                  }}
                >
                  <Icon size={24} style={{ color }} strokeWidth={2.2} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-lg font-bold text-gray-900 tracking-tight mb-1">
                {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
              </h2>
              <p className="text-center text-sm text-gray-500">
                {isApprove
                  ? "You are about to approve this leave request"
                  : "Provide a reason for rejecting this request"}
              </p>

              {/* Leave info card */}
              <div className="mt-5 bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User size={15} className="text-gray-400" />
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">Employee</p>
                    <p className="text-sm font-semibold text-gray-800">{leave.employee?.name}</p>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays size={14} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide">Duration</p>
                      <p className="text-xs font-medium text-gray-700">
                        {fmtDate(leave.start_date)} — {fmtDate(leave.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide">Days</p>
                      <p className="text-xs font-medium text-gray-700">{leave.total_days} {leave.total_days === 1 ? "day" : "days"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">Type</p>
                    <p className="text-xs font-medium text-gray-700">{leave.leave_type}</p>
                  </div>
                </div>
              </div>

              {/* Notes/Reason textarea */}
              <div className="mt-5 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {isApprove ? "HR Notes (Optional)" : "Reason for Rejection *"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isApprove
                      ? "Add any notes for the employee..."
                      : "Please provide a reason for rejection..."
                  }
                  rows={3}
                  className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl px-4 py-3 text-sm leading-relaxed transition resize-none placeholder:text-gray-300"
                />
              </div>

              {/* Error if reject without reason */}
              {!isApprove && !notes.trim() && (
                <p className="text-xs text-red-500 mt-1">Rejection reason is required</p>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100 my-6" />

              {/* Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={loading || (!isApprove && !notes.trim())}
                  className="flex-[1.4] h-11 rounded-xl text-sm font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 2px 8px ${color}30`,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = color;
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon size={15} strokeWidth={2.2} />
                      {isApprove ? "Approve Request" : "Reject Request"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
