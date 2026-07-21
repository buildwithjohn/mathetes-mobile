import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
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
  Bookmark,
  NotebookPen,
  Share2,
  Columns2,
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
  useVerseNote,
  useSaveVerseNote,
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
  const [flash, setFlash] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);

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
  const { data: compareBooks } = useBibleBooks(compareVersion ?? undefined);
  const compareBook = useMemo(
    () => compareBooks?.find((candidate) => candidate.abbrev === abbrev) ?? null,
    [compareBooks, abbrev]
  );
  const { data: compareChapter } = useChapterVerses(
    compareBook?.id ?? null,
    compareBook ? chapter : null
  );
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
  };

  const selectedVerses = verses.filter((v) => selected.has(v.number));
  const selectedVerse = selectedVerses.length === 1 ? selectedVerses[0] : null;
  const comparedVerse = compareChapter?.verses.find((v) => v.number === selectedVerse?.number) ?? null;
  const verseNote = useVerseNote(selectedVerse?.id ?? "");
  const saveVerseNote = useSaveVerseNote();

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

  const onOpenNote = () => {
    if (!selectedVerse) return;
    setNoteBody(verseNote.data?.body ?? "");
    setNoteOpen(true);
  };

  const onOpenCompare = () => {
    if (!selectedVerse) return;
    const alternative = versions?.find((version) => version.code !== versionCode)?.code ?? null;
    setCompareVersion(alternative);
    setCompareOpen(true);
  };

  const onSaveNote = () => {
    if (!selectedVerse) return;
    saveVerseNote.mutate(
      { verseId: selectedVerse.id, body: noteBody },
      {
        onSuccess: () => {
          setNoteOpen(false);
          clearSelection();
          setFlash(noteBody.trim() ? "Note saved" : "Note removed");
          setTimeout(() => setFlash(null), 1600);
        },
        onError: () => setFlash("Could not save note"),
      }
    );
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
              // A highlight is a translucent marker wash (the ink shows through
              // like a real highlighter), under a dotted "liner". Selection is a
              // softer copper wash with the same liner (YouVersion-style).
              const verseStyle = isSelected
                ? {
                    backgroundColor: `${colors.copper}2E`,
                    textDecorationLine: "underline" as const,
                    textDecorationStyle: "dotted" as const,
                    textDecorationColor: colors.inkMute,
                  }
                : hColor
                  ? {
                      backgroundColor: `${highlightColors[hColor]}B3`,
                      color: "#1A1A1A",
                      textDecorationLine: "underline" as const,
                      textDecorationStyle: "dotted" as const,
                      textDecorationColor: "#00000055",
                    }
                  : undefined;
              const highlighted = !isSelected && !!hColor;
              return (
                <Text
                  key={v.id}
                  onPress={() => toggleVerse(v.number)}
                  style={verseStyle}
                >
                  <Text
                    className="font-sans-semibold"
                    style={{
                      fontSize: 12,
                      color: highlighted
                        ? "#1A1A1A"
                        : isSelected
                          ? colors.oxblood
                          : colors.copperDeep,
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

      {/* Action sheet (YouVersion-style): the colours are shown directly with an
          X to remove; tapping a colour applies it and closes. */}
      {selected.size > 0 ? (
        <View className="absolute inset-x-2 bottom-4 overflow-hidden rounded-[22px] border border-rule bg-paper shadow-lg">
          <View className="items-center pt-3">
            <Text className="font-sans-medium text-[12px] text-ink-soft">
              {selected.size === 1 && book
                ? `${book.name} ${chapter}:${[...selected][0]}`
                : `${selected.size} verses selected`}
            </Text>
          </View>

          {/* Colours */}
          <View className="flex-row items-center justify-center gap-3 px-4 py-4">
            <Pressable
              onPress={() => applyHighlight(null)}
              className="h-9 w-9 items-center justify-center rounded-full border border-rule bg-surface2"
              accessibilityLabel="Remove highlight"
            >
              <X color={colors.inkSoft} size={17} />
            </Pressable>
            {HIGHLIGHT_KEYS.map((c) => (
              <Pressable
                key={c}
                onPress={() => applyHighlight(c)}
                className="h-9 w-9 rounded-full"
                style={{ backgroundColor: highlightColors[c] }}
                accessibilityLabel={`Highlight ${c}`}
              />
            ))}
          </View>

          <View className="h-px bg-rule-soft" />

          {/* Actions */}
          <View className="flex-row items-center justify-around px-2 py-2">
            <ActionButton icon={Bookmark} label="Save" onPress={onBookmark} />
            <ActionButton icon={Copy} label="Copy" onPress={onCopy} />
            <ActionButton
              icon={Share2}
              label="Share"
              onPress={onShareImage}
              disabled={selected.size !== 1}
            />
            <ActionButton
              icon={NotebookPen}
              label="Note"
              onPress={onOpenNote}
              disabled={selected.size !== 1}
            />
            <ActionButton
              icon={Columns2}
              label="Compare"
              onPress={onOpenCompare}
              disabled={selected.size !== 1 || (versions?.length ?? 0) < 2}
            />
            <ActionButton icon={X} label="Close" onPress={clearSelection} />
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

      <Modal
        visible={compareOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCompareOpen(false)}
      >
        <View className="flex-1 justify-end bg-ink/35">
          <View className="rounded-t-3xl bg-surface1 px-6 pb-10 pt-4">
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-rule" />
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-display text-xl text-ink">Compare</Text>
                {selectedVerse && book ? (
                  <Text className="mt-1 text-sm text-ink-mute">
                    {book.name} {chapter}:{selectedVerse.number}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={() => setCompareOpen(false)} className="h-10 w-10 items-center justify-center">
                <X color={colors.inkSoft} size={21} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
              <View className="flex-row gap-2">
                {(versions ?? []).filter((version) => version.code !== versionCode).map((version) => {
                  const active = version.code === compareVersion;
                  return (
                    <Pressable
                      key={version.id}
                      onPress={() => setCompareVersion(version.code)}
                      className={`rounded-full border px-4 py-2 ${active ? "border-ink bg-ink" : "border-rule bg-paper"}`}
                    >
                      <Text className={`font-sans-semibold text-xs ${active ? "text-parchment" : "text-ink-soft"}`}>
                        {version.code}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View className="mt-6 rounded-2xl bg-paper p-5">
              <Text className="font-sans-semibold text-xs uppercase text-copper-deep" style={{ letterSpacing: 1.4 }}>
                {versionCode}
              </Text>
              <Text className="mt-2 font-scripture text-[17px] leading-7 text-ink">
                {selectedVerse?.text}
              </Text>
            </View>
            <View className="mt-3 rounded-2xl border border-rule bg-surface1 p-5">
              <Text className="font-sans-semibold text-xs uppercase text-copper-deep" style={{ letterSpacing: 1.4 }}>
                {compareVersion ?? "Translation"}
              </Text>
              <Text className="mt-2 font-scripture text-[17px] leading-7 text-ink">
                {comparedVerse?.text ?? "Loading this translation…"}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={noteOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteOpen(false)}
      >
        <View className="flex-1 justify-end bg-ink/35">
          <View className="rounded-t-3xl bg-surface1 px-6 pb-10 pt-4">
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-rule" />
            <Text className="font-display text-xl text-ink">Your note</Text>
            {selectedVerse && book ? (
              <Text className="mt-1 text-sm text-ink-mute">
                {book.name} {chapter}:{selectedVerse.number}
              </Text>
            ) : null}
            <TextInput
              value={noteBody}
              onChangeText={setNoteBody}
              multiline
              autoFocus
              placeholder="What is God showing you here?"
              placeholderTextColor={colors.inkMute}
              className="mt-5 min-h-32 rounded-2xl border border-rule bg-paper p-4 text-[16px] leading-6 text-ink"
              textAlignVertical="top"
            />
            <View className="mt-4 flex-row justify-end gap-3">
              <Pressable onPress={() => setNoteOpen(false)} className="rounded-full px-4 py-3">
                <Text className="font-sans-medium text-ink-soft">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onSaveNote}
                disabled={saveVerseNote.isPending}
                className="rounded-full bg-ink px-5 py-3 active:opacity-80"
              >
                <Text className="font-sans-semibold text-parchment">
                  {saveVerseNote.isPending ? "Saving…" : "Save note"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
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
      className={`flex-1 items-center gap-1 py-2 ${
        disabled ? "opacity-30" : "active:opacity-60"
      }`}
    >
      <Icon color={colors.inkSoft} size={20} strokeWidth={1.7} />
      <Text className="text-[11.5px] text-ink-soft">{label}</Text>
    </Pressable>
  );
}
