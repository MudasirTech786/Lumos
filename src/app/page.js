"use client";

import Layout from "@/components/Layout";

import {
  CalendarDays,
  Users,
  Wallet,
  Boxes,
  QrCode,
  Clock3,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Package,
  Briefcase,
  ChevronRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {

  const stats = [
    {
      title: "Total Employees",
      value: "124",
      icon: Users,
      growth: "+12 this month",
    },
    {
      title: "Upcoming Events",
      value: "08",
      icon: CalendarDays,
      growth: "3 scheduled this week",
    },
    {
      title: "Payroll Processed",
      value: "$42,500",
      icon: Wallet,
      growth: "April Payroll",
    },
    {
      title: "Inventory Assets",
      value: "856",
      icon: Boxes,
      growth: "42 low stock alerts",
    },
  ];

  const attendanceData = [
    { name: "Mon", value: 82 },
    { name: "Tue", value: 91 },
    { name: "Wed", value: 88 },
    { name: "Thu", value: 96 },
    { name: "Fri", value: 92 },
    { name: "Sat", value: 70 },
  ];

  const payrollData = [
    { month: "Jan", payroll: 18000 },
    { month: "Feb", payroll: 22000 },
    { month: "Mar", payroll: 27000 },
    { month: "Apr", payroll: 42500 },
  ];

  const inventoryData = [
    { name: "In Use", value: 420 },
    { name: "Available", value: 300 },
    { name: "Damaged", value: 40 },
    { name: "Returned", value: 96 },
  ];

  const roadmap = [
    {
      phase: "PHASE 2",
      title: "Event Module",
      status: "In Progress",
      desc: "Create events, assign crew & manage operations",
    },
    {
      phase: "PHASE 3",
      title: "Payroll Module",
      status: "Planned",
      desc: "Crew payments, payroll items & paid status",
    },
    {
      phase: "PHASE 4",
      title: "Inventory Module",
      status: "Planned",
      desc: "Track stock, assets & quantity management",
    },
    {
      phase: "PHASE 5",
      title: "Event + Inventory Link",
      status: "Upcoming",
      desc: "Assign inventory to events with tracking",
    },
    {
      phase: "PHASE 6",
      title: "QR Tracking",
      status: "Advanced",
      desc: "QR scan system for equipment tracking",
    },
  ];

  const recentActivities = [
    "Ahmed submitted leave request",
    "Payroll generated for April",
    "3 new crew members added",
    "Event inventory assigned",
    "Camera equipment marked returned",
  ];

  return (

    <Layout>

      <div className="min-h-screen rounded-[40px] bg-[#f4f8ff] p-4 md:p-6 overflow-hidden relative">

        {/* BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          <div className="absolute top-[-150px] left-[-120px] w-[420px] h-[420px] rounded-full bg-blue-300/20 blur-3xl" />

          <div className="absolute bottom-[-200px] right-[-120px] w-[520px] h-[520px] rounded-full bg-cyan-300/20 blur-3xl" />

        </div>

        <div className="relative z-10 space-y-6">

          {/* HERO */}
          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#0b1324] via-[#123b89] to-[#2563eb] p-8 md:p-10 shadow-[0_30px_120px_rgba(37,99,235,0.35)]">

            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-10 items-center">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 backdrop-blur-xl text-white text-xs tracking-[0.2em] uppercase">
                  Nizaamo Management System
                </div>

                <h1 className="mt-6 text-5xl md:text-6xl font-black leading-[1.02] tracking-[-0.05em] text-white max-w-4xl">
                  Your enterprise operations command center.
                </h1>

                <p className="mt-5 text-blue-100/80 max-w-2xl leading-relaxed text-base">
                  Manage employees, events, payroll, leaves and inventory from one centralized workspace.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <button className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-blue-700 shadow-lg hover:scale-[1.02] transition-all">
                    Open Workspace
                  </button>

                  <button className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm font-medium text-white backdrop-blur-xl hover:bg-white/15 transition-all">
                    System Stable
                  </button>

                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/10 backdrop-blur-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
                      Current Progress
                    </p>

                    <h2 className="mt-2 text-4xl font-black text-white">
                      62%
                    </h2>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white">
                    <TrendingUp size={30} />
                  </div>
                </div>

                <div className="mt-8 space-y-5">

                  <ProgressBar
                    label="HR & Leave Module"
                    value="100%"
                    width="100%"
                  />

                  <ProgressBar
                    label="Event Module"
                    value="65%"
                    width="65%"
                  />

                  <ProgressBar
                    label="Payroll System"
                    value="40%"
                    width="40%"
                  />

                  <ProgressBar
                    label="Inventory Tracking"
                    value="28%"
                    width="28%"
                  />

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
                  className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 backdrop-blur-xl p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]"
                >

                  <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-blue-100 blur-3xl opacity-70" />

                  <div className="relative z-10 flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {item.title}
                      </p>

                      <h3 className="mt-4 text-4xl font-black text-slate-900 tracking-tight">
                        {item.value}
                      </h3>

                      <p className="mt-4 text-xs text-blue-600 font-medium">
                        {item.growth}
                      </p>
                    </div>

                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                      <Icon size={28} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ATTENDANCE */}
            <div className="rounded-[34px] bg-white/80 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                    Workforce
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    Attendance Trend
                  </h2>
                </div>

                <div className="w-14 h-14 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              <div className="h-[300px]">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart data={attendanceData}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      fill="#93c5fd"
                    />
                  </AreaChart>

                </ResponsiveContainer>

              </div>
            </div>

            {/* PAYROLL */}
            <div className="rounded-[34px] bg-white/80 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                    Payroll
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    Monthly Payments
                  </h2>
                </div>

                <div className="w-14 h-14 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wallet size={24} />
                </div>
              </div>

              <div className="h-[300px]">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={payrollData}>
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Bar dataKey="payroll" radius={[12, 12, 0, 0]} fill="#2563eb" />
                  </BarChart>

                </ResponsiveContainer>

              </div>
            </div>
          </div>

          {/* LOWER GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">

            {/* ROADMAP */}
            <div className="rounded-[34px] bg-white/80 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

              <div className="flex items-center justify-between border-b border-blue-50 pb-5">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                    Development Roadmap
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    Upcoming Modules
                  </h2>
                </div>

                <div className="w-14 h-14 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-4">

                {roadmap.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-3xl bg-blue-50/70 p-5 border border-transparent hover:border-blue-100 transition-all"
                  >

                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-100">
                      {index + 2}
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

                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                          <CheckCircle2 size={12} />
                          {item.status}
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <ChevronRight size={18} className="text-slate-300 mt-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* INVENTORY */}
              <div className="rounded-[34px] bg-white/80 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

                <div className="flex items-center justify-between mb-6">

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                      Inventory
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      Asset Status
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Package size={24} />
                  </div>
                </div>

                <div className="h-[250px]">

                  <ResponsiveContainer width="100%" height="100%">

                    <PieChart>

                      <Pie
                        data={inventoryData}
                        dataKey="value"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              "#2563eb",
                              "#60a5fa",
                              "#0f172a",
                              "#93c5fd",
                            ][index % 4]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />

                    </PieChart>

                  </ResponsiveContainer>

                </div>
              </div>

              {/* ACTIVITY */}
              <div className="rounded-[34px] bg-white/80 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">

                <div className="flex items-center justify-between mb-6">

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-600">
                      Activity Feed
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      Recent Updates
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                </div>

                <div className="space-y-4">

                  {recentActivities.map((item, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl bg-blue-50/70 border border-blue-100 p-4"
                    >

                      <div className="w-10 h-10 rounded-2xl bg-white text-blue-700 flex items-center justify-center shadow-sm">
                        <Clock3 size={18} />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-800">
                          {item}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Synced recently in workspace.
                        </p>
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

function ProgressBar({
  label,
  value,
  width,
}) {

  return (

    <div>

      <div className="flex items-center justify-between text-xs text-blue-100 mb-2">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">

        <div
          style={{ width }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-300"
        />

      </div>
    </div>
  );
}