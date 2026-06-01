"use client";

import { useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import toast from "react-hot-toast";

import {
  ArrowLeft,
  Package,
  Plus,
  Search,
  User,
  CheckCircle2,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Boxes,
} from "lucide-react";

export default function ShootInventoryPage() {

  const params = useParams();

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [inventoryList, setInventoryList] =
    useState([]);

  const [items, setItems] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showReturnModal, setShowReturnModal] =
    useState(false);

  const [returnType, setReturnType] =
    useState("partial");

  const [selectedUsage, setSelectedUsage] =
    useState(null);

  const [returnForm, setReturnForm] =
    useState({

      returned_quantity: 1,

      damaged_quantity: 0,

      lost_quantity: 0,

      notes: "",
    });

  const [form, setForm] =
    useState({

      inventory_item_id: "",

      assigned_to: "",

      quantity: 1,

      notes: "",
    });

  const selectedItem = items.find(
    (item) =>
      item.id == form.inventory_item_id
  );

  /* ========================================================= */
  /* FETCH */
  /* ========================================================= */

  const fetchData = async () => {

    try {

      const [
        shootInventoryRes,
        itemsRes,
        usersRes,
      ] = await Promise.all([

        api.get(
          `/shoots/${params.id}/inventory`
        ),

        api.get(
          "/inventory/items"
        ),

        api.get(
          "/users"
        ),
      ]);

      setInventoryList(

        shootInventoryRes.data
          .inventory || []
      );

      setItems(

        itemsRes.data?.data ||

        itemsRes.data ||

        []
      );

      let usersData = [];

      if (
        Array.isArray(
          usersRes?.data?.users?.data
        )
      ) {

        usersData =
          usersRes.data.users.data;

      } else if (

        Array.isArray(
          usersRes?.data?.data
        )

      ) {

        usersData =
          usersRes.data.data;

      } else if (

        Array.isArray(
          usersRes?.data
        )

      ) {

        usersData =
          usersRes.data;
      }

      setUsers(usersData);

    } catch {

      toast.error(
        "Failed loading inventory"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  /* ========================================================= */
  /* SAVE */
  /* ========================================================= */

  const allocateInventory = async () => {

    if (
      !form.inventory_item_id
    ) {

      toast.error(
        "Select inventory item"
      );

      return;
    }

    setSaving(true);

    try {

      await api.post(

        `/shoots/${params.id}/inventory`,

        form
      );

      toast.success(
        "Inventory allocated"
      );

      setForm({

        inventory_item_id: "",

        assigned_to: "",

        quantity: 1,

        notes: "",
      });

      setShowForm(false);

      fetchData();

    } catch (error) {

      toast.error(

        error.response?.data
          ?.message ||

        "Allocation failed"
      );

    } finally {

      setSaving(false);
    }
  };

  /* ========================================================= */
  /* CHECKOUT */
  /* ========================================================= */

  const checkoutItem = async (
    id
  ) => {

    try {

      await api.post(
        `/shoot-inventory/${id}/checkout`
      );

      toast.success(
        "Checked out"
      );

      fetchData();

    } catch {

      toast.error(
        "Checkout failed"
      );
    }
  };

  /* ========================================================= */
  /* RETURN */
  /* ========================================================= */

  const processReturn = async () => {

    try {

      await api.post(

        `/shoot-inventory/${selectedUsage.id}/return`,

        returnForm
      );

      toast.success(
        "Return processed"
      );

      setShowReturnModal(false);

      setSelectedUsage(null);

      fetchData();

    } catch (error) {
      console.log(error.response?.data);

      toast.error(
        error.response?.data?.message ||
        "Return failed"
      );
    }
  };

  /* ========================================================= */
  /* DELETE */
  /* ========================================================= */

  const deleteAllocation = async (
    id
  ) => {

    const confirmed =
      confirm(
        "Delete allocation?"
      );

    if (!confirmed) return;

    try {

      await api.delete(
        `/shoot-inventory/${id}`
      );

      toast.success(
        "Allocation deleted"
      );

      fetchData();

    } catch {

      toast.error(
        "Delete failed"
      );
    }
  };

  /* ========================================================= */
  /* FILTER */
  /* ========================================================= */

  const filteredInventory =
    inventoryList.filter((item) => {

      const matchesSearch =

        item.item?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.assignedUser?.name
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
        inventoryList.length,

      checkedOut:
        inventoryList.filter(
          (item) =>
            item.status ===
            "checked_out"
        ).length,

      returned:
        inventoryList.filter(
          (item) =>
            item.status ===
            "returned"
        ).length,

      lost:
        inventoryList.reduce(
          (sum, item) =>
            sum +
            (item.lost_quantity ||
              0),
          0
        ),
    };

  }, [inventoryList]);

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

          Loading inventory...

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="
        mx-auto
        max-w-6xl
        pb-24
      ">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-start
          lg:justify-between
        ">

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
                hover:bg-gray-50
              "
            >

              <ArrowLeft size={16} />

              Back

            </button>

            <h1 className="
              mt-6
              text-3xl
              font-bold
              text-gray-900
            ">

              Shoot Inventory

            </h1>

            <p className="
              mt-2
              text-sm
              text-gray-500
            ">

              Allocate and track equipment for production

            </p>

          </div>

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

          <SimpleCard
            title="Total Allocations"
            value={stats.total}
          />

          <SimpleCard
            title="Checked Out"
            value={stats.checkedOut}
          />

          <SimpleCard
            title="Returned"
            value={stats.returned}
          />

          <SimpleCard
            title="Lost Items"
            value={stats.lost}
          />

        </div>

        {/* ========================================================= */}
        {/* ADD INVENTORY */}
        {/* ========================================================= */}

        <div className="mt-6">

          <button
            onClick={() =>
              setShowForm(!showForm)
            }
            className="
              w-full
              flex
              items-center
              justify-between
              rounded-3xl
              bg-blue-600
              px-6
              py-5
              text-left
              text-white
              hover:bg-blue-700
            "
          >

            <div>

              <h2 className="
                text-lg
                font-semibold
              ">

                Allocate Inventory

              </h2>

              <p className="
                mt-1
                text-sm
                text-blue-100
              ">

                Assign equipment to crew

              </p>

            </div>

            <Plus size={22} />

          </button>

          {showForm && (

            <div className="mt-4">

              <Card title="Inventory Allocation">

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
                          `${item.name} (${item.calculated_available}/${item.quantity} available)`,

                        value:
                          item.id,
                      })
                    )}
                  />

                  {selectedItem && (
                    <div className="
    -mt-2
    flex
    items-center
    gap-2
    px-1
    text-xs
  ">

                      <span
                        className={`
        h-2.5
        w-2.5
        rounded-full
        ${selectedItem.calculated_available > 0
                            ? "bg-green-500"
                            : "bg-red-500"
                          }
      `}
                      />

                      <span className="text-gray-500">
                        {selectedItem.calculated_available} of {selectedItem.quantity} available
                      </span>

                      <span
                        className={`
        rounded-full
        px-2
        py-0.5
        text-[11px]
        font-medium
        ${selectedItem.calculated_available > 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                          }
      `}
                      >
                        {selectedItem.status}
                      </span>

                    </div>
                  )}

                  {/* USER */}

                  <SelectInput
                    label="Assigned To"
                    value={
                      form.assigned_to
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        assigned_to:
                          value,
                      })
                    }
                    options={users.map(
                      (user) => ({

                        label:
                          user.name,

                        value:
                          user.id,
                      })
                    )}
                  />

                  {/* QUANTITY */}

                  <Input
                    label="Quantity"
                    value={form.quantity}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        quantity: value,
                      })
                    }
                    icon={<Boxes size={18} />}
                    type="number"
                    max={selectedItem?.calculated_available || 1}
                  />

                </div>

                {/* NOTES */}

                <div className="mt-5">

                  <label className="
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Notes

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
                      bg-white
                      px-4
                      py-4
                      text-sm
                      outline-none
                    "
                    placeholder="Allocation notes..."
                  />

                </div>

                <button
                  onClick={
                    allocateInventory
                  }
                  disabled={saving}
                  className="
                    mt-6
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
                    hover:bg-blue-700
                  "
                >

                  <Plus size={18} />

                  {saving
                    ? "Allocating..."
                    : "Allocate Inventory"}

                </button>

              </Card>

            </div>

          )}

        </div>

        {/* ========================================================= */}
        {/* FILTERS */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Inventory List">

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
                  placeholder="Search inventory..."
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

                <option value="reserved">
                  Reserved
                </option>

                <option value="checked_out">
                  Checked Out
                </option>

                <option value="partially_returned">
                  Partial Return
                </option>

                <option value="returned">
                  Returned
                </option>

              </select>

            </div>

            {/* LIST */}

            <div className="
              mt-6
              space-y-4
            ">

              {filteredInventory.length ===
                0 ? (

                <div className="
                  rounded-2xl
                  border
                  border-dashed
                  border-gray-300
                  py-14
                  text-center
                ">

                  <Package
                    size={42}
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

                    No inventory found

                  </h3>

                </div>

              ) : (

                filteredInventory.map(
                  (item) => (

                    <InventoryCard
                      key={item.id}
                      item={item}
                      onCheckout={
                        checkoutItem
                      }
                      onDelete={
                        deleteAllocation
                      }
                      onReturn={() => {

                        setSelectedUsage(item);

                        const remaining =
                          item.quantity
                          -
                          item.returned_quantity
                          -
                          (item.lost_quantity || 0);

                        setReturnType("partial");

                        setReturnForm({
                          returned_quantity: remaining > 0 ? 1 : 0,
                          damaged_quantity: 0,
                          lost_quantity: 0,
                          notes: "",
                        });

                        setShowReturnModal(true);
                      }}
                    />

                  )
                )

              )}

            </div>

          </Card>

        </div>

      </div>

      {/* ========================================================= */}
      {/* RETURN MODAL */}
      {/* ========================================================= */}

      {showReturnModal && (() => {
        const outstanding =
          selectedUsage.quantity -
          selectedUsage.returned_quantity -
          (selectedUsage.lost_quantity || 0);

        const handleReturnType = (type) => {
  setReturnType(type);

  const outstanding =
    selectedUsage.quantity -
    selectedUsage.returned_quantity -
    (selectedUsage.lost_quantity || 0);

  switch (type) {
    case "full":
      setReturnForm({
        returned_quantity: outstanding,
        damaged_quantity: 0,
        lost_quantity: 0,
        notes: "",
      });
      break;

    case "partial":
      setReturnForm({
        returned_quantity: 1,
        damaged_quantity: 0,
        lost_quantity: 0,
        notes: "",
      });
      break;

    case "damaged":
      setReturnForm({
        returned_quantity: 1,
        damaged_quantity: 1,
        lost_quantity: 0,
        notes: "",
      });
      break;

    case "lost":
      setReturnForm({
        returned_quantity: 0,
        damaged_quantity: 0,
        lost_quantity: 1,
        notes: "",
      });
      break;

    case "mixed":
      setReturnForm({
        returned_quantity: 1,
        damaged_quantity: 0,
        lost_quantity: 0,
        notes: "",
      });
      break;
  }
};

        return (
          <div className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/60 backdrop-blur-sm
      p-4
    ">

            <div className="
        w-full
        max-w-5xl
        max-h-[92vh]
        overflow-y-auto
        rounded-3xl
        bg-white
        shadow-2xl
      ">

              <div className="p-6 md:p-8">

                {/* HEADER */}

                <div className="
            flex flex-col gap-4
            border-b border-gray-100
            pb-6
            md:flex-row md:items-center md:justify-between
          ">

                  <div>
                    <h2 className="
                text-2xl md:text-3xl
                font-bold text-gray-900
              ">
                      Process Return
                    </h2>

                    <p className="
                mt-1 text-sm text-gray-500
              ">
                      Manage returned inventory
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowReturnModal(false)
                    }
                    className="
                rounded-2xl
                border border-gray-200
                px-5 py-3
                text-sm font-medium
              "
                  >
                    Close
                  </button>

                </div>

                {/* STATS */}

                <div className="
            mt-6
            grid grid-cols-2 gap-4
            lg:grid-cols-4
          ">

                  <StatBox
                    label="Allocated"
                    value={selectedUsage.quantity}
                  />

                  <StatBox
                    label="Returned"
                    value={selectedUsage.returned_quantity}
                  />

                  <StatBox
                    label="Lost"
                    value={selectedUsage.lost_quantity || 0}
                  />

                  <StatBox
                    label="Outstanding"
                    value={outstanding}
                  />

                </div>

                {/* RETURN TYPE */}

                <div className="mt-8">

                  <label className="
              text-sm font-semibold text-gray-700
            ">
                    Return Type
                  </label>

                  <div className="
              mt-3
              grid grid-cols-2 gap-3
              md:grid-cols-3
              lg:grid-cols-5
            ">

                    {[
                      "full",
                      "partial",
                      "damaged",
                      "lost",
                      "mixed",
                    ].map((type) => (

                      <button
                        key={type}
                        onClick={() =>
                          handleReturnType(type)
                        }
                        className={`
                    rounded-2xl
                    px-4 py-3
                    text-sm font-semibold
                    transition-all

                    ${returnType === type
                            ? "bg-blue-600 text-white shadow-lg"
                            : "border border-gray-200 bg-white hover:bg-gray-50"
                          }
                  `}
                      >
                        {type}
                      </button>

                    ))}

                  </div>

                </div>

                {/* INPUTS */}

                <div className="
            mt-8
            grid grid-cols-1 gap-5
            md:grid-cols-2
          ">

                  {returnType !== "lost" && (
                    <Input
                      label="Returned Quantity"
                      value={returnForm.returned_quantity}
                      onChange={(value) =>
                        setReturnForm({
                          ...returnForm,
                          returned_quantity:
                            Number(value),
                        })
                      }
                      type="number"
                    />
                  )}

                  {(returnType === "damaged" ||
                    returnType === "mixed") && (
                      <Input
                        label="Damaged Quantity"
                        value={returnForm.damaged_quantity}
                        onChange={(value) =>
                          setReturnForm({
                            ...returnForm,
                            damaged_quantity:
                              Number(value),
                          })
                        }
                        type="number"
                      />
                    )}

                  {(returnType === "lost" ||
                    returnType === "mixed") && (
                      <Input
                        label="Lost Quantity"
                        value={returnForm.lost_quantity}
                        onChange={(value) =>
                          setReturnForm({
                            ...returnForm,
                            lost_quantity:
                              Number(value),
                          })
                        }
                        type="number"
                      />
                    )}

                </div>

                {/* NOTES */}

                <div className="mt-8">

                  <label className="
              text-sm font-semibold text-gray-700
            ">
                    Notes
                  </label>

                  <textarea
                    rows={5}
                    value={returnForm.notes}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        notes: e.target.value,
                      })
                    }
                    className="
                mt-3
                w-full
                rounded-2xl
                border border-gray-200
                px-4 py-4
                text-sm
                outline-none
                focus:border-blue-500
              "
                    placeholder="Return notes..."
                  />

                </div>

                {/* ACTIONS */}

                <div className="
            mt-8
            flex flex-col gap-3
            sm:flex-row sm:justify-end
          ">

                  <button
                    onClick={() =>
                      setShowReturnModal(false)
                    }
                    className="
                rounded-2xl
                border border-gray-200
                px-6 py-4
                font-medium
              "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={processReturn}
                    className="
                rounded-2xl
                bg-blue-600
                px-6 py-4
                font-semibold
                text-white
                hover:bg-blue-700
              "
                  >
                    Process Return
                  </button>

                </div>

              </div>

            </div>

          </div>
        );
      })()}

    </Layout>
  );
}

