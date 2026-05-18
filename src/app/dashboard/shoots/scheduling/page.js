"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import Link from "next/link";

import toast from "react-hot-toast";

import {
  CalendarDays,
  Users,
  MapPin,
  Plus,
  Clock3,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
} from "lucide-react";

export default function SchedulingDashboard() {

  const [shoots, setShoots] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showIssues, setShowIssues] =
    useState(false);

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

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
        "Failed to load shoots"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchShoots();

  }, []);

  /* ====================================================== */
  /* COMPUTED */
  /* ====================================================== */

  const computed = useMemo(() => {

    const today =
      new Date();

    const todayShoots =
      shoots.filter((shoot) => {

        if (!shoot.start_datetime)
          return false;

        const start =
          new Date(
            shoot.start_datetime
          );

        return (
          start.toDateString() ===
          today.toDateString()
        );
      });

    const completed =
      shoots.filter(
        (shoot) =>
          shoot.status ===
          "completed"
      );

    const ready =
      shoots.filter(
        (shoot) =>
          shoot.location &&
          (
            shoot.crew_members
              ?.length || 0
          ) > 0
      );

    /* ====================================================== */
    /* ISSUES */
    /* ====================================================== */

    const issues = [];

    shoots.forEach((shoot) => {

      if (!shoot.location) {

        issues.push({

          shoot,

          message:
            "Missing location",
        });
      }

      if (
        (
          shoot.crew_members
            ?.length || 0
        ) === 0
      ) {

        issues.push({

          shoot,

          message:
            "No crew assigned",
        });
      }

      if (
        !shoot.start_datetime
      ) {

        issues.push({

          shoot,

          message:
            "No schedule added",
        });
      }
    });

    return {

      total:
        shoots.length,

      today:
        todayShoots.length,

      completed:
        completed.length,

      ready:
        ready.length,

      issues,
    };

  }, [shoots]);

  /* ====================================================== */
  /* LOADING */
  /* ====================================================== */

  if (loading) {

    return (

      <Layout>

        <div className="
          py-24
          text-center
          text-gray-500
        ">

          Loading productions...

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="
        mx-auto
        max-w-7xl
        pb-24
      ">

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-start
          lg:justify-between
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
              text-gray-900
            ">

              Shoot Scheduling

            </h1>

            <p className="
              mt-3
              text-sm
              text-gray-500
            ">

              Manage production schedules and operations

            </p>

          </div>

          <Link
            href="/dashboard/shoots/create"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              px-6
              py-4
              text-sm
              font-semibold
              text-white
              hover:bg-blue-700
            "
          >

            <Plus size={18} />

            Create Shoot

          </Link>

        </div>

        {/* ====================================================== */}
        {/* STATS */}
        {/* ====================================================== */}

        <div className="
          mt-10
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          lg:grid-cols-4
        ">

          <StatCard
            title="Total Shoots"
            value={computed.total}
            icon={
              <CalendarDays size={22} />
            }
          />

          <StatCard
            title="Today's Shoots"
            value={computed.today}
            icon={<Clock3 size={22} />}
          />

          <StatCard
            title="Ready Productions"
            value={computed.ready}
            icon={
              <CheckCircle2 size={22} />
            }
          />

          <StatCard
            title="Completed"
            value={computed.completed}
            icon={
              <CheckCircle2 size={22} />
            }
          />

        </div>

        {/* ====================================================== */}
        {/* ISSUES PANEL */}
        {/* ====================================================== */}

        {computed.issues.length > 0 && (

          <button
            onClick={() =>
              setShowIssues(true)
            }
            className="
              mt-6
              w-full
              rounded-3xl
              border
              border-yellow-200
              bg-yellow-50
              p-6
              text-left
              transition-all
              hover:border-yellow-300
            "
          >

            <div className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            ">

              <div className="
                flex
                items-start
                gap-4
              ">

                <div className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-3xl
                  bg-yellow-100
                  text-yellow-700
                  shrink-0
                ">

                  <ShieldAlert size={30} />

                </div>

                <div>

                  <h2 className="
                    text-2xl
                    font-bold
                    text-gray-900
                  ">

                    Production Issues Detected

                  </h2>

                  <p className="
                    mt-2
                    text-sm
                    text-yellow-800
                  ">

                    {computed.issues.length} issues need attention before shoots are fully ready

                  </p>

                </div>

              </div>

              <div className="
                inline-flex
                items-center
                gap-3
                rounded-2xl
                bg-white
                px-5
                py-4
                text-sm
                font-semibold
                text-gray-800
                shadow-sm
              ">

                View Issues

                <ChevronRight size={18} />

              </div>

            </div>

          </button>

        )}

        {/* ====================================================== */}
        {/* SHOOT LIST */}
        {/* ====================================================== */}

        <div className="mt-8">

          <Card title="All Shoots">

            {shoots.length === 0 ? (

              <EmptyState />

            ) : (

              <div className="
                space-y-4
              ">

                {shoots.map(
                  (shoot) => {

                    const crewCount =
                      shoot
                        .crew_members
                        ?.length || 0;

                    const ready =
                      shoot.location &&
                      crewCount > 0;

                    return (

                      <Link
                        key={shoot.id}
                        href={`/dashboard/shoots/${shoot.id}`}
                        className="
                          block
                          rounded-3xl
                          border
                          border-gray-200
                          bg-white
                          p-6
                          transition-all
                          hover:border-blue-300
                          hover:bg-blue-50/30
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          gap-5
                          lg:flex-row
                          lg:items-center
                          lg:justify-between
                        ">

                          {/* LEFT */}

                          <div className="
                            flex-1
                          ">

                            <div className="
                              flex
                              flex-wrap
                              items-center
                              gap-3
                            ">

                              <h2 className="
                                text-xl
                                font-bold
                                text-gray-900
                              ">

                                {shoot.title}

                              </h2>

                            </div>

                            <div className="
                              mt-5
                              flex
                              flex-wrap
                              gap-5
                            ">

                              <Info
                                icon={
                                  <CalendarDays size={16} />
                                }
                                text={
                                  shoot.start_datetime

                                    ? new Date(
                                        shoot.start_datetime
                                      ).toLocaleString()

                                    : "No schedule"
                                }
                              />

                              <Info
                                icon={
                                  <MapPin size={16} />
                                }
                                text={
                                  shoot.location ||
                                  "No location"
                                }
                              />

                              <Info
                                icon={
                                  <Users size={16} />
                                }
                                text={`${crewCount} Crew`}
                              />

                            </div>

                          </div>

                          {/* RIGHT */}

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            {ready ? (

                              <div className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-green-100
                                px-4
                                py-3
                                text-sm
                                font-semibold
                                text-green-700
                              ">

                                <CheckCircle2 size={16} />

                                Ready

                              </div>

                            ) : (

                              <div className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-yellow-100
                                px-4
                                py-3
                                text-sm
                                font-semibold
                                text-yellow-700
                              ">

                                <AlertTriangle size={16} />

                                Needs Attention

                              </div>

                            )}

                            <div className="
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              rounded-2xl
                              border
                              border-gray-200
                              bg-white
                            ">

                              <ChevronRight
                                size={18}
                                className="
                                  text-gray-500
                                "
                              />

                            </div>

                          </div>

                        </div>

                      </Link>

                    );
                  }
                )}

              </div>

            )}

          </Card>

        </div>

      </div>

      {/* ====================================================== */}
      {/* ISSUES MODAL */}
      {/* ====================================================== */}

      {showIssues && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/40
          p-4
        ">

          <div className="
            w-full
            max-w-2xl
            rounded-3xl
            bg-white
            shadow-2xl
            overflow-hidden
          ">

            {/* HEADER */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-gray-200
              px-6
              py-5
            ">

              <div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-gray-900
                ">

                  Production Issues

                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">

                  Problems requiring attention

                </p>

              </div>

              <button
                onClick={() =>
                  setShowIssues(false)
                }
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                "
              >

                <X size={18} />

              </button>

            </div>

            {/* CONTENT */}

            <div className="
              max-h-[70vh]
              overflow-y-auto
              p-6
            ">

              <div className="
                space-y-4
              ">

                {computed.issues.map(
                  (issue, index) => (

                    <Link
                      key={index}
                      href={`/dashboard/shoots/${issue.shoot.id}`}
                      onClick={() =>
                        setShowIssues(false)
                      }
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        rounded-2xl
                        border
                        border-yellow-200
                        bg-yellow-50
                        p-5
                        transition-all
                        hover:border-yellow-300
                      "
                    >

                      <div>

                        <h3 className="
                          text-lg
                          font-semibold
                          text-gray-900
                        ">

                          {issue.shoot.title}

                        </h3>

                        <p className="
                          mt-2
                          text-sm
                          font-medium
                          text-yellow-700
                        ">

                          {issue.message}

                        </p>

                      </div>

                      <div className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white
                      ">

                        <ChevronRight
                          size={18}
                        />

                      </div>

                    </Link>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </Layout>
  );
}

/* ====================================================== */
/* CARD */
/* ====================================================== */

function Card({
  title,
  children,
}) {

  return (

    <div className="
      rounded-3xl
      border
      border-gray-200
      bg-white
      p-6
    ">

      <h2 className="
        text-xl
        font-bold
        text-gray-900
      ">

        {title}

      </h2>

      <div className="mt-6">

        {children}

      </div>

    </div>
  );
}

/* ====================================================== */
/* STAT CARD */
/* ====================================================== */

function StatCard({
  title,
  value,
  icon,
}) {

  return (

    <div className="
      rounded-3xl
      border
      border-gray-200
      bg-white
      p-5
    ">

      <div className="
        flex
        items-start
        justify-between
      ">

        <div>

          <p className="
            text-sm
            text-gray-500
          ">

            {title}

          </p>

          <h3 className="
            mt-3
            text-3xl
            font-bold
            text-gray-900
          ">

            {value}

          </h3>

        </div>

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

      </div>

    </div>
  );
}

/* ====================================================== */
/* INFO */
/* ====================================================== */

function Info({
  icon,
  text,
}) {

  return (

    <div className="
      flex
      items-center
      gap-2
      text-sm
      text-gray-600
    ">

      <div className="
        text-gray-400
      ">

        {icon}

      </div>

      <span>

        {text}

      </span>

    </div>
  );
}

/* ====================================================== */
/* EMPTY */
/* ====================================================== */

function EmptyState() {

  return (

    <div className="
      rounded-3xl
      border
      border-dashed
      border-gray-300
      py-20
      text-center
    ">

      <div className="
        mx-auto
        flex
        h-20
        w-20
        items-center
        justify-center
        rounded-3xl
        bg-blue-50
        text-blue-600
      ">

        <CalendarDays size={36} />

      </div>

      <h3 className="
        mt-6
        text-2xl
        font-bold
        text-gray-900
      ">

        No shoots yet

      </h3>

      <p className="
        mt-3
        text-sm
        text-gray-500
      ">

        Create your first production shoot

      </p>

      <Link
        href="/dashboard/shoots/create"
        className="
          mt-6
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
        "
      >

        <Plus size={18} />

        Create Shoot

      </Link>

    </div>
  );
}