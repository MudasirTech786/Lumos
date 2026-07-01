"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";

import {
  Plus,
  Search,
  Eye,
  PackageCheck,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";

export default function ActiveUsagePage() {

  const [usages, setUsages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [selectedUsage, setSelectedUsage] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const confirmDialog = useConfirm();

  const [showReturnModal, setShowReturnModal] =
    useState(false);

  const [returnForm, setReturnForm] =
    useState({

      returned_quantity: 1,

      damaged_quantity: 0,

      lost_quantity: 0,

      client_name: "",

      notes: "",
    });

  const [items, setItems] =
    useState([]);

  const [shoots, setShoots] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const initialForm = {

    inventory_item_id: "",

    usage_type: "shoot",

    shoot_id: "",

    assigned_to: "",

    quantity: 1,

    notes: "",
  };

  const [form, setForm] =
    useState(initialForm);

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchData = async () => {

    try {

      setLoading(true);

      console.log(
        "🚀 Starting inventory usage fetch..."
      );

      const [
        usagesRes,
        itemsRes,
        shootsRes,
        usersRes,
      ] = await Promise.all([

        api.get("/inventory/usage"),

        api.get("/inventory/items"),

        api.get("/shoots"),

        api.get("/users"),
      ]);

      /* ====================================================== */
      /* DEBUG RAW RESPONSES */
      /* ====================================================== */

      console.log(
        "📦 usagesRes:",
        usagesRes
      );

      console.log(
        "📦 itemsRes:",
        itemsRes
      );

      console.log(
        "📦 shootsRes:",
        shootsRes
      );

      console.log(
        "📦 usersRes:",
        usersRes
      );

      /* ====================================================== */
      /* USAGES */
      /* ====================================================== */

      let usagesData = [];

      if (
        Array.isArray(
          usagesRes?.data?.data?.data
        )
      ) {

        usagesData =
          usagesRes.data.data.data;

      } else if (

        Array.isArray(
          usagesRes?.data?.data
        )

      ) {

        usagesData =
          usagesRes.data.data;

      } else if (

        Array.isArray(
          usagesRes?.data
        )

      ) {

        usagesData =
          usagesRes.data;
      }

      console.log(
        "✅ usagesData:",
        usagesData
      );

      /* ====================================================== */
      /* ITEMS */
      /* ====================================================== */

      let itemsData = [];

      if (
        Array.isArray(itemsRes?.data)
      ) {

        itemsData = itemsRes.data;

      } else if (

        Array.isArray(
          itemsRes?.data?.data
        )

      ) {

        itemsData =
          itemsRes.data.data;
      }

      console.log(
        "✅ itemsData:",
        itemsData
      );

      /* ====================================================== */
      /* SHOOTS */
      /* ====================================================== */

      let shootsData = [];

      if (
        Array.isArray(shootsRes?.data)
      ) {

        shootsData =
          shootsRes.data;

      } else if (

        Array.isArray(
          shootsRes?.data?.data
        )

      ) {

        shootsData =
          shootsRes.data.data;

      } else if (

        Array.isArray(
          shootsRes?.data?.shoots
        )

      ) {

        shootsData =
          shootsRes.data.shoots;
      }

      console.log(
        "✅ shootsData:",
        shootsData
      );

      /* ====================================================== */
      /* USERS */
      /* ====================================================== */

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
          usersRes?.data?.data?.data
        )

      ) {

        usersData =
          usersRes.data.data.data;

      } else if (

        Array.isArray(
          usersRes?.data?.data
        )

      ) {

        usersData =
          usersRes.data.data;

      } else if (

        Array.isArray(
          usersRes?.data?.users
        )

      ) {

        usersData =
          usersRes.data.users;

      } else if (

        Array.isArray(
          usersRes?.data
        )

      ) {

        usersData =
          usersRes.data;
      }

      console.log(
        "✅ usersData:",
        usersData
      );

      /* ====================================================== */
      /* FILTER ACTIVE */
      /* ====================================================== */

      const active =
        usagesData.filter(
          (usage) =>
            usage.status !==
            "returned"
        );

      console.log(
        "🔥 active usages:",
        active
      );

      /* ====================================================== */
      /* SET STATE */
      /* ====================================================== */

      setUsages(active);

      setItems(itemsData);

      setShoots(shootsData);

      setUsers(usersData);

    } catch (error) {

      console.log(
        "❌ FETCH ERROR"
      );

      console.log(error);

      console.log(
        "❌ error.response:",
        error.response
      );

      console.log(
        "❌ error.response.data:",
        error.response?.data
      );

      console.log(
        "❌ error.response.status:",
        error.response?.status
      );

      console.log(
        "❌ error.message:",
        error.message
      );

      const pToastId = progressToast.loading({ title: "Error", message: error.response?.data?.message || "Failed to load data" });
      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Failed to load data" });

    } finally {

      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {

    if (
      showModal ||
      showViewModal ||
      showReturnModal
    ) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "auto";
    }

    return () => {

      document.body.style.overflow =
        "auto";
    };

  }, [
    showModal,
    showViewModal,
    showReturnModal,
  ]);


  /* ====================================================== */
  /* CREATE */
  /* ====================================================== */

  const createUsage = async () => {

    const pToastId = progressToast.loading({ title: "Allocating...", message: "Allocating equipment..." });

    try {

      await api.post(
        "/inventory/usage",
        form
      );

      progressToast.success(pToastId, { title: "Allocated", message: "Equipment allocated" });

      setShowModal(false);

      setForm(initialForm);

      fetchData();

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Allocation failed" });
    }
  };

  /* ====================================================== */
  /* CHECKOUT */
  /* ====================================================== */

  const checkoutUsage =
    async (id) => {

      const pToastId = progressToast.loading({ title: "Checking Out...", message: "Checking out equipment..." });

      try {

        await api.post(
          `/inventory/usage/${id}/checkout`
        );

        progressToast.success(pToastId, { title: "Checked Out", message: "Equipment checked out" });

        fetchData();

      } catch (error) {

        console.log(error);

        progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Checkout failed" });
      }
    };


  /* ====================================================== */
  /* DELETE */
  /* ====================================================== */

  const deleteUsage =
    async (id) => {

      const ok = await confirmDialog({
        variant: "danger",
        title: "Delete Allocation",
        description: "This action cannot be undone.",
        confirmText: "Delete",
        confirmAction: () => api.delete(
          `/inventory/usage/${id}`
        ),
      });

      if (!ok) return;

      fetchData();
    };

  /* ====================================================== */
  /* RETURN */
  /* ====================================================== */

  const processReturn =
    async () => {

      const pToastId = progressToast.loading({ title: "Returning...", message: "Processing return..." });

      try {

        await api.post(

          `/inventory/usage/${selectedUsage.id}/return`,

          returnForm

        );

        progressToast.success(pToastId, { title: "Returned", message: "Equipment returned" });

        setShowReturnModal(false);

        setSelectedUsage(null);

        fetchData();

      } catch (error) {

        console.log(error);

        progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Return failed" });
      }
    };

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filteredUsages =
    useMemo(() => {

      let filtered =
        [...usages];

      if (search.trim()) {

        filtered =
          filtered.filter(
            (usage) => {

              const text = `
                ${usage.item?.name || ""}
                ${usage.shoot?.title || ""}
                ${usage.assigned_user?.name || ""}
                ${usage.status || ""}
              `.toLowerCase();

              return text.includes(
                search.toLowerCase()
              );
            }
          );
      }

      return filtered;

    }, [usages, search]);

  const selectedItem = items.find(
    (item) => item.id == form.inventory_item_id
  );

  const statusClasses = {

    reserved:
      "bg-yellow-100 text-yellow-700",

    checked_out:
      "bg-blue-100 text-blue-700",

    partially_returned:
      "bg-orange-100 text-orange-700",

    damaged:
      "bg-red-100 text-red-700",

    returned:
      "bg-green-100 text-green-700",
  };

  return (

    <Layout>

      <div className={`
        mx-auto
        max-w-7xl
        pb-24
        transition-all

        ${showModal
          ? "pointer-events-none opacity-10"
          : ""
        }
      `}>

        {/* HEADER */}

        <div className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-center
          md:justify-between
        ">

          <div>

            <h1 className="
              text-3xl
              font-bold
              text-gray-900
            ">

              Active Usage

            </h1>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">

              Track active equipment
              operations and allocations

            </p>

          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
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

            <Plus size={18} />

            Allocate Equipment

          </button>

        </div>

        {/* SEARCH */}

        <div className="mt-8">

          <div className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            shadow-sm
          ">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search usage..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                w-full
                bg-transparent
                text-sm
                text-gray-700
                outline-none
              "
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="
          mt-10
          overflow-hidden
          rounded-3xl
          border
          border-gray-200
          bg-white
        ">

          <table className="w-full">

            <thead className="
              border-b
              border-gray-200
              bg-gray-50
            ">

              <tr>

                <th className="
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                ">
                  Item
                </th>

                <th className="
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                ">
                  Type
                </th>

                <th className="
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                ">
                  Quantity
                </th>

                <th className="
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                ">
                  Assigned To
                </th>

                <th className="
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                ">
                  Status
                </th>

                <th className="
                  px-6
                  py-4
                  text-right
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-500
                ">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      py-20
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >
                    Loading usage...
                  </td>

                </tr>

              ) : filteredUsages.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      py-20
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >
                    No active usage found
                  </td>

                </tr>

              ) : (

                filteredUsages.map(
                  (usage) => {

                    console.log(
                      "🔥 usage:",
                      usage
                    );

                    return (

                      <tr
                        key={usage.id}
                        className="
                        border-b
                        border-gray-100
                      "
                      >

                        <td className="
                        px-6
                        py-5
                      ">

                          <div>

                            <h3 className="
                            font-semibold
                            text-gray-900
                          ">
                              {usage.item?.name}
                            </h3>

                            <p className="
                            mt-1
                            text-xs
                            text-gray-500
                          ">
                              {
                                usage.shoot?.title
                              }
                            </p>

                          </div>

                        </td>

                        <td className="
                        px-6
                        py-5
                        text-sm
                        capitalize
                        text-gray-600
                      ">
                          {
                            usage.usage_type
                          }
                        </td>

                        <td className="
                        px-6
                        py-5
                        text-sm
                        text-gray-600
                      ">
                          {
                            usage.quantity
                          }
                        </td>

                        <td className="
                        px-6
                        py-5
                        text-sm
                        text-gray-600
                      ">

                          {usage.assigned_user
                            ?.name || "—"}

                        </td>

                        <td className="
                        px-6
                        py-5
                      ">

                          <span className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${statusClasses[
                            usage.status
                            ]
                            }
                        `}>

                            {usage.status}

                          </span>

                        </td>

                        <td className="
  px-6
  py-5
">

                          <div className="
    flex
    items-center
    justify-end
    gap-2
  ">

                            {/* VIEW */}

                            <button
                              onClick={() => {

                                setSelectedUsage(usage);

                                setShowViewModal(true);

                              }}
                              className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-gray-200
        bg-white
        text-gray-600
        transition
        hover:bg-gray-100
      "
                              title="View Details"
                            >

                              <Eye size={16} />

                            </button>

                            {/* RESERVED → CHECKOUT */}

                            {usage.status ===
                              "reserved" && (

                                <>
                                  <button
                                    onClick={() =>
                                      checkoutUsage(
                                        usage.id
                                      )
                                    }
                                    className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-blue-700
              transition
              hover:bg-blue-200
            "
                                    title="Check Out Equipment"
                                  >

                                    <PackageCheck size={16} />

                                  </button>

                                  {/* DELETE ONLY RESERVED */}

                                  <button
                                    onClick={() =>
                                      deleteUsage(
                                        usage.id
                                      )
                                    }
                                    className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-100
              text-red-700
              transition
              hover:bg-red-200
            "
                                    title="Delete Allocation"
                                  >

                                    <Trash2 size={16} />

                                  </button>
                                </>

                              )}

                            {/* PARTIALLY RETURNED → CONTINUE RETURN */}

                            

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          bg-black/60
          backdrop-blur-md
          p-4
        ">

          <div
            onClick={() =>
              setShowModal(false)
            }
            className="
              absolute
              inset-0
            "
          />

          <div className="
  relative
  flex
  max-h-[90vh]
  w-full
  max-w-3xl
  flex-col
  overflow-hidden
  rounded-[32px]
  border
  border-slate-200
  bg-[#F8FAFC]
  shadow-[0_25px_100px_rgba(0,0,0,0.25)]
">

            <div className="
              sticky
              top-0
              z-20
              border-b
              border-slate-200
              bg-white/95
              px-6
              py-5
              backdrop-blur-xl
            ">

              <div className="
                flex
                items-start
                justify-between
                gap-4
              ">

                <div>

                  <h2 className="
                    text-2xl
                    font-black
                    text-slate-900
                  ">

                    Allocate Equipment

                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-600
                  "
                >

                  <X size={18} />

                </button>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

              <div className="space-y-8">

                {/* Equipment Selection */}
                <div className="space-y-4">

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Equipment Selection
                  </h3>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <select
                      value={form.inventory_item_id}
                      className={inputClass}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          inventory_item_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Inventory Item</option>

                      {items.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={item.calculated_available <= 0}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>

                    {selectedItem && (
  <div className="mt-2 flex items-center gap-2 px-1 text-xs">

    <span
      className={`
        h-2.5
        w-2.5
        rounded-full
        ${
          selectedItem.calculated_available > 0
            ? "bg-green-500"
            : "bg-red-500"
        }
      `}
    />

    <span className="text-slate-500">
      {selectedItem.calculated_available} of {selectedItem.quantity} available
    </span>

    <span
      className={`
        rounded-full
        px-2 py-0.5
        text-[11px] font-medium
        ${
          selectedItem.calculated_available > 0
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }
      `}
    >
      {selectedItem.status}
    </span>

  </div>
)}

                  </div>
                </div>

                {/* Allocation Details */}
                <div className="space-y-4">

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Allocation Details
                  </h3>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <select
                      value={form.usage_type}
                      className={inputClass}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          usage_type: e.target.value,
                          shoot_id: "",
                          assigned_to: "",
                          notes: "",
                        })
                      }
                    >
                      <option value="shoot">Shoot</option>
                      <option value="rental">Rental</option>
                      <option value="internal">Internal</option>
                      <option value="maintenance">Maintenance</option>
                    </select>

                    <input
                      type="number"
                      min="1"
                      max={selectedItem?.calculated_available || 1}
                      placeholder="Quantity"
                      value={form.quantity}
                      className={inputClass}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: Number(e.target.value),
                        })
                      }
                    />

                    {form.usage_type === "shoot" && (
                      <select
                        value={form.shoot_id}
                        className={inputClass}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            shoot_id: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Shoot</option>
                        {shoots.map((shoot) => (
                          <option key={shoot.id} value={shoot.id}>
                            {shoot.title}
                          </option>
                        ))}
                      </select>
                    )}

                    <select
                      value={form.assigned_to}
                      className={inputClass}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          assigned_to: e.target.value,
                        })
                      }
                    >
                      <option value="">Assign To</option>

                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </h3>

                  <textarea
                    rows={5}
                    value={form.notes}
                    className={inputClass}
                    placeholder="Add allocation notes..."
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="flex justify-end pt-2">

                  <button
                    onClick={createUsage}
                    className="
          rounded-2xl
          bg-blue-600
          px-8
          py-4
          font-semibold
          text-white
          shadow-lg
          transition
          hover:bg-blue-700
        "
                  >
                    Allocate Equipment
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {showViewModal &&
        selectedUsage && (

          <div className="
    fixed
    inset-0
    z-[9999]
    flex
    items-center
    justify-center
    bg-black/60
    p-4
    backdrop-blur-md
  ">

            <div className="
      w-full
      max-w-3xl
      rounded-3xl
      bg-white
      p-8
    ">

              <div className="
        flex
        items-start
        justify-between
      ">

                <div>

                  <h2 className="
            text-3xl
            font-bold
            text-slate-900
          ">

                    Usage Details

                  </h2>

                </div>

                <button
                  onClick={() => {

                    setShowViewModal(false);

                    setSelectedUsage(null);

                  }}
                  className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
          "
                >

                  <X size={18} />

                </button>

              </div>

              <div className="
        mt-8
        grid
        gap-6
        md:grid-cols-2
      ">

                <div>

                  <p className="
            text-sm
            text-slate-500
          ">

                    Item

                  </p>

                  <h3 className="
            mt-2
            text-xl
            font-bold
          ">

                    {
                      selectedUsage.item?.name
                    }

                  </h3>

                </div>

                <div>

                  <p className="
            text-sm
            text-slate-500
          ">

                    Usage Type

                  </p>

                  <h3 className="
            mt-2
            text-xl
            font-bold
            capitalize
          ">

                    {
                      selectedUsage.usage_type
                    }

                  </h3>

                </div>

                <div>

                  <p className="
            text-sm
            text-slate-500
          ">

                    Quantity

                  </p>

                  <h3 className="
            mt-2
            text-xl
            font-bold
          ">

                    {
                      selectedUsage.quantity
                    }

                  </h3>

                </div>

                <div>

                  <p className="
            text-sm
            text-slate-500
          ">

                    Status

                  </p>

                  <h3 className="
            mt-2
            text-xl
            font-bold
          ">

                    {
                      selectedUsage.status
                    }

                  </h3>

                </div>

              </div>

            </div>

          </div>

        )}

      {showReturnModal &&
        selectedUsage && (

          <div className="
    fixed
    inset-0
    z-[9999]
    flex
    items-center
    justify-center
    bg-black/60
    p-4
    backdrop-blur-md
  ">

            <div className="
      w-full
      max-w-2xl
      rounded-3xl
      bg-white
      p-8
    ">

              <div className="
        flex
        items-start
        justify-between
      ">

                <div>

                  {/* <h2 className="
            text-3xl
            font-bold
            text-slate-900
          ">

                    Process Return

                  </h2> */}

                </div>

                <button
                  onClick={() => {

                    setShowReturnModal(false);

                    setSelectedUsage(null);

                  }}
                  className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
          "
                >

                  <X size={18} />

                </button>

              </div>

              <div className="
        mt-8
        space-y-5
      ">

                <input
                  type="number"
                  value={
                    returnForm.returned_quantity
                  }
                  onChange={(e) =>
                    setReturnForm({

                      ...returnForm,

                      returned_quantity:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className={inputClass}
                  placeholder="Returned Quantity"
                />

                <input
                  type="number"
                  value={
                    returnForm.damaged_quantity
                  }
                  onChange={(e) =>
                    setReturnForm({

                      ...returnForm,

                      damaged_quantity:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className={inputClass}
                  placeholder="Damaged Quantity"
                />

                <input
                  type="number"
                  value={
                    returnForm.lost_quantity || 0
                  }
                  onChange={(e) =>
                    setReturnForm({

                      ...returnForm,

                      lost_quantity:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className={inputClass}
                  placeholder="Lost Quantity"
                />

                <textarea
                  rows={4}
                  value={
                    returnForm.notes
                  }
                  onChange={(e) =>
                    setReturnForm({

                      ...returnForm,

                      notes:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Return notes..."
                />

              </div>

              <div className="
        mt-8
        flex
        justify-end
      ">

                <button
                  onClick={
                    processReturn
                  }
                  className="
                  border
                  color:gray-200
                    rounded-2xl
                  bg-green-500
                    px-6
                    py-3
                    font-semibold
                  text-black
                  "
                >

                  Complete Return

                </button>

              </div>

            </div>

          </div>

        )}
    </Layout>

  );
}

const inputClass = `
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-4
  py-4
  text-sm
  text-slate-900
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;