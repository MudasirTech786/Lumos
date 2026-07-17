"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

/**
 * Full notification hook for components that need the notification list
 * (NotificationPanel, NotificationsPage).
 *
 * For just the unread badge, use useUnreadCount() instead.
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await api.get("/notifications/unread-count");
      return res.data;
    },
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  const { data: recentData, isLoading: loadingRecent } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: async () => {
      const res = await api.get("/notifications/recent");
      return res.data;
    },
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId) => {
      await api.put(`/notifications/${notificationId}/read`);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "unread-count"] });
      const prev = queryClient.getQueryData(["notifications", "unread-count"]);
      queryClient.setQueryData(["notifications", "unread-count"], (old) => {
        if (!old) return old;
        const current = old.unread_count || old.data?.unread_count || 0;
        return { ...old, unread_count: Math.max(0, current - 1) };
      });
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", "unread-count"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "unread-count"] });
      const prev = queryClient.getQueryData(["notifications", "unread-count"]);
      queryClient.setQueryData(["notifications", "unread-count"], (old) => {
        if (!old) return old;
        return { ...old, unread_count: 0 };
      });
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", "unread-count"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "unread-count"] });
      const prev = queryClient.getQueryData(["notifications", "unread-count"]);
      const recent = queryClient.getQueryData(["notifications", "recent"]);
      const wasUnread = (recent?.notifications || []).find(n => n.id === notificationId && !n.read_at);
      if (wasUnread) {
        queryClient.setQueryData(["notifications", "unread-count"], (old) => {
          if (!old) return old;
          const current = old.unread_count || old.data?.unread_count || 0;
          return { ...old, unread_count: Math.max(0, current - 1) };
        });
      }
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", "unread-count"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
    },
  });

  const bumpUnreadCount = useCallback(() => {
    queryClient.setQueryData(["notifications", "unread-count"], (old) => {
      const current = old?.unread_count ?? old?.data?.unread_count ?? 0;
      return { ...(old || {}), unread_count: current + 1 };
    });
    queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
  }, [queryClient]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const unreadCount = unreadData?.unread_count ?? unreadData?.data?.unread_count ?? 0;

  return {
    notifications: recentData?.notifications || [],
    unreadCount,
    loading: loadingRecent,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    bumpUnreadCount,
    refetchAll,
    refetch: refetchAll,
  };
}

export function useNotificationList(filters = {}) {
  return useQuery({
    queryKey: ["notifications", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.module) params.append("module", filters.module);
      if (filters.type) params.append("type", filters.type);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.unread) params.append("unread", "1");
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      params.append("per_page", filters.per_page || "20");

      const res = await api.get(`/notifications?${params.toString()}`);
      return res.data;
    },
    staleTime: 10000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

export function useNotificationModules() {
  return useQuery({
    queryKey: ["notifications", "modules"],
    queryFn: async () => {
      const res = await api.get("/notifications/modules");
      return res.data;
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}
