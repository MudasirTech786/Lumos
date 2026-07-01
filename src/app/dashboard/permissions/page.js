"use client";

import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import {
  Plus,
  Search,
  ShieldCheck,
  Pencil,
  Trash2,
  LockKeyhole,
  Sparkles
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import StatsCard from "@/components/ui/StatsCard";

export default function PermissionsPage() {

  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);

  const [editingPermission, setEditingPermission] = useState(null);

  const initialForm = {

    name: "",
  };

  const [form, setForm] = useState(initialForm);

  const confirmDialog = useConfirm();

  // SEARCH DEBOUNCE
  useEffect(() => {

    const timer = setTimeout(() => {

      setDebouncedSearch(search);

      setPage(1);

    }, 300);

    return () => clearTimeout(timer);

  }, [search]);

  // FETCH
  useEffect(() => {

    fetchPermissions();

  }, [debouncedSearch, page]);

  const fetchPermissions = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/permissions?search=${debouncedSearch}&page=${page}`
      );

      setPermissions(
        res.data?.permissions?.data || []
      );

      setLastPage(
        res.data?.permissions?.last_page || 1
      );

    } catch (err) {

      console.log(err.response?.data);

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Fetch Error", message: "Failed to load permissions" });

    } finally {

      setLoading(false);
    }
  };

  // CREATE
  const openCreate = () => {

    setEditingPermission(null);

    setForm(initialForm);

    setOpenModal(true);
  };

  // EDIT
  const openEdit = (permission) => {

    setEditingPermission(permission);

    setForm({

      name: permission.name,
    });

    setOpenModal(true);
  };

  // SAVE
  const handleSubmit = async () => {
    if (!form.name) {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Validation Error", message: "Permission name required" });
      return;
    }

    const isEdit = !!editingPermission;
    const pToastId = progressToast.loading({
      title: isEdit ? "Updating Permission" : "Creating Permission",
      message: isEdit ? "Saving changes..." : "Creating permission...",
    });

    try {
      progressToast.update(pToastId, {
        progress: 50,
        message: isEdit ? "Updating permission..." : "Saving permission...",
      });

      if (isEdit) {
        await api.put(
          `/permissions/${editingPermission.id}`,
          form
        );
      } else {
        await api.post(
          "/permissions",
          form
        );
      }

      setOpenModal(false);
      fetchPermissions();

      progressToast.success(pToastId, {
        title: isEdit ? "Permission Updated" : "Permission Created",
        message: isEdit ? "Permission has been updated." : "Permission has been created.",
      });
    } catch (err) {
      console.log(err.response?.data);

      progressToast.error(pToastId, {
        title: "Operation Failed",
        message: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Permission",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(`/permissions/${id}`),
    });

    if (!ok) return;

    fetchPermissions();
  };

  return (
    <ProtectedPage permission="permissions.view">
      <Layout>

        <div className="space-y-6 pb-10">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

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

                Permission Control

              </div>

              <h1 className="
    mt-4
    text-4xl
    md:text-5xl
    font-black
    tracking-[-0.06em]
    text-gray-900
  ">

                System Permissions

              </h1>

              <p className="
    mt-4
    max-w-3xl
    text-base
    leading-relaxed
    text-gray-500
  ">

                Configure access permissions, operational controls,
                authorization layers and secure workflow management.

              </p>

            </div>

            <button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              New Permission
            </button>

          </div>

          {/* KPI STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatsCard
              icon={<ShieldCheck size={20} />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              accentColor="bg-blue-500"
              value={permissions.length}
              label="Total Permissions"
              chip={{ text: "Active", bg: "bg-green-100", color: "text-green-700" }}
              index={0}
            />

            <StatsCard
              icon={<LockKeyhole size={20} />}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              accentColor="bg-purple-500"
              value="Active"
              label="Security Layer"
              index={1}
            />

            <StatsCard
              icon={<ShieldCheck size={20} />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              accentColor="bg-green-500"
              value="Protected"
              label="Access Control"
              index={2}
            />

            <StatsCard
              icon={<ShieldCheck size={20} />}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              accentColor="bg-amber-500"
              value={permissions.length}
              label="System Permissions"
              chip={{ text: "Live", bg: "bg-blue-100", color: "text-blue-700" }}
              index={3}
            />

          </div>

          {/* SEARCH */}
          <div className="relative">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search permissions..."
              className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-4 transition"
            />

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-sm">

                <thead className="bg-blue-50 border-b border-blue-100">

                  <tr>

                    <th className="p-4 text-left">
                      #
                    </th>

                    <th className="p-4 text-left">
                      Permission Name
                    </th>

                    <th className="p-4 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan={3}
                        className="p-6 text-center text-gray-500"
                      >
                        Loading...
                      </td>

                    </tr>

                  ) : permissions.length === 0 ? (

                    <tr>

                      <td
                        colSpan={3}
                        className="p-6 text-center text-gray-500"
                      >
                        No permissions found
                      </td>

                    </tr>

                  ) : (

                    permissions.map((permission, index) => (

                      <tr
                        key={permission.id}
                        className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                      >

                        <td className="p-4 text-gray-500">

                          {(page - 1) * 10 + index + 1}

                        </td>

                        <td className="p-4">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                              <ShieldCheck size={18} />
                            </div>

                            <div>

                              <p className="font-semibold text-gray-900">
                                {permission.name}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="p-4">

                          <div className="flex justify-end gap-3">

                            <button
                              onClick={() =>
                                openEdit(permission)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(permission.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage(page - 1)
              }
              className="px-4 py-2 border rounded-xl disabled:opacity-40"
            >
              Prev
            </button>

            <span className="text-sm text-gray-500">
              Page {page} / {lastPage}
            </span>

            <button
              disabled={page === lastPage}
              onClick={() =>
                setPage(page + 1)
              }
              className="px-4 py-2 border rounded-xl disabled:opacity-40"
            >
              Next
            </button>

          </div>

          {/* MODAL */}
          {openModal && (

            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">

              <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">

                {/* HEADER */}
                <div className="p-6 border-b border-blue-100 flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">

                      {editingPermission
                        ? "Edit Permission"
                        : "Create Permission"}

                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Configure access permission
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setOpenModal(false)
                    }
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                {/* BODY */}
                <div className="p-6 space-y-5">

                  <Input
                    placeholder="Permission Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                  >

                    {editingPermission
                      ? "Update Permission"
                      : "Create Permission"}

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

// INPUT
function Input(props) {

  return (

    <input
      {...props}
      className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
    />
  );
}

