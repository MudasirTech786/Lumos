"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { lookupAsset } from "@/services/inventoryAssetService";
import Layout from "@/components/Layout";
import {
    Camera, FlipHorizontal, ScanLine, FolderOpen,
    RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle,
    Loader2, Info, RotateCcw, X,
} from "lucide-react";

/* ── status colours ── */
const STATUS_STYLES = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    checked_out: "bg-blue-50    text-blue-700    border-blue-200",
    maintenance: "bg-amber-50   text-amber-700   border-amber-200",
    retired: "bg-rose-50    text-rose-700    border-rose-200",
};
const getStatusStyle = (s) =>
    STATUS_STYLES[s?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";

/* ── shared small components ── */
function InfoCard({ label, value, mono }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? "font-mono" : ""}`}>
                {value || "—"}
            </p>
        </div>
    );
}

/* ── mode tab button ── */
function ModeTab({ active, onClick, icon, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all",
                active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200",
            ].join(" ")}
        >
            {icon}
            {label}
        </button>
    );
}

/* ════════════════════════════════════════════ */

export default function ScannerPage() {
    /* mode: "camera" | "file" */
    const [mode, setMode] = useState("camera");

    const html5QrRef = useRef(null);
    const scannerActive = useRef(false);
    const fileInputRef = useRef(null);

    const [cameras, setCameras] = useState([]);
    const [activeCam, setActiveCam] = useState(null);
    const [scanning, setScanning] = useState(false);

    const [loading, setLoading] = useState(false);
    const [asset, setAsset] = useState(null);
    const [error, setError] = useState("");
    const [scanCount, setScanCount] = useState(0);

    /* ── enumerate cameras once ── */
    useEffect(() => {
        Html5Qrcode.getCameras()
            .then((devs) => {
                setCameras(devs);
                if (devs.length) setActiveCam(devs[devs.length - 1].id);
            })
            .catch(() => setError("Camera access denied. Please allow permissions."));
    }, []);

    /* ── start camera scanner ── */
    const startScanner = async (camId) => {
        if (scannerActive.current) {
            return;
        }
        if (!document.getElementById("qr-reader")) {
            return;
        }
        if (!camId || scannerActive.current) return;
        if (!html5QrRef.current) {
            html5QrRef.current = new Html5Qrcode("qr-reader");
        }
        try {
            await html5QrRef.current.start(
                { deviceId: { exact: camId } },
                { fps: 12, qrbox: { width: 230, height: 230 }, aspectRatio: 1 },
                async (decoded) => {
                    setScanCount(c => c + 1);
                    await stopScanner();
                    await lookupCode(decoded);
                },
                () => { }
            );
            scannerActive.current = true;
            setScanning(true);
            setError("");
        } catch {
            setError("Could not start camera. Check permissions.");
        }
    };

    const stopScanner = async () => {

        try {

            if (
                html5QrRef.current &&
                scannerActive.current
            ) {

                await html5QrRef.current.stop();

                scannerActive.current = false;

                setScanning(false);

            }

        } catch (err) {

            console.log(err);

        }

    };

    /* start/stop when mode or activeCam changes */
    useEffect(() => {

        let mounted = true;

        const init = async () => {

            if (
                mounted &&
                mode === "camera" &&
                activeCam &&
                !asset
            ) {
                await startScanner(activeCam);
            }

        };

        init();

        return () => {
            mounted = false;
            stopScanner();
        };

    }, [mode, activeCam, asset]);

    /* ── file scan ── */
   const handleFile = async (e) => {

    const file =
        e.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setError("");
    setAsset(null);

    try {

        await stopScanner();

        const fileScanner =
            new Html5Qrcode(
                "qr-reader-file"
            );

        const decoded =
            await fileScanner.scanFile(
                file,
                true
            );

        if (!decoded) {
            throw new Error(
                "No QR code found"
            );
        }

        setScanCount(
            c => c + 1
        );

        await lookupCode(
            decoded
        );

    } catch (err) {

        console.error(err);

        setAsset(null);

        setError(
            "No QR code found in image."
        );

    } finally {

        setLoading(false);

        if (
            fileInputRef.current
        ) {
            fileInputRef.current.value =
                "";
        }

    }

};

    /* ── lookup ── */
    const lookupCode = async (code) => {

        try {

            setError("");

            const res =
                await lookupAsset(code);

            setAsset(
                res.data || res
            );

        } catch (err) {

            console.error(err);

            setAsset(null);

            setError(
                "No asset found for this QR code."
            );

        }

    };

    /* ── switch camera ── */
    const switchCamera = async () => {
        if (cameras.length < 2) return;
        await stopScanner();
        const idx = cameras.findIndex(c => c.id === activeCam);
        const next = cameras[(idx + 1) % cameras.length];
        setActiveCam(next.id);
    };

    /* ── reset ── */
    const reset = async () => {

        await stopScanner();

        setAsset(null);
        setError("");

    };

    /* ─────────────── RENDER ─────────────── */
    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/70">
                <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">

                    {/* ── HEADER ── */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                Asset Scanner
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Scan a QR label to identify any asset
                            </p>
                        </div>
                        {scanCount > 0 && (
                            <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
                                <ScanLine size={13} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-600">{scanCount} scanned</span>
                            </div>
                        )}
                    </div>

                    {/* ── MODE TABS ── */}
                    {!asset && (
                        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                            <ModeTab
                                active={mode === "camera"}
                                onClick={() => setMode("camera")}
                                icon={<Camera size={15} />}
                                label="Camera"
                            />
                            <ModeTab
                                active={mode === "file"}
                                onClick={() => setMode("file")}
                                icon={<FolderOpen size={15} />}
                                label="Upload Image"
                            />
                        </div>
                    )}

                    {/* ══════════════════════════════════════
                        CAMERA MODE
                    ══════════════════════════════════════ */}
                    {mode === "camera" && !asset && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400" />

                            {/* toolbar */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Camera size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Live Camera</p>
                                        <p className="text-[10px] text-slate-400">
                                            {scanning ? "Align QR code in frame" : "Initialising…"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {cameras.length > 1 && (
                                        <button
                                            onClick={switchCamera}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                                        >
                                            <FlipHorizontal size={13} /> Flip
                                        </button>
                                    )}
                                    {cameras.length > 1 && (
                                        <select
                                            value={activeCam || ""}
                                            onChange={async (e) => { await stopScanner(); setActiveCam(e.target.value); }}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-blue-400 outline-none transition-all cursor-pointer max-w-[140px] truncate"
                                        >
                                            {cameras.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.label.length > 24 ? c.label.slice(0, 24) + "…" : c.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* viewfinder */}
                            <div className="relative bg-slate-900 overflow-hidden" style={{ minHeight: 320 }}>
                                <div id="qr-reader" className="w-full" />

                                {/* corner-bracket overlay */}
                                {scanning && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="relative w-52 h-52">
                                            <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                                            <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                                            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                                            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                                            <span className="absolute left-0 right-0 h-0.5 bg-cyan-400/70"
                                                style={{ animation: "scanline 2s ease-in-out infinite", top: "50%" }} />
                                        </div>
                                    </div>
                                )}

                                {!scanning && !error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-3">
                                        <Camera size={36} />
                                        <p className="text-sm">Starting camera…</p>
                                    </div>
                                )}
                            </div>

                            {/* status bar */}
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${scanning ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                <span className="text-xs font-semibold text-slate-500">
                                    {scanning ? "Scanning — hold the QR code steady" : "Scanner paused"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════
                        FILE MODE
                    ══════════════════════════════════════ */}
                    {mode === "file" && !asset && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="h-[3px] bg-gradient-to-r from-violet-500 to-indigo-400" />

                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                    <FolderOpen size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Upload QR Image</p>
                                    <p className="text-[10px] text-slate-400">Select a photo of the QR code from your device</p>
                                </div>
                            </div>

                            {/* drop / pick area */}
                            <div className="p-6">
                                <label
                                    htmlFor="qr-file-input"
                                    className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/30 transition-all cursor-pointer py-12 px-6 text-center"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                                        <FolderOpen size={26} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            Click to select image
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            PNG, JPG, WebP — any photo with a visible QR code
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-2.5 transition-colors">
                                        <FolderOpen size={13} /> Browse Files
                                    </span>
                                </label>

                                <input
                                    id="qr-file-input"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    className="sr-only"
                                />

                                {/* hidden scanner div required by html5-qrcode for file scanning */}
                                <div
                                    id="qr-reader-file"
                                    style={{
                                        width: "300px",
                                        height: "300px",
                                        position: "absolute",
                                        left: "-9999px",
                                        top: "-9999px",
                                        opacity: 0,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── LOADING ── */}
                    {loading && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex items-center gap-3">
                            <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-blue-700">Looking up asset…</p>
                                <p className="text-xs text-blue-400 mt-0.5">Fetching details from inventory</p>
                            </div>
                        </div>
                    )}

                    {/* ── ERROR ── */}
                    {error && !loading && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-start gap-3">
                            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-rose-700">{error}</p>
                                <p className="text-xs text-rose-400 mt-0.5">Check the QR label and try again</p>
                            </div>
                            <button
                                onClick={reset}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition-colors"
                            >
                                <RotateCcw size={12} /> Retry
                            </button>
                        </div>
                    )}

                    {/* ── ASSET RESULT ── */}
                    {asset && !loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400" />

                            {/* result header */}
                            <div className="px-6 py-5 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <ShieldCheck size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 size={13} className="text-emerald-500" />
                                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Asset Found</span>
                                            </div>
                                            <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                                                {asset.asset_code}
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-0.5">{asset.item?.name}</p>
                                        </div>
                                    </div>

                                    <span className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(asset.status)}`}>
                                        {asset.status?.replace("_", " ") || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* details grid */}
                            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoCard label="Item Name" value={asset.item?.name} />
                                <InfoCard label="Serial Number" value={asset.serial_number} mono />
                                <InfoCard label="Status" value={asset.status?.replace("_", " ")} />
                                <InfoCard label="Category" value={asset.item?.category} />
                                {asset.item?.sku && (
                                    <InfoCard label="SKU" value={asset.item.sku} mono />
                                )}
                                {asset.item?.daily_rental_value && (
                                    <InfoCard label="Daily Rental" value={`Rs ${Number(asset.item.daily_rental_value).toLocaleString("en-PK")}`} />
                                )}
                                <div className="sm:col-span-2">
                                    <InfoCard label="QR UUID" value={asset.qr_uuid} mono />
                                </div>
                            </div>

                            {/* footer actions */}
                            <div className="px-6 pb-5 flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 transition-colors"
                                >
                                    <ScanLine size={15} />
                                    {mode === "camera" ? "Scan Another" : "Scan Another Image"}
                                </button>
                                <button
                                    onClick={() => { setAsset(null); setError(""); }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold px-4 py-3 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── HINT ── */}
                    {!asset && !loading && !error && (
                        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 flex items-start gap-3">
                            <Info size={14} className="text-slate-300 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {mode === "camera"
                                    ? "Hold the QR label steady inside the frame. Use Flip to switch between front and rear cameras."
                                    : "Upload any photo that contains a QR code — a screenshot, gallery photo, or downloaded image all work."}
                            </p>
                        </div>
                    )}

                </div>
            </div>

            <style jsx global>{`
                @keyframes scanline {
                    0%   { transform: translateY(-100px); opacity: 0.7; }
                    50%  { opacity: 1; }
                    100% { transform: translateY(100px);  opacity: 0.7; }
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
                    height: 320px !important;
                    object-fit: cover;
                }
            `}</style>
        </Layout>
    );
}