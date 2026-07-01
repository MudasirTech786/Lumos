"use client";

import { useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";

import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Check,
  Phone,
  Briefcase,
  CalendarDays,
  Trash2,
} from "lucide-react";

export default function ShootCrewPage() {

  const params = useParams();

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [shoot, setShoot] =
    useState(null);

  const [crewMembers, setCrewMembers] =
    useState([]);

  const [assignedCrew, setAssignedCrew] =
    useState([]);

  const [selectedCrew, setSelectedCrew] =
    useState([]);

  const confirmDialog = useConfirm();

  const [search, setSearch] =
    useState("");

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchData = async () => {

    try {

      const [shootRes, crewRes] =
        await Promise.all([

          api.get(
            `/shoots/${params.id}`
          ),

          api.get("/crew"),
        ]);

      setShoot(shootRes.data);

      setAssignedCrew(

        shootRes.data.crew_members ||

        shootRes.data.crewMembers ||

        []
      );

      /* ====================================================== */
      /* SAFE CREW */
      /* ====================================================== */

      let safeCrew = [];

      if (
        Array.isArray(
          crewRes.data
        )
      ) {

        safeCrew =
          crewRes.data;

      } else if (

        Array.isArray(
          crewRes.data?.data
        )

      ) {

        safeCrew =
          crewRes.data.data;

      } else if (

        Array.isArray(
          crewRes.data?.crew?.data
        )

      ) {

        safeCrew =
          crewRes.data.crew.data;
      }

      setCrewMembers(
        safeCrew
      );

    } catch {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load crew" });
    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filteredCrew = useMemo(() => {

    return crewMembers.filter(
      (crew) => {

        const q =
          search.toLowerCase();

        return (

          crew.name
            ?.toLowerCase()
            .includes(q) ||

          crew.designation
            ?.toLowerCase()
            .includes(q)
        );
      }
    );

  }, [crewMembers, search]);

  /* ====================================================== */
  /* TOGGLE */
  /* ====================================================== */

  const toggleCrew = (crew) => {

    const exists =
      selectedCrew.find(
        (item) =>
          item.id === crew.id
      );

    if (exists) {

      setSelectedCrew(

        selectedCrew.filter(
          (item) =>
            item.id !== crew.id
        )
      );

    } else {

      setSelectedCrew([

        ...selectedCrew,

        {
          id: crew.id,

          position:
            crew.designation || "",

          call_time: null,

          wrap_time: null,

          rate: "",
        },
      ]);
    }
  };

  /* ====================================================== */
  /* ASSIGN */
  /* ====================================================== */

  const assignCrew = async () => {

    if (selectedCrew.length === 0) {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Select crew members" });
      return;
    }

    setSaving(true);

    const pToastId = progressToast.loading({ title: "Assigning...", message: "Assigning crew..." });

    try {

      await api.post(

        `/shoots/${params.id}/assign-crew`,

        {
          crew_members:
            selectedCrew,
        }
      );

      progressToast.success(pToastId, { title: "Assigned", message: "Crew assigned" });

      setSelectedCrew([]);

      fetchData();

    } catch (err) {

      progressToast.error(pToastId, { title: "Error", message: err?.response?.data?.message || "Assignment failed" });

    } finally {

      setSaving(false);
    }
  };

  /* ====================================================== */
  /* REMOVE */
  /* ====================================================== */

  const removeCrew = async (
    crewId
  ) => {

    const ok = await confirmDialog({
      variant: "danger",
      title: "Remove Crew Member",
      description: "Remove this crew member from the shoot?",
      confirmText: "Remove",
      confirmAction: () => api.delete(
        `/shoots/${params.id}/crew/${crewId}`
      ),
    });

    if (!ok) return;

    fetchData();
  };

  /* ====================================================== */
  /* LOADING */
  /* ====================================================== */

  if (loading) {

    return (

      <Layout>

        <div className="py-24 text-center text-gray-500">

          Loading crew...

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="mx-auto max-w-6xl pb-24">

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

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
                border-gray-200
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-gray-700
              "
            >

              <ArrowLeft size={16} />

              Back

            </button>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">

              Crew Assignment

            </h1>

            <p className="mt-2 text-sm text-gray-500">

              Assign crew members for this shoot

            </p>

          </div>

          {selectedCrew.length > 0 && (

            <button
              onClick={assignCrew}
              disabled={saving}
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
      shadow-lg
      shadow-blue-200
    "
            >

              <Plus size={18} />

              {saving
                ? "Assigning..."
                : `Assign ${selectedCrew.length} Crew`}

            </button>

          )}

        </div>

        {/* ====================================================== */}
        {/* SHOOT */}
        {/* ====================================================== */}

        <div className="mt-10">

          <Card title="Shoot Information">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <InfoCard
                title="Shoot"
                value={
                  shoot?.title ||
                  "Untitled"
                }
              />

              <InfoCard
                title="Location"
                value={
                  shoot?.location ||
                  "No location"
                }
              />

              <InfoCard
                title="Schedule"
                value={
                  shoot?.start_datetime
                    ? new Date(
                      shoot.start_datetime
                    ).toLocaleString()
                    : "No schedule"
                }
              />

            </div>

          </Card>

        </div>

        {/* ====================================================== */}
        {/* ASSIGNED */}
        {/* ====================================================== */}

        <div className="mt-6">

          <Card title="Assigned Crew">

            {assignedCrew.length === 0 ? (

              <EmptyState
                title="No crew assigned"
                subtitle="Assign crew below"
              />

            ) : (

              <div className="space-y-4">

                {assignedCrew.map(
                  (crew) => (

                    <CrewCard
                      key={crew.id}
                      crew={crew}
                      assigned
                      onRemove={() =>
                        removeCrew(
                          crew.id
                        )
                      }
                    />

                  )
                )}

              </div>

            )}

          </Card>

        </div>

        {/* ====================================================== */}
        {/* AVAILABLE */}
        {/* ====================================================== */}

        <div className="mt-6">

          <Card title="Available Crew">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search crew..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  pl-12
                  pr-4
                  py-4
                  text-sm
                  outline-none
                "
              />

            </div>

            {/* LIST */}

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">

              {filteredCrew.map(
                (crew) => {

                  const selected =
                    selectedCrew.some(
                      (item) =>
                        item.id === crew.id
                    );

                  const alreadyAssigned =
                    assignedCrew.some(
                      (item) =>
                        item.id === crew.id
                    );

                  return (

                    <button
                      key={crew.id}
                      disabled={
                        alreadyAssigned
                      }
                      onClick={() =>
                        toggleCrew(crew)
                      }
                      className={`
                        rounded-2xl
                        border
                        p-5
                        text-left
                        transition-all

                        ${selected
                          ? `
                              border-blue-500
                              bg-blue-50
                            `
                          : `
                              border-gray-200
                              bg-white
                            `
                        }

                        ${alreadyAssigned
                          ? `
                              opacity-50
                              cursor-not-allowed
                            `
                          : `
                              hover:border-blue-300
                            `
                        }
                      `}
                    >

                      <div className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      ">

                        <div className="
                          flex
                          items-center
                          gap-4
                        ">

                          <Avatar
                            crew={crew}
                          />

                          <div>

                            <h3 className="
                              text-lg
                              font-semibold
                              text-gray-900
                            ">

                              {crew.name}

                            </h3>

                            <p className="
                              mt-1
                              text-sm
                              text-gray-500
                            ">

                              {crew.designation ||
                                "Crew Member"}

                            </p>

                          </div>

                        </div>

                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-2xl
                            border

                            ${selected
                              ? `
                                  border-blue-500
                                  bg-blue-500
                                  text-white
                                `
                              : `
                                  border-gray-200
                                  bg-white
                                  text-transparent
                                `
                            }
                          `}
                        >

                          <Check size={16} />

                        </div>

                      </div>

                    </button>

                  );
                }
              )}

            </div>

          </Card>

        </div>

      </div>
      {/* ====================================================== */}
      {/* FLOATING ACTION BAR */}
      {/* ====================================================== */}

      {selectedCrew.length > 0 && (

        <div className="
    fixed
    bottom-6
    left-1/2
    z-50
    -translate-x-1/2
  ">

          <div className="
      flex
      items-center
      gap-4
      rounded-3xl
      border
      border-blue-100
      bg-white
      px-5
      py-4
      shadow-2xl
    ">

            {/* COUNT */}

            <div className="
        flex
        items-center
        gap-3
      ">

              <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-blue-600
          text-white
        ">

                <Users size={18} />

              </div>

              <div>

                <p className="
            text-sm
            font-semibold
            text-gray-900
          ">

                  {selectedCrew.length} Crew Selected

                </p>

                <p className="
            text-xs
            text-gray-500
          ">

                  Ready to assign

                </p>

              </div>

            </div>

            {/* CLEAR */}

            <button
              onClick={() =>
                setSelectedCrew([])
              }
              className="
          rounded-2xl
          border
          border-gray-200
          bg-gray-50
          px-4
          py-3
          text-sm
          font-medium
          text-gray-700
        "
            >

              Clear

            </button>

            {/* ASSIGN */}

            <button
              onClick={assignCrew}
              disabled={saving}
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
        "
            >

              <Plus size={16} />

              {saving
                ? "Assigning..."
                : "Assign"}

            </button>

          </div>

        </div>

      )}
    </Layout>

  );
}

/* ====================================================== */
/* CREW CARD */
/* ====================================================== */

function CrewCard({
  crew,
  assigned,
  onRemove,
}) {

  return (

    <div
      className="
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-gray-200
        p-5
        md:flex-row
        md:items-center
        md:justify-between
      "
    >

      <div className="
        flex
        items-center
        gap-4
      ">

        <Avatar crew={crew} />

        <div>

          <h3 className="
            text-lg
            font-semibold
            text-gray-900
          ">

            {crew.name}

          </h3>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            {crew.designation ||
              "Crew Member"}

          </p>

          <div className="
            mt-3
            flex
            flex-wrap
            gap-4
          ">

            <SmallInfo
              icon={<Phone size={14} />}
              text={
                crew.phone ||
                "No phone"
              }
            />

            <SmallInfo
              icon={<Briefcase size={14} />}
              text={
                crew.employment_type ||
                "Production"
              }
            />

          </div>

        </div>

      </div>

      {assigned && (

        <button
          onClick={onRemove}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-3
            text-sm
            font-semibold
            text-red-600
          "
        >

          <Trash2 size={16} />

          Remove

        </button>

      )}

    </div>
  );
}

/* ====================================================== */
/* AVATAR */
/* ====================================================== */

function Avatar({
  crew,
}) {

  return (

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

    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-6
      "
    >

      <h2 className="
        text-xl
        font-bold
        text-gray-900
      ">

        {title}

      </h2>

      <div className="mt-5">

        {children}

      </div>

    </div>
  );
}

/* ====================================================== */
/* INFO CARD */
/* ====================================================== */

function InfoCard({
  title,
  value,
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-gray-200
        p-5
      "
    >

      <p className="
        text-sm
        text-gray-500
      ">

        {title}

      </p>

      <h3 className="
        mt-2
        text-base
        font-semibold
        text-gray-900
      ">

        {value}

      </h3>

    </div>
  );
}

/* ====================================================== */
/* SMALL INFO */
/* ====================================================== */

function SmallInfo({
  icon,
  text,
}) {

  return (

    <div className="
      flex
      items-center
      gap-2
      text-sm
      text-gray-500
    ">

      <div className="text-gray-400">

        {icon}

      </div>

      <span>{text}</span>

    </div>
  );
}

/* ====================================================== */
/* EMPTY */
/* ====================================================== */

function EmptyState({
  title,
  subtitle,
}) {

  return (

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

      <div
        className="
          mx-auto
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-3xl
          bg-blue-50
          text-blue-600
        "
      >

        <Users size={30} />

      </div>

      <h3 className="
        mt-5
        text-lg
        font-semibold
        text-gray-900
      ">

        {title}

      </h3>

      <p className="
        mt-2
        text-sm
        text-gray-500
      ">

        {subtitle}

      </p>

    </div>
  );
}