"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import Link from "next/link";

import { useConfirm } from "@/context/ConfirmContext";
import progressToast from "@/lib/progressToast";

import {
  Plus,
  MapPin,
  CalendarDays,
  Search,
  ChevronRight,
  Film,
  MoreVertical,
  Trash2,
  Edit3,
} from "lucide-react";

export default function ShootsPage() {
  const [shoots, setShoots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  const confirmDialog = useConfirm();

  /* ========================================================= */
  /* FETCH SHOOTS */
  /* ========================================================= */

  const fetchShoots = async () => {
    try {
      const res = await api.get("/shoots");

      setShoots(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );
    } catch {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load shoots" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoots();
  }, []);

  /* ========================================================= */
  /* DELETE */
  /* ========================================================= */

  const deleteShoot = async (id) => {
    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Shoot",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(`/shoots/${id}`),
    });

    if (!ok) return;

    fetchShoots();
  };

  /* ========================================================= */
  /* FILTERED SHOOTS */
  /* ========================================================= */

  const filteredShoots = useMemo(() => {
    let filtered = [...shoots];

    /* STATUS FILTER */

    if (activeTab !== "all") {
      filtered = filtered.filter(
        (shoot) =>
          (shoot.status || "planned")
            .toLowerCase() === activeTab
      );
    }

    /* SEARCH FILTER */

    if (search.trim()) {
      filtered = filtered.filter((shoot) => {
        const text = `
          ${shoot.title || ""}
          ${shoot.client_name || ""}
          ${shoot.location || ""}
        `.toLowerCase();

        return text.includes(search.toLowerCase());
      });
    }

    /* SORT BY DATE */

    filtered.sort((a, b) => {
      return (
        new Date(a.start_datetime || 0) -
        new Date(b.start_datetime || 0)
      );
    });

    return filtered;
  }, [shoots, activeTab, search]);

  /* ========================================================= */
  /* STATS */
  /* ========================================================= */

  const stats = useMemo(() => {
    return {
      all: shoots.length,
      active: shoots.filter(
        (s) => s.status === "active"
      ).length,
      planned: shoots.filter(
        (s) => s.status === "planned"
      ).length,
      completed: shoots.filter(
        (s) => s.status === "completed"
      ).length,
    };
  }, [shoots]);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl pb-24">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shoots
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage productions, schedules and crew
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
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition-all
              hover:bg-blue-700
            "
          >
            <Plus size={18} />

            New Shoot
          </Link>
        </div>

        {/* ========================================================= */}
        {/* SEARCH */}
        {/* ========================================================= */}

        <div className="mt-8">

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3
            "
          >
            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search shoots..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full
                bg-transparent
                text-sm
                text-gray-700
                outline-none
                placeholder:text-gray-400
              "
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* FILTER TABS */}
        {/* ========================================================= */}

        <div className="mt-6 flex flex-wrap gap-3">

          <TabButton
            active={activeTab === "all"}
            label={`All (${stats.all})`}
            onClick={() => setActiveTab("all")}
          />

          <TabButton
            active={activeTab === "active"}
            label={`Active (${stats.active})`}
            onClick={() =>
              setActiveTab("active")
            }
          />

          <TabButton
            active={activeTab === "planned"}
            label={`Planned (${stats.planned})`}
            onClick={() =>
              setActiveTab("planned")
            }
          />

          <TabButton
            active={activeTab === "completed"}
            label={`Completed (${stats.completed})`}
            onClick={() =>
              setActiveTab("completed")
            }
          />

        </div>

        {/* ========================================================= */}
        {/* TODAY SECTION */}
        {/* ========================================================= */}

        <div className="mt-10">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Productions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredShoots.length} shoots found
            </p>
          </div>

          {/* ========================================================= */}
          {/* LOADING */}
          {/* ========================================================= */}

          {loading ? (

            <div
              className="
                rounded-3xl
                border
                border-gray-200
                bg-white
                py-20
                text-center
                text-sm
                text-gray-500
              "
            >
              Loading shoots...
            </div>

          ) : filteredShoots.length === 0 ? (

            <EmptyState />

          ) : (

            <div className="space-y-4">

              {filteredShoots.map((shoot) => (

                <ShootCard
                  key={shoot.id}
                  shoot={shoot}
                  onDelete={deleteShoot}
                />

              ))}

            </div>

          )}

        </div>

      </div>
    </Layout>
  );
}

/* ========================================================= */
/* TAB BUTTON */
/* ========================================================= */

function TabButton({
  label,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-2xl
        px-4
        py-2.5
        text-sm
        font-medium
        transition-all

        ${
          active
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      `}
    >
      {label}
    </button>
  );
}

/* ========================================================= */
/* SHOOT CARD */
/* ========================================================= */

function ShootCard({
  shoot,
  onDelete,
}) {
  const [showMenu, setShowMenu] =
    useState(false);

  return (
    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-5
        transition-all
        hover:border-blue-200
      "
    >

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* ========================================================= */}
        {/* LEFT */}
        {/* ========================================================= */}

        <div className="flex-1">

          {/* STATUS */}

          <div
            className={`
              inline-flex
              items-center
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
              capitalize

              ${
                shoot.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : shoot.status === "active"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            {shoot.status || "planned"}
          </div>

          {/* TITLE */}

          <h3 className="mt-4 text-xl font-bold text-gray-900">
            {shoot.title}
          </h3>

          {/* INFO */}

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-5">

            <InfoItem
              icon={<MapPin size={16} />}
              text={
                shoot.location ||
                "No location"
              }
            />

            <InfoItem
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

            <InfoItem
              icon={<Film size={16} />}
              text={
                shoot.client_name ||
                "No client"
              }
            />

          </div>

        </div>

        {/* ========================================================= */}
        {/* ACTIONS */}
        {/* ========================================================= */}

        <div className="flex items-center gap-3">

          <Link
            href={`/dashboard/shoots/${shoot.id}`}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition-all
              hover:bg-blue-700
            "
          >
            Open

            <ChevronRight size={16} />
          </Link>

          {/* MENU */}

          <div className="relative">

            <button
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-gray-200
                bg-white
                text-gray-600
                hover:bg-gray-100
              "
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (

              <div
                className="
                  absolute
                  right-0
                  top-14
                  z-20
                  w-44
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  shadow-lg
                "
              >

                <Link
                  href={`/dashboard/shoots/${shoot.id}/edit`}
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    hover:bg-gray-50
                  "
                >
                  <Edit3 size={16} />

                  Edit
                </Link>

                <button
                  onClick={() =>
                    onDelete(shoot.id)
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-red-600
                    hover:bg-red-50
                  "
                >
                  <Trash2 size={16} />

                  Delete
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* ========================================================= */
/* INFO ITEM */
/* ========================================================= */

function InfoItem({
  icon,
  text,
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">

      <div className="text-gray-400">
        {icon}
      </div>

      <span>{text}</span>

    </div>
  );
}

/* ========================================================= */
/* EMPTY */
/* ========================================================= */

function EmptyState() {
  return (
    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        px-6
        py-20
        text-center
      "
    >

      <div
        className="
          mx-auto
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          bg-blue-50
          text-blue-600
        "
      >
        <Film size={36} />
      </div>

      <h3 className="mt-6 text-2xl font-bold text-gray-900">
        No shoots yet
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Create your first production shoot
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
          px-5
          py-3
          text-sm
          font-semibold
          text-white
          transition-all
          hover:bg-blue-700
        "
      >
        <Plus size={18} />

        Create Shoot
      </Link>

    </div>
  );
}