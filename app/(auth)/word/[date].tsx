import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, ImageBackground, Modal, TextInput } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import { X, CalendarDays, Bookmark, NotebookPen, ImageDown } from "lucide-react-native";
import { useWordOfDay, useWordNote, useSaveWordNote } from "@/lib/queries/content";
import { sentences } from "@/utils/text";
import { Markdown } from "@/components/Markdown";
import { colors } from "@/theme/colors";

export default function WordExpanded() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: word, isLoading, isError } = useWordOfDay(date ?? "");
  const wordNote = useWordNote(word?.id ?? "");
  const saveWordNote = useSaveWordNote(word?.id ?? "");
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
      },
    });
  };
  const onNote = () => {
    setNoteBody(wordNote.data?.body ?? "");
    setNoteOpen(true);
  };
  // TODO(backend): no word_of_day bookmark table exists; saving a Word is not
  // yet supported. Surface a gentle placeholder rather than a half-wired save.
  const onSave = () =>
    Alert.alert("Save", "Saving the Word for later is coming soon.");

  const insets = useSafeAreaInsets();
  const verseLines = word ? sentences(word.verse_text) : [];

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Top bar: close left, archive + save right */}
      <View className="flex-row items-center justify-between px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Close"
        >
          <X color={colors.ink} size={24} />
        </Pressable>
        <View className="flex-row">
          <Pressable
            onPress={() => router.push("/words")}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel="Word archive"
          >
            <CalendarDays color={colors.inkSoft} size={22} strokeWidth={1.6} />
          </Pressable>
          <Pressable
            onPress={onSave}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel="Save"
          >
            <Bookmark color={colors.inkSoft} size={22} strokeWidth={1.6} />
          </Pressable>
        </View>
      </View>

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
            contentContainerClassName="px-7 pb-8 pt-2"
            showsVerticalScrollIndicator={false}
          >
            {word.cover_image_url ? (
              <ImageBackground
                source={{ uri: word.cover_image_url }}
                resizeMode="cover"
                className="mb-7 overflow-hidden rounded-3xl"
                imageStyle={{ borderRadius: 24 }}
              >
                <View className="min-h-48 justify-end bg-ink/45 p-6">
                  <Text className="font-display text-[28px] leading-9 text-white">
                    {word.verse_ref}
                  </Text>
                </View>
              </ImageBackground>
            ) : null}
            <Text
              className="mb-[18px] font-sans-medium text-[11px] uppercase text-copper-deep"
              style={{ letterSpacing: 1.76 }}
            >
              Word of the day · {prettyDate}
            </Text>

            {/* Staggered sentence reveal, in the display face */}
            <Text className="font-display text-[30px] leading-[37px] text-ink">
              {verseLines.map((s, i) => (
                <Animated.Text
                  key={i}
                  entering={FadeInDown.delay(100 + i * 180).duration(620)}
                >
                  {i === 0 ? "“" : ""}
                  {s}
                  {i < verseLines.length - 1 ? " " : "”"}
                </Animated.Text>
              ))}
            </Text>

            {/* Reference, small caps with a short copper rule */}
            <Animated.View
              entering={FadeIn.delay(verseLines.length * 180 + 160)}
              className="mt-7 flex-row items-center gap-2.5"
            >
              <View className="h-px w-7 bg-copper opacity-70" />
              <Text
                className="font-sans-semibold text-[12px] uppercase text-copper-deep"
                style={{ letterSpacing: 2.16 }}
              >
                {word.verse_ref} · KJV
              </Text>
            </Animated.View>

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
          </ScrollView>

          {/* Sticky share footer */}
          <View
            className="flex-row gap-2.5 border-t border-rule-soft bg-parchment px-6 pt-2.5"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <Pressable
              onPress={onNote}
              className="h-[50px] flex-1 flex-row items-center justify-center gap-2 rounded-full border border-rule active:opacity-70"
            >
              <NotebookPen color={colors.ink} size={16} strokeWidth={1.6} />
              <Text className="font-sans-medium text-ink">Note</Text>
            </Pressable>
            <Pressable
              onPress={onShareImage}
              className="h-[50px] flex-[2] flex-row items-center justify-center gap-2 rounded-full bg-copper active:opacity-90"
            >
              <ImageDown color={colors.parchment} size={16} strokeWidth={1.8} />
              <Text className="font-sans-semibold text-parchment">
                Share as image
              </Text>
            </Pressable>
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
              <Pressable onPress={() => saveWordNote.mutate(noteBody, { onSuccess: () => setNoteOpen(false), onError: () => Alert.alert("Could not save", "Please try again.") })} className="rounded-full bg-ink px-5 py-3"><Text className="font-sans-semibold text-parchment">{saveWordNote.isPending ? "Saving…" : "Save reflection"}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
