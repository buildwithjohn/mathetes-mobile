import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type { Bookmark, Highlight, HighlightColor } from "@/lib/database.types";

export const libraryKeys = {
  bookmarks: ["library", "bookmarks"] as const,
  highlights: ["library", "highlights"] as const,
  entries: ["library", "entries"] as const,
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
      queryClient.invalidateQueries({ queryKey: libraryKeys.entries });
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
      queryClient.invalidateQueries({ queryKey: libraryKeys.entries });
    },
  });
}

// A library entry: a bookmark or highlight resolved to a readable reference and
// verse text, so the Library screen can show them without a second lookup.
export type LibraryEntry = {
  key: string;
  kind: "bookmark" | "highlight";
  verseId: string;
  reference: string;
  bookAbbrev: string;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor | null;
  createdAt: string;
};

// Embedded shape: verse -> chapter -> book, walked to build the reference.
type VerseEmbed = {
  number: number;
  text: string;
  bible_chapters: {
    number: number;
    bible_books: { name: string; abbrev: string } | null;
  } | null;
} | null;

type BookmarkEmbed = {
  id: string;
  verse_id: string;
  created_at: string;
  bible_verses: VerseEmbed;
};

type HighlightEmbed = {
  id: string;
  verse_id: string;
  color: HighlightColor;
  created_at: string;
  bible_verses: VerseEmbed;
};

const VERSE_EMBED =
  "bible_verses(number, text, bible_chapters(number, bible_books(name, abbrev)))";

function toEntry(
  row: BookmarkEmbed | HighlightEmbed,
  kind: "bookmark" | "highlight"
): LibraryEntry | null {
  const v = row.bible_verses;
  const ch = v?.bible_chapters;
  const bk = ch?.bible_books;
  if (!v || !ch || !bk) return null;
  return {
    key: `${kind}-${row.id}`,
    kind,
    verseId: row.verse_id,
    reference: `${bk.name} ${ch.number}:${v.number}`,
    bookAbbrev: bk.abbrev,
    chapter: ch.number,
    verse: v.number,
    text: v.text,
    color: kind === "highlight" ? (row as HighlightEmbed).color : null,
    createdAt: row.created_at,
  };
}

// Bookmarks and highlights together, each resolved to its reference and text
// and sorted newest first. Tapping one opens the Bible at that location.
export function useLibraryEntries() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: libraryKeys.entries,
    enabled: !!authId,
    queryFn: async (): Promise<LibraryEntry[]> => {
      const [bm, hl] = await Promise.all([
        supabase
          .from("bookmarks")
          .select(`id, verse_id, created_at, ${VERSE_EMBED}`)
          .order("created_at", { ascending: false })
          .returns<BookmarkEmbed[]>(),
        supabase
          .from("highlights")
          .select(`id, verse_id, color, created_at, ${VERSE_EMBED}`)
          .order("created_at", { ascending: false })
          .returns<HighlightEmbed[]>(),
      ]);
      if (bm.error) throw bm.error;
      if (hl.error) throw hl.error;

      return [
        ...(bm.data ?? []).map((r) => toEntry(r, "bookmark")),
        ...(hl.data ?? []).map((r) => toEntry(r, "highlight")),
      ]
        .filter((e): e is LibraryEntry => e !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  });
}
