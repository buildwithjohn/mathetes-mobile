import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
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
  Check,
  X,
} from "lucide-react-native";
import {
  useBibleVersions,
  useBibleBooks,
  useChapterVerses,
  useBookChapters,
  useReadingPosition,
  useUpdateReadingPosition,
  DEFAULT_VERSION,
} from "@/lib/queries/bible";
import {
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
  const { data: versions } = useBibleVersions();
  const [versionCode, setVersionCode] = useState(DEFAULT_VERSION);
  const { data: books } = useBibleBooks(versionCode);
  const { data: position } = useReadingPosition();
  const updatePosition = useUpdateReadingPosition();
  const { data: highlights } = useHighlights();
  const toggleBookmark = useToggleBookmark();
  const setHighlight = useSetHighlight();
  const params = useLocalSearchParams<{ book?: string; chapter?: string }>();

  const [abbrev, setAbbrev] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number>(1);
  const [navOpen, setNavOpen] = useState(false);
  const [transOpen, setTransOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Remember the chosen translation across launches.
  useEffect(() => {
    AsyncStorage.getItem("bible.version").then((v) => {
      if (v) setVersionCode(v);
    });
  }, []);
  const pickVersion = (code: string) => {
    setVersionCode(code);
    setTransOpen(false);
    AsyncStorage.setItem("bible.version", code).catch(() => {});
  };

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

  // Map verse id -> highlight color for quick lookups while rendering.
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
      `${body}\n\n${reference} (${versionCode})`
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
        label: versionCode,
      },
    });
    clearSelection();
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Slim top bar: book pill + translation pill + search */}
      <View className="flex-row items-center justify-between px-4 pb-2.5 pt-3.5">
        <Pressable
          onPress={() => books && setNavOpen(true)}
          className="flex-row items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 active:opacity-70"
        >
          <Text className="font-display text-base text-ink">
            {reference || "Bible"}
          </Text>
          <ChevronDown color={colors.inkMute} size={14} strokeWidth={2} />
        </Pressable>
        <View className="flex-row items-center gap-1">
          {/* Translation switcher — lists whatever versions the backend has. */}
          <Pressable
            onPress={() => setTransOpen(true)}
            className="flex-row items-center gap-1 rounded-full border border-rule px-3 py-2 active:opacity-70"
          >
            <Text
              className="font-sans-medium text-xs text-ink-soft"
              style={{ letterSpacing: 0.72 }}
            >
              {versionCode}
            </Text>
            <ChevronDown color={colors.inkMute} size={12} strokeWidth={2} />
          </Pressable>
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
        <Animated.ScrollView
          key={`${abbrev}-${chapter}`}
          entering={FadeInDown.duration(380)}
          className="flex-1"
          contentContainerClassName="px-7 pb-40 pt-3"
          showsVerticalScrollIndicator={false}
        >
          {/* Centered chapter header */}
          <Text
            className="mt-3 text-center font-sans-medium text-[11px] uppercase text-ink-mute"
            style={{ letterSpacing: 1.76 }}
          >
            {book.name}
          </Text>
          <Text className="mb-1.5 mt-1 text-center font-display text-[38px] text-ink">
            {chapter}
          </Text>
          <View className="mx-auto mb-6 h-px w-[60px] bg-copper opacity-50" />

          {/* Flowing reader: verses inline, tap to select. Highlight and
              selection tint the verse's text background. */}
          <Text className="font-scripture text-ink" style={{ fontSize: 18, lineHeight: 30 }}>
            {verses.map((v) => {
              const isSelected = selected.has(v.number);
              const hColor = highlightMap.get(v.id);
              const bg = isSelected
                ? `${colors.copper}2E`
                : hColor
                  ? `${highlightColors[hColor]}26`
                  : undefined;
              return (
                <Text
                  key={v.id}
                  onPress={() => toggleVerse(v.number)}
                  style={bg ? { backgroundColor: bg } : undefined}
                >
                  <Text
                    className="font-sans-semibold"
                    style={{
                      fontSize: 12,
                      color: isSelected ? colors.oxblood : colors.copperDeep,
                    }}
                  >
                    {v.number}{" "}
                  </Text>
                  {v.text}{" "}
                </Text>
              );
            })}
          </Text>

          {/* Chapter pager */}
          <View className="mt-9 flex-row items-center justify-between">
            <Pressable
              onPress={() => goChapter(false)}
              className="flex-row items-center gap-1 rounded-full border border-rule px-4 py-2 active:opacity-60"
            >
              <ChevronLeft color={colors.inkSoft} size={18} />
              <Text className="font-sans-medium text-ink">Previous</Text>
            </Pressable>
            <Pressable
              onPress={() => goChapter(true)}
              className="flex-row items-center gap-1 rounded-full border border-rule px-4 py-2 active:opacity-60"
            >
              <Text className="font-sans-medium text-ink">Next</Text>
              <ChevronRight color={colors.inkSoft} size={18} />
            </Pressable>
          </View>
        </Animated.ScrollView>
      )}

      {/* Flash confirmation */}
      {flash ? (
        <View className="absolute inset-x-0 bottom-6 items-center">
          <View className="rounded-full bg-ink px-4 py-2">
            <Text className="text-sm text-parchment">{flash}</Text>
          </View>
        </View>
      ) : null}

      {/* Floating action card */}
      {selected.size > 0 ? (
        <View className="absolute inset-x-3 bottom-4 overflow-hidden rounded-[18px] border border-rule bg-paper shadow-lg">
          {/* Selected reference label */}
          {selected.size === 1 && book ? (
            <View className="border-b border-rule-soft px-4 py-2.5">
              <Text className="font-sans-medium text-xs text-ink-soft">
                {book.name} {chapter}:
                <Text className="text-ink">{[...selected][0]}</Text>
              </Text>
            </View>
          ) : null}
          {pickerOpen ? (
            <View className="flex-row items-center justify-between border-b border-rule-soft px-4 py-3">
              <View className="flex-row gap-3">
                {HIGHLIGHT_KEYS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => applyHighlight(c)}
                    className="h-8 w-8 rounded-full border border-rule"
                    style={{ backgroundColor: highlightColors[c] }}
                    accessibilityLabel={`Highlight ${c}`}
                  />
                ))}
              </View>
              <Pressable
                onPress={() => applyHighlight(null)}
                className="rounded-full border border-rule px-3 py-1.5"
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

      {/* Translation switcher sheet */}
      <Modal
        visible={transOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTransOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-ink/30"
          onPress={() => setTransOpen(false)}
        >
          <View className="rounded-t-3xl bg-surface1 px-5 pb-10 pt-3">
            <View className="mb-2 h-1 w-10 self-center rounded-full bg-rule" />
            <Text className="mb-2 px-1 font-display text-lg text-ink">
              Translation
            </Text>
            {(versions ?? []).map((v, i) => {
              const active = v.code === versionCode;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => pickVersion(v.code)}
                  className={`flex-row items-center gap-3 py-3.5 ${
                    i < (versions?.length ?? 0) - 1
                      ? "border-b border-rule-soft"
                      : ""
                  }`}
                >
                  <View className="h-9 w-12 items-center justify-center rounded-lg bg-paper-raised">
                    <Text className="font-display text-[13px] text-ink-soft">
                      {v.code}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14.5px] text-ink">{v.name}</Text>
                    {v.license ? (
                      <Text className="mt-0.5 text-[11.5px] text-ink-mute">
                        {v.license}
                      </Text>
                    ) : null}
                  </View>
                  {active ? (
                    <Check color={colors.copper} size={18} strokeWidth={2} />
                  ) : null}
                </Pressable>
              );
            })}
            {(versions ?? []).length <= 1 ? (
              <Text className="px-1 pt-3 text-[12px] text-ink-mute">
                More translations are on the way.
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Modal>
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
      <Icon color={colors.inkSoft} size={20} strokeWidth={1.7} />
      <Text className="text-[11.5px] text-ink-soft">{label}</Text>
    </Pressable>
  );
}
