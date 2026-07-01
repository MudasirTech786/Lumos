"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  Film,
  Wrench,
  Building2,
  Truck,
  Package,
  Search,
} from "lucide-react";

export default function AllocationsPage() {

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
/* SAFE DATA PARSING */
/* ====================================================== */

console.log("📦 API RESPONSE:", res.data);

let usagesData = [];

if (
  Array.isArray(
    res?.data?.data?.data
  )
) {

  usagesData =
    res.data.data.data;

} else if (

  Array.isArray(
    res?.data?.data
  )

) {

  usagesData =
    res.data.data;

} else if (

  Array.isArray(
    res?.data
  )

) {

  usagesData =
    res.data;
}

console.log(
  "✅ usagesData:",
  usagesData
);

setUsages(usagesData);

    } catch (error) {

      console.log(error);

      const pToastId = progressToast.loading({ title: "Error", message: error.response?.data?.message || "Failed to load allocations" });
      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Failed to load allocations" });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filteredUsages =
    useMemo(() => {

      if (!search.trim()) {

        return usages;
      }

      return usages.filter(
        (usage) => {

          const text = `
            ${usage.item?.name || ""}
            ${usage.shoot?.title || ""}
            ${usage.status || ""}
            ${usage.usage_type || ""}
            ${usage.notes || ""}
          `.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );

    }, [usages, search]);

  /* ====================================================== */
  /* GROUPING */
  /* ====================================================== */

  const grouped =
  Array.isArray(filteredUsages)

    ? filteredUsages.reduce(
      (acc, usage) => {

        let key =
          "General Operations";

        if (
          usage.usage_type ===
          "shoot"
        ) {

          key =
            usage.shoot?.title ||
            "Shoot Allocation";
        }

        if (
          usage.usage_type ===
          "rental"
        ) {

          key =
            `Rental • ${
              usage.notes ||
              "Client"
            }`;
        }

        if (
          usage.usage_type ===
          "maintenance"
        ) {

          key =
            `Maintenance • ${
              usage.notes ||
              "Vendor"
            }`;
        }

        if (
          usage.usage_type ===
          "internal"
        ) {

          key =
            `Internal • ${
              usage.assignedUser
                ?.name ||
              "Department"
            }`;
        }

        if (!acc[key]) {

          acc[key] = [];
        }

        acc[key].push(usage);

        return acc;

      },
            {}
    )

    : {};

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

  /* ====================================================== */
  /* STATUS COLORS */
  /* ====================================================== */

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

            Equipment Allocations

          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            Operational overview of
            shoots, rentals,
            maintenance and internal
            inventory allocations

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
              placeholder="Search allocations..."
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

        {/* GROUPS */}

        <div className="
          mt-10
          space-y-6
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

              Loading allocations...

            </div>

          ) : Object.keys(grouped)
            .length === 0 ? (

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

              No allocations found

            </div>

          ) : (

            Object.entries(grouped)
              .map(([group, items]) => (

                <div
                  key={group}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-200
                    bg-white
                    shadow-sm
                  "
                >

                  {/* GROUP HEADER */}

                  <div className="
                    border-b
                    border-gray-100
                    bg-gray-50
                    px-6
                    py-5
                  ">

                    <h2 className="
                      text-2xl
                      font-bold
                      text-gray-900
                    ">

                      {group}

                    </h2>

                    <p className="
                      mt-1
                      text-sm
                      text-gray-500
                    ">

                      {
                        items.length
                      }
                      {" "}
                      allocation(s)

                    </p>

                  </div>

                  {/* ITEMS */}

                  <div className="
                    divide-y
                    divide-gray-100
                  ">

                    {items.map(
                      (usage) => (

                        <div
                          key={usage.id}
                          className="
                            flex
                            flex-col
                            gap-5
                            p-6
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

                              <h3 className="
                                text-lg
                                font-bold
                                text-gray-900
                              ">

                                {
                                  usage.item
                                    ?.name
                                }

                              </h3>

                              <div className="
                                mt-2
                                flex
                                flex-wrap
                                gap-5
                                text-sm
                                text-gray-500
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

                              {usage.notes && (

                                <p className="
                                  mt-3
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

                          {/* STATUS */}

                          <div>

                            <div className={`
                              rounded-full
                              px-4
                              py-2
                              text-xs
                              font-semibold

                              ${
                                statusClasses[
                                  usage.status
                                ]
                              }
                            `}>

                              {
                                usage.status
                              }

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              ))

          )}

        </div>

      </div>

    </Layout>

  );
}