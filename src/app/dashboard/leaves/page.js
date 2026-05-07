"use client";

import Layout from "@/components/Layout";

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
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import toast from "react-hot-toast";

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

  // =========================
  // PERMISSIONS
  // =========================

  const canView = can("leaves.view");
  const canCreate = can("leaves.create");
  const canEdit = can("leaves.edit");
  const canDelete = can("leaves.delete");
  const canApprove = can("leaves.approve");

  // =========================
  // EFFECTS
  // =========================

  useEffect(() => {

    if (!ready) return;

    fetchLeaves();

    if (canApprove) {
      fetchEmployees();
    }

  }, [ready]);

  // =========================
  // FORMAT DATE
  // =========================

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

  // =========================
  // FETCH LEAVES
  // =========================

  const fetchLeaves = async () => {

    try {

      setLoading(true);

      const res = await api.get("/leaves");

      setLeaves(
        res.data?.leaves?.data || []
      );

    } catch {

      toast.error("Failed to load leaves");

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = async () => {

    try {

      const res = await api.get("/employees");

      setEmployees(
        res.data?.employees?.data || []
      );

    } catch {}
  };

  // =========================
  // FILTER
  // =========================

  const visibleLeaves = canApprove
    ? leaves
    : leaves.filter(
        (leave) =>
          leave.employee?.email === user?.email
      );

  // =========================
  // SEARCH
  // =========================

  const filtered = visibleLeaves.filter(
    (leave) =>
      leave.employee?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {

    try {

      const payload = {

        ...form,

        employee_id: canApprove
          ? form.employee_id
          : user?.employee?.id,

        status: canApprove
          ? form.status
          : "pending",
      };

      if (editingId) {

        await api.put(
          `/leaves/${editingId}`,
          payload
        );

        toast.success("Leave updated");

      } else {

        await api.post(
          "/leaves",
          payload
        );

        toast.success(
          "Leave request submitted"
        );
      }

      setOpenModal(false);

      setEditingId(null);

      setForm(initialForm);

      fetchLeaves();

    } catch (err) {

      console.log(
        err?.response?.data
      );

      toast.error(
        err?.response?.data?.message ||
        "Failed"
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (leave) => {

    if (!canEdit) return;

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

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {

    if (!canDelete) return;

    if (!confirm("Delete leave?"))
      return;

    try {

      setLoadingId(id);

      await api.delete(
        `/leaves/${id}`
      );

      toast.success("Deleted");

      fetchLeaves();

    } catch {

      toast.error("Delete failed");

    } finally {

      setLoadingId(null);
    }
  };

  // =========================
  // APPROVE / REJECT
  // =========================

  const updateStatus = async (
    id,
    status
  ) => {

    if (!canApprove) return;

    try {

      await api.put(
        `/leaves/${id}`,
        { status }
      );

      toast.success(
        `Leave ${status}`
      );

      fetchLeaves();

    } catch {

      toast.error(
        "Failed to update status"
      );
    }
  };

  // =========================
  // STATS
  // =========================

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

  // =========================
  // LOADING
  // =========================

  if (!ready) {

    return (
      <Layout>
        <div className="p-10">
          Loading...
        </div>
      </Layout>
    );
  }

  // =========================
  // ACCESS DENIED
  // =========================

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

    <Layout>

      <div className="space-y-6 pb-24">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Leaves
            </h1>

            <p className="text-gray-500 mt-2">
              Manage employee leave requests
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

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            title="Total Leaves"
            value={visibleLeaves.length}
            icon={<CalendarDays size={18} />}
          />

          <StatCard
            title="Approved"
            value={approvedLeaves}
            icon={<CheckCircle2 size={18} />}
          />

          <StatCard
            title="Pending"
            value={pendingLeaves}
            icon={<Clock3 size={18} />}
          />

          <StatCard
            title="Rejected"
            value={rejectedLeaves}
            icon={<XCircle size={18} />}
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

                          {canEdit && (

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

                          {canDelete && (

                            <button
                              onClick={() =>
                                handleDelete(
                                  leave.id
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

                {canApprove && (

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
  );
}

// STATUS BADGE
function StatusBadge({ status }) {

  return (

    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        status === "approved"
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

// STAT CARD
function StatCard({
  title,
  value,
  icon,
}) {

  return (

    <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </h3>

        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
  );
}

// INPUT
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