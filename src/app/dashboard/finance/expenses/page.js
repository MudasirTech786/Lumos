"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
    Plus, Pencil, Trash2, Receipt, Search,
    X, Filter, ArrowLeft, TrendingUp, Layers,
    Camera, ChevronRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-PK");
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Category chip colours ────────────────────────────────────────────────────
const CAT_CLS = {
    transport:  "bg-blue-50 text-blue-700 border border-blue-200",
    food:       "bg-emerald-50 text-emerald-700 border border-emerald-200",
    equipment:  "bg-amber-50 text-amber-700 border border-amber-200",
    rental:     "bg-purple-50 text-purple-700 border border-purple-200",
    misc:       "bg-slate-100 text-slate-600 border border-slate-200",
};
const catCls = (cat = "") =>
    CAT_CLS[cat.toLowerCase()] ?? "bg-blue-50 text-blue-700 border border-blue-200";

// ─── Reusable form field ──────────────────────────────────────────────────────
function FormField({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

const inputCls =
    "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition font-sans";

export default function ShootExpensesPage() {
    const router = useRouter();

    const [loading,         setLoading]         = useState(true);
    const [expenses,        setExpenses]         = useState([]);
    const [shoots,          setShoots]           = useState([]);
    const [search,          setSearch]           = useState("");
    const [showCreate,      setShowCreate]       = useState(false);
    const [showEdit,        setShowEdit]         = useState(false);
    const [selectedExpense, setSelectedExpense]  = useState(null);
    const [form,            setForm]             = useState({ shoot_id: "", category: "", description: "", amount: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expensesRes, shootsRes] = await Promise.all([
                api.get("/shoot-expenses"),
                api.get("/shoots"),
            ]);
            setExpenses(expensesRes.data?.data || []);
            setShoots(shootsRes.data || []);
        } catch {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => setForm({ shoot_id: "", category: "", description: "", amount: "" });

    const createExpense = async () => {
        try {
            await api.post("/shoot-expenses", form);
            toast.success("Expense created");
            setShowCreate(false); resetForm(); fetchData();
        } catch { toast.error("Failed to create expense"); }
    };

    const openEdit = (expense) => {
        setSelectedExpense(expense);
        setForm({ shoot_id: expense.shoot_id, category: expense.category, description: expense.description, amount: expense.amount });
        setShowEdit(true);
    };

    const updateExpense = async () => {
        try {
            await api.put(`/shoot-expenses/${selectedExpense.id}`, form);
            toast.success("Expense updated");
            setShowEdit(false); fetchData();
        } catch { toast.error("Failed to update expense"); }
    };

    const deleteExpense = async (id) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await api.delete(`/shoot-expenses/${id}`);
            toast.success("Expense deleted"); fetchData();
        } catch { toast.error("Failed to delete expense"); }
    };

    const q = search.toLowerCase().trim();
    const filteredExpenses = expenses.filter((expense) => {
        if (!q) return true;
        const shoot = shoots.find((s) => s.id === expense.shoot_id);
        return (
            expense.description?.toLowerCase().includes(q) ||
            expense.category?.toLowerCase().includes(q) ||
            shoot?.title?.toLowerCase().includes(q) ||
            String(expense.amount).includes(q) ||
            fmtDate(expense.created_at).toLowerCase().includes(q)
        );
    });

    const totalAmount      = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const uniqueCategories = [...new Set(expenses.map((e) => e.category).filter(Boolean))].length;
    const uniqueShoots     = [...new Set(expenses.map((e) => e.shoot_id))].length;
    const avgAmount        = expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0;
    const filteredTotal    = filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Receipt size={24} className="text-white" />
                    </div>
                    <p className="text-slate-500 text-base font-medium">Loading Expenses…</p>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 font-sans pb-20">

                {/* ── HERO BANNER ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 px-8 py-14">
                    <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full border border-white/[0.07] pointer-events-none" />
                    <div className="absolute -bottom-20 left-1/3 w-52 h-52 rounded-full bg-blue-500/10 pointer-events-none" />

                    <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            {/* breadcrumb */}
                            <div className="flex items-center gap-2 text-blue-300/70 text-xs mb-4">
                                <button
                                    onClick={() => router.back()}
                                    className="inline-flex items-center gap-1.5 hover:text-blue-200 transition-colors"
                                >
                                    <ArrowLeft size={13} /> Finance
                                </button>
                                <ChevronRight size={12} />
                                <span className="text-blue-200 font-semibold">Shoot Expenses</span>
                            </div>

                            {/* eyebrow */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
                                <Receipt size={11} />
                                Expense Management
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                Shoot Expenses
                            </h1>
                            <p className="mt-2 text-blue-300 text-base">
                                Manage and track all production expenses
                            </p>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-900/40 transition-colors"
                        >
                            <Plus size={16} /> Add Expense
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS ───────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-9 relative z-10">

                        <KpiCard
                            title="Total Spent"
                            value={`Rs ${fmt(totalAmount)}`}
                            sub={`${expenses.length} records total`}
                            icon={<Receipt size={17} />}
                            topColor="bg-blue-500"
                            iconBg="bg-blue-50 text-blue-600"
                        />
                        <KpiCard
                            title="Avg per Expense"
                            value={`Rs ${fmt(avgAmount)}`}
                            sub="Per expense record"
                            icon={<TrendingUp size={17} />}
                            topColor="bg-emerald-500"
                            iconBg="bg-emerald-50 text-emerald-600"
                        />
                        <KpiCard
                            title="Categories"
                            value={uniqueCategories}
                            sub="Unique expense types"
                            icon={<Layers size={17} />}
                            topColor="bg-purple-500"
                            iconBg="bg-purple-50 text-purple-600"
                        />
                        <KpiCard
                            title="Productions"
                            value={uniqueShoots}
                            sub="Shoots with expenses"
                            icon={<Camera size={17} />}
                            topColor="bg-amber-500"
                            iconBg="bg-amber-50 text-amber-600"
                        />

                    </div>
                </div>

                {/* ── PAGE BODY ───────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-4">

                    {/* ── FILTER BAR ──────────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by description, category, shoot, amount…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 whitespace-nowrap">
                            <Filter size={13} />
                            {filteredExpenses.length} result{filteredExpenses.length !== 1 ? "s" : ""}
                        </div>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* ── TABLE ───────────────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                        {/* panel header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Receipt size={15} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Expense Records</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">All logged production expenses</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                            >
                                <Plus size={14} /> Add Expense
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["#","Category","Shoot","Description","Amount","Date","Actions"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-slate-400 text-base">
                                                {search
                                                    ? `No results for "${search}"`
                                                    : "No expenses yet. Click Add Expense to get started."}
                                            </td>
                                        </tr>
                                    ) : filteredExpenses.map((expense, idx) => {
                                        const shoot = shoots.find((s) => s.id === expense.shoot_id);
                                        return (
                                            <tr key={expense.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3.5 text-sm font-semibold text-slate-400 w-10">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${catCls(expense.category)}`}>
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-base font-bold text-slate-900 whitespace-nowrap">
                                                    {shoot?.title || `Shoot #${expense.shoot_id}`}
                                                </td>
                                                <td className="px-5 py-3.5 text-base text-slate-600 max-w-[220px]">
                                                    <div className="truncate">{expense.description || "—"}</div>
                                                </td>
                                                <td className="px-5 py-3.5 text-base font-bold text-slate-900 whitespace-nowrap">
                                                    Rs {fmt(expense.amount)}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                                                    {fmtDate(expense.created_at)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEdit(expense)}
                                                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteExpense(expense.id)}
                                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* table footer */}
                        {filteredExpenses.length > 0 && (
                            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-sm text-slate-400">
                                    Showing {filteredExpenses.length} of {expenses.length} expenses
                                </span>
                                <span className="text-base font-bold text-slate-700">
                                    Filtered total: Rs {fmt(filteredTotal)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── FOOTER ───────────────────────────────────────────── */}
                    <div className="text-center text-slate-400 text-sm pt-4 flex items-center justify-center gap-2">
                        <Receipt size={12} />
                        Shoot Expenses · {expenses.length} records
                    </div>

                </div>
            </div>

            {/* ── MODALS ──────────────────────────────────────────────────── */}
            {showCreate && (
                <ExpenseModal
                    title="Add Expense"
                    submitLabel="Create Expense"
                    form={form}
                    setForm={setForm}
                    shoots={shoots}
                    onSubmit={createExpense}
                    onClose={() => { setShowCreate(false); resetForm(); }}
                />
            )}
            {showEdit && (
                <ExpenseModal
                    title="Edit Expense"
                    submitLabel="Update Expense"
                    form={form}
                    setForm={setForm}
                    shoots={shoots}
                    onSubmit={updateExpense}
                    onClose={() => setShowEdit(false)}
                />
            )}
        </Layout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, topColor, iconBg }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className={`h-1 w-full ${topColor}`} />
            <div className="p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
                    {icon}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight leading-tight">
                    {value}
                </p>
                <p className="text-sm text-slate-400 mt-1.5">{sub}</p>
            </div>
        </div>
    );
}

function ExpenseModal({ title, submitLabel, form, setForm, shoots, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                {/* header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Receipt size={15} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    <FormField label="Shoot">
                        <select
                            value={form.shoot_id}
                            onChange={(e) => setForm({ ...form, shoot_id: e.target.value })}
                            className={inputCls}
                        >
                            <option value="">Select Shoot</option>
                            {shoots.map((shoot) => (
                                <option key={shoot.id} value={shoot.id}>{shoot.title}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Category">
                        <input
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className={inputCls}
                            placeholder="e.g. Transport, Food, Equipment"
                        />
                    </FormField>
                    <FormField label="Description">
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            className={`${inputCls} resize-y`}
                        />
                    </FormField>
                    <FormField label="Amount (Rs)">
                        <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className={inputCls}
                            placeholder="0"
                        />
                    </FormField>
                </div>

                {/* footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                    >
                        {submitLabel}
                    </button>
                </div>

            </div>
        </div>
    );
}