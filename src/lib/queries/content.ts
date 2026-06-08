import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type {
  Devotional,
  DevotionalSeries,
  WordOfDay,
} from "@/lib/database.types";

// Local calendar day as the backend stores publish_date (a plain date).
export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const contentKeys = {
  wordByDate: (date: string) => ["word_of_day", date] as const,
  devotional: (id: string) => ["devotional", id] as const,
  todaysDevotional: (date: string) => ["devotional", "today", date] as const,
  series: ["devotional_series"] as const,
  seriesDevotionals: (id: string) => ["devotional_series", id] as const,
  devotionalArchive: ["devotional", "archive"] as const,
  wordArchive: ["word_of_day", "archive"] as const,
};

// The Word of the Day for a given date. RLS limits this to the user's parish
// and to published content dated today or earlier.
export function useWordOfDay(date: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);

  return useQuery({
    queryKey: contentKeys.wordByDate(date),
    enabled: !!authId && !!date,
    queryFn: async (): Promise<WordOfDay | null> => {
      const { data, error } = await supabase
        .from("word_of_day")
        .select("*")
        .eq("publish_date", date)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useTodaysWordOfDay() {
  return useWordOfDay(todayKey());
}

// Today's devotional for the user's parish.
export function useTodaysDevotional() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  const date = todayKey();

  return useQuery({
    queryKey: contentKeys.todaysDevotional(date),
    enabled: !!authId,
    queryFn: async (): Promise<Devotional | null> => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("publish_date", date)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// A single devotional by id (for the reading view).
export function useDevotional(id: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);

  return useQuery({
    queryKey: contentKeys.devotional(id),
    enabled: !!authId && !!id,
    queryFn: async (): Promise<Devotional | null> => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// Devotional series in the user's parish (admins author them).
export function useDevotionalSeries() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.series,
    enabled: !!authId,
    queryFn: async (): Promise<DevotionalSeries[]> => {
      const { data, error } = await supabase
        .from("devotional_series")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Published devotionals within a series, in reading order. RLS hides days that
// are not yet published.
export function useSeriesDevotionals(seriesId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.seriesDevotionals(seriesId),
    enabled: !!authId && !!seriesId,
    queryFn: async (): Promise<Devotional[]> => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("series_id", seriesId)
        .order("day_in_series", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Recently published devotionals across the parish (newest first).
export function useDevotionalArchive() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.devotionalArchive,
    enabled: !!authId,
    queryFn: async (): Promise<Devotional[]> => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("status", "published")
        .order("publish_date", { ascending: false, nullsFirst: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Recently published Words of the Day (newest first), for the archive screen.
export function useWordArchive() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.wordArchive,
    enabled: !!authId,
    queryFn: async (): Promise<WordOfDay[]> => {
      const { data, error } = await supabase
        .from("word_of_day")
        .select("*")
        .eq("status", "published")
        .order("publish_date", { ascending: false, nullsFirst: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });
}
