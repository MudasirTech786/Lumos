"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

/**
 * Lightweight hook for the notification bell badge.
 * Only subscribes to unread count - does NOT pull recent notifications.
 * This prevents the entire Layout from re-rendering on notification list changes.
 */
export function useUnreadCount() {
  const { data } = useQuery({
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

  return data?.unread_count ?? data?.data?.unread_count ?? 0;
}
