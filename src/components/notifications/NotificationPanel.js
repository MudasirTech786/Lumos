"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Trash2, ChevronRight, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { typeConfig, moduleColors, timeAgo } from "@/lib/notificationConfig";

function groupNotifications(notifications) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const groups = { unread: [], today: [], yesterday: [], older: [] };

  notifications.forEach((n) => {
    if (!n.is_read) {
      groups.unread.push(n);
    } else {
      const date = new Date(n.created_at);
      if (date >= todayStart) groups.today.push(n);
      else if (date >= yesterdayStart) groups.yesterday.push(n);
      else groups.older.push(n);
    }
  });

  return groups;
}

const NotificationItem = ({ notification, sectionIndex, index, onRead, onDelete, onClick }) => {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;
  const modColor = moduleColors[notification.module] || { color: "#64748b", bg: "rgba(100,116,139,0.10)" };

  return (
    <div
      onClick={() => onClick(notification)}
      className="group relative px-4 py-3 cursor-pointer transition-all duration-150 hover:bg-slate-50/80"
      style={{
        borderLeft: notification.is_read ? "3px solid transparent" : `3px solid ${config.color}`,
        animation: `notifSlideIn 0.25s cubic-bezier(0.16,1,0.3,1) ${Math.min((sectionIndex * 10 + index) * 25, 200)}ms both`,
      }}
    >
      <div className="flex gap-3">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 shrink-0"
          style={{ background: config.bg, border: `1px solid ${config.border}` }}
        >
          <Icon size={15} style={{ color: config.color }} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12.5px] font-semibold text-slate-800 leading-tight line-clamp-1">
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1 notif-dot-pulse" style={{ background: config.color }} />
            )}
          </div>
          <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-md"
              style={{ color: modColor.color, background: modColor.bg }}
            >
              {notification.module}
            </span>
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(notification.created_at)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
          {!notification.is_read && (
            <button
              onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-blue-50 transition-colors"
              title="Mark as read"
            >
              <Check size={12} className="text-blue-500" />
            </button>
          )}
          <button
            onClick={(e) => onDelete(notification.id, e)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={11} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MemoizedNotificationItem = NotificationItem;

function NotificationSection({ title, items, sectionIndex, onRead, onDelete, onClick }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>
          {title}
        </p>
      </div>
      {items.map((notification, i) => (
        <MemoizedNotificationItem
          key={notification.id}
          notification={notification}
          sectionIndex={sectionIndex}
          index={i}
          onRead={onRead}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

const MemoizedSection = NotificationSection;

export default function NotificationPanel({ open, onClose }) {
  const router = useRouter();
  const panelRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refetchAll } = useNotifications();

  const groups = useMemo(() => groupNotifications(notifications), [notifications]);
  const totalItems = groups.unread.length + groups.today.length + groups.yesterday.length + groups.older.length;

  const autoMarkedRef = useRef(false);

  useEffect(() => {
    if (open) {
      refetchAll();
      autoMarkedRef.current = false;
    } else {
      autoMarkedRef.current = false;
    }
  }, [open, refetchAll]);

  useEffect(() => {
    if (!open || autoMarkedRef.current) return;
    if (groups.unread.length > 0) {
      autoMarkedRef.current = true;
      const timer = setTimeout(() => {
        markAllAsRead(undefined);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [open, groups.unread.length, markAllAsRead]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleMarkAsRead = useCallback((id) => {
    markAsRead(id);
  }, [markAsRead]);

  const handleDelete = useCallback((id, e) => {
    e.stopPropagation();
    deleteNotification(id);
  }, [deleteNotification]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  }, [handleMarkAsRead, router, onClose]);

  const handleViewAll = useCallback(() => {
    router.push("/dashboard/notifications");
    onClose();
  }, [router, onClose]);

  const handleMarkAllClick = useCallback(() => {
    markAllAsRead(undefined);
  }, [markAllAsRead]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-slate-900/20"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "notifBackdropFade 0.18s ease-out forwards",
        }}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="fixed z-[90] w-[400px] max-w-[calc(100vw-32px)] top-20 right-4 sm:right-6 rounded-[22px] border border-slate-200/80 bg-white overflow-hidden"
        style={{
          boxShadow: "0 24px 60px rgba(37,99,235,0.14), 0 4px 16px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(80,162,255,0.08)",
          animation: "notifPanelOpen 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <style>{`
          @keyframes notifBackdropFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes notifPanelOpen {
            from { opacity: 0; transform: scale(0.95) translateY(-8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes notifSlideIn {
            from { opacity: 0; transform: translateX(-8px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes notifDotPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
            50% { box-shadow: 0 0 0 4px rgba(59,130,246,0); }
          }
          .notif-dot-pulse { animation: notifDotPulse 2s ease-in-out infinite; }
        `}</style>

        <div className="h-[3px] w-full" style={{ background: "#50a2ff" }} />

        <div className="relative px-5 pt-[18px] pb-4 border-b border-slate-100 overflow-hidden">
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(80,162,255,0.08), transparent 70%)" }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(80,162,255,0.10)", border: "1px solid rgba(80,162,255,0.18)" }}
              >
                <Bell size={17} style={{ color: "#2563eb" }} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 tracking-[-0.02em] leading-none">Notifications</h3>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllClick}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold transition-colors"
                style={{ color: "#2563eb" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,162,255,0.10)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: "calc(100vh - 260px)" }}>
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{ background: "rgba(80,162,255,0.08)", border: "1px solid rgba(80,162,255,0.14)" }}
              >
                <Bell size={22} style={{ color: "#94b8f0" }} />
              </div>
              <p className="text-[13px] font-semibold text-slate-600">No notifications yet</p>
              <p className="text-[11.5px] text-slate-400 mt-1 text-center max-w-[220px]">
                When you receive notifications, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <MemoizedSection title="Unread" items={groups.unread} sectionIndex={0} onRead={handleMarkAsRead} onDelete={handleDelete} onClick={handleNotificationClick} />
              <MemoizedSection title="Today" items={groups.today} sectionIndex={1} onRead={handleMarkAsRead} onDelete={handleDelete} onClick={handleNotificationClick} />
              <MemoizedSection title="Yesterday" items={groups.yesterday} sectionIndex={2} onRead={handleMarkAsRead} onDelete={handleDelete} onClick={handleNotificationClick} />
              <MemoizedSection title="Older" items={groups.older} sectionIndex={3} onRead={handleMarkAsRead} onDelete={handleDelete} onClick={handleNotificationClick} />
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <div className="border-t border-slate-100 px-4 py-3">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12.5px] font-semibold transition-colors"
              style={{ color: "#2563eb" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,162,255,0.10)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              View all notifications
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
