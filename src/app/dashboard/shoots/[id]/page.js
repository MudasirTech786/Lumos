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
} from "lucide-react";

/* ========================================================= */
/* STATUS */
/* ========================================================= */

const STATUS_OPTIONS = [
  "planned",
  "scheduled",
  "active",
  "completed",
  "cancelled",
];

const STATUS_STYLES = {
  planned:
    "bg-gray-100 text-gray-700 border-gray-200",

  scheduled:
    "bg-blue-100 text-blue-700 border-blue-200",

  active:
    "bg-green-100 text-green-700 border-green-200",

  completed:
    "bg-purple-100 text-purple-700 border-purple-200",

  cancelled:
    "bg-red-100 text-red-700 border-red-200",
};

export default function ShootDetailsPage() {
  const params = useParams();

  const router = useRouter();

  const [shoot, setShoot] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [statusLoading, setStatusLoading] =
    useState(false);

  /* ========================================================= */
  /* FETCH */
  /* ========================================================= */

  const fetchShoot = async () => {
    try {
      const res = await api.get(
        `/shoots/${params.id}`
      );

      setShoot(res.data);
    } catch {
      toast.error(
        "Failed to load shoot"
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

  /* ========================================================= */
  /* UPDATE STATUS */
  /* ========================================================= */

  const updateStatus = async (
    status
  ) => {
    try {
      setStatusLoading(true);

      await api.patch(
        `/shoots/${shoot.id}/status`,
        {
          status,
        }
      );

      setShoot((prev) => ({
        ...prev,
        status,
      }));

      toast.success(
        "Status updated"
      );
    } catch {
      toast.error(
        "Failed to update status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  /* ========================================================= */
  /* CREW COUNT */
  /* ========================================================= */

  const crewCount = useMemo(() => {
    return (
      shoot?.crew_members?.length ||
      shoot?.crewMembers?.length ||
      0
    );
  }, [shoot]);

  /* ========================================================= */
  /* LOADING */
  /* ========================================================= */

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center text-gray-500">
          Loading shoot...
        </div>
      </Layout>
    );
  }

  /* ========================================================= */
  /* NO DATA */
  /* ========================================================= */

  if (!shoot) {
    return (
      <Layout>
        <div className="py-24 text-center text-gray-500">
          Shoot not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="mx-auto max-w-5xl pb-24">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* LEFT */}

          <div className="flex-1">

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
        border-gray-200
        bg-white
        px-4
        py-3
        text-sm
        font-medium
        text-gray-700
        transition
        hover:bg-gray-50
      "
            >
              <ArrowLeft size={16} />

              Back
            </button>

            {/* TITLE */}

            <div className="mt-6">

              <h1 className="text-4xl font-bold tracking-tight text-gray-900">

                {shoot.title}

              </h1>

              <p className="mt-2 text-sm text-gray-500">

                Shoot details, crew and transport information

              </p>

            </div>

            {/* ========================================================= */}
            {/* STATUS BAR */}
            {/* ========================================================= */}

            <div
              className="
        mt-6
        flex
        flex-col
        gap-5
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
            >

              {/* LEFT STATUS */}

              <div className="flex items-center gap-4">

                {/* ICON */}

                <div
                  className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${shoot.status ===
                      "planned"
                      ? "bg-gray-100"
                      : shoot.status ===
                        "scheduled"
                        ? "bg-blue-100"
                        : shoot.status ===
                          "active"
                          ? "bg-green-100"
                          : shoot.status ===
                            "completed"
                            ? "bg-purple-100"
                            : "bg-red-100"
                    }
          `}
                >

                  <div
                    className={`
              h-4
              w-4
              rounded-full
              ${shoot.status ===
                        "planned"
                        ? "bg-gray-500"
                        : shoot.status ===
                          "scheduled"
                          ? "bg-blue-500"
                          : shoot.status ===
                            "active"
                            ? "bg-green-500 animate-pulse"
                            : shoot.status ===
                              "completed"
                              ? "bg-purple-500"
                              : "bg-red-500"
                      }
            `}
                  />

                </div>

                {/* TEXT */}

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">

                    Shoot Status

                  </p>

                  <h3 className="mt-1 text-xl font-bold capitalize text-gray-900">

                    {shoot.status}

                  </h3>

                  <p className="mt-1 text-sm text-gray-500">

                    {shoot.status ===
                      "planned" &&
                      "Waiting to be scheduled"}

                    {shoot.status ===
                      "scheduled" &&
                      "Ready for production"}

                    {shoot.status ===
                      "active" &&
                      "Production in progress"}

                    {shoot.status ===
                      "completed" &&
                      "Production completed"}

                    {shoot.status ===
                      "cancelled" &&
                      "Production cancelled"}

                  </p>

                </div>

              </div>

              {/* RIGHT CONTROLS */}

              <div className="flex flex-col gap-2">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">

                  Change Status

                </p>

                <div className="relative">

                  <select
                    value={shoot.status}
                    disabled={statusLoading}
                    onChange={(e) =>
                      updateStatus(
                        e.target.value
                      )
                    }
                    className="
              min-w-[220px]
              appearance-none
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              px-5
              py-3
              pr-12
              text-sm
              font-semibold
              capitalize
              text-gray-800
              outline-none
              transition
              hover:border-gray-300
              focus:border-blue-500
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
                  >

                    {STATUS_OPTIONS.map(
                      (status) => (

                        <option
                          key={status}
                          value={status}
                        >

                          {status}

                        </option>

                      )
                    )}

                  </select>

                  {/* CUSTOM ARROW */}

                  <div
                    className="
              pointer-events-none
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
                  >

                    ▼

                  </div>

                </div>

                {statusLoading && (

                  <p className="text-xs text-blue-500">

                    Updating status...

                  </p>

                )}

              </div>

            </div>

          </div>

          {/* RIGHT ACTIONS */}

          <div className="flex flex-wrap gap-3">

            <Link
              href={`/dashboard/shoots/${shoot.id}/crew`}
              className="
        inline-flex
        items-center
        gap-2
        rounded-2xl
        border
        border-gray-200
        bg-white
        px-5
        py-3
        text-sm
        font-semibold
        text-gray-700
        transition
        hover:bg-gray-50
      "
            >
              <Users size={18} />

              Crew
            </Link>

            <Link
              href={`/dashboard/shoots/${shoot.id}/logistics`}
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
        transition
        hover:bg-blue-700
      "
            >
              <Truck size={18} />

              Logistics
            </Link>

          </div>

        </div>

        {/* ========================================================= */}
        {/* IMPORTANT INFO */}
        {/* ========================================================= */}

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">

          <SimpleInfoCard
            icon={<MapPin size={20} />}
            title="Location"
            value={
              shoot.location ||
              "Not added"
            }
          />

          <SimpleInfoCard
            icon={
              <CalendarDays size={20} />
            }
            title="Schedule"
            value={
              shoot.start_datetime
                ? new Date(
                  shoot.start_datetime
                ).toLocaleString()
                : "Not scheduled"
            }
          />

          <SimpleInfoCard
            icon={<Film size={20} />}
            title="Client"
            value={
              shoot.client_name ||
              "Not added"
            }
          />

          <SimpleInfoCard
            icon={<Users size={20} />}
            title="Crew Members"
            value={`${crewCount} assigned`}
          />

        </div>

        {/* ========================================================= */}
        {/* NOTES */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Notes">

            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                p-5
                text-sm
                leading-relaxed
                text-gray-700
              "
            >

              {shoot.notes ||
                "No notes added yet."}

            </div>

          </Card>

        </div>

        {/* ========================================================= */}
        {/* TRANSPORT */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Vehicles & Transport">

            {!shoot.logistics ||
              shoot.logistics.length === 0 ? (

              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-gray-300
                  py-14
                  text-center
                "
              >

                <Truck
                  size={42}
                  className="
                    mx-auto
                    text-gray-300
                  "
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-900">

                  No transport added

                </h3>

                <p className="mt-2 text-sm text-gray-500">

                  Add vehicles and pickup details

                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {shoot.logistics.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="
                        rounded-2xl
                        border
                        border-gray-200
                        p-5
                      "
                    >

                      <h3 className="text-lg font-bold text-gray-900">

                        {item.vehicle ||
                          "Unnamed Vehicle"}

                      </h3>

                      <div className="mt-5 space-y-4">

                        <TransportRow
                          icon={
                            <Car size={18} />
                          }
                          label="Vehicle Type"
                          value={
                            item.logistics_type
                              ? item.logistics_type.replaceAll(
                                "_",
                                " "
                              )
                              : "Not added"
                          }
                        />

                        <TransportRow
                          icon={
                            <Users size={18} />
                          }
                          label="Driver"
                          value={
                            item.driver_name ||
                            "Not assigned"
                          }
                        />

                        <TransportRow
                          icon={
                            <MapPin size={18} />
                          }
                          label="Pickup Location"
                          value={
                            item.pickup_location ||
                            "Not added"
                          }
                        />

                        <TransportRow
                          icon={
                            <Clock3 size={18} />
                          }
                          label="Pickup Time"
                          value={
                            item.pickup_time
                              ? new Date(
                                item.pickup_time
                              ).toLocaleString()
                              : "Not scheduled"
                          }
                        />

                        <TransportRow
                          icon={
                            <Truck size={18} />
                          }
                          label="Status"
                          value={
                            item.status
                              ? item.status.replaceAll(
                                "_",
                                " "
                              )
                              : "Pending"
                          }
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

            <Link
              href={`/dashboard/shoots/${shoot.id}/logistics`}
              className="
                mt-5
                flex
                items-center
                justify-between
                rounded-2xl
                bg-blue-600
                px-5
                py-4
                text-sm
                font-semibold
                text-white
                hover:bg-blue-700
              "
            >

              Open Logistics

              <ChevronRight size={16} />

            </Link>

          </Card>

        </div>

        {/* ========================================================= */}
        {/* CREW MEMBERS */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Crew Members">

            {(shoot.crew_members ||
              shoot.crewMembers ||
              []).length === 0 ? (

              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-gray-300
                  py-14
                  text-center
                  text-sm
                  text-gray-500
                "
              >

                No crew assigned yet

              </div>

            ) : (

              <div className="space-y-3">

                {(shoot.crew_members ||
                  shoot.crewMembers ||
                  []).map(
                    (crew) => (

                      <div
                        key={crew.id}
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          border-gray-200
                          p-4
                        "
                      >

                        <div
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-2xl
                            bg-blue-100
                            text-lg
                            font-bold
                            text-blue-700
                            shrink-0
                          "
                        >

                          {crew.profile_photo ? (

                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${crew.profile_photo}`}
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />

                          ) : (

                            crew.name?.charAt(0)

                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="truncate text-sm font-semibold text-gray-900">

                            {crew.name}

                          </h3>

                          <p className="mt-1 text-sm text-gray-500">

                            {crew.designation ||
                              "Crew Member"}

                          </p>

                        </div>

                      </div>

                    )
                  )}

              </div>

            )}

            <Link
              href={`/dashboard/shoots/${shoot.id}/crew`}
              className="
                mt-5
                flex
                items-center
                justify-between
                rounded-2xl
                bg-blue-600
                px-5
                py-4
                text-sm
                font-semibold
                text-white
                hover:bg-blue-700
              "
            >

              Open Crew Management

              <ChevronRight size={16} />

            </Link>

          </Card>

        </div>

        {/* ========================================================= */}
        {/* QUICK ACTIONS */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Quick Actions">

            <div className="space-y-3">

              <Link
                href={`/dashboard/shoots/${shoot.id}/crew`}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-4
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >

                Manage Crew

                <ChevronRight size={16} />

              </Link>

              <Link
                href={`/dashboard/shoots/${shoot.id}/logistics`}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-4
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >

                Manage Logistics

                <ChevronRight size={16} />

              </Link>

            </div>

          </Card>

        </div>

      </div>

    </Layout>
  );
}

/* ========================================================= */
/* CARD */
/* ========================================================= */

function Card({
  title,
  children,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-6
      "
    >

      <h2 className="text-xl font-bold text-gray-900">

        {title}

      </h2>

      <div className="mt-5">

        {children}

      </div>

    </div>
  );
}

/* ========================================================= */
/* SIMPLE INFO CARD */
/* ========================================================= */

function SimpleInfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-5
      "
    >

      <div className="flex items-start gap-4">

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-blue-50
            text-blue-600
            shrink-0
          "
        >

          {icon}

        </div>

        <div className="min-w-0">

          <p className="text-sm text-gray-500">

            {title}

          </p>

          <h3 className="mt-2 text-base font-semibold text-gray-900 break-words">

            {value}

          </h3>

        </div>

      </div>

    </div>
  );
}

/* ========================================================= */
/* TRANSPORT ROW */
/* ========================================================= */

function TransportRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div
        className="
          mt-0.5
          text-gray-400
        "
      >

        {icon}

      </div>

      <div>

        <p className="text-xs text-gray-500">

          {label}

        </p>

        <p className="mt-1 text-sm font-medium text-gray-900">

          {value}

        </p>

      </div>

    </div>
  );
}