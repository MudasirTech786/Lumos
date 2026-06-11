"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { getAssets } from "@/services/inventoryAssetService";
import Layout from "@/components/Layout";
import {
    ArrowLeft, Printer, Package, Hash,
    Tag, Search, ScanLine, Download,
} from "lucide-react";

export default function LabelsPage() {
    const router = useRouter();

    const [assets,  setAssets]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");

    useEffect(() => { loadAssets(); }, []);

    const loadAssets = async () => {
        try {
            const res = await getAssets();
            setAssets(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    const filtered = assets.filter(a =>
        !search ||
        a.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
        a.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.serial_number?.toLowerCase().includes(search.toLowerCase())
    );

    /* ── loading ── */
    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center animate-pulse">
                            <ScanLine size={18} className="text-blue-400" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">Loading assets…</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* ── print styles ── */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .label-grid {
                        display: grid !important;
                        grid-template-columns: repeat(4, 1fr) !important;
                        gap: 8mm !important;
                        padding: 8mm !important;
                    }
                    .label-card {
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px !important;
                        padding: 10px !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        background: white !important;
                    }
                    @page { size: A4; margin: 8mm; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-50/70">
                <div className="max-w-6xl mx-auto px-5 py-8 space-y-5">

                    {/* ── PAGE HEADER ── */}
                    <div className="flex items-start justify-between gap-4 no-print">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors mb-3"
                            >
                                <ArrowLeft size={13} /> Back
                            </button>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                Asset Labels
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Print QR labels for all tracked assets
                            </p>
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 shadow-sm transition-colors shrink-0"
                        >
                            <Printer size={15} /> Print Labels
                        </button>
                    </div>

                    {/* ── STATS + SEARCH ROW ── */}
                    <div className="flex flex-col sm:flex-row gap-4 no-print">
                        {/* total card */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center gap-4 shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Package size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Assets</p>
                                <p className="text-2xl font-black text-slate-900">{assets.length}</p>
                            </div>
                        </div>

                        {/* filtered count */}
                        {search && (
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 shadow-sm px-5 py-4 flex items-center gap-4 shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                    <ScanLine size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Filtered</p>
                                    <p className="text-2xl font-black text-blue-700">{filtered.length}</p>
                                </div>
                            </div>
                        )}

                        {/* search */}
                        <div className="flex-1 relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by code, name or serial…"
                                className="w-full h-full min-h-[56px] rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* ── EMPTY STATE ── */}
                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-slate-100 bg-white py-16 flex flex-col items-center text-center no-print">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mb-4">
                                <Package size={26} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No assets found</p>
                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="mt-3 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── LABELS GRID ── */}
                    {filtered.length > 0 && (
                        <div className="label-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filtered.map(asset => (
                                <div
                                    key={asset.id}
                                    className="label-card group rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all overflow-hidden flex flex-col items-center text-center p-4"
                                >
                                    {/* top accent */}
                                    <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full mb-3" />

                                    {/* asset code */}
                                    <p className="text-xs font-black text-blue-700 tracking-wider uppercase mb-0.5">
                                        {asset.asset_code}
                                    </p>

                                    {/* item name */}
                                    <p className="text-[11px] text-slate-500 font-medium leading-tight mb-3 line-clamp-2">
                                        {asset.item?.name || "—"}
                                    </p>

                                    {/* QR code */}
                                    <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm">
                                        <QRCodeSVG
                                            value={asset.qr_uuid}
                                            size={110}
                                            level="M"
                                            includeMargin={false}
                                        />
                                    </div>

                                    {/* serial */}
                                    {asset.serial_number && (
                                        <p className="mt-3 text-[10px] font-mono text-slate-400 truncate w-full">
                                            SN: {asset.serial_number}
                                        </p>
                                    )}

                                    {/* category pill */}
                                    {asset.item?.category && (
                                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                                            <Tag size={7} />
                                            {asset.item.category}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── PRINT FOOTER HINT ── */}
                    {filtered.length > 0 && (
                        <div className="no-print rounded-2xl border border-slate-100 bg-white px-5 py-4 flex items-center justify-between gap-4">
                            <p className="text-xs text-slate-400">
                                Showing <strong className="text-slate-600">{filtered.length}</strong> label{filtered.length !== 1 ? "s" : ""}
                                {search ? ` matching "${search}"` : ""}. Labels print 4-per-row on A4.
                            </p>
                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 transition-colors shrink-0"
                            >
                                <Printer size={13} /> Print
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
}