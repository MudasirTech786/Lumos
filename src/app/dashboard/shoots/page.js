"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import Link from "next/link";

import toast from "react-hot-toast";

import {
  Briefcase,
  CalendarDays,
  Users,
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  Activity,
  Film,
  Clock3,
  Sparkles,
} from "lucide-react";

export default function ShootsPage() {

  const [shoots, setShoots] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH PRODUCTIONS
  |--------------------------------------------------------------------------
  */

  const fetchShoots = async () => {

    try {

      const res =
        await api.get("/shoots");

      setShoots(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );

    } catch {

      toast.error(
        "Failed to load productions"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchShoots();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteShoot = async (id) => {

    const confirmDelete =
      confirm(
        "Delete this production?"
      );

    if (!confirmDelete) return;

    try {

      await api.delete(
        `/shoots/${id}`
      );

      toast.success(
        "Production deleted"
      );

      fetchShoots();

    } catch {

      toast.error(
        "Delete failed"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {

    const active =
      shoots.filter(
        (s) =>
          s.status === "active"
      ).length;

    const planned =
      shoots.filter(
        (s) =>
          s.status === "planned"
      ).length;

    const completed =
      shoots.filter(
        (s) =>
          s.status === "completed"
      ).length;

    return {
      total: shoots.length,
      active,
      planned,
      completed,
    };

  }, [shoots]);

  return (

    <Layout>

      <div className="space-y-7 pb-24">

        {/* ===================================================== */}
        {/* TOP HEADER */}
        {/* ===================================================== */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          <div>

            <div className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-100
              bg-blue-50
              px-4
              py-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-blue-700
            ">

              <Sparkles size={12} />

              Production Operations

            </div>

            <h1 className="
              mt-4
              text-4xl
              md:text-5xl
              font-black
              tracking-[-0.06em]
              text-gray-900
            ">

              Production Control Center

            </h1>

            <p className="
              mt-4
              max-w-3xl
              text-base
              leading-relaxed
              text-gray-500
            ">

              Manage production workflows, crew operations,
              schedules, locations and field execution
              from a centralized command system.

            </p>

          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/dashboard/shoots/crew"
              className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-blue-100
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-gray-700
                hover:border-blue-200
                hover:bg-blue-50
                transition-all
              "
            >

              <Users size={18} />

              Crew Assignments

            </Link>

            <Link
              href="/dashboard/shoots/create"
              className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-blue-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_40px_rgba(37,99,235,0.28)]
                hover:bg-blue-700
                transition-all
              "
            >

              <Plus size={18} />

              New Production

            </Link>

          </div>

        </div>

        {/* ===================================================== */}
        {/* HERO */}
        {/* ===================================================== */}


        <div className="
  relative
  overflow-hidden
  rounded-[36px]
  border
  border-blue-200/20
  bg-gradient-to-br
  from-[#071120]
  via-[#0f3ba8]
  to-[#2563eb]
  p-6
  shadow-[0_25px_120px_rgba(37,99,235,0.25)]
">

          {/* ===================================================== */}
          {/* BACKGROUND LIGHT */}
          {/* ===================================================== */}

          <div className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.10),transparent_30%)]
  " />

          {/* GRID */}

          <div className="
    absolute
    inset-0
    opacity-[0.05]
    [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
    [background-size:42px_42px]
  " />

          {/* GLOW */}

          <div className="
    absolute
    top-[-120px]
    right-[-100px]
    h-[320px]
    w-[320px]
    rounded-full
    bg-cyan-300/20
    blur-[120px]
  " />

          <div className="
    absolute
    bottom-[-140px]
    left-[-100px]
    h-[280px]
    w-[280px]
    rounded-full
    bg-blue-500/20
    blur-[120px]
  " />

          {/* ===================================================== */}
          {/* CONTENT */}
          {/* ===================================================== */}

          <div className="
    relative
    z-10
  ">

            {/* TOP BAR */}

            <div className="
      mb-6
      flex
      items-center
      justify-between
    ">
            </div>

            {/* METRICS GRID */}

            <div className="
      grid
      grid-cols-2
      gap-5
      xl:grid-cols-4
    ">

              <MetricCard
                title="Total Productions"
                value={stats.total}
                glow="blue"
              />

              <MetricCard
                title="Active Shoots"
                value={stats.active}
                glow="cyan"
              />

              <MetricCard
                title="Planned"
                value={stats.planned}
                glow="violet"
              />

              <MetricCard
                title="Completed"
                value={stats.completed}
                glow="emerald"
              />

            </div>

          </div>

        </div>


        {/* ===================================================== */}
        {/* PRODUCTIONS */}
        {/* ===================================================== */}

        <div className="
  overflow-hidden
  rounded-[36px]
  border
  border-blue-100/70
  bg-white/70
  backdrop-blur-2xl
  shadow-[0_20px_80px_rgba(37,99,235,0.06)]
">

          {/* ===================================================== */}
          {/* HEADER */}
          {/* ===================================================== */}

          <div className="
    flex
    flex-col
    gap-5
    border-b
    border-blue-100/70
    px-6
    py-5
    lg:flex-row
    lg:items-center
    lg:justify-between
  ">

            {/* LEFT */}

            <div>

              <h3 className="
        text-2xl
        font-black
        tracking-[-0.05em]
        text-slate-900
      ">

                Active Productions

              </h3>

              <p className="
        mt-1
        text-sm
        text-slate-500
      ">

                Centralized operational overview

              </p>

            </div>

            {/* RIGHT */}

            <div className="
      flex
      flex-col
      gap-3
      lg:flex-row
      lg:items-center
    ">

              {/* SEARCH */}

              <div className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-blue-100
        bg-white/80
        px-4
        py-3
        backdrop-blur-xl
      ">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search productions..."
                  className="
            bg-transparent
            text-sm
            text-slate-700
            outline-none
            placeholder:text-slate-400
          "
                />

              </div>

              {/* COUNT */}

              <div className="
        inline-flex
        items-center
        gap-2
        rounded-2xl
        border
        border-blue-100
        bg-blue-50
        px-4
        py-3
        text-sm
        font-semibold
        text-blue-700
      ">

                <Clock3 size={16} />

                {shoots.length} Productions

              </div>

            </div>

          </div>

          {/* ===================================================== */}
          {/* CONTENT */}
          {/* ===================================================== */}

          {loading ? (

            <div className="
      py-24
      text-center
      text-slate-500
    ">

              Loading productions...

            </div>

          ) : shoots.length === 0 ? (

            <EmptyState />

          ) : (

            <div className="p-4">

              <div className="space-y-3">

                {shoots.map((shoot) => (

                  <div
                    key={shoot.id}
                    className="
              group
              flex
              flex-col
              gap-5
              rounded-[28px]
              border
              border-blue-100
              bg-white/80
              p-5
              transition-all
              hover:border-blue-200
              hover:shadow-[0_0_45px_rgba(59,130,246,0.14)]
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
                  >

                    {/* ===================================================== */}
                    {/* LEFT */}
                    {/* ===================================================== */}

                    <div className="
              flex
              flex-1
              flex-col
              gap-5
              xl:flex-row
              xl:items-center
            ">

                      {/* STATUS */}

                      <div className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                px-3
                py-1.5
                text-[11px]
                font-bold
                uppercase
                tracking-wide

                ${shoot.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : shoot.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }
              `}>

                        <div className="
                  h-2
                  w-2
                  rounded-full
                  bg-current
                  animate-pulse
                " />

                        {shoot.status || "planned"}

                      </div>

                      {/* TITLE */}

                      <div className="min-w-[240px]">

                        <h3 className="
                  text-lg
                  font-bold
                  tracking-[-0.03em]
                  text-slate-900
                ">

                          {shoot.title}

                        </h3>

                        <p className="
                  mt-1
                  text-sm
                  text-slate-500
                ">

                          Production #{shoot.id}

                        </p>

                      </div>

                      {/* META */}

                      <RowInfo
                        icon={<Briefcase size={15} />}
                        label={
                          shoot.client_name ||
                          "No client"
                        }
                      />

                      <RowInfo
                        icon={<MapPin size={15} />}
                        label={
                          shoot.location ||
                          "No location"
                        }
                      />

                      <RowInfo
                        icon={<CalendarDays size={15} />}
                        label={
                          shoot.shoot_date ||
                          "No date"
                        }
                      />

                    </div>

                    {/* ===================================================== */}
                    {/* ACTIONS */}
                    {/* ===================================================== */}

                    <div className="
              flex
              items-center
              gap-3
            ">

                      <Link
                        href={`/dashboard/shoots/${shoot.id}`}
                        className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-blue-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_10px_30px_rgba(37,99,235,0.28)]
                  transition-all
                  hover:bg-blue-700
                  hover:shadow-[0_0_45px_rgba(59,130,246,0.35)]
                "
                      >

                        Open

                        <ChevronRight
                          size={16}
                          className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                        />

                      </Link>

                      <button
                        onClick={() =>
                          deleteShoot(shoot.id)
                        }
                        className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50
                  text-red-500
                  transition-all
                  hover:bg-red-100
                "
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>


      </div>

    </Layout>
  );
}

/* ========================================================= */
/* HERO PILL */
/* ========================================================= */

function HeroPill({
  icon,
  label,
}) {

  return (

    <div className="
      inline-flex
      items-center
      gap-2
      rounded-2xl
      border
      border-white/10
      bg-white/10
      px-4
      py-3
      text-sm
      font-medium
      text-white
    ">

      {icon}

      {label}

    </div>
  );
}

/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({
  title,
  value,
}) {

  return (

    <div className="
      rounded-3xl
      border
      border-white/10
      bg-black/10
      p-5
    ">

      <p className="
        text-xs
        uppercase
        tracking-[0.18em]
        text-blue-100/60
      ">
        {title}
      </p>

      <h3 className="
        mt-3
        text-4xl
        font-black
        tracking-[-0.05em]
        text-white
      ">
        {value}
      </h3>

    </div>
  );
}

/* ========================================================= */
/* INFO */
/* ========================================================= */

function InfoRow({
  icon,
  label,
}) {

  return (

    <div className="
      flex
      items-center
      gap-3
      text-sm
      text-gray-600
    ">

      <div className="
        w-10
        h-10
        rounded-2xl
        bg-blue-50
        flex
        items-center
        justify-center
        text-blue-600
      ">
        {icon}
      </div>

      <span className="font-medium">
        {label}
      </span>

    </div>
  );
}

/* ========================================================= */
/* EMPTY */
/* ========================================================= */

function EmptyState() {

  return (

    <div className="
      py-28
      flex
      flex-col
      items-center
      justify-center
      text-center
    ">

      <div className="
        w-24
        h-24
        rounded-[32px]
        bg-blue-50
        border
        border-blue-100
        flex
        items-center
        justify-center
        text-blue-600
      ">

        <Film size={40} />

      </div>

      <h3 className="
        mt-8
        text-3xl
        font-black
        tracking-[-0.05em]
        text-gray-900
      ">
        No productions yet
      </h3>

      <p className="
        mt-3
        max-w-md
        text-base
        leading-relaxed
        text-gray-500
      ">

        Create your first production and begin
        managing operational workflows, schedules
        and crew assignments.

      </p>

      <Link
        href="/dashboard/shoots/create"
        className="
          mt-8
          inline-flex
          items-center
          gap-2
          rounded-2xl
          bg-blue-600
          px-6
          py-4
          text-sm
          font-semibold
          text-white
          hover:bg-blue-700
          transition-all
        "
      >

        <Plus size={18} />

        Create Production

      </Link>

    </div>
  );
}


function HeroTag({
  label,
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-white/10
      bg-white/10
      px-4
      py-3
      text-sm
      font-medium
      text-white
      backdrop-blur-xl
    ">

      {label}

    </div>
  );
}

function MetricCard({
  title,
  value,
}) {

  return (

    <div className="
      min-w-[140px]
      rounded-[24px]
      border
      border-white/10
      bg-white/10
      p-5
      backdrop-blur-2xl
    ">

      <p className="
        text-xs
        uppercase
        tracking-[0.18em]
        text-blue-100/60
      ">

        {title}

      </p>

      <h3 className="
        mt-3
        text-4xl
        font-black
        tracking-[-0.05em]
        text-white
      ">

        {value}

      </h3>

    </div>
  );
}


function RowInfo({
  icon,
  label,
}) {

  return (

    <div className="
      flex
      items-center
      gap-3
    ">

      <div className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-2xl
        bg-blue-50
        text-blue-600
      ">

        {icon}

      </div>

      <p className="
        text-sm
        font-medium
        text-slate-700
      ">

        {label}

      </p>

    </div>
  );
}

