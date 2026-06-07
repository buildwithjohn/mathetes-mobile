import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { Devotional, WordOfDay } from "@/lib/database.types";

// Local calendar day as the backend stores publish_date (a plain date).
export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const contentKeys = {
  wordByDate: (date: string) => ["word_of_day", date] as const,
  devotional: (id: string) => ["devotional", id] as const,
  todaysDevotional: (date: string) => ["devotional", "today", date] as const,
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
