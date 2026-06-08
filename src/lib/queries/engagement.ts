import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { Streak } from "@/lib/database.types";

// Records today's check-in and returns the streak. record_check_in() is
// idempotent per calendar day and applies the backend's grace-day logic (one
// missed day per month is bridged), so calling it as the daily read is safe.
export function useStreak() {
  const authId = useAuth((s) => s.session?.user.id ?? null);

  const query = useQuery({
    queryKey: ["streak"],
    enabled: !!authId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Streak> => {
      const { data, error } = await supabase.rpc("record_check_in");
      if (error) throw error;
      return data;
    },
  });

  return {
    count: query.data?.current_count ?? 0,
    best: query.data?.longest ?? 0,
    ready: query.isSuccess,
  };
}
