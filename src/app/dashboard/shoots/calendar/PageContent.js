"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter }
  from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import moment from "moment";

import {
  Calendar,
  momentLocalizer,
} from "react-big-calendar";

import withDragAndDrop from
  "react-big-calendar/lib/addons/dragAndDrop";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  CircleDot,
  Film,
  Sparkles,
} from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";

import
  "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import usePageLoadingOverlay from "@/hooks/usePageLoadingOverlay";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";

import "./calendar.css";

const localizer =
  momentLocalizer(moment);

const DnDCalendar =
  withDragAndDrop(Calendar);

DnDCalendar.displayName =
  "DnDCalendar";

/* ========================================================= */
/* STATUS THEME — single source of truth for legend, events, */
/* and stat cards. Add a status once here, it shows up       */
/* everywhere automatically.                                 */
/* ========================================================= */

const STATUS_THEME = {
  planned: {
    label: "Planned",
    Icon: CircleDot,
    dot: "#94A3B8",
    bg: "#F8FAFC",
    left: "#94A3B8",
    text: "#475569",
    solid: "#64748B",
  },
  scheduled: {
    label: "Scheduled",
    Icon: Clock,
    dot: "#3B82F6",
    bg: "#EFF6FF",
    left: "#2563EB",
    text: "#1D4ED8",
    solid: "#2563EB",
  },
  active: {
    label: "Active",
    Icon: PlayCircle,
    dot: "#22C55E",
    bg: "#F0FDF4",
    left: "#059669",
    text: "#15803D",
    solid: "#059669",
  },
  completed: {
    label: "Completed",
    Icon: CheckCircle2,
    dot: "#A78BFA",
    bg: "#F5F3FF",
    left: "#7C3AED",
    text: "#7E22CE",
    solid: "#7C3AED",
  },
  cancelled: {
    label: "Cancelled",
    Icon: XCircle,
    dot: "#F87171",
    bg: "#FEF2F2",
    left: "#DC2626",
    text: "#DC2626",
    solid: "#DC2626",
  },
};

/* ── Custom event renderer — replaces react-big-calendar's default,   */
/* which silently sets a native `title` HTML attribute on every event  */
/* (that's the duplicate little browser tooltip box you were seeing).  */
/* We render our own compact pill with a status dot instead, and       */
/* disable the native one via `tooltipAccessor={() => null}` below.    */
function EventCard({ event }) {
  const theme = STATUS_THEME[event.resource?.status] || STATUS_THEME.planned;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className="h-[6px] w-[6px] flex-shrink-0 rounded-full"
        style={{ backgroundColor: theme.dot }}
      />
      <span className="truncate">{event.title}</span>
    </div>
  );
}

