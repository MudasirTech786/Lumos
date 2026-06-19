"use client";

import Layout from "@/components/Layout";
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
   MOCK DATA
════════════════════════════════════════════ */
const revenueData = [
  { m: "Jan", rev: 2.8, exp: 1.9, pro: 0.9 },
  { m: "Feb", rev: 3.2, exp: 2.1, pro: 1.1 },
  { m: "Mar", rev: 2.6, exp: 1.7, pro: 0.9 },
  { m: "Apr", rev: 4.1, exp: 2.6, pro: 1.5 },
  { m: "May", rev: 3.7, exp: 2.3, pro: 1.4 },
  { m: "Jun", rev: 4.8, exp: 2.9, pro: 1.9 },
];

const assetBar = [
  { name: "Cameras",  used: 87,  free: 13 },
  { name: "Lighting", used: 72,  free: 28 },
  { name: "Audio",    used: 91,  free: 9  },
  { name: "Grip",     used: 58,  free: 42 },
  { name: "Transport",used: 64,  free: 36 },
];

const productions = [
  { id:"P-041", title:"Pepsi Ramadan TVC",     client:"Pepsi Pakistan",  status:"active",    crew:22, assets:47, budget:3200000, spent:1840000, location:"Lahore Studio A" },
  { id:"P-040", title:"J. Brand Winter Edit",   client:"J. Apparel",      status:"active",    crew:14, assets:31, budget:1800000, spent:890000,  location:"Karachi Set B"   },
  { id:"P-039", title:"Nestlé Corporate Film",  client:"Nestlé Pakistan", status:"setup",     crew:8,  assets:19, budget:900000,  spent:120000,  location:"ISB Workspace"   },
  { id:"P-038", title:"Telenor Brand Refresh",  client:"Telenor Pakistan",status:"completed", crew:18, assets:38, budget:2600000, spent:2440000, location:"Lahore Studio B" },
];

const alerts = [
  { title:"Sony FX3 · CAM-00003",  detail:"M. Mudasir — 2 days overdue",         sev:"high"   },
  { title:"Aputure 600D Pro",       detail:"Stock: 1 remaining, 3 shoots pending", sev:"high"   },
  { title:"DJI Ronin RS3",          detail:"Under repair · ETA: Tomorrow",         sev:"medium" },
  { title:"Insurance: Van LHR-04",  detail:"Expires in 6 days",                    sev:"medium" },
  { title:"Invoice INV-0031",       detail:"PKR 480k · 12 days overdue",           sev:"low"    },
];

const crew = [
  { name:"Hassan Raza",    role:"Director of Photography", shoot:"Pepsi TVC",   status:"on_set"  },
  { name:"Aisha Mahmood",  role:"Gaffer",                  shoot:"Pepsi TVC",   status:"on_set"  },
  { name:"Bilal Siddiqui", role:"Sound Recordist",         shoot:"J. Brand",    status:"on_set"  },
  { name:"Sara Khan",      role:"1st AD",                  shoot:"Nestlé Film", status:"standby" },
  { name:"Usman Tariq",    role:"Grip",                    shoot:"J. Brand",    status:"on_set"  },
  { name:"Maryam Aziz",    role:"Art Director",            shoot:"Nestlé Film", status:"standby" },
];

const feed = [
  { time:"09:41", code:"CAM-00003", item:"Sony FX3",       action:"Checked Out",    user:"H. Raza",     shoot:"Pepsi TVC" },
  { time:"09:28", code:"LGT-00017", item:"Aputure 600D",   action:"Checked Out",    user:"A. Mahmood",  shoot:"Pepsi TVC" },
  { time:"08:55", code:"AUD-00009", item:"Zoom F8n Pro",   action:"Checked Out",    user:"B. Siddiqui", shoot:"J. Brand"  },
  { time:"08:30", code:"GRP-00004", item:"C-Stand Set ×4", action:"Checked Out",    user:"U. Tariq",    shoot:"J. Brand"  },
  { time:"07:58", code:"CAM-00007", item:"DJI Ronin RS3",  action:"Sent to Repair", user:"Workshop",    shoot:"—"         },
  { time:"07:12", code:"VEH-00002", item:"Production Van", action:"Dispatched",     user:"A. Driver",   shoot:"Pepsi TVC" },
];

