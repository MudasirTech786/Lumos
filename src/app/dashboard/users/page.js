"use client";

import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Shield,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import StatsCard from "@/components/ui/StatsCard";

export default function UsersPage() {

  const [users, setUsers] = useState([]);

  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [loadingId, setLoadingId] = useState(null);

  const initialForm = {

    name: "",

    email: "",

    password: "",

    role: "",
  };

  const [form, setForm] = useState(initialForm);

  const confirmDialog = useConfirm();

  // ✅ CHECK IF USER IS SUPER ADMIN
  const isSuperAdmin = (user) => user.name === "Super Admin";

  useEffect(() => {

    fetchUsers();

  }, [page, search]);

  useEffect(() => {

    fetchRoles();

  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/users?page=${page}&search=${search}`
      );

      setUsers(
        res.data?.users?.data || []
      );

      setLastPage(
        res.data?.users?.last_page || 1
      );

    } catch (err) {

      console.log(err.response?.data);

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Fetch Error", message: "Failed to load users" });

    } finally {

      setLoading(false);
    }
  };

  const fetchRoles = async () => {

    try {

      const res = await api.get(
        "/roles-list"
      );

      setRoles(
        res.data?.roles || []
      );

    } catch {

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Fetch Error", message: "Failed to load roles" });
    }
  };

  const openCreate = () => {

    setEditingUser(null);

    setForm(initialForm);

    setOpenModal(true);
  };

  const openEdit = (user) => {

    // ✅ PREVENT EDITING SUPER ADMIN
    if (isSuperAdmin(user)) {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Validation Error", message: "Super Admin cannot be edited" });
      return;
    }

    setEditingUser(user);

    setForm({

      name: user.name,

      email: user.email,

      password: "",

      role:
        user.roles?.[0]?.name || "",
    });

    setOpenModal(true);
  };

  const handleSubmit = async () => {
    const isEdit = !!editingUser;
    const pToastId = progressToast.loading({
      title: isEdit ? "Updating User" : "Creating User",
      message: isEdit ? "Saving changes..." : "Creating user account...",
    });

    try {
      if (isEdit) {
        progressToast.update(pToastId, {
          progress: 60,
          message: "Updating user profile...",
        });

        await api.put(
          `/users/${editingUser.id}`,
          form
        );

        progressToast.success(pToastId, {
          title: "User Updated",
          message: "Changes saved successfully.",
        });
      } else {
        progressToast.update(pToastId, {
          progress: 40,
          message: "Saving user information...",
        });

        await api.post(
          "/users",
          form
        );

        progressToast.update(pToastId, {
          progress: 75,
          message: "Assigning roles and permissions...",
        });

        progressToast.success(pToastId, {
          title: "User Created",
          message: "The user has been created successfully.",
        });
      }

      setOpenModal(false);
      setForm(initialForm);
      fetchUsers();
    } catch (err) {
      console.log(err.response?.data);

      progressToast.error(pToastId, {
        title: isEdit ? "Update Failed" : "Creation Failed",
        message: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);

    // ✅ PREVENT DELETING SUPER ADMIN
    if (isSuperAdmin(user)) {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Validation Error", message: "Super Admin cannot be deleted" });
      return;
    }

    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete User",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(`/users/${id}`),
    });

    if (!ok) return;

    setUsers((prev) =>
      prev.filter((u) => u.id !== id)
    );
  };

  const totalUsers = users.length;

  const adminUsers = users.filter(
    (u) =>
      u.roles?.[0]?.name === "admin"
  ).length;

  return (
    <ProtectedPage permission="users.view">
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

    User Management

  </div>

  <h1 className="
    mt-4
    text-4xl
    md:text-5xl
    font-black
    tracking-[-0.06em]
    text-gray-900
  ">

    Platform Users

  </h1>

  <p className="
    mt-4
    max-w-3xl
    text-base
    leading-relaxed
    text-gray-500
  ">

    Manage platform users, access permissions,
    operational roles and account administration.

  </p>

</div>

            <button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              Add User
            </button>

          </div>

          

          {/* KPI STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatsCard
              icon={<Users size={20} />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              accentColor="bg-blue-500"
              value={totalUsers}
              label="Total Users"
              chip={{ text: "Active", bg: "bg-green-100", color: "text-green-700" }}
              index={0}
            />

            <StatsCard
              icon={<Shield size={20} />}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              accentColor="bg-purple-500"
              value={adminUsers}
              label="Admin Users"
              index={1}
            />

            <StatsCard
              icon={<Users size={20} />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              accentColor="bg-green-500"
              value={totalUsers - adminUsers}
              label="Regular Users"
              index={2}
            />

            <StatsCard
              icon={<Lock size={20} />}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              accentColor="bg-amber-500"
              value={roles.length}
              label="Active Roles"
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
              placeholder="Search users..."
              className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-4 transition"
            />

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] text-sm">

                <thead className="bg-blue-50 border-b border-blue-100">

                  <tr>

                    <th className="p-4 text-left">
                      Name
                    </th>

                    <th className="p-4 text-left">
                      Email
                    </th>

                    <th className="p-4 text-left">
                      Role
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
                        colSpan={4}
                        className="p-6 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>

                  ) : users.length === 0 ? (

                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>

                  ) : (

                    users.map((user) => {

                      const superAdmin = isSuperAdmin(user);

                      return (

                        <tr
                          key={user.id}
                          className={`border-b border-gray-100 transition ${superAdmin
                            ? "bg-amber-50/40 hover:bg-amber-50/60"
                            : "hover:bg-blue-50/40"
                            }`}
                        >

                          <td className="p-4">

                            <div className="flex items-center gap-3">

                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${superAdmin
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                                }`}>
                                {user.name?.charAt(0)}
                              </div>

                              <div className="flex items-center gap-2">

                                <p className="font-semibold text-gray-900">
                                  {user.name}
                                </p>

                                {superAdmin && (
                                  <Lock size={14} className="text-amber-600" title="Super Admin - Protected" />
                                )}

                              </div>

                            </div>

                          </td>

                          <td className="p-4 text-gray-600">
                            {user.email}
                          </td>

                          <td className="p-4">

                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${superAdmin
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                              }`}>
                              {user.roles?.[0]?.name || "-"}
                            </span>

                          </td>

                          <td className="p-4">

                            <div className="flex justify-end gap-3">

                              <button
                                onClick={() =>
                                  openEdit(user)
                                }
                                disabled={superAdmin}
                                className={`transition ${superAdmin
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-blue-600 hover:text-blue-800"
                                  }`}
                                title={superAdmin ? "Super Admin cannot be edited" : "Edit user"}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(user.id)
                                }
                                disabled={
                                  superAdmin || loadingId === user.id
                                }
                                className={`transition ${superAdmin
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-red-500 hover:text-red-700"
                                  }`}
                                title={superAdmin ? "Super Admin cannot be deleted" : "Delete user"}
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    })

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

              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] overflow-y-auto">

                <div className="p-6 border-b border-blue-100 flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">
                      {editingUser
                        ? "Edit User"
                        : "Add User"}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Manage system user access
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

                <div className="p-6 space-y-4">

                  <Input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />

                  {!editingUser && (

                    <Input
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                    />

                  )}

                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
                  >

                    <option value="">
                      Select Role
                    </option>

                    {roles.map((role) => (

                      <option
                        key={role.id}
                        value={role.name}
                      >
                        {role.name}
                      </option>

                    ))}

                  </select>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                  >
                    {editingUser
                      ? "Update User"
                      : "Create User"}
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

function Input(props) {

  return (

    <input
      {...props}
      className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
    />
  );
}