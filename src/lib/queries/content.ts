import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
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
  devotionalBookmark: (id: string) => ["devotional", id, "bookmark"] as const,
  savedDevotionals: ["devotional", "saved"] as const,
  wordNote: (id: string) => ["word_of_day", id, "note"] as const,
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
        .in("status", ["published", "scheduled"])
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
        .in("status", ["published", "scheduled"])
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
        .in("status", ["published", "scheduled"])
        .lte("publish_date", todayKey())
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
        .in("status", ["published", "scheduled"])
        .lte("publish_date", todayKey())
        .order("publish_date", { ascending: false, nullsFirst: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDevotionalBookmark(devotionalId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.devotionalBookmark(devotionalId),
    enabled: !!authId && !!devotionalId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from("devotional_bookmarks")
        .select("id")
        .eq("devotional_id", devotionalId)
        .maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    },
  });
}

export function useToggleDevotionalBookmark(devotionalId: string) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!profile) throw new Error("Sign in to save this devotional.");

      const { data: existing, error: readError } = await supabase
        .from("devotional_bookmarks")
        .select("id")
        .eq("devotional_id", devotionalId)
        .maybeSingle();
      if (readError) throw readError;

      if (existing) {
        const { error } = await supabase
          .from("devotional_bookmarks")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase.from("devotional_bookmarks").insert({
        user_id: profile.id,
        devotional_id: devotionalId,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(
        contentKeys.devotionalBookmark(devotionalId),
        saved ? "saved" : null
      );
      queryClient.invalidateQueries({ queryKey: contentKeys.savedDevotionals });
    },
  });
}

export type SavedDevotional = Devotional & { saved_at: string };

export function useSavedDevotionals() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.savedDevotionals,
    enabled: !!authId,
    queryFn: async (): Promise<SavedDevotional[]> => {
      const { data: saves, error: saveError } = await supabase
        .from("devotional_bookmarks")
        .select("devotional_id, created_at")
        .order("created_at", { ascending: false });
      if (saveError) throw saveError;
      if (!saves?.length) return [];

      const { data: devotionals, error: devotionalError } = await supabase
        .from("devotionals")
        .select("*")
        .in("id", saves.map((save) => save.devotional_id));
      if (devotionalError) throw devotionalError;

      const byId = new Map((devotionals ?? []).map((devotional) => [devotional.id, devotional]));
      return saves.flatMap((save) => {
        const devotional = byId.get(save.devotional_id);
        return devotional ? [{ ...devotional, saved_at: save.created_at }] : [];
      });
    },
  });
}

export function useWordNote(wordId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: contentKeys.wordNote(wordId),
    enabled: !!authId && !!wordId,
    queryFn: async () => {
      const { data, error } = await supabase.from("word_notes").select("id, body").eq("word_of_day_id", wordId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveWordNote(wordId: string) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!profile) throw new Error("No profile.");
      const { data: existing, error: readError } = await supabase.from("word_notes").select("id").eq("word_of_day_id", wordId).maybeSingle();
      if (readError) throw readError;
      if (!body.trim() && existing) {
        const { error } = await supabase.from("word_notes").delete().eq("id", existing.id);
        if (error) throw error;
        return;
      }
      if (!body.trim()) return;
      const { error } = existing
        ? await supabase.from("word_notes").update({ body: body.trim() }).eq("id", existing.id)
        : await supabase.from("word_notes").insert({ user_id: profile.id, word_of_day_id: wordId, body: body.trim() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKeys.wordNote(wordId) }),
  });
}
