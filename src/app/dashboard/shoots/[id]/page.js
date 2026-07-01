"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Truck,
  Clock3,
  ChevronRight,
  Film,
  Car,
  Package,
  Clapperboard,
  ArrowUpRight,
  Hash,
  Receipt,
  Plus,
  X,
  Tag,
  FileText,
  DollarSign,
  TrendingUp,
  Layers,
  ScanLine,
  ShieldCheck
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
const STATUS_OPTIONS = ["planned", "scheduled", "active", "completed", "cancelled"];

const STATUS_CONFIG = {
  planned: { bar: "bg-slate-300", dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600", label: "Waiting to be scheduled" },
  scheduled: { bar: "bg-blue-500", dot: "bg-blue-500", pill: "bg-blue-50 text-blue-700", label: "Ready for production" },
  active: { bar: "bg-emerald-500", dot: "bg-emerald-500 animate-pulse", pill: "bg-emerald-50 text-emerald-700", label: "Production in progress" },
  completed: { bar: "bg-violet-500", dot: "bg-violet-500", pill: "bg-violet-50 text-violet-700", label: "Production completed" },
  cancelled: { bar: "bg-rose-400", dot: "bg-rose-400", pill: "bg-rose-50 text-rose-600", label: "Production cancelled" },
};

const TRANSPORT_STATUS = {
  pending: "bg-slate-100 text-slate-600",
  ready: "bg-violet-100 text-violet-700",
  in_transit: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  delayed: "bg-rose-100 text-rose-600",
};

const INVENTORY_STATUS = {
  reserved: "bg-amber-100 text-amber-700",
  checked_out: "bg-blue-100 text-blue-700",
  partially_returned: "bg-orange-100 text-orange-700",
  returned: "bg-emerald-100 text-emerald-700",
};

// Category color map for expense badges
const CATEGORY_COLORS = {
  fuel: "bg-orange-50 text-orange-600 border-orange-100",
  food: "bg-amber-50 text-amber-600 border-amber-100",
  accommodation: "bg-violet-50 text-violet-600 border-violet-100",
  transport: "bg-blue-50 text-blue-600 border-blue-100",
  equipment: "bg-cyan-50 text-cyan-600 border-cyan-100",
  misc: "bg-gray-100 text-gray-500 border-gray-200",
};

function getCategoryColor(cat) {
  if (!cat) return CATEGORY_COLORS.misc;
  const key = cat.toLowerCase();
  return CATEGORY_COLORS[key] || "bg-blue-50 text-blue-600 border-blue-100";
}

export default function ShootDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [shoot, setShoot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const expenses = shoot?.expenses || [];

  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    amount: "",
  });

  const fetchShoot = async () => {
    try {
      const res = await api.get(`/shoots/${params.id}`);
      setShoot(res.data);
    } catch {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load shoot" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (params.id) fetchShoot(); }, [params.id]);

  const updateStatus = async (status) => {
    setStatusLoading(true);
    const pToastId = progressToast.loading({ title: "Updating...", message: "Updating status..." });
    try {
      await api.patch(`/shoots/${shoot.id}/status`, { status });
      setShoot((prev) => ({ ...prev, status }));
      progressToast.success(pToastId, { title: "Updated", message: "Status updated" });
    } catch {
      progressToast.error(pToastId, { title: "Error", message: "Failed to update status" });
    } finally {
      setStatusLoading(false);
    }
  };

  const createExpense = async () => {
    const pToastId = progressToast.loading({ title: "Adding...", message: "Adding expense..." });
    try {
      await api.post("/shoot-expenses", {
        shoot_id: shoot.id,
        category: expenseForm.category,
        description: expenseForm.description,
        amount: expenseForm.amount,
      });
      progressToast.success(pToastId, { title: "Added", message: "Expense added" });
      setShowExpenseModal(false);
      setExpenseForm({ category: "", description: "", amount: "" });
      await fetchShoot();
    } catch (error) {
      console.error(error);
      progressToast.error(pToastId, { title: "Error", message: error?.response?.data?.message || "Failed to add expense" });
    }
  };

  const crewCount = useMemo(
    () => shoot?.crew_members?.length || shoot?.crewMembers?.length || 0,
    [shoot]
  );

  if (loading) return <Layout><div className="py-24 text-center text-gray-400">Loading shoot...</div></Layout>;
  if (!shoot) return <Layout><div className="py-24 text-center text-gray-400">Shoot not found</div></Layout>;

  const cfg = STATUS_CONFIG[shoot.status] || STATUS_CONFIG.planned;
  const crew = shoot.crew_members || shoot.crewMembers || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl pb-32 px-4 sm:px-6">

        {/* ── HERO ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white mb-6 shadow-sm">
          <div className={`h-[3px] ${cfg.bar}`} />
          <div className="px-7 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-5 mt-2">
                <div className="flex h-14 w-14 mt-4 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-500">
                  <Clapperboard size={24} />
                </div>
                <div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize tracking-wide ${cfg.pill}`}>
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    {shoot.status}
                  </span>
                  <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {shoot.title}
                  </h1>
                  <p className="mt-1 text-base text-gray-500">{cfg.label}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                <div className="relative">
                  <select
                    value={shoot.status}
                    disabled={statusLoading}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="appearance-none rounded-2xl border-2 border-blue-200 bg-white px-5 py-3 pr-12 text-sm font-bold uppercase tracking-wide text-blue-700 shadow-sm hover:border-blue-700 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 outline-none transition cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-2 py-1 text-[10px] text-white">▼</span>
                </div>
                {statusLoading && <p className="text-xs font-semibold text-blue-600">Updating...</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/dashboard/shoots/${shoot.id}/crew`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-900 transition-all">
                    <Users size={16} /> Crew
                  </Link>
                  <Link href={`/dashboard/shoots/${shoot.id}/logistics`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-900 transition-all">
                    <Truck size={16} /> Logistics
                  </Link>
                  <Link href={`/dashboard/shoots/${shoot.id}/inventory`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-900 transition-all">
                    <Package size={16} /> Inventory
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 mb-2">
              <MetaBadge icon={<MapPin size={13} />} text={shoot.location || "No location"} />
              <MetaBadge icon={<CalendarDays size={13} />} text={shoot.start_datetime ? new Date(shoot.start_datetime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Not scheduled"} />
              <MetaBadge icon={<Film size={13} />} text={shoot.client_name || "No client"} />
              <MetaBadge icon={<Users size={13} />} text={`${crewCount} crew member${crewCount !== 1 ? "s" : ""}`} />
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* ── LEFT 2/3 ── */}
          <div className="space-y-5 lg:col-span-2">

            {/* TRANSPORT */}
            <Panel title="Transport & Logistics" count={shoot.logistics?.length} action={<PanelLink href={`/dashboard/shoots/${shoot.id}/logistics`} />}>
              {!shoot.logistics || shoot.logistics.length === 0 ? (
                <Empty icon={<Truck size={24} />} text="No transport added yet" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {shoot.logistics.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                        <Car size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-gray-900 truncate">{item.vehicle || "Unnamed Vehicle"}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          {item.driver_name && <span className="flex items-center gap-1.5 text-sm text-gray-400"><Users size={12} />{item.driver_name}</span>}
                          {item.pickup_location && <span className="flex items-center gap-1.5 text-sm text-gray-400"><MapPin size={12} />{item.pickup_location}</span>}
                          {item.pickup_time && <span className="flex items-center gap-1.5 text-sm text-gray-400"><Clock3 size={12} />{new Date(item.pickup_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${TRANSPORT_STATUS[item.status] || "bg-gray-100 text-gray-500"}`}>
                        {item.status?.replaceAll("_", " ") || "pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* INVENTORY */}
           {/* ── INVENTORY ALLOCATION PANEL ──────────────────────────────────────
    Drop-in replacement for the Panel in ShootDetailsPage.
    Requires: QRCodeSVG from "qrcode.react", ScanLine from "lucide-react"
    Add these to your existing imports at the top of ShootDetailsPage.jsx:
      import { QRCodeSVG } from "qrcode.react";
      import { ScanLine, ShieldCheck } from "lucide-react";
─────────────────────────────────────────────────────────────────── */}

<Panel
  title="Inventory Allocation"
  count={shoot.inventory_usages?.length}
  action={<PanelLink href={`/dashboard/shoots/${shoot.id}/inventory`} />}
>
  {!shoot.inventory_usages || shoot.inventory_usages.length === 0 ? (
    <Empty icon={<Package size={24} />} text="No inventory allocated" />
  ) : (
    <div className="space-y-3">
      {shoot.inventory_usages.map((usage) => {

        const hasAsset = !!usage.asset;

        const statusStyle = {
          reserved:           "bg-amber-50  text-amber-700  border-amber-200",
          checked_out:        "bg-blue-50   text-blue-700   border-blue-200",
          partially_returned: "bg-orange-50 text-orange-700 border-orange-200",
          returned:           "bg-emerald-50 text-emerald-700 border-emerald-200",
        }[usage.status] ?? "bg-slate-100 text-slate-500 border-slate-200";

        return (
          <div
            key={usage.id}
            className={[
              "rounded-2xl border overflow-hidden transition-all",
              hasAsset
                ? "border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40"
                : "border-slate-100 bg-white",
            ].join(" ")}
          >
            {/* top accent for QR assets */}
            {hasAsset && (
              <div className="h-[2px] bg-gradient-to-r from-blue-500 to-indigo-400" />
            )}

            <div className="p-4">
              <div className="flex items-start gap-4">

                {/* icon */}
                <div className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  hasAsset
                    ? "bg-blue-100 text-blue-600"
                    : "bg-violet-50 text-violet-500",
                ].join(" ")}>
                  {hasAsset
                    ? <ScanLine size={17} />
                    : <Package size={17} />
                  }
                </div>

                {/* main content */}
                <div className="flex-1 min-w-0">

                  {/* item name + status */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                      {usage.item?.name}
                    </p>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusStyle}`}>
                      {usage.status?.replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* meta row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {usage.item?.sku && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Hash size={10} /> {usage.item.sku}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Qty: <span className="font-semibold text-gray-600">{usage.quantity}</span>
                    </span>
                    {usage.returned_quantity > 0 && (
                      <span className="text-xs text-gray-400">
                        Returned: <span className="font-semibold text-gray-600">{usage.returned_quantity}</span>
                      </span>
                    )}
                    {usage.lost_quantity > 0 && (
                      <span className="text-xs text-rose-500 font-semibold">
                        Lost: {usage.lost_quantity}
                      </span>
                    )}
                    {usage.assigned_user?.name && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={10} /> {usage.assigned_user.name}
                      </span>
                    )}
                  </div>

                  {/* ── QR ASSET BLOCK ── */}
                  {hasAsset && (
                    <div className="mt-3 flex items-center gap-4 rounded-xl border border-blue-200 bg-white px-3 py-2.5">

                      {/* QR code */}
                      <div className="shrink-0 bg-white border border-slate-100 rounded-lg p-1.5 shadow-sm">
                        <QRCodeSVG
                          value={usage.asset.qr_uuid}
                          size={52}
                          level="M"
                          includeMargin={false}
                        />
                      </div>

                      {/* asset info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShieldCheck size={11} className="text-blue-500 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                            QR Asset
                          </span>
                        </div>
                        <p className="text-sm font-black text-gray-900 font-mono tracking-tight">
                          {usage.asset.asset_code}
                        </p>
                        {usage.asset.serial_number && (
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                            SN: {usage.asset.serial_number}
                          </p>
                        )}
                        <p className="text-[9px] font-mono text-gray-300 mt-0.5 truncate">
                          {usage.asset.qr_uuid}
                        </p>
                      </div>

                      {/* asset status badge */}
                      <div className="shrink-0 text-right">
                        <span className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize",
                          {
                            available:    "bg-emerald-50 text-emerald-700 border-emerald-200",
                            in_use:       "bg-blue-50    text-blue-700    border-blue-200",
                            returned:     "bg-slate-100  text-slate-600   border-slate-200",
                            damaged:      "bg-rose-50    text-rose-700    border-rose-200",
                            under_repair: "bg-amber-50   text-amber-700   border-amber-200",
                          }[usage.asset.status] ?? "bg-slate-100 text-slate-500 border-slate-200"
                        ].join(" ")}>
                          {usage.asset.status?.replaceAll("_", " ") || "—"}
                        </span>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</Panel>

            {/* ── OTHER EXPENSES (redesigned) ── */}
            <Panel
              title="Other Expenses"
              count={expenses.length}
              action={
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus size={13} /> Add Expense
                </button>
              }
            >
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 text-gray-300 mb-4">
                    <Receipt size={26} />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">No expenses recorded yet</p>
                  <p className="text-xs text-gray-300 mt-1">Click "Add Expense" to get started</p>
                </div>
              ) : (
                <div>
                  {/* Summary bar */}
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-5 py-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Total Spent</p>
                        <p className="text-xl font-black text-blue-700">
                          Rs {totalExpenses.toLocaleString("en-PK")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-400 font-medium">{expenses.length} record{expenses.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Expense rows */}
                  <div className="space-y-2">
                    {expenses.map((expense, idx) => (
                      <div
                        key={expense.id}
                        className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3.5 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                      >
                        {/* Index number */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                          {String(idx + 1).padStart(2, "0")}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${getCategoryColor(expense.category)}`}>
                              <Tag size={9} />
                              {expense.category || "Misc"}
                            </span>
                            {expense.created_at && (
                              <span className="text-xs text-gray-300">
                                {new Date(expense.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                            {expense.description || "No description"}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="shrink-0 text-right">
                          <p className="text-base font-black text-gray-900">
                            Rs {Number(expense.amount || 0).toLocaleString("en-PK")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider + Total row */}
                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 px-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <Layers size={14} /> Grand Total
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      Rs {totalExpenses.toLocaleString("en-PK")}
                    </span>
                  </div>
                </div>
              )}
            </Panel>

            {/* NOTES */}
            <Panel title="Notes">
              <p className="text-base leading-relaxed text-gray-600">
                {shoot.notes || <span className="italic text-gray-400">No notes added yet.</span>}
              </p>
            </Panel>
          </div>

          {/* ── RIGHT 1/3 ── */}
          <div className="space-y-5">

            {/* CREW */}
            <Panel title="Crew Members" count={crewCount} action={<PanelLink href={`/dashboard/shoots/${shoot.id}/crew`} />}>
              {crew.length === 0 ? (
                <Empty icon={<Users size={24} />} text="No crew assigned" />
              ) : (
                <div className="space-y-3">
                  {crew.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                        {member.profile_photo ? (
                          <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${member.profile_photo}`} className="h-full w-full object-cover" alt={member.name} />
                        ) : member.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="truncate text-xs text-gray-400">{member.designation || "Crew Member"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Expense Summary" count={expenses.length}>
              <div className="space-y-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-600">Total Expenses</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    Rs {totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {expenses.length} expense record{expenses.length !== 1 ? "s" : ""}
                </div>
              </div>
            </Panel>

            {/* QUICK ACTIONS */}
            <Panel title="Quick Actions">
              <div className="space-y-1">
                {[
                  { label: "Manage Crew", href: `/dashboard/shoots/${shoot.id}/crew`, icon: <Users size={15} /> },
                  { label: "Manage Logistics", href: `/dashboard/shoots/${shoot.id}/logistics`, icon: <Truck size={15} /> },
                  { label: "Manage Inventory", href: `/dashboard/shoots/${shoot.id}/inventory`, icon: <Package size={15} /> },
                ].map(({ label, href, icon }, index) => (
                  <Link key={`${label}-${index}`} href={href} className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                    <span className="flex items-center gap-2.5">{icon}{label}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="mt-2 flex w-full items-center justify-between rounded-xl bg-blue-50 px-3.5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <span className="flex items-center gap-2.5"><Receipt size={15} /> Add Other Expense</span>
                  <Plus size={14} />
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseModal
          form={expenseForm}
          setForm={setExpenseForm}
          onSubmit={createExpense}
          onClose={() => setShowExpenseModal(false)}
        />
      )}
    </Layout>
  );
}

/* ── EXPENSE MODAL (redesigned) ─────────────────── */

const EXPENSE_CATEGORIES = [
  "Fuel", "Food", "Accommodation", "Transport",
  "Equipment", "Labour", "Communication", "Misc",
];

function ExpenseModal({ form, setForm, onSubmit, onClose }) {
  const isValid = form.category && form.amount && Number(form.amount) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 64px -12px rgba(0,0,0,0.25)" }}
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Add Expense</h2>
              <p className="text-xs text-gray-400">Record a production cost</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">

          {/* Category grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`
                    rounded-xl border py-2 px-1 text-xs font-semibold text-center transition-all
                    ${form.category === cat
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText size={14} className="absolute left-3.5 top-3.5 text-gray-300 pointer-events-none" />
              <textarea
                placeholder="What was this expense for?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Amount (Rs)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">Rs</span>
              <input
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          {/* Preview pill */}
          {form.category && form.amount && (
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-4 py-3">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${getCategoryColor(form.category)}`}>
                {form.category}
              </span>
              <span className="text-base font-black text-blue-700">
                Rs {Number(form.amount || 0).toLocaleString("en-PK")}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className={`
              inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all
              ${isValid
                ? "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            <Plus size={14} />
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SHARED COMPONENTS ───────────────────────────── */

function Panel({ title, count, action, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{title}</h2>
          {count != null && count > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">{count}</span>
          )}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function PanelLink({ href }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-wide">
      Open <ArrowUpRight size={12} />
    </Link>
  );
}

function MetaBadge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-medium text-gray-500">
      <span className="text-gray-400">{icon}</span>
      {text}
    </span>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="text-gray-200">{icon}</span>
      <p className="mt-3 text-sm font-medium text-gray-400">{text}</p>
    </div>
  );
}