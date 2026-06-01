"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import toast from "react-hot-toast";

import {
  Search,
  RotateCcw,
  X,
  AlertTriangle,
  Film,
  Truck,
  Wrench,
  Building2,
  Package,
} from "lucide-react";

export default function ReturnsPage() {

  const [usages, setUsages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [returnType, setReturnType] =
    useState("partial");

  const [selectedUsage, setSelectedUsage] =
    useState(null);

  const initialReturnForm = {

    returned_quantity: 1,

    damaged_quantity: 0,

    lost_quantity: 0,

    notes: "",
  };

  const [returnForm, setReturnForm] =
    useState(initialReturnForm);

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchData = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/inventory/usage"
      );

      let data = [];

      if (
        Array.isArray(
          res?.data?.data?.data
        )
      ) {

        data =
          res.data.data.data;

      } else if (

        Array.isArray(
          res?.data?.data
        )

      ) {

        data =
          res.data.data;

      } else if (

        Array.isArray(
          res?.data
        )

      ) {

        data =
          res.data;
      }

      const filtered =
        data.filter(
          (usage) =>

            usage.status ===
            "checked_out" ||

            usage.status ===
            "checked_out" ||

            usage.status ===
            "partially_returned"
        );

      setUsages(filtered);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data
          ?.message ||
        "Failed to load returns"
      );

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

    if (showModal) {

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

  }, [showModal]);

  /* ====================================================== */
  /* OPEN RETURN */
  /* ====================================================== */

  const openReturnModal =
    (usage) => {

      setSelectedUsage(usage);

      const remaining =

        usage.quantity

        -

        usage.returned_quantity

        -

        (usage.lost_quantity || 0);

      setReturnForm({

        returned_quantity:
          remaining > 0
            ? remaining
            : 0,

        damaged_quantity: 0,

        lost_quantity: 0,

        notes: "",
      });

      setShowModal(true);
    };

  /* ====================================================== */
  /* RETURN */
  /* ====================================================== */

  const processReturn =
    async () => {

      try {

        await api.post(
          `/inventory/usage/${selectedUsage.id}/return`,
          returnForm
        );

        toast.success(
          "Equipment returned successfully"
        );

        setShowModal(false);

        fetchData();

      } catch (error) {

        console.log(error);

        toast.error(
          error.response?.data
            ?.message ||
          "Return failed"
        );
      }
    };

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filteredUsages =
    useMemo(() => {

      return usages.filter(
        (usage) => {

          const text = `
            ${usage.item?.name || ""}
            ${usage.status || ""}
            ${usage.usage_type || ""}
            ${usage.notes || ""}
            ${usage.assignedUser?.name || ""}
          `.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );

    }, [usages, search]);

  /* ====================================================== */
  /* TYPE ICON */
  /* ====================================================== */

  const getTypeIcon = (
    type
  ) => {

    switch (type) {

      case "shoot":

        return (
          <Film size={18} />
        );

      case "rental":

        return (
          <Truck size={18} />
        );

      case "maintenance":

        return (
          <Wrench size={18} />
        );

      case "internal":

        return (
          <Building2 size={18} />
        );

      default:

        return (
          <Package size={18} />
        );
    }
  };

  return (

    <Layout>

      {/* PAGE */}

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

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">

            Equipment Returns

          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            Process returned inventory
            from shoots, rentals,
            maintenance and internal
            operations

          </p>

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
              className="
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search returns..."
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

        {/* LIST */}

        <div className="
          mt-10
          space-y-4
        ">

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

              Loading returns...

            </div>

          ) : filteredUsages.length ===
            0 ? (

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

              No pending returns

            </div>

          ) : (

            filteredUsages.map(
              (usage) => (

                <div
                  key={usage.id}
                  className="
                    flex
                    flex-col
                    gap-5
                    rounded-3xl
                    border
                    border-gray-200
                    bg-white
                    p-5
                    shadow-sm
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >

                  {/* LEFT */}

                  <div className="
                    flex
                    items-start
                    gap-4
                  ">

                    <div className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-orange-50
                      text-orange-600
                    ">

                      {getTypeIcon(
                        usage.usage_type
                      )}

                    </div>

                    <div>

                      {/* STATUS */}

                      <div className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold

                        ${usage.status ===
                          "checked_out"

                          ? "bg-blue-100 text-blue-700"

                          : "bg-orange-100 text-orange-700"
                        }
                      `}>

                        {usage.status}

                      </div>

                      {/* ITEM */}

                      <h3 className="
                        mt-4
                        text-xl
                        font-bold
                        text-gray-900
                      ">

                        {
                          usage.item?.name
                        }

                      </h3>

                      {/* META */}

                      <div className="
                        mt-3
                        flex
                        flex-wrap
                        gap-5
                        text-sm
                        text-gray-600
                      ">

                        <div>
                          Qty:
                          {" "}
                          {
                            usage.quantity
                          }
                        </div>

                        <div>
                          Returned:
                          {" "}
                          {
                            usage.returned_quantity
                          }
                        </div>

                        <div>
                          Type:
                          {" "}
                          {
                            usage.usage_type
                          }
                        </div>

                        {usage.assignedUser && (

                          <div>
                            Person:
                            {" "}
                            {
                              usage
                                .assignedUser
                                ?.name
                            }
                          </div>

                        )}

                      </div>

                      {/* SHOOT */}

                      {usage.shoot && (

                        <p className="
                          mt-3
                          text-sm
                          text-gray-500
                        ">

                          Shoot:
                          {" "}
                          {
                            usage.shoot
                              ?.title
                          }

                        </p>

                      )}

                      {/* NOTES */}

                      {usage.notes && (

                        <p className="
                          mt-2
                          text-sm
                          text-gray-500
                        ">

                          {
                            usage.notes
                          }

                        </p>

                      )}

                    </div>

                  </div>

                  {/* ACTION */}

                  <button
                    onClick={() =>
                      openReturnModal(
                        usage
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-orange-500
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-orange-600
                    "
                  >

                    <RotateCcw
                      size={18}
                    />

                    Process Return

                  </button>

                </div>

              )
            )

          )}

        </div>

      </div>

      {/* MODAL */}

      {/* MODAL */}

      {showModal && (() => {

        const outstanding =
          selectedUsage.quantity -
          selectedUsage.returned_quantity -
          (selectedUsage.lost_quantity || 0);

        return (

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

            {/* OVERLAY */}

            <div
              onClick={() =>
                setShowModal(false)
              }
              className="absolute inset-0"
            />

            {/* MODAL */}

            <div className="
        relative
        flex
        max-h-[90vh]
        w-full
        max-w-5xl
        flex-col
        overflow-hidden
        rounded-[32px]
        border
        border-slate-200
        bg-[#F8FAFC]
        shadow-[0_25px_100px_rgba(0,0,0,0.25)]
      ">

              {/* HEADER */}

              <div className="
          shrink-0
          border-b
          border-slate-200
          bg-white
          px-6
          py-5
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

                      Return Equipment

                    </h2>

                    <p className="
                mt-1
                text-sm
                text-slate-500
              ">

                      Process inventory returns professionally

                    </p>

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
              "
                  >

                    <X size={18} />

                  </button>

                </div>

              </div>

              {/* SCROLLABLE BODY */}

              <div className="
          flex-1
          overflow-y-auto
          p-6
        ">

                {/* SUMMARY */}

                <div className="
            mb-6
            grid
            grid-cols-2
            gap-4
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            md:grid-cols-4
          ">

                  <div>

                    <p className="
                text-sm
                text-slate-500
              ">

                      Allocated

                    </p>

                    <h3 className="
                mt-1
                text-2xl
                font-black
                text-slate-900
              ">

                      {selectedUsage.quantity}

                    </h3>

                  </div>

                  <div>

                    <p className="
                text-sm
                text-slate-500
              ">

                      Returned

                    </p>

                    <h3 className="
                mt-1
                text-2xl
                font-black
                text-green-600
              ">

                      {selectedUsage.returned_quantity}

                    </h3>

                  </div>

                  <div>

                    <p className="
                text-sm
                text-slate-500
              ">

                      Lost

                    </p>

                    <h3 className="
                mt-1
                text-2xl
                font-black
                text-red-600
              ">

                      {selectedUsage.lost_quantity || 0}

                    </h3>

                  </div>

                  <div>

                    <p className="
                text-sm
                text-slate-500
              ">

                      Outstanding

                    </p>

                    <h3 className="
                mt-1
                text-2xl
                font-black
                text-orange-600
              ">

                      {outstanding}

                    </h3>

                  </div>

                </div>

                {/* RETURN TYPE */}

                <div className="mb-6">

                  <label className="
              mb-3
              block
              text-sm
              font-semibold
              text-slate-700
            ">

                    Return Type

                  </label>

                  <div className="
              grid
              grid-cols-2
              gap-3
              md:grid-cols-5
            ">

                    {[
                      {
                        key: "full",
                        label: "Full",
                      },
                      {
                        key: "partial",
                        label: "Partial",
                      },
                      {
                        key: "damaged",
                        label: "Damaged",
                      },
                      {
                        key: "lost",
                        label: "Lost",
                      },
                      {
                        key: "mixed",
                        label: "Mixed",
                      },
                    ].map((type) => (

                      <button
                        key={type.key}
                        onClick={() => {
                          setReturnType(type.key);

                          if (type.key === "full") {
                            setReturnForm({
                              returned_quantity: outstanding,
                              damaged_quantity: 0,
                              lost_quantity: 0,
                              notes: "",
                            });
                          }

                          else if (type.key === "partial") {
                            setReturnForm({
                              returned_quantity: outstanding > 0 ? 1 : 0,
                              damaged_quantity: 0,
                              lost_quantity: 0,
                              notes: "",
                            });
                          }

                          else if (type.key === "lost") {
                            setReturnForm({
                              returned_quantity: 0,
                              damaged_quantity: 0,
                              lost_quantity: outstanding,
                              notes: "",
                            });
                          }

                          else if (type.key === "damaged") {
                            setReturnForm({
                              returned_quantity: outstanding,
                              damaged_quantity: outstanding,
                              lost_quantity: 0,
                              notes: "",
                            });
                          }

                          else if (type.key === "mixed") {
                            setReturnForm({
                              returned_quantity: 1,
                              damaged_quantity: 0,
                              lost_quantity: 0,
                              notes: "",
                            });
                          }
                        }}
                        className={`
                    rounded-2xl
                    border
                    px-4
                    py-4
                    text-sm
                    font-semibold
                    transition-all

                    ${returnType === type.key
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }
                  `}
                      >

                        {type.label}

                      </button>

                    ))}

                  </div>

                </div>

                {/* FORM */}

                <div className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
          ">

                  <div className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            ">

                    {/* FULL */}

                    {returnType === "full" && (

                      <div>

                        <label className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  ">

                          Full Return Quantity

                        </label>

                        <input
                          type="number"
                          value={outstanding}
                          disabled
                          className={`${inputClass} bg-slate-100`}
                        />

                      </div>

                    )}

                    {/* PARTIAL */}

                    {returnType === "partial" && (

                      <div>

                        <label className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  ">

                          Returned Quantity

                        </label>

                        <input
                          type="number"
                          min="0"
                          value={returnForm.returned_quantity}
                          onChange={(e) =>
                            setReturnForm({
                              ...returnForm,
                              returned_quantity: Number(e.target.value),
                            })
                          }
                          className={inputClass}
                        />

                      </div>

                    )}

                    {/* DAMAGED */}

                    {(returnType === "damaged" ||
                      returnType === "mixed") && (

                        <div>

                          <label className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-orange-700
                  ">

                            Damaged Quantity

                          </label>

                          <input
                            type="number"
                            min="0"
                            value={returnForm.damaged_quantity}
                            onChange={(e) =>
                              setReturnForm({
                                ...returnForm,
                                damaged_quantity: Number(e.target.value),
                              })
                            }
                            className={inputClass}
                          />

                        </div>

                      )}

                    {/* LOST */}

                    {(returnType === "lost" ||
                      returnType === "mixed") && (

                        <div>

                          <label className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-red-700
                  ">

                            Lost Quantity

                          </label>

                          <input
                            type="number"
                            min="0"
                            value={returnForm.lost_quantity}
                            onChange={(e) =>
                              setReturnForm({
                                ...returnForm,
                                lost_quantity: Number(e.target.value),
                              })
                            }
                            className={inputClass}
                          />

                        </div>

                      )}

                  </div>

                  {/* NOTES */}

                  <div className="mt-6">

                    <label className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
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
                      placeholder="Condition notes, damage details, missing accessories..."
                      className={inputClass}
                    />

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          px-6
          py-4
        ">

                <div className="
            flex
            justify-end
            gap-3
          ">

                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-slate-700
              "
                  >

                    Cancel

                  </button>

                  <button
                    onClick={processReturn}
                    className="
                rounded-2xl
                bg-orange-500
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-orange-600
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
  focus:border-orange-500
  focus:ring-4
  focus:ring-orange-500/10
`;