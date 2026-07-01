"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  Boxes,
  AlertTriangle,
  Search,
} from "lucide-react";

export default function StockPage() {

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const fetchItems = async () => {

    try {

      const res = await api.get(
        "/inventory/items"
      );

      setItems(res.data);

    } catch {

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load stock" });

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems =
    useMemo(() => {

      return items.filter(
        (item) => {

          const text = `
            ${item.name || ""}
            ${item.model || ""}
          `.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );

    }, [items, search]);

  return (

    <Layout>

      <div className="mx-auto max-w-7xl pb-24">

        {/* HEADER */}

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Stock Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor stock levels and
            low inventory alerts
          </p>

        </div>

        {/* SEARCH */}

        <div className="mt-8">

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search stock..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full bg-transparent text-sm outline-none"
            />

          </div>

        </div>

        {/* GRID */}

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">

          {loading ? (

            <div className="rounded-3xl border border-gray-200 bg-white py-20 text-center text-sm text-gray-500">
              Loading stock...
            </div>

          ) : (

            filteredItems.map(
              (item) => {

                const lowStock =
                  item.quantity <=
                  item.minimum_quantity;

                return (

                  <div
                    key={item.id}
                    className={`
                      rounded-3xl
                      border
                      bg-white
                      p-5

                      ${
                        lowStock
                          ? "border-red-200"
                          : "border-gray-200"
                      }
                    `}
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                        <Boxes
                          size={26}
                        />

                      </div>

                      {lowStock && (

                        <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">

                          <AlertTriangle
                            size={14}
                          />

                          Low Stock

                        </div>

                      )}

                    </div>

                    <h3 className="mt-5 text-xl font-bold text-gray-900">
                      {item.name}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">

                      <p>
                        Quantity:{" "}
                        {
                          item.quantity
                        }
                      </p>

                      <p>
                        Minimum:{" "}
                        {
                          item.minimum_quantity
                        }
                      </p>

                      <p>
                        Status:{" "}
                        {
                          item.status
                        }
                      </p>

                    </div>

                  </div>

                );
              }
            )

          )}

        </div>

      </div>

    </Layout>

  );
}