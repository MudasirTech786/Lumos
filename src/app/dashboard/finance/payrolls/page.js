"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import Link from "next/link";
import progressToast from "@/lib/progressToast";
import {
    Wallet, Users, Briefcase, ArrowUpRight,
    X, Calendar, TrendingUp, Clock, CheckCircle2,
    ChevronRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-PK");
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Status chip ──────────────────────────────────────────────────────────────
const STATUS_CLS = {
    paid:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
    approved: "bg-blue-50 text-blue-700 border border-blue-200",
    draft:    "bg-amber-50 text-amber-700 border border-amber-200",
    pending:  "bg-amber-50 text-amber-700 border border-amber-200",
};
const statusCls = (s) => STATUS_CLS[s?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border border-slate-200";

// ─── Type chip ────────────────────────────────────────────────────────────────
const TYPE_CLS = {
    crew:     "bg-blue-50 text-blue-700 border border-blue-200",
    employee: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};
const typeCls = (t) => TYPE_CLS[t?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border border-slate-200";

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls =
    "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition font-sans";

export default function PayrollRunsPage() {
    const [loading,             setLoading]             = useState(true);
    const [payrolls,            setPayrolls]            = useState([]);
    const [showCrewModal,       setShowCrewModal]       = useState(false);
    const [showEmployeeModal,   setShowEmployeeModal]   = useState(false);
    const [crewForm,            setCrewForm]            = useState({ start_date: "", end_date: "" });
    const [employeeForm,        setEmployeeForm]        = useState({ start_date: "", end_date: "" });

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payrolls");
            setPayrolls(res.data?.data || []);
        } catch {
            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load payrolls" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayrolls(); }, []);

    const generateCrewPayroll = async () => {
        const pToastId = progressToast.loading({ title: "Generating...", message: "Generating crew payroll..." });
        try {
            await api.post("/payrolls/generate-crew", crewForm);
            progressToast.success(pToastId, { title: "Generated", message: "Crew payroll generated successfully" });
            setShowCrewModal(false); fetchPayrolls();
        } catch { progressToast.error(pToastId, { title: "Error", message: "Failed to generate payroll" }); }
    };

    const generateEmployeePayroll = async () => {
        const pToastId = progressToast.loading({ title: "Generating...", message: "Generating employee payroll..." });
        try {
            await api.post("/payrolls/generate-employee", employeeForm);
            progressToast.success(pToastId, { title: "Generated", message: "Employee payroll generated successfully" });
            setShowEmployeeModal(false); fetchPayrolls();
        } catch { progressToast.error(pToastId, { title: "Error", message: "Failed to generate payroll" }); }
    };

    // ── Derived stats ────────────────────────────────────────────────────────
    const totalGross   = payrolls.reduce((a, p) => a + Number(p.gross_amount || 0), 0);
    const totalNet     = payrolls.reduce((a, p) => a + Number(p.net_amount    || 0), 0);
    const paidCount    = payrolls.filter((p) => p.status === "paid").length;
    const pendingCount = payrolls.filter((p) => p.status !== "paid").length;

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Wallet size={24} className="text-white" />
                    </div>
                    <p className="text-slate-500 text-base font-medium">Loading Payrolls…</p>
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
                                <span>Finance</span>
                                <ChevronRight size={12} />
                                <span className="text-blue-200 font-semibold">Payroll Runs</span>
                            </div>

                            {/* eyebrow */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
                                <Wallet size={11} />
                                Payroll Management
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                Payroll Runs
                            </h1>
                            <p className="mt-2 text-blue-300 text-base">
                                Generate and manage crew &amp; employee payrolls
                            </p>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-wrap gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowCrewModal(true)}
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-900/40 transition-colors"
                            >
                                <Users size={15} /> Crew Payroll
                            </button>
                            <button
                                onClick={() => setShowEmployeeModal(true)}
                                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-colors"
                            >
                                <Briefcase size={15} /> Employee Payroll
                            </button>
                        </div>

                    </div>
                </div>

                {/* ── KPI CARDS ───────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-9 relative z-10">

                        <KpiCard
                            title="Total Gross"
                            value={`Rs ${fmt(totalGross)}`}
                            sub={`${payrolls.length} payroll runs`}
                            icon={<Wallet size={17} />}
                            topColor="bg-blue-500"
                            iconBg="bg-blue-50 text-blue-600"
                        />
                        <KpiCard
                            title="Total Net"
                            value={`Rs ${fmt(totalNet)}`}
                            sub="After deductions"
                            icon={<TrendingUp size={17} />}
                            topColor="bg-emerald-500"
                            iconBg="bg-emerald-50 text-emerald-600"
                            valueColor="text-emerald-600"
                        />
                        <KpiCard
                            title="Paid"
                            value={paidCount}
                            sub="Completed runs"
                            icon={<CheckCircle2 size={17} />}
                            topColor="bg-violet-500"
                            iconBg="bg-violet-50 text-violet-600"
                        />
                        <KpiCard
                            title="Pending"
                            value={pendingCount}
                            sub="Awaiting payment"
                            icon={<Clock size={17} />}
                            topColor="bg-amber-500"
                            iconBg="bg-amber-50 text-amber-600"
                        />

                    </div>
                </div>

                {/* ── PAGE BODY ───────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-4 pb-10">

                    {/* ── PAYROLL TABLE ────────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                        {/* panel header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Wallet size={15} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">All Payroll Runs</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">{payrolls.length} total records</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex gap-3">
                                <button
                                    onClick={() => setShowCrewModal(true)}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                                >
                                    <Users size={14} /> Crew
                                </button>
                                <button
                                    onClick={() => setShowEmployeeModal(true)}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                                >
                                    <Briefcase size={14} /> Employee
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Reference","Type","Period","Gross","Net","Status","Action"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-slate-400 text-base">
                                                No payroll runs yet. Generate one using the buttons above.
                                            </td>
                                        </tr>
                                    ) : payrolls.map((payroll) => (
                                        <tr key={payroll.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">

                                            {/* reference */}
                                            <td className="px-5 py-3.5">
                                                <p className="text-base font-bold text-slate-900">{payroll.reference}</p>
                                                <span className="bg-slate-100 text-slate-600 font-mono text-xs px-2 py-0.5 rounded-md mt-1 inline-block">
                                                    #{payroll.id}
                                                </span>
                                            </td>

                                            {/* type */}
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${typeCls(payroll.type)}`}>
                                                    {payroll.type}
                                                </span>
                                            </td>

                                            {/* period */}
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-slate-700">{fmtDate(payroll.period_start)}</p>
                                                <p className="text-xs text-slate-400 my-0.5">to</p>
                                                <p className="text-sm font-semibold text-slate-700">{fmtDate(payroll.period_end)}</p>
                                            </td>

                                            {/* gross */}
                                            <td className="px-5 py-3.5 text-base font-bold text-slate-900 whitespace-nowrap tabular-nums">
                                                Rs {fmt(payroll.gross_amount)}
                                            </td>

                                            {/* net */}
                                            <td className="px-5 py-3.5 text-base font-bold text-emerald-600 whitespace-nowrap tabular-nums">
                                                Rs {fmt(payroll.net_amount)}
                                            </td>

                                            {/* status */}
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${statusCls(payroll.status)}`}>
                                                    {payroll.status}
                                                </span>
                                            </td>

                                            {/* action */}
                                            <td className="px-5 py-3.5">
                                                <Link
                                                    href={`/dashboard/finance/payrolls/${payroll.id}`}
                                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Open <ArrowUpRight size={13} />
                                                </Link>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* table footer */}
                        {payrolls.length > 0 && (
                            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-sm text-slate-400">{payrolls.length} payroll runs</span>
                                <span className="text-base font-bold text-slate-700">
                                    Net total: Rs {fmt(totalNet)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── FOOTER ───────────────────────────────────────────── */}
                    <div className="text-center text-slate-400 text-sm pt-4 flex items-center justify-center gap-2">
                        <Wallet size={12} />
                        Payroll Runs · {payrolls.length} records
                    </div>

                </div>
            </div>

            {/* ── MODALS ──────────────────────────────────────────────────── */}
            {showCrewModal && (
                <PayrollModal
                    title="Generate Crew Payroll"
                    accentClass="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    iconBg="bg-blue-50 text-blue-600"
                    form={crewForm}
                    setForm={setCrewForm}
                    onSubmit={generateCrewPayroll}
                    onClose={() => setShowCrewModal(false)}
                    submitLabel="Generate Payroll"
                />
            )}
            {showEmployeeModal && (
                <PayrollModal
                    title="Generate Employee Payroll"
                    accentClass="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                    iconBg="bg-emerald-50 text-emerald-600"
                    form={employeeForm}
                    setForm={setEmployeeForm}
                    onSubmit={generateEmployeePayroll}
                    onClose={() => setShowEmployeeModal(false)}
                    submitLabel="Generate Payroll"
                />
            )}

        </Layout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, topColor, iconBg, valueColor = "text-slate-900" }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className={`h-1 w-full ${topColor}`} />
            <div className="p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
                    {icon}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-1.5 tracking-tight leading-tight ${valueColor}`}>
                    {value}
                </p>
                <p className="text-sm text-slate-400 mt-1.5">{sub}</p>
            </div>
        </div>
    );
}

function PayrollModal({ title, accentClass, iconBg, form, setForm, onSubmit, onClose, submitLabel }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                {/* header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                            <Calendar size={15} />
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
                <div className="px-6 py-5 flex flex-col gap-5">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-500">
                        Select the payroll period date range to generate payroll entries for all active members.
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                    </div>
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
                        className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-colors shadow-sm ${accentClass}`}
                    >
                        {submitLabel}
                    </button>
                </div>

            </div>
        </div>
    );
}