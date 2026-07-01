"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Package,
} from "lucide-react";

export default function InventoryMovementsPage() {

  const [movements, setMovements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  /* ====================================================== */
  /* FETCH */
  /* ====================================================== */

  const fetchMovements = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/inventory/movements"
      );

      setMovements(
        res.data || []
      );

    } catch (error) {

      console.log(error);

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load movements" });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchMovements();

  }, []);

  /* ====================================================== */
  /* FILTER */
  /* ====================================================== */

  const filtered =
    useMemo(() => {

      return movements.filter(
        (movement) => {

          const text = `
            ${movement.item?.name || ""}
            ${movement.type || ""}
            ${movement.notes || ""}
          `.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );

    }, [movements, search]);

  /* ====================================================== */
  /* TYPE COLORS */
  /* ====================================================== */

  const typeClasses = {

    in:
      "bg-green-100 text-green-700",

    out:
      "bg-blue-100 text-blue-700",

    adjustment:
      "bg-yellow-100 text-yellow-700",

    damage:
      "bg-red-100 text-red-700",
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

            Inventory Movements

          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            Operational inventory activity timeline

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
              placeholder="Search movements..."
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
          shadow-sm
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
                  Notes
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
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      py-20
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >

                    Loading movements...

                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      py-20
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >

                    No movements found

                  </td>

                </tr>

              ) : (

                filtered.map((movement) => (

                  <tr
                    key={movement.id}
                    className="
                      border-b
                      border-gray-100
                    "
                  >

                    {/* ITEM */}

                    <td className="
                      px-6
                      py-5
                    ">

                      <div className="
                        flex
                        items-center
                        gap-3
                      ">

                        <div className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gray-100
                        ">

                          <Package
                            size={18}
                            className="
                              text-gray-600
                            "
                          />

                        </div>

                        <div>

                          <h3 className="
                            font-semibold
                            text-gray-900
                          ">

                            {
                              movement.item?.name
                            }

                          </h3>

                        </div>

                      </div>

                    </td>

                    {/* TYPE */}

                    <td className="
                      px-6
                      py-5
                    ">

                      <div className={`
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold

                        ${
                          typeClasses[
                            movement.type
                          ]
                        }
                      `}>

                        {movement.type ===
                          "in" && (
                          <ArrowDownLeft
                            size={14}
                          />
                        )}

                        {movement.type ===
                          "out" && (
                          <ArrowUpRight
                            size={14}
                          />
                        )}

                        {movement.type ===
                          "damage" && (
                          <AlertTriangle
                            size={14}
                          />
                        )}

                        {movement.type}

                      </div>

                    </td>

                    {/* QUANTITY */}

                    <td className="
                      px-6
                      py-5
                      text-sm
                      font-medium
                      text-gray-700
                    ">

                      {movement.quantity}

                    </td>

                    {/* NOTES */}

                    <td className="
                      px-6
                      py-5
                      text-sm
                      text-gray-600
                    ">

                      {movement.notes || "-"}

                    </td>

                    {/* DATE */}

                    <td className="
                      px-6
                      py-5
                      text-sm
                      text-gray-500
                    ">

                      {
                        new Date(
                          movement.created_at
                        ).toLocaleString()
                      }

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
}