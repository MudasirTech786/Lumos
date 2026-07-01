"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  ShieldCheck,
  Plus,
  Search,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  CalendarClock,
  Boxes,
} from "lucide-react";

export default function InspectionsPage() {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [inspections, setInspections] =
    useState([]);

  const [items, setItems] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [form, setForm] =
    useState({

      inventory_item_id: "",

      condition: "good",

      status: "passed",

      notes: "",

      recommendations: "",

      next_inspection_due: "",
    });

  /* ========================================================= */
  /* FETCH */
  /* ========================================================= */

  const fetchData = async () => {

    try {

      const [
        inspectionsRes,
        itemsRes,
      ] = await Promise.all([

        api.get(
          "/inventory/inspections"
        ),

        api.get(
          "/inventory/items"
        ),
      ]);

      setInspections(

        inspectionsRes.data
          ?.inspections?.data ||

        []
      );

      setItems(

        itemsRes.data?.data ||

        itemsRes.data ||

        []
      );

    } catch (error) {

      console.log(error);

      const pToastId = progressToast.loading({ title: "Error", message: "Failed loading inspections" });
      progressToast.error(pToastId, { title: "Error", message: "Failed loading inspections" });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  /* ========================================================= */
  /* CREATE */
  /* ========================================================= */

  const createInspection = async () => {

    if (
      !form.inventory_item_id
    ) {

      const pToastId = progressToast.loading({ title: "Error", message: "Select inventory item" });
      progressToast.error(pToastId, { title: "Error", message: "Select inventory item" });

      return;
    }

    setSaving(true);

    const pToastId = progressToast.loading({ title: "Creating...", message: "Creating inspection..." });

    try {

      await api.post(

        "/inventory/inspections",

        form
      );

      progressToast.success(pToastId, { title: "Created", message: "Inspection created" });

      setForm({

        inventory_item_id: "",

        condition: "good",

        status: "passed",

        notes: "",

        recommendations: "",

        next_inspection_due: "",
      });

      setShowForm(false);

      fetchData();

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Failed creating inspection" });

    } finally {

      setSaving(false);
    }
  };

  /* ========================================================= */
  /* FILTER */
  /* ========================================================= */

  const filteredInspections =
    inspections.filter((item) => {

      const matchesSearch =

        item.item?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.condition
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =

        statusFilter === "all"

          ? true

          : item.status ===
            statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* ========================================================= */
  /* STATS */
  /* ========================================================= */

  const stats = useMemo(() => {

    return {

      total:
        inspections.length,

      passed:
        inspections.filter(
          (item) =>
            item.status ===
            "passed"
        ).length,

      attention:
        inspections.filter(
          (item) =>
            item.status ===
            "attention"
        ).length,

      failed:
        inspections.filter(
          (item) =>
            item.status ===
            "failed"
        ).length,
    };

  }, [inspections]);

  /* ========================================================= */
  /* LOADING */
  /* ========================================================= */

  if (loading) {

    return (

      <Layout>

        <div className="
          py-24
          text-center
          text-gray-500
        ">

          Loading inspections...

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

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">

            Inspections

          </h1>

          <p className="
            mt-2
            text-sm
            text-gray-500
          ">

            Preventive maintenance and equipment quality control

          </p>

        </div>

        {/* ========================================================= */}
        {/* STATS */}
        {/* ========================================================= */}

        <div className="
          mt-10
          grid
          grid-cols-1
          gap-4
          md:grid-cols-4
        ">

          <StatCard
            title="Total Inspections"
            value={stats.total}
          />

          <StatCard
            title="Passed"
            value={stats.passed}
          />

          <StatCard
            title="Attention Needed"
            value={stats.attention}
          />

          <StatCard
            title="Failed"
            value={stats.failed}
          />

        </div>

        {/* ========================================================= */}
        {/* CREATE */}
        {/* ========================================================= */}

        <div className="mt-6">

          <button
            onClick={() =>
              setShowForm(!showForm)
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-3xl
              bg-blue-600
              px-6
              py-5
              text-left
              text-white
            "
          >

            <div>

              <h2 className="
                text-lg
                font-semibold
              ">

                New Inspection

              </h2>

              <p className="
                mt-1
                text-sm
                text-blue-100
              ">

                Record equipment inspection and health status

              </p>

            </div>

            <Plus size={22} />

          </button>

          {showForm && (

            <div className="mt-4">

              <Card title="Inspection Details">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  {/* ITEM */}

                  <SelectInput
                    label="Inventory Item"
                    value={
                      form.inventory_item_id
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        inventory_item_id:
                          value,
                      })
                    }
                    options={items.map(
                      (item) => ({

                        label:
                          item.name,

                        value:
                          item.id,
                      })
                    )}
                  />

                  {/* CONDITION */}

                  <SelectInput
                    label="Condition"
                    value={
                      form.condition
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        condition:
                          value,
                      })
                    }
                    options={[
                      {
                        label:
                          "Excellent",
                        value:
                          "excellent",
                      },
                      {
                        label:
                          "Good",
                        value:
                          "good",
                      },
                      {
                        label:
                          "Fair",
                        value:
                          "fair",
                      },
                      {
                        label:
                          "Poor",
                        value:
                          "poor",
                      },
                      {
                        label:
                          "Critical",
                        value:
                          "critical",
                      },
                    ]}
                  />

                  {/* STATUS */}

                  <SelectInput
                    label="Inspection Status"
                    value={
                      form.status
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        status:
                          value,
                      })
                    }
                    options={[
                      {
                        label:
                          "Passed",
                        value:
                          "passed",
                      },
                      {
                        label:
                          "Attention Needed",
                        value:
                          "attention",
                      },
                      {
                        label:
                          "Failed",
                        value:
                          "failed",
                      },
                    ]}
                  />

                  {/* NEXT */}

                  <Input
                    label="Next Inspection Due"
                    value={
                      form.next_inspection_due
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        next_inspection_due:
                          value,
                      })
                    }
                    type="date"
                    icon={
                      <CalendarClock
                        size={18}
                      />
                    }
                  />

                </div>

                {/* NOTES */}

                <div className="mt-5">

                  <label className="
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Inspection Notes

                  </label>

                  <textarea
                    rows={4}
                    value={
                      form.notes
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes:
                          e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-gray-200
                      px-4
                      py-4
                      text-sm
                      outline-none
                    "
                    placeholder="Inspection observations..."
                  />

                </div>

                {/* RECOMMENDATIONS */}

                <div className="mt-5">

                  <label className="
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Recommendations

                  </label>

                  <textarea
                    rows={4}
                    value={
                      form.recommendations
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recommendations:
                          e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-gray-200
                      px-4
                      py-4
                      text-sm
                      outline-none
                    "
                    placeholder="Recommended actions..."
                  />

                </div>

                <button
                  onClick={
                    createInspection
                  }
                  disabled={saving}
                  className="
                    mt-6
                    rounded-2xl
                    bg-blue-600
                    px-6
                    py-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >

                  {saving
                    ? "Saving..."
                    : "Create Inspection"}

                </button>

              </Card>

            </div>

          )}

        </div>

        {/* ========================================================= */}
        {/* FILTERS */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Inspection History">

            <div className="
              flex
              flex-col
              gap-4
              md:flex-row
            ">

              <div className="
                relative
                flex-1
              ">

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
                  placeholder="Search inspections..."
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

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-4
                  text-sm
                  outline-none
                "
              >

                <option value="all">
                  All Status
                </option>

                <option value="passed">
                  Passed
                </option>

                <option value="attention">
                  Attention
                </option>

                <option value="failed">
                  Failed
                </option>

              </select>

            </div>

            {/* LIST */}

            <div className="
              mt-6
              space-y-4
            ">

              {filteredInspections
                .length === 0 ? (

                <EmptyState />

              ) : (

                filteredInspections.map(
                  (item) => (

                    <InspectionCard
                      key={item.id}
                      item={item}
                    />

                  )
                )

              )}

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

      <div className="mt-5">

        {children}

      </div>

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
      border-gray-200
      bg-white
      p-5
    ">

      <p className="
        text-sm
        text-gray-500
      ">

        {title}

      </p>

      <h3 className="
        mt-3
        text-2xl
        font-bold
        text-gray-900
      ">

        {value}

      </h3>

    </div>
  );
}

/* ========================================================= */
/* EMPTY */
/* ========================================================= */

function EmptyState() {

  return (

    <div className="
      rounded-2xl
      border
      border-dashed
      border-gray-300
      py-20
      text-center
    ">

      <ClipboardCheck
        size={48}
        className="
          mx-auto
          text-gray-300
        "
      />

      <h3 className="
        mt-4
        text-lg
        font-semibold
        text-gray-900
      ">

        No inspections found

      </h3>

      <p className="
        mt-2
        text-sm
        text-gray-500
      ">

        Inspection records will appear here

      </p>

    </div>
  );
}

/* ========================================================= */
/* INSPECTION CARD */
/* ========================================================= */

function InspectionCard({
  item,
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-gray-200
      p-5
    ">

      <div className="
        flex
        flex-col
        gap-5
        lg:flex-row
        lg:items-start
        lg:justify-between
      ">

        <div className="flex-1">

          <h3 className="
            text-xl
            font-bold
            text-gray-900
          ">

            {item.item?.name}

          </h3>

          <div className="
            mt-5
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          ">

            <InfoRow
              icon={
                <ShieldCheck
                  size={18}
                />
              }
              label="Condition"
              value={
                item.condition
              }
            />

            <InfoRow
              icon={
                <ClipboardCheck
                  size={18}
                />
              }
              label="Status"
              value={
                item.status
              }
            />

            <InfoRow
              icon={
                <CalendarClock
                  size={18}
                />
              }
              label="Inspection Date"
              value={
                item.inspection_date
                  ? new Date(
                    item.inspection_date
                  ).toLocaleDateString()
                  : "—"
              }
            />

            <InfoRow
              icon={
                <AlertTriangle
                  size={18}
                />
              }
              label="Next Inspection"
              value={
                item.next_inspection_due
                  ? new Date(
                    item.next_inspection_due
                  ).toLocaleDateString()
                  : "—"
              }
            />

          </div>

          {item.notes && (

            <div className="
              mt-5
              rounded-2xl
              bg-gray-50
              p-4
            ">

              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-gray-400
              ">

                Notes

              </p>

              <p className="
                mt-2
                text-sm
                text-gray-700
              ">

                {item.notes}

              </p>

            </div>

          )}

          {item.recommendations && (

            <div className="
              mt-4
              rounded-2xl
              bg-blue-50
              p-4
            ">

              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-blue-400
              ">

                Recommendations

              </p>

              <p className="
                mt-2
                text-sm
                text-blue-800
              ">

                {item.recommendations}

              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

/* ========================================================= */
/* INPUT */
/* ========================================================= */

function Input({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder = "",
}) {

  return (

    <div>

      <label className="
        text-sm
        font-medium
        text-gray-700
      ">

        {label}

      </label>

      <div className="
        relative
        mt-2
      ">

        {icon && (

          <div className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
          ">

            {icon}

          </div>

        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`
            w-full
            rounded-2xl
            border
            border-gray-200
            bg-white
            ${icon
              ? "pl-12"
              : "pl-4"
            }
            pr-4
            py-4
            text-sm
            outline-none
          `}
        />

      </div>

    </div>
  );
}

/* ========================================================= */
/* SELECT */
/* ========================================================= */

function SelectInput({
  label,
  value,
  onChange,
  options,
}) {

  return (

    <div>

      <label className="
        text-sm
        font-medium
        text-gray-700
      ">

        {label}

      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          mt-2
          w-full
          rounded-2xl
          border
          border-gray-200
          bg-white
          px-4
          py-4
          text-sm
          outline-none
        "
      >

        <option value="">
          Select
        </option>

        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >

            {option.label}

          </option>

        ))}

      </select>

    </div>
  );
}

/* ========================================================= */
/* INFO */
/* ========================================================= */

function InfoRow({
  icon,
  label,
  value,
}) {

  return (

    <div className="
      flex
      items-start
      gap-3
    ">

      <div className="
        mt-0.5
        text-gray-400
      ">

        {icon}

      </div>

      <div>

        <p className="
          text-xs
          text-gray-500
        ">

          {label}

        </p>

        <p className="
          mt-1
          text-sm
          font-medium
          text-gray-900
        ">

          {value}

        </p>

      </div>

    </div>
  );
}