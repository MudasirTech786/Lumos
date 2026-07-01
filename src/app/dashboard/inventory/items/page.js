"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";

import {
  Plus,
  Search,
  Package,
  MoreVertical,
  Trash2,
  Edit3,
  X,
} from "lucide-react";

export default function InventoryItemsPage() {

  const [items, setItems] =
    useState([]);

  const router = useRouter();

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editModal, setEditModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const confirmDialog = useConfirm();

  const initialForm = {

    category_id: "",

    name: "",

    model: "",

    daily_rental_value: "0",

    sku: "",

    serial_number: "",

    quantity: 0,

    minimum_quantity: 0,

    purchased_from: "",

    purchase_date: "",

    warranty_expiry: "",

    purchase_price: "",

    type: "asset",

    status: "available",

    notes: "",

    track_serial: false,
  };

  const [form, setForm] =
    useState(initialForm);

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchData = async () => {

    try {

      setLoading(true);

      const itemsRes =
        await api.get(
          "/inventory/items"
        );

      const categoriesRes =
        await api.get(
          "/inventory/categories"
        );

      setItems(
        itemsRes.data || []
      );

      setCategories(
        categoriesRes.data || []
      );

    } catch (error) {

      console.log(error);

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load inventory" });

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ====================================================== */
  /* BODY SCROLL */
  /* ====================================================== */

  useEffect(() => {

    if (showModal || editModal) {

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

  }, [showModal, editModal]);

  /* ====================================================== */
  /* CREATE */
  /* ====================================================== */

  const createItem = async () => {

    const pToastId = progressToast.loading({ title: "Creating...", message: "Saving item..." });

    try {

      await api.post(
        "/inventory/items",
        form
      );

      progressToast.success(pToastId, { title: "Created", message: "Item created" });

      setShowModal(false);

      setForm(initialForm);

      fetchData();

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Create failed" });
    }
  };

  /* ====================================================== */
  /* UPDATE */
  /* ====================================================== */

  const updateItem = async () => {

    const pToastId = progressToast.loading({ title: "Updating...", message: "Saving changes..." });

    try {

      await api.put(
        `/inventory/items/${editingItem.id}`,
        form
      );

      progressToast.success(pToastId, { title: "Updated", message: "Item updated" });

      setEditModal(false);

      setEditingItem(null);

      setForm(initialForm);

      fetchData();

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Update failed" });
    }
  };



  /* ====================================================== */
  /* DELETE */
  /* ====================================================== */

  const deleteItem = async (id) => {

    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Item",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(
        `/inventory/items/${id}`
      ),
    });

    if (!ok) return;

    fetchData();
  };

  /* ====================================================== */
  /* EDIT */
  /* ====================================================== */

  const openEdit = (item) => {

    setEditingItem(item);

    setForm({

      category_id:
        item.category_id || "",

      name: item.name || "",

      model: item.model || "",

      sku: item.sku || "",

      daily_rental_value: item.daily_rental_value || "0",

      track_serial:
        item.track_serial || false,

      serial_number:
        item.serial_number || "",

      quantity:
        item.quantity || 0,

      minimum_quantity:
        item.minimum_quantity || 0,

      purchased_from:
        item.purchased_from || "",

      purchase_date:
        item.purchase_date || "",

      warranty_expiry:
        item.warranty_expiry || "",

      purchase_price:
        item.purchase_price || "",

      type:
        item.type || "asset",

      status:
        item.status ||
        "available",

      notes:
        item.notes || "",
    });

    setEditModal(true);
  };

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filteredItems = useMemo(() => {

    let filtered = [...items];

    if (search.trim()) {

      filtered = filtered.filter(
        (item) => {

          const text = `
            ${item.name || ""}
            ${item.model || ""}
            ${item.serial_number || ""}
          `.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );
    }

    return filtered;

  }, [items, search]);

  return (

    <Layout>

      {/* ====================================================== */}
      {/* PAGE */}
      {/* ====================================================== */}

      <div className={`
        mx-auto
        max-w-7xl
        pb-24
        transition-all

        ${showModal ||
          editModal
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

              Inventory Items

            </h1>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">

              Manage production
              equipment and assets

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

            Add Item

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
              placeholder="Search inventory..."
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

        {/* ITEMS */}

        <div className="mt-10">

          {loading ? (

            <div className="
              rounded-3xl
              border
              border-gray-200
              bg-white
              py-20
              text-center
              text-sm
              text-gray-500
            ">

              Loading inventory...

            </div>

          ) : filteredItems.length ===
            0 ? (

            <EmptyState />

          ) : (

            <div className="space-y-4">

              {filteredItems.map(
                (item) => (

                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={deleteItem}
                    onEdit={openEdit}
                    router={router}
                  />

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* ====================================================== */}
      {/* MODAL */}
      {/* ====================================================== */}

      {(showModal || editModal) && (

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

          {/* BACKDROP */}

          <div
            onClick={() => {

              setShowModal(false);

              setEditModal(false);

            }}
            className="
              absolute
              inset-0
            "
          />

          {/* MODAL */}

          <div className="
            relative
            w-full
            max-w-3xl
            max-h-[90vh]
            overflow-y-auto
            rounded-[32px]
            border
            border-slate-200
            bg-[#F8FAFC]
            shadow-[0_25px_100px_rgba(0,0,0,0.25)]
          ">

            {/* HEADER */}

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

                    {editModal
                      ? "Edit Inventory Item"
                      : "Add Inventory Item"}

                  </h2>

                  <p className="
                    mt-1
                    text-sm
                    text-slate-500
                  ">

                    Manage inventory
                    assets and stock
                    information

                  </p>

                </div>

                <button
                  onClick={() => {

                    setShowModal(false);

                    setEditModal(false);

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
                    bg-white
                    text-slate-600
                    transition
                    hover:bg-slate-100
                  "
                >

                  <X size={18} />

                </button>

              </div>

            </div>

            {/* BODY */}

            <div className="
              space-y-6
              p-6
            ">

              {/* BASIC */}

              <Section title="Basic Information">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  <Field label="Category">

                    <select
                      value={
                        form.category_id
                      }
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category_id:
                            e.target
                              .value,
                        })
                      }
                    >

                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (
                          category
                        ) => (

                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>

                        )
                      )}

                    </select>

                  </Field>

                  <Field label="Item Name">

                    <input
                      value={
                        form.name
                      }
                      placeholder="Sony FX3"
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name:
                            e.target
                              .value,
                        })
                      }
                    />

                  </Field>

                  <Field label="Model">

                    <input
                      value={
                        form.model
                      }
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          model:
                            e.target
                              .value,
                        })
                      }
                    />

                  </Field>

                  <Field label="Inventory Type">

                    <select
                      value={form.type}
                      className={inputClass}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="asset">
                        Asset
                      </option>

                      <option value="consumable">
                        Consumable
                      </option>
                    </select>

                  </Field>

                  <Field label="Rental Rate (per day)">

                    <input
                      type="number"
                      value={
                        form.daily_rental_value
                      }
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          daily_rental_value:
                            e.target
                              .value,
                        })
                      }
                    />

                  </Field>

                  {!form.track_serial && (

                    <Field label="Serial Number">

                      <input
                        value={
                          form.serial_number
                        }
                        className={
                          inputClass
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            serial_number:
                              e.target.value,
                          })
                        }
                      />

                    </Field>

                  )}

                </div>

              </Section>

              {/* STOCK */}

              <Section title="Stock Configuration">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  <Field
                    label={
                      form.track_serial
                        ? "Number of Units"
                        : "Quantity"
                    }
                  >

                    <input
                      type="number"
                      min="0"
                      value={form.quantity}
                      disabled={
                        editModal &&
                        form.track_serial
                      }
                      className={inputClass}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: Number(
                            e.target.value
                          ),
                        })
                      }
                    />

                    {form.track_serial && (
                      <p className="
      mt-2
      text-xs
      text-slate-500
    ">
                        One asset record will be
                        created for each unit.
                        Example: 5 units =
                        CAM-00001 to CAM-00005
                      </p>
                    )}

                  </Field>

                  <Field label="Minimum Quantity">

                    <input
                      type="number"
                      value={
                        form.minimum_quantity
                      }
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minimum_quantity:
                            Number(
                              e.target
                                .value
                            ),
                        })
                      }
                    />

                  </Field>

                  <Field label="Track Individual Assets">

                    <label className="
    flex
    items-center
    gap-3
    rounded-2xl
    border
    border-slate-200
    bg-white
    px-4
    py-3
  ">

                      <input
                        type="checkbox"
                        checked={form.track_serial}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            track_serial:
                              e.target.checked,
                          })
                        }
                      />

                      <span>
                        Generate individual
                        assets & QR codes
                      </span>

                    </label>

                  </Field>
                </div>

              </Section>

              {/* PURCHASE */}

              <Section title="Purchase Information">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  <Field label="Purchased From">

                    <input
                      value={
                        form.purchased_from
                      }
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          purchased_from:
                            e.target
                              .value,
                        })
                      }
                    />

                  </Field>

                  <Field label="Purchase Price">

                    <input
                      type="number"
                      value={
                        form.purchase_price
                      }
                      className={
                        inputClass
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          purchase_price:
                            e.target
                              .value,
                        })
                      }
                    />

                  </Field>

                </div>

              </Section>

              {/* NOTES */}

              <Section title="Notes">

                <textarea
                  rows={5}
                  value={
                    form.notes
                  }
                  className={
                    inputClass
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes:
                        e.target
                          .value,
                    })
                  }
                />

              </Section>

              {/* FOOTER */}

              <div className="
                flex
                flex-col-reverse
                gap-3
                md:flex-row
                md:justify-end
              ">

                <button
                  onClick={() => {

                    setShowModal(false);

                    setEditModal(false);

                  }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    py-3
                    font-semibold
                    text-slate-700
                  "
                >

                  Cancel

                </button>

                <button
                  onClick={
                    editModal
                      ? updateItem
                      : createItem
                  }
                  className="
                    rounded-2xl
                    bg-blue-600
                    px-6
                    py-3
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >

                  {editModal
                    ? "Update Item"
                    : "Create Item"}

                </button>

              </div>

            </div>

          </div>

        </div >

      )
      }

    </Layout >
  );
}

/* ====================================================== */
/* CARD */
/* ====================================================== */

function ItemCard({
  item,
  onDelete,
  onEdit,
  router,
}) {

  const [showMenu, setShowMenu] =
    useState(false);

  return (

    <div className="
      rounded-3xl
      border
      border-gray-200
      bg-white
      p-5
      shadow-sm
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div>

          <div className="
  flex
  flex-wrap
  gap-2
">

            <div className="
    inline-flex
    rounded-full
    bg-green-100
    px-3
    py-1
    text-xs
    font-semibold
    text-green-700
  ">
              {item.status}
            </div>

            {item.track_serial && (

              <div className="
      inline-flex
      rounded-full
      bg-blue-100
      px-3
      py-1
      text-xs
      font-semibold
      text-blue-700
    ">
                QR Tracked
              </div>

            )}

          </div>

          <h3 className="
            mt-4
            text-xl
            font-bold
            text-gray-900
          ">

            {item.name}

          </h3>

          <div className="
            mt-4
            flex
            flex-wrap
            gap-5
            text-sm
            text-gray-600
          ">

            <div>
              Category:
              {" "}
              {
                item.category
                  ?.name
              }
            </div>

            <div>
              Qty:
              {" "}
              {item.quantity}
            </div>

            {item.track_serial && (

              <div>
                Assets:
                {" "}
                {item.assets_count}
              </div>

            )}

          </div>

        </div>

        <div className="relative">

          <button
            onClick={() =>
              setShowMenu(
                !showMenu
              )
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
            "
          >

            <MoreVertical
              size={18}
            />

          </button>

          {showMenu && (

            <div className="
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
            ">

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/inventory/assets?item=${item.id}`
                  )}
                className="
    flex
    w-full
    items-center
    gap-3
    px-4
    py-3
    text-left
    text-sm
    hover:bg-gray-50
  "
              >

                <Package size={16} />

                View Assets

              </button>

              <button
                onClick={() =>
                  onEdit(item)
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
                  hover:bg-gray-50
                "
              >

                <Edit3 size={16} />

                Edit

              </button>

              <button
                onClick={() =>
                  onDelete(
                    item.id
                  )
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

  );
}

/* ====================================================== */
/* SECTION */
/* ====================================================== */

function Section({
  title,
  children,
}) {

  return (

    <div className="
      rounded-[28px]
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
    ">

      <h3 className="
        text-lg
        font-bold
        text-slate-900
      ">

        {title}

      </h3>

      <div className="mt-5">

        {children}

      </div>

    </div>

  );
}

/* ====================================================== */
/* FIELD */
/* ====================================================== */

function Field({
  label,
  children,
}) {

  return (

    <div>

      <label className="
        mb-2
        block
        text-sm
        font-semibold
        text-slate-700
      ">

        {label}

      </label>

      {children}

    </div>

  );
}

/* ====================================================== */
/* INPUT */
/* ====================================================== */

const inputClass = `
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
  text-sm
  text-slate-900
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;

/* ====================================================== */
/* EMPTY */
/* ====================================================== */

function EmptyState() {

  return (

    <div className="
      rounded-3xl
      border
      border-gray-200
      bg-white
      px-6
      py-20
      text-center
    ">

      <div className="
        mx-auto
        flex
        h-20
        w-20
        items-center
        justify-center
        rounded-3xl
        bg-blue-50
        text-blue-600
      ">

        <Package size={36} />

      </div>

      <h3 className="
        mt-6
        text-2xl
        font-bold
        text-gray-900
      ">

        No inventory yet

      </h3>

      <p className="
        mt-2
        text-sm
        text-gray-500
      ">

        Add your first
        production asset

      </p>

    </div>

  );
}