const invoices = [
  { id:"INV-0034", client:"Pepsi Pakistan",  amount:1600000, status:"paid"    },
  { id:"INV-0033", client:"J. Apparel",       amount:680000,  status:"pending" },
  { id:"INV-0032", client:"Nestlé Pakistan",  amount:450000,  status:"draft"   },
  { id:"INV-0031", client:"Telenor Pakistan", amount:480000,  status:"overdue" },
];

/* ════════════════════════════════════════════
   TINY HELPERS
════════════════════════════════════════════ */
const fmtPKR = (n) =>
  n >= 1000000 ? `₨${(n/1000000).toFixed(1)}M`
  : n >= 1000  ? `₨${(n/1000).toFixed(0)}K`
  : `₨${n}`;

const pct = (a, b) => Math.round((a / b) * 100);

const STATUS_PROD = {
  active:    { label:"Active",    cls:"bg-emerald-50 text-emerald-700 ring-emerald-200" },
  setup:     { label:"Setup",     cls:"bg-amber-50   text-amber-700   ring-amber-200"   },
  completed: { label:"Done",      cls:"bg-slate-100  text-slate-500   ring-slate-200"   },
};

const STATUS_CREW = {
  on_set:  { label:"On Set",  cls:"bg-emerald-50 text-emerald-700 ring-emerald-200" },
  standby: { label:"Standby", cls:"bg-blue-50    text-blue-700    ring-blue-200"    },
};

const INV_STATUS = {
  paid:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-blue-50    text-blue-700    ring-blue-200",
  draft:   "bg-slate-100  text-slate-500   ring-slate-200",
  overdue: "bg-rose-50    text-rose-700    ring-rose-200",
};

const SEV_DOT = { high:"bg-rose-500", medium:"bg-amber-400", low:"bg-blue-400" };
const SEV_RING = { high:"ring-rose-100", medium:"ring-amber-100", low:"ring-blue-100" };

/* ════════════════════════════════════════════
   REUSABLE COMPONENTS
════════════════════════════════════════════ */

/** White card wrapper */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 ${className}`}>
      {children}
    </div>
  );
}

/** Card header row */
function CardHeader({ title, sub, action, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center shrink-0">
            <Icon size={16} className="text-slate-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900 truncate">{title}</p>
          {sub && <p className="text-sm text-slate-400 mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
      {action && (
        <button className="shrink-0 text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors whitespace-nowrap">
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

/** Top-level metric card */
function MetricCard({ icon: Icon, label, value, delta, deltaDir = "up", accent = "blue" }) {
  const iconBg = {
    blue:    "bg-blue-50    text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50   text-amber-600",
    rose:    "bg-rose-50    text-rose-600",
    violet:  "bg-violet-50  text-violet-600",
  }[accent];

  return (
    <Card className="p-5 sm:p-6 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} />
        </div>
        {delta && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${deltaDir === "up" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"}`}>
            {deltaDir === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
    </Card>
  );
}

/** Recharts tooltip */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: ₨{p.value}M
        </p>
      ))}
    </div>
  );
};

