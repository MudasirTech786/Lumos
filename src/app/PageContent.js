"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useDashboard } from "@/hooks/useDashboard";
import usePageLoadingOverlay from "@/hooks/usePageLoadingOverlay";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Clapperboard, Users, Package, Wallet, Truck,
  AlertTriangle, CheckCircle2, Clock, TrendingUp,
  TrendingDown, ScanLine, Receipt, ArrowUpRight,
  Wrench, RefreshCw, MapPin, ChevronRight, Activity,
  MoreHorizontal, Circle, Bell, Search, Settings,
  Sun, Cloud, Moon, Calendar, ShieldCheck, ArrowDownRight,
} from "lucide-react";

// ==================== UTILITY FUNCTIONS ====================
const fmtPKR = (n) =>
  n >= 1000000 ? `₨${(n / 1000000).toFixed(1)}M`
    : n >= 1000 ? `₨${(n / 1000).toFixed(0)}K`
      : `₨${n}`;

const pct = (spent, budget) => {
  if (!budget || budget <= 0) return 0;
  return Math.min(Math.round((spent / budget) * 100), 100);
};

// ==================== STATUS MAPPINGS ====================
const STATUS_PROD = {
  planned: { label: "Planned", cls: "bg-slate-50 text-slate-700 ring-slate-200" },
  scheduled: { label: "Scheduled", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 ring-red-200" },
};

const STATUS_CREW = {
  assigned: { label: "Assigned", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  active: { label: "On Set", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  completed: { label: "Completed", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  inactive: { label: "Inactive", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

const INV_STATUS = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  sent: "bg-blue-50 text-blue-700 ring-blue-200",
  partially_paid: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  overdue: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
};

const SEV_DOT = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-blue-500" };
const SEV_RING = { high: "ring-red-200", medium: "ring-amber-200", low: "ring-blue-200" };

// ==================== GREETING HELPER FUNCTIONS ====================
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { text: "Good Morning", icon: Sun, color: "text-amber-300" };
  } else if (hour < 17) {
    return { text: "Good Afternoon", icon: Cloud, color: "text-cyan-300" };
  } else {
    return { text: "Good Evening", icon: Moon, color: "text-indigo-300" };
  }
}

function getGreetingMessage() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Ready to capture great content today?";
  } else if (hour < 17) {
    return "Keep up the momentum with your productions!";
  } else {
    return "Wrap up your day and review the progress.";
  }
}

// ==================== CARD COMPONENTS ====================
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/[0.08] hover:shadow-md hover:shadow-slate-900/[0.12] hover:border-slate-200/80 transition-all duration-300 overflow-hidden ${className}`}>
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
      {children}
    </div>
  );
}

function CardHeader({ title, sub, action, href, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100/60">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 items-center justify-center shrink-0">
            <Icon size={18} strokeWidth={1.8} className="text-blue-600" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900 tracking-tight truncate">{title}</p>
          {sub && <p className="text-sm text-slate-500 mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
      {action && (
        <Link
          href={href || "#"}
          className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors whitespace-nowrap hover:bg-blue-50 px-3 py-2 rounded-lg"
        >
          {action}
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, delta, deltaDir = "up", accentColor = "from-blue-50 to-blue-100", iconColor = "text-blue-600" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm shadow-slate-900/[0.08] hover:shadow-md hover:shadow-slate-900/[0.12] hover:border-slate-300/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${accentColor} border border-blue-200/60 shadow-sm shadow-blue-500/10`}>
          <Icon size={20} strokeWidth={1.8} className={iconColor} />
        </div>
        {delta && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 border border-blue-200/60">
            {deltaDir === "up" ? <TrendingUp size={12} strokeWidth={2} /> : <TrendingDown size={12} strokeWidth={2} />}
            {delta}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2 tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-lg shadow-slate-900/[0.15] px-4 py-3 text-sm">
      <p className="font-semibold text-slate-900 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value} Lakh
        </p>
      ))}
    </div>
  );
};

