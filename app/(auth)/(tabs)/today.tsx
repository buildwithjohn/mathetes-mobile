import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronRight, BookOpen, Share2 } from "lucide-react-native";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { Ring } from "@/components/Ring";
import {
  useTodaysWordOfDay,
  useTodaysDevotional,
  todayKey,
} from "@/lib/queries/content";
import { useProfile } from "@/lib/queries/profile";
import { useStreak } from "@/lib/queries/engagement";
import { useReadingPosition, useBibleBooks } from "@/lib/queries/bible";
import { greeting } from "@/utils/text";
import { colors } from "@/theme/colors";

// Plain-text first line of a markdown body, for the devotional preview snippet.
function previewFromMarkdown(md: string | null | undefined, max = 120): string {
  if (!md) return "";
  const text = md
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

// Small uppercase label, tracked out. Mirrors the design's `.eyebrow`.
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      className={`font-sans-medium text-[11px] uppercase text-ink-mute ${className}`}
      style={{ letterSpacing: 1.6 }}
    >
      {children}
    </Text>
  );
}

export default function Today() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const word = useTodaysWordOfDay();
  const devotional = useTodaysDevotional();
  const { count: streak } = useStreak();
  const { data: position } = useReadingPosition();
  const { data: books } = useBibleBooks();

  const firstName = profile?.name?.trim().split(/\s+/)[0] ?? null;

  const positionBook =
    position?.book_id != null
      ? books?.find((b) => b.id === position.book_id) ?? null
      : null;

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(380)} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar: date eyebrow + greeting + streak chip */}
          <View className="flex-row items-start justify-between px-6 pb-3 pt-4">
            <View className="flex-1 pr-3">
              <Eyebrow className="mb-1.5">{format(new Date(), "EEEE, d MMMM")}</Eyebrow>
              <Text className="font-display text-[26px] leading-8 text-ink">
                {greeting()},{" "}
                {firstName ? (
                  <Text className="font-display-italic text-copper-deep">{firstName}</Text>
                ) : (
                  <Text className="font-display-italic text-copper-deep">friend</Text>
                )}
              </Text>
            </View>
            {/* Daily streak from record_check_in() (grace-day aware). */}
            <Pressable
              onPress={() => router.push("/(auth)/(tabs)/you")}
              className="mt-1 flex-row items-center gap-1.5 rounded-full border border-rule px-2.5 py-1.5 active:opacity-70"
              accessibilityLabel={`${streak} day streak`}
            >
              <AnimatedFlame size={15} />
              <Text className="font-sans-medium text-sm text-ink-soft">{streak}</Text>
            </Pressable>
          </View>

          {/* Word of the Day — immersive verse hero (YouVersion-style) */}
          <View className="px-5 pt-4">
            <Pressable
              onPress={() => router.push(`/word/${todayKey()}`)}
              disabled={!word.data}
              className="overflow-hidden rounded-[28px] active:opacity-95"
              style={{ backgroundColor: "#17242E" }}
            >
              <View className="px-6 pb-6 pt-7">
                <Text
                  className="font-sans-medium text-[11px] uppercase"
                  style={{ letterSpacing: 1.8, color: "#7EA8CD" }}
                >
                  Word of the day · {format(new Date(), "EEE, d MMM")}
                </Text>
                {word.isLoading ? (
                  <ActivityIndicator className="mt-6 self-start" color="#7EA8CD" />
                ) : word.data ? (
                  <>
                    <Animated.Text
                      entering={FadeInDown.delay(60).duration(620)}
                      className="mt-5 font-display text-[27px] leading-[36px]"
                      style={{ color: "#F2F4F6" }}
                    >
                      {word.data.verse_text}
                    </Animated.Text>
                    <View
                      className="mt-6"
                      style={{ height: 1, width: 34, backgroundColor: "#7EA8CD" }}
                    />
                    <View className="mt-4 flex-row items-center justify-between">
                      <Text
                        className="font-sans-medium text-[12px] uppercase"
                        style={{ letterSpacing: 1.8, color: "#7EA8CD" }}
                      >
                        {word.data.verse_ref}
                      </Text>
                      <Share2 color="#7EA8CD" size={17} strokeWidth={1.6} />
                    </View>
                  </>
                ) : (
                  <Text className="mt-5 text-sm" style={{ color: "#9FB3C4" }}>
                    No Word posted yet today. Check back soon.
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          {/* Section: today's reflection */}
          <View className="flex-row items-end justify-between gap-3 px-6 pb-3 pt-8">
            <View className="min-w-0">
              <Eyebrow className="mb-1">Devotional</Eyebrow>
              <Text className="font-display text-xl text-ink">Today's reflection</Text>
              {devotional.data ? (
                <Text className="mt-0.5 text-[12.5px] text-ink-mute">
                  {devotional.data.day_in_series
                    ? `Day ${devotional.data.day_in_series}`
                    : "From the parish"}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="px-5">
            <Pressable
              onPress={() =>
                devotional.data && router.push(`/devotional/${devotional.data.id}`)
              }
              disabled={!devotional.data}
              className="rounded-2xl border border-rule bg-paper p-5 active:opacity-90"
            >
              {devotional.isLoading ? (
                <ActivityIndicator className="self-start" color={colors.copper} />
              ) : devotional.data ? (
                <View className="flex-row gap-3.5">
                  {/* Original Mathetes editorial artwork gives the daily content
                      the visual presence of a real published devotional. */}
                  <View
                    className="overflow-hidden rounded-lg"
                    style={{ width: 64, height: 80 }}
                  >
                    <Image
                      source={require("../../../assets/images/devotional-fallback-v1.png")}
                      resizeMode="cover"
                      className="h-full w-full"
                    />
                    <View className="absolute inset-0 bg-ink/10" />
                    {devotional.data.day_in_series ? (
                      <Text
                        className="absolute bottom-1.5 left-1.5 text-[9px] text-white opacity-75"
                        style={{ letterSpacing: 1.35 }}
                      >
                        DAY {devotional.data.day_in_series}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1.5 font-display text-[19px] leading-[23px] text-ink">
                      {devotional.data.title}
                    </Text>
                    {/* TODO(backend): only author_id/series_id are stored (no joined
                        name). Show reading time; surface author/series when the
                        query joins those names. */}
                    <Text className="mb-2.5 text-[12.5px] text-ink-mute">
                      {devotional.data.reading_time_minutes
                        ? `${devotional.data.reading_time_minutes} min read`
                        : "Devotional"}
                    </Text>
                    <Text
                      numberOfLines={2}
                      className="text-[13px] leading-[19px] text-ink-soft"
                    >
                      {previewFromMarkdown(devotional.data.body_md)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-sm text-ink-mute">
                  No devotional posted yet today.
                </Text>
              )}
            </Pressable>
          </View>

          {/* Section: continue reading */}
          <View className="px-6 pb-3 pt-8">
            <Text className="font-display text-xl text-ink">Continue reading</Text>
          </View>
          <View className="px-5">
            <Pressable
              onPress={() => router.push("/(auth)/(tabs)/bible")}
              className="flex-row items-center gap-3.5 rounded-2xl border border-rule bg-paper px-5 py-[18px] active:opacity-90"
            >
              {/* TODO(backend): true progress needs the chapter's verse_count
                  (not loaded here). Show a track ring with the book glyph until
                  a position fraction is available. */}
              <Ring size={36} stroke={2.5}>
                <BookOpen color={colors.inkMute} size={16} strokeWidth={1.6} />
              </Ring>
              <View className="flex-1">
                {positionBook && position?.chapter_number ? (
                  <>
                    <Text className="font-sans-medium text-[15px] text-ink">
                      {positionBook.name} {position.chapter_number} · KJV
                    </Text>
                    <Text className="mt-0.5 text-[12.5px] text-ink-mute">
                      {position.verse_number
                        ? `You stopped at verse ${position.verse_number}.`
                        : "Pick up where you left off."}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="font-sans-medium text-[15px] text-ink">
                      Open the Bible
                    </Text>
                    <Text className="mt-0.5 text-[12.5px] text-ink-mute">
                      Start reading the KJV.
                    </Text>
                  </>
                )}
              </View>
              <ChevronRight color={colors.inkMute} size={18} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* End-of-feed quiet line */}
          <Text className="mt-9 px-9 text-center font-display-italic text-sm leading-[22px] text-ink-mute">
            "In all thy ways acknowledge him."
          </Text>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
