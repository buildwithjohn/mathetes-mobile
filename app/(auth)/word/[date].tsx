import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import { ChevronLeft, NotebookPen, ImageDown } from "lucide-react-native";
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

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="text-sm text-ink/50">{prettyDate}</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || !word ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            We could not find a Word for this day.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-10 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-xs uppercase tracking-[3px] text-copper">
              Word of the Day
            </Text>

            {/* Staggered sentence reveal */}
            <View className="mt-5">
              {sentences(word.verse_text).map((s, i) => (
                <Animated.Text
                  key={i}
                  entering={FadeInDown.delay(i * 180).duration(600)}
                  className="font-scripture text-2xl leading-9 text-ink"
                >
                  {s}{" "}
                </Animated.Text>
              ))}
            </View>

            <Animated.Text
              entering={FadeIn.delay(
                sentences(word.verse_text).length * 180 + 100
              )}
              className="mt-5 font-sans-semibold text-base text-oxblood"
            >
              {word.verse_ref}
            </Animated.Text>

            {word.reflection_md ? (
              <Animated.View
                entering={FadeIn.delay(
                  sentences(word.verse_text).length * 180 + 250
                )}
                className="mt-8 border-t border-border pt-6"
              >
                <Text className="text-xs uppercase tracking-widest text-copper">
                  Reflection
                </Text>
                {paragraphs(word.reflection_md).map((p, i) => (
                  <Text
                    key={i}
                    className="mt-3 text-base leading-7 text-ink/85"
                  >
                    {p}
                  </Text>
                ))}
              </Animated.View>
            ) : null}

            {word.prompt ? (
              <View className="mt-6 rounded-2xl border-l-4 border-l-copper bg-surface1 p-5">
                <Text className="text-xs uppercase tracking-widest text-copper">
                  Consider
                </Text>
                <Text className="mt-2 font-scripture text-lg leading-7 text-ink">
                  {word.prompt}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Sticky share footer */}
          <View className="flex-row gap-3 border-t border-border bg-parchment px-6 pb-8 pt-4">
            <Pressable
              onPress={onNote}
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-border active:opacity-70"
            >
              <NotebookPen color={colors.ink} size={18} />
              <Text className="font-sans-medium text-ink">Note</Text>
            </Pressable>
            <Pressable
              onPress={onShareImage}
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-copper active:opacity-90"
            >
              <ImageDown color={colors.parchment} size={18} />
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