function Avatar({ name, size = "sm" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-10 h-10 text-xs" : "w-12 h-12 text-sm";
  return (
    <div className={`${sz} rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold flex items-center justify-center shrink-0 select-none ring-1 ring-blue-200/60`}>
      {initials}
    </div>
  );
}

// ==================== ENHANCED HEADER COMPONENT ====================
// Dark gradient hero: greeting + inline live KPI row (left) and a
// System Status panel (right) — mirrors the reference layout the
// person shared, wired to real useDashboard() data instead of static values.
function EnhancedHeader({
  refreshState,
  handleRefresh,
  refetchCount,
  isLoading,
  isRefetching,
  kpis,
  alertSummary,
  formatCurrency,
}) {
  const greeting = getGreeting();
  const message = getGreetingMessage();
  const GreetingIcon = greeting.icon;
  const now = new Date();

  // ── Inline quick-stats row, driven by real KPI data ──
  const quickStats = [
    {
      label: "Active Productions",
      value: isLoading ? "…" : kpis?.active_productions ?? 0,
      icon: Clapperboard,
    },
    {
      label: "Crew on Set",
      value: isLoading ? "…" : kpis?.crew_on_set ?? 0,
      icon: Users,
    },
    {
      label: "Assets Deployed",
      value: isLoading ? "…" : kpis?.assets_deployed ?? 0,
      icon: Package,
    },
    {
      label: "Revenue MTD",
      value: isLoading ? "…" : formatCurrency(kpis?.revenue_mtd ?? 0),
      icon: Wallet,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/20 bg-gradient-to-br from-[#07111f] via-[#102347] to-[#2563eb] p-6 md:p-8 shadow-[0_40px_120px_rgba(37,99,235,0.28)]">

      {/* Decorative glow + grid, matches the rest of the LUMOS dashboard family */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6 items-stretch">

        {/* LEFT — greeting, date/time, inline stats, actions */}
        <div className="flex flex-col justify-between">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl"
              >
                <GreetingIcon size={22} className={greeting.color} strokeWidth={1.8} />
              </motion.div>

              <div>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    {greeting.text}
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-blue-100 border border-white/10 uppercase tracking-wide">
                    Lumos ERP
                  </span>
                </div>
                <p className="mt-1 text-[13.5px] text-blue-100/80">{message}</p>
              </div>
            </div>

            {/* Date / time chips */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 backdrop-blur-xl">
                <Calendar size={14} className="text-cyan-300" />
                <span className="text-[12.5px] font-medium text-blue-100">
                  {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 backdrop-blur-xl">
                <Clock size={14} className="text-cyan-300" />
                <span className="text-[12.5px] font-mono font-semibold text-blue-100">
                  {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* INLINE QUICK STATS — live KPI data */}
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-white/10 pt-6">

            {quickStats.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">

                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                    <Icon size={17} />
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-blue-200/70">
                      {item.label}
                    </p>
                    <span className="mt-0.5 block text-lg font-bold leading-none text-white">
                      {item.value}
                    </span>
                  </div>

                  {i < quickStats.length - 1 && (
                    <span className="ml-5 hidden h-8 w-px bg-white/10 sm:block" />
                  )}

                </div>
              );
            })}

          </div>

          {/* ACTIONS */}
          <div className="mt-7 flex flex-wrap items-center gap-3">

            <motion.button
              onClick={handleRefresh}
              disabled={refreshState !== "idle"}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-white/15 disabled:opacity-70"
            >
              {refreshState === "idle" && (
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} strokeWidth={2.5} />
                  Refresh
                </span>
              )}

              {refreshState === "loading" && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2.5 text-cyan-200"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <RefreshCw size={14} strokeWidth={2.5} />
                  </motion.span>
                  <span>Syncing</span>
                  <span className="text-xs font-mono text-cyan-200/70">
                    {refetchCount}/8
                  </span>
                </motion.span>
              )}

              {refreshState === "success" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 text-emerald-300"
                >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  Synced
                </motion.span>
              )}

              {refreshState === "loading" && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
              )}
            </motion.button>

            <Link
              href="/dashboard/shoots/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-[0_20px_50px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02]"
            >
              <Clapperboard size={14} strokeWidth={2} />
              New Production
            </Link>

          </div>

        </div>

        {/* RIGHT — System Status panel */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl">

          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

          <div className="relative z-10 flex h-full flex-col">

            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-300" />
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
                System Status
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {!isRefetching && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${isRefetching ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                />
              </span>
              <span className="text-sm font-semibold text-white">
                {isRefetching ? "Syncing Data…" : "All Systems Operational"}
              </span>
            </div>

            <div className="mt-6 space-y-3.5">

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 text-blue-100/80">
                  <RefreshCw size={14} />
                  <span className="text-[12.5px]">Last Sync</span>
                </div>
                <span className="text-[12.5px] font-semibold text-white">
                  {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 text-blue-100/80">
                  <AlertTriangle size={14} />
                  <span className="text-[12.5px]">Open Alerts</span>
                </div>
                <span
                  className={`text-[12.5px] font-semibold ${(alertSummary?.high_priority ?? 0) > 0 ? "text-red-300" : "text-white"
                    }`}
                >
                  {isLoading ? "…" : alertSummary?.count ?? 0}
                  {(alertSummary?.high_priority ?? 0) > 0 && (
                    <span className="ml-1 text-red-300/80">
                      ({alertSummary.high_priority} high)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 text-blue-100/80">
                  <Activity size={14} />
                  <span className="text-[12.5px]">Data Refetches</span>
                </div>
                <span className="text-[12.5px] font-semibold text-white">
                  {refetchCount}/8
                </span>
              </div>

            </div>

            <div className="mt-auto flex justify-end pt-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-300">
                <ShieldCheck size={30} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ==================== MAIN DASHBOARD COMPONENT ====================
export default function Dashboard() {
  const {
    kpis, productions, alerts, alertSummary,
    financeData, financeSummary,
    assetStats, assetBar,
    todayScans, qrActivity,
    invoiceSummary, invoices,
    crew, isLoading, isRefetching, refetchCount, refetchAll,
  } = useDashboard();

  const overlay = usePageLoadingOverlay("Loading Dashboard...");
  const [refreshState, setRefreshState] = useState("idle");

  useEffect(() => {
    const timer = setTimeout(() => overlay.finish(), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshState("loading");
    await refetchAll();
    setRefreshState("success");
    setTimeout(() => setRefreshState("idle"), 2000);
  }, [refetchAll]);

  const formatCurrency = (amount) => {
    if (!amount) return "₨0";
    if (amount >= 10000000) return `₨${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₨${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `₨${(amount / 1000).toFixed(1)} K`;
    return `₨${amount}`;
  };

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-slate-50/40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

            {/* ===== ENHANCED HEADER WITH GREETING + LIVE SYSTEM STATUS ===== */}
            <EnhancedHeader
              refreshState={refreshState}
              handleRefresh={handleRefresh}
              refetchCount={refetchCount}
              isLoading={isLoading}
              isRefetching={isRefetching}
              kpis={kpis}
              alertSummary={alertSummary}
              formatCurrency={formatCurrency}
            />

            {/* ===== KPI METRICS GRID ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              <MetricCard icon={Clapperboard} label="Active Productions" value={isLoading ? "..." : kpis?.active_productions ?? 0} />
              <MetricCard icon={Users} label="Crew on Set" value={isLoading ? "..." : kpis?.crew_on_set ?? 0} delta={`of ${kpis?.crew_on_set ?? 0}`} accentColor="from-emerald-50 to-emerald-100" iconColor="text-emerald-600" />
              <MetricCard icon={Package} label="Assets Deployed" value={isLoading ? "..." : kpis?.assets_deployed ?? 0} delta={`of ${kpis?.total_assets ?? 0}`} accentColor="from-amber-50 to-amber-100" iconColor="text-amber-600" />
              <MetricCard icon={ScanLine} label="QR Scans Today" value={isLoading ? "..." : kpis?.qr_scans_today ?? 0} accentColor="from-purple-50 to-purple-100" iconColor="text-purple-600" />
              <MetricCard icon={Wallet} label="Revenue MTD" value={isLoading ? "..." : formatCurrency(kpis?.revenue_mtd ?? 0)} accentColor="from-green-50 to-green-100" iconColor="text-green-600" />
              <MetricCard icon={AlertTriangle} label="Open Alerts" value={isLoading ? "..." : alertSummary.count} deltaDir="down" accentColor="from-red-50 to-red-100" iconColor="text-red-600" />
            </div>

            {/* ===== PRODUCTIONS & ALERTS SECTION ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 sm:gap-6">
              <Card>
                <CardHeader icon={Clapperboard} href="/dashboard/shoots" title="Active Productions" sub="Live and upcoming shoots" action="View all" />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-100/60 bg-slate-50/40">
                        {["Production", "Client", "Status", "Crew", "Assets", "Budget", "Progress", ""].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(productions ?? []).map((p, i) => {
                        const sc = STATUS_PROD[p.status] || STATUS_PROD.planned;
                        const spent_pct = pct(p.spent, p.budget);
                        return (
                          <tr key={p.id} className={`hover:bg-slate-50/40 transition-colors group ${i < productions.length - 1 ? "border-b border-slate-100/40" : ""}`}>
                            <td className="px-6 py-4">
                              <Link href={`/dashboard/shoots/${p.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 whitespace-nowrap transition-colors">{p.title}</Link>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 whitespace-nowrap"><MapPin size={11} />{p.location}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{p.client}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${sc.cls}`}>{sc.label}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700 text-center">{p.crew}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-700 text-center">{p.assets}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">{fmtPKR(p.budget)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5 min-w-[130px]">
                                <div className="flex-1 h-2 rounded-full bg-slate-200/50 overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${spent_pct}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 w-10 shrink-0">{spent_pct}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/dashboard/shoots/${p.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                                <ArrowUpRight size={16} strokeWidth={2} className="text-blue-600" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHeader icon={AlertTriangle} title="Operations Alerts" sub={`${alertSummary.count} open · ${alertSummary.high_priority} high priority`} />
                <div className="px-3 py-2 space-y-1">
                  {alerts.map((a, i) => (
                    <Link key={i} href={`/dashboard/shoots/${a.shoot_id}`} className="flex items-start gap-3.5 rounded-lg px-3.5 py-3 hover:bg-slate-50/60 transition-colors cursor-pointer group">
                      <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ring-4 ${SEV_DOT[a.severity]} ${SEV_RING[a.severity]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 mt-0.5 shrink-0 group-hover:text-slate-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            {/* ===== FINANCE & ASSETS SECTION ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-5 sm:gap-6">
              <Card>
                <CardHeader icon={Wallet} title="Revenue & Expenses" sub="6-month trend · PKR lakhs" action="Full report" href="/dashboard/finance" />
                <div className="px-6 py-5">
                  <div className="flex gap-8 mb-6">
                    {[["Revenue", "#10b981"], ["Expenses", "#f59e0b"], ["Profit", "#3b82f6"]].map(([l, c]) => (
                      <div key={l} className="flex items-center gap-2.5">
                        <span className="w-3 h-1.5 rounded-full inline-block shadow-sm" style={{ background: c }} />
                        <span className="text-sm text-slate-600 font-medium">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={financeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="grad-exp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="grad-pro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(value) => `${value}L`} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="rev" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#grad-rev)" dot={false} />
                        <Area type="monotone" dataKey="exp" name="Expenses" stroke="#f59e0b" strokeWidth={2.5} fill="url(#grad-exp)" dot={false} />
                        <Area type="monotone" dataKey="pro" name="Profit" stroke="#3b82f6" strokeWidth={2.5} fill="url(#grad-pro)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100/60 border-t border-slate-100/60 bg-slate-50/40">
                  {[
                    ["Revenue", formatCurrency(financeSummary.revenue), "text-emerald-700"],
                    ["Expenses", formatCurrency(financeSummary.expenses), "text-amber-700"],
                    ["Profit", formatCurrency(financeSummary.profit), financeSummary.profit >= 0 ? "text-blue-700" : "text-rose-700"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-medium">{label}</p>
                      <p className={`text-lg font-bold mt-1.5 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader icon={Package} title="Asset Command Center" sub="Utilization by category" />
                <div className="px-6 py-5 border-b border-slate-100/60 flex flex-col sm:flex-row sm:items-center gap-5 bg-gradient-to-br from-slate-50/60 to-slate-50/20">
                  <div className="shrink-0">
                    <p className="text-4xl font-bold text-slate-900 tracking-tight">{assetStats.overall_utilization}%</p>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Overall utilization</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2.5">
                    {[["Available", assetStats.available, "text-blue-600"], ["In Use", assetStats.in_use, "text-emerald-600"], ["Repair", assetStats.repair, "text-amber-600"], ["Damaged", assetStats.damaged, "text-red-600"]].map(([l, v, c]) => (
                      <div key={l} className="rounded-lg bg-white border border-slate-200/40 px-3.5 py-3 shadow-sm shadow-slate-900/[0.04]">
                        <p className={`text-lg font-bold ${c}`}>{v}</p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={assetBar} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Bar dataKey="used" name="In Use" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="free" name="Free" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>

            {/* ===== CREW & QR ACTIVITY SECTION ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-5 sm:gap-6">
              <Card>
                <CardHeader icon={Users} title="Crew Operations" sub="Currently deployed personnel" action="Full roster" href="/dashboard/crew" />
                <div className="divide-y divide-slate-100/40">
                  {crew.map((c, i) => {
                    const sc = STATUS_CREW[c.status] || STATUS_CREW.inactive;
                    return (
                      <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/40 transition-colors group">
                        <Avatar name={c.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <Link href={`/dashboard/crew/${c.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{c.name}</Link>
                          <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                        </div>
                        <p className="text-sm text-slate-600 hidden sm:block font-medium">{c.shoot}</p>
                        <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${sc.cls}`}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <CardHeader icon={ScanLine} title="Live QR Activity" sub={`${todayScans} scans today`} action="Full log" />
                <div className="divide-y divide-slate-100/40">
                  {qrActivity.map((e, i) => {
                    const actionColor =
                      e.action.includes("Repair") ? "text-amber-600"
                        : e.action.includes("Damage") ? "text-red-600"
                          : e.action.includes("Return") ? "text-blue-600"
                            : e.action.includes("Checkout") ? "text-emerald-600"
                              : "text-slate-600";
                    return (
                      <div key={i} className="flex items-start gap-3.5 px-6 py-4 hover:bg-slate-50/40 transition-colors group">
                        <p className="text-xs font-mono text-slate-400 w-12 shrink-0 pt-0.5">{e.time}</p>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">{e.item}</span>
                            <span className="text-xs font-mono text-slate-500 bg-slate-100/60 rounded-md px-2 py-1">{e.code}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5">
                            <span className={`font-semibold ${actionColor}`}>{e.action}</span>
                            {e.user !== "—" && <span> · {e.user}</span>}
                            {e.shoot !== "—" && <span> · {e.shoot}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* ===== INVOICE SECTION ===== */}
            <Card>
              <CardHeader icon={Receipt} title="Invoice Center" sub="Recent billing activity" action="Manage invoices" href="/dashboard/finance/invoices" />
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100/60 border-b border-slate-100/60 bg-slate-50/30">
                {[
                  ["Total Billed", formatCurrency(invoiceSummary.total_billed), "text-slate-900"],
                  ["Collected", formatCurrency(invoiceSummary.collected), "text-emerald-700"],
                  ["Pending", formatCurrency(invoiceSummary.pending), "text-blue-700"],
                  ["Overdue", formatCurrency(invoiceSummary.overdue), "text-red-700"],
                ].map(([l, v, c]) => (
                  <div key={l} className="px-6 py-5">
                    <p className="text-sm text-slate-600 font-medium">{l}</p>
                    <p className={`text-lg font-bold mt-1.5 ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-100/60 bg-slate-50/40">
                      {["Invoice", "Client", "Amount", "Status", ""].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr key={inv.id} className={`hover:bg-slate-50/40 transition-colors group ${i < invoices.length - 1 ? "border-b border-slate-100/40" : ""}`}>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{inv.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{inv.client}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{inv.amount?.toLocaleString("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset capitalize ${INV_STATUS[inv.status] || INV_STATUS.draft}`}>{inv.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/invoices/production-invoices/${inv.invoice_id}`} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                            <ArrowUpRight size={16} className="text-blue-600" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ===== FOOTER ===== */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 text-center sm:text-left">
              <p className="text-sm text-slate-500 font-medium">Lumos ERP · Production Command Center</p>
              <p className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

          </div>
        </div>
      </Layout>
      <PageLoadingOverlay visible={overlay.visible} text={overlay.text} />
    </>
  );
}