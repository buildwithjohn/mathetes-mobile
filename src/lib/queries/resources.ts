import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { LibraryItem } from "@/lib/database.types";

export const libraryKeys = {
  all: ["library"] as const,
  item: (id: string) => ["library", id] as const,
};

// Published library items in the member's parish (books, monthly manuals,
// audio sermons, video messages). RLS scopes to the parish.
export function useLibraryItems() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: libraryKeys.all,
    enabled: !!authId,
    queryFn: async (): Promise<LibraryItem[]> => {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLibraryItem(id: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: libraryKeys.item(id),
    enabled: !!authId && !!id,
    queryFn: async (): Promise<LibraryItem | null> => {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
