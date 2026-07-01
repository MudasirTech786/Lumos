"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";

import {
    Film,
    DollarSign,
    TrendingUp,
    Receipt,
    Users,
    Truck,
    Package,
    ArrowLeft,
    Calendar,
    MapPin,
    Building2,
    CheckCircle2,
    ChevronRight,
    BarChart3,
} from "lucide-react";

export default function ShootFinanceReportPage() {
    const params = useParams();
    const router = useRouter();
    const shootId = params.id;

    const [loading, setLoading] = useState(true);
    const [shoot, setShoot] = useState(null);
    const [finance, setFinance] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [details, setDetails] = useState({
        crew: [],
        logistics: [],
        inventory: [],
        expenses: [],
    });
    const [selectedDays, setSelectedDays] = useState(null);
    const [activeSection, setActiveSection] = useState("crew");

    const fetchReport = async () => {
        try {
            setLoading(true);
            const [
                shootRes,
                financeRes,
                expenseRes,
                detailsRes,
                invoicesRes
            ] = await Promise.all([
                api.get(`/shoots/${shootId}`),
                api.get(`/shoots/${shootId}/finance`),
                api.get(`/shoots/${shootId}/expenses`),
                api.get(`/shoots/${shootId}/finance-details`),
                api.get(`/production-invoices/shoot/${shootId}`)
            ]);
            setShoot(shootRes.data);
            setFinance(financeRes.data);
            setExpenses(expenseRes.data?.data || []);
            setDetails(
                detailsRes.data || {
                    crew: [],
                    logistics: [],
                    inventory: [],
                    expenses: [],
                }
            );

            setInvoices(invoicesRes.data || []);
        } catch {
            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load report" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shootId) fetchReport();
    }, [shootId]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-medium tracking-wide text-sm uppercase">
                            Generating Report
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!shoot || !finance) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-slate-500">Report not found</p>
                </div>
            </Layout>
        );
    }

    const profitMargin =
        finance?.revenue > 0
            ? ((finance.profit / finance.revenue) * 100).toFixed(1)
            : 0;

    const activeDays = selectedDays || finance?.shoot_days || 1;

    const crewCost = details.crew.reduce(
        (sum, r) => sum + (r.rate ? r.rate * activeDays : r.amount || 0),
        0
    );
    const logisticsCost = details.logistics.reduce(
        (sum, r) => sum + (r.rate ? r.rate * activeDays : r.amount || 0),
        0
    );
    const inventoryCost = details.inventory.reduce(
        (sum, r) => sum + (r.rate ? r.rate * activeDays : r.amount || 0),
        0
    );
    const expenseCost = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount || 0),
        0
    );

    const totalBreakdown =
        crewCost +
        logisticsCost +
        inventoryCost +
        expenseCost;
    const crewPct = totalBreakdown ? ((crewCost / totalBreakdown) * 100).toFixed(0) : 0;
    const logisticsPct = totalBreakdown ? ((logisticsCost / totalBreakdown) * 100).toFixed(0) : 0;
    const inventoryPct = totalBreakdown ? ((inventoryCost / totalBreakdown) * 100).toFixed(0) : 0;
    const expensePct = totalBreakdown ? ((expenseCost / totalBreakdown) * 100).toFixed(0) : 0;

    const sectionTabs = [
        {
            key: "crew",
            label: "Crew",
            icon: Users,
            count: details.crew?.length
        },
        {
            key: "logistics",
            label: "Logistics",
            icon: Truck,
            count: details.logistics?.length
        },
        {
            key: "inventory",
            label: "Inventory",
            icon: Package,
            count: details.inventory?.length
        },
        {
            key: "expenses",
            label: "Expenses",
            icon: Receipt,
            count: expenses?.length
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50">

                {/* TOP ACCENT BAR */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 w-full" />

                <div className="max-w-7xl mx-auto px-6 py-8 pb-24 space-y-8">

                    {/* BREADCRUMB NAV */}
                    <div className="flex items-center gap-2 text-base">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Finance Dashboard
                        </button>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-500 truncate max-w-xs">{shoot.title}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-800 font-semibold">Report</span>
                    </div>

                    {/* ── HERO HEADER ── */}
                    <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Blueprint grid watermark */}
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(90deg, #1d4ed8 1px, transparent 1px)",
                                backgroundSize: "40px 40px",
                            }}
                        />
                        {/* Decorative circle */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-50 opacity-60" />
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-100 opacity-40" />

                        <div className="relative p-8 md:p-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                                            <Film size={15} className="text-white" />
                                        </div>
                                        <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">
                                            Production Finance Report
                                        </span>
                                    </div>

                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                        {shoot.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-4 text-base text-slate-500">
                                        {shoot.client_name && (
                                            <span className="flex items-center gap-1.5">
                                                <Building2 size={13} className="text-blue-400" />
                                                {shoot.client_name}
                                            </span>
                                        )}
                                        {shoot.location && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={13} className="text-blue-400" />
                                                {shoot.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-blue-400" />
                                            {finance.shoot_days} Day{finance.shoot_days !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">

                                    <button
                                        className="
            px-4 py-2
            rounded-xl
            bg-blue-600
            text-white
            text-sm
            font-bold
            hover:bg-blue-700
        "
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/invoices/production-invoices/create?shoot_id=${shoot.id}`
                                            )
                                        }
                                    >
                                        Create Invoice
                                    </button>

                                    <span className="
        inline-flex
        items-center
        gap-1.5
        px-4
        py-2
        rounded-full
        bg-emerald-50
        border
        border-emerald-200
        text-emerald-700
        text-xs
        font-bold
        uppercase
        tracking-wide
    ">
                                        <CheckCircle2 size={12} />
                                        {shoot.status}
                                    </span>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SUMMARY CARDS ── */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        <MetricCard
                            label="Invoiced"
                            value={finance.invoiced}
                            icon={Receipt}
                            accent="blue"
                        />

                        <MetricCard
                            label="Collected"
                            value={finance.collected}
                            icon={DollarSign}
                            accent="emerald"
                        />

                        <MetricCard
                            label="Outstanding"
                            value={finance.outstanding}
                            icon={TrendingUp}
                            accent="slate"
                        />
                        <MetricCard
                            label="Other Expenses"
                            value={expenseCost}
                            icon={Receipt}
                            accent="slate"
                        />
                        <MarginCard margin={profitMargin} />
                    </div>

                    {/* ── PRODUCTION INFO ── */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Film size={13} className="text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Production Information</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-slate-100">
                            {[
                                { label: "Client", value: shoot.client_name || "—" },
                                { label: "Location", value: shoot.location || "—" },
                                { label: "Start Date", value: shoot.start_datetime },
                                { label: "End Date", value: shoot.end_datetime },
                                {
                                    label: "Budget",
                                    value: `Rs ${Number(shoot.client_budget || 0).toLocaleString()}`,
                                },
                                {
                                    label: "Invoice Amount",
                                    value: `Rs ${Number(shoot.client_invoice_amount || 0).toLocaleString()}`,
                                },
                                { label: "Shoot Days", value: `${finance.shoot_days} Days` },
                                { label: "Status", value: shoot.status, badge: true },
                            ].map(({ label, value, badge }) => (
                                <div key={label} className="px-6 py-5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                                        {label}
                                    </p>
                                    {badge ? (
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold capitalize">
                                            {value}
                                        </span>
                                    ) : (
                                        <p className="text-base font-semibold text-slate-800">{value}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── COST ANALYSIS WITH DAY SELECTOR ── */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <BarChart3 size={13} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800">Cost Analysis</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Select shoot duration to calculate costs
                                        </p>
                                    </div>
                                </div>

                                {/* Day Range Display */}
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
                                    <Calendar size={13} className="text-blue-500" />
                                    Viewing:&nbsp;
                                    <span className="text-blue-600">
                                        {activeDays === finance.shoot_days
                                            ? "Full Shoot"
                                            : `Day ${activeDays}`}
                                    </span>
                                    &nbsp;/&nbsp;{finance.shoot_days} Days
                                </div>
                            </div>

                            {/* ── DAY SELECTOR TIMELINE ── */}
                            <div className="mt-6">
                                {/* Full Shoot Button */}
                                <div className="flex items-center gap-3 mb-4">
                                    <button
                                        onClick={() => setSelectedDays(finance.shoot_days)}
                                        className={`
                                            inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold
                                            border-2 transition-all duration-200
                                            ${activeDays === finance.shoot_days
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                                            }
                                        `}
                                    >
                                        <Film size={13} />
                                        Full Shoot
                                    </button>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>

                                {/* Day Pills Timeline */}
                                <div className="relative">
                                    {/* Track line */}
                                    <div className="absolute top-[22px] left-0 right-0 h-0.5 bg-slate-100 z-0" />

                                    <div className="relative z-10 flex items-start gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                        {Array.from({ length: finance.shoot_days }).map((_, index) => {
                                            const day = index + 1;
                                            const isActive = activeDays === day && activeDays !== finance.shoot_days;
                                            const isPast = activeDays !== finance.shoot_days && day < activeDays;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedDays(day)}
                                                    className="flex flex-col items-center gap-2 group flex-shrink-0"
                                                >
                                                    {/* Circle dot */}
                                                    <div
                                                        className={`
                                                            w-11 h-11 rounded-2xl flex flex-col items-center justify-center
                                                            border-2 transition-all duration-200 text-[10px] leading-tight font-bold
                                                            ${isActive
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                                                                : isPast
                                                                    ? "bg-blue-50 border-blue-200 text-blue-500"
                                                                    : "bg-white border-slate-200 text-slate-500 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:bg-blue-50"
                                                            }
                                                        `}
                                                    >
                                                        <span className="text-[9px] opacity-70">D</span>
                                                        <span className="text-sm leading-none">{day}</span>
                                                    </div>

                                                    {/* Label */}
                                                    <span
                                                        className={`text-[10px] font-semibold transition-colors whitespace-nowrap ${isActive ? "text-blue-600" : "text-slate-400"
                                                            }`}
                                                    >
                                                        Day {day}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown Bars */}
                        <div className="px-8 py-6">
                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                <CostBar
                                    label="Crew"
                                    amount={crewCost}
                                    pct={crewPct}
                                    color="blue"
                                    icon={Users}
                                />
                                <CostBar
                                    label="Logistics"
                                    amount={logisticsCost}
                                    pct={logisticsPct}
                                    color="indigo"
                                    icon={Truck}
                                />
                                <CostBar
                                    label="Inventory"
                                    amount={inventoryCost}
                                    pct={inventoryPct}
                                    color="sky"
                                    icon={Package}
                                />
                                <CostBar
                                    label="Expenses"
                                    amount={expenseCost}
                                    pct={expensePct}
                                    color="blue"
                                    icon={Receipt}
                                />
                            </div>

                            {/* ── TABBED SECTION TABLES ── */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                {/* Tabs */}
                                <div className="flex border-b border-slate-200 bg-slate-50">
                                    {sectionTabs.map(({ key, label, icon: Icon, count }) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveSection(key)}
                                            className={`
                                                flex items-center gap-2 px-6 py-4 text-sm font-semibold
                                                border-b-2 transition-all duration-200 flex-1 justify-center
                                                ${activeSection === key
                                                    ? "border-blue-600 text-blue-600 bg-white"
                                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white"
                                                }
                                            `}
                                        >
                                            <Icon size={14} />
                                            {label}
                                            {count > 0 && (
                                                <span
                                                    className={`
                                                        inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                                                        ${activeSection === key ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}
                                                    `}
                                                >
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="p-0">
                                    {activeSection === "crew" && (
                                        <SectionTable
                                            activeDays={activeDays}
                                            rows={details.crew}
                                            columns={["name", "position", "amount"]}
                                        />
                                    )}
                                    {activeSection === "logistics" && (
                                        <SectionTable
                                            activeDays={activeDays}
                                            rows={details.logistics}
                                            columns={["name", "description", "amount"]}
                                        />
                                    )}
                                    {activeSection === "inventory" && (
                                        <SectionTable
                                            activeDays={activeDays}
                                            rows={details.inventory}
                                            columns={["name", "quantity", "amount"]}
                                        />
                                    )}
                                    {activeSection === "expenses" && (
                                        <SectionTable
                                            activeDays={1}
                                            rows={expenses}
                                            columns={[
                                                "category",
                                                "description",
                                                "amount",
                                            ]}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">

                            <h2 className="text-lg font-bold text-slate-800">
                                Production Invoices
                            </h2>

                            <span className="text-xs font-bold text-slate-400">
                                {invoices.length} Invoices
                            </span>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="bg-slate-50 border-b border-slate-100">

                                        <th className="px-6 py-4 text-left">
                                            Invoice #
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Title
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Total
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Paid
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Balance
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {invoices.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="
                                px-6
                                py-12
                                text-center
                                text-slate-400
                            "
                                            >
                                                No invoices found
                                            </td>

                                        </tr>

                                    ) : (

                                        invoices.map(invoice => (

                                            <tr
                                                key={invoice.id}
                                                className="
                                border-b
                                border-slate-100
                            "
                                            >

                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/dashboard/invoices/production-invoices/${invoice.id}`
                                                            )
                                                        }
                                                        className="
            text-blue-600
            font-semibold
            hover:underline
        "
                                                    >
                                                        {invoice.invoice_number}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {invoice.title}
                                                </td>

                                                <td className="px-6 py-4">
                                                    Rs {Number(
                                                        invoice.total_amount
                                                    ).toLocaleString()}
                                                </td>

                                                <td className="px-6 py-4">
                                                    Rs {Number(
                                                        invoice.paid_amount
                                                    ).toLocaleString()}
                                                </td>

                                                <td className="px-6 py-4">
                                                    Rs {Number(
                                                        invoice.balance_due
                                                    ).toLocaleString()}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {invoice.status}
                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* ── EXPENSE RECORDS ── */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Receipt size={13} className="text-blue-600" />
                                </div>
                                <h2 className="text-base font-bold text-slate-800">Expense Records</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                {expenses.length} items
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Category", "Description", "Amount", "Date"].map((h) => (
                                            <th
                                                key={h}
                                                className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-slate-400 text-sm">
                                                No expense records found
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((expense, i) => (
                                            <tr
                                                key={expense.id}
                                                className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                                                    }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {expense.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                    Rs {Number(expense.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {new Date(expense.created_at).toLocaleDateString("en-US", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {expenses.length > 0 && (
                            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <div className="text-sm">
                                    <span className="text-slate-400 font-medium">Total Expenses:</span>{" "}
                                    <span className="font-black text-slate-900 text-base">
                                        Rs{" "}
                                        {Number(
                                            expenses.reduce((s, e) => s + Number(e.amount), 0)
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER STAMP */}
                    <div className="flex items-center justify-center gap-4 pt-4 opacity-40">
                        <div className="h-px flex-1 bg-slate-300" />
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Film size={11} />
                            Confidential Production Document
                        </div>
                        <div className="h-px flex-1 bg-slate-300" />
                    </div>

                </div>
            </div>
        </Layout>
    );
}

/* ── SUB-COMPONENTS ── */

function MetricCard({ label, value, icon: Icon, accent, positive }) {
    const accents = {
        blue: {
            bg: "bg-blue-600",
            light: "bg-blue-50",
            text: "text-blue-600",
            border: "border-blue-100",
        },
        slate: {
            bg: "bg-slate-600",
            light: "bg-slate-50",
            text: "text-slate-600",
            border: "border-slate-100",
        },
        emerald: {
            bg: "bg-emerald-600",
            light: "bg-emerald-50",
            text: "text-emerald-600",
            border: "border-emerald-100",
        },
    };

    const a = accents[accent] || accents.blue;
    const isNegative = positive === false;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <div className={`w-9 h-9 rounded-xl ${a.light} flex items-center justify-center`}>
                    <Icon size={15} className={a.text} />
                </div>
            </div>
            <p
                className={`text-3xl font-black tracking-tight ${isNegative ? "text-red-600" : "text-slate-900"
                    }`}
            >
                Rs {Number(value || 0).toLocaleString()}
            </p>
        </div>
    );
}

function MarginCard({ margin }) {
    const isPositive = Number(margin) >= 0;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Profit Margin</p>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp size={15} className="text-blue-600" />
                </div>
            </div>
            <p className={`text-3xl font-black tracking-tight ${isPositive ? "text-slate-900" : "text-red-600"}`}>
                {margin}%
            </p>
        </div>
    );
}

function CostBar({ label, amount, pct, color, icon: Icon }) {
    const colors = {
        blue: {
            bar: "bg-blue-500",
            track: "bg-blue-100",
            text: "text-blue-600",
            icon: "bg-blue-50",
        },
        indigo: {
            bar: "bg-indigo-500",
            track: "bg-indigo-100",
            text: "text-indigo-600",
            icon: "bg-indigo-50",
        },
        sky: {
            bar: "bg-sky-500",
            track: "bg-sky-100",
            text: "text-sky-600",
            icon: "bg-sky-50",
        },
    };

    const c = colors[color] || colors.blue;

    return (
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg ${c.icon} flex items-center justify-center`}>
                    <Icon size={13} className={c.text} />
                </div>
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className={`ml-auto text-sm font-black ${c.text}`}>{pct}%</span>
            </div>
            <div className={`h-2 rounded-full ${c.track} overflow-hidden mb-3`}>
                <div
                    className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xl font-black text-slate-900">
                Rs {Number(amount).toLocaleString()}
            </p>
        </div>
    );
}

function SectionTable({ rows, columns, activeDays }) {
    if (!rows?.length) {
        return (
            <div className="py-12 text-center text-slate-400 text-sm">
                No records found
            </div>
        );
    }

    const colLabels = {
        name: "Name",
        position: "Position",
        description: "Description",
        quantity: "Quantity",
        amount: "Amount",
        category: "Category",
    };

    return (
        <table className="w-full">
            <thead>
                <tr className="border-b border-slate-100">
                    <td className="px-6 py-2" />
                    {columns.map((col) => (
                        <th
                            key={col}
                            className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400"
                        >
                            {colLabels[col] || col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr
                        key={i}
                        className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                            }`}
                    >
                        <td className="px-6 py-4 text-slate-300 text-xs font-bold w-10">
                            {String(i + 1).padStart(2, "0")}
                        </td>
                        {columns.map((col) => (
                            <td key={col} className="px-6 py-4 text-sm text-slate-700">
                                {col === "amount" ? (
                                    <span className="font-black text-slate-900">
                                        Rs{" "}
                                        {Number(
                                            row.rate ? row.rate * activeDays : row[col]
                                        ).toLocaleString()}
                                    </span>
                                ) : (
                                    row[col]
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={columns.length} className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                        Subtotal
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600">
                        Rs{" "}
                        {Number(
                            rows.reduce(
                                (sum, r) =>
                                    sum + Number(r.rate ? r.rate * activeDays : r.amount || 0),
                                0
                            )
                        ).toLocaleString()}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}