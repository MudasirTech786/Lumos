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
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import StatsCard from "@/components/ui/StatsCard";

import useAuth from "@/hooks/useAuth";

export default function LeavesPage() {

  const { can, user, ready } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const initialForm = {
    employee_id: "",
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: "",
    status: "pending",
  };

  const [form, setForm] = useState(initialForm);

  const confirmDialog = useConfirm();

  // =========================================
  // PERMISSIONS
  // =========================================

  const canView =
    can("leaves.view") ||
    can("leaves.view_own");

  const canCreate =
    can("leaves.create");

  const canApprove =
    can("leaves.approve");

  const canEditAll =
    can("leaves.edit");

  const canDeleteAll =
    can("leaves.delete");

  const canEditOwn =
    can("leaves.edit_own");

  const canDeleteOwn =
    can("leaves.delete_own");

  // =========================================
  // EFFECTS
  // =========================================

  useEffect(() => {

    if (!ready) return;

    fetchLeaves();

    if (canApprove) {
      fetchEmployees();
    }

  }, [ready]);

  // =========================================
  // HELPERS
  // =========================================

  const isOwner = (leave) => {

    return (
      leave.employee?.id ===
      user?.employee?.id
    );
  };

  const canEditLeave = (leave) => {

    if (canEditAll) return true;

    if (
      canEditOwn &&
      isOwner(leave) &&
      leave.status === "pending"
    ) {

      return true;
    }

    return false;
  };

  const canDeleteLeave = (leave) => {

    if (canDeleteAll) return true;

    if (
      canDeleteOwn &&
      isOwner(leave) &&
      leave.status === "pending"
    ) {

      return true;
    }

    return false;
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // FETCH LEAVES
  // =========================================

  const fetchLeaves = async () => {

    try {

      setLoading(true);

      const res = await api.get("/leaves");

      setLeaves(
        res.data?.leaves?.data || []
      );

    } catch {

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Fetch Error", message: "Failed to load leaves" });

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // FETCH EMPLOYEES
  // =========================================

  const fetchEmployees = async () => {

    try {

      const res = await api.get("/employees");

      setEmployees(
        res.data?.employees?.data || []
      );

    } catch { }
  };

  // =========================================
  // FILTER
  // =========================================

  const visibleLeaves = leaves;

  const filtered = visibleLeaves.filter(
    (leave) =>
      leave.employee?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async () => {

    const isEdit = !!editingId;

    const pToastId = progressToast.loading({
      title: isEdit ? "Updating Leave Request" : "Submitting Leave Request",
      message: isEdit ? "Saving changes..." : "Saving request...",
    });

    try {

      progressToast.update(pToastId, {
        progress: 50,
        message: isEdit ? "Saving changes..." : "Saving request...",
      });

      const payload = {

        leave_type:
          form.leave_type,

        start_date:
          form.start_date,

        end_date:
          form.end_date,

        reason:
          form.reason,

        status:
          canApprove
            ? form.status
            : "pending",
      };

      // CREATE
      if (!editingId) {

        payload.employee_id =
          canApprove
            ? form.employee_id
            : user?.employee?.id;
      }

      // UPDATE
      if (editingId) {

        await api.put(
          `/leaves/${editingId}`,
          payload
        );

      } else {

        await api.post(
          "/leaves",
          payload
        );
      }

      progressToast.success(pToastId, {
        title: isEdit ? "Leave Updated" : "Leave Request Submitted",
        message: isEdit ? "Leave request has been updated." : "Your leave request has been submitted.",
      });

      setOpenModal(false);

      setEditingId(null);

      setForm(initialForm);

      fetchLeaves();

    } catch (err) {

      console.log(
        err?.response?.data
      );

      progressToast.error(pToastId, {
        title: "Operation Failed",
        message: err?.response?.data?.message || "Failed",
      });
    }
  };

  // =========================================
  // EDIT
  // =========================================

  const handleEdit = (leave) => {

    if (!canEditLeave(leave)) {

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Validation Error", message: "You cannot edit this leave" });

      return;
    }

    setEditingId(leave.id);

    setForm({

      employee_id:
        leave.employee_id,

      leave_type:
        leave.leave_type,

      start_date:
        leave.start_date,

      end_date:
        leave.end_date,

      reason:
        leave.reason || "",

      status:
        leave.status,
    });

    setOpenModal(true);
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (leave) => {

    if (!canDeleteLeave(leave)) {

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Validation Error", message: "You cannot delete this leave" });

      return;
    }

    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Leave",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(
        `/leaves/${leave.id}`
      ),
    });

    if (!ok) return;

    fetchLeaves();
  };

  // =========================================
  // APPROVE / REJECT
  // =========================================

  const updateStatus = async (
    id,
    status
  ) => {

    if (!canApprove) return;

    const label = status === "approved" ? "Approving" : "Rejecting";

    const pToastId = progressToast.loading({
      title: `${label} Leave`,
      message: "Updating request...",
    });

    try {

      progressToast.update(pToastId, {
        progress: 60,
        message: "Updating request...",
      });

      await api.put(
        `/leaves/${id}`,
        { status }
      );

      progressToast.success(pToastId, {
        title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Leave request has been ${status}.`,
      });

      fetchLeaves();

    } catch {

      progressToast.error(pToastId, {
        title: "Operation Failed",
        message: "Failed to update status",
      });
    }
  };

  // =========================================
  // STATS
  // =========================================

  const approvedLeaves =
    visibleLeaves.filter(
      (l) => l.status === "approved"
    ).length;

  const pendingLeaves =
    visibleLeaves.filter(
      (l) => l.status === "pending"
    ).length;

  const rejectedLeaves =
    visibleLeaves.filter(
      (l) => l.status === "rejected"
    ).length;

  // =========================================
  // LOADING
  // =========================================

  if (!ready) {

    return (
      <Layout>
        <div className="p-10">
          Loading...
        </div>
      </Layout>
    );
  }

  // =========================================
  // ACCESS DENIED
  // =========================================

  if (!canView) {

    return (

      <Layout>

        <div className="bg-white rounded-3xl border border-red-100 p-10 text-center shadow-sm">

          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5">

            <ShieldAlert size={34} />

          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Access Denied
          </h2>

          <p className="text-gray-500 mt-2">
            You do not have permission to access leave management.
          </p>

        </div>

      </Layout>
    );
  }

  return (

    <ProtectedPage permission="leaves.view">

      <Layout>

        <div className="space-y-6 pb-24">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <div className="
    inline-flex
    items-center
    gap-2
    rounded-full
    border
    border-blue-100
    bg-blue-50
    px-4
    py-2
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.22em]
    text-blue-700
  ">

                <Sparkles size={12} />

                Leave Operations

              </div>

              <h1 className="
    mt-4
    text-4xl
    md:text-5xl
    font-black
    tracking-[-0.06em]
    text-gray-900
  ">

                Leave Management

              </h1>

              <p className="
    mt-4
    max-w-3xl
    text-base
    leading-relaxed
    text-gray-500
  ">

                Manage employee leave requests,
                approvals, attendance flow and
                workforce availability.

              </p>

            </div>

            {canCreate && (

              <button
                onClick={() => {

                  setEditingId(null);

                  setForm(initialForm);

                  setOpenModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <Plus size={18} />
                Request Leave
              </button>

            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatsCard
              icon={<CalendarDays size={20} />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              accentColor="bg-blue-500"
              value={visibleLeaves.length}
              label="Total Leave Requests"
              chip={{ text: "This Month", bg: "bg-blue-100", color: "text-blue-700" }}
              index={0}
            />

            <StatsCard
              icon={<CheckCircle2 size={20} />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              accentColor="bg-green-500"
              value={approvedLeaves}
              label="Approved Leaves"
              index={1}
            />

            <StatsCard
              icon={<Clock3 size={20} />}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              accentColor="bg-amber-500"
              value={pendingLeaves}
              label="Pending Requests"
              index={2}
            />

            <StatsCard
              icon={<XCircle size={20} />}
              iconBg="bg-red-100"
              iconColor="text-red-600"
              accentColor="bg-red-500"
              value={rejectedLeaves}
              label="Rejected Requests"
              index={3}
            />

          </div>

          {/* SEARCH */}
          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search leaves..."
              className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-4 transition"
            />

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full text-sm min-w-[1000px]">

                <thead className="bg-blue-50 border-b border-blue-100">

                  <tr>

                    <th className="p-4 text-left">
                      Employee
                    </th>

                    <th className="p-4 text-left">
                      Type
                    </th>

                    <th className="p-4 text-left">
                      Dates
                    </th>

                    <th className="p-4 text-center">
                      Days
                    </th>

                    <th className="p-4 text-center">
                      Status
                    </th>

                    <th className="p-4 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {!loading &&
                    filtered.map((leave) => (

                      <tr
                        key={leave.id}
                        className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                      >

                        <td className="p-4 font-medium">
                          {leave.employee?.name}
                        </td>

                        <td className="p-4">
                          {leave.leave_type}
                        </td>

                        <td className="p-4">

                          <div className="flex flex-col">

                            <span>
                              {formatDate(
                                leave.start_date
                              )}
                            </span>

                            <span className="text-xs text-gray-400">
                              to {formatDate(
                                leave.end_date
                              )}
                            </span>

                          </div>

                        </td>

                        <td className="p-4 text-center">
                          {leave.total_days}
                        </td>

                        <td className="p-4 text-center">

                          <StatusBadge
                            status={leave.status}
                          />

                        </td>

                        <td className="p-4">

                          <div className="flex justify-end gap-2 flex-wrap">

                            {canApprove &&
                              leave.status === "pending" && (

                                <>
                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        leave.id,
                                        "approved"
                                      )
                                    }
                                    className="px-3 py-1 rounded-xl bg-green-100 text-green-700 text-xs font-medium"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        leave.id,
                                        "rejected"
                                      )
                                    }
                                    className="px-3 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-medium"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                            {canEditLeave(leave) && (

                              <button
                                onClick={() =>
                                  handleEdit(
                                    leave
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil size={16} />
                              </button>

                            )}

                            {canDeleteLeave(leave) && (

                              <button
                                onClick={() =>
                                  handleDelete(
                                    leave
                                  )
                                }
                                disabled={
                                  loadingId ===
                                  leave.id
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* MODAL */}
          {openModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

              <div
                onClick={() => {

                  setOpenModal(false);

                  setEditingId(null);

                  setForm(initialForm);
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />

              <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="p-5 border-b border-blue-100 flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId
                        ? "Edit Leave"
                        : "Request Leave"}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Submit leave request
                    </p>

                  </div>

                  <button
                    onClick={() => {

                      setOpenModal(false);

                      setEditingId(null);

                      setForm(initialForm);
                    }}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                {/* BODY */}
                <div className="p-5 space-y-5">

                  {/* EMPLOYEE SELECT ONLY WHILE CREATING */}
                  {canApprove && !editingId && (

                    <select
                      value={form.employee_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          employee_id:
                            e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
                    >

                      <option value="">
                        Select Employee
                      </option>

                      {employees.map((e) => (

                        <option
                          key={e.id}
                          value={e.id}
                        >
                          {e.name}
                        </option>

                      ))}

                    </select>

                  )}

                  {/* EMPLOYEE INFO DURING EDIT */}
                  {editingId && (

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4">

                      <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                        Employee
                      </p>

                      <p className="text-sm font-semibold text-blue-900 mt-1">
                        {
                          leaves.find(
                            (l) => l.id === editingId
                          )?.employee?.name
                        }
                      </p>

                    </div>

                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                      placeholder="Leave Type"
                      value={form.leave_type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          leave_type:
                            e.target.value,
                        })
                      }
                    />

                    {canApprove ? (

                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            status:
                              e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
                      >

                        <option value="pending">
                          Pending
                        </option>

                        <option value="approved">
                          Approved
                        </option>

                        <option value="rejected">
                          Rejected
                        </option>

                      </select>

                    ) : (

                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-4 rounded-2xl text-sm flex items-center">

                        Your leave request will be submitted for approval.

                      </div>

                    )}

                  </div>

                  {/* DATES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        From Date
                      </label>

                      <Input
                        type="date"
                        value={form.start_date}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            start_date:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        To Date
                      </label>

                      <Input
                        type="date"
                        value={form.end_date}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            end_date:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                  </div>

                  {/* REASON */}
                  <textarea
                    placeholder="Reason"
                    value={form.reason ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reason:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 min-h-[120px] transition"
                  />

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                  >
                    {editingId
                      ? "Update Leave"
                      : "Submit Leave Request"}
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>

      </Layout>

    </ProtectedPage>
  );
}

// =========================================
// STATUS BADGE
// =========================================

function StatusBadge({ status }) {

  return (

    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${status === "approved"
        ? "bg-green-100 text-green-700 border-green-200"
        : status === "rejected"
          ? "bg-red-100 text-red-700 border-red-200"
          : "bg-yellow-100 text-yellow-700 border-yellow-200"
        }`}
    >
      {status}
    </span>
  );
}

// =========================================
// INPUT
// =========================================

function Input({
  className = "",
  value = "",
  ...props
}) {

  return (

    <input
      {...props}
      value={value ?? ""}
      className={`w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition ${className}`}
    />
  );
}

