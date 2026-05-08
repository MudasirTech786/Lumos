"use client";

import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import {
    Plus,
    Search,
    Trash2,
    Pencil,
    Users,
    UserCheck,
    UserX,
    Briefcase,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import api from "@/lib/api";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

export default function CrewPage() {

    const router = useRouter();

    // ================= STATES =================
    const [crew, setCrew] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [typeFilter, setTypeFilter] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [openModal, setOpenModal] = useState(false);

    const [editModal, setEditModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loadingId, setLoadingId] = useState(null);

    // ================= FORM =================
    const initialForm = {

        name: "",

        email: "",

        phone: "",

        designation: "",

        employment_type: "freelancer",

        basic_salary: "",

        rate_per_shift: "",

        hourly_rate: "",

        commission: "",

        home_allowance: "",

        fuel_allowance: "",

        others: "",

        skills: [],

        notes: "",

        joining_date: "",

        address: "",

        cnic: "",

        emergency_contact: "",

        profile_photo: "",

        is_active: true,
    };

    const [form, setForm] = useState(initialForm);

    // ================= FETCH =================
    useEffect(() => {

        fetchCrew();

    }, [search, typeFilter, statusFilter]);

    const fetchCrew = async () => {

        try {

            setLoading(true);

            const res = await api.get("/crew", {
                params: {
                    search,
                    employment_type: typeFilter,
                    is_active: statusFilter,
                }
            });

            console.log(res.data);

            const data =
                res.data?.crew?.data ||
                res.data?.crew ||
                [];

            setCrew(Array.isArray(data) ? data : []);

        } catch (err) {

            console.log(err?.response?.data || err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load crew"
            );

            console.log(err.response?.data);

            setCrew([]);

        } finally {

            setLoading(false);
        }
    };

    // ================= STATS =================
    const stats = useMemo(() => {

        return {

            total: crew.length,

            freelancers: crew.filter(
                (c) => c.employment_type === "freelancer"
            ).length,

            fullTime: crew.filter(
                (c) => c.employment_type === "full_time"
            ).length,

            inactive: crew.filter(
                (c) => !c.is_active
            ).length,
        };

    }, [crew]);

    // ================= CREATE =================
    const handleSubmit = async () => {

        if (!form.name) {
            return toast.error("Name required");
        }

        try {

            await api.post(
                "/crew",
                formatPayload(form)
            );

            toast.success("Crew added");

            setForm(initialForm);

            setOpenModal(false);

            fetchCrew();

        } catch (err) {

            console.log(err?.response?.data || err);

            toast.error(
                err.response?.data?.message ||
                "Failed to add crew"
            );

            console.log(err.response?.data);
        }
    };

    // ================= EDIT =================
    const handleEdit = (c) => {

        setForm({
            ...initialForm,
            ...c,
        });

        setEditingId(c.id);

        setEditModal(true);
    };

    const handleUpdate = async () => {

        try {

            await api.put(
                `/crew/${editingId}`,
                formatPayload(form)
            );

            toast.success("Updated");

            setEditModal(false);

            fetchCrew();

        } catch (err) {

            console.log(err?.response?.data || err);

            toast.error(
                err.response?.data?.message ||
                "Update failed"
            );

            console.log(err.response?.data);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {

        if (!confirm("Delete this crew member?")) {
            return;
        }

        try {

            setLoadingId(id);

            await api.delete(`/crew/${id}`);

            setCrew((prev) =>
                prev.filter((c) => c.id !== id)
            );

            toast.success("Deleted");

        } catch (err) {

            console.log(err?.response?.data || err);

            toast.error("Delete failed");

        } finally {

            setLoadingId(null);
        }
    };

    // ================= FORMAT =================
    const formatPayload = (data) => ({

        ...data,

        basic_salary:
            Number(data.basic_salary) || 0,

        rate_per_shift:
            Number(data.rate_per_shift) || 0,

        hourly_rate:
            Number(data.hourly_rate) || 0,

        commission:
            Number(data.commission) || 0,

        home_allowance:
            Number(data.home_allowance) || 0,

        fuel_allowance:
            Number(data.fuel_allowance) || 0,

        others:
            Number(data.others) || 0,

        is_active:
            Boolean(data.is_active),
    });

    // ================= UI =================
    return (
        <ProtectedPage permission="crew.view">
            <Layout>

                <div className="space-y-6">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                        <div>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Crew Management
                            </h1>

                            <p className="text-gray-500 text-sm mt-1">
                                Manage workforce & freelancer database
                            </p>

                        </div>

                        <button
                            onClick={() => setOpenModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 md:px-5 py-3 rounded-2xl w-full md:w-auto justify-center flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Crew
                        </button>

                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

                        <StatCard
                            title="Total Crew"
                            value={stats.total}
                            icon={<Users size={18} />}
                        />

                        <StatCard
                            title="Freelancers"
                            value={stats.freelancers}
                            icon={<Briefcase size={18} />}
                        />

                        <StatCard
                            title="Full Time"
                            value={stats.fullTime}
                            icon={<UserCheck size={18} />}
                        />

                        <StatCard
                            title="Inactive"
                            value={stats.inactive}
                            icon={<UserX size={18} />}
                        />

                    </div>

                    {/* FILTERS */}
                    <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-sm space-y-4">

                        {/* SEARCH */}
                        <div className="relative">

                            <Search
                                className="absolute left-3 top-3 text-gray-400"
                                size={18}
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search crew..."
                                className="w-full pl-10 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-3 rounded-2xl"
                            />

                        </div>

                        {/* FILTERS */}
                        <div className="flex flex-col md:flex-row gap-3">

                            <select
                                value={typeFilter}
                                onChange={(e) =>
                                    setTypeFilter(e.target.value)
                                }
                                className="border border-gray-200 p-3 rounded-2xl md:w-60 focus:border-blue-500 outline-none"
                            >
                                <option value="">
                                    All Types
                                </option>

                                <option value="freelancer">
                                    Freelancer
                                </option>

                                <option value="full_time">
                                    Full Time
                                </option>

                                <option value="part_time">
                                    Part Time
                                </option>

                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="border border-gray-200 p-3 rounded-2xl md:w-60 focus:border-blue-500 outline-none"
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="1">
                                    Active
                                </option>

                                <option value="0">
                                    Inactive
                                </option>

                            </select>

                        </div>

                    </div>

                    {/* TABLE */}
                    {/* CREW DATA */}
                    <div className="space-y-4">

                        {/* DESKTOP TABLE */}
                        <div className="hidden lg:block bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm border-collapse min-w-[1100px]">

                                    <thead className="bg-blue-50 border-b border-blue-100">

                                        <tr>

                                            <th className="p-4 text-left">
                                                Name
                                            </th>

                                            <th className="p-4 text-left">
                                                Type
                                            </th>

                                            <th className="p-4 text-left">
                                                Skills
                                            </th>

                                            <th className="p-4 text-left">
                                                Phone
                                            </th>

                                            <th className="p-4 text-right">
                                                Hourly
                                            </th>

                                            <th className="p-4 text-right">
                                                Shift
                                            </th>

                                            <th className="p-4 text-center">
                                                Status
                                            </th>

                                            <th className="p-4 text-right">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {/* LOADING */}
                                        {loading && (

                                            <tr>

                                                <td
                                                    colSpan={8}
                                                    className="p-10 text-center text-gray-400"
                                                >
                                                    Loading...
                                                </td>

                                            </tr>
                                        )}

                                        {/* EMPTY */}
                                        {!loading && crew.length === 0 && (

                                            <tr>

                                                <td
                                                    colSpan={8}
                                                    className="p-10 text-center text-gray-400"
                                                >
                                                    No crew found
                                                </td>

                                            </tr>
                                        )}

                                        {/* DATA */}
                                        {!loading && crew.map((c) => (

                                            <tr
                                                key={c.id}
                                                className="border-b border-gray-100 hover:bg-blue-50/40 transition cursor-pointer"
                                                onClick={() =>
                                                    router.push(`/dashboard/crew/${c.id}`)
                                                }
                                            >

                                                {/* NAME */}
                                                <td className="p-4">

                                                    <div>

                                                        <p className="font-semibold text-gray-900">
                                                            {c.name}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {c.designation || "No designation"}
                                                        </p>

                                                    </div>

                                                </td>

                                                {/* TYPE */}
                                                <td className="p-4">

                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                                                        {c.employment_type?.replace("_", " ")}
                                                    </span>

                                                </td>

                                                {/* SKILLS */}
                                                <td className="p-4">

                                                    <div className="flex flex-wrap gap-1">

                                                        {c.skills?.length ? (

                                                            c.skills
                                                                .slice(0, 2)
                                                                .map((skill, index) => (

                                                                    <span
                                                                        key={index}
                                                                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))

                                                        ) : (

                                                            <span className="text-gray-400 text-xs">
                                                                No skills
                                                            </span>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* PHONE */}
                                                <td className="p-4 text-gray-700">
                                                    {c.phone || "-"}
                                                </td>

                                                {/* HOURLY */}
                                                <td className="p-4 text-right font-medium">
                                                    {c.hourly_rate || 0}
                                                </td>

                                                {/* SHIFT */}
                                                <td className="p-4 text-right font-medium">
                                                    {c.rate_per_shift || 0}
                                                </td>

                                                {/* STATUS */}
                                                <td className="p-4 text-center">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${c.is_active
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-200 text-gray-600"
                                                            }`}
                                                    >
                                                        {c.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                {/* ACTION */}
                                                <td
                                                    className="p-4"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >

                                                    <div className="flex justify-end gap-3">

                                                        <button
                                                            onClick={() => handleEdit(c)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(c.id)}
                                                            disabled={loadingId === c.id}
                                                            className="text-red-500 hover:text-red-700"
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

                        {/* MOBILE CARDS */}
                        <div className="grid grid-cols-1 gap-4 lg:hidden">

                            {loading && (

                                <div className="bg-white rounded-3xl p-10 text-center text-gray-400 border border-blue-100">
                                    Loading...
                                </div>
                            )}

                            {!loading && crew.length === 0 && (

                                <div className="bg-white rounded-3xl p-10 text-center text-gray-400 border border-blue-100">
                                    No crew found
                                </div>
                            )}

                            {!loading && crew.map((c) => (

                                <div
                                    key={c.id}
                                    onClick={() =>
                                        router.push(`/dashboard/crew/${c.id}`)
                                    }
                                    className="bg-white border border-blue-100 rounded-3xl p-5 shadow-sm space-y-4"
                                >

                                    {/* TOP */}
                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {c.name}
                                            </h3>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {c.designation || "No designation"}
                                            </p>

                                        </div>

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${c.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {c.is_active ? "Active" : "Inactive"}
                                        </span>

                                    </div>

                                    {/* TAGS */}
                                    <div className="flex flex-wrap gap-2">

                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                                            {c.employment_type?.replace("_", " ")}
                                        </span>

                                        {c.skills?.slice(0, 2).map((skill, index) => (

                                            <span
                                                key={index}
                                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                            >
                                                {skill}
                                            </span>

                                        ))}

                                    </div>

                                    {/* INFO */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">

                                        <div>

                                            <p className="text-gray-400">
                                                Phone
                                            </p>

                                            <p className="font-medium mt-1">
                                                {c.phone || "-"}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-400">
                                                Hourly
                                            </p>

                                            <p className="font-medium mt-1">
                                                {c.hourly_rate || 0}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-gray-400">
                                                Shift Rate
                                            </p>

                                            <p className="font-medium mt-1">
                                                {c.rate_per_shift || 0}
                                            </p>

                                        </div>

                                    </div>

                                    {/* ACTIONS */}
                                    <div
                                        className="flex justify-end gap-3 pt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >

                                        <button
                                            onClick={() => handleEdit(c)}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-2xl transition"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-2xl transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>

                    </div>

                    {/* MODAL */}
                    {/* PREMIUM MODAL */}
                    {(openModal || editModal) && (

                        <div className="fixed inset-0 z-[9999] overflow-y-auto">

                            {/* BACKDROP */}
                            <div
                                onClick={() => {
                                    setOpenModal(false);
                                    setEditModal(false);
                                }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                            />

                            {/* CONTAINER */}
                            <div className="min-h-screen px-4 py-10 flex items-start justify-center">

                                {/* MODAL */}
                                <div className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-blue-100 overflow-hidden animate-in fade-in zoom-in duration-200">

                                    {/* TOP BAR */}
                                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 md:px-8 py-5 flex items-center justify-between">

                                        <div>

                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {editModal
                                                    ? "Edit Crew Member"
                                                    : "Add Crew Member"}
                                            </h2>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Manage workforce information & payroll structure
                                            </p>

                                        </div>

                                        <button
                                            onClick={() => {
                                                setOpenModal(false);
                                                setEditModal(false);
                                            }}
                                            className="w-10 h-10 rounded-2xl hover:bg-gray-100 transition flex items-center justify-center text-gray-500 hover:text-black"
                                        >
                                            ✕
                                        </button>

                                    </div>

                                    {/* BODY */}
                                    <div className="p-6 md:p-8 space-y-8 max-h-[85vh] overflow-y-auto">

                                        {/* BASIC INFO */}
                                        <div className="space-y-5">

                                            <div>

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Basic Information
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Personal & employment details
                                                </p>

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                <Input
                                                    placeholder="Full Name"
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            name: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    placeholder="Phone"
                                                    value={form.phone}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            phone: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    placeholder="Email"
                                                    value={form.email}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            email: e.target.value
                                                        })
                                                    }
                                                    className="md:col-span-2"
                                                />

                                                <Input
                                                    placeholder="Designation"
                                                    value={form.designation}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            designation: e.target.value
                                                        })
                                                    }
                                                />

                                                <select
                                                    value={form.employment_type}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            employment_type: e.target.value
                                                        })
                                                    }
                                                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 bg-white transition"
                                                >
                                                    <option value="freelancer">
                                                        Freelancer
                                                    </option>

                                                    <option value="full_time">
                                                        Full Time
                                                    </option>

                                                    <option value="part_time">
                                                        Part Time
                                                    </option>

                                                </select>

                                            </div>

                                        </div>

                                        {/* EXTRA INFO */}
                                        <div className="space-y-5">

                                            <div>

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Additional Information
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Internal workforce records
                                                </p>

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                <Input
                                                    type="date"
                                                    value={form.joining_date}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            joining_date: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    placeholder="CNIC"
                                                    value={form.cnic}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            cnic: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    placeholder="Emergency Contact"
                                                    value={form.emergency_contact}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            emergency_contact: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    placeholder="Profile Photo URL"
                                                    value={form.profile_photo}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            profile_photo: e.target.value
                                                        })
                                                    }
                                                />

                                                <textarea
                                                    rows={4}
                                                    placeholder="Address"
                                                    value={form.address}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            address: e.target.value
                                                        })
                                                    }
                                                    className="md:col-span-2 w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition resize-none"
                                                />

                                            </div>

                                        </div>

                                        {/* PAYROLL */}
                                        <div className="space-y-5">

                                            <div>

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Payroll Structure
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Salary & allowance management
                                                </p>

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                                                <Input
                                                    type="number"
                                                    placeholder="Basic Salary"
                                                    value={form.basic_salary}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            basic_salary: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    type="number"
                                                    placeholder="Rate Per Shift"
                                                    value={form.rate_per_shift}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            rate_per_shift: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    type="number"
                                                    placeholder="Hourly Rate"
                                                    value={form.hourly_rate}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            hourly_rate: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    type="number"
                                                    placeholder="Commission"
                                                    value={form.commission}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            commission: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    type="number"
                                                    placeholder="Home Allowance"
                                                    value={form.home_allowance}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            home_allowance: e.target.value
                                                        })
                                                    }
                                                />

                                                <Input
                                                    type="number"
                                                    placeholder="Fuel Allowance"
                                                    value={form.fuel_allowance}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            fuel_allowance: e.target.value
                                                        })
                                                    }
                                                />

                                            </div>

                                        </div>

                                        {/* SKILLS */}
                                        <div className="space-y-5">

                                            <div>

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Skills
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Add comma separated skills
                                                </p>

                                            </div>

                                            <Input
                                                placeholder="Camera, Drone, Lighting"
                                                value={form.skills?.join(", ")}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        skills: e.target.value
                                                            .split(",")
                                                            .map((s) => s.trim())
                                                            .filter(Boolean)
                                                    })
                                                }
                                            />

                                        </div>

                                        {/* NOTES */}
                                        <div className="space-y-5">

                                            <div>

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Notes
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Internal team remarks
                                                </p>

                                            </div>

                                            <textarea
                                                rows={5}
                                                placeholder="Additional notes..."
                                                value={form.notes}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        notes: e.target.value
                                                    })
                                                }
                                                className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition resize-none"
                                            />

                                        </div>

                                        {/* STATUS */}
                                        <div className="border border-blue-100 rounded-3xl p-5 flex items-center justify-between bg-blue-50/50">

                                            <div>

                                                <h4 className="font-semibold text-gray-900">
                                                    Active Status
                                                </h4>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Inactive crew members won't appear in scheduling
                                                </p>

                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        is_active: e.target.checked
                                                    })
                                                }
                                                className="w-6 h-6 accent-blue-600"
                                            />

                                        </div>

                                        {/* BUTTONS */}
                                        <div className="flex flex-col md:flex-row gap-4 pt-2">

                                            <button
                                                onClick={() => {
                                                    setOpenModal(false);
                                                    setEditModal(false);
                                                }}
                                                className="w-full border border-gray-200 hover:bg-gray-50 transition py-4 rounded-2xl font-medium"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={
                                                    editModal
                                                        ? handleUpdate
                                                        : handleSubmit
                                                }
                                                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                                            >
                                                {editModal
                                                    ? "Update Crew Member"
                                                    : "Save Crew Member"}
                                            </button>

                                        </div>

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

// ================= STAT CARD =================
function StatCard({ title, value, icon }) {

    return (

        <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                        {value}
                    </h3>

                </div>

                <div className="bg-blue-600 text-white p-3 rounded-2xl">
                    {icon}
                </div>

            </div>

        </div>
    );
}

function Input({
    className = "",
    ...props
}) {

    return (

        <input
            {...props}
            value={props.value ?? ""}
            className={`w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition ${className}`}
        />
    );
}