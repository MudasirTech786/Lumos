"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import {
    Wallet, DollarSign, TrendingUp, Receipt,
    ArrowLeft, ChevronRight, CheckCircle2,
    Clock, ShieldCheck, BadgeCheck, AlertCircle,
    Users, Briefcase,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
    draft: {
        label: "Draft",
        cls: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: <Clock size={13} />,
        step: 0,
    },
    approved: {
        label: "Approved",
        cls: "bg-blue-50 text-blue-700 border border-blue-200",
        icon: <ShieldCheck size={13} />,
        step: 1,
    },
    paid: {
        label: "Paid",
        cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: <BadgeCheck size={13} />,
        step: 2,
    },
};

const TYPE_CLS = {
    crew:     "bg-blue-50 text-blue-700 border border-blue-200",
    employee: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function PayrollDetailPage() {
    const params    = useParams();
    const router    = useRouter();
    const payrollId = params.id;

    const [loading,     setLoading]     = useState(true);
    const [payroll,     setPayroll]     = useState(null);
    const [items,       setItems]       = useState([]);
    const [confirming,  setConfirming]  = useState(null); // "approve" | "paid"
    const [actioning,   setActioning]   = useState(false);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const [payrollRes, itemsRes] = await Promise.all([
                api.get(`/payrolls/${payrollId}`),
                api.get(`/payrolls/${payrollId}/items`),
            ]);
            setPayroll(payrollRes.data);
            setItems(itemsRes.data || []);
        } catch {
            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load payroll" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (payrollId) fetchPayroll(); }, [payrollId]);

    const approvePayroll = async () => {
        const pToastId = progressToast.loading({ title: "Approving...", message: "Approving payroll..." });
        try {
            setActioning(true);
            await api.post(`/payrolls/${payrollId}/approve`);
            progressToast.success(pToastId, { title: "Approved", message: "Payroll approved successfully" });
            setConfirming(null);
            fetchPayroll();
        } catch {
            progressToast.error(pToastId, { title: "Error", message: "Approval failed" });
        } finally {
            setActioning(false);
        }
    };

    const markPaid = async () => {
        const pToastId = progressToast.loading({ title: "Processing...", message: "Marking payroll as paid..." });
        try {
            setActioning(true);
            await api.post(`/payrolls/${payrollId}/mark-paid`);
            progressToast.success(pToastId, { title: "Paid", message: "Payroll marked as paid" });
            setConfirming(null);
            fetchPayroll();
        } catch {
            progressToast.error(pToastId, { title: "Error", message: "Operation failed" });
        } finally {
            setActioning(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Wallet size={24} className="text-white" />
                    </div>
                    <p className="text-slate-500 text-base font-medium">Loading Payroll…</p>
                </div>
            </div>
        </Layout>
    );

    if (!payroll) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 text-base">Payroll not found</p>
            </div>
        </Layout>
    );

    const currentStatus = STATUS[payroll.status] ?? STATUS.draft;
    const currentStep   = currentStatus.step;
    const paidCount     = items.filter((i) => i.is_paid).length;
    const pendingCount  = items.length - paidCount;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 font-sans pb-20">

                {/* ── STICKY NAV ──────────────────────────────────────────── */}
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft size={15} /> Back to Payrolls
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
                        <Wallet size={13} />
                        <span>Payroll Runs</span>
                        <ChevronRight size={12} />
                        <span className="text-slate-700 font-semibold">{payroll.reference}</span>
                    </div>
                </div>

                {/* ── HERO BANNER ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 px-8 py-14">
                    <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full border border-white/[0.07] pointer-events-none" />
                    <div className="absolute -bottom-20 left-1/3 w-52 h-52 rounded-full bg-blue-500/10 pointer-events-none" />

                    <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
                                <Wallet size={11} /> Payroll Detail
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                {payroll.reference}
                            </h1>
                            <p className="mt-2 text-blue-300 text-base">
                                {fmtDate(payroll.period_start)} — {fmtDate(payroll.period_end)}
                            </p>
                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${currentStatus.cls}`}>
                                    {currentStatus.icon} {payroll.status}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize border ${TYPE_CLS[payroll.type?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                    {payroll.type === "crew" ? <Users size={11} /> : <Briefcase size={11} />}
                                    {payroll.type}
                                </span>
                            </div>
                        </div>

                        {/* action buttons */}
                        <div className="flex flex-shrink-0 gap-3 flex-wrap">
                            {payroll.status === "draft" && (
                                <button
                                    onClick={() => setConfirming("approve")}
                                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-900/40 transition-colors"
                                >
                                    <ShieldCheck size={15} /> Approve Payroll
                                </button>
                            )}
                            {payroll.status !== "paid" && (
                                <button
                                    onClick={() => setConfirming("paid")}
                                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-colors"
                                >
                                    <BadgeCheck size={15} /> Mark as Paid
                                </button>
                            )}
                            {payroll.status === "paid" && (
                                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-sm px-5 py-3 rounded-xl">
                                    <CheckCircle2 size={15} /> Payroll Completed
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── PAGE BODY ───────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pb-10">

                    {/* ── KPI CARDS ───────────────────────────────────────── */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-9 relative z-10">
                        <KpiCard title="Gross Amount"  value={fmt(payroll.gross_amount)}     icon={<DollarSign size={17} />} topColor="bg-blue-500"   iconBg="bg-blue-50 text-blue-600" />
                        <KpiCard title="Deductions"    value={fmt(payroll.deduction_amount)} icon={<Receipt size={17} />}    topColor="bg-rose-500"   iconBg="bg-rose-50 text-rose-600" valueColor="text-rose-600" />
                        <KpiCard title="Bonuses"       value={fmt(payroll.bonus_amount)}     icon={<TrendingUp size={17} />} topColor="bg-amber-500"  iconBg="bg-amber-50 text-amber-600" valueColor="text-amber-600" />
                        <KpiCard title="Net Amount"    value={fmt(payroll.net_amount)}       icon={<Wallet size={17} />}     topColor="bg-emerald-500" iconBg="bg-emerald-50 text-emerald-600" valueColor="text-emerald-600" />
                    </div>

                    {/* ── STATUS WORKFLOW ──────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <SectionHeader icon={<ShieldCheck size={15} />} title="Payroll Status" sub="Current workflow stage" />
                        <div className="px-6 py-6">
                            <div className="flex items-center gap-0">
                                {["Draft","Approved","Paid"].map((label, i) => {
                                    const done    = i < currentStep;
                                    const active  = i === currentStep;
                                    const isLast  = i === 2;
                                    return (
                                        <div key={label} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                                    ${done   ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"  : ""}
                                                    ${active ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100" : ""}
                                                    ${!done && !active ? "bg-slate-100 text-slate-400" : ""}
                                                `}>
                                                    {done ? <CheckCircle2 size={18} /> : i + 1}
                                                </div>
                                                <span className={`text-xs font-bold whitespace-nowrap ${active ? "text-blue-600" : done ? "text-emerald-600" : "text-slate-400"}`}>
                                                    {label}
                                                </span>
                                            </div>
                                            {!isLast && (
                                                <div className={`flex-1 h-1 mx-2 rounded-full mb-5 transition-all ${done ? "bg-emerald-400" : "bg-slate-100"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* action prompt */}
                            {payroll.status !== "paid" && (
                                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {payroll.status === "draft"
                                                    ? "This payroll is awaiting approval"
                                                    : "This payroll has been approved and is ready for payment"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {payroll.status === "draft"
                                                    ? "Review the items below and approve to proceed"
                                                    : "Mark as paid once all disbursements are complete"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        {payroll.status === "draft" && (
                                            <button
                                                onClick={() => setConfirming("approve")}
                                                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                                            >
                                                <ShieldCheck size={14} /> Approve
                                            </button>
                                        )}
                                        {payroll.status !== "paid" && (
                                            <button
                                                onClick={() => setConfirming("paid")}
                                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                                            >
                                                <BadgeCheck size={14} /> Mark Paid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {payroll.status === "paid" && (
                                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                                    <p className="text-sm font-bold text-emerald-800">
                                        Payroll fully paid — all {items.length} items have been disbursed.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── PAYROLL INFO ─────────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <SectionHeader icon={<Wallet size={15} />} title="Payroll Information" />
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                            <InfoField label="Reference"    value={payroll.reference} mono />
                            <InfoField label="Type"         value={
                                <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold capitalize border ${TYPE_CLS[payroll.type?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                    {payroll.type === "crew" ? <Users size={11} /> : <Briefcase size={11} />} {payroll.type}
                                </span>
                            } />
                            <InfoField label="Status"       value={
                                <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${currentStatus.cls}`}>
                                    {currentStatus.icon} {payroll.status}
                                </span>
                            } />
                            <InfoField label="Period Start" value={fmtDate(payroll.period_start)} />
                            <InfoField label="Period End"   value={fmtDate(payroll.period_end)} />
                            <InfoField label="Items"        value={`${items.length} employees`} />
                            <InfoField label="Paid Items"   value={
                                <span className="text-emerald-600 font-bold">{paidCount} paid</span>
                            } />
                            <InfoField label="Pending Items" value={
                                <span className={pendingCount > 0 ? "text-amber-600 font-bold" : "text-slate-600 font-bold"}>
                                    {pendingCount} pending
                                </span>
                            } />
                        </div>
                    </div>

                    {/* ── PAYROLL ITEMS TABLE ──────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <SectionHeader
                            icon={<Receipt size={15} />}
                            title="Payroll Items"
                            sub={`${items.length} entries · ${paidCount} paid · ${pendingCount} pending`}
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Description","Person Type","Quantity","Rate","Gross","Net","Status"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-slate-400 text-base">
                                                No payroll items found
                                            </td>
                                        </tr>
                                    ) : items.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                                            <td className="px-5 py-3.5 text-base font-semibold text-slate-900">
                                                {item.description}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize border ${TYPE_CLS[item.person_type?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                    {item.person_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-base text-slate-600">
                                                {item.quantity}
                                            </td>
                                            <td className="px-5 py-3.5 text-base text-slate-600 tabular-nums">
                                                {fmt(item.rate)}
                                            </td>
                                            <td className="px-5 py-3.5 text-base font-semibold text-slate-900 tabular-nums">
                                                {fmt(item.gross_amount)}
                                            </td>
                                            <td className="px-5 py-3.5 text-base font-bold text-emerald-600 tabular-nums">
                                                {fmt(item.net_amount)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {item.is_paid ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 size={11} /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock size={11} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {items.length > 0 && (
                            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-sm text-slate-400">
                                    {paidCount} of {items.length} items paid
                                </span>
                                <span className="text-base font-bold text-emerald-600">
                                    Net total: {fmt(payroll.net_amount)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── FOOTER ───────────────────────────────────────────── */}
                    <div className="text-center text-slate-400 text-sm pt-2 flex items-center justify-center gap-2">
                        <Wallet size={12} />
                        Payroll · {payroll.reference}
                    </div>
                </div>
            </div>

            {/* ── CONFIRM MODAL ───────────────────────────────────────────── */}
            {confirming && (
                <ConfirmModal
                    type={confirming}
                    loading={actioning}
                    onConfirm={confirming === "approve" ? approvePayroll : markPaid}
                    onClose={() => setConfirming(null)}
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
                {sub && <p className="text-sm text-slate-400 mt-1.5">{sub}</p>}
            </div>
        </div>
    );
}

function SectionHeader({ icon, title, sub }) {
    return (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className="text-blue-600">{icon}</span>
            <div>
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function InfoField({ label, value, mono }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <div className={`mt-1.5 text-base font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
                {value}
            </div>
        </div>
    );
}

function ConfirmModal({ type, loading, onConfirm, onClose }) {
    const isApprove = type === "approve";
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

                {/* header */}
                <div className={`px-6 py-5 ${isApprove ? "bg-blue-50 border-b border-blue-100" : "bg-emerald-50 border-b border-emerald-100"}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isApprove ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                            {isApprove ? <ShieldCheck size={18} /> : <BadgeCheck size={18} />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {isApprove ? "Approve Payroll" : "Mark as Paid"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
                        </div>
                    </div>
                </div>

                {/* body */}
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600">
                        {isApprove
                            ? "Are you sure you want to approve this payroll? Once approved, it will be ready for disbursement."
                            : "Are you sure you want to mark this payroll as fully paid? This confirms that all payments have been disbursed."}
                    </p>
                </div>

                {/* footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60
                            ${isApprove
                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"}`}
                    >
                        {loading
                            ? "Processing…"
                            : isApprove ? "Yes, Approve" : "Yes, Mark Paid"}
                    </button>
                </div>

            </div>
        </div>
    );
}