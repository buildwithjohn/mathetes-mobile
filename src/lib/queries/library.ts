import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type { Bookmark, Highlight, HighlightColor } from "@/lib/database.types";

export const libraryKeys = {
  bookmarks: ["library", "bookmarks"] as const,
  highlights: ["library", "highlights"] as const,
};

// The user's bookmarks. Per-user and small for the pilot, so we load all and
// look up by verse_id in the reader.
export function useBookmarks() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: libraryKeys.bookmarks,
    enabled: !!authId,
    queryFn: async (): Promise<Bookmark[]> => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHighlights() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: libraryKeys.highlights,
    enabled: !!authId,
    queryFn: async (): Promise<Highlight[]> => {
      const { data, error } = await supabase.from("highlights").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Toggle a bookmark for a verse. Inserts if absent, deletes if present.
export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (verseId: string): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      const { data: existing, error: selErr } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("verse_id", verseId)
        .maybeSingle();
      if (selErr) throw selErr;

      if (existing) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: profile.id, verse_id: verseId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.bookmarks });
    },
  });
}

// Set or clear a highlight color for a verse. Passing null removes it.
export function useSetHighlight() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      verseId: string;
      color: HighlightColor | null;
    }): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      if (args.color === null) {
        const { error } = await supabase
          .from("highlights")
          .delete()
          .eq("verse_id", args.verseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("highlights").upsert(
          {
            user_id: profile.id,
            verse_id: args.verseId,
            color: args.color,
          },
          { onConflict: "user_id,verse_id" }
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.highlights });
    },
  });
}
