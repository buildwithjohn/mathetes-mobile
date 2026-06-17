import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import { X, CalendarDays, Bookmark, NotebookPen, ImageDown } from "lucide-react-native";
import { useWordOfDay } from "@/lib/queries/content";
import { sentences, paragraphs } from "@/utils/text";
import { colors } from "@/theme/colors";

export default function WordExpanded() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: word, isLoading, isError } = useWordOfDay(date ?? "");

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
      },
    });
  };
  const onNote = () =>
    Alert.alert(
      "Add a note",
      "Personal notes arrive with your library in a later phase."
    );
  // TODO(backend): no word_of_day bookmark table exists; saving a Word is not
  // yet supported. Surface a gentle placeholder rather than a half-wired save.
  const onSave = () =>
    Alert.alert("Save", "Saving the Word for later is coming soon.");

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
                {paragraphs(word.reflection_md).map((p, i) => (
                  <Text
                    key={i}
                    className="mb-4 font-scripture text-[18px] leading-[30px] text-ink"
                  >
                    {p}
                  </Text>
                ))}
              </Animated.View>
            ) : null}

            {word.prompt ? (
              <View className="mt-[18px] rounded-r-[10px] border-l-2 border-l-copper bg-paper-raised px-4 py-3.5">
                <Text className="font-display-italic text-[16px] leading-6 text-ink-soft">
                  {word.prompt}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Sticky share footer */}
          <View className="flex-row gap-2.5 border-t border-rule-soft bg-parchment px-6 pb-8 pt-2.5">
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
    </SafeAreaView>
  );
}
