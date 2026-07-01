"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  AlertTriangle,
  Plus,
  Search,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  Trash2,
  Boxes,
} from "lucide-react";

export default function DamageReportsPage() {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [reports, setReports] =
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

      severity: "low",

      issue_type: "",

      description: "",

      estimated_cost: "",
    });

  /* ========================================================= */
  /* FETCH */
  /* ========================================================= */

  const fetchData = async () => {

    try {

      const [
        reportsRes,
        itemsRes,
      ] = await Promise.all([

        api.get(
          "/inventory/damage-reports"
        ),

        api.get(
          "/inventory/items"
        ),
      ]);

      setReports(

        reportsRes.data
          ?.reports?.data ||

        []
      );

      setItems(

        itemsRes.data?.data ||

        itemsRes.data ||

        []
      );

    } catch {

      const pToastId = progressToast.loading({ title: "Error", message: "Failed loading reports" });
      progressToast.error(pToastId, { title: "Error", message: "Failed loading reports" });

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

  const createReport = async () => {

    if (
      !form.inventory_item_id
    ) {

      const pToastId = progressToast.loading({ title: "Error", message: "Select inventory item" });
      progressToast.error(pToastId, { title: "Error", message: "Select inventory item" });

      return;
    }

    setSaving(true);

    const pToastId = progressToast.loading({ title: "Creating...", message: "Creating damage report..." });

    try {

      await api.post(

        "/inventory/damage-reports",

        form
      );

      progressToast.success(pToastId, { title: "Created", message: "Damage report created" });

      setForm({

        inventory_item_id: "",

        severity: "low",

        issue_type: "",

        description: "",

        estimated_cost: "",
      });

      setShowForm(false);

      fetchData();

    } catch {

      progressToast.error(pToastId, { title: "Error", message: "Failed creating report" });

    } finally {

      setSaving(false);
    }
  };

  /* ========================================================= */
  /* STATUS */
  /* ========================================================= */

  const updateStatus = async (
    id,
    status
  ) => {

    const pToastId = progressToast.loading({ title: "Updating...", message: "Updating status..." });

    try {

      await api.patch(

        `/inventory/damage-reports/${id}/status`,

        { status }
      );

      progressToast.success(pToastId, { title: "Updated", message: "Status updated" });

      fetchData();

    } catch {

      progressToast.error(pToastId, { title: "Error", message: "Update failed" });
    }
  };

  /* ========================================================= */
  /* FILTER */
  /* ========================================================= */

  const filteredReports =
    reports.filter((item) => {

      const matchesSearch =

        item.item?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.issue_type
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
        reports.length,

      pending:
        reports.filter(
          (item) =>
            item.status ===
            "pending"
        ).length,

      repair:
        reports.filter(
          (item) =>
            item.status ===
            "repair"
        ).length,

      resolved:
        reports.filter(
          (item) =>
            item.status ===
            "resolved"
        ).length,
    };

  }, [reports]);

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

          Loading damage reports...

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

        {/* HEADER */}

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">

            Damage Reports

          </h1>

          <p className="
            mt-2
            text-sm
            text-gray-500
          ">

            Track damaged inventory and maintenance workflows

          </p>

        </div>

        {/* STATS */}

        <div className="
          mt-10
          grid
          grid-cols-1
          gap-4
          md:grid-cols-4
        ">

          <StatCard
            title="Total Reports"
            value={stats.total}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
          />

          <StatCard
            title="Repair"
            value={stats.repair}
          />

          <StatCard
            title="Resolved"
            value={stats.resolved}
          />

        </div>

        {/* CREATE */}

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
              bg-red-600
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

                Create Damage Report

              </h2>

              <p className="
                mt-1
                text-sm
                text-red-100
              ">

                Report damaged inventory

              </p>

            </div>

            <Plus size={22} />

          </button>

          {showForm && (

            <div className="mt-4">

              <Card title="Damage Details">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

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

                  <SelectInput
                    label="Severity"
                    value={
                      form.severity
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        severity:
                          value,
                      })
                    }
                    options={[
                      {
                        label: "Low",
                        value: "low",
                      },
                      {
                        label: "Medium",
                        value: "medium",
                      },
                      {
                        label: "High",
                        value: "high",
                      },
                      {
                        label: "Critical",
                        value: "critical",
                      },
                    ]}
                  />

                  <Input
                    label="Issue Type"
                    value={
                      form.issue_type
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        issue_type:
                          value,
                      })
                    }
                    icon={
                      <AlertTriangle size={18} />
                    }
                    placeholder="Broken Screen"
                  />

                  <Input
                    label="Estimated Cost"
                    value={
                      form.estimated_cost
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        estimated_cost:
                          value,
                      })
                    }
                    icon={
                      <Boxes size={18} />
                    }
                    type="number"
                    placeholder="5000"
                  />

                </div>

                <div className="mt-5">

                  <label className="
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Description

                  </label>

                  <textarea
                    rows={5}
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
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
                    placeholder="Describe issue..."
                  />

                </div>

                <button
                  onClick={
                    createReport
                  }
                  disabled={saving}
                  className="
                    mt-6
                    rounded-2xl
                    bg-red-600
                    px-6
                    py-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >

                  {saving
                    ? "Creating..."
                    : "Create Report"}

                </button>

              </Card>

            </div>

          )}

        </div>

        {/* FILTERS */}

        <div className="mt-6">

          <Card title="Reports">

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
                  placeholder="Search reports..."
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

                <option value="pending">
                  Pending
                </option>

                <option value="inspection">
                  Inspection
                </option>

                <option value="repair">
                  Repair
                </option>

                <option value="resolved">
                  Resolved
                </option>

                <option value="writeoff">
                  Write Off
                </option>

              </select>

            </div>

            {/* LIST */}

            <div className="
              mt-6
              space-y-4
            ">

              {filteredReports.map(
                (item) => (

                  <DamageCard
                    key={item.id}
                    item={item}
                    updateStatus={
                      updateStatus
                    }
                  />

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
/* DAMAGE CARD */
/* ========================================================= */

function DamageCard({
  item,
  updateStatus,
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
            space-y-4
          ">

            <InfoRow
              icon={
                <AlertTriangle size={18} />
              }
              label="Issue"
              value={item.issue_type}
            />

            <InfoRow
              icon={
                <ShieldAlert size={18} />
              }
              label="Severity"
              value={item.severity}
            />

            <InfoRow
              icon={
                <Boxes size={18} />
              }
              label="Status"
              value={item.status}
            />

            <InfoRow
              icon={
                <Wrench size={18} />
              }
              label="Estimated Cost"
              value={`Rs ${item.estimated_cost || 0}`}
            />

          </div>

          {item.description && (

            <div className="
              mt-5
              rounded-2xl
              bg-gray-50
              p-4
            ">

              <p className="
                text-sm
                text-gray-700
              ">

                {item.description}

              </p>

            </div>

          )}

        </div>

        {/* ACTIONS */}

        <div className="
          flex
          flex-col
          gap-3
        ">

          {item.status ===
            "pending" && (

            <button
              onClick={() =>
                updateStatus(
                  item.id,
                  "inspection"
                )
              }
              className="
                rounded-2xl
                bg-orange-500
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >

              Start Inspection

            </button>

          )}

          {item.status ===
            "inspection" && (

            <button
              onClick={() =>
                updateStatus(
                  item.id,
                  "repair"
                )
              }
              className="
                rounded-2xl
                bg-blue-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >

              Send To Repair

            </button>

          )}

          {item.status ===
            "repair" && (

            <button
              onClick={() =>
                updateStatus(
                  item.id,
                  "resolved"
                )
              }
              className="
                rounded-2xl
                bg-green-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >

              Resolve

            </button>

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

        <div className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-gray-400
        ">

          {icon}

        </div>

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
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