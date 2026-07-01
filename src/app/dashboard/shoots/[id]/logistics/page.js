"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ArrowLeft,
  Truck,
  Car,
  User,
  MapPin,
  Clock3,
  Plus,
  Building2,
  Wallet,
  Trash2,
  Search,
} from "lucide-react";

export default function ShootLogisticsPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pickupTime, setPickupTime] = useState(null);
  const [logisticsList, setLogisticsList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    logistics_type: "internal_transport",
    vehicle: "",
    driver_name: "",
    pickup_location: "",
    vendor_name: "",
    estimated_cost: "",
    status: "pending",
  });

  const confirmDialog = useConfirm();

  /* ========================================================= */
  /* FETCH                                                      */
  /* ========================================================= */

  const fetchShoot = async () => {
    try {
      const res = await api.get(`/shoots/${params.id}`);
      setLogisticsList(res.data.logistics || []);
    } catch {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load logistics" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoot();
  }, []);

  /* ========================================================= */
  /* SAVE                                                       */
  /* ========================================================= */

  const saveLogistics = async () => {
    if (!form.vehicle) {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Vehicle is required" });
      return;
    }

    setSaving(true);

    const pToastId = progressToast.loading({ title: "Saving...", message: "Adding transport..." });

    try {
      await api.post(`/shoots/${params.id}/logistics`, {
        ...form,
        pickup_time: pickupTime,
      });

      progressToast.success(pToastId, { title: "Added", message: "Transport added" });

      setForm({
        logistics_type: "internal_transport",
        vehicle: "",
        driver_name: "",
        pickup_location: "",
        vendor_name: "",
        estimated_cost: "",
        status: "pending",
      });

      setPickupTime(null);
      setShowForm(false);
      fetchShoot();
    } catch {
      progressToast.error(pToastId, { title: "Error", message: "Failed to create transport" });
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================= */
  /* DELETE                                                     */
  /* ========================================================= */

  const deleteLogistics = async (id) => {
    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Transport",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(`/logistics/${id}`),
    });

    if (!ok) return;

    fetchShoot();
  };

  /* ========================================================= */
  /* STATUS                                                     */
  /* ========================================================= */

  const updateStatus = async (id, status) => {
    const pToastId = progressToast.loading({ title: "Updating...", message: "Updating status..." });
    try {
      await api.patch(`/logistics/${id}/status`, { status });
      progressToast.success(pToastId, { title: "Updated", message: "Status updated" });
      fetchShoot();
    } catch {
      progressToast.error(pToastId, { title: "Error", message: "Failed updating status" });
    }
  };

  /* ========================================================= */
  /* FILTER                                                     */
  /* ========================================================= */

  const filteredLogistics = logisticsList.filter((item) => {
    const matchesSearch =
      item.vehicle?.toLowerCase().includes(search.toLowerCase()) ||
      item.driver_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ========================================================= */
  /* STATS                                                      */
  /* ========================================================= */

  const stats = useMemo(() => {
    return {
      total: logisticsList.length,
      active: logisticsList.filter(
        (item) => item.status === "ready" || item.status === "in_transit"
      ).length,
      completed: logisticsList.filter((item) => item.status === "completed")
        .length,
    };
  }, [logisticsList]);

  /* ========================================================= */
  /* LOADING                                                    */
  /* ========================================================= */

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center text-gray-500">
          Loading transport...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl pb-24">

        {/* ========================================================= */}
        {/* HEADER                                                     */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="
                inline-flex items-center gap-2
                rounded-2xl border border-gray-200
                bg-white px-4 py-3
                text-sm font-medium text-gray-700
                hover:bg-gray-50
              "
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Transport & Logistics
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage vehicles, drivers and transport movement
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STATS                                                      */}
        {/* ========================================================= */}

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SimpleCard title="Total Vehicles" value={stats.total} />
          <SimpleCard title="Active" value={stats.active} />
          <SimpleCard title="Completed" value={stats.completed} />
        </div>

        {/* ========================================================= */}
        {/* ADD TRANSPORT BUTTON                                       */}
        {/* ========================================================= */}

        <div className="mt-6">
          <button
            onClick={() => setShowForm(true)}
            className="
              w-full flex items-center justify-between
              rounded-3xl bg-blue-600
              px-6 py-5 text-left text-white
              hover:bg-blue-700 transition-all
            "
          >
            <div>
              <h2 className="text-lg font-semibold">Add Transport</h2>
              <p className="mt-1 text-sm text-blue-100">
                Add vehicle and driver details
              </p>
            </div>
            <Plus size={22} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* ADD TRANSPORT MODAL                                        */}
        {/* ========================================================= */}

        {showForm && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/60 backdrop-blur-sm
              p-4
            "
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowForm(false);
            }}
          >
            <div
              className="
                w-full max-w-2xl
                max-h-[90vh] overflow-y-auto
                rounded-3xl border border-gray-200
                bg-white shadow-2xl
              "
            >
              <div className="p-8">

                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Add Transport
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Fill in vehicle and driver details
                    </p>
                  </div>

                  <button
                    onClick={() => setShowForm(false)}
                    className="
                      rounded-2xl border border-gray-200
                      bg-white px-5 py-3
                      text-sm font-medium text-gray-700
                      hover:bg-gray-50
                    "
                  >
                    Close
                  </button>
                </div>

                {/* FORM FIELDS */}
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                  <SelectInput
                    label="Transport Type"
                    value={form.logistics_type}
                    onChange={(value) =>
                      setForm({ ...form, logistics_type: value })
                    }
                    options={[
                      { label: "Internal Transport", value: "internal_transport" },
                      { label: "Uber", value: "uber" },
                      { label: "Equipment Transport", value: "equipment_transport" },
                      { label: "Talent Transport", value: "talent_transport" },
                    ]}
                  />

                  <Input
                    icon={<Car size={18} />}
                    label="Vehicle"
                    value={form.vehicle}
                    onChange={(value) => setForm({ ...form, vehicle: value })}
                    placeholder="Toyota Hiace"
                  />

                  <Input
                    icon={<User size={18} />}
                    label="Driver Name"
                    value={form.driver_name}
                    onChange={(value) => setForm({ ...form, driver_name: value })}
                    placeholder="Ahmed Khan"
                  />

                  <Input
                    icon={<MapPin size={18} />}
                    label="Pickup Location"
                    value={form.pickup_location}
                    onChange={(value) =>
                      setForm({ ...form, pickup_location: value })
                    }
                    placeholder="Studio"
                  />

                  <Input
                    icon={<Building2 size={18} />}
                    label="Vendor"
                    value={form.vendor_name}
                    onChange={(value) => setForm({ ...form, vendor_name: value })}
                    placeholder="Vendor name"
                  />

                  <Input
                    icon={<Wallet size={18} />}
                    label="Estimated Cost"
                    value={form.estimated_cost}
                    onChange={(value) =>
                      setForm({ ...form, estimated_cost: value })
                    }
                    placeholder="25000"
                  />

                </div>

                {/* PICKUP TIME */}
                <div className="mt-5">
                  <label className="text-sm font-medium text-gray-700">
                    Pickup Time
                  </label>
                  <div className="mt-2">
                    <DatePicker
                      selected={pickupTime}
                      onChange={(date) => setPickupTime(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Select pickup time"
                      className="
                        w-full rounded-2xl border border-gray-200
                        bg-white px-4 py-4 text-sm outline-none
                      "
                    />
                  </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="
                      rounded-2xl border border-gray-200
                      bg-white px-6 py-4
                      text-sm font-medium text-gray-700
                      hover:bg-gray-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveLogistics}
                    disabled={saving}
                    className="
                      inline-flex items-center gap-2
                      rounded-2xl bg-blue-600
                      px-6 py-4
                      text-sm font-semibold text-white
                      hover:bg-blue-700
                      disabled:opacity-60
                    "
                  >
                    <Plus size={18} />
                    {saving ? "Saving..." : "Add Transport"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TRANSPORT LIST                                             */}
        {/* ========================================================= */}

        <div className="mt-6">
          <Card title="Transport List">

            <div className="flex flex-col gap-4 md:flex-row">

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vehicles or drivers..."
                  className="
                    w-full rounded-2xl border border-gray-200
                    bg-white pl-12 pr-4 py-4
                    text-sm outline-none
                  "
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  rounded-2xl border border-gray-200
                  bg-white px-5 py-4
                  text-sm outline-none
                "
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="ready">Ready</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>

            </div>

            {/* LIST */}
            <div className="mt-6 space-y-4">
              {filteredLogistics.length === 0 ? (
                <div
                  className="
                    rounded-2xl border border-dashed border-gray-300
                    py-14 text-center
                  "
                >
                  <Truck size={42} className="mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No transport found
                  </h3>
                </div>
              ) : (
                filteredLogistics.map((item) => (
                  <TransportCard
                    key={item.id}
                    item={item}
                    onDelete={deleteLogistics}
                    updateStatus={updateStatus}
                  />
                ))
              )}
            </div>

          </Card>
        </div>

      </div>
    </Layout>
  );
}

