"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
    Package, Search, RefreshCw, Wrench,
    AlertTriangle, CheckCircle2, X, ScanLine,
    Printer, Tag, Hash, ChevronRight,
    CircleDot, ArrowUpRight,
} from "lucide-react";
/* ─── STATUS CONFIG ─────────────────────────── */
const STATUS = {
    available: { label: "Available", icon: CheckCircle2, card: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    in_use: { label: "In Use", icon: Package, card: "bg-blue-50    text-blue-700    border-blue-200", dot: "bg-blue-500" },
    returned: { label: "Returned", icon: RefreshCw, card: "bg-slate-100  text-slate-600   border-slate-200", dot: "bg-slate-400" },
    damaged: { label: "Damaged", icon: AlertTriangle, card: "bg-rose-50    text-rose-700    border-rose-200", dot: "bg-rose-500" },
    under_repair: { label: "Under Repair", icon: Wrench, card: "bg-amber-50   text-amber-700   border-amber-200", dot: "bg-amber-500" },
    written_off: { label: "Written Off", icon: X, card: "bg-red-100    text-red-800     border-red-200", dot: "bg-red-700" },
};

const getStatus = (s) => STATUS[s] ?? { label: s, icon: CircleDot, card: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };

/* ─── STAT CARD ─────────────────────────────── */
const STAT_COLORS = {
    available: "bg-emerald-50 border-emerald-100 text-emerald-700",
    in_use: "bg-blue-50    border-blue-100    text-blue-700",
    under_repair: "bg-amber-50   border-amber-100   text-amber-700",
    damaged: "bg-rose-50    border-rose-50     text-rose-700",
};

function StatCard({ label, value, status }) {
    const cfg = getStatus(status);
    const Icon = cfg.icon;
    return (
        <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${STAT_COLORS[status] || "bg-white border-slate-200"}`}>
            <div className="w-9 h-9 rounded-xl bg-white/70 border border-white flex items-center justify-center shrink-0">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
                <p className="text-2xl font-black mt-0.5">{value}</p>
            </div>
        </div>
    );
}

/* ─── STATUS BADGE ──────────────────────────── */
function StatusBadge({ status }) {
    const cfg = getStatus(status);
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.card}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

/* ─── DETAIL ROW (modal) ─────────────────────── */
function DetailRow({ label, value, mono }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
        </div>
    );
}

/* ─── STATUS ACTION BUTTON ───────────────────── */
function ActionBtn({ status, current, onClick }) {
    const cfg = getStatus(status);
    const Icon = cfg.icon;
    const active = current === status;
    return (
        <button
            onClick={() => !active && onClick(status)}
            className={[
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition-all",
                active
                    ? cfg.card + " ring-2 ring-offset-1 ring-current opacity-100 cursor-default"
                    : cfg.card + " opacity-70 hover:opacity-100",
            ].join(" ")}
        >
            <Icon size={13} />
            {cfg.label}
        </button>
    );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function InventoryAssetsPage() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showAllocate,
        setShowAllocate] =
        useState(false);

    const [shoots,
        setShoots] =
        useState([]);

    const [selectedShoot,
        setSelectedShoot] =
        useState("");

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await api.get("/inventory/inventory-assets");
            setAssets(res.data.data || []);
        } catch {
            toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    const loadAssetDetails = async (id) => {
    try {
        const res = await api.get(
            `/inventory/inventory-assets/${id}`
        );

        setSelectedAsset(
            res.data.data
        );

    } catch {
        toast.error(
            "Failed to load asset details"
        );
    }
};

    useEffect(() => {

        fetchAssets();

        loadShoots();

    }, []);

    const updateStatus = async (assetId, status) => {
        try {
            await api.post(`/inventory/inventory-assets/${assetId}/status`, { status });
            toast.success("Status updated");
            fetchAssets();
            if (selectedAsset) setSelectedAsset(p => ({ ...p, status }));
        } catch {
            toast.error("Failed to update status");
        }
    };

    const loadShoots = async () => {

        const res =
            await api.get("/shoots");

        console.log(res.data);

        setShoots(res.data || []);
    };

    const allocateAsset = async () => {
        console.log(selectedAsset);
        try {

            await api.post(
                `/inventory-assets/${selectedAsset.id}/allocate`,
                {
                    shoot_id:
                        selectedShoot,
                }
            );

            toast.success(
                "Asset allocated"
            );

            setShowAllocate(false);

            await fetchAssets();

await loadAssetDetails(
    selectedAsset.id
);

        } catch (error) {

            console.log(error);

            console.log(
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Allocation failed"
            );
        }
    };

    const returnAsset = async (
        assetId
    ) => {

        try {

            await api.post(
                `/inventory-assets/${assetId}/return`
            );

            toast.success(
                "Asset returned"
            );

            await fetchAssets();

await loadAssetDetails(
    selectedAsset.id
);

        } catch {

            toast.error(
                "Return failed"
            );
        }
    };

    const filtered = useMemo(() => {
        let r = [...assets];
        if (statusFilter !== "all") r = r.filter(a => a.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(a =>
                `${a.asset_code} ${a.item?.name} ${a.status}`.toLowerCase().includes(q)
            );
        }
        return r;
    }, [assets, search, statusFilter]);

    console.log(shoots);
    /* ── RENDER ── */
    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/70">
                <div className="max-w-7xl mx-auto px-5 py-8 space-y-5">

                    {/* ── HEADER ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                Inventory Assets
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Individual asset tracking and QR management
                            </p>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <Link
                                href="/dashboard/inventory/assets/labels"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                            >
                                <Printer size={14} /> Print Labels
                            </Link>
                            <Link
                                href="/dashboard/inventory/scanner"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold transition-colors shadow-sm"
                            >
                                <ScanLine size={14} /> QR Scanner
                            </Link>
                            <button
                                onClick={fetchAssets}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-bold transition-colors shadow-sm"
                            >
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* ── STAT CARDS ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard label="Available" value={assets.filter(a => a.status === "available").length} status="available" />
                        <StatCard label="In Use" value={assets.filter(a => a.status === "in_use").length} status="in_use" />
                        <StatCard label="Under Repair" value={assets.filter(a => a.status === "under_repair").length} status="under_repair" />
                        <StatCard label="Damaged" value={assets.filter(a => a.status === "damaged").length} status="damaged" />
                    </div>

                    {/* ── FILTERS ── */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* search */}
                        <div className="flex-1 relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by code, name or status…"
                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                            />
                        </div>
                        {/* status filter */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="in_use">In Use</option>
                            <option value="returned">Returned</option>
                            <option value="damaged">Damaged</option>
                            <option value="under_repair">Under Repair</option>
                            <option value="written_off">Written Off</option>
                        </select>

                        {/* result count */}
                        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-500 font-medium shadow-sm shrink-0">
                            <Package size={13} className="text-slate-300" />
                            <span><strong className="text-slate-700">{filtered.length}</strong> asset{filtered.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* ── ASSET GRID ── */}
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white py-20 flex flex-col items-center gap-3">
                            <RefreshCw size={22} className="text-slate-300 animate-spin" />
                            <p className="text-sm text-slate-400 font-medium">Loading assets…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-white py-20 flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                                <Package size={24} />
                            </div>
                            <p className="text-sm text-slate-400 font-medium">No assets found</p>
                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map(asset => {
                                const cfg = getStatus(asset.status);
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() =>
    loadAssetDetails(asset.id)
}
                                        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all overflow-hidden"
                                    >
                                        {/* top accent */}
                                        <div className={`h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400`} />

                                        <div className="p-5">
                                            {/* header row */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                                                            {asset.item?.category || "Asset"}
                                                        </p>
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 tracking-tight font-mono">
                                                        {asset.asset_code}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-0.5 truncate">
                                                        {asset.item?.name}
                                                    </p>
                                                </div>

                                                {/* QR preview */}
                                                <div className="shrink-0 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                                                    <QRCodeSVG value={asset.qr_uuid} size={52} level="M" />
                                                </div>
                                            </div>

                                            {/* status + serial */}
                                            <div className="flex items-center justify-between">
                                                <StatusBadge status={asset.status} />
                                                {asset.serial_number && (
                                                    <span className="text-[10px] font-mono text-slate-400 truncate ml-2">
                                                        SN: {asset.serial_number}
                                                    </span>
                                                )}
                                            </div>

                                            {/* footer */}
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-slate-300 truncate max-w-[200px]">
                                                    {asset.qr_uuid?.slice(0, 24)}…
                                                </span>
                                                <span className="text-xs font-bold text-blue-500 group-hover:text-blue-700 flex items-center gap-1 transition-colors shrink-0">
                                                    Details <ChevronRight size={12} />
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

            {/* ════════════════════════════════════════
                ASSET DETAIL MODAL
            ════════════════════════════════════════ */}
            {selectedAsset && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>

                    {/* backdrop close */}
                    <div className="absolute inset-0" onClick={() => setSelectedAsset(null)} />

                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        style={{ boxShadow: "0 32px 64px -12px rgba(0,0,0,0.3)" }}>

                        {/* accent */}
                        <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400" />

                        {/* modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Package size={15} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Asset Details</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{selectedAsset.asset_code}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAsset(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* QR + code block */}
                            <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm shrink-0">
                                    <QRCodeSVG value={selectedAsset.qr_uuid} size={90} level="M" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Asset Code</p>
                                    <p className="text-xl font-black text-slate-900 font-mono">{selectedAsset.asset_code}</p>
                                    <p className="text-sm text-slate-500 mt-1">{selectedAsset.item?.name}</p>
                                    <div className="mt-2">
                                        <StatusBadge status={selectedAsset.status} />
                                    </div>
                                </div>
                            </div>

                            {/* detail grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <DetailRow label="Equipment" value={selectedAsset.item?.name} />
                                <DetailRow label="Category" value={selectedAsset.item?.category} />
                                <DetailRow label="Serial Number" value={selectedAsset.serial_number} mono />
                                {selectedAsset.item?.daily_rental_value && (
                                    <DetailRow label="Daily Rate" value={`Rs ${Number(selectedAsset.item.daily_rental_value).toLocaleString("en-PK")}`} />
                                )}
                            </div>
                            <div>
                                <DetailRow label="QR UUID" value={selectedAsset.qr_uuid} mono />
                            </div>
                            {selectedAsset.active_allocation && (

                                <div className="rounded-xl border p-4">

                                    <div className="font-semibold">
                                        Shoot:
                                        {" "}
                                        {selectedAsset.active_allocation.shoot?.title}
                                    </div>

                                    <div className="text-sm text-gray-500 mt-1">
                                        Allocated:
                                        {" "}
                                        {selectedAsset.active_allocation.allocated_at}
                                    </div>

                                </div>

                            )}
                            {/* ASSIGNMENT */}

                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                    Assignment
                                </p>

                                {selectedAsset.active_allocation ? (

                                    <div className="rounded-xl border border-slate-200 p-4">

                                        <div className="font-semibold">
                                            {selectedAsset.active_allocation.shoot?.title}
                                        </div>

                                        <div className="text-sm text-slate-500 mt-1">
                                            Allocated:
                                            {" "}
                                            {selectedAsset.active_allocation.allocated_at}
                                        </div>

                                        <button
                                            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                                            onClick={() =>
                                                returnAsset(
                                                    selectedAsset.id
                                                )
                                            }
                                        >
                                            Return Asset
                                        </button>

                                    </div>

                                ) : (

                                    <div className="rounded-xl border border-slate-200 p-4">

                                        <div className="text-gray-500">
                                            Not allocated to any shoot
                                        </div>

                                        <button
                                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
                                            onClick={() =>
                                                setShowAllocate(true)
                                            }
                                        >
                                            Allocate To Shoot
                                        </button>

                                    </div>

                                )}

                            </div>
                            {/* status actions */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Update Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {["available", "in_use", "returned", "damaged", "under_repair", "written_off"].map(s => (
                                        <ActionBtn
                                            key={s}
                                            status={s}
                                            current={selectedAsset.status}
                                            onClick={(st) => updateStatus(selectedAsset.id, st)}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* modal footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
                            <button
                                onClick={() => setSelectedAsset(null)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAllocate && (

                <div className="fixed inset-0 z-[10000]">

                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() =>
                            setShowAllocate(false)
                        }
                    />

                    <div className="absolute left-1/2 top-1/2 w-[500px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6">

                        <h2 className="font-bold text-lg mb-4">
                            Allocate Asset
                        </h2>

                        <select
                            value={selectedShoot}
                            onChange={(e) =>
                                setSelectedShoot(
                                    e.target.value
                                )
                            }
                            className="w-full border rounded-lg p-3"
                        >
                            <option value="">
                                Select Shoot
                            </option>

                            {shoots.map(
                                (shoot) => (
                                    <option
                                        key={shoot.id}
                                        value={shoot.id}
                                    >
                                        {shoot.title}
                                    </option>
                                )
                            )}
                        </select>

                        <div className="flex justify-end gap-2 mt-5">

                            <button
                                onClick={() =>
                                    setShowAllocate(false)
                                }
                                className="border px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    allocateAsset
                                }
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                Allocate
                            </button>

                        </div>

                    </div>

                </div>

            )}
        </Layout>

    );
}
