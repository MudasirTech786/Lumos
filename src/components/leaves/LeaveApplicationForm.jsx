"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Coffee,
  Stethoscope,
  AlertTriangle,
  Heart,
  Banknote,
  TreePalm,
  ChevronRight,
  ChevronLeft,
  FileText,
  X,
  Check,
  Clock,
  User,
  Calendar,
  Info,
  Pencil,
} from "lucide-react";
import DateTimePicker from "@/components/ui/DateTimePicker";

const LEAVE_TYPES = [
  {
    value: "Annual",
    label: "Annual Leave",
    icon: TreePalm,
    color: "blue",
    description: "Vacation & personal time off",
  },
  {
    value: "Casual",
    label: "Casual Leave",
    icon: Coffee,
    color: "orange",
    description: "Short-term personal needs",
  },
  {
    value: "Sick",
    label: "Sick Leave",
    icon: Stethoscope,
    color: "red",
    description: "Medical & health reasons",
  },
  {
    value: "Emergency",
    label: "Emergency Leave",
    icon: AlertTriangle,
    color: "amber",
    description: "Unexpected urgent situations",
  },
  {
    value: "Maternity/Paternity",
    label: "Maternity / Paternity",
    icon: Heart,
    color: "pink",
    description: "Parental leave",
  },
  {
    value: "Unpaid",
    label: "Unpaid Leave",
    icon: Banknote,
    color: "gray",
    description: "Leave without pay",
  },
];

const TYPE_COLORS = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-100",
    activeBorder: "border-blue-500",
    icon: "text-blue-600",
    ring: "ring-blue-200",
    text: "text-blue-700",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    activeBg: "bg-orange-100",
    activeBorder: "border-orange-500",
    icon: "text-orange-600",
    ring: "ring-orange-200",
    text: "text-orange-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    activeBg: "bg-red-100",
    activeBorder: "border-red-500",
    icon: "text-red-600",
    ring: "ring-red-200",
    text: "text-red-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    activeBg: "bg-amber-100",
    activeBorder: "border-amber-500",
    icon: "text-amber-600",
    ring: "ring-amber-200",
    text: "text-amber-700",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    activeBg: "bg-pink-100",
    activeBorder: "border-pink-500",
    icon: "text-pink-600",
    ring: "ring-pink-200",
    text: "text-pink-700",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    activeBg: "bg-gray-100",
    activeBorder: "border-gray-400",
    icon: "text-gray-600",
    ring: "ring-gray-200",
    text: "text-gray-700",
  },
};

function calcDays(start, end, halfDay) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  const diff = Math.round((e - s) / 86400000) + 1;
  return halfDay ? Math.max(0.5, diff - 0.5) : diff;
}

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
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const panel = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 28, stiffness: 360, mass: 0.6 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.16 },
  },
};

const slide = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const STEPS = [
  { key: "type", label: "Leave Type", icon: CalendarDays },
  { key: "duration", label: "Duration", icon: Clock },
  { key: "details", label: "Details", icon: FileText },
  { key: "review", label: "Review", icon: Check },
];

