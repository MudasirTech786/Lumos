"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
    Package, Search, RefreshCw, Wrench, AlertTriangle,
    CheckCircle2, X, ScanLine, Printer, Tag, ChevronRight,
    CircleDot, MapPin, Clock, User, ArrowRight, Loader2,
    ShieldCheck, Hash, DollarSign,
} from "lucide-react";

/* ─── STATUS CONFIG ─────────────────────────── */
const STATUS = {
    available:    { label: "Available",    icon: CheckCircle2,  card: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    in_use:       { label: "In Use",       icon: Package,       card: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500"    },
    returned:     { label: "Returned",     icon: RefreshCw,     card: "bg-slate-100  text-slate-600   border-slate-200",   dot: "bg-slate-400"   },
    damaged:      { label: "Damaged",      icon: AlertTriangle, card: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-500"    },
    under_repair: { label: "Under Repair", icon: Wrench,        card: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-500"   },
    written_off:  { label: "Written Off",  icon: X,             card: "bg-red-100    text-red-800     border-red-200",     dot: "bg-red-700"     },
};
const getStatus = (s) => STATUS[s] ?? { label: s || "Unknown", icon: CircleDot, card: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };

const STAT_COLORS = {
    available:    "bg-emerald-50 border-emerald-100 text-emerald-700",
    in_use:       "bg-blue-50    border-blue-100    text-blue-700",
    under_repair: "bg-amber-50   border-amber-100   text-amber-700",
    damaged:      "bg-rose-50    border-rose-100    text-rose-700",
};

const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all";

/* ─── SHARED COMPONENTS ─────────────────────── */
function FieldLabel({ children }) {
    return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{children}</p>;
}

function StatCard({ label, value, status }) {
    const cfg = getStatus(status);
    const Icon = cfg.icon;
    return (
        <div className={`rounded-2xl border px-4 py-4 flex items-center gap-3 ${STAT_COLORS[status] || "bg-white border-slate-200"}`}>
            <div className="w-9 h-9 rounded-xl bg-white/70 border border-white/50 flex items-center justify-center shrink-0">
                <Icon size={15} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
                <p className="text-2xl font-black mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const cfg = getStatus(status);
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.card}`}>
            <Icon size={10} />{cfg.label}
        </span>
    );
}

function DetailTile({ label, value, mono, span }) {
    return (
        <div className={`rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 ${span ? "col-span-2" : ""}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
        </div>
    );
}

function ActionBtn({ status, current, onClick }) {
    const cfg = getStatus(status);
    const Icon = cfg.icon;
    const active = current === status;
    return (
        <button onClick={() => !active && onClick(status)}
            className={["flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                active ? cfg.card + " ring-2 ring-offset-1 ring-current cursor-default" : cfg.card + " opacity-60 hover:opacity-100"].join(" ")}>
            <Icon size={12} />{cfg.label}
        </button>
    );
}

/* ─── ALLOCATION CARD (inside modal) ────────── */
function AllocationCard({ allocation, onReturn }) {
    return (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-blue-500 to-indigo-400" />
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-blue-500 shrink-0" />
                        <p className="text-sm font-bold text-blue-800">{allocation.shoot?.title || "Unknown Shoot"}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        Active
                    </span>
                </div>
                {allocation.assigned_user?.name && (
                    <div className="flex items-center gap-2">
                        <User size={12} className="text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-600">{allocation.assigned_user.name}</p>
                    </div>
                )}
                {allocation.allocated_at && (
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-500">
                            {new Date(allocation.allocated_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                )}
                <button onClick={onReturn}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 transition-colors mt-1">
                    <RefreshCw size={12} /> Return Asset
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function InventoryAssetsPage() {
    const [assets,        setAssets]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [search,        setSearch]        = useState("");
    const [statusFilter,  setStatusFilter]  = useState("all");
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showAllocate,  setShowAllocate]  = useState(false);
    const [shoots,        setShoots]        = useState([]);
    const [users,         setUsers]         = useState([]);
    const [selectedShoot, setSelectedShoot] = useState("");
    const [assignedTo,    setAssignedTo]    = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAssets = async () => {
        try { setLoading(true); const r = await api.get("/inventory/inventory-assets"); setAssets(r.data.data || []); }
        catch { toast.error("Failed to load assets"); }
        finally { setLoading(false); }
    };

    const loadAssetDetails = async (id) => {
        try { const r = await api.get(`/inventory/inventory-assets/${id}`); setSelectedAsset(r.data.data); }
        catch { toast.error("Failed to load asset details"); }
    };

    const loadShoots = async () => {
        try {
            const [sr, ur] = await Promise.all([api.get("/shoots"), api.get("/users")]);
            setShoots(sr.data || []);
            setUsers(ur.data?.users?.data ?? []);
        } catch {}
    };

    useEffect(() => { fetchAssets(); loadShoots(); }, []);

    const updateStatus = async (assetId, status) => {
        try {
            await api.post(`/inventory/inventory-assets/${assetId}/status`, { status });
            toast.success("Status updated"); fetchAssets();
            if (selectedAsset) setSelectedAsset(p => ({ ...p, status }));
        } catch { toast.error("Failed to update status"); }
    };

    const handleAllocate = async () => {
        try {
            setActionLoading(true);
            await api.post(`/inventory-assets/${selectedAsset.id}/allocate`, { shoot_id: selectedShoot, assigned_to: assignedTo });
            toast.success("Asset allocated"); setShowAllocate(false);
            await fetchAssets(); await loadAssetDetails(selectedAsset.id);
        } catch (e) { toast.error(e.response?.data?.message || "Allocation failed"); }
        finally { setActionLoading(false); }
    };

    const handleReturn = async (assetId) => {
        try {
            setActionLoading(true);
            await api.post(`/inventory-assets/${assetId}/return`);
            toast.success("Asset returned");
            await fetchAssets(); await loadAssetDetails(assetId);
        } catch { toast.error("Return failed"); }
        finally { setActionLoading(false); }
    };

    const filtered = useMemo(() => {
        let r = [...assets];
        if (statusFilter !== "all") r = r.filter(a => a.status === statusFilter);
        if (search.trim()) { const q = search.toLowerCase(); r = r.filter(a => `${a.asset_code} ${a.item?.name} ${a.status}`.toLowerCase().includes(q)); }
        return r;
    }, [assets, search, statusFilter]);

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-8 space-y-5">

                    {/* ── HEADER ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Inventory Assets</h1>
                            <p className="text-sm text-slate-400 mt-0.5">Individual asset tracking and QR management</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/dashboard/inventory/assets/labels"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
                                <Printer size={14} /> Print Labels
                            </Link>
                            <Link href="/dashboard/inventory/scanner"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold transition-colors shadow-sm">
                                <ScanLine size={14} /> QR Scanner
                            </Link>
                            <button onClick={fetchAssets}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-bold transition-colors shadow-sm">
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* ── STATS ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard label="Available"    value={assets.filter(a => a.status === "available").length}    status="available" />
                        <StatCard label="In Use"        value={assets.filter(a => a.status === "in_use").length}        status="in_use" />
                        <StatCard label="Under Repair"  value={assets.filter(a => a.status === "under_repair").length}  status="under_repair" />
                        <StatCard label="Damaged"       value={assets.filter(a => a.status === "damaged").length}       status="damaged" />
                    </div>

                    {/* ── FILTERS ── */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, name or status…"
                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm" />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 focus:border-blue-400 outline-none shadow-sm cursor-pointer">
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="in_use">In Use</option>
                            <option value="returned">Returned</option>
                            <option value="damaged">Damaged</option>
                            <option value="under_repair">Under Repair</option>
                            <option value="written_off">Written Off</option>
                        </select>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-sm shadow-sm shrink-0">
                            <Package size={13} className="text-slate-300" />
                            <span className="text-slate-500"><strong className="text-slate-700">{filtered.length}</strong> asset{filtered.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* ── GRID ── */}
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white py-20 flex flex-col items-center gap-3">
                            <RefreshCw size={22} className="text-slate-300 animate-spin" />
                            <p className="text-sm text-slate-400 font-medium">Loading assets…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-white py-20 flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200"><Package size={24} /></div>
                            <p className="text-sm text-slate-400 font-medium">No assets found</p>
                            {search && <button onClick={() => setSearch("")} className="text-xs font-bold text-blue-500 hover:text-blue-700">Clear search</button>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map(asset => {
                                const cfg = getStatus(asset.status);
                                return (
                                    <div key={asset.id} onClick={() => loadAssetDetails(asset.id)}
                                        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
                                        <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400" />
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{asset.item?.category || "Asset"}</p>
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 tracking-tight font-mono">{asset.asset_code}</h3>
                                                    <p className="text-sm text-slate-500 mt-0.5 truncate">{asset.item?.name}</p>
                                                </div>
                                                <div className="shrink-0 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                                                    <QRCodeSVG value={asset.qr_uuid} size={50} level="M" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <StatusBadge status={asset.status} />
                                                {asset.serial_number && (
                                                    <span className="text-[10px] font-mono text-slate-400 truncate ml-2">SN: {asset.serial_number}</span>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-slate-300 truncate max-w-[180px]">{asset.qr_uuid?.slice(0, 22)}…</span>
                                                <span className="text-xs font-bold text-blue-500 group-hover:text-blue-700 flex items-center gap-1 transition-colors shrink-0">
                                                    Details <ChevronRight size={11} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════
                ASSET DETAIL MODAL
            ══════════════════════════════════════════ */}
            {selectedAsset && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                    <div className="absolute inset-0" onClick={() => setSelectedAsset(null)} />

                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        style={{ boxShadow: "0 32px 64px -12px rgba(0,0,0,0.3)" }}>
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-300" />

                        {/* modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Package size={14} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Asset Details</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{selectedAsset.asset_code}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAsset(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4 max-h-[72vh] overflow-y-auto">

                            {/* ── HERO BLOCK ── */}
                            <div className="relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-400" />
                                <div className="p-4 flex items-start gap-4">
                                    {/* QR */}
                                    <div className="shrink-0 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
                                        <QRCodeSVG value={selectedAsset.qr_uuid} size={80} level="M" />
                                    </div>
                                    {/* info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verified Asset</span>
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight leading-tight">{selectedAsset.asset_code}</h2>
                                        <p className="text-sm text-slate-500 mt-0.5 truncate">{selectedAsset.item?.name}</p>
                                        {selectedAsset.item?.category && (
                                            <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                                                <Tag size={7} />{selectedAsset.item.category}
                                            </span>
                                        )}
                                        <div className="mt-2">
                                            <StatusBadge status={selectedAsset.status} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── DETAIL GRID ── */}
                            <div className="grid grid-cols-2 gap-2">
                                <DetailTile label="Equipment"  value={selectedAsset.item?.name} />
                                <DetailTile label="Category"   value={selectedAsset.item?.category} />
                                <DetailTile label="Assigned To" value={selectedAsset.active_allocation?.assigned_user?.name || "Unassigned"} />
                                <DetailTile label="Shoot"       value={selectedAsset.active_allocation?.shoot?.title || "Not Allocated"} />
                                {selectedAsset.item?.daily_rental_value && (
                                    <DetailTile label="Daily Rate" value={`Rs ${Number(selectedAsset.item.daily_rental_value).toLocaleString("en-PK")}`} />
                                )}
                                {selectedAsset.serial_number && (
                                    <DetailTile label="Serial No." value={selectedAsset.serial_number} mono />
                                )}
                                <DetailTile label="QR UUID" value={selectedAsset.qr_uuid} mono span />
                            </div>

                            {/* ── ALLOCATION BLOCK ── */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Assignment</p>
                                {selectedAsset.active_allocation ? (
                                    <AllocationCard
                                        allocation={selectedAsset.active_allocation}
                                        onReturn={() => handleReturn(selectedAsset.id)}
                                    />
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 flex items-center justify-between gap-3">
                                        <p className="text-sm text-slate-400">Not allocated to any shoot</p>
                                        <button onClick={() => setShowAllocate(true)}
                                            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 transition-colors">
                                            <ArrowRight size={12} /> Allocate
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ── STATUS ACTIONS ── */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Update Status</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {["available","in_use","returned","damaged","under_repair","written_off"].map(s => (
                                        <ActionBtn key={s} status={s} current={selectedAsset.status} onClick={st => updateStatus(selectedAsset.id, st)} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
                            <button onClick={() => setSelectedAsset(null)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                ALLOCATE MODAL
            ══════════════════════════════════════════ */}
            {showAllocate && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                    onClick={e => e.target === e.currentTarget && setShowAllocate(false)}>

                    <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl"
                        style={{ boxShadow: "0 32px 64px -12px rgba(0,0,0,0.3)" }}>
                        <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400" />

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Package size={14} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Allocate Asset</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{selectedAsset?.asset_code}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAllocate(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <FieldLabel>Select Shoot</FieldLabel>
                                <select value={selectedShoot} onChange={e => setSelectedShoot(e.target.value)} className={inp + " cursor-pointer"}>
                                    <option value="">Choose a shoot…</option>
                                    {shoots.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <FieldLabel>Assign to Crew Member</FieldLabel>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inp + " cursor-pointer"}>
                                    <option value="">Choose crew member…</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-3">
                            <button onClick={() => setShowAllocate(false)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAllocate} disabled={actionLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-colors">
                                {actionLoading && <Loader2 size={13} className="animate-spin" />}
                                Allocate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}