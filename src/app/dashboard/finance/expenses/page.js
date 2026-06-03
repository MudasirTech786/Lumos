"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Receipt, Search, X, Filter, ArrowLeft, TrendingUp, Layers, Camera } from "lucide-react";

const fmt = (n) => Number(n || 0).toLocaleString("en-PK");

const C = {
    blue: "#1d4ed8", blueDark: "#1251b5", blueBg: "#eff6ff", blueBg2: "#dbeafe",
    green: "#059669", greenBg: "#d1fae5", greenDark: "#065f46",
    amber: "#b45309", amberBg: "#fef3c7",
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
    // ── page header bar ──
    header: {
        background: C.white,
        borderBottom: `1px solid ${C.slate100}`,
        boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
    },
    headerInner: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: "68px",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
    backBtn: {
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: C.slate50, border: `1px solid ${C.slate200}`,
        borderRadius: "9px", padding: "7px 13px",
        fontSize: "13px", fontWeight: 600, color: C.slate600,
        cursor: "pointer",
    },
    divider: { width: "1px", height: "28px", background: C.slate200 },
    pageIconWrap: {
        width: "38px", height: "38px", borderRadius: "10px",
        background: C.blueBg, color: C.blue,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    pageTitleGroup: {},
    pageTitle: { fontSize: "17px", fontWeight: 700, color: C.slate900, lineHeight: 1.2 },
    pageSub: { fontSize: "12px", color: C.slate400, marginTop: "2px" },
    addBtn: {
        display: "inline-flex", alignItems: "center", gap: "7px",
        background: C.blue, color: C.white, border: "none",
        borderRadius: "10px", padding: "10px 20px",
        fontSize: "13px", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 2px 10px rgba(29,78,216,0.35)",
        letterSpacing: "0.01em",
    },
    // ── stat cards ──
    statsGrid: {
        display: "grid", gap: "14px",
        padding: "22px 32px 0",
    },
    statCard: {
        background: C.white, borderRadius: "14px", padding: "18px 20px",
        border: `1px solid ${C.slate100}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
        display: "flex", flexDirection: "column", gap: "2px",
    },
    statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
    statIconWrap: { width: "34px", height: "34px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" },
    statLabel: { fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.08em" },
    statValue: { fontSize: "24px", fontWeight: 800, color: C.slate900, letterSpacing: "-0.5px", lineHeight: 1 },
    statSub: { fontSize: "11px", color: C.slate400, marginTop: "5px" },
    // ── filter bar ──
    filterBar: {
        margin: "16px 32px 0",
        background: C.white, borderRadius: "13px",
        border: `1px solid ${C.slate100}`,
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: "10px",
        boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
    },
    searchWrap: { position: "relative", flex: 1 },
    searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.slate400, pointerEvents: "none" },
    searchInput: {
        width: "100%", paddingLeft: "38px", paddingRight: "14px",
        paddingTop: "9px", paddingBottom: "9px",
        border: `1px solid ${C.slate200}`, borderRadius: "9px",
        fontSize: "13px", color: C.slate900, background: C.slate50,
        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        transition: "border-color .15s",
    },
    filterBadge: {
        display: "inline-flex", alignItems: "center", gap: "5px",
        fontSize: "12px", fontWeight: 600, color: C.slate500,
        background: C.slate50, border: `1px solid ${C.slate200}`,
        borderRadius: "8px", padding: "7px 12px", whiteSpace: "nowrap",
    },
    clearBtn: { width: "28px", height: "28px", borderRadius: "7px", border: "none", background: C.slate100, color: C.slate500, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    // ── table ──
    tablePanel: {
        margin: "16px 32px 0",
        background: C.white, borderRadius: "16px",
        border: `1px solid ${C.slate100}`,
        boxShadow: "0 2px 14px rgba(15,23,42,0.06)",
        overflow: "hidden",
    },
    thead: { background: C.slate50, borderBottom: `1.5px solid ${C.slate100}` },
    th: { padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", whiteSpace: "nowrap" },
    td: { padding: "15px 18px", fontSize: "13px", color: C.slate800, borderBottom: `1px solid ${C.slate50}` },
    catPill: { display: "inline-block", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700 },
    actionBtn: { width: "30px", height: "30px", borderRadius: "7px", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    tableFooter: { padding: "13px 18px", borderTop: `1px solid ${C.slate100}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.slate50 },
    // ── modal ──
    overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
    modal: { background: C.white, borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 32px 80px rgba(15,23,42,0.3)", overflow: "hidden" },
    modalHead: { padding: "20px 24px", borderBottom: `1px solid ${C.slate100}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
    modalTitle: { fontSize: "17px", fontWeight: 700, color: C.slate900 },
    modalBody: { padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" },
    modalFoot: { padding: "16px 24px", borderTop: `1px solid ${C.slate100}`, display: "flex", justifyContent: "flex-end", gap: "10px" },
    label: { fontSize: "11px", fontWeight: 700, color: C.slate600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px", display: "block" },
    input: { width: "100%", border: `1px solid ${C.slate200}`, borderRadius: "10px", padding: "10px 13px", fontSize: "14px", color: C.slate900, background: C.slate50, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
    cancelBtn: { padding: "9px 18px", borderRadius: "9px", border: `1px solid ${C.slate200}`, background: C.white, fontSize: "13px", fontWeight: 600, color: C.slate600, cursor: "pointer" },
    submitBtn: { padding: "9px 22px", borderRadius: "9px", border: "none", background: C.blue, color: C.white, fontSize: "13px", fontWeight: 700, cursor: "pointer" },
    closeBtn: { width: "30px", height: "30px", borderRadius: "8px", border: "none", background: C.slate100, color: C.slate500, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};

const catColor = (cat = "") => {
    const map = {
        transport:  { background: "#eff6ff", color: "#1e40af" },
        food:       { background: "#d1fae5", color: "#065f46" },
        equipment:  { background: "#fef3c7", color: "#854d0e" },
        rental:     { background: "#fae8ff", color: "#7e22ce" },
        misc:       { background: "#f1f5f9", color: "#475569" },
    };
    return map[cat.toLowerCase()] ?? { background: C.blueBg, color: "#1e40af" };
};

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

export default function ShootExpensesPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [shoots, setShoots] = useState([]);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [form, setForm] = useState({ shoot_id: "", category: "", description: "", amount: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expensesRes, shootsRes] = await Promise.all([api.get("/shoot-expenses"), api.get("/shoots")]);
            setExpenses(expensesRes.data?.data || []);
            setShoots(shootsRes.data || []);
        } catch { toast.error("Failed to load expenses"); }
        finally { setLoading(false); }
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
            new Date(expense.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }).toLowerCase().includes(q)
        );
    });

    const totalAmount      = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const uniqueCategories = [...new Set(expenses.map((e) => e.category).filter(Boolean))].length;
    const uniqueShoots     = [...new Set(expenses.map((e) => e.shoot_id))].length;
    const avgAmount        = expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0;

    const sidePadding   = isMobile ? "16px" : "32px";
    const statsColumns  = isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)";
    const headerPadding = isMobile ? "0 16px" : "0 32px";

    if (loading) {
        return (
            <Layout>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "160px 0" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: "40px", height: "40px", border: "4px solid #dbeafe", borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 16px" }} />
                        <p style={{ color: C.slate400, fontSize: "14px" }}>Loading Expenses…</p>
                    </div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </Layout>
        );
    }

    const ModalForm = ({ title, onSubmit, onClose, submitLabel }) => (
        <div style={s.overlay}>
            <div style={s.modal}>
                <div style={s.modalHead}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ ...s.pageIconWrap, width: "32px", height: "32px" }}><Receipt size={15} /></div>
                        <span style={s.modalTitle}>{title}</span>
                    </div>
                    <button style={s.closeBtn} onClick={onClose}><X size={15} /></button>
                </div>
                <div style={s.modalBody}>
                    <FormField label="Shoot">
                        <select value={form.shoot_id} onChange={(e) => setForm({ ...form, shoot_id: e.target.value })} style={s.input}>
                            <option value="">Select Shoot</option>
                            {shoots.map((shoot) => <option key={shoot.id} value={shoot.id}>{shoot.title}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Category">
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={s.input} placeholder="e.g. Transport, Food, Equipment" />
                    </FormField>
                    <FormField label="Description">
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...s.input, resize: "vertical" }} />
                    </FormField>
                    <FormField label="Amount (Rs)">
                        <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={s.input} placeholder="0" />
                    </FormField>
                </div>
                <div style={s.modalFoot}>
                    <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
                    <button style={s.submitBtn} onClick={onSubmit}>{submitLabel}</button>
                </div>
            </div>
        </div>
    );

    return (
        <Layout>
            <div style={s.root}>

                {/* ── HEADER ── */}
                <div style={s.header}>
                    <div style={{ ...s.headerInner, padding: headerPadding }}>
                        <div style={s.headerLeft}>

                            {/* icon + title */}
                            <div style={s.pageIconWrap}>
                                <Receipt size={18} />
                            </div>
                            <div style={s.pageTitleGroup}>
                                <div style={s.pageTitle}>Shoot Expenses</div>
                                <div style={s.pageSub}>Manage production expenses and costs</div>
                            </div>

                        </div>

                        {/* CTA */}
                        <button style={s.addBtn} onClick={() => setShowCreate(true)}>
                            <Plus size={16} /> Add Expense
                        </button>
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div style={{ ...s.statsGrid, gridTemplateColumns: statsColumns, padding: `22px ${sidePadding} 0` }}>
                    {[
                        { label: "Total Spent",     value: `Rs ${fmt(totalAmount)}`, sub: `${expenses.length} records total`,   icon: <Receipt size={16} />,    iconBg: C.blueBg,   iconColor: C.blue },
                        { label: "Avg per Expense", value: `Rs ${fmt(avgAmount)}`,   sub: "Per expense record",                 icon: <TrendingUp size={16} />, iconBg: C.greenBg,  iconColor: C.green },
                        { label: "Categories",      value: uniqueCategories,          sub: "Unique expense types",               icon: <Layers size={16} />,     iconBg: "#fae8ff",  iconColor: "#7e22ce" },
                        { label: "Productions",     value: uniqueShoots,              sub: "Shoots with expenses",               icon: <Camera size={16} />,     iconBg: C.amberBg,  iconColor: C.amber },
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

                {/* ── FILTER BAR ── */}
                <div style={{ ...s.filterBar, margin: `16px ${sidePadding} 0` }}>
                    <div style={s.searchWrap}>
                        <span style={s.searchIcon}><Search size={15} /></span>
                        <input
                            type="text"
                            placeholder="Search by description, category, shoot, amount…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={s.searchInput}
                        />
                    </div>
                    <div style={s.filterBadge}>
                        <Filter size={12} />
                        {filteredExpenses.length} result{filteredExpenses.length !== 1 ? "s" : ""}
                    </div>
                    {search && (
                        <button onClick={() => setSearch("")} style={s.clearBtn} title="Clear search">
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* ── TABLE ── */}
                <div style={{ ...s.tablePanel, margin: `16px ${sidePadding} 0` }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>#</th>
                                    <th style={s.th}>Category</th>
                                    <th style={s.th}>Shoot</th>
                                    <th style={s.th}>Description</th>
                                    <th style={s.th}>Amount</th>
                                    <th style={s.th}>Date</th>
                                    <th style={s.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: "56px 20px", textAlign: "center" }}>
                                            <div style={{ color: C.slate400, fontSize: "14px" }}>
                                                {search ? `No results for "${search}"` : "No expenses yet. Click Add Expense to get started."}
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredExpenses.map((expense, idx) => {
                                    const shoot     = shoots.find((s) => s.id === expense.shoot_id);
                                    const pillStyle = catColor(expense.category);
                                    return (
                                        <tr key={expense.id}
                                            onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#fafbff")}
                                            onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "")}
                                        >
                                            <td style={{ ...s.td, color: C.slate400, fontSize: "12px", fontWeight: 600, width: "40px" }}>{idx + 1}</td>
                                            <td style={s.td}>
                                                <span style={{ ...s.catPill, ...pillStyle }}>{expense.category}</span>
                                            </td>
                                            <td style={{ ...s.td, fontWeight: 600, color: C.slate900, whiteSpace: "nowrap" }}>
                                                {shoot?.title || `Shoot #${expense.shoot_id}`}
                                            </td>
                                            <td style={{ ...s.td, color: C.slate600, maxWidth: "220px" }}>
                                                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {expense.description || "—"}
                                                </div>
                                            </td>
                                            <td style={{ ...s.td, fontWeight: 700, color: C.slate900, whiteSpace: "nowrap" }}>
                                                Rs {fmt(expense.amount)}
                                            </td>
                                            <td style={{ ...s.td, color: C.slate500, fontSize: "12px", whiteSpace: "nowrap" }}>
                                                {new Date(expense.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td style={s.td}>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button onClick={() => openEdit(expense)} style={{ ...s.actionBtn, background: C.amberBg, color: C.amber }} title="Edit">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => deleteExpense(expense.id)} style={{ ...s.actionBtn, background: C.redBg, color: C.red }} title="Delete">
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

                    {filteredExpenses.length > 0 && (
                        <div style={s.tableFooter}>
                            <span style={{ fontSize: "12px", color: C.slate400 }}>
                                Showing {filteredExpenses.length} of {expenses.length} expenses
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: C.slate700 }}>
                                Filtered total: Rs {fmt(filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0))}
                            </span>
                        </div>
                    )}
                </div>

            </div>

            {showCreate && <ModalForm title="Add Expense"  onSubmit={createExpense}  onClose={() => { setShowCreate(false); resetForm(); }} submitLabel="Create Expense" />}
            {showEdit   && <ModalForm title="Edit Expense" onSubmit={updateExpense}  onClose={() => setShowEdit(false)}                     submitLabel="Update Expense" />}

        </Layout>
    );
}