export default function ShootCalendarPage() {

  const router =
    useRouter();

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [view, setView] =
    useState("month");

  const [date, setDate] =
    useState(new Date());

  const [isDragging,
    setIsDragging] =
    useState(false);

  const [isMobile,
    setIsMobile] =
    useState(false);

  const overlay = usePageLoadingOverlay("Loading Calendar...");

  /* ========================================================= */
  /* MOBILE DETECTION */
  /* ========================================================= */

  useEffect(() => {

    const checkMobile =
      () => {

        setIsMobile(
          window.innerWidth < 768
        );
      };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {

      window.removeEventListener(
        "resize",
        checkMobile
      );
    };

  }, []);

  /* ========================================================= */
  /* CLEANUP */
  /* ========================================================= */

  useEffect(() => {

    return () => {

      setEvents([]);
    };

  }, []);

  /* ========================================================= */
  /* FETCH SHOOTS */
  /* ========================================================= */

  const fetchShoots = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/shoots-calendar",
        {
          headers: {
            "Cache-Control":
              "no-cache",
          },
        }
      );

      const formatted =
        res.data
          .filter(
            (shoot) =>
              shoot.start_datetime &&
              shoot.end_datetime
          )
          .map((shoot) => ({

            id: shoot.id,

            title: shoot.title,

            start: new Date(
              shoot.start_datetime
            ),

            end: new Date(
              shoot.end_datetime
            ),

            resource: {

              status:
                shoot.status,

              raw: shoot,
            },
          }));

      setEvents(formatted);

    } catch (error) {

      console.log(error);

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load calendar" });

    } finally {

      setLoading(false);
      overlay.finish();
    }
  };

  /* ========================================================= */
  /* INITIAL LOAD */
  /* ========================================================= */

  useEffect(() => {

    fetchShoots();

  }, []);

  /* ========================================================= */
  /* LIVE STATS — derived from events, no extra API calls       */
  /* ========================================================= */

  const stats = useMemo(() => {
    const monthStart = moment(date).startOf("month");
    const monthEnd = moment(date).endOf("month");

    const inMonth = events.filter((e) =>
      moment(e.start).isBetween(monthStart, monthEnd, undefined, "[]")
    );

    const byStatus = (status) =>
      inMonth.filter((e) => e.resource?.status === status).length;

    return {
      total: inMonth.length,
      scheduled: byStatus("scheduled"),
      active: byStatus("active"),
      completed: byStatus("completed"),
    };
  }, [events, date]);

  /* ========================================================= */
  /* EVENT STYLES */
  /* ========================================================= */

  const eventStyleGetter = (
    event
  ) => {

    const status =
      event.resource.status;

    const theme =
      STATUS_THEME[status] || STATUS_THEME.planned;

    return {

      style: {

        backgroundColor: theme.bg,

        borderLeft: `3px solid ${theme.left}`,
        borderTop: "1px solid rgba(15,23,42,0.04)",
        borderRight: "1px solid rgba(15,23,42,0.04)",
        borderBottom: "1px solid rgba(15,23,42,0.04)",

        color: theme.text,

        borderRadius: "10px",

        padding: "6px 10px 6px 11px",

        fontSize: "12.5px",

        fontWeight: "600",

        minHeight: "32px",

        display: "flex",

        alignItems: "center",

        whiteSpace: "nowrap",

        textOverflow: "ellipsis",

        boxShadow: "0 1px 2px rgba(15,23,42,0.03)",

        cursor: isMobile ? "pointer" : "grab",

        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      },
    };
  };

  /* ========================================================= */
  /* EVENT CLICK */
  /* ========================================================= */

  const handleSelectEvent = (
    event
  ) => {

    if (isDragging)
      return;

    router.push(
      `/dashboard/shoots/${event.id}`
    );
  };

  /* ========================================================= */
  /* DRAG & DROP */
  /* ========================================================= */

  const moveEvent = async ({
    event,
    start,
    end,
  }) => {

    setIsDragging(true);

    const pToastId = progressToast.loading({ title: "Rescheduling...", message: "Updating schedule..." });

    try {

      /* ========================================================= */
      /* UPDATE UI */
      /* ========================================================= */

      const updatedEvents =
        events.map((item) => {

          if (
            item.id === event.id
          ) {

            return {

              ...item,

              start,

              end,
            };
          }

          return item;
        });

      setEvents(updatedEvents);

      /* ========================================================= */
      /* API UPDATE */
      /* ========================================================= */

      await api.put(
        `/shoots/${event.id}`,
        {

          title:
            event.title,

          client_name:
            event.resource.raw
              ?.client_name,

          location:
            event.resource.raw
              ?.location,

          notes:
            event.resource.raw
              ?.notes,

          start_datetime:
            moment(start)
              .format(
                "YYYY-MM-DD HH:mm:ss"
              ),

          end_datetime:
            moment(end)
              .format(
                "YYYY-MM-DD HH:mm:ss"
              ),

          status:
            event.resource
              .status,
        }
      );

      progressToast.success(pToastId, { title: "Rescheduled", message: "Shoot rescheduled" });

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: "Failed to reschedule" });

      fetchShoots();

    } finally {

      setTimeout(() => {

        setIsDragging(false);

      }, 200);
    }
  };

  /* ========================================================= */
  /* TOOLBAR */
  /* ========================================================= */

  const CustomToolbar = () => {

    const isToday = moment(date).isSame(new Date(), "day");

    const goToBack = () => {

      const newDate =
        moment(date)
          .subtract(
            1,
            view === "month"
              ? "month"
              : view === "week"
              ? "week"
              : "day"
          )
          .toDate();

      setDate(newDate);
    };

    const goToNext = () => {

      const newDate =
        moment(date)
          .add(
            1,
            view === "month"
              ? "month"
              : view === "week"
              ? "week"
              : "day"
          )
          .toDate();

      setDate(newDate);
    };

    const goToToday =
      () => {

        setDate(
          new Date()
        );
      };

    return (

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        {/* LEFT */}

        <div>

          <AnimatePresence mode="wait">
            <motion.h2
              key={moment(date).format(view === "month" ? "MMMM YYYY" : "DD MMM YYYY")}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="text-xl font-bold tracking-[-0.01em] text-slate-900 sm:text-2xl"
            >

              {moment(date).format(
                view === "month"
                  ? "MMMM YYYY"
                  : "DD MMM YYYY"
              )}

            </motion.h2>
          </AnimatePresence>

          <p className="mt-1 text-[13px] text-slate-500">

            Production schedule overview

          </p>

        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2.5
          "
        >

          {/* NAVIGATION */}

          <div
            className="
              flex
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            "
          >

            <button
              type="button"
              onClick={goToBack}
              aria-label="Previous"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                border-r
                border-slate-200
                text-slate-500
                transition
                hover:bg-slate-50
                hover:text-slate-800
                active:scale-95
              "
            >

              <ChevronLeft size={17} />

            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                text-slate-500
                transition
                hover:bg-slate-50
                hover:text-slate-800
                active:scale-95
              "
            >

              <ChevronRight size={17} />

            </button>

          </div>

          {/* TODAY */}

          <button
            type="button"
            onClick={goToToday}
            className={`
              rounded-xl
              border
              px-4
              py-2.5
              text-[13px]
              font-semibold
              shadow-[0_1px_2px_rgba(15,23,42,0.04)]
              transition
              active:scale-95
              ${
                isToday
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }
            `}
          >

            Today

          </button>

          {/* VIEWS */}

          <div
            className="
              relative
              flex
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            "
          >

            {[
              "month",
              "week",
              "day",
              "agenda",
            ].map((item) => (

              <button
                key={item}
                type="button"
                onClick={() =>
                  setView(item)
                }
                className={`
                  relative
                  px-3.5
                  py-2.5
                  text-[13px]
                  font-semibold
                  capitalize
                  transition-colors
                  ${
                    view === item
                      ? "text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }
                `}
              >

                {view === item && (
                  <motion.span
                    layoutId="calendarViewPill"
                    className="absolute inset-0 bg-blue-600"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}

                <span className="relative z-10">{item}</span>

              </button>

            ))}

          </div>

        </div>

      </div>
    );
  };

  return (
    <>
    <Layout>

      <div
        className="
          mx-auto
          max-w-7xl
          px-2
          pb-24
          sm:px-4
          lg:px-6
        "
      >

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="
            relative
            mb-7
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            px-6
            py-7
            shadow-[0_1px_3px_rgba(15,23,42,0.04)]
            sm:px-8
          "
        >

          {/* Decorative gradient wash — subtle, not loud */}
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)",
            }}
          />

          <div className="relative flex flex-col gap-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    text-white
                    shadow-[0_8px_20px_rgba(37,99,235,0.28)]
                  "
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                >

                  <Film size={24} />

                </div>

                <div>

                  <div className="flex items-center gap-2">
                    <h1
                      className="
                        text-2xl
                        font-bold
                        tracking-tight
                        text-slate-900
                        sm:text-3xl
                      "
                    >

                      Shoot Calendar

                    </h1>
                    <Sparkles size={16} className="text-amber-400" />
                  </div>

                  <p className="mt-1 text-[13.5px] text-slate-500">

                    Production schedules and planning

                  </p>

                </div>

              </div>

              {/* LEGEND */}

              <div className="flex flex-wrap gap-2">

                {Object.values(STATUS_THEME).map((theme, i) => (
                  <motion.div
                    key={theme.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 * i, ease: "easeOut" }}
                  >
                    <Legend dot={theme.dot} label={theme.label} />
                  </motion.div>
                ))}

              </div>

            </div>

            {/* LIVE STATS STRIP */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <StatCard
                label="This Month"
                value={stats.total}
                color="#2563EB"
                Icon={CalendarDays}
              />
              <StatCard
                label="Scheduled"
                value={stats.scheduled}
                color="#2563EB"
                Icon={Clock}
              />
              <StatCard
                label="Active"
                value={stats.active}
                color="#059669"
                Icon={PlayCircle}
              />
              <StatCard
                label="Completed"
                value={stats.completed}
                color="#7C3AED"
                Icon={CheckCircle2}
              />

            </div>

          </div>

        </motion.div>

        {/* CALENDAR */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-slate-200
            bg-white
            p-3
            shadow-[0_1px_3px_rgba(15,23,42,0.04)]
            sm:p-6
          "
        >

          {/* LOADING OVERLAY (in-place refresh, not the full boot screen) */}

          <AnimatePresence>
            {loading && (

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="
                  absolute
                  inset-0
                  z-50
                  flex
                  items-center
                  justify-center
                  bg-white/70
                  backdrop-blur-sm
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3.5
                    text-[13px]
                    font-semibold
                    text-slate-600
                    shadow-[0_8px_24px_rgba(15,23,42,0.10)]
                  "
                >

                  <Loader2 size={15} className="animate-spin text-blue-500" />

                  Refreshing calendar...

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TOOLBAR */}

          <CustomToolbar />

          {/* EMPTY STATE — shown when there are truly no shoots at all */}

          {!loading && events.length === 0 ? (

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-slate-50/60
                py-20
                text-center
              "
            >

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <CalendarDays size={28} />
              </div>

              <p className="text-[15px] font-semibold text-slate-700">No shoots scheduled yet</p>

              <p className="mt-1 max-w-xs text-[13px] text-slate-400">
                Once shoots are added to the production schedule, they'll show up here on the calendar.
              </p>

            </motion.div>

          ) : (

            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
              "
              style={{
                height:
                  isMobile
                    ? "75vh"
                    : "80vh",
              }}
            >

              <DnDCalendar

                showAllEvents

                localizer={localizer}

                events={events}

                startAccessor="start"

                endAccessor="end"

                popup

                selectable

                resizable={!isMobile}

                draggableAccessor={() =>
                  !isMobile
                }

                toolbar={false}

                view={view}

                date={date}

                showMultiDayTimes={false}

                dayLayoutAlgorithm="no-overlap"

                onView={(newView) =>
                  setView(newView)
                }

                onNavigate={(newDate) =>
                  setDate(newDate)
                }

                views={[
                  "month",
                  "week",
                  "day",
                  "agenda",
                ]}

                eventPropGetter={
                  eventStyleGetter
                }

                onSelectEvent={
                  handleSelectEvent
                }

                onEventDrop={
                  moveEvent
                }

                onEventResize={
                  moveEvent
                }

                resizableAccessor={() =>
                  !isMobile
                }

                /* Disables react-big-calendar's default native `title`
                   tooltip on every event — that's the duplicate little
                   browser box that was overlapping your popup before.
                   Our own EventCard already shows the title clearly. */
                tooltipAccessor={() => null}

                components={{
                  event: EventCard,
                }}

              />

            </div>

          )}

        </motion.div>

      </div>

    </Layout>
    <PageLoadingOverlay visible={overlay.visible} text={overlay.text} />
    </>
  );
}

function Legend({
  dot,
  label,
}) {

  return (

    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-slate-200
        bg-white
        px-3.5
        py-2
        text-[12.5px]
        font-semibold
        text-slate-600
        shadow-[0_1px_2px_rgba(15,23,42,0.03)]
      "
    >

      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: dot }}
      />

      {label}

    </div>
  );
}

function StatCard({ label, value, color, Icon }) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        py-3.5
      "
    >

      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-3">

        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}14`, color }}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-bold leading-none text-slate-900">{value}</p>
          <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
        </div>

      </div>

    </div>
  );
}