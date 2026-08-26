import { View, Text, ScrollView, ActivityIndicator, Image, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronRight, BookOpen } from "lucide-react-native";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { ContentSignalBar } from "@/components/ContentSignalBar";
import { PressableScale } from "@/components/PressableScale";
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

  const shareWord = async () => {
    if (!word.data) return false;
    router.push({
      pathname: "/studio",
      params: {
        text: word.data.verse_text,
        reference: word.data.verse_ref,
        label: "Word of the Day",
        backgroundUrl: word.data.cover_image_url ?? undefined,
        signalKind: "word",
        signalContentId: word.data.id,
      },
    });
    // Studio records the signal only after it has rendered the actual image
    // and the system share sheet has opened.
    return false;
  };

  const shareDevotional = async () => {
    if (!devotional.data) return false;
    router.push({
      pathname: "/studio",
      params: {
        text: previewFromMarkdown(devotional.data.body_md, 260),
        reference: devotional.data.scripture_refs[0] ?? devotional.data.title,
        label: devotional.data.title,
        backgroundUrl: devotional.data.cover_image_url ?? undefined,
        signalKind: "devotional",
        signalContentId: devotional.data.id,
      },
    });
    return false;
  };

  const { height } = useWindowDimensions();
  const heroMin = Math.round(height * 0.6);
  const reveal = Math.round(height * 0.2);

  return (
    <View className="flex-1 bg-parchment">
      <Animated.View entering={FadeIn.duration(380)} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
        >
          {/* IMMERSIVE HERO — the greeting and Word of the Day live over a
              full-bleed atmospheric image, bleeding under the status bar. */}
          <View style={{ minHeight: heroMin }} className="overflow-hidden">
            <Image
              source={
                word.data?.cover_image_url
                  ? { uri: word.data.cover_image_url }
                  : require("../../../assets/images/today/wotd-bg.jpg")
              }
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "rgba(24,15,8,0.44)",
                "rgba(24,15,8,0.10)",
                "rgba(22,13,7,0.60)",
                "rgba(15,9,4,0.96)",
              ]}
              locations={[0, 0.28, 0.62, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <SafeAreaView edges={["top"]}>
              <View className="px-6 pb-9 pt-2">
                {/* Top row: date + streak (glassy) */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className="font-sans-semibold text-[11px] uppercase"
                    style={{ letterSpacing: 1.7, color: "rgba(255,240,225,0.82)" }}
                  >
                    {format(new Date(), "EEEE, d MMMM")}
                  </Text>
                  <PressableScale
                    onPress={() => router.push("/(auth)/(tabs)/you")}
                    className="flex-row items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5"
                    accessibilityLabel={`${streak} day streak`}
                  >
                    <AnimatedFlame size={15} />
                    <Text
                      className="font-sans-semibold text-sm"
                      style={{ color: "#FFFFFF" }}
                    >
                      {streak}
                    </Text>
                  </PressableScale>
                </View>

                {/* Breathing room so the image sings before the words */}
                <View style={{ height: reveal }} />

                <Animated.Text
                  entering={FadeInDown.delay(80).duration(640)}
                  className="font-display text-[32px] leading-[38px]"
                  style={{
                    color: "#FFFFFF",
                    textShadowColor: "rgba(0,0,0,0.40)",
                    textShadowRadius: 14,
                    textShadowOffset: { width: 0, height: 1 },
                  }}
                >
                  {greeting()},{" "}
                  <Text className="font-display-italic" style={{ color: "#F5C98A" }}>
                    {firstName ?? "friend"}
                  </Text>
                </Animated.Text>

                <PressableScale
                  haptic="light"
                  scaleTo={0.99}
                  onPress={() => router.push(`/word/${todayKey()}`)}
                  disabled={!word.data}
                  className="mt-7"
                >
                  <Text
                    className="font-sans-semibold text-[11px] uppercase"
                    style={{ letterSpacing: 1.9, color: "#F0C892" }}
                  >
                    Word of the day
                  </Text>
                  {word.isLoading ? (
                    <ActivityIndicator className="mt-4 self-start" color="#F0C892" />
                  ) : word.data ? (
                    <>
                      <Animated.Text
                        entering={FadeInDown.delay(180).duration(700)}
                        className="mt-3 font-display text-[23px] leading-[32px]"
                        style={{
                          color: "#FBF7F1",
                          textShadowColor: "rgba(0,0,0,0.45)",
                          textShadowRadius: 12,
                          textShadowOffset: { width: 0, height: 1 },
                        }}
                      >
                        {word.data.verse_text}
                      </Animated.Text>
                      <View className="mt-4 flex-row items-center gap-2.5">
                        <View
                          style={{ height: 1.5, width: 26, backgroundColor: "#F0C892" }}
                        />
                        <Text
                          className="font-sans-semibold text-[12px] uppercase"
                          style={{ letterSpacing: 1.9, color: "#F0C892" }}
                        >
                          {word.data.verse_ref}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text className="mt-3 text-sm" style={{ color: "#E8D9C6" }}>
                      No Word posted yet today. Check back soon.
                    </Text>
                  )}
                </PressableScale>

                {word.data ? (
                  <View className="mt-4">
                    <ContentSignalBar
                      kind="word"
                      contentId={word.data.id}
                      onShare={shareWord}
                      dark
                    />
                  </View>
                ) : null}
              </View>
            </SafeAreaView>
          </View>

          {/* CONTENT SHEET — rises over the image edge for depth */}
          <View className="-mt-6 rounded-t-[30px] bg-parchment pt-7">
          {/* Section: today's reflection */}
          <View className="flex-row items-end justify-between gap-3 px-6 pb-3">
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
            <View className="overflow-hidden rounded-2xl border border-rule bg-paper">
              <PressableScale
                haptic="light"
                scaleTo={0.99}
                onPress={() =>
                  devotional.data && router.push(`/devotional/${devotional.data.id}`)
                }
                disabled={!devotional.data}
                className="p-5"
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
                      source={
                        devotional.data.cover_image_url
                          ? { uri: devotional.data.cover_image_url }
                          : require("../../../assets/images/devotional-fallback-v1.png")
                      }
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
              </PressableScale>
              {devotional.data ? (
                <View className="border-t border-rule-soft px-3 py-1">
                  <ContentSignalBar
                    kind="devotional"
                    contentId={devotional.data.id}
                    onShare={shareDevotional}
                  />
                </View>
              ) : null}
            </View>
          </View>

          {/* Section: continue reading */}
          <View className="px-6 pb-3 pt-8">
            <Text className="font-display text-xl text-ink">Continue reading</Text>
          </View>
          <View className="px-5">
            <PressableScale
              haptic="light"
              scaleTo={0.99}
              onPress={() => router.push("/(auth)/(tabs)/bible")}
              className="flex-row items-center gap-3.5 rounded-2xl border border-rule bg-paper px-5 py-[18px]"
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
            </PressableScale>
          </View>

          {/* End-of-feed quiet line */}
          <Text className="mt-9 px-9 text-center font-display-italic text-sm leading-[22px] text-ink-mute">
            "In all thy ways acknowledge him."
          </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
