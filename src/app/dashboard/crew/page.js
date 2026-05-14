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
    Sparkles,
    BadgeDollarSign,
    FileText,

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

                                Crew Management

                            </h1>

                            <p className="
    mt-4
    max-w-3xl
    text-base
    leading-relaxed
    text-gray-500
  ">

                                Manage production workforce, freelancers,
                                operational staffing and crew coordination
                                across active production pipelines.

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

                    {/* ===================================================== */}
                    {/* CREW STATS */}
                    {/* ===================================================== */}

                    <div className="
  relative
  overflow-hidden
  rounded-[36px]
  border
  border-blue-200/20
  bg-gradient-to-br
  from-[#071120]
  via-[#0f3ba8]
  to-[#2563eb]
  p-6
  shadow-[0_25px_120px_rgba(37,99,235,0.25)]
">

                        {/* BACKGROUND LIGHT */}

                        <div className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.10),transparent_30%)]
  " />

                        {/* GRID */}

                        <div className="
    absolute
    inset-0
    opacity-[0.05]
    [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
    [background-size:42px_42px]
  " />

                        {/* GLOW */}

                        <div className="
    absolute
    top-[-120px]
    right-[-100px]
    h-[320px]
    w-[320px]
    rounded-full
    bg-cyan-300/20
    blur-[120px]
  " />

                        <div className="
    absolute
    bottom-[-140px]
    left-[-100px]
    h-[280px]
    w-[280px]
    rounded-full
    bg-blue-500/20
    blur-[120px]
  " />

                        {/* CONTENT */}

                        <div className="
    relative
    z-10
  ">

                            <div className="
      grid
      grid-cols-2
      gap-5
      xl:grid-cols-4
    ">

                                <AdminMetricCard
                                    title="Total Crew"
                                    value={stats.total}
                                    icon={<Users size={18} />}
                                />

                                <AdminMetricCard
                                    title="Freelancers"
                                    value={stats.freelancers}
                                    icon={<Briefcase size={18} />}
                                />

                                <AdminMetricCard
                                    title="Full Time"
                                    value={stats.fullTime}
                                    icon={<UserCheck size={18} />}
                                />

                                <AdminMetricCard
                                    title="Inactive"
                                    value={stats.inactive}
                                    icon={<UserX size={18} />}
                                />

                            </div>

                        </div>

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
                    {(openModal || editModal) && (

                        <div className="
    fixed
    inset-0
    z-[9999]
    overflow-y-auto
    bg-[#020817]/70
    backdrop-blur-md
  ">

                            {/* BACKDROP */}
                            <div
                                onClick={() => {
                                    setOpenModal(false);
                                    setEditModal(false);
                                }}
                                className="fixed inset-0"
                            />

                            {/* ===================================================== */}
                            {/* WRAPPER */}
                            {/* ===================================================== */}

                            <div className="
      relative
      flex
      min-h-screen
      items-start
      justify-center
      px-4
      py-8
      md:items-center
    ">

                                {/* ===================================================== */}
                                {/* MODAL */}
                                {/* ===================================================== */}

                                <div className="
        relative
        mt-12
        w-full
        max-w-6xl
        max-h-[90vh]
        overflow-y-auto
        no-scrollbar
        rounded-[38px]
        border
        border-blue-100/70
        bg-[rgba(255,255,255,0.92)]
        shadow-[0_25px_120px_rgba(37,99,235,0.18)]
        backdrop-blur-3xl
      ">

                                    {/* GRID BG */}

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
          absolute
          -top-24
          right-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-blue-400/20
          blur-[120px]
        " />

                                    <div className="
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
          border-b
          border-blue-100/70
          bg-white/85
          px-6
          py-5
          backdrop-blur-2xl
          md:px-8
        ">

                                        <div className="
            flex
            items-start
            justify-between
            gap-4
          ">

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

                                                    Crew Operations

                                                </div>

                                                <h2 className="
                mt-4
                text-3xl
                font-black
                tracking-[-0.05em]
                text-slate-900
              ">

                                                    {editModal
                                                        ? "Edit Crew Member"
                                                        : "Create Crew Member"}

                                                </h2>

                                                <p className="
                mt-2
                max-w-2xl
                text-sm
                leading-relaxed
                text-slate-500
              ">

                                                    Manage workforce information,
                                                    payroll structure, operational records
                                                    and production crew assignments.

                                                </p>

                                            </div>

                                            <button
                                                onClick={() => {
                                                    setOpenModal(false);
                                                    setEditModal(false);
                                                }}
                                                className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-100
                bg-white
                text-slate-500
                transition-all
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
                                        {/* BASIC INFO */}
                                        {/* ===================================================== */}

                                        <GlassSection
                                            title="Basic Information"
                                            subtitle="Personal & operational details"
                                            icon={<Users size={20} />}
                                        >

                                            <div className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            ">

                                                <Input
                                                    label="Full Name"
                                                    placeholder="John Carter"
                                                    value={form.name || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            name: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Phone Number"
                                                    placeholder="+92 300 0000000"
                                                    value={form.phone || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            phone: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Email Address"
                                                    placeholder="john@email.com"
                                                    value={form.email || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            email: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Designation"
                                                    placeholder="Camera Operator"
                                                    value={form.designation || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            designation: e.target.value,
                                                        })
                                                    }
                                                />

                                            </div>

                                        </GlassSection>

                                        {/* ===================================================== */}
                                        {/* EXTRA */}
                                        {/* ===================================================== */}

                                        <GlassSection
                                            title="Additional Information"
                                            subtitle="Internal workforce records"
                                            icon={<Briefcase size={20} />}
                                        >

                                            <div className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            ">

                                                <Input
                                                    label="Joining Date"
                                                    type="date"
                                                    value={form.joining_date || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            joining_date: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="CNIC"
                                                    placeholder="42101-1234567-1"
                                                    value={form.cnic || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            cnic: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Emergency Contact"
                                                    placeholder="+92 300 0000000"
                                                    value={form.emergency_contact || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            emergency_contact: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Profile Photo URL"
                                                    placeholder="https://..."
                                                    value={form.profile_photo || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            profile_photo: e.target.value,
                                                        })
                                                    }
                                                />

                                            </div>

                                        </GlassSection>

                                        {/* ===================================================== */}
                                        {/* PAYROLL */}
                                        {/* ===================================================== */}

                                        <GlassSection
                                            title="Payroll Structure"
                                            subtitle="Salary & allowance management"
                                            icon={<BadgeDollarSign size={20} />}
                                        >

                                            <div className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            ">

                                                <Input
                                                    label="Basic Salary"
                                                    type="number"
                                                    placeholder="150000"
                                                    value={form.basic_salary || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            basic_salary: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Rate Per Shift"
                                                    type="number"
                                                    placeholder="12000"
                                                    value={form.rate_per_shift || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            rate_per_shift: e.target.value,
                                                        })
                                                    }
                                                />

                                                <Input
                                                    label="Hourly Rate"
                                                    type="number"
                                                    placeholder="2500"
                                                    value={form.hourly_rate || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            hourly_rate: e.target.value,
                                                        })
                                                    }
                                                />

                                            </div>

                                        </GlassSection>

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
                                                onClick={() => {
                                                    setOpenModal(false);
                                                    setEditModal(false);
                                                }}
                                                className="
                w-full
                rounded-2xl
                border
                border-blue-100
                bg-white
                py-4
                font-semibold
                text-slate-700
                transition-all
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
                hover:bg-blue-700
              "
                                            >

                                                {editModal
                                                    ? "Update Crew Member"
                                                    : "Create Crew Member"}

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


function AdminMetricCard({
    title,
    value,
    icon,
}) {

    return (

        <div className="
      relative
      overflow-hidden
      rounded-[28px]
      border
      border-white/10
      bg-white/10
      p-5
      backdrop-blur-2xl
      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
      transition-all
      duration-300
      hover:translate-y-[-2px]
      hover:bg-white/[0.12]
    ">

            {/* GLOW */}

            <div className="
        absolute
        right-[-30px]
        top-[-30px]
        h-28
        w-28
        rounded-full
        bg-cyan-300/10
        blur-3xl
      " />

            {/* CONTENT */}

            <div className="
        relative
        z-10
        flex
        items-start
        justify-between
      ">

                <div>

                    <p className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.22em]
            text-blue-100/70
          ">

                        {title}

                    </p>

                    <h3 className="
            mt-4
            text-4xl
            font-black
            tracking-[-0.05em]
            text-white
          ">

                        {value}

                    </h3>

                </div>

                <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-white/10
          text-cyan-200
          backdrop-blur-xl
        ">

                    {icon}

                </div>

            </div>

        </div>
    );
}

function SectionHeader({
    title,
    subtitle,
    icon,
}) {

    return (

        <div className="
      flex
      items-center
      gap-4
    ">

            <div className="
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-3xl
        bg-blue-100
        text-blue-700
        shadow-[0_10px_30px_rgba(37,99,235,0.12)]
      ">

                {icon}

            </div>

            <div>

                <h3 className="
          text-xl
          font-bold
          tracking-[-0.03em]
          text-slate-900
        ">

                    {title}

                </h3>

                <p className="
          mt-1
          text-sm
          text-slate-500
        ">

                    {subtitle}

                </p>

            </div>

        </div>
    );
}

function GlassSection({
    title,
    subtitle,
    icon,
    children,
}) {

    return (

        <div className="
      relative
      overflow-hidden
      rounded-[32px]
      border
      border-blue-100/80
      bg-white/75
      p-6
      shadow-[0_10px_40px_rgba(37,99,235,0.06)]
      backdrop-blur-2xl
    ">

            {/* GRID */}

            <div className="
        pointer-events-none
        absolute
        inset-0
        opacity-[0.03]
        [background-image:linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)]
        [background-size:34px_34px]
      " />

            {/* GLOW */}

            <div className="
        absolute
        top-[-60px]
        right-[-60px]
        h-[160px]
        w-[160px]
        rounded-full
        bg-blue-200/20
        blur-[70px]
      " />

            {/* CONTENT */}

            <div className="relative z-10">

                {/* HEADER */}

                <div className="
          mb-6
          flex
          items-start
          gap-4
        ">

                    <div className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-3xl
            bg-blue-100
            text-blue-700
            shadow-[0_10px_30px_rgba(37,99,235,0.18)]
          ">

                        {icon}

                    </div>

                    <div>

                        <h3 className="
              text-xl
              font-black
              tracking-[-0.03em]
              text-slate-900
            ">

                            {title}

                        </h3>

                        <p className="
              mt-1
              text-sm
              text-slate-500
            ">

                            {subtitle}

                        </p>

                    </div>

                </div>

                {/* BODY */}

                {children}

            </div>

        </div>
    );
}