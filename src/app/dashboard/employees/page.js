"use client";

import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import Link from "next/link";
import {
    Plus,
    Search,
    Trash2,
    Pencil,
    Users,
    Briefcase,
    BadgeDollarSign,
    Link2,
    Sparkles,
    ChevronRight,
    Mail,
    Phone,
    Shield,
    Building2,
    CalendarDays,
    MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";

import { useRouter } from "next/navigation";
import StatsCard from "@/components/ui/StatsCard";

export default function EmployeesPage() {

    const router = useRouter();

    const [employees, setEmployees] = useState([]);

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [editModal, setEditModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loadingId, setLoadingId] = useState(null);

    const confirmDialog = useConfirm();

    const initialForm = {

        user_id: "",

        name: "",

        email: "",

        phone: "",

        department: "",

        designation: "",

        base_salary: "",

        hire_date: "",

        status: "active",

        cnic: "",

        address: "",

        emergency_contact: "",

        profile_photo: "",
    };

    const [form, setForm] = useState(initialForm);

    useEffect(() => {

        fetchEmployees();

        fetchUsers();

    }, []);

    // FETCH EMPLOYEES
    const fetchEmployees = async () => {

        try {

            setLoading(true);

            const res = await api.get("/employees");

            setEmployees(
                res.data?.employees?.data || []
            );

        } catch (err) {

            console.log(err.response?.data);

            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Fetch Error", message: "Failed to load employees" });

        } finally {

            setLoading(false);
        }
    };

    // FETCH USERS
    const fetchUsers = async () => {

        try {

            const res = await api.get("/users");

            setUsers(
                res.data?.users?.data ||
                res.data?.users ||
                []
            );

        } catch (err) {

            console.log(err.response?.data);
        }
    };

    // SEARCH FILTER
    const filtered = employees.filter((e) =>
        e.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    // CREATE
    const handleSubmit = async () => {

        const pToastId = progressToast.loading({
            title: "Creating Employee",
            message: "Saving employee information...",
        });

        try {

            progressToast.update(pToastId, {
                progress: 60,
                message: "Saving employee information...",
            });

            const res = await api.post(
                "/employees",
                formatPayload(form)
            );

            progressToast.success(pToastId, {
                title: "Employee Created",
                message: `Employee ${res.data.employee.employee_code} has been created.`,
            });

            fetchEmployees();

            closeModal();

        } catch (err) {

            console.log(err.response?.data);

            progressToast.error(pToastId, {
                title: "Creation Failed",
                message: err.response?.data?.message || "Failed to create employee",
            });
        }
    };

    const handleEdit = (employee) => {

    setForm({
        ...initialForm,
        ...employee,

        user_id: employee.user_id || "",

        hire_date: employee.hire_date
            ? employee.hire_date.split("T")[0]
            : "",
    });

    setEditingId(employee.id);

    setEditModal(true);
};

    // UPDATE
    const handleUpdate = async () => {

        const pToastId = progressToast.loading({
            title: "Updating Employee",
            message: "Saving changes...",
        });

        try {

            progressToast.update(pToastId, {
                progress: 60,
                message: "Saving changes...",
            });

            const res = await api.put(
                `/employees/${editingId}`,
                formatPayload(form)
            );

            progressToast.success(pToastId, {
                title: "Employee Updated",
                message: `Employee ${res.data.employee.employee_code} has been updated.`,
            });

            fetchEmployees();

            closeModal();

        } catch (err) {

            console.log(err.response?.data);

            progressToast.error(pToastId, {
                title: "Update Failed",
                message: err.response?.data?.message || "Update failed",
            });
        }
    };

    // DELETE
    const handleDelete = async (id) => {

        const ok = await confirmDialog({
            variant: "danger",
            title: "Delete Employee",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            confirmAction: () => api.delete(
                `/employees/${id}`
            ),
        });

        if (!ok) return;

        setEmployees((prev) =>
            prev.filter(
                (e) => e.id !== id
            )
        );
    };

    // CLOSE MODAL
    const closeModal = () => {

        setOpenModal(false);

        setEditModal(false);

        setEditingId(null);

        setForm(initialForm);
    };

    // PAYLOAD
    const formatPayload = (data) => ({

        ...data,

        base_salary:
            Number(data.base_salary) || 0,
    });

    // STATS
    const activeEmployees =
        employees.filter(
            (e) => e.status === "active"
        ).length;

    const totalPayroll = employees.reduce(
        (sum, e) =>
            sum + Number(e.base_salary || 0),
        0
    );

    return (
        <ProtectedPage permission="employees.view">
            <Layout>

                <div className="space-y-6 pb-10">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

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

                                Workforce Operations

                            </div>

                            <h1 className="
    mt-4
    text-4xl
    md:text-5xl
    font-black
    tracking-[-0.06em]
    text-gray-900
  ">

                                Employees

                            </h1>

                            <p className="
    mt-4
    max-w-3xl
    text-base
    leading-relaxed
    text-gray-500
  ">

                                Manage internal workforce, payroll operations,
                                departments and employee administration.

                            </p>

                        </div>

                        <button
                            onClick={() =>
                                setOpenModal(true)
                            }
                            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl w-full md:w-auto justify-center flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <Plus size={18} />
                            Add Employee
                        </button>

                    </div>

                    {/* ===================================================== */}
                    {/* KPI STATS */}
                    {/* ===================================================== */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        <StatsCard
                            icon={<Users size={20} />}
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                            accentColor="bg-blue-500"
                            value={employees.length}
                            label="Total Employees"
                            chip={{ text: "Live", bg: "bg-green-100", color: "text-green-700" }}
                            index={0}
                        />

                        <StatsCard
                            icon={<Briefcase size={20} />}
                            iconBg="bg-green-100"
                            iconColor="text-green-600"
                            accentColor="bg-green-500"
                            value={activeEmployees}
                            label="Active Employees"
                            index={1}
                        />

                        <StatsCard
                            icon={<BadgeDollarSign size={20} />}
                            iconBg="bg-amber-100"
                            iconColor="text-amber-600"
                            accentColor="bg-amber-500"
                            value={totalPayroll}
                            label="Monthly Payroll"
                            chip={{ text: "This Month", bg: "bg-amber-100", color: "text-amber-700" }}
                            index={2}
                        />

                        <StatsCard
                            icon={<Building2 size={20} />}
                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"
                            accentColor="bg-purple-500"
                            value={[...new Set(employees.map((e) => e.department))].length}
                            label="Departments"
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
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search employees..."
                            className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-4 transition"
                        />

                    </div>

                    {/* MOBILE CARDS */}
                    <div className="grid grid-cols-1 md:hidden gap-4">

                        {filtered.map((employee) => (

                            <div
                                key={employee.id}
                                className="bg-white rounded-3xl border border-blue-100 p-5 shadow-sm"
                            >

                                <div className="flex items-start justify-between">

                                    <div>

                                        <h3 className="font-semibold text-gray-900">
                                            {employee.name}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {employee.designation || "-"}
                                        </p>

                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${employee.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {employee.status}
                                    </span>

                                </div>

                                <div className="mt-4 space-y-2 text-sm text-gray-600">

                                    <p>
                                        Department: {employee.department || "-"}
                                    </p>

                                    <p>
                                        Salary: {employee.base_salary || 0}
                                    </p>

                                </div>

                                <div className="flex justify-end gap-3 mt-5">

                                    <button
                                        onClick={() =>
                                            handleEdit(employee)
                                        }
                                        className="text-blue-600"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(employee.id)
                                        }
                                        className="text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm min-w-[1000px]">

                                <thead className="bg-blue-50 border-b border-blue-100">

                                    <tr>

                                        <th className="p-4 text-left">
                                            Employee
                                        </th>

                                        <th className="p-4 text-left">
                                            Department
                                        </th>

                                        <th className="p-4 text-left">
                                            Designation
                                        </th>

                                        <th className="p-4 text-left">
                                            Linked User
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

                                    {filtered.map((employee) => (

                                        <tr
                                            key={employee.id}
                                            className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                                        >

                                            <td className="p-4">

                                                <div>

                                                    <Link
                                                        href={`/dashboard/employees/${employee.id}`}
                                                        className="
      inline-flex
      items-center
      gap-2
      text-base
      font-bold
      tracking-[-0.02em]
      text-slate-900
      transition-all
      hover:text-blue-600
      group
    "
                                                    >

                                                        {employee.name}

                                                        <ChevronRight
                                                            size={15}
                                                            className="
        opacity-0
        transition-all
        duration-200
        group-hover:translate-x-1
        group-hover:opacity-100
      "
                                                        />

                                                    </Link>

                                                    <p className="
    mt-1
    text-xs
    font-medium
    tracking-wide
    text-slate-400
  ">

                                                        {employee.employee_code}

                                                    </p>

                                                </div>

                                            </td>

                                            <td className="p-4">
                                                {employee.department || "-"}
                                            </td>

                                            <td className="p-4">
                                                {employee.designation || "-"}
                                            </td>

                                            <td className="p-4">

                                                {employee.user ? (

                                                    <div className="flex items-center gap-2 text-blue-600">

                                                        <Link2 size={14} />

                                                        {employee.user?.name}

                                                    </div>

                                                ) : (

                                                    <span className="text-gray-400">
                                                        Not linked
                                                    </span>

                                                )}

                                            </td>

                                            <td className="p-4 text-center">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${employee.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {employee.status}
                                                </span>

                                            </td>

                                            <td className="p-4">

                                                <div className="flex justify-end gap-3">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(employee)
                                                        }
                                                        className="text-blue-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(employee.id)
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* MODAL */}
                    {/* MODAL */}
                    {(openModal || editModal) && (

                        <div className="
                        mt-16
      md:mt-8
    fixed
    inset-0
    z-50
    flex
    items-start
    justify-center
    overflow-y-auto
    bg-[#020817]/70
    px-4
    py-10
    backdrop-blur-md
  ">

                            {/* BACKDROP */}

                            <div
                                onClick={closeModal}
                                className="absolute inset-0"
                            />

                            {/* ===================================================== */}
                            {/* MODAL CONTAINER */}
                            {/* ===================================================== */}

                            <div className="
      relative
      
      w-full
      max-w-6xl
      max-h-[88vh]
      overflow-y-auto
      no-scrollbar
      rounded-[36px]
      border
      border-blue-100/70
      bg-[rgba(255,255,255,0.82)]
      backdrop-blur-2xl
      shadow-[0_25px_100px_rgba(37,99,235,0.14)]

      before:absolute
      before:inset-0
      before:rounded-[36px]
      before:bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.7),transparent)]
      before:pointer-events-none
    ">

                                {/* GRID */}

                                <div className="
        pointer-events-none
        absolute
        inset-0
        opacity-[0.03]
        [background-image:linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)]
        [background-size:42px_42px]
      " />

                                {/* GLOW */}

                                <div className="
        pointer-events-none
        absolute
        -top-20
        right-[-120px]
        h-[320px]
        w-[320px]
        rounded-full
        bg-blue-400/20
        blur-[120px]
      " />

                                <div className="
        pointer-events-none
        absolute
        bottom-[-120px]
        left-[-120px]
        h-[280px]
        w-[280px]
        rounded-full
        bg-cyan-300/10
        blur-[120px]
      " />

                                {/* ===================================================== */}
                                {/* HEADER */}
                                {/* ===================================================== */}

                                <div className="
        sticky
        top-0
        z-20
        overflow-hidden
        border-b
        border-blue-100/70
        bg-white/80
        px-6
        py-6
        backdrop-blur-2xl
        md:px-8

        after:absolute
        after:bottom-0
        after:left-0
        after:h-px
        after:w-full
        after:bg-gradient-to-r
        after:from-transparent
        after:via-blue-300/40
        after:to-transparent
      ">

                                    <div className="
          flex
          items-start
          justify-between
          gap-4
        ">

                                        {/* LEFT */}

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

                                                Employee Operations

                                            </div>

                                            <h2 className="
              mt-4
              text-3xl
              font-black
              tracking-[-0.05em]
              text-slate-900
            ">

                                                {editModal
                                                    ? "Edit Employee"
                                                    : "Create Employee"}

                                            </h2>

                                            <p className="
              mt-2
              max-w-2xl
              text-sm
              leading-relaxed
              text-slate-500
            ">

                                                Configure workforce profile,
                                                payroll structure, departments
                                                and operational employment records.

                                            </p>

                                        </div>

                                        {/* CLOSE */}

                                        <button
                                            onClick={closeModal}
                                            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-100
              bg-white/80
              text-slate-500
              transition-all
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-700
            "
                                        >

                                            ✕

                                        </button>

                                    </div>

                                </div>

                                {/* ===================================================== */}
                                {/* BODY */}
                                {/* ===================================================== */}

                                <div className="
        relative
        z-10
        space-y-8
        p-6
        md:p-8
      ">

                                    {/* ===================================================== */}
                                    {/* LINK USER */}
                                    {/* ===================================================== */}

                                    <div className="
          rounded-[32px]
          border
          border-blue-100
          bg-white/70
          p-6
          backdrop-blur-xl
          transition-all
          duration-300
          hover:shadow-[0_0_45px_rgba(37,99,235,0.08)]
        ">

                                        <div className="
            flex
            items-center
            gap-3
            border-b
            border-blue-100
            pb-4
          ">

                                            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-blue-100
              text-blue-600
            ">

                                                <Users size={18} />

                                            </div>

                                            <div>

                                                <h3 className="
                text-base
                font-bold
                text-slate-900
              ">

                                                    Linked User Account

                                                </h3>

                                                <p className="
                text-sm
                text-slate-500
              ">

                                                    Connect employee with platform user

                                                </p>

                                            </div>

                                        </div>

                                        <div className="mt-5">

                                            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            ">

                                                User Account

                                            </label>

                                            <select
                                                value={form.user_id ?? ""}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        user_id: e.target.value,
                                                    })
                                                }
                                                className="
                h-14
                w-full
                rounded-2xl
                border
                border-blue-100
                bg-white/80
                px-4
                text-sm
                outline-none
                transition-all
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-100
              "
                                            >

                                                <option value="">
                                                    No Linked User
                                                </option>

                                                {users.map((user) => (

                                                    <option
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {user.name} ({user.email})
                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                    </div>

                                    {/* ===================================================== */}
                                    {/* BASIC INFORMATION */}
                                    {/* ===================================================== */}

                                    <div className="
          rounded-[32px]
          border
          border-blue-100
          bg-white/70
          p-6
          backdrop-blur-xl
          transition-all
          duration-300
          hover:shadow-[0_0_45px_rgba(37,99,235,0.08)]
        ">

                                        <div className="
            flex
            items-center
            gap-3
            border-b
            border-blue-100
            pb-4
          ">

                                            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-blue-100
              text-blue-600
            ">

                                                <Users size={18} />

                                            </div>

                                            <div>

                                                <h3 className="
                text-base
                font-bold
                text-slate-900
              ">

                                                    Basic Information

                                                </h3>

                                                <p className="
                text-sm
                text-slate-500
              ">

                                                    Employee identity & contact details

                                                </p>

                                            </div>

                                        </div>

                                        <div className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          ">

                                            <Input
                                                label="Full Name"
                                                icon={<Users size={18} />}
                                                placeholder="John Carter"
                                                value={form.name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />

                                            <Input
                                                label="Email Address"
                                                icon={<Mail size={18} />}
                                                placeholder="john@email.com"
                                                value={form.email}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />

                                            <Input
                                                label="Phone Number"
                                                icon={<Phone size={18} />}
                                                placeholder="+92 300 0000000"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />

                                            <Input
                                                label="CNIC"
                                                icon={<Shield size={18} />}
                                                placeholder="42101-1234567-1"
                                                value={form.cnic}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        cnic: e.target.value,
                                                    })
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* ===================================================== */}
                                    {/* EMPLOYMENT */}
                                    {/* ===================================================== */}

                                    <div className="
          rounded-[32px]
          border
          border-blue-100
          bg-white/70
          p-6
          backdrop-blur-xl
          transition-all
          duration-300
          hover:shadow-[0_0_45px_rgba(37,99,235,0.08)]
        ">

                                        <div className="
            flex
            items-center
            gap-3
            border-b
            border-blue-100
            pb-4
          ">

                                            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-blue-100
              text-blue-600
            ">

                                                <Briefcase size={18} />

                                            </div>

                                            <div>

                                                <h3 className="
                text-base
                font-bold
                text-slate-900
              ">

                                                    Employment Information

                                                </h3>

                                                <p className="
                text-sm
                text-slate-500
              ">

                                                    Department, salary & workforce role

                                                </p>

                                            </div>

                                        </div>

                                        <div className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          ">

                                            <Input
                                                label="Department"
                                                icon={<Building2 size={18} />}
                                                placeholder="Production"
                                                value={form.department}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        department: e.target.value,
                                                    })
                                                }
                                            />

                                            <Input
                                                label="Designation"
                                                icon={<Briefcase size={18} />}
                                                placeholder="Senior Producer"
                                                value={form.designation}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        designation: e.target.value,
                                                    })
                                                }
                                            />

                                            <Input
                                                type="number"
                                                label="Base Salary"
                                                icon={<BadgeDollarSign size={18} />}
                                                placeholder="150000"
                                                value={form.base_salary}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        base_salary: e.target.value,
                                                    })
                                                }
                                            />

                                            <Input
                                                type="date"
                                                label="Hire Date"
                                                icon={<CalendarDays size={18} />}
                                                value={form.hire_date}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        hire_date: e.target.value,
                                                    })
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* ===================================================== */}
                                    {/* ADDITIONAL */}
                                    {/* ===================================================== */}

                                    <div className="
          rounded-[32px]
          border
          border-blue-100
          bg-white/70
          p-6
          backdrop-blur-xl
          transition-all
          duration-300
          hover:shadow-[0_0_45px_rgba(37,99,235,0.08)]
        ">

                                        <div className="
            flex
            items-center
            gap-3
            border-b
            border-blue-100
            pb-4
          ">

                                            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-blue-100
              text-blue-600
            ">

                                                <MapPin size={18} />

                                            </div>

                                            <div>

                                                <h3 className="
                text-base
                font-bold
                text-slate-900
              ">

                                                    Additional Details

                                                </h3>

                                                <p className="
                text-sm
                text-slate-500
              ">

                                                    Emergency & residential information

                                                </p>

                                            </div>

                                        </div>

                                        <div className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          ">

                                            <Input
                                                label="Emergency Contact"
                                                icon={<Phone size={18} />}
                                                placeholder="+92 300 0000000"
                                                value={form.emergency_contact}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        emergency_contact: e.target.value,
                                                    })
                                                }
                                            />

                                        </div>

                                        <div className="mt-5">

                                            <label className="
              mb-3
              block
              text-sm
              font-semibold
              text-slate-700
            ">

                                                Address

                                            </label>

                                            <textarea
                                                placeholder="Enter employee residential address..."
                                                value={form.address ?? ""}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        address: e.target.value,
                                                    })
                                                }
                                                className="
                min-h-[120px]
                w-full
                rounded-[24px]
                border
                border-blue-100
                bg-white/80
                px-5
                py-4
                text-sm
                text-slate-700
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-100
              "
                                            />

                                        </div>

                                    </div>

                                    {/* ===================================================== */}
                                    {/* STATUS */}
                                    {/* ===================================================== */}

                                    <div className="
          rounded-[32px]
          border
          border-blue-100
          bg-white/70
          p-6
          backdrop-blur-xl
        ">

                                        <label className="
            mb-3
            block
            text-sm
            font-semibold
            text-slate-700
          ">

                                            Employee Status

                                        </label>

                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    status: e.target.value,
                                                })
                                            }
                                            className="
              h-14
              w-full
              rounded-2xl
              border
              border-blue-100
              bg-white/80
              px-4
              outline-none
              transition-all
              focus:border-blue-400
              focus:ring-4
              focus:ring-blue-100
            "
                                        >

                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>

                                            <option value="terminated">
                                                Terminated
                                            </option>

                                        </select>

                                    </div>

                                    {/* ===================================================== */}
                                    {/* ACTIONS */}
                                    {/* ===================================================== */}

                                    <div className="
          flex
          flex-col-reverse
          gap-4
          pt-2
          md:flex-row
        ">

                                        <button
                                            onClick={closeModal}
                                            className="
              w-full
              rounded-2xl
              border
              border-blue-100
              bg-white/80
              py-4
              font-semibold
              text-slate-700
              transition-all
              hover:border-blue-200
              hover:bg-blue-50
            "
                                        >

                                            Cancel

                                        </button>

                                        <button
                                            onClick={
                                                editModal
                                                    ? handleUpdate
                                                    : handleSubmit
                                            }
                                            className="
              w-full
              rounded-2xl
              bg-blue-600
              py-4
              font-semibold
              text-white
              shadow-[0_20px_50px_rgba(37,99,235,0.28)]
              transition-all
              hover:scale-[1.01]
              hover:bg-blue-700
              hover:shadow-[0_20px_60px_rgba(37,99,235,0.38)]
              active:scale-[0.99]
            "
                                        >

                                            {editModal
                                                ? "Update Employee"
                                                : "Create Employee"}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </Layout>
        </ProtectedPage>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
}) {

    return (

        <div className="space-y-2">
            {/* INPUT WRAPPER */}

            <div className="relative">

                {/* INSIDE NAME */}

                <div className="
          pointer-events-none
          absolute
          left-4
          top-3
          z-10
          text-[10px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-blue-500
        ">

                    {label}

                </div>

                {/* INPUT */}

                <input
                    type={type}
                    value={value || ""}
                    placeholder={placeholder}
                    onChange={onChange}
                    className="
            h-[72px]
            w-full
            rounded-[24px]
            border
            border-blue-100
            bg-white/80
            px-4
            pb-3
            pt-7
            text-sm
            font-medium
            text-slate-800
            outline-none
            transition-all
            placeholder:text-slate-400
            focus:border-blue-400
            focus:ring-4
            focus:ring-blue-100
          "
                />

            </div>

        </div>

    );
}

