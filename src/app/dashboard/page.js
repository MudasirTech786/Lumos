"use client";

import Layout from "@/components/Layout";

import {
  Sparkles,
  CalendarRange,
  Users,
  Wallet,
  Boxes,
  QrCode,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  Bell,
  ChevronRight,
  BrainCircuit,
  Clock3,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
  Layers3,
  Workflow,
} from "lucide-react";

export default function Dashboard() {

  const stats = [
    {
      title: "Active Events",
      value: "18",
      growth: "+24%",
      icon: CalendarRange,
    },
    {
      title: "Crew Members",
      value: "124",
      growth: "+12",
      icon: Users,
    },
    {
      title: "Monthly Payroll",
      value: "$42K",
      growth: "+8%",
      icon: Wallet,
    },
    {
      title: "Inventory Assets",
      value: "856",
      growth: "Synced",
      icon: Boxes,
    },
  ];

  const roadmap = [
    {
      phase: "Phase 2",
      title: "Event Management Core",
      desc: "Crew assignment, event operations, workflow orchestration",
      icon: CalendarRange,
      status: "In Progress",
    },
    {
      phase: "Phase 3",
      title: "Payroll Intelligence",
      desc: "Automated crew payments & payroll engine",
      icon: Wallet,
      status: "Planned",
    },
    {
      phase: "Phase 4",
      title: "Inventory System",
      desc: "Equipment, quantity and stock tracking",
      icon: Boxes,
      status: "Planned",
    },
    {
      phase: "Phase 5",
      title: "Event Inventory Link",
      desc: "Track inventory usage per event",
      icon: Workflow,
      status: "Upcoming",
    },
    {
      phase: "Phase 6",
      title: "QR Smart Tracking",
      desc: "Live scanning system for assets and returns",
      icon: QrCode,
      status: "Advanced",
    },
  ];

  const activity = [
    "Leave request approved for Ahmed Raza",
    "Payroll system architecture initialized",
    "Inventory service blueprint generated",
    "Crew assigned to Expo 2026 event",
    "QR workflow simulation completed",
  ];

  return (

    <Layout>

      <div className="relative min-h-screen overflow-hidden rounded-[40px] bg-[#f5f9ff] p-4 md:p-6">

        {/* BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute top-[-160px] left-[-120px] h-[450px] w-[450px] rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute bottom-[-200px] right-[-100px] h-[500px] w-[500px] rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)] [background-size:42px_42px]" />

        </div>

        <div className="relative z-10 space-y-6">

          {/* HERO */}
          <div className="relative overflow-hidden rounded-[42px] border border-white/20 bg-gradient-to-br from-[#07111f] via-[#102347] to-[#2563eb] p-8 md:p-10 shadow-[0_40px_120px_rgba(37,99,235,0.30)]">

            <div className="absolute top-[-80px] right-[-50px] h-[320px] w-[320px] rounded-full bg-blue-300/10 blur-3xl" />

            <div className="absolute bottom-[-120px] left-[-60px] h-[250px] w-[250px] rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-10 items-center">

              {/* LEFT */}
              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                  <Sparkles size={14} className="text-cyan-300" />
                  <span className="text-xs tracking-[0.2em] uppercase text-blue-100">
                    NIZAAMO ENTERPRISE OPERATING SYSTEM
                  </span>
                </div>

                <h1 className="mt-7 text-5xl md:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white max-w-5xl">
                  The future control center for workforce, events & intelligent operations.
                </h1>

                <p className="mt-6 max-w-2xl text-blue-100/80 leading-relaxed text-base">
                  Nizaamo is evolving into an AI-powered enterprise ecosystem where employees,
                  events, payroll, inventory and automation operate through one unified neural workspace.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <button className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-blue-700 shadow-[0_20px_50px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02]">
                    Open Command Center
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm font-medium text-white backdrop-blur-xl hover:bg-white/15 transition-all">
                    <BrainCircuit size={16} />
                    AI Workspace Active
                  </button>

                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="relative">

                <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl overflow-hidden">

                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
                          System Status
                        </p>

                        <h2 className="mt-2 text-4xl font-black text-white">
                          Stable
                        </h2>
                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/20 text-emerald-300">
                        <Activity size={28} />
                      </div>
                    </div>

                    <div className="mt-8 space-y-5">

                      <MetricBar
                        label="Event Engine"
                        value="88%"
                        width="88%"
                      />

                      <MetricBar
                        label="Payroll Core"
                        value="62%"
                        width="62%"
                      />

                      <MetricBar
                        label="Inventory Matrix"
                        value="73%"
                        width="73%"
                      />

                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">

                      <MiniCard
                        title="Live Crew"
                        value="74"
                      />

                      <MiniCard
                        title="Assets"
                        value="856"
                      />

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            {stats.map((item, index) => {

              const Icon = item.icon;

              return (

                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[30px] border border-white/60 bg-white/80 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(37,99,235,0.12)]"
                >

                  <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-blue-100/70 blur-3xl transition-all duration-500 group-hover:scale-125" />

                  <div className="relative z-10 flex items-start justify-between">

                    <div>
                      <p className="text-sm text-slate-500 font-medium">
                        {item.title}
                      </p>

                      <h3 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
                        {item.value}
                      </h3>

                      <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        <TrendingUp size={12} />
                        {item.growth}
                      </div>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200">
                      <Icon size={28} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">

            {/* ROADMAP */}
            <div className="rounded-[34px] border border-white/60 bg-white/80 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

              <div className="flex items-center justify-between border-b border-blue-50 pb-5">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                    Product Evolution
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    Future Roadmap
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
                  <Layers3 size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-5">

                {roadmap.map((item, index) => {

                  const Icon = item.icon;

                  return (

                    <div
                      key={index}
                      className="group flex items-start gap-4 rounded-3xl border border-transparent bg-gradient-to-r from-blue-50/80 to-transparent p-5 transition-all hover:border-blue-100 hover:bg-blue-50"
                    >

                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100">
                        <Icon size={24} />
                      </div>

                      <div className="flex-1">

                        <div className="flex items-center justify-between gap-4 flex-wrap">

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
                              {item.phase}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {item.title}
                            </h3>
                          </div>

                          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={12} />
                            {item.status}
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-slate-500">
                          {item.desc}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="mt-2 text-slate-300 transition-all group-hover:translate-x-1"
                      />

                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* AI MODULE */}
              <div className="relative overflow-hidden rounded-[34px] border border-blue-100 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-[0_30px_100px_rgba(37,99,235,0.25)]">

                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative z-10">

                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-xl">
                    <BrainCircuit size={30} />
                  </div>

                  <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight">
                    AI Operations Core
                  </h2>

                  <p className="mt-4 text-sm leading-relaxed text-blue-100">
                    Smart workflow intelligence for workforce, payroll and inventory automation.
                  </p>

                  <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition-all hover:scale-[1.02]">
                    Launch AI Center
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="rounded-[34px] border border-white/60 bg-white/80 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                      Live Feed
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      Activity Stream
                    </h3>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
                    <Bell size={24} />
                  </div>
                </div>

                <div className="mt-8 space-y-4">

                  {activity.map((item, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl border border-blue-50 bg-blue-50/60 p-4"
                    >

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                        <CircleDashed size={18} />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-800">
                          {item}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Synced with Nizaamo enterprise core.
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        <Clock3 size={10} />
                        LIVE
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MetricBar({
  label,
  value,
  width,
}) {

  return (

    <div>

      <div className="mb-2 flex items-center justify-between text-xs text-blue-100">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          style={{ width }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-300"
        />
      </div>

    </div>
  );
}

function MiniCard({
  title,
  value,
}) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">

      <p className="text-xs text-blue-100/80">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-black text-white">
        {value}
      </h3>

    </div>
  );
}