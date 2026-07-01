"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import Link from "next/link";
import progressToast from "@/lib/progressToast";
import {
    DollarSign, TrendingUp, Receipt, Clock,
    Briefcase, Users, ArrowUpRight, Landmark,
    Calendar, CheckCircle2, ArrowRight, BarChart3,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CLS = {
    completed:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
    active:        "bg-blue-50 text-blue-700 border border-blue-200",
    "in progress": "bg-blue-50 text-blue-700 border border-blue-200",
    pending:       "bg-amber-50 text-amber-700 border border-amber-200",
    paid:          "bg-emerald-50 text-emerald-700 border border-emerald-200",
    approved:      "bg-blue-50 text-blue-700 border border-blue-200",
    draft:         "bg-slate-100 text-slate-500 border border-slate-200",
};

function StatusPill({ status = "draft" }) {
    const cls = STATUS_CLS[status.toLowerCase()] ?? STATUS_CLS.draft;
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${cls}`}>
            {status}
        </span>
    );
}

export default function FinanceDashboardPage() {
    const [loading,    setLoading]    = useState(true);
    const [shoots,     setShoots]     = useState([]);
    const [payrolls,   setPayrolls]   = useState([]);
    const [financeMap, setFinanceMap] = useState({});

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const [shootsRes, payrollsRes] = await Promise.all([
                api.get("/shoots"),
                api.get("/payrolls"),
            ]);
            const shootsData  = shootsRes.data || [];
            const payrollData = payrollsRes.data?.data || [];

            const financeResults = await Promise.all(
                shootsData.map(async (shoot) => {
                    try {
                        const res = await api.get(`/shoots/${shoot.id}/finance`);
                        return { shootId: shoot.id, finance: res.data };
                    } catch {
                        return { shootId: shoot.id, finance: { total_cost: 0, revenue: 0, profit: 0 } };
                    }
                })
            );
            const map = {};
            financeResults.forEach(({ shootId, finance }) => (map[shootId] = finance));
            setFinanceMap(map);
            setShoots(shootsData);
            setPayrolls(payrollData);
        } catch {
            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load finance dashboard" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const stats = useMemo(() => {
        let totalRevenue = 0, totalCost = 0, totalProfit = 0;
        Object.values(financeMap).forEach(({ revenue, total_cost, profit }) => {
            totalRevenue += Number(revenue    || 0);
            totalCost    += Number(total_cost || 0);
            totalProfit  += Number(profit     || 0);
        });
        const pendingPayroll = payrolls
            .filter((p) => p.status !== "paid")
            .reduce((sum, p) => sum + Number(p.net_amount || 0), 0);
        return { totalRevenue, totalCost, totalProfit, pendingPayroll };
    }, [financeMap, payrolls]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Landmark size={24} className="text-white" />
                    </div>
                    <p className="text-slate-500 text-base font-medium">Loading Finance Dashboard…</p>
                </div>
            </div>
        </Layout>
    );

    const marginPct  = pct(stats.totalProfit, stats.totalRevenue);
    const costPct    = pct(stats.totalCost,   stats.totalRevenue);
    const pendingRuns = payrolls.filter((p) => p.status !== "paid").length;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 font-sans">

                {/* ── HERO BANNER ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 px-8 py-14">
                    {/* decorative rings */}
                    <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
                    <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full border border-white/[0.07] pointer-events-none" />
                    <div className="absolute -bottom-20 left-1/3 w-52 h-52 rounded-full bg-blue-500/10 pointer-events-none" />

                    <div className="relative max-w-6xl mx-auto">
                        {/* eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-300 text-base font-bold uppercase tracking-widest mb-5">
                            <Landmark size={11} />
                            Finance Overview
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Production Finance
                        </h1>
                        <p className="mt-3 text-blue-300 text-base">
                            Financial overview of productions, payrolls and expenses
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mt-5">
                            {[
                                { icon: <Calendar size={13} />,      label: "June 2026" },
                                { icon: <CheckCircle2 size={13} />,  label: "Live data" },
                                { icon: <DollarSign size={13} />,    label: "PKR (Rs)" },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 text-blue-300/80 text-sm">
                                    {icon}
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── KPI CARDS (overlap hero) ─────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-9 relative z-10">

                        <KpiCard
                            title="Total Revenue"
                            value={fmt(stats.totalRevenue)}
                            sub="Across all productions"
                            icon={<DollarSign size={17} />}
                            topColor="bg-blue-500"
                            iconBg="bg-blue-50 text-blue-600"
                            badge="↑ +12%"
                            badgeCls="bg-emerald-50 text-emerald-700"
                        />
                        <KpiCard
                            title="Production Cost"
                            value={fmt(stats.totalCost)}
                            sub="Crew · Logistics · Gear"
                            icon={<Receipt size={17} />}
                            topColor="bg-violet-500"
                            iconBg="bg-violet-50 text-violet-600"
                            badge="Stable"
                            badgeCls="bg-slate-100 text-slate-500"
                        />
                        <KpiCard
                            title="Total Profit"
                            value={fmt(stats.totalProfit)}
                            sub={`${marginPct}% margin`}
                            icon={<TrendingUp size={17} />}
                            topColor="bg-emerald-500"
                            iconBg="bg-emerald-50 text-emerald-600"
                            valueColor={stats.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}
                            badge="↑ +8%"
                            badgeCls="bg-emerald-50 text-emerald-700"
                        />
                        <KpiCard
                            title="Pending Payroll"
                            value={fmt(stats.pendingPayroll)}
                            sub={`${pendingRuns} payroll runs`}
                            icon={<Clock size={17} />}
                            topColor="bg-rose-500"
                            iconBg="bg-rose-50 text-rose-600"
                            badge="Pending"
                            badgeCls="bg-amber-50 text-amber-700"
                        />

                    </div>
                </div>

                {/* ── PAGE BODY ───────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-24">

                    {/* ── PRODUCTIONS TABLE ───────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                        {/* utilisation bar */}
                        <div className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center justify-between text-sm mb-2 flex-wrap gap-2">
                                <span className="font-semibold text-slate-800">Cost utilisation of Revenue</span>
                                <span className="text-slate-400 text-sm">
                                    {fmt(stats.totalCost)} of {fmt(stats.totalRevenue)}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(costPct, 100)}%` }}
                                />
                            </div>
                            <p className="text-base text-slate-400 mt-1.5">
                                {costPct}% cost ratio · {100 - costPct}% gross margin
                            </p>
                        </div>

                        {/* panel header */}
                        <PanelHeader
                            icon={<Briefcase size={15} />}
                            title="Recent Productions"
                            sub="Production financial overview"
                            href="/dashboard/finance/expenses"
                        />

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Production","Client","Revenue","Cost","Profit","Status","Action"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {shoots.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-14 text-center text-slate-400 text-base">
                                                No productions found.
                                            </td>
                                        </tr>
                                    ) : shoots.map((shoot) => {
                                        const f      = financeMap[shoot.id] || {};
                                        const profit = Number(f.profit || 0);
                                        return (
                                            <tr key={shoot.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <p className="text-base font-bold text-slate-900">{shoot.title}</p>
                                                    <p className="text-sm text-slate-400 mt-0.5">{shoot.location}</p>
                                                </td>
                                                <td className="px-5 py-3.5 text-base text-slate-600">
                                                    {shoot.client_name || "—"}
                                                </td>
                                                <td className="px-5 py-3.5 text-base font-bold text-slate-900 tabular-nums">
                                                    {fmt(f.revenue)}
                                                </td>
                                                <td className="px-5 py-3.5 text-base font-bold text-slate-900 tabular-nums">
                                                    {fmt(f.total_cost)}
                                                </td>
                                                <td className="px-5 py-3.5 text-base font-bold tabular-nums">
                                                    <span className={profit >= 0 ? "text-emerald-600" : "text-red-600"}>
                                                        {profit < 0 ? "−" : ""}Rs {Number(Math.abs(profit)).toLocaleString("en-PK")}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusPill status={shoot.status} />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Link
                                                        href={`/dashboard/finance/shoots/${shoot.id}`}
                                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        View report <ArrowUpRight size={12} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── PAYROLL TABLE ────────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                        <PanelHeader
                            icon={<Users size={15} />}
                            title="Recent Payroll Runs"
                            sub="Payroll processing history"
                            href="/dashboard/finance/payrolls"
                        />

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Reference","Type","Net Amount","Status","Action"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-14 text-center text-slate-400 text-base">
                                                No payroll runs found.
                                            </td>
                                        </tr>
                                    ) : payrolls.map((payroll) => (
                                        <tr key={payroll.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="bg-slate-100 text-slate-700 font-mono text-sm px-2.5 py-1 rounded-md">
                                                    {payroll.reference || `PAY-${payroll.id}`}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-base text-slate-600 capitalize">
                                                {payroll.type || "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-base font-bold text-slate-900 tabular-nums">
                                                {fmt(payroll.net_amount)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusPill status={payroll.status} />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <Link
                                                    href={`/dashboard/finance/payrolls/${payroll.id}`}
                                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Open <ArrowUpRight size={12} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── FOOTER ───────────────────────────────────────────── */}
                    <div className="text-center text-slate-400 text-sm pt-4 flex items-center justify-center gap-2">
                        <BarChart3 size={12} />
                        Finance Dashboard · Live data as of{" "}
                        {new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                    </div>

                </div>
            </div>
        </Layout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, topColor, iconBg, badge, badgeCls, valueColor = "text-slate-900" }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className={`h-1 w-full ${topColor}`} />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        {icon}
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${badgeCls}`}>
                        {badge}
                    </span>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-1.5 tracking-tight leading-tight ${valueColor}`}>
                    {value}
                </p>
                <p className="text-base text-slate-400 mt-1.5">{sub}</p>
            </div>
        </div>
    );
}

function PanelHeader({ icon, title, sub, href }) {
    return (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    {sub && <p className="text-base text-slate-400 mt-0.5">{sub}</p>}
                </div>
            </div>
            {href && (
                <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                >
                    View All <ArrowRight size={13} />
                </Link>
            )}
        </div>
    );
}