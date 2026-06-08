import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Highlighter,
  Bookmark,
  ImageDown,
  X,
} from "lucide-react-native";
import {
  useBibleBooks,
  useChapterVerses,
  useBookChapters,
  useReadingPosition,
  useUpdateReadingPosition,
  DEFAULT_VERSION,
} from "@/lib/queries/bible";
import {
  useBookmarks,
  useHighlights,
  useToggleBookmark,
  useSetHighlight,
} from "@/lib/queries/library";
import { useProfile } from "@/lib/queries/profile";
import { BibleNavigator } from "@/components/BibleNavigator";
import { colors, highlightColors } from "@/theme/colors";
import type { HighlightColor } from "@/lib/database.types";

const HIGHLIGHT_KEYS = Object.keys(highlightColors) as HighlightColor[];

export default function Bible() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: books } = useBibleBooks();
  const { data: position } = useReadingPosition();
  const updatePosition = useUpdateReadingPosition();
  const { data: bookmarks } = useBookmarks();
  const { data: highlights } = useHighlights();
  const toggleBookmark = useToggleBookmark();
  const setHighlight = useSetHighlight();
  const params = useLocalSearchParams<{ book?: string; chapter?: string }>();

  const [abbrev, setAbbrev] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number>(1);
  const [navOpen, setNavOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Initialize the location from the saved reading position, else John 1. A
  // location passed via params (from the library) takes over in its own effect.
  useEffect(() => {
    if (abbrev || params.book || !books || books.length === 0) return;
    const fromPosition =
      position?.book_id != null
        ? books.find((b) => b.id === position.book_id)?.abbrev
        : undefined;
    setAbbrev(fromPosition ?? "John");
    setChapter(position?.chapter_number ?? 1);
  }, [books, position, abbrev, params.book]);

  // Jump to a book/chapter requested via params (e.g., a tapped library entry).
  useEffect(() => {
    if (!params.book || !books) return;
    if (!books.some((b) => b.abbrev === params.book)) return;
    setSelected(new Set());
    setPickerOpen(false);
    setAbbrev(params.book);
    setChapter(params.chapter ? Number(params.chapter) : 1);
  }, [params.book, params.chapter, books]);

  const book = useMemo(
    () => books?.find((b) => b.abbrev === abbrev) ?? null,
    [books, abbrev]
  );
  const { data: chapterData, isLoading: chapterLoading } = useChapterVerses(
    book?.id ?? null,
    abbrev ? chapter : null
  );
  const { data: bookChapters } = useBookChapters(book?.id ?? null);
  const maxChapter = bookChapters?.[bookChapters.length - 1] ?? null;

  // Persist reading position when the location resolves.
  useEffect(() => {
    if (!profile || !book) return;
    updatePosition.mutate({
      userId: profile.id,
      versionId: book.version_id,
      bookId: book.id,
      chapter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, book?.id, chapter]);

  // Maps for quick verse lookups.
  const bookmarkSet = useMemo(
    () => new Set((bookmarks ?? []).map((b) => b.verse_id)),
    [bookmarks]
  );
  const highlightMap = useMemo(() => {
    const m = new Map<string, HighlightColor>();
    (highlights ?? []).forEach((h) => m.set(h.verse_id, h.color));
    return m;
  }, [highlights]);

  const verses = chapterData?.verses ?? [];
  const reference = book ? `${book.name} ${chapter}` : "";

  const clearSelection = () => {
    setSelected(new Set());
    setPickerOpen(false);
  };

  const goChapter = (next: boolean) => {
    clearSelection();
    if (!books || !book) return;
    if (next) {
      if (maxChapter && chapter < maxChapter) {
        setChapter(chapter + 1);
        return;
      }
      const nb = books.find((b) => b.book_order === book.book_order + 1);
      if (nb) {
        setAbbrev(nb.abbrev);
        setChapter(1);
      }
    } else {
      if (chapter > 1) {
        setChapter(chapter - 1);
        return;
      }
      const pb = books.find((b) => b.book_order === book.book_order - 1);
      if (pb) {
        setAbbrev(pb.abbrev);
        setChapter(1);
      }
    }
  };

  const toggleVerse = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
    setPickerOpen(false);
  };

  const selectedVerses = verses.filter((v) => selected.has(v.number));

  const onCopy = async () => {
    if (selectedVerses.length === 0) return;
    const body = selectedVerses.map((v) => `${v.number} ${v.text}`).join("\n");
    await Clipboard.setStringAsync(
      `${body}\n\n${reference} (${DEFAULT_VERSION})`
    );
    clearSelection();
    setFlash("Copied to clipboard");
    setTimeout(() => setFlash(null), 1600);
  };

  const onBookmark = async () => {
    for (const v of selectedVerses) await toggleBookmark.mutateAsync(v.id);
    clearSelection();
    setFlash("Bookmark updated");
    setTimeout(() => setFlash(null), 1600);
  };

  const applyHighlight = async (color: HighlightColor | null) => {
    for (const v of selectedVerses)
      await setHighlight.mutateAsync({ verseId: v.id, color });
    clearSelection();
  };

  const onShareImage = () => {
    if (selectedVerses.length !== 1 || !book) return;
    const v = selectedVerses[0];
    router.push({
      pathname: "/studio",
      params: {
        text: v.text,
        reference: `${book.name} ${chapter}:${v.number}`,
        label: DEFAULT_VERSION,
      },
    });
    clearSelection();
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-2">
        <Pressable
          onPress={() => books && setNavOpen(true)}
          className="flex-row items-center gap-1.5 rounded-full bg-surface2 px-4 py-2 active:opacity-70"
        >
          <Text className="font-display text-lg text-ink">
            {reference || "Bible"}
          </Text>
          <ChevronDown color={colors.ink} size={18} />
        </Pressable>
        <View className="flex-row items-center gap-1">
          <Text className="mr-1 text-xs font-sans-medium uppercase tracking-widest text-copper">
            {DEFAULT_VERSION}
          </Text>
          <Pressable
            onPress={() => router.push("/bible/search")}
            className="h-10 w-10 items-center justify-center"
            accessibilityLabel="Search the Bible"
          >
            <Search color={colors.ink} size={22} />
          </Pressable>
        </View>
      </View>

      {/* Verses */}
      {chapterLoading || !book ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : verses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            This chapter is not available yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-40 pt-5"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-4 font-display text-2xl text-ink">
            {reference}
          </Text>
          {verses.map((v) => {
            const isSelected = selected.has(v.number);
            const hColor = highlightMap.get(v.id);
            const isBookmarked = bookmarkSet.has(v.id);
            return (
              <Pressable
                key={v.id}
                onPress={() => toggleVerse(v.number)}
                className={`mb-1 flex-row rounded-lg px-2 py-1 ${
                  isSelected ? "bg-surface2" : ""
                }`}
                style={
                  !isSelected && hColor
                    ? { backgroundColor: `${highlightColors[hColor]}26` }
                    : undefined
                }
              >
                <Text className="flex-1 font-scripture text-lg leading-[30px] text-ink">
                  <Text className="text-xs font-sans-semibold text-copper">
                    {v.number}{" "}
                  </Text>
                  {v.text}
                </Text>
                {isBookmarked ? (
                  <Bookmark
                    color={colors.copper}
                    size={13}
                    fill={colors.copper}
                  />
                ) : null}
              </Pressable>
            );
          })}

          {/* Chapter pager */}
          <View className="mt-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => goChapter(false)}
              className="flex-row items-center gap-1 rounded-full border border-border px-4 py-2 active:opacity-60"
            >
              <ChevronLeft color={colors.ink} size={18} />
              <Text className="font-sans-medium text-ink">Previous</Text>
            </Pressable>
            <Pressable
              onPress={() => goChapter(true)}
              className="flex-row items-center gap-1 rounded-full border border-border px-4 py-2 active:opacity-60"
            >
              <Text className="font-sans-medium text-ink">Next</Text>
              <ChevronRight color={colors.ink} size={18} />
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Flash confirmation */}
      {flash ? (
        <View className="absolute inset-x-0 bottom-6 items-center">
          <View className="rounded-full bg-ink px-4 py-2">
            <Text className="text-sm text-parchment">{flash}</Text>
          </View>
        </View>
      ) : null}

      {/* Floating action bar */}
      {selected.size > 0 ? (
        <View className="absolute inset-x-4 bottom-6 overflow-hidden rounded-2xl border border-border bg-surface1 shadow-lg">
          {pickerOpen ? (
            <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
              <View className="flex-row gap-3">
                {HIGHLIGHT_KEYS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => applyHighlight(c)}
                    className="h-8 w-8 rounded-full border border-border"
                    style={{ backgroundColor: highlightColors[c] }}
                    accessibilityLabel={`Highlight ${c}`}
                  />
                ))}
              </View>
              <Pressable
                onPress={() => applyHighlight(null)}
                className="rounded-full border border-border px-3 py-1.5"
              >
                <Text className="text-sm text-ink">Clear</Text>
              </Pressable>
            </View>
          ) : null}
          <View className="flex-row items-center justify-between px-2 py-2">
            <View className="flex-row">
              <ActionButton icon={Copy} label="Copy" onPress={onCopy} />
              <ActionButton
                icon={Highlighter}
                label="Highlight"
                onPress={() => setPickerOpen((p) => !p)}
              />
              <ActionButton
                icon={Bookmark}
                label="Bookmark"
                onPress={onBookmark}
              />
              <ActionButton
                icon={ImageDown}
                label="Image"
                onPress={onShareImage}
                disabled={selected.size !== 1}
              />
            </View>
            <Pressable
              onPress={clearSelection}
              className="h-10 w-10 items-center justify-center"
              accessibilityLabel="Clear selection"
            >
              <X color={colors.ink} size={20} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {books ? (
        <BibleNavigator
          visible={navOpen}
          onClose={() => setNavOpen(false)}
          books={books}
          onSelect={(a, c) => {
            clearSelection();
            setAbbrev(a);
            setChapter(c);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

type IconType = typeof Copy;
function ActionButton({
  icon: Icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconType;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`w-[72px] items-center gap-1 py-2 ${
        disabled ? "opacity-30" : "active:opacity-60"
      }`}
    >
      <Icon color={colors.ink} size={20} />
      <Text className="text-xs text-ink">{label}</Text>
    </Pressable>
  );
}