/** Avatar initials */
function Avatar({ name, size = "sm" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-10 h-10 text-sm" : "w-11 h-11 text-base";
  return (
    <div className={`${sz} rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 select-none ring-1 ring-slate-200/60`}>
      {initials}
    </div>
  );
}

/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function Dashboard() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">

        {/* ── TOP NAV BAR ────────────────────────────── */}
        {/* <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
                <Clapperboard size={17} className="text-white" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Lumos ERP</span>
            </div>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <span className="text-sm text-slate-500 hidden sm:inline truncate">Production Command Center</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">All systems operational</span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div> */}

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* ── PAGE HEADING ──────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Operations Overview</h1>
              <p className="text-base text-slate-400 mt-1">
                {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                <RefreshCw size={14} /> Refresh
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors shadow-sm shadow-blue-200">
                <Clapperboard size={14} /> New Production
              </button>
            </div>
          </div>

          {/* ── KPI STRIP ──────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            <MetricCard icon={Clapperboard} label="Active Productions" value="3"     delta="+1 vs last wk"  accent="blue"    />
            <MetricCard icon={Users}        label="Crew on Set"         value="44"    delta="of 124 total"   accent="emerald" />
            <MetricCard icon={Package}      label="Assets Deployed"     value="78"    delta="of 856 total"   accent="violet"  />
            <MetricCard icon={ScanLine}     label="QR Scans Today"      value="94"                           accent="blue"    />
            <MetricCard icon={Wallet}       label="Revenue MTD"         value="₨8.4M" delta="+38% MoM"       accent="emerald" />
            <MetricCard icon={AlertTriangle} label="Open Alerts"        value="5"     delta="2 high priority" deltaDir="down" accent="rose" />
          </div>

          {/* ── ROW 1: Productions table + Alerts ──────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 sm:gap-6">

            {/* Productions */}
            <Card>
              <CardHeader icon={Clapperboard} title="Active Productions" sub="Live and upcoming shoots" action="View all" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Production", "Client", "Status", "Crew", "Assets", "Budget", "Progress", ""].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productions.map((p, i) => {
                      const sc = STATUS_PROD[p.status];
                      const spent_pct = pct(p.spent, p.budget);
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50 transition-colors group ${i < productions.length - 1 ? "border-b border-slate-50" : ""}`}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{p.title}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 whitespace-nowrap"><MapPin size={11}/>{p.location}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{p.client}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${sc.cls}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600 text-center">{p.crew}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600 text-center">{p.assets}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">{fmtPKR(p.budget)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5 min-w-[120px]">
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${spent_pct > 85 ? "bg-rose-500" : spent_pct > 60 ? "bg-amber-400" : "bg-blue-500"}`}
                                  style={{ width: `${spent_pct}%` }} />
                              </div>
                              <span className="text-xs font-medium text-slate-500 w-8 shrink-0">{spent_pct}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                              <ArrowUpRight size={16} className="text-blue-600" />
                            </button>
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
              <CardHeader icon={AlertTriangle} title="Operations Alerts" sub="5 open · 2 high priority" />
              <div className="px-3 py-3 space-y-1">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-3.5 rounded-xl px-3.5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <span className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ring-4 ${SEV_DOT[a.sev]} ${SEV_RING[a.sev]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.detail}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 mt-1.5 shrink-0" />
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 pt-1">
                <button className="w-full text-sm font-semibold text-blue-600 hover:text-blue-800 text-center py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                  View all alerts
                </button>
              </div>
            </Card>
          </div>

          {/* ── ROW 2: Revenue chart + Asset utilization ──── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 sm:gap-6">

            {/* Revenue Chart */}
            <Card>
              <CardHeader icon={Wallet} title="Revenue & Expenses" sub="6-month trend · PKR millions" action="Full report" />
              <div className="px-6 py-4">
                {/* legend */}
                <div className="flex gap-6 mb-5">
                  {[["Revenue","#3b82f6"],["Expenses","#f43f5e"],["Profit","#10b981"]].map(([l,c])=>(
                    <div key={l} className="flex items-center gap-2">
                      <span className="w-3.5 h-1 rounded-full inline-block" style={{background:c}}/>
                      <span className="text-sm text-slate-500 font-medium">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="h-60 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{top:4,right:8,left:-20,bottom:0}}>
                      <defs>
                        {[["r","#3b82f6"],["e","#f43f5e"],["p","#10b981"]].map(([id,c])=>(
                          <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={c} stopOpacity={0.16}/>
                            <stop offset="95%" stopColor={c} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="m" tick={{fontSize:13,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:13,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<ChartTip/>}/>
                      <Area type="monotone" dataKey="rev" name="Revenue"  stroke="#3b82f6" strokeWidth={2.5} fill="url(#r)" dot={false}/>
                      <Area type="monotone" dataKey="exp" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#e)" dot={false}/>
                      <Area type="monotone" dataKey="pro" name="Profit"   stroke="#10b981" strokeWidth={2.5} fill="url(#p)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* summary row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
                {[["Revenue","₨22.2M","text-slate-900"],["Expenses","₨14.5M","text-rose-600"],["Profit","₨7.7M","text-emerald-600"]].map(([l,v,c])=>(
                  <div key={l} className="px-6 py-4">
                    <p className="text-xs text-slate-400 font-medium">{l}</p>
                    <p className={`text-lg font-bold mt-1 ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Asset Utilization */}
            <Card>
              <CardHeader icon={Package} title="Asset Command Center" sub="Utilization by category" />
              {/* big stat */}
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="shrink-0">
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">78%</p>
                  <p className="text-sm text-slate-400 mt-1">Overall utilization</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2.5">
                  {[["Available","188","text-emerald-600"],["In Use","78","text-blue-600"],["Repair","12","text-amber-600"],["Damaged","7","text-rose-600"]].map(([l,v,c])=>(
                    <div key={l} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                      <p className={`text-lg font-bold ${c}`}>{v}</p>
                      <p className="text-xs text-slate-400 font-medium">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* bar chart */}
              <div className="px-6 py-5">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assetBar} margin={{top:0,right:0,left:-20,bottom:0}} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:12,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:12,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v,n)=>[`${v}%`,n]} contentStyle={{fontSize:13,borderRadius:10,border:"1px solid #e2e8f0"}}/>
                      <Bar dataKey="used" name="In Use" fill="#3b82f6" radius={[4,4,0,0]}/>
                      <Bar dataKey="free" name="Free"   fill="#e2e8f0" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* ── ROW 3: Crew + QR feed ───────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 sm:gap-6">

            {/* Crew Operations */}
            <Card>
              <CardHeader icon={Users} title="Crew Operations" sub="Currently deployed personnel" action="Full roster" />
              <div className="divide-y divide-slate-50">
                {crew.map((c, i) => {
                  const sc = STATUS_CREW[c.status];
                  return (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                      <Avatar name={c.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.role}</p>
                      </div>
                      <p className="text-sm text-slate-500 hidden sm:block">{c.shoot}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* QR Activity Feed */}
            <Card>
              <CardHeader icon={ScanLine} title="Live QR Activity" sub="94 scans today" action="Full log" />
              <div className="divide-y divide-slate-50">
                {feed.map((e, i) => {
                  const actionColor =
                    e.action.includes("Repair") ? "text-amber-600"  :
                    e.action.includes("Return") ? "text-emerald-600":
                    e.action.includes("Dispatch") ? "text-violet-600" : "text-blue-600";
                  return (
                    <div key={i} className="flex items-start gap-3.5 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-mono text-slate-300 w-12 shrink-0 pt-0.5">{e.time}</p>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-700">{e.item}</span>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5">{e.code}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
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
            <CardHeader icon={Receipt} title="Invoice Center" sub="Recent billing activity" action="Manage invoices" />

            {/* summary tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100">
              {[
                ["Total Billed",  "₨14.2M", "text-slate-900"],
                ["Collected",     "₨9.8M",  "text-emerald-600"],
                ["Pending",       "₨3.6M",  "text-blue-600"],
                ["Overdue",       "₨0.8M",  "text-rose-600"],
              ].map(([l,v,c]) => (
                <div key={l} className="px-6 py-5">
                  <p className="text-sm text-slate-400 font-medium">{l}</p>
                  <p className={`text-xl font-bold mt-1 ${c}`}>{v}</p>
                </div>
              ))}
            </div>

            {/* table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Invoice","Client","Amount","Status",""].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={inv.id} className={`hover:bg-slate-50 transition-colors group ${i < invoices.length - 1 ? "border-b border-slate-50" : ""}`}>
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">{inv.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{inv.client}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{inv.amount.toLocaleString("en-PK", { style:"currency", currency:"PKR", maximumFractionDigits:0 })}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset capitalize ${INV_STATUS[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                          <ArrowUpRight size={16} className="text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── FOOTER ────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-3 text-center sm:text-left">
            <p className="text-sm text-slate-400">Lumos ERP · Production Command Center</p>
            <p className="text-sm text-slate-400">
              Last updated: {new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}