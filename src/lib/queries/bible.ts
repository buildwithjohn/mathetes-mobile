import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type {
  BibleBook,
  BibleVersion,
  ChapterPayload,
  SearchResult,
  ReadingPosition,
} from "@/lib/database.types";

export const DEFAULT_VERSION = "KJV";

export const bibleKeys = {
  versions: ["bible", "versions"] as const,
  books: (code: string) => ["bible", "books", code] as const,
  chapter: (code: string, abbrev: string, n: number) =>
    ["bible", "chapter", code, abbrev, n] as const,
  search: (code: string, q: string) => ["bible", "search", code, q] as const,
  readingPosition: ["bible", "reading_position"] as const,
};

export function useBibleVersions() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: bibleKeys.versions,
    enabled: !!authId,
    staleTime: Infinity,
    queryFn: async (): Promise<BibleVersion[]> => {
      const { data, error } = await supabase
        .from("bible_versions")
        .select("*")
        .order("code");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// All books for a version, ordered canonically (Genesis -> Revelation).
export function useBibleBooks(versionCode: string = DEFAULT_VERSION) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: bibleKeys.books(versionCode),
    enabled: !!authId,
    staleTime: Infinity,
    queryFn: async (): Promise<BibleBook[]> => {
      const { data: ver, error: vErr } = await supabase
        .from("bible_versions")
        .select("id")
        .eq("code", versionCode)
        .single();
      if (vErr) throw vErr;
      const { data, error } = await supabase
        .from("bible_books")
        .select("*")
        .eq("version_id", ver.id)
        .order("book_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Chapter numbers for a book (for the navigator's chapter grid).
export function useBookChapters(bookId: string | null) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: ["bible", "book_chapters", bookId] as const,
    enabled: !!authId && !!bookId,
    staleTime: Infinity,
    queryFn: async (): Promise<number[]> => {
      const { data, error } = await supabase
        .from("bible_chapters")
        .select("number")
        .eq("book_id", bookId!)
        .order("number");
      if (error) throw error;
      return (data ?? []).map((r) => r.number);
    },
  });
}

// A full chapter with its verses, via the get_chapter() RPC.
export function useBibleChapter(
  bookAbbrev: string | null,
  chapterNumber: number | null,
  versionCode: string = DEFAULT_VERSION
) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: bibleKeys.chapter(versionCode, bookAbbrev ?? "", chapterNumber ?? 0),
    enabled: !!authId && !!bookAbbrev && !!chapterNumber,
    staleTime: Infinity,
    queryFn: async (): Promise<ChapterPayload> => {
      const { data, error } = await supabase.rpc("get_chapter", {
        version_code: versionCode,
        book_abbrev: bookAbbrev!,
        chapter_number: chapterNumber!,
      });
      if (error) throw error;
      return data;
    },
  });
}

export type ChapterVerseRow = { id: string; number: number; text: string };

// A chapter's verses WITH ids (the reader needs ids to map bookmarks and
// highlights). get_chapter() omits ids, so the interactive reader uses this.
export function useChapterVerses(
  bookId: string | null,
  chapterNumber: number | null
) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: ["bible", "chapter_verses", bookId, chapterNumber] as const,
    enabled: !!authId && !!bookId && !!chapterNumber,
    staleTime: Infinity,
    queryFn: async (): Promise<{
      chapterId: string | null;
      verses: ChapterVerseRow[];
    }> => {
      const { data: ch, error: cErr } = await supabase
        .from("bible_chapters")
        .select("id")
        .eq("book_id", bookId!)
        .eq("number", chapterNumber!)
        .maybeSingle();
      if (cErr) throw cErr;
      if (!ch) return { chapterId: null, verses: [] };
      const { data, error } = await supabase
        .from("bible_verses")
        .select("id, number, text")
        .eq("chapter_id", ch.id)
        .order("number");
      if (error) throw error;
      return { chapterId: ch.id, verses: data ?? [] };
    },
  });
}

// Full-text search across verses, via the search_bible() RPC.
export function useBibleSearch(
  query: string,
  versionCode: string = DEFAULT_VERSION
) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  const trimmed = query.trim();
  return useQuery({
    queryKey: bibleKeys.search(versionCode, trimmed),
    enabled: !!authId && trimmed.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      const { data, error } = await supabase.rpc("search_bible", {
        query: trimmed,
        version_code: versionCode,
        max_results: 60,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReadingPosition() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: bibleKeys.readingPosition,
    enabled: !!authId,
    queryFn: async (): Promise<ReadingPosition | null> => {
      const { data, error } = await supabase
        .from("reading_position")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

type PositionPatch = {
  userId: string;
  versionId: string | null;
  bookId: string | null;
  chapter: number;
  verse?: number | null;
};

// Persist the user's last-read location. Upserts the single per-user row.
export function useUpdateReadingPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: PositionPatch): Promise<void> => {
      const { error } = await supabase.from("reading_position").upsert(
        {
          user_id: patch.userId,
          version_id: patch.versionId,
          book_id: patch.bookId,
          chapter_number: patch.chapter,
          verse_number: patch.verse ?? null,
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bibleKeys.readingPosition });
    },
  });
}
