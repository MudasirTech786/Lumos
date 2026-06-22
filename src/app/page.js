"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import api from "@/lib/api";
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
} from "lucide-react";

/* ════════════════════════════════════════════
   TINY HELPERS
════════════════════════════════════════════ */
const fmtPKR = (n) =>
  n >= 1000000 ? `₨${(n / 1000000).toFixed(1)}M`
    : n >= 1000 ? `₨${(n / 1000).toFixed(0)}K`
      : `₨${n}`;

const pct = (spent, budget) => {
  if (!budget || budget <= 0) {
    return 0;
  }

  const percentage = Math.round((spent / budget) * 100);

  return Math.min(percentage, 100);
};

// Updated color-coded status with semantic meaning
const STATUS_PROD = {
  planned: { label: "Planned", cls: "bg-slate-50 text-slate-700 ring-slate-200" },
  scheduled: { label: "Scheduled", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 ring-red-200" },
};

const STATUS_CREW = {

  assigned: {
    label: 'Assigned',
    cls: 'bg-blue-50 text-blue-700 ring-blue-200'
  },

  active: {
    label: 'On Set',
    cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  },

  completed: {
    label: 'Completed',
    cls: 'bg-slate-100 text-slate-700 ring-slate-200'
  },

  inactive: {
    label: 'Inactive',
    cls: 'bg-slate-100 text-slate-500 ring-slate-200'
  }
};

const INV_STATUS = {

  draft:
    "bg-slate-100 text-slate-700 ring-slate-200",

  sent:
    "bg-blue-50 text-blue-700 ring-blue-200",

  partially_paid:
    "bg-amber-50 text-amber-700 ring-amber-200",

  paid:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",

  overdue:
    "bg-rose-50 text-rose-700 ring-rose-200",

  cancelled:
    "bg-slate-100 text-slate-500 ring-slate-200",
};

// Semantic severity indicators
const SEV_DOT = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-blue-500" };
const SEV_RING = { high: "ring-red-200", medium: "ring-amber-200", low: "ring-blue-200" };

/* ════════════════════════════════════════════
   REUSABLE COMPONENTS
════════════════════════════════════════════ */

/** White card wrapper with top accent border */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-900/[0.08] hover:shadow-md hover:shadow-slate-900/[0.12] hover:border-slate-200/80 transition-all duration-300 overflow-hidden ${className}`}>
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
      {children}
    </div>
  );
}

/** Card header row */
function CardHeader({
  title,
  sub,
  action,
  href,
  icon: Icon
}) {
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

/** Top-level metric card with gradient icon and improved styling */
function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaDir = "up",
  accentColor = "from-blue-50 to-blue-100",
  iconColor = "text-blue-600"
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm shadow-slate-900/[0.08] hover:shadow-md hover:shadow-slate-900/[0.12] hover:border-slate-300/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      {/* Subtle top border accent */}
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
      <p className={`text-3xl font-bold mt-2 tracking-tight text-slate-900`}>{value}</p>
    </div>
  );
}

/** Enhanced Recharts tooltip with glassmorphism */
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

/** Avatar with improved styling */
function Avatar({ name, size = "sm" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-10 h-10 text-xs" : "w-12 h-12 text-sm";
  return (
    <div className={`${sz} rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold flex items-center justify-center shrink-0 select-none ring-1 ring-blue-200/60`}>
      {initials}
    </div>
  );
}

/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function Dashboard() {

  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    active_productions: 0,
    crew_on_set: 0,
    assets_deployed: 0,
    total_assets: 0,
    qr_scans_today: 0,
    revenue_mtd: 0,
    open_alerts: 0,
  });

  const [productions, setProductions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertSummary, setAlertSummary] = useState({
    count: 0,
    high_priority: 0,
  });

  const fetchKpis = async () => {
    try {
      const response = await api.get("/dashboard/kpis");

      setKpis(response.data);

    } catch (error) {
      console.error("Failed to load dashboard KPIs", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchProductions = async () => {
    try {

      const response = await api.get(
        "/dashboard/productions"
      );

      setProductions(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const fetchAlerts = async () => {
    try {

      const response = await api.get(
        "/dashboard/alerts"
      );

      setAlerts(response.data.alerts || []);

      setAlertSummary({
        count: response.data.count || 0,
        high_priority: response.data.high_priority || 0,
      });

    } catch (error) {

      console.error(error);

    }
  };

  const [financeData, setFinanceData] =
    useState([]);

  const [financeSummary, setFinanceSummary] =
    useState({
      revenue: 0,
      expenses: 0,
      profit: 0,
    });

  const fetchFinanceTrend = async () => {

    try {

      const response =
        await api.get(
          "/dashboard/finance-trend"
        );

      setFinanceData(
        response.data.chart || []
      );

      setFinanceSummary(
        response.data.summary || {}
      );

    } catch (error) {

      console.error(error);

    }
  };

  const formatPKR = (amount) => {

    if (!amount) return "₨0";

    // Crores
    if (amount >= 10000000) {
      return `₨${(amount / 10000000).toFixed(1)} Cr`;
    }

    // Lakhs
    if (amount >= 100000) {
      return `₨${(amount / 100000).toFixed(1)} L`;
    }

    // Thousands
    if (amount >= 1000) {
      return `₨${(amount / 1000).toFixed(1)} K`;
    }

    return `₨${amount}`;
  };

  const [assetStats, setAssetStats] =
    useState({
      overall_utilization: 0,
      available: 0,
      in_use: 0,
      repair: 0,
      damaged: 0,
    });

  const [assetBar, setAssetBar] =
    useState([]);

  const fetchAssets = async () => {

    try {

      const response =
        await api.get(
          "/dashboard/assets"
        );

      setAssetStats({
        overall_utilization:
          response.data.overall_utilization,

        available:
          response.data.available,

        in_use:
          response.data.in_use,

        repair:
          response.data.repair,

        damaged:
          response.data.damaged,
      });

      setAssetBar(
        response.data.chart || []
      );

    } catch (error) {

      console.error(error);

    }
  };

  const [qrActivity, setQrActivity] =
    useState([]);

  const [todayScans, setTodayScans] =
    useState(0);

  const fetchQrActivity = async () => {

    try {

      const response =
        await api.get(
          "/dashboard/qr-activity"
        );

      setTodayScans(
        response.data.today_scans || 0
      );

      setQrActivity(
        response.data.activities || []
      );

    } catch (error) {

      console.error(error);

    }
  };

  const [invoiceSummary, setInvoiceSummary] =
    useState({
      total_billed: 0,
      collected: 0,
      pending: 0,
      overdue: 0,
    });

  const [invoices, setInvoices] =
    useState([]);

  const fetchInvoices = async () => {

    try {

      const response =
        await api.get(
          "/dashboard/invoices"
        );

      setInvoiceSummary(
        response.data.summary
      );

      setInvoices(
        response.data.invoices
      );

    } catch (error) {

      console.error(error);

    }
  };

  const [crew, setCrew] =
    useState([]);

  const fetchCrewOperations =
    async () => {

      try {

        const response =
          await api.get(
            '/dashboard/crew-operations'
          );

        setCrew(
          response.data.crew || []
        );

      } catch (error) {

        console.error(error);

      }
    };


  const refreshDashboard = async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchKpis(),
        fetchProductions(),
        fetchAlerts(),
        fetchFinanceTrend(),
        fetchAssets(),
        fetchQrActivity(),
        fetchInvoices(),
        fetchCrewOperations(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    fetchProductions();
    fetchAlerts();
    fetchFinanceTrend();
    fetchAssets();
    fetchQrActivity();
    fetchInvoices();
    fetchCrewOperations();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "₨0";

    if (amount >= 1000000) {
      return `₨${(amount / 1000000).toFixed(1)}M`;
    }

    if (amount >= 1000) {
      return `₨${(amount / 1000).toFixed(1)}K`;
    }

    return `₨${amount}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* ── PAGE HEADING ──────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Operations Overview</h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshDashboard}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm shadow-slate-900/[0.05]"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                href="/dashboard/shoots/create"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40"
              >
                <Clapperboard size={14} strokeWidth={2} />
                New Production
              </Link>
            </div>
          </div>

          {/* ── KPI STRIP ──────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">

            <MetricCard
              icon={Clapperboard}
              label="Active Productions"
              value={loading ? "..." : kpis.active_productions}
              accentColor="from-blue-50 to-blue-100"
              iconColor="text-blue-600"
            />

            <MetricCard
              icon={Users}
              label="Crew on Set"
              value={loading ? "..." : kpis.crew_on_set}
              delta={`of ${kpis.crew_on_set}`}
              accentColor="from-emerald-50 to-emerald-100"
              iconColor="text-emerald-600"
            />

            <MetricCard
              icon={Package}
              label="Assets Deployed"
              value={loading ? "..." : kpis.assets_deployed}
              delta={`of ${kpis.total_assets}`}
              accentColor="from-amber-50 to-amber-100"
              iconColor="text-amber-600"
            />

            <MetricCard
              icon={ScanLine}
              label="QR Scans Today"
              value={loading ? "..." : kpis.qr_scans_today}
              accentColor="from-purple-50 to-purple-100"
              iconColor="text-purple-600"
            />

            <MetricCard
              icon={Wallet}
              label="Revenue MTD"
              value={loading ? "..." : formatCurrency(kpis.revenue_mtd)}
              accentColor="from-green-50 to-green-100"
              iconColor="text-green-600"
            />

            <MetricCard
              icon={AlertTriangle}
              label="Open Alerts"
              value={loading ? "..." : alertSummary.count}
              deltaDir="down"
              accentColor="from-red-50 to-red-100"
              iconColor="text-red-600"
            />

          </div>

          {/* ── ROW 1: Productions table + Alerts ──────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 sm:gap-6">

            {/* Productions */}
            <Card>
              <CardHeader icon={Clapperboard} href={`/dashboard/shoots`} title="Active Productions" sub="Live and upcoming shoots" action="View all" />
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
                    {productions.map((p, i) => {
                      const sc = STATUS_PROD[p.status];
                      const spent_pct = pct(p.spent, p.budget);
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/40 transition-colors group ${i < productions.length - 1 ? "border-b border-slate-100/40" : ""}`}>
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/shoots/${p.id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-blue-600 whitespace-nowrap transition-colors"
                            >
                              {p.title}
                            </Link>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 whitespace-nowrap"><MapPin size={11} />{p.location}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{p.client}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${sc.cls}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 text-center">{p.crew}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 text-center">{p.assets}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">{fmtPKR(p.budget)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5 min-w-[130px]">
                              <div className="flex-1 h-2 rounded-full bg-slate-200/50 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                  style={{ width: `${spent_pct}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 w-10 shrink-0">
                                {spent_pct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/shoots/${p.id}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                            >
                              <ArrowUpRight
                                size={16}
                                strokeWidth={2}
                                className="text-blue-600"
                              />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader icon={AlertTriangle} title="Operations Alerts" sub={`${alertSummary.count} open · ${alertSummary.high_priority} high priority`} />
              <div className="px-3 py-2 space-y-1">
                {alerts.map((a, i) => (
                  <Link
                    key={i}
                    href={`/dashboard/shoots/${a.shoot_id}`}
                    className="flex items-start gap-3.5 rounded-lg px-3.5 py-3 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ring-4 ${SEV_DOT[a.severity]} ${SEV_RING[a.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{a.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 mt-0.5 shrink-0 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
              <div className="px-4 pb-4 pt-1 border-t border-slate-100/60">
                <button className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 text-center py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                  View all alerts
                </button>
              </div>
            </Card>
          </div>

          {/* ── ROW 2: Revenue chart + Asset utilization ──── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-5 sm:gap-6">

            {/* Revenue Chart */}
            <Card>
              <CardHeader
                icon={Wallet}
                title="Revenue & Expenses"
                sub="6-month trend · PKR lakhs"
                action="Full report"
                href="/dashboard/finance"
              />
              <div className="px-6 py-5">
                {/* legend */}
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
                      <YAxis
                        tickFormatter={(value) => `${value}L`}
                        tick={{
                          fontSize: 12,
                          fill: "#94a3b8"
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTip />} />
                      <Area type="monotone" dataKey="rev" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#grad-rev)" dot={false} />
                      <Area type="monotone" dataKey="exp" name="Expenses" stroke="#f59e0b" strokeWidth={2.5} fill="url(#grad-exp)" dot={false} />
                      <Area type="monotone" dataKey="pro" name="Profit" stroke="#3b82f6" strokeWidth={2.5} fill="url(#grad-pro)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* summary row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100/60 border-t border-slate-100/60 bg-slate-50/40">

                {[
                  [
                    "Revenue",
                    formatPKR(financeSummary.revenue),
                    "text-emerald-700"
                  ],

                  [
                    "Expenses",
                    formatPKR(financeSummary.expenses),
                    "text-amber-700"
                  ],

                  [
                    "Profit",
                    formatPKR(financeSummary.profit),
                    financeSummary.profit >= 0
                      ? "text-blue-700"
                      : "text-rose-700"
                  ]

                ].map(([label, value, color]) => (

                  <div
                    key={label}
                    className="px-6 py-4"
                  >

                    <p className="text-xs text-slate-600 font-medium">
                      {label}
                    </p>

                    <p
                      className={`text-lg font-bold mt-1.5 ${color}`}
                    >
                      {value}
                    </p>

                  </div>

                ))}

              </div>
            </Card>

            {/* Asset Utilization */}
            <Card>
              <CardHeader icon={Package} title="Asset Command Center" sub="Utilization by category" />
              {/* big stat */}
              <div className="px-6 py-5 border-b border-slate-100/60 flex flex-col sm:flex-row sm:items-center gap-5 bg-gradient-to-br from-slate-50/60 to-slate-50/20">
                <div className="shrink-0">
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{assetStats.overall_utilization}%</p>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Overall utilization</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2.5">
                  {[
                    ["Available", assetStats.available, "text-blue-600"],
                    ["In Use", assetStats.in_use, "text-emerald-600"],
                    ["Repair", assetStats.repair, "text-amber-600"],
                    ["Damaged", assetStats.damaged, "text-red-600"]
                  ].map(([l, v, c]) => (
                    <div key={l} className="rounded-lg bg-white border border-slate-200/40 px-3.5 py-3 shadow-sm shadow-slate-900/[0.04]">
                      <p className={`text-lg font-bold ${c}`}>{v}</p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* bar chart */}
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

          {/* ── ROW 3: Crew + QR feed ───────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-5 sm:gap-6">

            {/* Crew Operations */}
            <Card>
              <CardHeader
                icon={Users}
                title="Crew Operations"
                sub="Currently deployed personnel"
                action="Full roster"
                href="/dashboard/crew"
              />
              <div className="divide-y divide-slate-100/40">
                {crew.map((c, i) => {
                  const sc = STATUS_CREW[c.status];
                  return (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/40 transition-colors group">
                      <Avatar name={c.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/dashboard/crew/${c.id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                      </div>
                      <p className="text-sm text-slate-600 hidden sm:block font-medium">{c.shoot}</p>
                      <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* QR Activity Feed */}
            <Card>
              <CardHeader icon={ScanLine} title="Live QR Activity" sub={`${todayScans} scans today`} action="Full log" />
              <div className="divide-y divide-slate-100/40">
                {qrActivity.map((e, i) => {
                  const actionColor =

                    e.action.includes("Repair")
                      ? "text-amber-600"

                      : e.action.includes("Damage")
                        ? "text-red-600"

                        : e.action.includes("Return")
                          ? "text-blue-600"

                          : e.action.includes("Checkout")
                            ? "text-emerald-600"

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

          {/* ── ROW 4: Invoice Center ──────────────────── */}
          <Card>
            <CardHeader
              icon={Receipt}
              title="Invoice Center"
              sub="Recent billing activity"
              action="Manage invoices"
              href="/dashboard/finance/invoices"
            />

            {/* summary tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100/60 border-b border-slate-100/60 bg-slate-50/30">
              {[
                [
                  "Total Billed",
                  formatCurrency(
                    invoiceSummary.total_billed
                  ),
                  "text-slate-900"
                ],

                [
                  "Collected",
                  formatCurrency(
                    invoiceSummary.collected
                  ),
                  "text-emerald-700"
                ],

                [
                  "Pending",
                  formatCurrency(
                    invoiceSummary.pending
                  ),
                  "text-blue-700"
                ],

                [
                  "Overdue",
                  formatCurrency(
                    invoiceSummary.overdue
                  ),
                  "text-red-700"
                ]
              ].map(([l, v, c]) => (
                <div key={l} className="px-6 py-5">
                  <p className="text-sm text-slate-600 font-medium">{l}</p>
                  <p className={`text-lg font-bold mt-1.5 ${c}`}>{v}</p>
                </div>
              ))}
            </div>

            {/* table */}
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
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{inv.amount.toLocaleString("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset capitalize ${INV_STATUS[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                          <Link
                            href={`/dashboard/invoices/production-invoices/${inv.invoice_id}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                          >
                            <ArrowUpRight
                              size={16}
                              className="text-blue-600"
                            />
                          </Link>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── FOOTER ────────────────────────────────────── */}
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