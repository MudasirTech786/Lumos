"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import toast from "react-hot-toast";
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
} from "lucide-react";

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

export default function ShootDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [shoot, setShoot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchShoot = async () => {
    try {
      const res = await api.get(`/shoots/${params.id}`);
      setShoot(res.data);
    } catch {
      toast.error("Failed to load shoot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (params.id) fetchShoot(); }, [params.id]);

  const updateStatus = async (status) => {
    try {
      setStatusLoading(true);
      await api.patch(`/shoots/${shoot.id}/status`, { status });
      setShoot((prev) => ({ ...prev, status }));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
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

  return (
    <Layout>
      <div className="mx-auto max-w-6xl pb-32 px-4 sm:px-6">

        {/* ── BACK ─────────────────────────────────── */}
       

        {/* ── HERO ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white mb-6 shadow-sm">
          <div className={`h-[3px] ${cfg.bar}`} />

          <div className="px-7 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

              {/* left */}
              <div className="flex items-start gap-5 mt-2">
                <div className="flex h-14 w-14 mt-4 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-500">
                  <Clapperboard size={24} />
                </div>
                <div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize tracking-wide ${cfg.pill}`}>
                    <span className={`h-2 w-2 rounded-full ${cfg.dot} `} />
                    {shoot.status}
                  </span>
                  <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {shoot.title}
                  </h1>
                  <p className="mt-1 text-base text-gray-500">{cfg.label}</p>
                </div>
              </div>

              {/* right */}
              <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">

                {/* Status Selector */}
                <div className="relative">
                  <select
                    value={shoot.status}
                    disabled={statusLoading}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="
        appearance-none
        rounded-2xl
        border-2 border-blue-200
        bg-white
        px-5 py-3
        pr-12
        text-sm
        font-bold
        uppercase
        tracking-wide
        text-blue-700
        shadow-sm
        hover:border-blue-700
        focus:border-blue-700
        focus:ring-4 focus:ring-blue-100
        outline-none
        transition
        cursor-pointer
      "
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <span className="
      pointer-events-none
      absolute right-4 top-1/2
      -translate-y-1/2
      rounded-full
      bg-blue-600
      px-2 py-1
      text-[10px]
      text-white
    ">
                    ▼
                  </span>
                </div>

                {statusLoading && (
                  <p className="text-xs font-semibold text-blue-600">
                    Updating...
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">

                  <Link
                    href={`/dashboard/shoots/${shoot.id}/crew`}
                    className="
        inline-flex items-center gap-2
        rounded-2xl
        bg-blue-600
        px-5 py-3
        text-sm font-semibold
        text-white
        shadow-md
        hover:bg-blue-900
        transition-all
      "
                  >
                    <Users size={16} />
                    Crew
                  </Link>

                  <Link
                    href={`/dashboard/shoots/${shoot.id}/logistics`}
                    className="
        inline-flex items-center gap-2
        rounded-2xl
        bg-blue-600
        px-5 py-3
        text-sm font-semibold
        text-white
        shadow-md
        hover:bg-blue-900
        transition-all
      "
                  >
                    <Truck size={16} />
                    Logistics
                  </Link>

                  <Link
                    href={`/dashboard/shoots/${shoot.id}/inventory`}
                    className="
        inline-flex items-center gap-2
        rounded-2xl
        bg-blue-600
        px-5 py-3
        text-sm font-semibold
        text-white
        shadow-md
        hover:bg-blue-900
        transition-all
      "
                  >
                    <Package size={16} />
                    Inventory
                  </Link>

                </div>
              </div>
            </div>

            {/* meta badges row */}
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
            <Panel
              title="Transport & Logistics"
              count={shoot.logistics?.length}
              action={<PanelLink href={`/dashboard/shoots/${shoot.id}/logistics`} />}
            >
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
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {item.vehicle || "Unnamed Vehicle"}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          {item.driver_name && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Users size={12} />{item.driver_name}
                            </span>
                          )}
                          {item.pickup_location && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <MapPin size={12} />{item.pickup_location}
                            </span>
                          )}
                          {item.pickup_time && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Clock3 size={12} />{new Date(item.pickup_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
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
            <Panel
              title="Inventory Allocation"
              count={shoot.inventory_usages?.length}
              action={<PanelLink href={`/dashboard/shoots/${shoot.id}/inventory`} />}
            >
              {!shoot.inventory_usages || shoot.inventory_usages.length === 0 ? (
                <Empty icon={<Package size={24} />} text="No inventory allocated" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {shoot.inventory_usages.map((usage) => (
                    <div key={usage.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                        <Package size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-gray-900 truncate">{usage.item?.name}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          {usage.item?.sku && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Hash size={12} />{usage.item.sku}
                            </span>
                          )}
                          <span className="text-sm text-gray-400">
                            Qty: <span className="font-semibold text-gray-600">{usage.quantity}</span>
                          </span>
                          {usage.returned_quantity > 0 && (
                            <span className="text-sm text-gray-400">
                              Returned: <span className="font-semibold text-gray-600">{usage.returned_quantity}</span>
                            </span>
                          )}
                          {usage.lost_quantity > 0 && (
                            <span className="text-sm text-rose-400">
                              Lost: <span className="font-semibold">{usage.lost_quantity}</span>
                            </span>
                          )}
                          {usage.assigned_user?.name && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Users size={12} />{usage.assigned_user.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${INVENTORY_STATUS[usage.status] || "bg-gray-100 text-gray-500"}`}>
                        {usage.status?.replaceAll("_", " ")}
                      </span>
                    </div>
                  ))}
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
            <Panel
              title="Crew Members"
              count={crewCount}
              action={<PanelLink href={`/dashboard/shoots/${shoot.id}/crew`} />}
            >
              {crew.length === 0 ? (
                <Empty icon={<Users size={24} />} text="No crew assigned" />
              ) : (
                <div className="space-y-3">
                  {crew.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                        {member.profile_photo ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${member.profile_photo}`}
                            className="h-full w-full object-cover"
                            alt={member.name}
                          />
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

            {/* QUICK ACTIONS */}
            <Panel title="Quick Actions">
              <div className="space-y-1">
                {[
                  { label: "Manage Crew", href: `/dashboard/shoots/${shoot.id}/crew`, icon: <Users size={15} /> },
                  { label: "Manage Logistics", href: `/dashboard/shoots/${shoot.id}/logistics`, icon: <Truck size={15} /> },
                  { label: "Manage Inventory", href: `/dashboard/shoots/${shoot.id}/inventory`, icon: <Package size={15} /> },
                ].map(({ label, href, icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                  >
                    <span className="flex items-center gap-2.5">{icon}{label}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </Panel>

          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── COMPONENTS ───────────────────────────────── */

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