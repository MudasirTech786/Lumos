"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    Wallet, Users, Briefcase, ArrowUpRight,
    X, Calendar, TrendingUp, Clock, CheckCircle2,
} from "lucide-react";

const fmt = (n) => Number(n || 0).toLocaleString("en-PK");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";

const C = {
    blue: "#1d4ed8", blueDark: "#1251b5", blueBg: "#eff6ff",
    green: "#059669", greenBg: "#d1fae5", greenDark: "#065f46",
    amber: "#b45309", amberBg: "#fef3c7", amberDark: "#854d0e",
    red: "#dc2626", redBg: "#fee2e2",
    slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0",
    slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569",
    slate700: "#334155", slate800: "#1e293b", slate900: "#0f172a", white: "#ffffff",
};

const s = {
    root: {
        background: "#f0f4fa",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "15px", color: C.slate900, minHeight: "100vh", paddingBottom: "56px",
    },
    header: {
        background: C.white,
        borderBottom: `1px solid ${C.slate100}`,
        boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
    },
    headerInner: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "68px",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
    pageIconWrap: {
        width: "38px", height: "38px", borderRadius: "10px",
        background: C.blueBg, color: C.blue,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    pageTitle: { fontSize: "17px", fontWeight: 700, color: C.slate900, lineHeight: 1.2 },
    pageSub: { fontSize: "12px", color: C.slate400, marginTop: "2px" },
    headerBtns: { display: "flex", gap: "10px" },
    crewBtn: {
        display: "inline-flex", alignItems: "center", gap: "7px",
        background: C.blue, color: C.white, border: "none",
        borderRadius: "10px", padding: "10px 18px",
        fontSize: "13px", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 2px 10px rgba(29,78,216,0.3)",
    },
    empBtn: {
        display: "inline-flex", alignItems: "center", gap: "7px",
        background: C.green, color: C.white, border: "none",
        borderRadius: "10px", padding: "10px 18px",
        fontSize: "13px", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 2px 10px rgba(5,150,105,0.3)",
    },
    statsGrid: { display: "grid", gap: "14px" },
    statCard: {
        background: C.white, borderRadius: "14px", padding: "18px 20px",
        border: `1px solid ${C.slate100}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
    },
    statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
    statIconWrap: { width: "34px", height: "34px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" },
    statLabel: { fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.08em" },
    statValue: { fontSize: "24px", fontWeight: 800, color: C.slate900, letterSpacing: "-0.5px", lineHeight: 1 },
    statSub: { fontSize: "11px", color: C.slate400, marginTop: "5px" },
    panel: {
        background: C.white, borderRadius: "16px",
        border: `1px solid ${C.slate100}`,
        boxShadow: "0 2px 14px rgba(15,23,42,0.06)",
        overflow: "hidden",
    },
    panelHead: {
        padding: "18px 22px", borderBottom: `1px solid ${C.slate100}`,
        display: "flex", alignItems: "center", gap: "12px",
    },
    panelIcon: {
        width: "36px", height: "36px", borderRadius: "9px",
        background: C.blueBg, color: C.blue,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    panelTitle: { fontSize: "15px", fontWeight: 700, color: C.slate900 },
    panelSub: { fontSize: "12px", color: C.slate400, marginTop: "1px" },
    thead: { background: C.slate50, borderBottom: `1.5px solid ${C.slate100}` },
    th: { padding: "11px 18px", fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", whiteSpace: "nowrap" },
    td: { padding: "15px 18px", fontSize: "13px", color: C.slate800, borderBottom: `1px solid ${C.slate50}` },
    actionLink: {
        display: "inline-flex", alignItems: "center", gap: "5px",
        fontSize: "13px", fontWeight: 600, color: C.blue,
        padding: "5px 10px", borderRadius: "7px", textDecoration: "none",
    },
    refCode: { background: C.slate100, color: C.slate700, fontFamily: "monospace", fontSize: "12px", padding: "3px 8px", borderRadius: "5px" },
    // modal
    overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
    modal: { background: C.white, borderRadius: "20px", width: "100%", maxWidth: "460px", boxShadow: "0 32px 80px rgba(15,23,42,0.3)", overflow: "hidden" },
    modalHead: { padding: "20px 24px", borderBottom: `1px solid ${C.slate100}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
    modalTitle: { fontSize: "17px", fontWeight: 700, color: C.slate900 },
    modalBody: { padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" },
    modalFoot: { padding: "16px 24px", borderTop: `1px solid ${C.slate100}`, display: "flex", justifyContent: "flex-end", gap: "10px" },
    label: { fontSize: "11px", fontWeight: 700, color: C.slate600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px", display: "block" },
    input: { width: "100%", border: `1px solid ${C.slate200}`, borderRadius: "10px", padding: "10px 13px", fontSize: "14px", color: C.slate900, background: C.slate50, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
    cancelBtn: { padding: "9px 18px", borderRadius: "9px", border: `1px solid ${C.slate200}`, background: C.white, fontSize: "13px", fontWeight: 600, color: C.slate600, cursor: "pointer" },
    closeBtn: { width: "30px", height: "30px", borderRadius: "8px", border: "none", background: C.slate100, color: C.slate500, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};

const statusStyle = (status) => ({
    paid:     { background: C.greenBg,  color: C.greenDark },
    approved: { background: C.blueBg,   color: "#1e40af" },
    draft:    { background: C.amberBg,  color: C.amberDark },
    pending:  { background: C.amberBg,  color: C.amberDark },
}[status?.toLowerCase()] ?? { background: C.slate100, color: C.slate500 });

const pillBase = { display: "inline-block", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, textTransform: "capitalize" };
const typePill = (type) => ({
    crew:     { background: "#eff6ff", color: "#1e40af" },
    employee: { background: "#d1fae5", color: "#065f46" },
}[type?.toLowerCase()] ?? { background: C.slate100, color: C.slate500 });

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

function FormField({ label, children }) {
    return <div><label style={s.label}>{label}</label>{children}</div>;
}

function PayrollModal({ title, accentColor, form, setForm, onSubmit, onClose, submitLabel }) {
    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <div style={s.modalHead}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ ...s.pageIconWrap, background: accentColor === C.green ? C.greenBg : C.blueBg, color: accentColor }}>
                            <Calendar size={16} />
                        </div>
                        <span style={s.modalTitle}>{title}</span>
                    </div>
                    <button style={s.closeBtn} onClick={onClose}><X size={15} /></button>
                </div>
                <div style={s.modalBody}>
                    <div style={{ background: C.slate50, border: `1px solid ${C.slate100}`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: C.slate500 }}>
                        Select the payroll period date range to generate payroll entries for all active members.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <FormField label="Start Date">
                            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={s.input} />
                        </FormField>
                        <FormField label="End Date">
                            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={s.input} />
                        </FormField>
                    </div>
                </div>
                <div style={s.modalFoot}>
                    <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        onClick={onSubmit}
                        style={{ ...s.cancelBtn, background: accentColor, color: C.white, border: "none", fontWeight: 700, boxShadow: `0 2px 8px ${accentColor}55` }}
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PayrollRunsPage() {
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(true);
    const [payrolls, setPayrolls] = useState([]);
    const [showCrewModal, setShowCrewModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [crewForm, setCrewForm] = useState({ start_date: "", end_date: "" });
    const [employeeForm, setEmployeeForm] = useState({ start_date: "", end_date: "" });

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payrolls");
            setPayrolls(res.data?.data || []);
        } catch { toast.error("Failed to load payrolls"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPayrolls(); }, []);

    const generateCrewPayroll = async () => {
        try {
            await api.post("/payrolls/generate-crew", crewForm);
            toast.success("Crew payroll generated");
            setShowCrewModal(false); fetchPayrolls();
        } catch { toast.error("Failed to generate payroll"); }
    };

    const generateEmployeePayroll = async () => {
        try {
            await api.post("/payrolls/generate-employee", employeeForm);
            toast.success("Employee payroll generated");
            setShowEmployeeModal(false); fetchPayrolls();
        } catch { toast.error("Failed to generate payroll"); }
    };

    // derived stats
    const totalGross   = payrolls.reduce((a, p) => a + Number(p.gross_amount || 0), 0);
    const totalNet     = payrolls.reduce((a, p) => a + Number(p.net_amount || 0), 0);
    const paidCount    = payrolls.filter((p) => p.status === "paid").length;
    const pendingCount = payrolls.filter((p) => p.status !== "paid").length;

    const sidePadding  = isMobile ? "16px" : "32px";
    const statsColumns = isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)";

    if (loading) {
        return (
            <Layout>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "160px 0" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: "40px", height: "40px", border: "4px solid #dbeafe", borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 16px" }} />
                        <p style={{ color: C.slate400, fontSize: "14px" }}>Loading Payrolls…</p>
                    </div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={s.root}>

                {/* ── HEADER ── */}
                <div style={s.header}>
                    <div style={{ ...s.headerInner, padding: `0 ${sidePadding}` }}>
                        <div style={s.headerLeft}>
                            <div style={s.pageIconWrap}><Wallet size={18} /></div>
                            <div>
                                <div style={s.pageTitle}>Payroll Runs</div>
                                <div style={s.pageSub}>Generate and manage payrolls</div>
                            </div>
                        </div>
                        <div style={{ ...s.headerBtns, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                            <button style={s.crewBtn} onClick={() => setShowCrewModal(true)}>
                                <Users size={15} /> Crew Payroll
                            </button>
                            <button style={s.empBtn} onClick={() => setShowEmployeeModal(true)}>
                                <Briefcase size={15} /> Employee Payroll
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── STATS ── */}
                <div style={{ ...s.statsGrid, gridTemplateColumns: statsColumns, padding: `22px ${sidePadding} 0` }}>
                    {[
                        { label: "Total Gross",   value: `Rs ${fmt(totalGross)}`,  sub: `${payrolls.length} payroll runs`,  icon: <Wallet size={16} />,       iconBg: C.blueBg,  iconColor: C.blue  },
                        { label: "Total Net",     value: `Rs ${fmt(totalNet)}`,    sub: "After deductions",                 icon: <TrendingUp size={16} />,   iconBg: C.greenBg, iconColor: C.green },
                        { label: "Paid",          value: paidCount,                sub: "Completed runs",                   icon: <CheckCircle2 size={16} />, iconBg: C.greenBg, iconColor: C.green },
                        { label: "Pending",       value: pendingCount,             sub: "Awaiting payment",                 icon: <Clock size={16} />,        iconBg: C.amberBg, iconColor: C.amber },
                    ].map(({ label, value, sub, icon, iconBg, iconColor }) => (
                        <div key={label} style={s.statCard}>
                            <div style={s.statTop}>
                                <div style={{ ...s.statIconWrap, background: iconBg, color: iconColor }}>{icon}</div>
                            </div>
                            <div style={s.statLabel}>{label}</div>
                            <div style={s.statValue}>{value}</div>
                            <div style={s.statSub}>{sub}</div>
                        </div>
                    ))}
                </div>

                {/* ── TABLE ── */}
                <div style={{ ...s.panel, margin: `16px ${sidePadding} 0` }}>
                    <div style={s.panelHead}>
                        <div style={s.panelIcon}><Wallet size={17} /></div>
                        <div>
                            <div style={s.panelTitle}>All Payroll Runs</div>
                            <div style={s.panelSub}>{payrolls.length} total records</div>
                        </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>Reference</th>
                                    <th style={s.th}>Type</th>
                                    <th style={s.th}>Period</th>
                                    <th style={s.th}>Gross</th>
                                    <th style={s.th}>Net</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: "56px 20px", textAlign: "center", color: C.slate400, fontSize: "14px" }}>
                                            No payroll runs yet. Generate one using the buttons above.
                                        </td>
                                    </tr>
                                ) : payrolls.map((payroll) => (
                                    <tr key={payroll.id}
                                        onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#fafbff")}
                                        onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "")}
                                    >
                                        <td style={s.td}>
                                            <div style={{ fontWeight: 700, color: C.slate900, marginBottom: "3px" }}>
                                                {payroll.reference}
                                            </div>
                                            <span style={s.refCode}>#{payroll.id}</span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={{ ...pillBase, ...typePill(payroll.type) }}>{payroll.type}</span>
                                        </td>
                                        <td style={s.td}>
                                            <div style={{ fontSize: "13px", color: C.slate700, fontWeight: 500 }}>{fmtDate(payroll.period_start)}</div>
                                            <div style={{ fontSize: "11px", color: C.slate400, margin: "2px 0" }}>to</div>
                                            <div style={{ fontSize: "13px", color: C.slate700, fontWeight: 500 }}>{fmtDate(payroll.period_end)}</div>
                                        </td>
                                        <td style={{ ...s.td, fontWeight: 700, whiteSpace: "nowrap" }}>
                                            Rs {fmt(payroll.gross_amount)}
                                        </td>
                                        <td style={{ ...s.td, fontWeight: 700, color: C.green, whiteSpace: "nowrap" }}>
                                            Rs {fmt(payroll.net_amount)}
                                        </td>
                                        <td style={s.td}>
                                            <span style={{ ...pillBase, ...statusStyle(payroll.status) }}>{payroll.status}</span>
                                        </td>
                                        <td style={s.td}>
                                            <Link href={`/dashboard/finance/payrolls/${payroll.id}`} style={s.actionLink}>
                                                Open <ArrowUpRight size={13} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {payrolls.length > 0 && (
                        <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.slate100}`, background: C.slate50, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: C.slate400 }}>{payrolls.length} payroll runs</span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: C.slate700 }}>
                                Net total: Rs {fmt(totalNet)}
                            </span>
                        </div>
                    )}
                </div>

            </div>

            {/* ── CREW MODAL ── */}
            {showCrewModal && (
                <PayrollModal
                    title="Generate Crew Payroll"
                    accentColor={C.blue}
                    form={crewForm} setForm={setCrewForm}
                    onSubmit={generateCrewPayroll}
                    onClose={() => setShowCrewModal(false)}
                    submitLabel="Generate Payroll"
                />
            )}

            {/* ── EMPLOYEE MODAL ── */}
            {showEmployeeModal && (
                <PayrollModal
                    title="Generate Employee Payroll"
                    accentColor={C.green}
                    form={employeeForm} setForm={setEmployeeForm}
                    onSubmit={generateEmployeePayroll}
                    onClose={() => setShowEmployeeModal(false)}
                    submitLabel="Generate Payroll"
                />
            )}

        </Layout>
    );
}