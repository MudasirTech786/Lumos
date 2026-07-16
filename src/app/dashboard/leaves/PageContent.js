"use client";

import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";

import {
  Plus,
  Search,
  Trash2,
  Pencil,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  X,
  Eye,
  Users,
  SlidersHorizontal,
} from "lucide-react";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import StatsCard from "@/components/ui/StatsCard";
import useAuth from "@/hooks/useAuth";
import usePageLoadingOverlay from "@/hooks/usePageLoadingOverlay";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";

import LeaveApplicationForm from "@/components/leaves/LeaveApplicationForm";
import LeaveDetailDrawer from "@/components/leaves/LeaveDetailDrawer";
import ApproveRejectDialog from "@/components/leaves/ApproveRejectDialog";

const LEAVE_TYPES = ["Annual", "Casual", "Sick", "Emergency", "Maternity/Paternity", "Unpaid"];
const STATUSES = ["pending", "approved", "rejected"];

const TYPE_COLORS = {
  Annual: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Casual: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  Sick: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Emergency: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Maternity/Paternity": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  Unpaid: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

export default function LeavesPage() {
  const { can, user, ready } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlay = usePageLoadingOverlay("Loading Leaves...");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  const [detailDrawer, setDetailDrawer] = useState({ open: false, leave: null });
  const [approveDialog, setApproveDialog] = useState({ open: false, mode: "approve", leave: null });

  const confirmDialog = useConfirm();

  // =========================================
  // PERMISSIONS
  // =========================================

  const canView = can("leaves.view") || can("leaves.view_own");
  const canCreate = can("leaves.create");
  const canApprove = can("leaves.approve");
  const canEditAll = can("leaves.edit");
  const canDeleteAll = can("leaves.delete");
  const canEditOwn = can("leaves.edit_own");
  const canDeleteOwn = can("leaves.delete_own");

  // =========================================
  // EFFECTS
  // =========================================

  useEffect(() => {
    if (!ready) return;
    fetchLeaves();
    if (canApprove) fetchEmployees();
  }, [ready]);

  // =========================================
  // HELPERS
  // =========================================

  const isOwner = useCallback(
    (leave) => leave.employee?.id === user?.employee?.id,
    [user]
  );

  const canEditLeave = useCallback(
    (leave) => {
      if (canEditAll) return true;
      if (canEditOwn && isOwner(leave) && leave.status === "pending") return true;
      return false;
    },
    [canEditAll, canEditOwn, isOwner]
  );

  const canDeleteLeave = useCallback(
    (leave) => {
      if (canDeleteAll) return true;
      if (canDeleteOwn && isOwner(leave) && leave.status === "pending") return true;
      return false;
    },
    [canDeleteAll, canDeleteOwn, isOwner]
  );

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const departments = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    leaves.forEach((l) => {
      if (l.employee?.department) set.add(l.employee.department);
    });
    return [...set].sort();
  }, [employees, leaves]);

  // =========================================
  // FETCH
  // =========================================

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaves");
      setLeaves(res.data?.leaves?.data || []);
    } catch {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Fetch Error", message: "Failed to load leaves" });
    } finally {
      setLoading(false);
      overlay.finish();
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data?.employees?.data || []);
    } catch {}
  };

  // =========================================
  // FILTER
  // =========================================

  const filtered = useMemo(() => {
    return leaves.filter((leave) => {
      const matchSearch =
        !search ||
        leave.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
        leave.leave_type?.toLowerCase().includes(search.toLowerCase()) ||
        leave.employee?.department?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = !filterStatus || leave.status === filterStatus;
      const matchType = !filterType || leave.leave_type === filterType;
      const matchDept = !filterDept || leave.employee?.department === filterDept;

      return matchSearch && matchStatus && matchType && matchDept;
    });
  }, [leaves, search, filterStatus, filterType, filterDept]);

  const hasActiveFilters = filterStatus || filterType || filterDept;

  const clearFilters = () => {
    setFilterStatus("");
    setFilterType("");
    setFilterDept("");
    setSearch("");
  };

  // =========================================
  // CREATE / EDIT
  // =========================================

  const handleApplySubmit = async (data) => {
    const pToastId = progressToast.loading({
      title: "Submitting Leave Request",
      message: "Saving your application...",
    });

    try {
      progressToast.update(pToastId, { progress: 50, message: "Processing..." });

      const payload = {
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        status: "pending",
      };

      if (canApprove && data.employee_id) {
        payload.employee_id = data.employee_id;
      } else {
        payload.employee_id = user?.employee?.id;
      }

      await api.post("/leaves", payload);

      progressToast.success(pToastId, {
        title: "Leave Request Submitted",
        message: "Your application has been submitted for review.",
      });

      setShowApplyForm(false);
      fetchLeaves();
    } catch (err) {
      progressToast.error(pToastId, {
        title: "Submission Failed",
        message: err?.response?.data?.message || "Failed to submit leave request",
      });
    }
  };

  const handleEditSubmit = async (data) => {
    if (!editingLeave) return;

    const pToastId = progressToast.loading({
      title: "Updating Leave Request",
      message: "Saving changes...",
    });

    try {
      progressToast.update(pToastId, { progress: 50, message: "Saving..." });

      await api.put(`/leaves/${editingLeave.id}`, {
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
      });

      progressToast.success(pToastId, {
        title: "Leave Updated",
        message: "Leave request has been updated.",
      });

      setShowEditForm(false);
      setEditingLeave(null);
      fetchLeaves();
    } catch (err) {
      progressToast.error(pToastId, {
        title: "Update Failed",
        message: err?.response?.data?.message || "Failed to update leave request",
      });
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (leave) => {
    if (!canDeleteLeave(leave)) {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Not Allowed", message: "You cannot delete this leave" });
      return;
    }

    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Leave Request",
      description: "This action cannot be undone. The leave request will be permanently removed.",
      confirmText: "Delete",
      confirmAction: () => api.delete(`/leaves/${leave.id}`),
    });

    if (!ok) return;
    setDetailDrawer({ open: false, leave: null });
    fetchLeaves();
  };

  // =========================================
  // APPROVE / REJECT
  // =========================================

  const handleApproveConfirm = async (leave, notes) => {
    const pToastId = progressToast.loading({
      title: "Approving Leave",
      message: "Processing approval...",
    });

    try {
      progressToast.update(pToastId, { progress: 60, message: "Updating status..." });

      await api.put(`/leaves/${leave.id}`, { status: "approved" });

      progressToast.success(pToastId, {
        title: "Leave Approved",
        message: `Leave request for ${leave.employee?.name} has been approved.`,
      });

      setApproveDialog({ open: false, mode: "approve", leave: null });
      setDetailDrawer({ open: false, leave: null });
      fetchLeaves();
    } catch {
      progressToast.error(pToastId, {
        title: "Approval Failed",
        message: "Failed to approve leave request",
      });
    }
  };

  const handleRejectConfirm = async (leave, reason) => {
    const pToastId = progressToast.loading({
      title: "Rejecting Leave",
      message: "Processing rejection...",
    });

    try {
      progressToast.update(pToastId, { progress: 60, message: "Updating status..." });

      await api.put(`/leaves/${leave.id}`, { status: "rejected" });

      progressToast.success(pToastId, {
        title: "Leave Rejected",
        message: `Leave request for ${leave.employee?.name} has been rejected.`,
      });

      setApproveDialog({ open: false, mode: "reject", leave: null });
      setDetailDrawer({ open: false, leave: null });
      fetchLeaves();
    } catch {
      progressToast.error(pToastId, {
        title: "Rejection Failed",
        message: "Failed to reject leave request",
      });
    }
  };

  // =========================================
  // STATS
  // =========================================

  const totalLeaves = leaves.length;
  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected").length;

  const today = new Date().toISOString().split("T")[0];
  const employeesOnLeaveToday = leaves.filter(
    (l) => l.status === "approved" && l.start_date <= today && l.end_date >= today
  ).length;

  const approvedToday = leaves.filter(
    (l) => l.status === "approved" && l.updated_at?.startsWith(today)
  ).length;

  // =========================================
  // LOADING / ACCESS DENIED
  // =========================================

  if (!ready) {
    return (
      <Layout>
        <div className="p-10">Loading...</div>
      </Layout>
    );
  }

  if (!canView) {
    return (
      <Layout>
        <div className="bg-white rounded-3xl border border-red-100 p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert size={34} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">
            You do not have permission to access leave management.
          </p>
        </div>
      </Layout>
    );
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      <ProtectedPage permission="leaves.view">
        <Layout>
          <div className="space-y-6 pb-24">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                  <Sparkles size={12} />
                  {canApprove ? "HR Leave Management" : "My Leave Portal"}
                </div>

                <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-[-0.06em] text-gray-900">
                  {canApprove ? "Leave Management" : "My Leaves"}
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-500">
                  {canApprove
                    ? "Review and manage employee leave requests, track attendance, and maintain workforce availability."
                    : "View your leave history, apply for new leave, and track the status of your requests."}
                </p>
              </div>

              {canCreate && (
                <button
                  onClick={() => {
                    setEditingLeave(null);
                    setShowApplyForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-200 font-semibold text-sm"
                >
                  <Plus size={18} />
                  Apply for Leave
                </button>
              )}
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {canApprove ? (
                <>
                  <StatsCard
                    icon={<Clock3 size={20} />}
                    iconBg="bg-amber-100"
                    iconColor="text-amber-600"
                    accentColor="bg-amber-500"
                    value={pendingLeaves}
                    label="Pending Requests"
                    chip={{ text: "Action Needed", bg: "bg-amber-100", color: "text-amber-700" }}
                    index={0}
                  />
                  <StatsCard
                    icon={<CheckCircle2 size={20} />}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    accentColor="bg-green-500"
                    value={approvedLeaves}
                    label="Approved Leaves"
                    chip={{ text: approvedToday > 0 ? `${approvedToday} today` : "All Time", bg: "bg-green-100", color: "text-green-700" }}
                    index={1}
                  />
                  <StatsCard
                    icon={<XCircle size={20} />}
                    iconBg="bg-red-100"
                    iconColor="text-red-600"
                    accentColor="bg-red-500"
                    value={rejectedLeaves}
                    label="Rejected Requests"
                    index={2}
                  />
                  <StatsCard
                    icon={<Users size={20} />}
                    iconBg="bg-indigo-100"
                    iconColor="text-indigo-600"
                    accentColor="bg-indigo-500"
                    value={employeesOnLeaveToday}
                    label="On Leave Today"
                    chip={{ text: "Today", bg: "bg-indigo-100", color: "text-indigo-700" }}
                    index={3}
                  />
                </>
              ) : (
                <>
                  <StatsCard
                    icon={<CalendarDays size={20} />}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    accentColor="bg-blue-500"
                    value={totalLeaves}
                    label="Total Requests"
                    index={0}
                  />
                  <StatsCard
                    icon={<CheckCircle2 size={20} />}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    accentColor="bg-green-500"
                    value={approvedLeaves}
                    label="Approved"
                    index={1}
                  />
                  <StatsCard
                    icon={<Clock3 size={20} />}
                    iconBg="bg-amber-100"
                    iconColor="text-amber-600"
                    accentColor="bg-amber-500"
                    value={pendingLeaves}
                    label="Pending"
                    index={2}
                  />
                  <StatsCard
                    icon={<XCircle size={20} />}
                    iconBg="bg-red-100"
                    iconColor="text-red-600"
                    accentColor="bg-red-500"
                    value={rejectedLeaves}
                    label="Rejected"
                    index={3}
                  />
                </>
              )}
            </div>

            {/* ===== SEARCH + FILTERS ===== */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, type, or department..."
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-3.5 transition text-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-medium transition ${
                    showFilters || hasActiveFilters
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {[filterStatus, filterType, filterDept].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Filter dropdowns */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[160px]">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5 block">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl px-3 py-2.5 text-sm transition bg-white"
                        >
                          <option value="">All Statuses</option>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 min-w-[160px]">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5 block">
                          Leave Type
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl px-3 py-2.5 text-sm transition bg-white"
                        >
                          <option value="">All Types</option>
                          {LEAVE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {canApprove && departments.length > 0 && (
                        <div className="flex-1 min-w-[160px]">
                          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5 block">
                            Department
                          </label>
                          <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl px-3 py-2.5 text-sm transition bg-white"
                          >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                        >
                          <X size={14} />
                          Clear
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ===== TABLE ===== */}
            <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-blue-50/70 border-b border-blue-100">
                    <tr>
                      <th className="p-4 text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Employee
                        </span>
                      </th>
                      <th className="p-4 text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Leave Type
                        </span>
                      </th>
                      <th className="p-4 text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Duration
                        </span>
                      </th>
                      <th className="p-4 text-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Days
                        </span>
                      </th>
                      <th className="p-4 text-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Status
                        </span>
                      </th>
                      <th className="p-4 text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <CalendarDays size={28} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">No leave requests found</p>
                            <p className="text-sm text-gray-300 mt-1">
                              {hasActiveFilters ? "Try adjusting your filters" : "No leave data available"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filtered.map((leave, idx) => {
                        const employee = leave.employee || {};
                        const initials = employee.name
                          ? employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "?";

                        const typeColor = TYPE_COLORS[leave.leave_type] || TYPE_COLORS.Casual;
                        const statusStyle = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;

                        return (
                          <motion.tr
                            key={leave.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.3 }}
                            className="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer group"
                            onClick={() => setDetailDrawer({ open: true, leave })}
                          >
                            {/* Employee */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                    {employee.name || "Unknown"}
                                  </p>
                                  {employee.department && (
                                    <p className="text-xs text-gray-400 truncate">
                                      {employee.department}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
                              >
                                {leave.leave_type}
                              </span>
                            </td>

                            {/* Duration */}
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">
                                  {formatDate(leave.start_date)}
                                </span>
                                <span className="text-xs text-gray-400 mt-0.5">
                                  to {formatDate(leave.end_date)}
                                </span>
                              </div>
                            </td>

                            {/* Days */}
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-sm font-bold text-gray-700 border border-gray-100">
                                {leave.total_days}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                {statusStyle.label}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <div
                                className="flex justify-end gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => setDetailDrawer({ open: true, leave })}
                                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition border border-gray-100 hover:border-blue-200"
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>

                                {canApprove && leave.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => setApproveDialog({ open: true, mode: "approve", leave })}
                                      className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition border border-green-100 hover:border-green-300"
                                      title="Approve"
                                    >
                                      <CheckCircle2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => setApproveDialog({ open: true, mode: "reject", leave })}
                                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition border border-red-100 hover:border-red-300"
                                      title="Reject"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </>
                                )}

                                {canEditLeave(leave) && (
                                  <button
                                    onClick={() => {
                                      setEditingLeave(leave);
                                      setShowEditForm(true);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition border border-gray-100 hover:border-blue-200"
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}

                                {canDeleteLeave(leave) && (
                                  <button
                                    onClick={() => handleDelete(leave)}
                                    className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition border border-gray-100 hover:border-red-200"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedPage>

      {/* ===== LEAVE APPLICATION FORM ===== */}
      <LeaveApplicationForm
        open={showApplyForm}
        onClose={() => setShowApplyForm(false)}
        onSubmit={handleApplySubmit}
        employees={employees}
        canApprove={canApprove}
        userName={user?.employee?.name || user?.name}
      />

      {/* ===== EDIT FORM ===== */}
      <LeaveApplicationForm
        open={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingLeave(null);
        }}
        onSubmit={handleEditSubmit}
        employees={employees}
        canApprove={canApprove}
        userName={user?.employee?.name || user?.name}
        initialData={editingLeave}
      />

      {/* ===== DETAIL DRAWER ===== */}
      <LeaveDetailDrawer
        open={detailDrawer.open}
        leave={detailDrawer.leave}
        onClose={() => setDetailDrawer({ open: false, leave: null })}
        canApprove={canApprove}
        onApprove={(leave) => setApproveDialog({ open: true, mode: "approve", leave })}
        onReject={(leave) => setApproveDialog({ open: true, mode: "reject", leave })}
        onDelete={handleDelete}
        canEdit={detailDrawer.leave ? canEditLeave(detailDrawer.leave) : false}
        canDelete={detailDrawer.leave ? canDeleteLeave(detailDrawer.leave) : false}
      />

      {/* ===== APPROVE / REJECT DIALOG ===== */}
      <ApproveRejectDialog
        open={approveDialog.open}
        mode={approveDialog.mode}
        leave={approveDialog.leave}
        onClose={() => setApproveDialog({ open: false, mode: "approve", leave: null })}
        onConfirm={approveDialog.mode === "approve" ? handleApproveConfirm : handleRejectConfirm}
      />

      <PageLoadingOverlay visible={overlay.visible} overlayRect={overlay.overlayRect} text={overlay.text} />
    </>
  );
}
