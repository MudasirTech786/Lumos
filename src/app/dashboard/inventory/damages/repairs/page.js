"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  Wrench,
  Plus,
  Search,
  Hammer,
  BadgeDollarSign,
  UserCog,
  Boxes,
  X,
  ClipboardCheck,
} from "lucide-react";

export default function RepairsPage() {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [repairs, setRepairs] =
    useState([]);

  const [damageReports, setDamageReports] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [form, setForm] =
    useState({

      damage_report_id: "",

      vendor_name: "",

      technician_name: "",

      repair_details: "",

      repair_cost: "",
    });

  /* ========================================================= */
  /* FETCH */
  /* ========================================================= */

  const fetchData = async () => {

    try {

      const [
        repairsRes,
        reportsRes,
      ] = await Promise.all([

        api.get(
          "/inventory/repairs"
        ),

        api.get(
          "/inventory/damage-reports"
        ),
      ]);

      setRepairs(

        repairsRes.data
          ?.repairs?.data ||

        []
      );

      setDamageReports(

        reportsRes.data
          ?.reports?.data ||

        []
      );

    } catch (error) {

      console.log(error);

      const pToastId = progressToast.loading({ title: "Error", message: "Failed loading repairs" });
      progressToast.error(pToastId, { title: "Error", message: "Failed loading repairs" });

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

  const createRepair = async () => {

    if (
      !form.damage_report_id
    ) {

      const pToastId = progressToast.loading({ title: "Error", message: "Select damage report" });
      progressToast.error(pToastId, { title: "Error", message: "Select damage report" });

      return;
    }

    setSaving(true);

    const pToastId = progressToast.loading({ title: "Creating...", message: "Creating repair..." });

    try {

      await api.post(

        "/inventory/repairs",

        form
      );

      progressToast.success(pToastId, { title: "Created", message: "Repair created" });

      setForm({

        damage_report_id: "",

        vendor_name: "",

        technician_name: "",

        repair_details: "",

        repair_cost: "",
      });

      setShowForm(false);

      fetchData();

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Failed creating repair" });

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

    const pToastId = progressToast.loading({ title: "Updating...", message: "Updating repair status..." });

    try {

      await api.patch(

        `/inventory/repairs/${id}/status`,

        { status }
      );

      progressToast.success(pToastId, { title: "Updated", message: "Repair updated" });

      fetchData();

    } catch {

      progressToast.error(pToastId, { title: "Error", message: "Status update failed" });
    }
  };

  /* ========================================================= */
  /* FILTER */
  /* ========================================================= */

  const filteredRepairs =
    repairs.filter((item) => {

      const matchesSearch =

        (item.item?.name || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        (item.vendor_name || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        (item.technician_name || "")
          .toLowerCase()
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
        repairs.length,

      pending:
        repairs.filter(
          (item) =>
            item.status ===
            "pending"
        ).length,

      progress:
        repairs.filter(
          (item) =>
            item.status ===
            "in_progress"
        ).length,

      completed:
        repairs.filter(
          (item) =>
            item.status ===
            "completed"
        ).length,
    };

  }, [repairs]);

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

          Loading repairs...

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

            Repairs

          </h1>

          <p className="
            mt-2
            text-sm
            text-gray-500
          ">

            Equipment maintenance and repair workflow tracking

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
            title="Total Repairs"
            value={stats.total}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
          />

          <StatCard
            title="In Progress"
            value={stats.progress}
          />

          <StatCard
            title="Completed"
            value={stats.completed}
          />

        </div>

        {/* ========================================================= */}
        {/* CREATE */}
        {/* ========================================================= */}

        <div className="mt-6">

          <button
            onClick={() =>
              setShowForm(true)
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

                New Repair

              </h2>

              <p className="
                mt-1
                text-sm
                text-blue-100
              ">

                Create repair workflow for damaged inventory

              </p>

            </div>

            <Plus size={22} />

          </button>

        </div>

        {/* ========================================================= */}
        {/* FILTERS */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Repair Queue">

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
                  placeholder="Search repairs..."
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

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

              </select>

            </div>

            {/* LIST */}

            <div className="
              mt-6
              space-y-4
            ">

              {filteredRepairs
                .length === 0 ? (

                <EmptyState />

              ) : (

                filteredRepairs.map(
                  (item) => (

                    <RepairCard
                      key={item.id}
                      item={item}
                      updateStatus={
                        updateStatus
                      }
                    />

                  )
                )

              )}

            </div>

          </Card>

        </div>

        {/* ========================================================= */}
        {/* MODAL */}
        {/* ========================================================= */}

        {showForm && (

          <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-6
            backdrop-blur-sm
          ">

            <div className="
              w-full
              max-w-3xl
              rounded-3xl
              bg-white
              shadow-2xl
            ">

              {/* HEADER */}

              <div className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              ">

                <div>

                  <h2 className="
                    text-xl
                    font-bold
                    text-gray-900
                  ">

                    Create Repair

                  </h2>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">

                    Create repair workflow for damaged equipment

                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-gray-100
                    text-gray-500
                    transition
                    hover:bg-gray-200
                  "
                >

                  <X size={18} />

                </button>

              </div>

              {/* BODY */}

              <div className="
                max-h-[75vh]
                overflow-y-auto
                p-6
              ">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  {/* DAMAGE REPORT */}

                  <SelectInput
                    label="Damage Report"
                    value={
                      form.damage_report_id
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        damage_report_id:
                          value,
                      })
                    }
                    options={damageReports.map(
                      (report) => ({

                        label:

                          `${report.item?.name || "Unknown"}

                          (${report.issue_type})`,

                        value:
                          report.id,
                      })
                    )}
                  />

                  {/* COST */}

                  <Input
                    label="Repair Cost"
                    value={
                      form.repair_cost
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        repair_cost:
                          value,
                      })
                    }
                    type="number"
                    icon={
                      <BadgeDollarSign
                        size={18}
                      />
                    }
                    placeholder="15000"
                  />

                  {/* VENDOR */}

                  <Input
                    label="Vendor Name"
                    value={
                      form.vendor_name
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        vendor_name:
                          value,
                      })
                    }
                    icon={
                      <Boxes size={18} />
                    }
                    placeholder="Sony Service Center"
                  />

                  {/* TECHNICIAN */}

                  <Input
                    label="Technician Name"
                    value={
                      form.technician_name
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        technician_name:
                          value,
                      })
                    }
                    icon={
                      <UserCog
                        size={18}
                      />
                    }
                    placeholder="Ali Hassan"
                  />

                </div>

                {/* NOTES */}

                <div className="mt-5">

                  <label className="
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Repair Details

                  </label>

                  <textarea
                    rows={5}
                    value={
                      form.repair_details
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        repair_details:
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
                    placeholder="Repair process and technician notes..."
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="
                flex
                items-center
                justify-between
                border-t
                border-gray-100
                px-6
                py-5
              ">

                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-gray-700
                  ">

                    Workflow

                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-gray-500
                  ">

                    Pending → In Progress → Completed

                  </p>

                </div>

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <button
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-gray-600
                    "
                  >

                    Cancel

                  </button>

                  <button
                    onClick={
                      createRepair
                    }
                    disabled={saving}
                    className="
                      rounded-2xl
                      bg-blue-600
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-white
                    "
                  >

                    {saving
                      ? "Creating..."
                      : "Create Repair"}

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

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

        No repairs found

      </h3>

      <p className="
        mt-2
        text-sm
        text-gray-500
      ">

        Repair records will appear here

      </p>

    </div>
  );
}

/* ========================================================= */
/* REPAIR CARD */
/* ========================================================= */

function RepairCard({
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
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          ">

            <InfoRow
              icon={
                <Boxes size={18} />
              }
              label="Vendor"
              value={
                item.vendor_name ||
                "—"
              }
            />

            <InfoRow
              icon={
                <UserCog
                  size={18}
                />
              }
              label="Technician"
              value={
                item.technician_name ||
                "—"
              }
            />

            <InfoRow
              icon={
                <BadgeDollarSign
                  size={18}
                />
              }
              label="Repair Cost"
              value={`Rs ${item.repair_cost}`}
            />

            <InfoRow
              icon={
                <Hammer size={18} />
              }
              label="Status"
              value={
                item.status
              }
            />

          </div>

          {item.repair_details && (

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

                Repair Notes

              </p>

              <p className="
                mt-2
                text-sm
                text-gray-700
              ">

                {item.repair_details}

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
                  "in_progress"
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

              Start Repair

            </button>

          )}

          {item.status ===
            "in_progress" && (

            <button
              onClick={() =>
                updateStatus(
                  item.id,
                  "completed"
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

              Complete Repair

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