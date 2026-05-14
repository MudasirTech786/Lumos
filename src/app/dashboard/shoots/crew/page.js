
"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import toast from "react-hot-toast";

import {
  Search,
  Check,
  Users,
  Film,
  CalendarDays,
  MapPin,
  Clock3,
  Briefcase,
  Activity,
  Plus,
  X,
} from "lucide-react";

export default function ShootCrewPage() {

  const [shoots, setShoots] = useState([]);

  const [crewMembers, setCrewMembers] = useState([]);

  const [selectedShoot, setSelectedShoot] = useState("");

  const [selectedCrew, setSelectedCrew] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchData = async () => {

    try {

      const [shootRes, crewRes] = await Promise.all([
        api.get("/shoots"),
        api.get("/crew"),
      ]);

      const safeShoots =
        Array.isArray(shootRes.data)
          ? shootRes.data
          : shootRes.data?.data || [];

      let safeCrew = [];

      if (Array.isArray(crewRes.data)) {

        safeCrew = crewRes.data;

      } else if (
        Array.isArray(crewRes.data?.data)
      ) {

        safeCrew = crewRes.data.data;

      } else if (
        Array.isArray(crewRes.data?.crew?.data)
      ) {

        safeCrew = crewRes.data.crew.data;
      }

      setShoots(safeShoots);

      setCrewMembers(safeCrew);

    } catch {

      toast.error("Failed to load data");
    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filteredCrew = useMemo(() => {

    return crewMembers.filter((crew) => {

      const q = search.toLowerCase();

      return (
        crew.name
          ?.toLowerCase()
          .includes(q) ||

        crew.designation
          ?.toLowerCase()
          .includes(q)
      );
    });

  }, [crewMembers, search]);

  /* ====================================================== */
  /* ACTIVE SHOOT */
  /* ====================================================== */

  const activeShoot = shoots.find(
    (shoot) =>
      shoot.id == selectedShoot
  );

  /* ====================================================== */
  /* TOGGLE */
  /* ====================================================== */

  const toggleCrew = (id) => {

    if (selectedCrew.includes(id)) {

      setSelectedCrew(
        selectedCrew.filter(
          (item) => item !== id
        )
      );

    } else {

      setSelectedCrew([
        ...selectedCrew,
        id,
      ]);
    }
  };

  /* ====================================================== */
  /* CLEAR */
  /* ====================================================== */

  const clearSelection = () => {

    setSelectedCrew([]);
  };

  /* ====================================================== */
  /* ASSIGN */
  /* ====================================================== */

  const assignCrew = async () => {

    if (!selectedShoot) {

      toast.error("Select production");

      return;
    }

    if (selectedCrew.length === 0) {

      toast.error("Select crew");

      return;
    }

    setLoading(true);

    try {

      await api.post(
        `/shoots/${selectedShoot}/assign-crew`,
        {
          crew_members: selectedCrew,
        }
      );

      toast.success("Crew assigned");

      setSelectedCrew([]);

    } catch {

      toast.error("Assignment failed");

    } finally {

      setLoading(false);
    }
  };

  return (

    <Layout>

      <div className="
        min-h-screen
        bg-[#f4f8fc]
        text-slate-900
      ">

        {/* ====================================================== */}
        {/* BACKGROUND */}
        {/* ====================================================== */}

        <div className="
          fixed
          inset-0
          overflow-hidden
          pointer-events-none
        ">

          <div className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_30%)]
          " />

          <div className="
            absolute
            inset-0
            opacity-[0.03]
            [background-image:linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)]
            [background-size:44px_44px]
          " />

        </div>

        {/* ====================================================== */}
        {/* CONTENT */}
        {/* ====================================================== */}

        <div className="
          relative
          z-10
          p-6
          xl:p-8
        ">

          {/* ====================================================== */}
          {/* TOP BAR */}
          {/* ====================================================== */}

          <div className="
            sticky
            top-4
            z-50
            overflow-hidden
            rounded-[36px]
            border
            border-blue-100/70
            bg-white/70
            backdrop-blur-2xl
            shadow-[0_20px_80px_rgba(37,99,235,0.08)]
          ">

            <div className="
              absolute
              inset-0
              opacity-[0.04]
              [background-image:linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)]
              [background-size:42px_42px]
            " />

            {/* TOP */}

            <div className="
              relative
              z-10
              flex
              flex-col
              2xl:flex-row
              2xl:items-center
              2xl:justify-between
              gap-6
              p-6
            ">

              {/* LEFT */}

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
                  tracking-[0.18em]
                  text-blue-700
                ">

                  <div className="
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-500
                    animate-pulse
                  " />

                  Crew Operations

                </div>

                <h1 className="
                  mt-4
                  text-4xl
                  font-black
                  tracking-[-0.06em]
                  text-slate-900
                ">

                  Crew Assignment

                </h1>

              </div>

              {/* RIGHT */}

              <div className="
                flex
                flex-wrap
                items-center
                gap-3
              ">

                <StatCard
                  icon={<Film size={15} />}
                  value={shoots.length}
                  label="Productions"
                />

                <StatCard
                  icon={<Users size={15} />}
                  value={crewMembers.length}
                  label="Crew"
                />

                <StatCard
                  icon={<Activity size={15} />}
                  value={selectedCrew.length}
                  label="Selected"
                />

              </div>

            </div>

            {/* COMMAND BAR */}

            <div className="
              relative
              z-10
              border-t
              border-blue-100/70
              p-5
            ">

              <div className="
                flex
                flex-col
                xl:flex-row
                xl:items-center
                gap-4
              ">

                {/* SELECT */}

                <select
                  value={selectedShoot}
                  onChange={(e) =>
                    setSelectedShoot(
                      e.target.value
                    )
                  }
                  className="
                    h-14
                    rounded-2xl
                    border
                    border-blue-100
                    bg-white/80
                    px-5
                    text-sm
                    text-slate-700
                    outline-none
                    backdrop-blur-xl
                    focus:border-blue-300
                    focus:ring-4
                    focus:ring-blue-100
                  "
                >

                  <option value="">
                    Select Production
                  </option>

                  {shoots.map((shoot) => (

                    <option
                      key={shoot.id}
                      value={shoot.id}
                    >
                      {shoot.title}
                    </option>

                  ))}

                </select>

                {/* SEARCH */}

                <div className="
                  relative
                  flex-1
                ">

                  <Search
                    size={18}
                    className="
                      absolute
                      left-5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search crew members..."
                    className="
                      h-14
                      w-full
                      rounded-2xl
                      border
                      border-blue-100
                      bg-white/80
                      pl-14
                      pr-5
                      text-sm
                      text-slate-700
                      outline-none
                      backdrop-blur-xl
                      placeholder:text-slate-400
                      focus:border-blue-300
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>

                {/* BUTTON */}

                <button
                  onClick={assignCrew}
                  disabled={loading}
                  className="
                    h-14
                    rounded-2xl
                    bg-blue-600
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_12px_40px_rgba(37,99,235,0.35)]
                    transition-all
                    hover:scale-[1.02]
                    hover:bg-blue-700
                    disabled:opacity-60
                  "
                >

                  {loading
                    ? "Assigning..."
                    : `Assign ${selectedCrew.length} Crew`
                  }

                </button>

              </div>

            </div>

          </div>

          {/* ====================================================== */}
          {/* MAIN */}
          {/* ====================================================== */}

          <div className="
            mt-8
            grid
            grid-cols-1
            xl:grid-cols-[300px_1fr]
            gap-6
          ">

            {/* ====================================================== */}
            {/* SIDEBAR */}
            {/* ====================================================== */}

            <div className="
              overflow-hidden
              rounded-[32px]
              border
              border-blue-100
              bg-white/70
              backdrop-blur-2xl
              shadow-[0_20px_60px_rgba(37,99,235,0.06)]
              h-fit
            ">

              {/* HEADER */}

              <div className="
                border-b
                border-blue-100
                p-6
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  <div>

                    <p className="
                      text-sm
                      text-slate-500
                    ">
                      Active Production
                    </p>

                    <h2 className="
                      mt-2
                      text-2xl
                      font-bold
                      text-slate-900
                    ">
                      Production Panel
                    </h2>

                  </div>

                  <div className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                  ">

                    <Film size={22} />

                  </div>

                </div>

              </div>

              {/* BODY */}

              <div className="p-6">

                {activeShoot ? (

                  <div className="
                    rounded-[28px]
                    border
                    border-blue-100
                    bg-gradient-to-br
                    from-blue-50
                    via-cyan-50
                    to-white
                    p-5
                  ">

                    <div>

                      <div className="
                        inline-flex
                        rounded-full
                        bg-emerald-100
                        border
                        border-emerald-200
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-emerald-700
                      ">

                        {activeShoot.status}

                      </div>

                      <h3 className="
                        mt-5
                        text-2xl
                        font-bold
                        leading-tight
                        text-slate-900
                      ">

                        {activeShoot.title}

                      </h3>

                    </div>

                    <div className="
                      mt-7
                      space-y-4
                    ">

                      <MetaRow
                        icon={<MapPin size={16} />}
                        label={
                          activeShoot.location ||
                          "No location"
                        }
                      />

                      <MetaRow
                        icon={<CalendarDays size={16} />}
                        label={
                          activeShoot.shoot_date ||
                          "No date"
                        }
                      />

                    </div>

                  </div>

                ) : (

                  <div className="
                    rounded-[28px]
                    border
                    border-dashed
                    border-blue-100
                    p-10
                    text-center
                  ">

                    <div className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-3xl
                      bg-blue-50
                    ">

                      <Film
                        size={26}
                        className="
                          text-blue-400
                        "
                      />

                    </div>

                    <h3 className="
                      mt-5
                      text-lg
                      font-semibold
                      text-slate-900
                    ">
                      No Production Selected
                    </h3>

                    <p className="
                      mt-2
                      text-sm
                      leading-relaxed
                      text-slate-500
                    ">

                      Select a production to begin crew assignment.

                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* ====================================================== */}
            {/* CREW */}
            {/* ====================================================== */}

            <div className="
              overflow-hidden
              rounded-[32px]
              border
              border-blue-100
              bg-white/70
              backdrop-blur-2xl
              shadow-[0_20px_60px_rgba(37,99,235,0.06)]
            ">

              {/* HEADER */}

              <div className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-5
                border-b
                border-blue-100
                p-6
              ">

                <div>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Available Team Members
                  </p>

                  <h2 className="
                    mt-2
                    text-3xl
                    font-bold
                    tracking-[-0.04em]
                    text-slate-900
                  ">

                    Crew Directory

                  </h2>

                </div>

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
                  font-medium
                  text-blue-700
                ">

                  <Users size={15} />

                  {filteredCrew.length} Crew Available

                </div>

              </div>

              {/* GRID */}

              <div className="
                grid
                grid-cols-1
                2xl:grid-cols-2
                gap-4
                p-6
              ">

                {filteredCrew.map((crew) => {

                  const active =
                    selectedCrew.includes(
                      crew.id
                    );

                  return (

                    <button
                      key={crew.id}
                      onClick={() =>
                        toggleCrew(
                          crew.id
                        )
                      }
                      className={`
                        group
                        relative
                        overflow-hidden
                        rounded-[28px]
                        border
                        text-left
                        transition-all
                        duration-300

                        ${active
                          ? `
                            border-blue-300
                            bg-gradient-to-br
                            from-blue-50
                            via-cyan-50
                            to-white
                            shadow-[0_10px_50px_rgba(37,99,235,0.12)]
                            scale-[1.01]
                          `
                          : `
                            border-blue-100
                            bg-white/80
                            backdrop-blur-xl
                            hover:border-blue-200
                            hover:shadow-[0_0_40px_rgba(59,130,246,0.10)]
                            hover:-translate-y-[2px]
                          `
                        }
                      `}
                    >

                      {/* TOP */}

                      <div className="
                        flex
                        items-start
                        gap-5
                        p-5
                      ">

                        {/* AVATAR */}

                        <div className="
                          relative
                          shrink-0
                        ">

                          <div className="
                            h-16
                            w-16
                            rounded-[22px]
                            overflow-hidden
                            bg-gradient-to-br
                            from-blue-400
                            to-cyan-400
                            p-[2px]
                          ">

                            <div className="
                              flex
                              h-full
                              w-full
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-[20px]
                              bg-white
                              text-lg
                              font-bold
                              text-slate-900
                            ">

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

                          </div>

                          <div className="
                            absolute
                            bottom-0
                            right-0
                            h-4
                            w-4
                            rounded-full
                            border-2
                            border-white
                            bg-green-400
                          " />

                        </div>

                        {/* INFO */}

                        <div className="
                          min-w-0
                          flex-1
                        ">

                          <div className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          ">

                            <div>

                              <h3 className="
                                truncate
                                text-xl
                                font-bold
                                text-slate-900
                              ">

                                {crew.name}

                              </h3>

                              <p className="
                                mt-1
                                text-sm
                                font-medium
                                text-blue-600
                              ">

                                {crew.designation ||
                                  "Crew Member"}

                              </p>

                            </div>

                            {/* CHECK */}

                            <div className={`
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-2xl
                              border
                              transition-all

                              ${active
                                ? `
                                  border-blue-500
                                  bg-blue-500
                                  text-white
                                `
                                : `
                                  border-blue-100
                                  bg-blue-50
                                  text-transparent
                                `
                              }
                            `}>

                              <Check size={16} />

                            </div>

                          </div>

                          {/* BADGES */}

                          <div className="
                            mt-5
                            flex
                            flex-wrap
                            gap-2
                          ">

                            <div className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-blue-100
                              bg-blue-50
                              px-3
                              py-1.5
                              text-xs
                              font-medium
                              text-blue-700
                            ">

                              <Briefcase size={12} />

                              {crew.employment_type ||
                                "Production"}

                            </div>

                            <div className="
                              inline-flex
                              rounded-full
                              border
                              border-emerald-200
                              bg-emerald-100
                              px-3
                              py-1.5
                              text-xs
                              font-medium
                              text-emerald-700
                            ">

                              Available

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* FOOTER */}

                      <div className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-t
                        border-blue-100
                        bg-blue-50/70
                        px-5
                        py-4
                      ">

                        <MiniMeta
                          icon={<Clock3 size={14} />}
                          label={
                            crew.phone ||
                            "No phone"
                          }
                        />

                        <MiniMeta
                          icon={<CalendarDays size={14} />}
                          label={
                            crew.email ||
                            "No email"
                          }
                        />

                      </div>

                    </button>

                  );
                })}

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================== */}
        {/* FLOATING BAR */}
        {/* ====================================================== */}

        {selectedCrew.length > 0 && (

          <div className="
            fixed
            bottom-6
            left-1/2
            z-[100]
            -translate-x-1/2
          ">

            <div className="
              flex
              items-center
              gap-4
              rounded-[26px]
              border
              border-blue-100
              bg-white/80
              backdrop-blur-2xl
              px-5
              py-4
              shadow-[0_20px_80px_rgba(37,99,235,0.18)]
            ">

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
                  bg-blue-600
                  text-white
                ">

                  <Users size={18} />

                </div>

                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-900
                  ">

                    {selectedCrew.length} Crew Selected

                  </p>

                  <p className="
                    text-xs
                    text-slate-500
                  ">

                    Ready for assignment

                  </p>

                </div>

              </div>

              <div className="
                h-10
                w-px
                bg-blue-100
              " />

              <button
                onClick={clearSelection}
                className="
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
                  font-medium
                  text-slate-700
                  transition-all
                  hover:bg-blue-100
                "
              >

                <X size={15} />

                Clear

              </button>

              <button
                onClick={assignCrew}
                disabled={loading}
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
                  shadow-[0_10px_30px_rgba(37,99,235,0.35)]
                  transition-all
                  hover:scale-[1.02]
                  hover:bg-blue-700
                "
              >

                <Plus size={15} />

                {loading
                  ? "Assigning..."
                  : "Assign Crew"}

              </button>

            </div>

          </div>

        )}

      </div>

    </Layout>

  );
}

