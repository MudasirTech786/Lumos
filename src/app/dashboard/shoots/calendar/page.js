"use client";

import { useEffect, useState } from "react";

import { useRouter }
  from "next/navigation";

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
} from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";

import
  "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import "./calendar.css";

const localizer =
  momentLocalizer(moment);

const DnDCalendar =
  withDragAndDrop(Calendar);

DnDCalendar.displayName =
  "DnDCalendar";

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
    }
  };

  /* ========================================================= */
  /* INITIAL LOAD */
  /* ========================================================= */

  useEffect(() => {

    fetchShoots();

  }, []);

  /* ========================================================= */
  /* EVENT STYLES */
  /* ========================================================= */

  const eventStyleGetter = (
    event
  ) => {

    const status =
      event.resource.status;

    let backgroundColor =
      "#F3F4F6";

    let borderColor =
      "#D1D5DB";

    let textColor =
      "#374151";

    switch (status) {

      case "scheduled":

        backgroundColor =
          "#DBEAFE";

        borderColor =
          "#60A5FA";

        textColor =
          "#1D4ED8";

        break;

      case "active":

        backgroundColor =
          "#DCFCE7";

        borderColor =
          "#4ADE80";

        textColor =
          "#15803D";

        break;

      case "completed":

        backgroundColor =
          "#F3E8FF";

        borderColor =
          "#C084FC";

        textColor =
          "#7E22CE";

        break;

      case "cancelled":

        backgroundColor =
          "#FEE2E2";

        borderColor =
          "#F87171";

        textColor =
          "#DC2626";

        break;
    }

    return {

      style: {

        backgroundColor,

        border:
          `1px solid ${borderColor}`,

        color:
          textColor,

        borderRadius:
          "12px",

        padding:
          "6px 12px",

        fontSize:
          "13px",

        fontWeight:
          "700",

        minHeight:
          "34px",

        display:
          "flex",

        alignItems:
          "center",

        overflow:
          "hidden",

        whiteSpace:
          "nowrap",

        textOverflow:
          "ellipsis",

        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04)",

        transition:
          "all 0.2s ease",

        cursor:
          isMobile
            ? "pointer"
            : "grab",
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

          <h2 className="text-2xl font-bold text-gray-900">

            {moment(date).format(
              view === "month"
                ? "MMMM YYYY"
                : "DD MMM YYYY"
            )}

          </h2>

          <p className="mt-1 text-sm text-gray-500">

            Production schedule overview

          </p>

        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          {/* NAVIGATION */}

          <div
            className="
              flex
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >

            <button
              type="button"
              onClick={goToBack}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                border-r
                border-gray-200
                transition
                hover:bg-gray-50
              "
            >

              <ChevronLeft size={18} />

            </button>

            <button
              type="button"
              onClick={goToNext}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                transition
                hover:bg-gray-50
              "
            >

              <ChevronRight size={18} />

            </button>

          </div>

          {/* TODAY */}

          <button
            type="button"
            onClick={goToToday}
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:bg-gray-50
            "
          >

            Today

          </button>

          {/* VIEWS */}

          <div
            className="
              flex
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
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
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  capitalize
                  transition
                  ${
                    view === item
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >

                {item}

              </button>

            ))}

          </div>

        </div>

      </div>
    );
  };

  return (
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

        <div
          className="
            mb-8
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-3xl
              bg-blue-100
              text-blue-600
            "
          >

            <CalendarDays size={30} />

          </div>

          <div>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-gray-900
                sm:text-4xl
              "
            >

              Shoot Calendar

            </h1>

            <p className="mt-2 text-sm text-gray-500">

              Production schedules and planning

            </p>

          </div>

        </div>

        {/* LEGEND */}

        <div className="mb-6 flex flex-wrap gap-3">

          <Legend
            color="bg-gray-400"
            label="Planned"
          />

          <Legend
            color="bg-blue-600"
            label="Scheduled"
          />

          <Legend
            color="bg-green-600"
            label="Active"
          />

          <Legend
            color="bg-purple-600"
            label="Completed"
          />

          <Legend
            color="bg-red-600"
            label="Cancelled"
          />

        </div>

        {/* CALENDAR */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-gray-200
            bg-white
            p-3
            shadow-sm
            sm:p-6
          "
        >

          {/* LOADING OVERLAY */}

          {loading && (

            <div
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
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-6
                  py-4
                  text-sm
                  font-semibold
                  text-gray-600
                  shadow-lg
                "
              >

                Refreshing calendar...

              </div>

            </div>
          )}

          {/* TOOLBAR */}

          <CustomToolbar />

          {/* CALENDAR */}

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-gray-200
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

            />

          </div>

        </div>

      </div>

    </Layout>
  );
}

function Legend({
  color,
  label,
}) {

  return (

    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-2xl
        border
        border-gray-200
        bg-white
        px-4
        py-2.5
        text-sm
        font-medium
        text-gray-700
        shadow-sm
      "
    >

      <div
        className={`h-3 w-3 rounded-full ${color}`}
      />

      {label}

    </div>
  );
}