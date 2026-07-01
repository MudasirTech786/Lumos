"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import {
    ArrowLeft, Receipt, Plus, Trash2, Save,
    ChevronRight, ChevronLeft, ChevronDown, X,
    Users, Truck,
    Package, FileText, Calculator, CheckCircle2,
    Clapperboard, Calendar, Hash, Percent,
    Tag, StickyNote, Check,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (n) => Number(n || 0).toLocaleString("en-PK");
const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition font-sans";
const labelCls = "block text-sm font-bold text-slate-600 uppercase tracking-widest mb-1.5";

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
    { id: 0, label: "Details",    icon: <FileText size={15} />,   short: "Invoice Details" },
    { id: 1, label: "Crew",       icon: <Users size={15} />,      short: "Crew Members" },
    { id: 2, label: "Logistics",  icon: <Truck size={15} />,      short: "Logistics" },
    { id: 3, label: "Inventory",  icon: <Package size={15} />,    short: "Inventory" },
    { id: 4, label: "Expenses",   icon: <Tag size={15} />,        short: "Shoot Expenses" },
    { id: 5, label: "Add. Charges", icon: <Receipt size={15} />,  short: "Additional Charges" },
    { id: 6, label: "Summary",    icon: <Calculator size={15} />, short: "Review & Submit" },
];

// ─── Checkbox selection row ───────────────────────────────────────────────────
function SelectableRow({ checked, onChange, primary, secondary, amount, accentColor = "blue" }) {
    const accents = {
        blue:   { border: "border-blue-500 bg-blue-50",   amount: "text-blue-600",   check: "bg-blue-600" },
        violet: { border: "border-violet-500 bg-violet-50", amount: "text-violet-600", check: "bg-violet-600" },
        emerald:{ border: "border-emerald-500 bg-emerald-50", amount: "text-emerald-600", check: "bg-emerald-600" },
        amber:  { border: "border-amber-500 bg-amber-50",  amount: "text-amber-600",  check: "bg-amber-600" },
    };
    const a = accents[accentColor] ?? accents.blue;
    return (
        <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${checked ? a.border : "border-slate-200 bg-white hover:bg-slate-50/80"}`}>
            <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? `${a.check} border-transparent` : "border-slate-300 bg-white"}`}>
                    {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
                <div>
                    <p className="text-base font-semibold text-slate-900">{primary}</p>
                    {secondary && <p className="text-sm text-slate-400 mt-0.5">{secondary}</p>}
                </div>
            </div>
            <span className={`text-base font-bold ${checked ? a.amount : "text-slate-500"}`}>Rs {fmt(amount)}</span>
        </label>
    );
}

// ─── Select all toggle ────────────────────────────────────────────────────────
function SelectAll({ items, selected, onSelectAll, onDeselectAll, color = "blue" }) {
    const all = items.length > 0 && items.every(i => selected.includes(i));
    const some = !all && items.some(i => selected.includes(i));
    const colors = {
        blue:   { check: "bg-blue-600", border: "border-blue-500 bg-blue-50 text-blue-700", neutral: "border-slate-200 bg-white text-slate-600" },
        violet: { check: "bg-violet-600", border: "border-violet-500 bg-violet-50 text-violet-700", neutral: "border-slate-200 bg-white text-slate-600" },
        emerald:{ check: "bg-emerald-600", border: "border-emerald-500 bg-emerald-50 text-emerald-700", neutral: "border-slate-200 bg-white text-slate-600" },
        amber:  { check: "bg-amber-600", border: "border-amber-500 bg-amber-50 text-amber-700", neutral: "border-slate-200 bg-white text-slate-600" },
    };
    const c = colors[color] ?? colors.blue;
    return (
        <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 mb-4 cursor-pointer transition-all ${all ? c.border : c.neutral}`}>
            <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${all ? `${c.check} border-transparent` : some ? `${c.check} border-transparent opacity-60` : "border-slate-300 bg-white"}`}
                onClick={() => all ? onDeselectAll() : onSelectAll()}
            >
                {all  && <Check size={11} className="text-white" strokeWidth={3} />}
                {some && !all && <div className="w-2 h-0.5 bg-white rounded-full" />}
            </div>
            <input type="checkbox" className="hidden" checked={all} onChange={() => all ? onDeselectAll() : onSelectAll()} />
            <span className="text-sm font-bold">
                {all ? "Deselect All" : some ? `${selected.length} selected — Select All` : "Select All"}
            </span>
            <span className="ml-auto text-sm font-semibold text-slate-400">{items.length} items</span>
        </label>
    );
}

