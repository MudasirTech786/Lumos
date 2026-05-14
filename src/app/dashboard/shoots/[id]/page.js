"use client";

import { useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import toast from "react-hot-toast";

import Link from "next/link";

import {
  Briefcase,
  CalendarDays,
  MapPin,
  Users,
  FileText,
  ArrowLeft,
  Activity,
  Clock3,
  Film,
  Sparkles,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function ShootDetailsPage() {

  const params = useParams();

  const router = useRouter();

  const [shoot, setShoot] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH PRODUCTION
  |--------------------------------------------------------------------------
  */

  const fetchShoot = async () => {

    try {

      const res =
        await api.get(
          `/shoots/${params.id}`
        );

      setShoot(res.data);

    } catch {

      toast.error(
        "Failed to load production"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    if (params.id) {

      fetchShoot();
    }

  }, [params.id]);

  /*
  |--------------------------------------------------------------------------
  | CREW COUNT
  |--------------------------------------------------------------------------
  */

  const crewCount =
    useMemo(() => {

      return (
        shoot?.crew_members?.length ||
        shoot?.crewMembers?.length ||
        0
      );

    }, [shoot]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <Layout>

        <div className="
          py-32
          text-center
          text-gray-500
        ">
          Loading production...
        </div>

      </Layout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NO DATA
  |--------------------------------------------------------------------------
  */

  if (!shoot) {

    return (

      <Layout>

        <div className="
          py-32
          text-center
          text-gray-500
        ">
          Production not found
        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="
        space-y-7
        pb-24
      ">

        {/* ================================================= */}
        {/* TOP HEADER */}
        {/* ================================================= */}

        <div className="
          flex
          flex-col
          xl:flex-row
          xl:items-center
          xl:justify-between
          gap-6
        ">

          <div>

            <button
              onClick={() =>
                router.back()
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-blue-100
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-blue-700
                hover:bg-blue-50
                transition-all
              "
            >

              <ArrowLeft size={16} />

              Back to Productions

            </button>

            <div className="mt-6">

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

                Production Overview

              </div>

              {/* <h1 className="
                mt-4
                text-4xl
                md:text-5xl
                font-black
                tracking-[-0.06em]
                text-gray-900
              ">

                {shoot.title}

              </h1>

              <p className="
                mt-4
                max-w-3xl
                text-base
                leading-relaxed
                text-gray-500
              ">

                Centralized production overview,
                operational data and crew management
                for this production workflow.

              </p> */}

            </div>

          </div>

          <div className="
            flex
            items-center
            gap-3
            flex-wrap
          ">

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
                hover:bg-blue-50
                transition-all
              "
            >

              <Users size={18} />

              Assign Crew

            </Link>

            <button
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

              Production Active

            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}


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

          {/* LIGHT */}

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

          {/* CONTENT */}

          <div className="relative z-10">

            {/* TOP */}

            <div className="
      flex
      items-center
      justify-between
    ">

              <div>

                <div className={`
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          px-4
          py-2
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.18em]
          backdrop-blur-xl

          ${shoot.status === "completed"
                    ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                    : shoot.status === "active"
                      ? "border-cyan-400/20 bg-cyan-500/15 text-cyan-200"
                      : "border-white/10 bg-white/10 text-blue-100"
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

                <h2 className="
          mt-5
          text-4xl
          font-black
          tracking-[-0.06em]
          text-white
        ">

                  {shoot.title}

                </h2>

              </div>

            </div>

            {/* METRICS */}

            <div className="
      mt-7
      grid
      grid-cols-2
      gap-5
      xl:grid-cols-4
    ">

              <MetricCard
                title="Crew"
                value={crewCount}
                glow="blue"
              />

              <MetricCard
                title="Status"
                value={shoot.status || "Draft"}
                glow="cyan"
              />

              <MetricCard
                title="Client"
                value={
                  shoot.client_name
                    ? "Assigned"
                    : "Pending"
                }
                glow="violet"
              />

              <MetricCard
                title="Location"
                value={
                  shoot.location
                    ? "Ready"
                    : "Pending"
                }
                glow="emerald"
              />

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* DETAILS GRID */}
        {/* ================================================= */}

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-[1fr_0.42fr]
          gap-7
        ">

          {/* LEFT */}
          <div className="
            rounded-[36px]
            border
            border-blue-100
            bg-white/70
            backdrop-blur-2xl
            p-6
            md:p-8
            shadow-[0_20px_80px_rgba(37,99,235,0.06)]
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-8
            ">

              <div>

                <h3 className="
                  text-3xl
                  font-black
                  tracking-[-0.05em]
                  text-gray-900
                ">
                  Production Information
                </h3>

                <p className="
                  mt-2
                  text-sm
                  text-gray-500
                ">
                  Operational production details and metadata
                </p>

              </div>

              <div className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-blue-50
                px-4
                py-3
                text-sm
                font-semibold
                text-blue-700
              ">

                <Clock3 size={16} />

                Live Data

              </div>

            </div>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
            ">

              <InfoCard
                icon={<Briefcase size={18} />}
                title="Client / Brand"
                value={
                  shoot.client_name ||
                  "Not assigned"
                }
              />

              <InfoCard
                icon={<MapPin size={18} />}
                title="Location"
                value={
                  shoot.location ||
                  "Not assigned"
                }
              />

              <InfoCard
                icon={<CalendarDays size={18} />}
                title="Shoot Date"
                value={
                  shoot.shoot_date ||
                  "Not assigned"
                }
              />

              <InfoCard
                icon={<Users size={18} />}
                title="Crew Members"
                value={`${crewCount} Assigned`}
              />

            </div>

            {/* NOTES */}
            <div className="mt-10">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                  text-blue-600
                ">

                  <FileText size={20} />

                </div>

                <div>

                  <h3 className="
                    text-xl
                    font-bold
                    text-gray-900
                  ">
                    Production Notes
                  </h3>

                  <p className="
                    text-sm
                    text-gray-500
                    mt-1
                  ">
                    Operational remarks and planning details
                  </p>

                </div>

              </div>

              <div className="
                mt-5
                rounded-[30px]
                border
                border-blue-100
                bg-blue-50/40
                p-6
                text-gray-600
                leading-relaxed
              ">

                {shoot.notes ||
                  "No production notes added yet."}

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="
            space-y-6
          ">

            {/* CREW */}
            <div className="
              rounded-[36px]
              border
              border-blue-100
              bg-white/70
              backdrop-blur-2xl
              p-6
              shadow-[0_20px_80px_rgba(37,99,235,0.06)]
            ">

              <div className="
                flex
                items-center
                justify-between
              ">

                <div>

                  <h3 className="
                    text-2xl
                    font-black
                    tracking-[-0.04em]
                    text-gray-900
                  ">
                    Assigned Crew
                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">
                    Production operators
                  </p>

                </div>

                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                  text-blue-600
                ">

                  <UserCheck size={20} />

                </div>

              </div>

              <div className="
                mt-6
                space-y-4
              ">

                {(shoot.crew_members ||
                  shoot.crewMembers ||
                  []).length === 0 ? (

                  <div className="
                    rounded-3xl
                    border
                    border-dashed
                    border-blue-100
                    bg-blue-50/30
                    p-6
                    text-center
                    text-sm
                    text-gray-500
                  ">

                    No crew assigned yet

                  </div>

                ) : (

                  (shoot.crew_members ||
                    shoot.crewMembers ||
                    []).map((crew) => (

                      <div
                        key={crew.id}
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-3xl
                          border
                        border-blue-100
                        bg-white/70 backdrop-blur-xl
                        hover:border-blue-200
                          hover:shadow-[0_0_35px_rgba(59,130,246,0.12)]
                          transition-all
                          p-4
                        "
                      >

                        <div className="
                          w-14
                          h-14
                          rounded-3xl
                          overflow-hidden
                          bg-blue-100
                          flex
                          items-center
                          justify-center
                          text-blue-700
                          font-bold
                          text-lg
                          shrink-0
                        ">

                          {crew.profile_photo ? (

                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${crew.profile_photo}`}
                              className="
                                w-full
                                h-full
                                object-cover
                              "
                            />

                          ) : (

                            crew.name?.charAt(0)

                          )}

                        </div>

                        <div className="
                          min-w-0
                          flex-1
                        ">

                          <h4 className="
                            text-sm
                            font-bold
                            text-gray-900
                            truncate
                          ">
                            {crew.name}
                          </h4>

                          <p className="
                            mt-1
                            text-xs
                            text-blue-700
                            font-medium
                          ">
                            {crew.designation ||
                              "Crew Member"}
                          </p>

                        </div>

                      </div>

                    ))

                )}

              </div>

              <Link
                href="/dashboard/shoots/crew"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-blue-700
                "
              >

                Manage Crew

                <ChevronRight size={16} />

              </Link>

            </div>

            {/* QUICK ACTIONS */}
            <div className="
              rounded-[36px]
              border
              border-blue-100
              bg-gradient-to-br
             from-[#0f3ba8]
            to-[#2563eb]
              p-6
              text-white
              shadow-[0_20px_80px_rgba(37,99,235,0.20)]
            ">

              <p className="
                text-xs
                uppercase
                tracking-[0.24em]
                text-blue-100/70
              ">
                Production Actions
              </p>

              <h3 className="
                mt-3
                text-3xl
                font-black
                tracking-[-0.05em]
              ">
                Continue workflow
              </h3>

              <p className="
                mt-4
                text-sm
                leading-relaxed
                text-blue-100/80
              ">

                Manage crew operations,
                scheduling and production
                execution workflows.

              </p>

              <div className="
                mt-8
                space-y-3
              ">

                <Link
                  href="/dashboard/shoots/crew"
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-white/10
                    px-5
                    py-4
                    text-sm
                    font-semibold
                    hover:bg-white/15
                    transition-all
                  "
                >

                  Assign Crew

                  <ChevronRight size={16} />

                </Link>

                <button
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-white/10
                    px-5
                    py-4
                    text-sm
                    font-semibold
                    hover:bg-white/15
                    transition-all
                  "
                >

                  Scheduling

                  <ChevronRight size={16} />

                </button>

                <button
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-white/10
                    px-5
                    py-4
                    text-sm
                    font-semibold
                    hover:bg-white/15
                    transition-all
                  "
                >

                  Logistics

                  <ChevronRight size={16} />

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

/* ========================================================= */
/* INFO CARD */
/* ========================================================= */

function InfoCard({
  icon,
  title,
  value,
}) {

  return (

    <div className="
      group
      rounded-[28px]
      border
      border-blue-100
      bg-white/70
      p-5
      backdrop-blur-2xl
      transition-all
      duration-300

      hover:border-blue-200
      hover:shadow-[0_0_40px_rgba(59,130,246,0.10)]
    ">

      <div className="
        flex
        items-center
        gap-4
      ">

        <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
        ">

          {icon}

        </div>

        <div className="min-w-0">

          <p className="
            text-[11px]
            uppercase
            tracking-[0.18em]
            text-slate-400
          ">

            {title}

          </p>

          <h3 className="
            mt-1
            truncate
            text-base
            font-bold
            text-slate-900
          ">

            {value}

          </h3>

        </div>

      </div>

    </div>
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
/* STATS */
/* ========================================================= */

function MetricCard({
  title,
  value,
  glow,
}) {

  const glowStyles = {

    blue:
      "from-blue-500/20 to-blue-400/5 border-blue-300/10",

    cyan:
      "from-cyan-500/20 to-cyan-400/5 border-cyan-300/10",

    violet:
      "from-violet-500/20 to-violet-400/5 border-violet-300/10",

    emerald:
      "from-emerald-500/20 to-emerald-400/5 border-emerald-300/10",
  };

  return (

    <div className={`
      group
      relative
      overflow-hidden
      rounded-[28px]
      border
      bg-gradient-to-br
      p-5
      backdrop-blur-2xl
      transition-all
      duration-300

      hover:-translate-y-1
      hover:shadow-[0_0_45px_rgba(59,130,246,0.22)]

      ${glowStyles[glow]}
    `}>

      <div className="
        absolute
        inset-0
        bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.08),transparent)]
      " />

      <div className="relative z-10">

        <p className="
          text-[11px]
          uppercase
          tracking-[0.18em]
          text-blue-100/60
        ">

          {title}

        </p>

        <h3 className="
          mt-4
          text-3xl
          font-black
          tracking-[-0.05em]
          text-white
          break-words
        ">

          {value}

        </h3>

      </div>

    </div>
  );
}