export default function LeaveApplicationForm({
  open,
  onClose,
  onSubmit,
  employees = [],
  canApprove = false,
  userName = "",
  initialData = null,
}) {
  const isEdit = !!initialData;

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employee_id: "",
    leave_type: "Annual",
    start_date: "",
    end_date: "",
    half_day: false,
    reason: "",
  });

  useEffect(() => {
    if (open) {
      setStep(0);
      setDir(1);
      setSubmitting(false);

      if (initialData) {
        setForm({
          employee_id: String(initialData.employee_id || ""),
          leave_type: initialData.leave_type || "Annual",
          start_date: initialData.start_date || "",
          end_date: initialData.end_date || "",
          half_day: false,
          reason: initialData.reason || "",
        });
      } else {
        setForm({
          employee_id: "",
          leave_type: "Annual",
          start_date: "",
          end_date: "",
          half_day: false,
          reason: "",
        });
      }
    }
  }, [open, initialData]);

  const update = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const days = calcDays(form.start_date, form.end_date, form.half_day);
  const canNext =
    (step === 0 && form.leave_type) ||
    (step === 1 && form.start_date && form.end_date && days > 0) ||
    (step === 2 && (!canApprove || form.employee_id));
  const selectedType = LEAVE_TYPES.find((t) => t.value === form.leave_type);

  const next = () => {
    if (step < STEPS.length - 1) {
      setDir(1);
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDir(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
        employee_id: canApprove ? form.employee_id : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[#020817]/60 backdrop-blur-md" />

          <motion.div
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-[720px] rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
            style={{ maxHeight: "92vh" }}
          >
            {/* Top accent */}
            <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

            {/* Header */}
            <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {isEdit ? "Edit Leave Request" : "Apply for Leave"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isEdit ? "Update the details of this leave request" : "Fill in the details for your leave request"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-7 py-4 bg-gray-50/60 border-b border-gray-100">
              <div className="flex items-center gap-1">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  const done = i < step;
                  return (
                    <div key={s.key} className="flex items-center flex-1">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            done
                              ? "bg-blue-600 text-white"
                              : active
                                ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {done ? <Check size={14} /> : i + 1}
                        </div>
                        <span
                          className={`text-xs font-medium hidden sm:block transition-colors ${
                            active ? "text-blue-700" : done ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 mx-2 transition-colors ${
                            done ? "bg-blue-300" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 210px)" }}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="p-7"
                >
                  {step === 0 && (
                    <StepLeaveType value={form.leave_type} onChange={(v) => update("leave_type", v)} />
                  )}
                  {step === 1 && (
                    <StepDuration
                      form={form}
                      update={update}
                      days={days}
                      canApprove={canApprove}
                      employees={employees}
                    />
                  )}
                  {step === 2 && (
                    <StepDetails
                      form={form}
                      update={update}
                      canApprove={canApprove}
                      employees={employees}
                      userName={userName}
                    />
                  )}
                  {step === 3 && (
                    <StepReview form={form} days={days} selectedType={selectedType} canApprove={canApprove} employees={employees} userName={userName} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={next}
                    disabled={!canNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-blue-200"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition shadow-lg shadow-blue-200"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        {isEdit ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        {isEdit ? <Pencil size={16} /> : <Check size={16} />}
                        {isEdit ? "Update Leave Request" : "Apply for Leave"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   STEP 1 - Leave Type
   ========================================================= */

function StepLeaveType({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">Select Leave Type</h3>
        <p className="text-sm text-gray-500 mt-1">Choose the type of leave you need</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEAVE_TYPES.map((type) => {
          const Icon = type.icon;
          const colors = TYPE_COLORS[type.color];
          const active = value === type.value;

          return (
            <button
              key={type.value}
              onClick={() => onChange(type.value)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                active
                  ? `${colors.activeBg} ${colors.activeBorder} ring-2 ${colors.ring}`
                  : `bg-white border-gray-200 hover:border-gray-300 hover:shadow-md`
              }`}
            >
              {active && (
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center`}>
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    active ? colors.activeBg : colors.bg
                  }`}
                >
                  <Icon size={20} className={colors.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${active ? "text-gray-900" : "text-gray-700"}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   STEP 2 - Duration
   ========================================================= */

function StepDuration({ form, update, days, canApprove, employees }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">Leave Duration</h3>
        <p className="text-sm text-gray-500 mt-1">Set your leave start and end dates</p>
      </div>

      {/* Employee select for HR */}
      {canApprove && (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Apply For
          </label>
          <select
            value={form.employee_id}
            onChange={(e) => update("employee_id", e.target.value)}
            className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-3.5 text-sm transition bg-white"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Start Date
          </label>
          <DateTimePicker
            dateOnly
            icon={<CalendarDays size={16} />}
            label="From"
            value={form.start_date}
            onChange={(val) => {
              update("start_date", val);
              if (form.end_date && new Date(val) > new Date(form.end_date)) {
                update("end_date", val);
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            End Date
          </label>
          <DateTimePicker
            dateOnly
            icon={<CalendarDays size={16} />}
            label="To"
            value={form.end_date}
            onChange={(val) => update("end_date", val)}
          />
        </div>
      </div>

      {/* Half day toggle + Days count */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => update("half_day", !form.half_day)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
              form.half_day ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                form.half_day ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-700">Half Day</p>
            <p className="text-xs text-gray-400">Apply for a half day on the start date</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{days || "—"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {days === 1 ? "day" : "days"} total
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STEP 3 - Details (Reason)
   ========================================================= */

function StepDetails({ form, update, canApprove, employees, userName }) {
  const reasonLen = (form.reason || "").length;
  const maxLen = 500;

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">Leave Details</h3>
        <p className="text-sm text-gray-500 mt-1">
          Provide a reason for your leave request
        </p>
      </div>

      {/* Employee info (HR view) */}
      {canApprove && form.employee_id && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                Leave Request For
              </p>
              <p className="text-sm font-bold text-blue-900 mt-0.5">
                {employees.find((e) => String(e.id) === String(form.employee_id))?.name || "Employee"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Reason for Leave
          </label>
          <span
            className={`text-xs font-medium ${
              reasonLen > maxLen ? "text-red-500" : "text-gray-400"
            }`}
          >
            {reasonLen}/{maxLen}
          </span>
        </div>
        <textarea
          value={form.reason || ""}
          onChange={(e) => {
            if (e.target.value.length <= maxLen) {
              update("reason", e.target.value);
            }
          }}
          placeholder="Describe the reason for your leave request..."
          rows={5}
          className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 text-sm leading-relaxed transition resize-none placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}

/* =========================================================
   STEP 4 - Review
   ========================================================= */

function StepReview({ form, days, selectedType, canApprove, employees, userName }) {
  const TypeIcon = selectedType?.icon || CalendarDays;
  const colors = TYPE_COLORS[selectedType?.color] || TYPE_COLORS.blue;

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">Review Your Application</h3>
        <p className="text-sm text-gray-500 mt-1">
          Please verify all details before submitting
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200 overflow-hidden">
        {/* Leave type banner */}
        <div className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center`}>
              <TypeIcon size={20} className={colors.icon} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{selectedType?.label}</p>
              <p className="text-xs text-gray-500">Leave Type</p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-6 grid grid-cols-2 gap-5">
          <ReviewField
            icon={<Calendar size={16} />}
            label="Duration"
            value={
              form.start_date && form.end_date
                ? `${fmtDate(form.start_date)} — ${fmtDate(form.end_date)}`
                : "Not set"
            }
          />
          <ReviewField
            icon={<Clock size={16} />}
            label="Total Days"
            value={days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "Not calculated"}
            highlight
          />
          {canApprove && (
            <ReviewField
              icon={<User size={16} />}
              label="Employee"
              value={
                form.employee_id
                  ? employees.find((e) => String(e.id) === String(form.employee_id))?.name || "—"
                  : userName || "—"
              }
            />
          )}
          {form.half_day && (
            <ReviewField
              icon={<Info size={16} />}
              label="Half Day"
              value="Included"
            />
          )}
        </div>
      </div>

      {/* Reason */}
      {form.reason && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Reason
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{form.reason}</p>
        </div>
      )}

      {/* Status notice */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <Clock size={18} className="text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Pending Approval</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Your request will be submitted for HR review and approval
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewField({ icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className={`text-sm font-medium mt-0.5 ${highlight ? "text-blue-700" : "text-gray-800"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
