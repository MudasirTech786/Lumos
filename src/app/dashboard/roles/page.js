"use client";

import Layout from "@/components/Layout";

import {
  Plus,
  Search,
  Shield,
  Pencil,
  Trash2,
  KeyRound,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import toast from "react-hot-toast";

export default function RolesPage() {

  const [roles, setRoles] = useState([]);

  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [permLoading, setPermLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);

  const [editingRole, setEditingRole] = useState(null);

  const initialForm = {

    name: "",

    permissions: [],
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {

    const timer = setTimeout(() => {

      setDebouncedSearch(search);

      setPage(1);

    }, 300);

    return () => clearTimeout(timer);

  }, [search]);

  useEffect(() => {

    fetchRoles();

  }, [debouncedSearch, page]);

  useEffect(() => {

    fetchPermissions();

  }, []);

  const fetchRoles = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/roles?search=${debouncedSearch}&page=${page}`
      );

      setRoles(
        res.data?.roles?.data || []
      );

      setLastPage(
        res.data?.roles?.last_page || 1
      );

    } catch (err) {

      console.log(err.response?.data);

      toast.error("Failed to load roles");

    } finally {

      setLoading(false);
    }
  };

  const fetchPermissions = async () => {

    try {

      setPermLoading(true);

      const res = await api.get(
        "/permissions?all=1"
      );

      setPermissions(
        res.data?.permissions || []
      );

    } catch {

      toast.error(
        "Failed to load permissions"
      );

    } finally {

      setPermLoading(false);
    }
  };

  const openCreate = () => {

    setEditingRole(null);

    setForm(initialForm);

    setOpenModal(true);
  };

  const openEdit = (role) => {

    setEditingRole(role);

    setForm({

      name: role.name,

      permissions:
        role.permissions?.map(
          (p) => p.id
        ) || [],
    });

    setOpenModal(true);
  };

  const togglePermission = (id) => {

    setForm((prev) => ({

      ...prev,

      permissions:
        prev.permissions.includes(id)

          ? prev.permissions.filter(
              (p) => p !== id
            )

          : [...prev.permissions, id],
    }));
  };

  const handleSubmit = async () => {

    try {

      if (editingRole) {

        await api.put(
          `/roles/${editingRole.id}`,
          form
        );

        toast.success(
          "Role updated"
        );

      } else {

        await api.post(
          "/roles",
          form
        );

        toast.success(
          "Role created"
        );
      }

      setOpenModal(false);

      fetchRoles();

    } catch (err) {

      console.log(err.response?.data);

      toast.error(
        err.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  const handleDelete = async (id) => {

    if (!confirm("Delete this role?"))
      return;

    try {

      await api.delete(
        `/roles/${id}`
      );

      toast.success(
        "Role deleted"
      );

      fetchRoles();

    } catch {

      toast.error(
        "Delete failed"
      );
    }
  };

  return (

    <Layout>

      <div className="space-y-6 pb-10">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Roles
            </h1>

            <p className="text-gray-500 mt-1">
              Manage system roles & permissions
            </p>

          </div>

          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            New Role
          </button>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">

          <StatCard
            title="Total Roles"
            value={roles.length}
            icon={<Shield size={18} />}
          />

          <StatCard
            title="Permissions"
            value={permissions.length}
            icon={<KeyRound size={18} />}
          />

          <StatCard
            title="Access Control"
            value="Active"
            icon={<Shield size={18} />}
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
            placeholder="Search roles..."
            className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-4 transition"
          />

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-sm">

              <thead className="bg-blue-50 border-b border-blue-100">

                <tr>

                  <th className="p-4 text-left">
                    Role
                  </th>

                  <th className="p-4 text-left">
                    Permissions
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

                ) : roles.length === 0 ? (

                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-gray-500"
                    >
                      No roles found
                    </td>
                  </tr>

                ) : (

                  roles.map((role) => (

                    <tr
                      key={role.id}
                      className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                    >

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Shield size={18} />
                          </div>

                          <div>

                            <p className="font-semibold text-gray-900 capitalize">
                              {role.name}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="p-4">

                        <div className="flex flex-wrap gap-2">

                          {role.permissions?.map(
                            (permission) => (

                              <span
                                key={permission.id}
                                className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                              >
                                {permission.name}
                              </span>

                            )
                          )}

                        </div>

                      </td>

                      <td className="p-4">

                        <div className="flex justify-end gap-3">

                          <button
                            onClick={() =>
                              openEdit(role)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(role.id)
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

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] overflow-y-auto">

              {/* HEADER */}
              <div className="p-6 border-b border-blue-100 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRole
                      ? "Edit Role"
                      : "Create Role"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Configure access & permissions
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
                  placeholder="Role Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <div>

                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto border border-gray-200 rounded-2xl p-4">

                    {permLoading ? (

                      <p className="text-sm text-gray-500">
                        Loading...
                      </p>

                    ) : (

                      permissions.map(
                        (permission) => (

                          <label
                            key={permission.id}
                            className={`flex items-center gap-3 border rounded-2xl p-3 cursor-pointer transition ${
                              form.permissions.includes(
                                permission.id
                              )
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={form.permissions.includes(
                                permission.id
                              )}
                              onChange={() =>
                                togglePermission(
                                  permission.id
                                )
                              }
                            />

                            <span className="text-sm text-gray-700">
                              {permission.name}
                            </span>

                          </label>

                        )
                      )
                    )}

                  </div>

                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                >
                  {editingRole
                    ? "Update Role"
                    : "Create Role"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </Layout>
  );
}

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

function Input(props) {

  return (

    <input
      {...props}
      className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
    />
  );
}