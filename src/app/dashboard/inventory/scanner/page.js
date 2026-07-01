"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import { lookupAsset, allocateAsset, returnAsset, getShoots } from "@/services/inventoryAssetService";
import Layout from "@/components/Layout";
import {
    Camera, FlipHorizontal, ScanLine, FolderOpen,
    ShieldCheck, CheckCircle2, AlertTriangle,
    Loader2, Info, RotateCcw, X, Package,
    User, Tag, Hash, DollarSign, Wifi,
    ArrowRight, RefreshCw, MapPin, Clock,
} from "lucide-react";

/* ─── STATUS CONFIG ──────────────────── */
const STATUS_CFG = {
    available: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Available" },
    in_use: { cls: "bg-blue-100    text-blue-700    border-blue-200", dot: "bg-blue-500", label: "In Use" },
    checked_out: { cls: "bg-blue-100   text-blue-700    border-blue-200", dot: "bg-blue-500", label: "Checked Out" },
    maintenance: { cls: "bg-amber-100  text-amber-700   border-amber-200", dot: "bg-amber-500", label: "Maintenance" },
    retired: { cls: "bg-rose-100    text-rose-700    border-rose-200", dot: "bg-rose-500", label: "Retired" },
};
const getStatus = (s) => STATUS_CFG[s?.toLowerCase()] ?? { cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", label: s || "Unknown" };

/* ─── SMALL COMPONENTS ───────────────── */
function ModeTab({ active, onClick, icon, label }) {
    return (
        <button type="button" onClick={onClick}
            className={["flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all",
                active ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"].join(" ")}>
            {icon}{label}
        </button>
    );
}

function DetailTile({ icon, label, value, mono, span }) {
    return (
        <div className={`flex flex-col gap-1.5 rounded-xl bg-white border border-slate-100 px-4 py-3.5 ${span ? "col-span-2" : ""}`}>
            <div className="flex items-center gap-1.5">
                <span className="text-slate-300">{icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
            <p className={`text-sm font-semibold text-slate-800 break-all leading-snug ${mono ? "font-mono" : ""}`}>
                {value || "—"}
            </p>
        </div>
    );
}

function FieldLabel({ children }) {
    return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{children}</p>;
}

const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all";

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function ScannerPage() {
    const [mode, setMode] = useState("camera");
    const html5QrRef = useRef(null);
    const scannerActive = useRef(false);
    const fileInputRef = useRef(null);

    const [cameras, setCameras] = useState([]);
    const [activeCam, setActiveCam] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [asset, setAsset] = useState(null);
    const [shoots, setShoots] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedShoot, setSelectedShoot] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [showAllocate, setShowAllocate] = useState(false);
    const [error, setError] = useState("");
    const [scanCount, setScanCount] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        Html5Qrcode.getCameras()
            .then(devs => { setCameras(devs); if (devs.length) setActiveCam(devs[devs.length - 1].id); })
            .catch(() => setError("Camera access denied. Please allow permissions."));
    }, []);

    const startScanner = async (camId) => {
        if (!camId || scannerActive.current || !document.getElementById("qr-reader")) return;
        if (!html5QrRef.current) html5QrRef.current = new Html5Qrcode("qr-reader");
        try {
            await html5QrRef.current.start(
                { deviceId: { exact: camId } },
                { fps: 12, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
                async (decoded) => { setScanCount(c => c + 1); await stopScanner(); await lookupCode(decoded); },
                () => { }
            );
            scannerActive.current = true; setScanning(true); setError("");
        } catch { setError("Could not start camera. Check permissions."); }
    };

    const stopScanner = async () => {
        try { if (html5QrRef.current && scannerActive.current) { await html5QrRef.current.stop(); scannerActive.current = false; setScanning(false); } } catch { }
    };

    useEffect(() => {
        let mounted = true;
        if (mounted && mode === "camera" && activeCam && !asset) startScanner(activeCam);
        return () => { mounted = false; stopScanner(); };
    }, [mode, activeCam, asset]);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true); setError(""); setAsset(null);
        try {
            await stopScanner();
            const fs = new Html5Qrcode("qr-reader-file");
            const decoded = await fs.scanFile(file, true);
            setScanCount(c => c + 1);
            await lookupCode(decoded);
        } catch { setAsset(null); setError("No QR code found in image."); }
        finally { setLoading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    const lookupCode = async (code) => {
        try {
            setLoading(true); setError("");
            const res = await lookupAsset(code);
            setAsset(res.data || res);
            const [shootsRes, usersRes] = await Promise.all([getShoots(), api.get("/users")]);
            setShoots(shootsRes || []);
            setUsers(usersRes?.data?.users?.data ?? []);
        } catch { setAsset(null); setError("No asset found for this QR code."); }
        finally { setLoading(false); }
    };

    const switchCamera = async () => {
        if (cameras.length < 2) return;
        await stopScanner();
        const idx = cameras.findIndex(c => c.id === activeCam);
        setActiveCam(cameras[(idx + 1) % cameras.length].id);
    };

    const reset = async () => { await stopScanner(); setAsset(null); setError(""); };

    const handleAllocate = async () => {
        const pToastId = progressToast.loading({ title: "Allocating...", message: "Allocating asset..." });
        try {
            setActionLoading(true);
            await api.post(`/inventory-assets/${asset.id}/allocate`, { shoot_id: selectedShoot, assigned_to: assignedTo });
            progressToast.success(pToastId, { title: "Allocated", message: "Asset allocated to shoot" });
            setShowAllocate(false);
            const refreshed = await lookupAsset(asset.qr_uuid);
            setAsset(refreshed.data || refreshed);
        } catch (e) {
            progressToast.error(pToastId, { title: "Error", message: e.response?.data?.message || "Allocation failed" });
        }
        finally { setActionLoading(false); }
    };

    const handleReturn = async () => {
        const pToastId = progressToast.loading({ title: "Returning...", message: "Processing return..." });
        try {
            setActionLoading(true);
            await returnAsset(asset.id);
            progressToast.success(pToastId, { title: "Returned", message: "Asset returned" });
            const refreshed = await lookupAsset(asset.qr_uuid);
            setAsset(refreshed.data || refreshed);
        } catch (e) { progressToast.error(pToastId, { title: "Error", message: e.response?.data?.message || "Return failed" }); }
        finally { setActionLoading(false); }
    };

    const statusCfg = asset ? getStatus(asset.status) : null;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/70">
                <div className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-8 space-y-4">

                    {/* ── HEADER ── */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Asset Scanner</h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Scan a QR label to identify any asset</p>
                        </div>
                        {scanCount > 0 && (
                            <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 shrink-0">
                                <ScanLine size={12} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-600">{scanCount} scanned</span>
                            </div>
                        )}
                    </div>

                    {/* ── MODE TABS ── */}
                    {!asset && (
                        <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl">
                            <ModeTab active={mode === "camera"} onClick={() => setMode("camera")} icon={<Camera size={14} />} label="Camera" />
                            <ModeTab active={mode === "file"} onClick={() => setMode("file")} icon={<FolderOpen size={14} />} label="Upload Image" />
                        </div>
                    )}

                    {/* ── CAMERA ── */}
                    {mode === "camera" && !asset && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400" />
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Camera size={13} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Live Camera</p>
                                        <p className="text-[10px] text-slate-400">{scanning ? "Align QR in frame" : "Initialising…"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {cameras.length > 1 && (
                                        <button onClick={switchCamera}
                                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                                            <FlipHorizontal size={12} /> Flip
                                        </button>
                                    )}
                                    {cameras.length > 1 && (
                                        <select value={activeCam || ""} onChange={async e => { await stopScanner(); setActiveCam(e.target.value); }}
                                            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none cursor-pointer max-w-[120px] truncate">
                                            {cameras.map(c => <option key={c.id} value={c.id}>{c.label.length > 20 ? c.label.slice(0, 20) + "…" : c.label}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="relative bg-slate-900 overflow-hidden" style={{ minHeight: 300 }}>
                                <div id="qr-reader" className="w-full" />
                                {scanning && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                                            <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
                                            <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
                                            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
                                            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
                                            <span className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                                                style={{ animation: "scanline 2s ease-in-out infinite", top: "50%" }} />
                                        </div>
                                    </div>
                                )}
                                {!scanning && !error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-2">
                                        <Camera size={32} /><p className="text-sm">Starting camera…</p>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${scanning ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                <span className="text-xs font-semibold text-slate-500">{scanning ? "Scanning — hold steady" : "Scanner paused"}</span>
                            </div>
                        </div>
                    )}

                    {/* ── FILE MODE ── */}
                    {mode === "file" && !asset && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="h-[3px] bg-gradient-to-r from-violet-500 to-indigo-400" />
                            <div className="p-5">
                                <label htmlFor="qr-file-input"
                                    className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/30 transition-all cursor-pointer py-10 px-4 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                                        <FolderOpen size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Click to select image</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP with a visible QR code</p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white text-xs font-bold px-5 py-2.5">
                                        <FolderOpen size={13} /> Browse Files
                                    </span>
                                </label>
                                <input id="qr-file-input" ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                                <div id="qr-reader-file" style={{ width: "1px", height: "1px", position: "absolute", left: "-9999px", overflow: "hidden" }} />
                            </div>
                        </div>
                    )}

                    {/* ── LOADING ── */}
                    {loading && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex items-center gap-3">
                            <Loader2 size={17} className="text-blue-500 animate-spin shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-blue-700">Looking up asset…</p>
                                <p className="text-xs text-blue-400 mt-0.5">Fetching details from inventory</p>
                            </div>
                        </div>
                    )}

                    {/* ── ERROR ── */}
                    {error && !loading && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-start gap-3">
                            <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-rose-700">{error}</p>
                                <p className="text-xs text-rose-400 mt-0.5">Check the QR label and try again</p>
                            </div>
                            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition-colors shrink-0">
                                <RotateCcw size={11} /> Retry
                            </button>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════
                        ASSET RESULT CARD — high-polish design
                    ══════════════════════════════════════════════ */}
                    {asset && !loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                            {/* gradient top bar */}
                            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500" />

                            {/* ── HERO SECTION ── */}
                            <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border-b border-slate-100">

                                {/* found badge */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1">
                                        <CheckCircle2 size={11} className="text-emerald-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Asset Found</span>
                                    </div>
                                    {/* status pill */}
                                    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${statusCfg.cls}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{statusCfg.label}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    {/* shield icon */}
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-emerald-100 shadow-sm text-emerald-600">
                                        <ShieldCheck size={26} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Asset Code</p>
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
                                            {asset.asset_code}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1 truncate">{asset.item?.name}</p>
                                        {asset.item?.category && (
                                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                                                <Tag size={8} />{asset.item?.category?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* allocation banner */}
                                {asset.active_allocation && (
                                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                                        <MapPin size={14} className="text-blue-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-blue-700 truncate">
                                                {asset.active_allocation.shoot?.title || "Allocated Shoot"}
                                            </p>
                                            {asset.active_allocation.allocated_at && (
                                                <p className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
                                                    <Clock size={9} />
                                                    {new Date(asset.active_allocation.allocated_at).toLocaleString(
                                                        "en-PK",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        }
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        {asset.active_allocation.assigned_user?.name && (
                                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                                <User size={9} />{asset.active_allocation.assigned_user.name}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {asset.active_allocation && (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle
                                                size={14}
                                                className="text-amber-600 mt-0.5 shrink-0"
                                            />

                                            <div>
                                                <p className="text-xs font-bold text-amber-800">
                                                    Asset Currently In Use
                                                </p>

                                                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                                                    This asset is already allocated to
                                                    <strong>
                                                        {" "}
                                                        {asset.active_allocation.shoot?.title}
                                                    </strong>

                                                    {asset.active_allocation.assigned_user?.name &&
                                                        ` and assigned to ${asset.active_allocation.assigned_user.name}`}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── DETAIL GRID ── */}
                            <div className="px-5 py-4 bg-slate-50/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Details</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <DetailTile icon={<Package size={12} />} label="Item Name" value={asset.item?.name} />
                                    <DetailTile icon={<Hash size={12} />} label="Serial No." value={asset.item?.serial_number} mono />
                                    <DetailTile
                                        icon={<Hash size={12} />}
                                        label="Category"
                                        value={asset.item?.category?.name}
                                        mono
                                    />
                                    <DetailTile icon={<User size={12} />} label="Assigned To" value={asset.active_allocation?.assigned_user?.name || "Unassigned"} />
                                    <DetailTile icon={<MapPin size={12} />} label="Shoot" value={asset.active_allocation?.shoot?.title || "Not Allocated"} />
                                    {asset.item?.sku && (
                                        <DetailTile icon={<Tag size={12} />} label="SKU" value={asset.item.sku} mono />
                                    )}
                                    {asset.item?.daily_rental_value && (
                                        <DetailTile icon={<DollarSign size={12} />} label="Daily Rate" value={`Rs ${Number(asset.item.daily_rental_value).toLocaleString("en-PK")}`} />
                                    )}
                                    <DetailTile icon={<Wifi size={12} />} label="QR UUID" value={asset.qr_uuid} mono span />
                                </div>
                            </div>

                            <div className="px-5 pb-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                        Asset Health
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">
                                            Current Status
                                        </span>

                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                                            {statusCfg.label}
                                        </span>
                                    </div>

                                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {asset.logs?.length > 0 && (
                                <div className="px-5 pb-4">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">

                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                            Recent Activity
                                        </p>

                                        {asset.logs.slice(0, 5).map(log => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between py-2 border-b last:border-b-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {log.action}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {log.user}
                                                    </p>
                                                </div>

                                                <span className="text-xs text-slate-400">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── ACTION BUTTONS ── */}
                            <div className="px-5 py-4 border-t border-slate-100 space-y-2">
                                <div className="flex gap-2">
                                    {asset.status === "available" && (
                                        <button onClick={() => setShowAllocate(true)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 transition-colors shadow-sm">
                                            <ArrowRight size={15} /> Allocate to Shoot
                                        </button>
                                    )}
                                    {(asset.status === "in_use" || asset.status === "checked_out") && (
                                        <button onClick={handleReturn} disabled={actionLoading}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 transition-colors shadow-sm disabled:opacity-60">
                                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                            Return Asset
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={reset}
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold py-2.5 transition-colors">
                                        <ScanLine size={14} />
                                        {mode === "camera" ? "Scan Another" : "Scan Another Image"}
                                    </button>
                                    <button onClick={() => { setAsset(null); setError(""); }}
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 px-4 py-2.5 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── HINT ── */}
                    {!asset && !loading && !error && (
                        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 flex items-start gap-3">
                            <Info size={13} className="text-slate-300 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {mode === "camera"
                                    ? "Hold the QR label steady inside the frame. Use Flip to switch between front and rear cameras."
                                    : "Upload any photo that contains a QR code — a screenshot, gallery photo, or downloaded image."}
                            </p>
                        </div>
                    )}

                </div>
            </div>

            {/* ── ALLOCATE MODAL ── */}
            {showAllocate && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                    onClick={e => e.target === e.currentTarget && setShowAllocate(false)}>
                    <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl"
                        style={{ boxShadow: "0 32px 64px -12px rgba(0,0,0,0.3)" }}>
                        <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400" />

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Package size={15} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Allocate Asset</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{asset?.asset_code}</p>
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
                                <FieldLabel>Assign To Crew Member</FieldLabel>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inp + " cursor-pointer"}>
                                    <option value="">Choose crew member…</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {selectedShoot && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                                <p className="text-xs font-bold text-blue-700">
                                    Allocation Summary
                                </p>

                                <div className="mt-2 text-sm text-blue-900 space-y-1">
                                    <p>
                                        Asset:
                                        <strong> {asset.asset_code}</strong>
                                    </p>

                                    <p>
                                        Shoot:
                                        <strong>
                                            {" "}
                                            {shoots.find(
                                                s => String(s.id) === String(selectedShoot)
                                            )?.title}
                                        </strong>
                                    </p>

                                    <p>
                                        Assigned To:
                                        <strong>
                                            {" "}
                                            {users.find(
                                                u => String(u.id) === String(assignedTo)
                                            )?.name || "Unassigned"}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-3">
                            <button onClick={() => setShowAllocate(false)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAllocate} disabled={actionLoading}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-colors inline-flex items-center gap-2">
                                {actionLoading && <Loader2 size={13} className="animate-spin" />}
                                Allocate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes scanline {
                    0%   { transform: translateY(-90px); opacity: 0.6; }
                    50%  { opacity: 1; }
                    100% { transform: translateY(90px);  opacity: 0.6; }
                }
                #qr-reader__dashboard_section_csr button,
                #qr-reader__dashboard_section_swaplink,
                #qr-reader__status_span,
                #qr-reader__header_message,
                #qr-reader__filescan_input,
                #qr-reader__camera_selection { display: none !important; }
                #qr-reader { border: none !important; }
                #qr-reader video {
                    width: 100% !important;
                    height: 300px !important;
                    object-fit: cover;
                }
                @media (min-width: 640px) {
                    #qr-reader video { height: 340px !important; }
                }
            `}</style>
        </Layout>
    );
}