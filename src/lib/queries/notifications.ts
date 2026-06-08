import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { Notification } from "@/lib/database.types";

export const notificationKeys = {
  list: ["notifications"] as const,
};

// Keep the in-app bell live: refetch the feed when notification rows change.
export function useNotificationsRealtime() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!authId) return;
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () =>
          queryClient.invalidateQueries({ queryKey: notificationKeys.list })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [authId, queryClient]);
}

// The member's in-app notification feed, newest first. Rows are created by
// backend triggers (messages, announcements, answered questions); members only
// read, mark read, and delete their own.
export function useNotifications() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: notificationKeys.list,
    enabled: !!authId,
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return (data ?? []).filter((n) => n.read_at === null).length;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
}
