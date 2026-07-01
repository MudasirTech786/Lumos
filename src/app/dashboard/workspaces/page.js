"use client";

import Layout from "@/components/Layout";
import ProtectedPage from "@/components/ProtectedPage";
import {
  Plus,
  Search,
  Trash2,
  Settings,
  LayoutGrid,
  FolderKanban,
  MoveRight,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";

import useAuth from "@/hooks/useAuth";

export default function Workspaces() {

  const { can } = useAuth();

  const [apps, setApps] = useState([]);

  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] =
    useState(false);

  const [manageModal, setManageModal] =
    useState(false);

  const [loadingId, setLoadingId] =
    useState(null);

  const confirmDialog = useConfirm();

  const tabs = [
    {
      key: "tab1",
      label: "Workspace 1",
    },
    {
      key: "tab2",
      label: "Workspace 2",
    },
    {
      key: "tab3",
      label: "Workspace 3",
    },
  ];

  const [activeTab, setActiveTab] =
    useState("tab1");

  const [form, setForm] = useState({
    name: "",
    category: "",
    url: "",
    logo: "",
  });

  // FETCH
  useEffect(() => {

    fetchApps();

  }, [activeTab]);

  const fetchApps = async () => {

    try {

      const res = await api.get(
        `/workspace-apps?tab=${activeTab}`
      );

      setApps(
        res.data?.apps || []
      );

    } catch {

      const id = progressToast.loading({ title: "Error", message: "Failed to load apps" });
      progressToast.error(id, { title: "Error", message: "Failed to load apps" });
    }
  };

  // FILTER
  const filtered = apps.filter(
    (app) =>
      (app?.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  // CREATE
  const handleSubmit = async () => {

    if (!form.name || !form.url) {

      const id = progressToast.loading({ title: "Validation", message: "Name & URL required" });
      progressToast.error(id, { title: "Validation", message: "Name & URL required" });

      return;
    }

    const pToastId = progressToast.loading({ title: "Creating...", message: "Adding app..." });

    try {

      await api.post(
        "/workspace-apps",
        {
          ...form,
          workspace_tab:
            activeTab,
        }
      );

      progressToast.success(pToastId, { title: "Created", message: "App added successfully" });

      setForm({
        name: "",
        category: "",
        url: "",
        logo: "",
      });

      setOpenModal(false);

      fetchApps();

    } catch {

      progressToast.error(pToastId, { title: "Error", message: "Failed to add app" });
    }
  };

  // DELETE
  const handleDelete = async (app) => {

    if (!app?.id) return;

    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete App",
      description: `Remove "${app.name}" from workspace?`,
      confirmText: "Delete",
      confirmAction: () => api.delete(
        `/workspace-apps/${app.id}`
      ),
    });

    if (!ok) return;

    setApps((prev) =>
      prev.filter(
        (a) => a.id !== app.id
      )
    );
  };

  // MOVE
  const updateAppTab = async (
    appId,
    newTab
  ) => {

    const pToastId = progressToast.loading({ title: "Moving...", message: "Moving app..." });

    try {

      await api.put(
        `/workspace-apps/${appId}`,
        {
          workspace_tab:
            newTab,
        }
      );

      setApps((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
              ...a,
              workspace_tab:
                newTab,
            }
            : a
        )
      );

      progressToast.success(pToastId, { title: "Moved", message: "Moved successfully" });

    } catch {

      progressToast.error(pToastId, { title: "Error", message: "Failed to move app" });
    }
  };

  return (
    <ProtectedPage permission="workspaces.view">
      <Layout>

        <div className="space-y-6 md:space-y-8 pb-24">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Workspaces
              </h1>

              <p className="text-gray-500 mt-2">
                Organize tools, apps &
                systems beautifully
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              {can(
                "workspaces.create"
              ) && (
                  <button
                    onClick={() =>
                      setOpenModal(true)
                    }
                    className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <Plus size={18} />
                    Add App
                  </button>
                )}

              <button
                onClick={() =>
                  setManageModal(true)
                }
                className="bg-white border border-blue-100 hover:border-blue-300 transition text-blue-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Settings size={18} />
                Manage
              </button>

            </div>

          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

            <StatCard
              title="Total Apps"
              value={apps.length}
              icon={<LayoutGrid size={18} />}
            />

            <StatCard
              title="Categories"
              value={[
                ...new Set(
                  apps.map(
                    (a) => a.category
                  )
                ),
              ].length}
              icon={<FolderKanban size={18} />}
            />

            <StatCard
              title="Workspace"
              value={tabs.find(
                (t) =>
                  t.key === activeTab
              )?.label}
              icon={<MoveRight size={18} />}
            />

          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-3">

            {tabs.map((tab) => (

              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(tab.key)
                }
                className={`px-5 py-3 rounded-2xl transition font-medium ${activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border border-blue-100 text-gray-700 hover:border-blue-300"
                  }`}
              >
                {tab.label}
              </button>

            ))}

          </div>

          {/* SEARCH */}
          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search apps..."
              className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl pl-12 pr-4 py-4 transition"
            />

          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

            {filtered.map((app) => (

              <div
                key={app.id}
                onClick={() =>
                  window.open(
                    app.url,
                    "_blank"
                  )
                }
                className="group relative bg-white border border-blue-100 rounded-3xl p-5 flex flex-col items-center cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition duration-300"
              >

                {can(
                  "workspaces.delete"
                ) && (

                    <button
                      onClick={(e) => {

                        e.stopPropagation();

                        handleDelete(app);
                      }}
                      disabled={
                        loadingId === app.id
                      }
                      className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                    >

                      {loadingId ===
                        app.id ? (
                        "..."
                      ) : (
                        <Trash2 size={15} />
                      )}

                    </button>
                  )}

                {app.logo ? (

                  <img
                    src={app.logo}
                    className="w-20 h-20 rounded-2xl object-cover mb-4 border border-blue-100"
                  />

                ) : (

                  <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <LayoutGrid size={28} />
                  </div>
                )}

                <p className="font-semibold text-center text-gray-900 line-clamp-1">
                  {app.name}
                </p>

                <p className="text-xs text-gray-500 mt-1 text-center line-clamp-1">
                  {app.category}
                </p>

              </div>

            ))}

          </div>

          {/* ADD MODAL */}
          {openModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

              <div
                onClick={() =>
                  setOpenModal(false)
                }
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />

              <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b border-blue-100">

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Add Workspace App
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Create a new workspace shortcut
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setOpenModal(false)
                    }
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                {/* BODY */}
                <div className="p-5 space-y-4">

                  {[
                    "name",
                    "category",
                    "url",
                    "logo",
                  ].map((field) => (

                    <Input
                      key={field}
                      placeholder={field}
                      value={form[field]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field]:
                            e.target.value,
                        })
                      }
                    />

                  ))}

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
                  >
                    Save App
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* MANAGE MODAL */}
          {manageModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

              <div
                onClick={() =>
                  setManageModal(false)
                }
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />

              <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-blue-100 overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b border-blue-100">

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Manage Workspace Apps
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Move apps between workspaces
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setManageModal(false)
                    }
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                {/* BODY */}
                <div className="p-5 space-y-4">

                  {apps.map((app) => (

                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-blue-100 rounded-2xl p-4 hover:bg-blue-50/40 transition"
                    >

                      <div className="flex items-center gap-4">

                        {app.logo ? (

                          <img
                            src={app.logo}
                            className="w-14 h-14 rounded-2xl object-cover border border-blue-100"
                          />

                        ) : (

                          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <LayoutGrid size={20} />
                          </div>
                        )}

                        <div>

                          <p className="font-semibold text-gray-900">
                            {app.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {app.category}
                          </p>

                        </div>

                      </div>

                      <select
                        value={
                          app.workspace_tab
                        }
                        onChange={(e) =>
                          updateAppTab(
                            app.id,
                            e.target.value
                          )
                        }
                        className="border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-3 transition"
                      >

                        {tabs.map((t) => (

                          <option
                            key={t.key}
                            value={t.key}
                          >
                            {t.label}
                          </option>

                        ))}

                      </select>

                    </div>

                  ))}

                </div>

              </div>

            </div>
          )}

        </div>

      </Layout>
    </ProtectedPage>
  );
}

// STAT CARD
function StatCard({
  title,
  value,
  icon,
}) {

  return (

    <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </h3>

        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
  );
}

// INPUT
function Input({
  className = "",
  ...props
}) {

  return (

    <input
      {...props}
      className={`w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-2xl px-4 py-4 transition ${className}`}
    />
  );
}