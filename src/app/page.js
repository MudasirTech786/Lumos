"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useDashboard } from "@/hooks/useDashboard";
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
  Sun, Cloud, Moon, Calendar,
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
    return { text: "Good Morning", icon: Sun, color: "text-amber-500" };
  } else if (hour < 17) {
    return { text: "Good Afternoon", icon: Cloud, color: "text-blue-500" };
  } else {
    return { text: "Good Evening", icon: Moon, color: "text-indigo-500" };
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
function EnhancedHeader({ refreshState, handleRefresh, refetchCount }) {
  const greeting = getGreeting();
  const message = getGreetingMessage();
  const GreetingIcon = greeting.icon;
  const now = new Date();

  return (
    <div className="relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 h-[420px] bg-gradient-to-br from-blue-50/40 via-white to-slate-50/30 rounded-3xl" />

      {/* Main header container */}
      <div className="flex flex-col gap-6">
        {/* Top section: Greeting and controls */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Left side: Greeting and date/time info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Greeting line */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`p-3 rounded-2xl bg-gradient-to-br ${
                  greeting.text === "Good Morning"
                    ? "from-amber-100 to-amber-50 shadow-lg shadow-amber-200/40"
                    : greeting.text === "Good Afternoon"
                    ? "from-blue-100 to-blue-50 shadow-lg shadow-blue-200/40"
                    : "from-indigo-100 to-indigo-50 shadow-lg shadow-indigo-200/40"
                }`}
              >
                <GreetingIcon size={28} className={greeting.color} strokeWidth={1.5} />
              </motion.div>
              <div>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                    {greeting.text}
                  </h1>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wide"
                  >
                    Lumos ERP
                  </motion.span>
                </div>
                <p className="text-base text-slate-600 font-medium mt-2">{message}</p>
              </div>
            </div>

            {/* Date and time info */}
            <div className="flex flex-wrap gap-3 items-center">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all"
              >
                <Calendar size={16} className="text-blue-500" strokeWidth={2} />
                <span className="text-sm font-medium text-slate-700">
                  {now.toLocaleDateString("en-US", { 
                    weekday: "short", 
                    month: "short", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all"
              >
                <Clock size={16} className="text-blue-500" strokeWidth={2} />
                <span className="text-sm font-mono font-semibold text-slate-700">
                  {now.toLocaleTimeString("en-US", { 
                    hour: "2-digit", 
                    minute: "2-digit",
                    hour12: true 
                  })}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side: Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            {/* Refresh button with enhanced states */}
            <motion.button
              onClick={handleRefresh}
              disabled={refreshState !== "idle"}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all hover:border-slate-300/80 disabled:opacity-70"
            >
              {refreshState === "idle" && (
                <motion.span
                  key="idle-icon"
                  initial={{ rotate: 0 }}
                  className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                >
                  <RefreshCw size={14} strokeWidth={2.5} />
                  Refresh
                </motion.span>
              )}

              {refreshState === "loading" && (
                <motion.span
                  key="loading-icon"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2.5 text-blue-600"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <RefreshCw size={14} strokeWidth={2.5} />
                  </motion.span>
                  <span>Syncing</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex gap-0.5"
                  >
                    <span className="w-1 h-1 bg-blue-600 rounded-full" />
                    <span className="w-1 h-1 bg-blue-600 rounded-full" />
                    <span className="w-1 h-1 bg-blue-600 rounded-full" />
                  </motion.span>
                  <span className="text-xs text-blue-400 font-mono">
                    {refetchCount}/8
                  </span>
                </motion.span>
              )}

              {refreshState === "success" && (
                <motion.span
                  key="success-icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 text-emerald-600"
                >
                  <motion.span
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </motion.span>
                  Synced
                </motion.span>
              )}

              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={
                  refreshState === "loading"
                    ? {
                        boxShadow: [
                          "0 0 0 0 rgba(59,130,246,0)",
                          "0 0 0 4px rgba(59,130,246,0.15)",
                          "0 0 0 8px rgba(59,130,246,0)",
                        ],
                      }
                    : refreshState === "success"
                    ? {
                        boxShadow: [
                          "0 0 0 0 rgba(16,185,129,0)",
                          "0 0 0 4px rgba(16,185,129,0.2)",
                          "0 0 0 0 rgba(16,185,129,0)",
                        ],
                      }
                    : {}
                }
                transition={
                  refreshState === "loading"
                    ? { repeat: Infinity, duration: 1.5 }
                    : refreshState === "success"
                    ? { duration: 0.8 }
                    : {}
                }
              />

              {refreshState === "loading" && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-200/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
              )}
            </motion.button>

            {/* New Production button */}
            <Link
              href="/dashboard/shoots/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 py-2.5 text-sm font-medium text-white transition-all shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5"
            >
              <Clapperboard size={14} strokeWidth={2} />
              New Production
            </Link>
          </motion.div>
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

  const [refreshState, setRefreshState] = useState("idle");

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
    <Layout>
      <div className="min-h-screen bg-slate-50/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* ===== ENHANCED HEADER WITH GREETING ===== */}
          <EnhancedHeader 
            refreshState={refreshState}
            handleRefresh={handleRefresh}
            refetchCount={refetchCount}
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
  );
}