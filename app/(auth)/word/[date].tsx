import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Image, ImageBackground, Modal, StyleSheet, TextInput } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import { X, CalendarDays, Bookmark, BookmarkCheck, NotebookPen, ImageDown } from "lucide-react-native";
import {
  useWordOfDay,
  useWordNote,
  useSaveWordNote,
  useToggleWordBookmark,
  useWordBookmark,
} from "@/lib/queries/content";
import { ContentSignalBar } from "@/components/ContentSignalBar";
import { PressableScale } from "@/components/PressableScale";
import { sentences } from "@/utils/text";
import { haptic } from "@/utils/haptics";
import { Markdown } from "@/components/Markdown";
import { colors } from "@/theme/colors";

export default function WordExpanded() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: word, isLoading, isError } = useWordOfDay(date ?? "");
  const wordNote = useWordNote(word?.id ?? "");
  const saveWordNote = useSaveWordNote(word?.id ?? "");
  const wordBookmark = useWordBookmark(word?.id ?? "");
  const bookmarkMutation = useToggleWordBookmark(word?.id ?? "");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");

  const prettyDate = (() => {
    try {
      return date ? format(parseISO(date), "EEEE, d MMMM") : "";
    } catch {
      return "";
    }
  })();

  const onShareImage = () => {
    if (!word) return;
    router.push({
      pathname: "/studio",
      params: {
        text: word.verse_text,
        reference: word.verse_ref,
        label: "Word of the Day",
        backgroundUrl: word.cover_image_url ?? undefined,
        signalKind: "word",
        signalContentId: word.id,
      },
    });
  };
  // The encouragement-bar action should lead to the same visual composer as
  // the primary button. A share count is recorded only after the person shares
  // the generated image from Studio.
  const onOpenShareImage = () => {
    onShareImage();
    return Promise.resolve(false);
  };
  const onNote = () => {
    setNoteBody(wordNote.data?.body ?? "");
    setNoteOpen(true);
  };
  const onSaveNote = () =>
    saveWordNote.mutate(noteBody, {
      onSuccess: () => {
        setNoteOpen(false);
      },
      onError: () => Alert.alert("Could not save", "Please try again."),
    });
  const bookmarkScale = useSharedValue(1);
  const bookmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));
  const onSave = () => {
    const saving = !wordBookmark.data;
    haptic(saving ? "success" : "light");
    if (saving) {
      bookmarkScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 320 }),
        withSpring(1, { damping: 12, stiffness: 240 })
      );
    }
    bookmarkMutation.mutate(undefined, {
      onError: () => Alert.alert("Could not save", "Please try again."),
    });
  };

  const insets = useSafeAreaInsets();
  const verseLines = word ? sentences(word.verse_text) : [];

  return (
    <View className="flex-1 bg-parchment">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || !word ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink-mute">
            We could not find a Word for this day.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-8"
            showsVerticalScrollIndicator={false}
          >
            {/* IMMERSIVE VERSE HERO — the verse over a full-bleed atmospheric
                image, with glassy close/archive/save floating on top. */}
            <View style={{ minHeight: 430 }} className="overflow-hidden">
              <Image
                source={
                  word.cover_image_url
                    ? { uri: word.cover_image_url }
                    : require("../../../assets/images/today/wotd-bg.jpg")
                }
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <LinearGradient
                colors={[
                  "rgba(22,14,7,0.44)",
                  "rgba(22,14,7,0.10)",
                  "rgba(20,12,6,0.62)",
                  "rgba(13,8,3,0.96)",
                ]}
                locations={[0, 0.26, 0.6, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <SafeAreaView edges={["top"]}>
                <View className="flex-row items-center justify-between px-3 pt-1">
                  <Pressable
                    onPress={() => router.back()}
                    className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25"
                    accessibilityLabel="Close"
                  >
                    <X color="#fff" size={22} />
                  </Pressable>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => router.push("/words")}
                      className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25"
                      accessibilityLabel="Word archive"
                    >
                      <CalendarDays color="#fff" size={21} strokeWidth={1.7} />
                    </Pressable>
                    <Pressable
                      onPress={onSave}
                      disabled={bookmarkMutation.isPending}
                      className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25"
                      accessibilityLabel={wordBookmark.data ? "Remove saved Word" : "Save Word"}
                    >
                      <Animated.View style={bookmarkStyle}>
                        {wordBookmark.data ? (
                          <BookmarkCheck color="#FFC978" size={21} />
                        ) : (
                          <Bookmark color="#fff" size={21} strokeWidth={1.7} />
                        )}
                      </Animated.View>
                    </Pressable>
                  </View>
                </View>

                <View style={{ height: 84 }} />

                <View className="px-6 pb-8">
                  <Text
                    className="mb-4 font-sans-semibold text-[11px] uppercase"
                    style={{ letterSpacing: 1.9, color: "#F0C892" }}
                  >
                    Word of the day · {prettyDate}
                  </Text>
                  <Text
                    className="font-display text-[27px] leading-[37px]"
                    style={{
                      color: "#FBF7F1",
                      textShadowColor: "rgba(0,0,0,0.45)",
                      textShadowRadius: 13,
                      textShadowOffset: { width: 0, height: 1 },
                    }}
                  >
                    {verseLines.map((s, i) => (
                      <Animated.Text
                        key={i}
                        entering={FadeInDown.delay(100 + i * 160).duration(620)}
                      >
                        {i === 0 ? "“" : ""}
                        {s}
                        {i < verseLines.length - 1 ? " " : "”"}
                      </Animated.Text>
                    ))}
                  </Text>
                  <Animated.View
                    entering={FadeIn.delay(verseLines.length * 160 + 160)}
                    className="mt-6 flex-row items-center gap-2.5"
                  >
                    <View style={{ height: 1.5, width: 28, backgroundColor: "#F0C892" }} />
                    <Text
                      className="font-sans-semibold text-[12px] uppercase"
                      style={{ letterSpacing: 2.16, color: "#F0C892" }}
                    >
                      {word.verse_ref} · KJV
                    </Text>
                  </Animated.View>
                </View>
              </SafeAreaView>
            </View>

            {/* CONTENT SHEET — reflection / prompt / prayer rise over the image */}
            <View className="-mt-6 rounded-t-[30px] bg-parchment px-7 pt-6">

            {word.reflection_md ? (
              <Animated.View
                entering={FadeIn.delay(verseLines.length * 180 + 250)}
                className="mt-10"
              >
                {/* TODO(backend): only author_id is stored (no joined name), so
                    the design's "Reflection · {author}" omits the author here. */}
                <Text
                  className="mb-2.5 font-sans-medium text-[11px] uppercase text-ink-mute"
                  style={{ letterSpacing: 1.76 }}
                >
                  Reflection
                </Text>
                <Markdown body={word.reflection_md} />
              </Animated.View>
            ) : null}

            {word.prompt ? (
              <View className="mt-[18px] rounded-r-[10px] border-l-2 border-l-copper bg-paper-raised px-4 py-3.5">
                <Text className="font-display-italic text-[16px] leading-6 text-ink-soft">
                  {word.prompt}
                </Text>
              </View>
            ) : null}

            {/* Prayer guide */}
            {word.prayer_md ? (
              <View className="mt-7 rounded-2xl bg-paper-raised px-[22px] py-5">
                <Text
                  className="mb-2.5 font-sans-medium text-[11px] uppercase text-copper-deep"
                  style={{ letterSpacing: 1.76 }}
                >
                  Pray
                </Text>
                <Markdown body={word.prayer_md} />
              </View>
            ) : null}

            <ContentSignalBar
              kind="word"
              contentId={word.id}
              onShare={onOpenShareImage}
              className="mt-8 border-t border-rule-soft pt-4"
            />
          </View>
          </ScrollView>

          {/* Sticky share footer */}
          <View
            className="flex-row gap-2.5 border-t border-rule-soft bg-parchment px-6 pt-2.5"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <View style={{ flex: 1 }}>
              <PressableScale
                onPress={onNote}
                className="h-[50px] flex-row items-center justify-center gap-2 rounded-full border border-rule"
              >
                <NotebookPen color={colors.ink} size={16} strokeWidth={1.6} />
                <Text className="font-sans-medium text-ink">Note</Text>
              </PressableScale>
            </View>
            <View style={{ flex: 2 }}>
              <PressableScale
                haptic="medium"
                onPress={onShareImage}
                className="h-[50px] flex-row items-center justify-center gap-2 rounded-full bg-copper"
              >
                <ImageDown color={colors.parchment} size={16} strokeWidth={1.8} />
                <Text className="font-sans-semibold text-parchment">
                  Share as image
                </Text>
              </PressableScale>
            </View>
          </View>
        </>
      )}
      <Modal visible={noteOpen} transparent animationType="slide" onRequestClose={() => setNoteOpen(false)}>
        <View className="flex-1 justify-end bg-ink/35">
          <View className="rounded-t-3xl bg-surface1 px-6 pb-10 pt-4">
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-rule" />
            <Text className="font-display text-xl text-ink">Your reflection</Text>
            <TextInput value={noteBody} onChangeText={setNoteBody} multiline autoFocus placeholder="What is God showing you today?" placeholderTextColor={colors.inkMute} textAlignVertical="top" className="mt-5 min-h-32 rounded-2xl border border-rule bg-paper p-4 text-[16px] leading-6 text-ink" />
            <View className="mt-4 flex-row justify-end gap-3">
              <Pressable onPress={() => setNoteOpen(false)} className="rounded-full px-4 py-3"><Text className="font-sans-medium text-ink-soft">Cancel</Text></Pressable>
              <PressableScale haptic="medium" onPress={onSaveNote} className="rounded-full bg-ink px-5 py-3"><Text className="font-sans-semibold text-parchment">{saveWordNote.isPending ? "Saving…" : "Save reflection"}</Text></PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