// ─── Section total bar ────────────────────────────────────────────────────────
function SectionTotal({ label, total, count, color = "blue" }) {
    const colors = {
        blue:   "bg-blue-50 border-blue-100 text-blue-600",
        violet: "bg-violet-50 border-violet-100 text-violet-600",
        emerald:"bg-emerald-50 border-emerald-100 text-emerald-600",
        amber:  "bg-amber-50 border-amber-100 text-amber-600",
    };
    return (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 mb-5 ${colors[color]}`}>
            <span className="text-base font-semibold text-slate-600">
                {count > 0 ? <span className="font-bold">{count} selected</span> : "None selected"} · {label}
            </span>
            <span className="text-lg font-extrabold">Rs {fmt(total)}</span>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">{icon}</div>
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────
function StepPanel({ title, sub, icon, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <span className="text-blue-600">{icon}</span>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ─── Searchable Production Select ─────────────────────────────────────────────
function ProductionSelect({ shoots, loading, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const filtered = useMemo(() => {
        if (!query) return shoots;
        const q = query.toLowerCase();
        return shoots.filter(s =>
            s.title?.toLowerCase().includes(q) ||
            s.client_name?.toLowerCase().includes(q) ||
            s.location?.toLowerCase().includes(q)
        );
    }, [shoots, query]);

    const selected = shoots.find(s => s.id === value);

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setHighlightedIndex(-1);
        }
    }, [isOpen]);

    useEffect(() => {
        const handle = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const handleKeyDown = (e) => {
        if (!isOpen) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
                    onChange(filtered[highlightedIndex].id);
                    setIsOpen(false);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Clapperboard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? query : (selected ? selected.title : "")}
                    onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search productions…"
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-base text-slate-900 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition font-sans"
                />
                {value && !isOpen ? (
                    <button
                        onClick={() => { onChange(null); setQuery(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                    >
                        <X size={15} />
                    </button>
                ) : (
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                )}
            </div>
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-5 text-sm text-slate-400">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            Loading productions…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-5 text-center text-sm text-slate-400">No productions found</div>
                    ) : (
                        <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
                            {filtered.map((s, i) => (
                                <li
                                    key={s.id}
                                    role="option"
                                    aria-selected={s.id === value}
                                    onClick={() => { onChange(s.id); setIsOpen(false); }}
                                    onMouseEnter={() => setHighlightedIndex(i)}
                                    className={`px-4 py-3 cursor-pointer flex flex-col gap-0.5 transition-colors ${i === highlightedIndex ? "bg-blue-50" : "hover:bg-slate-50"} ${s.id === value ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent"}`}
                                >
                                    <span className="text-sm font-semibold text-slate-900">{s.title}</span>
                                    <span className="text-xs text-slate-400">
                                        {[s.client_name, s.location, s.status].filter(Boolean).join(" • ")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
function CreateProductionInvoiceContent() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const shootId      = searchParams.get("shoot_id");

    const [step,     setStep]     = useState(0);
    const [loading,  setLoading]  = useState(false);
    const [shoot,    setShoot]    = useState(null);
    const [shootExpenses, setShootExpenses] = useState([]);

    const [form, setForm] = useState({
        shoot_id:        "",
        title:           "",
        issue_date:      new Date().toISOString().split("T")[0],
        due_date:        "",
        tax_percentage:  0,
        discount_amount: 0,
        notes:           "",
    });

    const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0 }]);
    const [selectedExpenses,  setSelectedExpenses]  = useState([]);
    const [selectedCrew,      setSelectedCrew]      = useState([]);
    const [selectedLogistics, setSelectedLogistics] = useState([]);
    const [selectedInventory, setSelectedInventory] = useState([]);

    const [shoots, setShoots] = useState([]);
    const [shootsLoading, setShootsLoading] = useState(false);

    async function loadShoot(id) {
        setForm(prev => ({ ...prev, shoot_id: id }));
        setSelectedCrew([]);
        setSelectedLogistics([]);
        setSelectedInventory([]);
        setSelectedExpenses([]);
        try {
            const [sRes, eRes] = await Promise.all([
                api.get(`/shoots/${id}`),
                api.get(`/shoots/${id}/expenses`),
            ]);
            setShoot(sRes.data);
            setShootExpenses(eRes.data?.data || []);
        } catch (e) { console.error(e); }
    }

    useEffect(() => {
        if (shootId) loadShoot(shootId);
    }, [shootId]);

    useEffect(() => {
        if (shootId) return;
        setShootsLoading(true);
        api.get("/shoots")
            .then(res => setShoots(Array.isArray(res.data) ? res.data : res.data?.data || []))
            .catch(() => {
                const id = progressToast.loading({ title: "Error", message: "" });
                progressToast.error(id, { title: "Error", message: "Failed to load productions" });
            })
            .finally(() => setShootsLoading(false));
    }, [shootId]);

    // ── Totals ────────────────────────────────────────────────────────────────
    const crewTotal = useMemo(() =>
        (shoot?.crew_members || [])
            .filter(m => selectedCrew.includes(m.id))
            .reduce((s, m) => s + Number(m.rate_per_shift || 0), 0),
        [shoot, selectedCrew]);

    const logisticsTotal = useMemo(() =>
        (shoot?.logistics || [])
            .filter(i => selectedLogistics.includes(i.id))
            .reduce((s, i) => s + Number(i.estimated_cost || 0), 0),
        [shoot, selectedLogistics]);

    const inventoryTotal = useMemo(() =>
        (shoot?.inventory_usages || [])
            .filter(i => selectedInventory.includes(i.id))
            .reduce((s, i) => s + Number(i.item?.daily_rental_value || 0) * Number(i.quantity || 1), 0),
        [shoot, selectedInventory]);

    const expenseTotal = useMemo(() =>
        shootExpenses
            .filter(e => selectedExpenses.includes(e.id))
            .reduce((s, e) => s + Number(e.amount || 0), 0),
        [shootExpenses, selectedExpenses]);

    const itemTotal = useMemo(() =>
        items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0),
        [items]);

    const subtotal    = itemTotal + expenseTotal + crewTotal + logisticsTotal + inventoryTotal;
    const taxAmount   = subtotal * (Number(form.tax_percentage || 0) / 100);
    const grandTotal  = subtotal + taxAmount - Number(form.discount_amount || 0);

    // ── Step summary badges (for stepper) ─────────────────────────────────────
    const stepBadge = [
        form.title ? "✓" : null,
        selectedCrew.length || null,
        selectedLogistics.length || null,
        selectedInventory.length || null,
        selectedExpenses.length || null,
        items.filter(i => i.description?.trim()).length || null,
        null,
    ];

    // ── Item helpers ──────────────────────────────────────────────────────────
    const updateItem = (i, f, v) => { const u = [...items]; u[i][f] = v; setItems(u); };
    const addItem    = () => setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
    const removeItem = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };

    // ── Toggle helpers ────────────────────────────────────────────────────────
    const toggle = (setter, id) => setter(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const pToastId = progressToast.loading({
            title: "Creating Invoice",
            message: "Preparing invoice data...",
        });

        try {
            setLoading(true);

            progressToast.update(pToastId, {
                progress: 30,
                message: "Building invoice items...",
            });

            const finalItems = [
                ...items.filter(i => i.description?.trim()),
                ...(shoot?.crew_members || []).filter(m => selectedCrew.includes(m.id))
                    .map(m => ({ description: `[Crew] ${m.name}`, quantity: 1, unit_price: Number(m.rate_per_shift) })),
                ...(shoot?.logistics || []).filter(i => selectedLogistics.includes(i.id))
                    .map(i => ({ description: `[Logistics] ${i.vehicle}`, quantity: 1, unit_price: Number(i.estimated_cost) })),
                ...(shoot?.inventory_usages || []).filter(i => selectedInventory.includes(i.id))
                    .map(i => ({ description: `[Inventory] ${i.item?.name}`, quantity: Number(i.quantity || 1), unit_price: Number(i.item?.daily_rental_value || 0) })),
                ...shootExpenses.filter(e => selectedExpenses.includes(e.id))
                    .map(e => ({ description: `[Expense] ${e.category} - ${e.description}`, quantity: 1, unit_price: Number(e.amount) })),
            ];

            progressToast.update(pToastId, {
                progress: 70,
                message: "Sending to server...",
            });

            await api.post("/production-invoices", { ...form, items: finalItems });

            progressToast.success(pToastId, {
                title: "Invoice Created",
                message: "Invoice created successfully.",
            });

            router.back();
        } catch (err) {
            progressToast.error(pToastId, {
                title: "Invoice Failed",
                message: err?.response?.data?.message || "Failed to create invoice",
            });
        } finally {
            setLoading(false);
        }
    };

    const canNext = step < STEPS.length - 1;
    const canPrev = step > 0;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 font-sans pb-32">

                {/* ── PAGE HEADER ─────────────────────────────────────────── */}
                <div className="bg-white border-b border-slate-200 px-6 py-5">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors">
                                <ArrowLeft size={15} /> Back
                            </button>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Receipt size={16} />
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-slate-900 leading-tight">
                                        {shoot?.title ? `Invoice · ${shoot.title}` : "Create Production Invoice"}
                                    </h1>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {shoot?.client_name ? `Client: ${shoot.client_name}` : "Fill out the steps below"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
                            <span>Invoices</span>
                            <ChevronRight size={12} />
                            <span className="text-slate-600 font-semibold">New Invoice</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pt-6">

                    {/* ── STEP INDICATOR ──────────────────────────────────── */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 overflow-x-auto">
                            <div className="flex items-center gap-1 min-w-max">
                                {STEPS.map((s, i) => {
                                    const done   = i < step;
                                    const active = i === step;
                                    const badge  = stepBadge[i];
                                    return (
                                        <div key={s.id} className="flex items-center">
                                            <button
                                                onClick={() => setStep(i)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                                    ${active ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                    : done  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    :         "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                                            >
                                                {done ? <Check size={12} strokeWidth={3} /> : s.icon}
                                                <span>{s.label}</span>
                                                {badge && !active && (
                                                    <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-extrabold ${done ? "bg-emerald-200 text-emerald-800" : "bg-blue-100 text-blue-700"}`}>
                                                        {badge}
                                                    </span>
                                                )}
                                            </button>
                                            {i < STEPS.length - 1 && (
                                                <div className={`w-5 h-px mx-1 rounded-full ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* progress bar */}
                        <div className="h-1 bg-slate-100">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                                style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* ── STEP 0: DETAILS ─────────────────────────────────── */}
                    {step === 0 && (
                        <StepPanel title="Invoice Details" sub="Basic invoice information" icon={<FileText size={15} />}>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Invoice Title</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={`${inputCls} text-base`} placeholder="e.g. 50% Advance Payment" />
                                </div>
                                <div>
                                    <label className={labelCls}>Production / Shoot</label>
                                    {shootId ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                                                <Clapperboard size={15} className="text-blue-500 flex-shrink-0" />
                                                <span className="text-sm font-semibold text-slate-700">{shoot?.title || "Loading…"}</span>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                Opened from Production
                                            </span>
                                        </div>
                                    ) : (
                                        <ProductionSelect
                                            shoots={shoots}
                                            loading={shootsLoading}
                                            value={form.shoot_id}
                                            onChange={(id) => {
                                                if (id) {
                                                    loadShoot(id);
                                                } else {
                                                    setForm(prev => ({ ...prev, shoot_id: "" }));
                                                    setShoot(null);
                                                    setShootExpenses([]);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className={labelCls}>Issue Date</label>
                                    <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Due Date</label>
                                    <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelCls}>Notes</label>
                                    <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} placeholder="Optional notes for this invoice…" />
                                </div>
                            </div>
                        </StepPanel>
                    )}

                    {/* ── STEP 1: CREW ────────────────────────────────────── */}
                    {step === 1 && (
                        <StepPanel title="Crew Members" sub="Select crew to include in this invoice" icon={<Users size={15} />}>
                            <SectionTotal label="Crew subtotal" total={crewTotal} count={selectedCrew.length} color="blue" />
                            {!shoot?.crew_members?.length
                                ? <EmptyState icon={<Users size={20} />} message="No crew members found for this shoot" />
                                : <div className="space-y-2">
                                    <SelectAll
                                        items={shoot.crew_members.map(m => m.id)}
                                        selected={selectedCrew}
                                        onSelectAll={() => setSelectedCrew(shoot.crew_members.map(m => m.id))}
                                        onDeselectAll={() => setSelectedCrew([])}
                                        color="blue"
                                    />
                                    {shoot.crew_members.map(m => (
                                        <SelectableRow key={m.id} checked={selectedCrew.includes(m.id)} onChange={() => toggle(setSelectedCrew, m.id)}
                                            primary={m.name} secondary={m.designation} amount={m.rate_per_shift} accentColor="blue" />
                                    ))}
                                </div>
                            }
                        </StepPanel>
                    )}

                    {/* ── STEP 2: LOGISTICS ───────────────────────────────── */}
                    {step === 2 && (
                        <StepPanel title="Logistics" sub="Select logistics to include in this invoice" icon={<Truck size={15} />}>
                            <SectionTotal label="Logistics subtotal" total={logisticsTotal} count={selectedLogistics.length} color="violet" />
                            {!shoot?.logistics?.length
                                ? <EmptyState icon={<Truck size={20} />} message="No logistics found for this shoot" />
                                : <div className="space-y-2">
                                    <SelectAll
                                        items={shoot.logistics.map(i => i.id)}
                                        selected={selectedLogistics}
                                        onSelectAll={() => setSelectedLogistics(shoot.logistics.map(i => i.id))}
                                        onDeselectAll={() => setSelectedLogistics([])}
                                        color="violet"
                                    />
                                    {shoot.logistics.map(i => (
                                        <SelectableRow key={i.id} checked={selectedLogistics.includes(i.id)} onChange={() => toggle(setSelectedLogistics, i.id)}
                                            primary={i.vehicle} secondary={i.driver_name} amount={i.estimated_cost} accentColor="violet" />
                                    ))}
                                </div>
                            }
                        </StepPanel>
                    )}

                    {/* ── STEP 3: INVENTORY ───────────────────────────────── */}
                    {step === 3 && (
                        <StepPanel title="Inventory" sub="Select inventory items to include in this invoice" icon={<Package size={15} />}>
                            <SectionTotal label="Inventory subtotal" total={inventoryTotal} count={selectedInventory.length} color="emerald" />
                            {!shoot?.inventory_usages?.length
                                ? <EmptyState icon={<Package size={20} />} message="No inventory found for this shoot" />
                                : <div className="space-y-2">
                                    <SelectAll
                                        items={shoot.inventory_usages.map(i => i.id)}
                                        selected={selectedInventory}
                                        onSelectAll={() => setSelectedInventory(shoot.inventory_usages.map(i => i.id))}
                                        onDeselectAll={() => setSelectedInventory([])}
                                        color="emerald"
                                    />
                                    {shoot.inventory_usages.map(i => (
                                        <SelectableRow key={i.id} checked={selectedInventory.includes(i.id)} onChange={() => toggle(setSelectedInventory, i.id)}
                                            primary={i.item?.name} secondary={`Qty: ${i.quantity}`}
                                            amount={Number(i.item?.daily_rental_value || 0) * Number(i.quantity || 1)} accentColor="emerald" />
                                    ))}
                                </div>
                            }
                        </StepPanel>
                    )}

                    {/* ── STEP 4: EXPENSES ────────────────────────────────── */}
                    {step === 4 && (
                        <StepPanel title="Shoot Expenses" sub="Select logged expenses to include in this invoice" icon={<Tag size={15} />}>
                            <SectionTotal label="Expenses subtotal" total={expenseTotal} count={selectedExpenses.length} color="amber" />
                            {!shootExpenses.length
                                ? <EmptyState icon={<Tag size={20} />} message="No expenses found for this shoot" />
                                : <div className="space-y-2">
                                    <SelectAll
                                        items={shootExpenses.map(e => e.id)}
                                        selected={selectedExpenses}
                                        onSelectAll={() => setSelectedExpenses(shootExpenses.map(e => e.id))}
                                        onDeselectAll={() => setSelectedExpenses([])}
                                        color="amber"
                                    />
                                    {shootExpenses.map(e => (
                                        <SelectableRow key={e.id} checked={selectedExpenses.includes(e.id)} onChange={() => toggle(setSelectedExpenses, e.id)}
                                            primary={e.category} secondary={e.description} amount={e.amount} accentColor="amber" />
                                    ))}
                                </div>
                            }
                        </StepPanel>
                    )}

                    {/* ── STEP 5: ADDITIONAL CHARGES ──────────────────────── */}
                    {step === 5 && (
                        <StepPanel title="Additional Charges" sub="Add any extra charges not covered above" icon={<Receipt size={15} />}>
                            {/* column headers */}
                            <div className="hidden md:grid grid-cols-12 gap-3 px-1 mb-2">
                                <span className="col-span-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</span>
                                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Qty</span>
                                <span className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Price</span>
                                <span className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                <span className="col-span-1" />
                            </div>

                            <div className="space-y-3">
                                {items.map((item, i) => (
                                    <div key={i} className={`grid md:grid-cols-12 gap-3 border rounded-xl p-4 transition-all ${item.description?.trim() ? "border-blue-200 bg-blue-50/30" : "border-slate-200 bg-white"}`}>
                                        <div className="md:col-span-5">
                                            <input placeholder="Charge description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className={inputCls} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} className={inputCls} />
                                        </div>
                                        <div className="md:col-span-3">
                                            <input type="number" min="0" placeholder="Unit price" value={item.unit_price} onChange={e => updateItem(i, "unit_price", e.target.value)} className={inputCls} />
                                        </div>
                                        <div className="md:col-span-1 flex items-center">
                                            <span className="text-base font-extrabold text-slate-900 tabular-nums">
                                                Rs {fmt((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                                            </span>
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-center">
                                            <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                                <button onClick={addItem} className="inline-flex items-center gap-2 text-base font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors">
                                    <Plus size={14} /> Add Charge
                                </button>
                                <span className="text-base font-bold text-slate-700">
                                    Charges total: <span className="text-blue-600">Rs {fmt(itemTotal)}</span>
                                </span>
                            </div>
                        </StepPanel>
                    )}

                    {/* ── STEP 6: SUMMARY ─────────────────────────────────── */}
                    {step === 6 && (
                        <div className="space-y-5">

                            {/* Cost breakdown cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                                {[
                                    { label: "Add. Charges", val: itemTotal,      color: "bg-blue-500",    icon: <Receipt size={14} /> },
                                    { label: "Crew",        val: crewTotal,      color: "bg-violet-500",  icon: <Users size={14} /> },
                                    { label: "Logistics",   val: logisticsTotal, color: "bg-indigo-500",  icon: <Truck size={14} /> },
                                    { label: "Inventory",   val: inventoryTotal, color: "bg-emerald-500", icon: <Package size={14} /> },
                                    { label: "Expenses",    val: expenseTotal,   color: "bg-amber-500",   icon: <Tag size={14} /> },
                                    { label: "Subtotal",    val: subtotal,       color: "bg-slate-700",   icon: <Calculator size={14} /> },
                                ].map(({ label, val, color, icon }) => (
                                    <div key={label} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <div className={`h-1 ${color}`} />
                                        <div className="p-4">
                                            <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center mb-2 text-white ${color.replace("bg-", "bg-")}`}
                                                style={{ background: `${color.includes("blue") ? "#EFF6FF" : color.includes("violet") ? "#F5F3FF" : color.includes("indigo") ? "#EEF2FF" : color.includes("emerald") ? "#ECFDF5" : color.includes("amber") ? "#FFFBEB" : "#F8FAFC"}`, color: color.includes("blue") ? "#2563EB" : color.includes("violet") ? "#7C3AED" : color.includes("indigo") ? "#4338CA" : color.includes("emerald") ? "#059669" : color.includes("amber") ? "#D97706" : "#334155" }}>
                                                {icon}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-base font-extrabold text-slate-900 mt-1 tabular-nums">Rs {fmt(val)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tax & discount + grand total */}
                            <StepPanel title="Invoice Summary" sub="Adjust tax, discount and review final total" icon={<Calculator size={15} />}>
                                <div className="grid md:grid-cols-2 gap-5 mb-6">
                                    <div>
                                        <label className={labelCls}>Tax Percentage (%)</label>
                                        <div className="relative">
                                            <input type="number" min="0" max="100" value={form.tax_percentage}
                                                onChange={e => setForm({ ...form, tax_percentage: e.target.value })}
                                                className={`${inputCls} pr-10`} placeholder="0" />
                                            <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Discount Amount (Rs)</label>
                                        <input type="number" min="0" value={form.discount_amount}
                                            onChange={e => setForm({ ...form, discount_amount: e.target.value })}
                                            className={inputCls} placeholder="0" />
                                    </div>
                                </div>

                                {/* totals breakdown */}
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    {[
                                        { label: "Subtotal",  val: subtotal,    color: "text-slate-900" },
                                        { label: `Tax (${form.tax_percentage || 0}%)`, val: taxAmount, color: "text-slate-900" },
                                        { label: "Discount",  val: -Number(form.discount_amount || 0), color: "text-red-600" },
                                    ].map(({ label, val, color }) => (
                                        <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 last:border-0">
                                            <span className="text-base text-slate-600">{label}</span>
                                            <span className={`text-base font-bold tabular-nums ${color}`}>
                                                {val < 0 ? "−" : ""}Rs {fmt(Math.abs(val))}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between px-5 py-4 bg-blue-50 border-t-2 border-blue-200">
                                        <span className="text-lg font-bold text-slate-900">Grand Total</span>
                                        <span className="text-3xl font-extrabold text-blue-600 tabular-nums">Rs {fmt(grandTotal)}</span>
                                    </div>
                                </div>
                            </StepPanel>
                        </div>
                    )}

                </div>

                {/* ── STICKY BOTTOM NAV ───────────────────────────────────── */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

                        {/* left: step info */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-sm text-slate-400">
                                Step <span className="font-bold text-slate-700">{step + 1}</span> of {STEPS.length}
                            </div>
                            <div className="w-px h-4 bg-slate-200" />
                            <span className="text-base font-semibold text-slate-700">{STEPS[step].short}</span>
                        </div>

                        {/* right: navigation */}
                        <div className="flex items-center gap-3 ml-auto">
                            {canPrev && (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <ChevronLeft size={15} /> Back
                                </button>
                            )}
                            {canNext && (
                                <button onClick={() => setStep(s => s + 1)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200">
                                    Continue <ChevronRight size={15} />
                                </button>
                            )}
                            {step === STEPS.length - 1 && (
                                <button onClick={handleSubmit} disabled={loading}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50">
                                    {loading ? "Creating…" : <><CheckCircle2 size={15} /> Create Invoice · Rs {fmt(grandTotal)}</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}

export default function CreateProductionInvoicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Receipt size={24} className="text-white" />
                    </div>
                    <p className="text-slate-500 text-base font-medium">Loading…</p>
                </div>
            </div>
        }>
            <CreateProductionInvoiceContent />
        </Suspense>
    );
}