/* ========================================================= */
/* CARD */
/* ========================================================= */

function StatBox({
  label,
  value,
}) {
  return (
    <div className="
      rounded-2xl border border-gray-200 p-4
    ">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <h3 className="
        mt-2 text-xl font-bold text-gray-900
      ">
        {value}
      </h3>
    </div>
  );
}

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
/* SIMPLE CARD */
/* ========================================================= */

function SimpleCard({
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
/* INVENTORY CARD */
/* ========================================================= */

function InventoryCard({
  item,
  onCheckout,
  onDelete,
  onReturn,
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
                <User size={18} />
              }
              label="Assigned To"
              value={
                item.assignedUser
                  ?.name ||
                "Not assigned"
              }
            />

            <InfoRow
              icon={
                <Boxes size={18} />
              }
              label="Quantity"
              value={item.quantity}
            />

            <InfoRow
              icon={
                <CheckCircle2 size={18} />
              }
              label="Returned"
              value={
                item.returned_quantity
              }
            />

            <InfoRow
              icon={
                <AlertTriangle size={18} />
              }
              label="Lost"
              value={
                item.lost_quantity
              }
            />

            <InfoRow
              icon={
                <Package size={18} />
              }
              label="Status"
              value={
                item.status?.replaceAll(
                  "_",
                  " "
                )
              }
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="
          flex
          flex-col
          gap-3
        ">

          {item.status ===
            "reserved" && (

              <button
                onClick={() =>
                  onCheckout(item.id)
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

                Check Out

              </button>

            )}

          {(item.status ===
            "checked_out" ||

            item.status ===
            "partially_returned") && (

              <button
                onClick={onReturn}
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

                Return Item

              </button>

            )}

          {item.status ===
            "reserved" && (

              <button
                onClick={() =>
                  onDelete(item.id)
                }
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

                Delete

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
  max,
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
          max={max}
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
/* INFO ROW */
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