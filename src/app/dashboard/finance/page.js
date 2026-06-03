"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    DollarSign, TrendingUp, Receipt, Clock,
    Briefcase, Users, ArrowUpRight, Landmark,
    Calendar, CheckCircle2, Minus, ArrowRight, ArrowLeft,
} from "lucide-react";

const fmt = (n) => Number(n || 0).toLocaleString("en-PK");

const C = {
    blue: "#1d4ed8", blueDark: "#1251b5", blueBg: "#eff6ff", blueBg2: "#dbeafe",
    green: "#059669", greenBg: "#d1fae5", greenDark: "#065f46",
    amber: "#b45309", amberBg: "#fef3c7", amberBg2: "#fef9c3", amberDark: "#854d0e",
    rose: "#be123c", roseBg: "#ffe4e6", red: "#dc2626",
    slate50: "#f8fafc", slate100: "#f1f5f9", slate400: "#94a3b8",
    slate500: "#64748b", slate600: "#475569", slate700: "#334155",
    slate800: "#1e293b", slate900: "#0f172a", white: "#ffffff",
};

// ── ALL static — no isMobile here ────────────────────────────────────────────
const s = {
    root: {
        background: "#f0f4fa",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "15px", color: C.slate900, paddingBottom: "48px", minHeight: "100vh",
    },
    hero: {
        background: C.blueDark,
        padding: "44px 40px 68px", // overridden inline with isMobile
        position: "relative", overflow: "hidden",
    },
    heroCircle1: {
        position: "absolute", top: "-60px", right: "-60px",
        width: "320px", height: "320px", borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", pointerEvents: "none",
    },
    heroCircle2: {
        position: "absolute", bottom: "-100px", left: "35%",
        width: "420px", height: "420px", borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", pointerEvents: "none",
    },
    heroBadge: {
        display: "inline-flex", alignItems: "center", gap: "7px",
        background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
        borderRadius: "100px", padding: "6px 16px", fontSize: "12px", fontWeight: 700,
        color: "#cfe0ff", letterSpacing: "0.07em", textTransform: "uppercase",
        marginBottom: "20px", position: "relative", zIndex: 2,
    },
    heroH1: {
        fontSize: "42px", fontWeight: 800, color: C.white,
        lineHeight: 1.1, marginBottom: "10px", position: "relative", zIndex: 2, letterSpacing: "-1.5px",
    },
    heroSub: { color: "rgba(255,255,255,0.6)", fontSize: "15px", position: "relative", zIndex: 2 },
    heroMetaItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.65)" },
    card: {
        background: C.white, borderRadius: "18px", padding: "24px",
        boxShadow: "0 8px 28px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)",
        border: "1px solid rgba(15,23,42,0.04)", transition: "transform .2s, box-shadow .2s",
    },
    cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" },
    cardIconBase: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    cardLabel: { fontSize: "11px", fontWeight: 700, color: C.slate400, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "7px" },
    cardValue: { fontSize: "30px", fontWeight: 800, color: C.slate900, lineHeight: 1, letterSpacing: "-1px" },
    cardSub: { fontSize: "12px", color: C.slate400, marginTop: "8px" },
    trendBase: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px", whiteSpace: "nowrap" },
    panel: {
        background: C.white, borderRadius: "18px", border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 2px 16px rgba(15,23,42,0.06)", overflow: "hidden", marginBottom: "20px",
    },
    panelHead: {
        padding: "20px 24px", borderBottom: `1px solid ${C.slate50}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    panelTitleWrap: { display: "flex", alignItems: "center", gap: "12px" },
    panelIcon: {
        width: "38px", height: "38px", borderRadius: "10px",
        background: C.blueBg, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center",
    },
    panelTitle: { fontSize: "16px", fontWeight: 700, color: C.slate900 },
    panelSub: { fontSize: "12px", color: C.slate400, marginTop: "2px" },
    viewBtn: {
        display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px",
        fontWeight: 600, color: C.blue, background: C.blueBg, border: "none",
        padding: "7px 16px", borderRadius: "10px", cursor: "pointer", textDecoration: "none",
    },
    utilBar: { padding: "18px 24px", borderBottom: `1px solid ${C.slate50}` },
    utilLabels: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", flexWrap: "wrap", gap: "4px" },
    utilTrack: { height: "8px", background: C.slate100, borderRadius: "100px", overflow: "hidden" },
    utilFill: { height: "100%", borderRadius: "100px", background: C.blue },
    utilNote: { fontSize: "11px", color: C.slate400, marginTop: "6px" },
    thead: { background: C.slate50, borderBottom: `1.5px solid ${C.slate100}` },
    th: { padding: "11px 20px", fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left" },
    td: { padding: "15px 20px", fontSize: "14px", color: C.slate800, borderBottom: `1px solid ${C.slate50}` },
    tdTitle: { fontWeight: 700, fontSize: "14px", color: C.slate900 },
    tdSub: { fontSize: "12px", color: C.slate400, marginTop: "2px" },
    tdNum: { fontWeight: 700, fontSize: "14px", fontVariantNumeric: "tabular-nums" },
    tdPos: { color: C.green, fontWeight: 700 },
    tdNeg: { color: C.red, fontWeight: 700 },
    pillBase: { display: "inline-block", padding: "4px 11px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em" },
    actionLink: {
        display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px",
        fontWeight: 600, color: C.blue, padding: "5px 11px", borderRadius: "8px", textDecoration: "none",
    },
    refCode: { background: C.slate100, color: C.slate700, fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", borderRadius: "6px" },
};

const pillStyles = {
    completed: { background: C.greenBg, color: C.greenDark },
    active: { background: C.blueBg, color: "#1e40af" },
    "in progress": { background: C.blueBg, color: "#1e40af" },
    pending: { background: C.amberBg2, color: C.amberDark },
    paid: { background: C.greenBg, color: C.greenDark },
    approved: { background: C.blueBg, color: "#1e40af" },
    draft: { background: C.slate100, color: C.slate500 },
};

// ── sub-components ────────────────────────────────────────────────────────────

function StatusPill({ status = "draft" }) {
    const extra = pillStyles[status.toLowerCase()] ?? pillStyles.draft;
    return <span style={{ ...s.pillBase, ...extra }}>{status}</span>;
}

function SummaryCard({ title, value, icon, iconBg, iconColor, trend, trendLabel, sub }) {
    const trendStyle = {
        up: { background: C.greenBg, color: C.greenDark },
        down: { background: C.roseBg, color: C.rose },
        warn: { background: C.amberBg2, color: C.amberDark },
        neutral: { background: C.slate100, color: C.slate500 },
    }[trend] ?? { background: C.slate100, color: C.slate500 };
    const TrendIcon = trend === "up" ? TrendingUp : Minus;
    return (
        <div style={s.card}>
            <div style={s.cardTop}>
                <div style={{ ...s.cardIconBase, background: iconBg, color: iconColor }}>{icon}</div>
                <div style={{ ...s.trendBase, ...trendStyle }}>
                    <TrendIcon size={11} />
                    {trendLabel}
                </div>
            </div>
            <div style={s.cardLabel}>{title}</div>
            <div style={s.cardValue}>Rs {fmt(value)}</div>
            {sub && <div style={s.cardSub}>{sub}</div>}
        </div>
    );
}

function PanelHeader({ icon, title, sub, href }) {
    return (
        <div style={s.panelHead}>
            <div style={s.panelTitleWrap}>
                <div style={s.panelIcon}>{icon}</div>
                <div>
                    <div style={s.panelTitle}>{title}</div>
                    <div style={s.panelSub}>{sub}</div>
                </div>
            </div>
            {href && (
                <Link href={href} style={s.viewBtn}>
                    View All <ArrowRight size={13} />
                </Link>
            )}
        </div>
    );
}

function Th({ children }) { return <th style={s.th}>{children}</th>; }
function Td({ children, style: extra = {} }) { return <td style={{ ...s.td, ...extra }}>{children}</td>; }

function UtilBar({ revenue, cost }) {
    const pct = revenue > 0 ? Math.min(100, Math.round((cost / revenue) * 100)) : 0;
    return (
        <div style={s.utilBar}>
            <div style={s.utilLabels}>
                <span style={{ fontWeight: 600, color: C.slate900, fontSize: "14px" }}>Cost utilization of Revenue</span>
                <span style={{ color: C.slate400 }}>Rs {fmt(cost)} of Rs {fmt(revenue)}</span>
            </div>
            <div style={s.utilTrack}>
                <div style={{ ...s.utilFill, width: `${pct}%` }} />
            </div>
            <div style={s.utilNote}>{pct}% cost ratio · {100 - pct}% gross margin</div>
        </div>
    );
}

function useIsMobile() {
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        const check = () => setMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return mobile;
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function FinanceDashboardPage() {
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(true);
    const [shoots, setShoots] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [financeMap, setFinanceMap] = useState({});

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const [shootsRes, payrollsRes] = await Promise.all([
                api.get("/shoots"),
                api.get("/payrolls"),
            ]);
            const shootsData = shootsRes.data || [];
            const payrollData = payrollsRes.data?.data || [];
            const financeResults = await Promise.all(
                shootsData.map(async (shoot) => {
                    try {
                        const res = await api.get(`/shoots/${shoot.id}/finance`);
                        return { shootId: shoot.id, finance: res.data };
                    } catch {
                        return { shootId: shoot.id, finance: { crew_cost: 0, logistics_cost: 0, inventory_cost: 0, repair_cost: 0, expense_cost: 0, total_cost: 0, revenue: 0, profit: 0 } };
                    }
                })
            );
            const map = {};
            financeResults.forEach(({ shootId, finance }) => (map[shootId] = finance));
            setFinanceMap(map);
            setShoots(shootsData);
            setPayrolls(payrollData);
        } catch {
            toast.error("Failed to load finance dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const stats = useMemo(() => {
        let totalRevenue = 0, totalCost = 0, totalProfit = 0;
        Object.values(financeMap).forEach(({ revenue, total_cost, profit }) => {
            totalRevenue += Number(revenue || 0);
            totalCost += Number(total_cost || 0);
            totalProfit += Number(profit || 0);
        });
        const pendingPayroll = payrolls
            .filter((p) => p.status !== "paid")
            .reduce((sum, p) => sum + Number(p.net_amount || 0), 0);
        return { totalRevenue, totalCost, totalProfit, pendingPayroll };
    }, [financeMap, payrolls]);

    if (loading) {
        return (
            <Layout>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "160px 0" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: "40px", height: "40px", border: "4px solid #dbeafe", borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 16px" }} />
                        <p style={{ color: C.slate400, fontSize: "14px" }}>Loading Finance Dashboard…</p>
                    </div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </Layout>
        );
    }

    const marginPct = stats.totalRevenue > 0 ? Math.round((stats.totalProfit / stats.totalRevenue) * 100) : 0;

    // ── responsive values derived from isMobile (inside component, safe) ──
    const heroPadding = isMobile ? "32px 20px 64px" : "44px 40px 68px";
    const heroFontSize = isMobile ? "28px" : "42px";
    const cardsColumns = isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
    const cardsPadding = isMobile ? "0 16px" : "0 32px";
    const bodyPadding = isMobile ? "20px 16px 0" : "28px 32px 0";
    const metaGap = isMobile ? "12px" : "28px";

    return (
        <Layout>
            <div style={s.root}>

                {/* ── HERO ── */}
                <div style={{ ...s.hero, padding: heroPadding }}>
                    <div style={s.heroCircle1} />
                    <div style={s.heroCircle2} />
                    <div style={s.heroBadge}>
                        <Landmark size={13} /> Finance Overview
                    </div>
                    <h1 style={{ ...s.heroH1, fontSize: heroFontSize }}>Production Finance</h1>
                    <p style={s.heroSub}>Financial overview of productions, payrolls and expenses</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: metaGap, marginTop: "22px", position: "relative", zIndex: 2 }}>
                        {[
                            { icon: <Calendar size={14} />, label: "June 2026" },
                            { icon: <CheckCircle2 size={14} />, label: "Live data" },
                            { icon: <DollarSign size={14} />, label: "PKR (Rs)" },
                        ].map(({ icon, label }) => (
                            <div key={label} style={s.heroMetaItem}>{icon} {label}</div>
                        ))}
                    </div>
                </div>

                {/* ── SUMMARY CARDS ── */}
                <div style={{ display: "grid", gridTemplateColumns: cardsColumns, gap: "16px", padding: cardsPadding, marginTop: "-34px", position: "relative", zIndex: 10 }}>
                    <SummaryCard title="Total Revenue" value={stats.totalRevenue} icon={<DollarSign size={20} />} iconBg={C.blueBg} iconColor={C.blue} trend="up" trendLabel="+12%" sub="Across all productions" />
                    <SummaryCard title="Production Cost" value={stats.totalCost} icon={<Receipt size={20} />} iconBg={C.amberBg} iconColor={C.amber} trend="neutral" trendLabel="Stable" sub="Crew · Logistics · Gear" />
                    <SummaryCard title="Total Profit" value={stats.totalProfit} icon={<TrendingUp size={20} />} iconBg={C.greenBg} iconColor={C.green} trend="up" trendLabel="+8%" sub={`${marginPct}% margin`} />
                    <SummaryCard title="Pending Payroll" value={stats.pendingPayroll} icon={<Clock size={20} />} iconBg={C.roseBg} iconColor={C.rose} trend="warn" trendLabel="Pending" sub={`${payrolls.filter(p => p.status !== "paid").length} payroll runs`} />
                </div>

                {/* ── BODY ── */}
                <div style={{ padding: bodyPadding }}>

                    {/* Productions */}
                    <div style={s.panel}>
                        <UtilBar revenue={stats.totalRevenue} cost={stats.totalCost} />
                        <PanelHeader icon={<Briefcase size={18} />} title="Recent Productions" sub="Production financial overview" href="/dashboard/finance/expenses" />
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={s.thead}>
                                        <Th>Production</Th>
                                        <Th>Client</Th>
                                        <Th>Revenue</Th>
                                        <Th>Cost</Th>
                                        <Th>Profit</Th>
                                        <Th>Status</Th>
                                        <Th>Action</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shoots.length === 0 ? (
                                        <tr><td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: C.slate400, fontSize: "14px" }}>No productions found.</td></tr>
                                    ) : shoots.map((shoot) => {
                                        const f = financeMap[shoot.id] || {};
                                        const profit = Number(f.profit || 0);
                                        return (
                                            <tr key={shoot.id}
                                                onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#fafbff")}
                                                onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "")}
                                            >
                                                <Td><div style={s.tdTitle}>{shoot.title}</div><div style={s.tdSub}>{shoot.location}</div></Td>
                                                <Td style={{ color: C.slate600 }}>{shoot.client_name || "—"}</Td>
                                                <Td style={s.tdNum}>Rs {fmt(f.revenue)}</Td>
                                                <Td style={s.tdNum}>Rs {fmt(f.total_cost)}</Td>
                                                <Td><span style={profit >= 0 ? s.tdPos : s.tdNeg}>{profit < 0 ? "−" : ""}Rs {fmt(Math.abs(profit))}</span></Td>
                                                <Td><StatusPill status={shoot.status} /></Td>
                                                <Td><Link href={`/dashboard/finance/shoots/${shoot.id}`} style={s.actionLink}>View report <ArrowUpRight size={13} /></Link></Td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payroll */}
                    <div style={s.panel}>
                        <PanelHeader icon={<Users size={18} />} title="Recent Payroll Runs" sub="Payroll processing history" href="/dashboard/finance/payrolls" />
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={s.thead}>
                                        <Th>Reference</Th>
                                        <Th>Type</Th>
                                        <Th>Net Amount</Th>
                                        <Th>Status</Th>
                                        <Th>Action</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.length === 0 ? (
                                        <tr><td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: C.slate400, fontSize: "14px" }}>No payroll runs found.</td></tr>
                                    ) : payrolls.map((payroll) => (
                                        <tr key={payroll.id}
                                            onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#fafbff")}
                                            onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "")}
                                        >
                                            <Td><span style={s.refCode}>{payroll.reference || `PAY-${payroll.id}`}</span></Td>
                                            <Td style={{ color: C.slate600, textTransform: "capitalize" }}>{payroll.type || "—"}</Td>
                                            <Td style={s.tdNum}>Rs {fmt(payroll.net_amount)}</Td>
                                            <Td><StatusPill status={payroll.status} /></Td>
                                            <Td><Link href={`/dashboard/finance/payrolls/${payroll.id}`} style={s.actionLink}>Open <ArrowUpRight size={13} /></Link></Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}