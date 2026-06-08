import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { Announcement, Json } from "@/lib/database.types";

export const announcementKeys = {
  list: ["announcements"] as const,
};

export type AnnouncementEvent = {
  date?: string;
  time?: string;
  location?: string;
};

// Safely read the optional { date, time, location } shape from event_data.
export function announcementEvent(value: Json | null): AnnouncementEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const o = value as { [k: string]: Json | undefined };
  const str = (v: Json | undefined) => (typeof v === "string" ? v : undefined);
  const ev: AnnouncementEvent = {
    date: str(o.date),
    time: str(o.time),
    location: str(o.location),
  };
  return ev.date || ev.time || ev.location ? ev : null;
}

// Published parish announcements (RLS returns published dated today or earlier,
// plus drafts for admins), newest first.
export function useAnnouncements() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: announcementKeys.list,
    enabled: !!authId,
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("publish_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