/* ====================================================== */
/* STAT CARD */
/* ====================================================== */

function StatCard({
  icon,
  value,
  label,
}) {

  return (

    <div className="
      min-w-[140px]
      rounded-[24px]
      border
      border-blue-100
      bg-white/70
      p-4
      backdrop-blur-2xl
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]
    ">

      <div className="
        flex
        items-center
        justify-between
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

        <span className="
          text-3xl
          font-black
          tracking-[-0.04em]
          text-slate-900
        ">

          {value}

        </span>

      </div>

      <p className="
        mt-3
        text-sm
        font-medium
        text-slate-500
      ">

        {label}

      </p>

    </div>
  );
}

/* ====================================================== */
/* META */
/* ====================================================== */

function MetaRow({
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
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        bg-blue-50
        text-blue-600
      ">

        {icon}

      </div>

      <span className="
        text-sm
        text-slate-600
      ">

        {label}

      </span>

    </div>
  );
}

/* ====================================================== */
/* MINI META */
/* ====================================================== */

function MiniMeta({
  icon,
  label,
}) {

  return (

    <div className="
      flex
      min-w-0
      items-center
      gap-2
      text-sm
      text-slate-500
    ">

      <div className="
        shrink-0
        text-blue-500
      ">

        {icon}

      </div>

      <span className="truncate">
        {label}
      </span>

    </div>
  );
}
