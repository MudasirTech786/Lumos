"use client";

import { useEffect, useState } from "react";

import Layout from "@/components/Layout";
import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";

import {
  Plus,
  Search,
  Layers3,
  MoreVertical,
  Trash2,
  Edit3,
} from "lucide-react";

export default function CategoriesPage() {

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const confirmDialog = useConfirm();

  const fetchCategories = async () => {

    try {

      const res = await api.get(
        "/inventory/categories"
      );

      setCategories(res.data);

    } catch {

      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed to load categories" });

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async () => {

    const pToastId = progressToast.loading({ title: "Creating...", message: "Saving category..." });

    try {

      await api.post(
        "/inventory/categories",
        form
      );

      progressToast.success(pToastId, { title: "Created", message: "Category created" });

      setShowModal(false);

      fetchCategories();

    } catch {

      progressToast.error(pToastId, { title: "Error", message: "Create failed" });

    }
  };

  const deleteCategory = async (id) => {

    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Category",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(
        `/inventory/categories/${id}`
      ),
    });

    if (!ok) return;

    fetchCategories();
  };

  const filteredCategories =
    categories.filter((category) => {

      const text = `
        ${category.name || ""}
        ${category.description || ""}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  return (

    <Layout>

      <div className="mx-auto max-w-7xl pb-24">

        {/* HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Organize inventory into
              production groups
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
              hover:bg-blue-700
            "
          >

            <Plus size={18} />

            Add Category

          </button>

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
              placeholder="Search categories..."
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

        <div className="mt-10">

          {loading ? (

            <div className="rounded-3xl border border-gray-200 bg-white py-20 text-center text-sm text-gray-500">
              Loading categories...
            </div>

          ) : filteredCategories.length ===
            0 ? (

            <EmptyState />

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {filteredCategories.map(
                (category) => (

                  <CategoryCard
                    key={category.id}
                    category={category}
                    onDelete={
                      deleteCategory
                    }
                  />

                )
              )}

            </div>

          )}

        </div>

        {/* MODAL */}

        {showModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">

            <div className="w-full max-w-xl rounded-3xl bg-white p-6">

              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Add Category
                </h2>

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  ✕
                </button>

              </div>

              <div className="mt-6 space-y-4">

                <input
                  placeholder="Category Name"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target
                        .value,
                    })
                  }
                />

                <textarea
                  placeholder="Description"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target
                          .value,
                    })
                  }
                />

              </div>

              <button
                onClick={
                  createCategory
                }
                className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save Category
              </button>

            </div>

          </div>

        )}

      </div>

    </Layout>

  );
}

function CategoryCard({
  category,
  onDelete,
}) {

  const [showMenu, setShowMenu] =
    useState(false);

  return (

    <div className="rounded-3xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200">

      <div className="flex items-start justify-between">

        <div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

            <Layers3 size={26} />

          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-900">
            {category.name}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {
              category.description
            }
          </p>

        </div>

        <div className="relative">

          <button
            onClick={() =>
              setShowMenu(
                !showMenu
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white hover:bg-gray-50"
          >

            <MoreVertical
              size={18}
            />

          </button>

          {showMenu && (

            <div className="absolute right-0 top-14 z-20 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

              <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50">

                <Edit3
                  size={16}
                />

                Edit

              </button>

              <button
                onClick={() =>
                  onDelete(
                    category.id
                  )
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >

                <Trash2
                  size={16}
                />

                Delete

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );
}

function EmptyState() {

  return (

    <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">

        <Layers3
          size={36}
        />

      </div>

      <h3 className="mt-6 text-2xl font-bold text-gray-900">
        No categories yet
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Create your first
        inventory category
      </p>

    </div>

  );
}