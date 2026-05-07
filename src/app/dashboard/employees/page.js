"use client";

import Layout from "@/components/Layout";

import {
    Plus,
    Search,
    Trash2,
    Pencil,
    Users,
    Briefcase,
    BadgeDollarSign,
    Link2,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

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

    const initialForm = {

        user_id: "",

        employee_code: "",

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

            toast.error(
                "Failed to load employees"
            );

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

        try {

            await api.post(
                "/employees",
                formatPayload(form)
            );

            toast.success(
                "Employee created"
            );

            fetchEmployees();

            closeModal();

        } catch (err) {

            console.log(err.response?.data);

            toast.error(
                err.response?.data?.message ||
                "Failed to create employee"
            );
        }
    };

    // OPEN EDIT
    const handleEdit = (employee) => {

        setForm({
            ...initialForm,
            ...employee,
            user_id:
                employee.user_id || "",
        });

        setEditingId(employee.id);

        setEditModal(true);
    };

    // UPDATE
    const handleUpdate = async () => {

        try {

            await api.put(
                `/employees/${editingId}`,
                formatPayload(form)
            );

            toast.success(
                "Employee updated"
            );

            fetchEmployees();

            closeModal();

        } catch (err) {

            console.log(err.response?.data);

            toast.error(
                err.response?.data?.message ||
                "Update failed"
            );
        }
    };

    // DELETE
    const handleDelete = async (id) => {

        if (!confirm("Delete this employee?"))
            return;

        try {

            setLoadingId(id);

            await api.delete(
                `/employees/${id}`
            );

            setEmployees((prev) =>
                prev.filter(
                    (e) => e.id !== id
                )
            );

            toast.success("Deleted");

        } catch (err) {

            console.log(err.response?.data);

            toast.error("Delete failed");

        } finally {

            setLoadingId(null);
        }
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

        <Layout>

            <div className="space-y-6 pb-10">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Employees
                        </h1>

                        <p className="text-gray-500 mt-1 text-sm md:text-base">
                            Internal workforce management
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

                {/* STATS */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

                    <StatCard
                        icon={<Users size={18} />}
                        title="Total Employees"
                        value={employees.length}
                    />

                    <StatCard
                        icon={<Briefcase size={18} />}
                        title="Active"
                        value={activeEmployees}
                    />

                    <StatCard
                        icon={<BadgeDollarSign size={18} />}
                        title="Monthly Payroll"
                        value={totalPayroll}
                    />

                    <StatCard
                        icon={<Users size={18} />}
                        title="Departments"
                        value={[
                            ...new Set(
                                employees.map(
                                    (e) =>
                                        e.department
                                )
                            ),
                        ].length}
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
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        employee.status === "active"
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

                                                <p className="font-semibold">
                                                    {employee.name}
                                                </p>

                                                <p className="text-xs text-gray-500">
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
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    employee.status === "active"
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
                {(openModal || editModal) && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                        <div
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />

                        <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] overflow-y-auto">

                            <div className="p-6 border-b border-blue-100">

                                <h2 className="text-2xl font-bold text-gray-900">

                                    {editModal
                                        ? "Edit Employee"
                                        : "Add Employee"}

                                </h2>

                            </div>

                            <div className="p-6 space-y-5">

                                {/* LINK USER */}
                                <div>

                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Link User Account
                                    </label>

                                    <select
                                        value={form.user_id ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                user_id: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition"
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

                                {/* BASIC */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Input
                                        placeholder="Employee Code"
                                        value={form.employee_code}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                employee_code:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        placeholder="Full Name"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                email:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        placeholder="Phone"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                phone:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                </div>

                                {/* WORK */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Input
                                        placeholder="Department"
                                        value={form.department}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                department:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        placeholder="Designation"
                                        value={form.designation}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                designation:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        type="number"
                                        placeholder="Base Salary"
                                        value={form.base_salary}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                base_salary:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        type="date"
                                        value={form.hire_date}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                hire_date:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                </div>

                                {/* EXTRA */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Input
                                        placeholder="CNIC"
                                        value={form.cnic}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                cnic:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                    <Input
                                        placeholder="Emergency Contact"
                                        value={form.emergency_contact}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                emergency_contact:
                                                    e.target.value,
                                            })
                                        }
                                    />

                                </div>

                                <textarea
                                    placeholder="Address"
                                    value={form.address ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            address:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 min-h-[100px]"
                                />

                                {/* STATUS */}
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

                                {/* ACTION */}
                                <button
                                    onClick={
                                        editModal
                                            ? handleUpdate
                                            : handleSubmit
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                                >

                                    {editModal
                                        ? "Update Employee"
                                        : "Save Employee"}

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
    icon,
    title,
    value,
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