/* ========================================================= */
/* CARD                                                       */
/* ========================================================= */

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/* ========================================================= */
/* SIMPLE CARD                                               */
/* ========================================================= */

function SimpleCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-3 text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  );
}

/* ========================================================= */
/* TRANSPORT CARD                                            */
/* ========================================================= */

function TransportCard({ item, onDelete, updateStatus }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{item.vehicle}</h3>

          <div className="mt-5 space-y-4">
            <InfoRow
              icon={<User size={18} />}
              label="Driver"
              value={item.driver_name || "Not assigned"}
            />
            <InfoRow
              icon={<MapPin size={18} />}
              label="Pickup"
              value={item.pickup_location || "Not added"}
            />
            <InfoRow
              icon={<Building2 size={18} />}
              label="Vendor"
              value={item.vendor_name || "Not added"}
            />
            <InfoRow
              icon={<Wallet size={18} />}
              label="Cost"
              value={`Rs ${item.estimated_cost || 0}`}
            />
            <InfoRow
              icon={<Clock3 size={18} />}
              label="Pickup Time"
              value={
                item.pickup_time
                  ? new Date(item.pickup_time).toLocaleString()
                  : "Not scheduled"
              }
            />
            <InfoRow
              icon={<Truck size={18} />}
              label="Status"
              value={item.status?.replaceAll("_", " ") || "Pending"}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3">

          {item.status === "pending" && (
            <button
              onClick={() => updateStatus(item.id, "ready")}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Mark Ready
            </button>
          )}

          {item.status === "ready" && (
            <button
              onClick={() => updateStatus(item.id, "in_transit")}
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Start Trip
            </button>
          )}

          {item.status === "in_transit" && (
            <button
              onClick={() => updateStatus(item.id, "completed")}
              className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Mark Completed
            </button>
          )}

          {item.status !== "completed" && item.status !== "delayed" && (
            <button
              onClick={() => updateStatus(item.id, "delayed")}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Mark Delayed
            </button>
          )}

          {item.status === "delayed" && (
            <button
              onClick={() => updateStatus(item.id, "ready")}
              className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Resume Trip
            </button>
          )}

          <button
            onClick={() => onDelete(item.id)}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-red-200 bg-red-50
              px-5 py-3 text-sm font-semibold text-red-600
            "
          >
            <Trash2 size={16} />
            Delete
          </button>

        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* INPUT                                                      */
/* ========================================================= */

function Input({ label, value, onChange, icon, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-2">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full rounded-2xl border border-gray-200
            bg-white pl-12 pr-4 py-4
            text-sm outline-none
          "
        />
      </div>
    </div>
  );
}

/* ========================================================= */
/* SELECT INPUT                                              */
/* ========================================================= */

function SelectInput({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          mt-2 w-full rounded-2xl border border-gray-200
          bg-white px-4 py-4 text-sm outline-none
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ========================================================= */
/* INFO ROW                                                  */
/* ========================================================= */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}