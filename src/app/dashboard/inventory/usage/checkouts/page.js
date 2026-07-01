"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  Search,
  PackageCheck,
  Film,
  Truck,
  Wrench,
  Building2,
  Package,
} from "lucide-react";

export default function CheckoutsPage() {

  const [usages, setUsages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchData = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/inventory/usage"
      );

      /* ====================================================== */
      /* SAFE RESPONSE PARSING */
      /* ====================================================== */

      console.log(
        "📦 CHECKOUT RESPONSE:",
        res.data
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

      console.log(
        "✅ parsed checkout data:",
        data
      );

      /* ====================================================== */
      /* FILTER RESERVED */
      /* ====================================================== */

      const filtered =
        data.filter(
          (usage) =>
            usage.status ===
            "reserved"
        );

      console.log(
        "🔥 reserved usages:",
        filtered
      );

      setUsages(filtered);

    } catch (error) {

      console.log(error);

      const pToastId = progressToast.loading({ title: "Error", message: error.response?.data?.message || "Failed to load checkouts" });
      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Failed to load checkouts" });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  /* FILTER */
  /* ====================================================== */

  const filteredUsages =
    useMemo(() => {

      return Array.isArray(usages)

  ? usages.filter(
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
      )

  : [];

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

            Equipment Check-Outs

          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            Process reserved inventory
            for shoots, rentals,
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
              placeholder="Search checkouts..."
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

              Loading checkouts...

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

              No reserved inventory

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
                      bg-blue-50
                      text-blue-600
                    ">

                      {getTypeIcon(
                        usage.usage_type
                      )}

                    </div>

                    <div>

                      {/* STATUS */}

                      <div className="
                        inline-flex
                        rounded-full
                        bg-yellow-100
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-yellow-700
                      ">

                        reserved

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
                      checkoutUsage(
                        usage.id
                      )
                    }
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
                      transition
                      hover:bg-blue-700
                    "
                  >

                    <PackageCheck
                      size={18}
                    />

                    Check Out

                  </button>

                </div>

              )
            )

          )}

        </div>

      </div>

    </Layout>

  );
}