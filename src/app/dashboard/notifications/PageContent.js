"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useNotificationList, useNotificationModules, useNotifications } from "@/hooks/useNotifications";
import { typeConfig, moduleColors, priorityConfig, timeAgoLong } from "@/lib/notificationConfig";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function NotificationListItem({ notification, index, onRead, onDelete, onClick }) {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;
  const modColor = moduleColors[notification.module] || { color: "#64748b", bg: "rgba(100,116,139,0.10)", label: notification.module };
  const isUnread = !notification.read_at;

  return (
    <div
      onClick={() => onClick(notification)}
      className="group relative px-5 py-4 cursor-pointer transition-all duration-150 hover:bg-slate-50/80"
      style={{
        borderLeft: isUnread ? `3px solid ${config.color}` : "3px solid transparent",
        background: isUnread ? "rgba(59,130,246,0.01)" : undefined,
        animation: `notifSlideIn 0.3s cubic-bezier(0.16,1,0,1) ${Math.min(index * 25, 250)}ms both`,
      }}
    >
      <div className="flex gap-4">
        <div
          className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0"
          style={{ background: config.bg, border: `1px solid ${config.border}` }}
        >
          <Icon size={17} style={{ color: config.color }} strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800 leading-tight">
                {notification.title}
              </p>
              <p className="text-[12px] text-slate-500 leading-snug mt-1">
                {notification.message}
              </p>
            </div>
            {isUnread && (
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: config.color }} />
            )}
          </div>

          <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-[3px] rounded-md"
              style={{ color: modColor.color, background: modColor.bg }}
            >
              {modColor.label}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-[3px] rounded-md"
              style={{
                color: priorityConfig[notification.priority]?.color || "#94a3b8",
                background: `${priorityConfig[notification.priority]?.color || "#94a3b8"}15`,
              }}
            >
              {priorityConfig[notification.priority]?.label || notification.priority}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock size={11} />
              {timeAgoLong(notification.created_at)}
            </span>
            {notification.creator && (
              <span className="text-[11px] text-slate-400">
                by {notification.creator.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
          {isUnread && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
              title="Mark as read"
            >
              <Check size={14} className="text-blue-500" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

const MemoizedListItem = NotificationListItem;

export default function NotificationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    module: moduleFilter,
    type: typeFilter,
    priority: priorityFilter,
    unread: activeTab === "unread",
    page,
    per_page: 20,
  }), [debouncedSearch, moduleFilter, typeFilter, priorityFilter, activeTab, page]);

  const { data, isLoading, refetch } = useNotificationList(filters);
  const { data: modulesData } = useNotificationModules();
  const { markAsRead, markAllAsRead, deleteNotification, refetchAll } = useNotifications();

  const notifications = data?.data || [];
  const totalPages = data?.last_page || 1;
  const totalItems = data?.total || 0;

  const availableModules = modulesData?.modules || [];

  const handleMarkAsRead = useCallback((id) => {
    markAsRead(id, {
      onSuccess: () => { refetch(); refetchAll(); },
    });
  }, [markAsRead, refetch, refetchAll]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead(undefined, {
      onSuccess: () => { refetch(); refetchAll(); },
    });
  }, [markAllAsRead, refetch, refetchAll]);

  const handleDelete = useCallback((id) => {
    deleteNotification(id, {
      onSuccess: () => { refetch(); refetchAll(); },
    });
  }, [deleteNotification, refetch, refetchAll]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }, [handleMarkAsRead, router]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setModuleFilter("");
    setTypeFilter("");
    setPriorityFilter("");
    setPage(1);
  }, []);

  const hasActiveFilters = moduleFilter || typeFilter || priorityFilter;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.18)" }}
            >
              <Bell size={22} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-[-0.03em]">
                Notifications
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {totalItems} notification{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "unread" && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`relative px-4 py-2 rounded-[10px] text-[12.5px] font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12.5px] font-medium transition-colors ${
                  showFilters || hasActiveFilters
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {[moduleFilter, typeFilter, priorityFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Module:</span>
                <select
                  value={moduleFilter}
                  onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-700 focus:outline-none focus:border-blue-400"
                >
                  <option value="">All modules</option>
                  {availableModules.map((m) => (
                    <option key={m} value={m}>
                      {moduleColors[m]?.label || m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-700 focus:outline-none focus:border-blue-400"
                >
                  <option value="">All types</option>
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-700 focus:outline-none focus:border-blue-400"
                >
                  <option value="">All priorities</option>
                  {Object.entries(priorityConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
          )}

          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Bell size={28} className="text-slate-300" />
                </div>
                <p className="text-[15px] font-semibold text-slate-600">No notifications found</p>
                <p className="text-[12.5px] text-slate-400 mt-1 text-center max-w-sm">
                  {hasActiveFilters || search
                    ? "Try adjusting your filters or search terms."
                    : "When you receive notifications, they'll appear here."}
                </p>
                {(hasActiveFilters || search) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-[12.5px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              notifications.map((notification, idx) => (
                <MemoizedListItem
                  key={notification.id}
                  notification={notification}
                  index={idx}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-[11.5px] text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-colors ${
                        page === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
