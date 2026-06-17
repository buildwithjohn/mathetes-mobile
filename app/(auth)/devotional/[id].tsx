import { Fragment, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  NotebookPen,
} from "lucide-react-native";
import { useDevotional } from "@/lib/queries/content";
import { AudioPlayer } from "@/components/AudioPlayer";
import { paragraphs, sentences } from "@/utils/text";
import { colors } from "@/theme/colors";

export default function DevotionalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dev, isLoading, isError } = useDevotional(id ?? "");

  // The bookmarks table is verse-scoped, so devotional bookmarks have no home
  // in the schema yet; this stays a local affordance until one lands.
  const [bookmarked, setBookmarked] = useState(false);

  // Reading progress thread.
  const progress = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    const max = e.contentSize.height - e.layoutMeasurement.height;
    progress.value = max > 0 ? Math.min(Math.max(e.contentOffset.y / max, 0), 1) : 0;
  });
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const paras = dev ? paragraphs(dev.body_md) : [];
  // Derived pull-quote (no dedicated field in schema): first sentence of an
  // early paragraph, surfaced after the second paragraph as the design does.
  const pullQuote =
    paras.length > 1 ? sentences(paras[1] ?? paras[0])[0] ?? null : null;

  const onWriteReflection = () =>
    Alert.alert(
      "Write your reflection",
      "Personal notes arrive with your library in a later phase."
    );

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Header + progress thread */}
      <View>
        <View className="flex-row items-center justify-between px-3 py-2">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel="Go back"
          >
            <ChevronLeft color={colors.ink} size={26} />
          </Pressable>
          <Pressable
            onPress={() => setBookmarked((b) => !b)}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? (
              <BookmarkCheck color={colors.copper} size={22} />
            ) : (
              <Bookmark color={colors.inkSoft} size={22} strokeWidth={1.6} />
            )}
          </Pressable>
        </View>
        <View className="h-[1.5px] w-full bg-rule-soft">
          <Animated.View className="h-[1.5px] bg-copper" style={barStyle} />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || !dev ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink-mute">
            We could not load this devotional.
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-7 pb-16 pt-2"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* TODO(backend): series_id is stored but not the series name; show
              the day index until a joined series title is available. */}
          {dev.day_in_series ? (
            <Text
              className="font-sans-medium text-[11px] uppercase text-ink-mute"
              style={{ letterSpacing: 1.76 }}
            >
              Day {dev.day_in_series}
            </Text>
          ) : null}
          <Text className="mb-3.5 mt-3 font-display text-[34px] leading-[37px] text-ink">
            {dev.title}
          </Text>
          {/* TODO(backend): author_id only (no joined name); show reading time. */}
          <Text className="text-[12.5px] text-ink-soft">
            {dev.reading_time_minutes
              ? `${dev.reading_time_minutes} min read`
              : "Devotional"}
          </Text>

          {/* Narration, when the pastor has recorded one */}
          {dev.audio_url ? <AudioPlayer url={dev.audio_url} /> : null}

          {/* Anchor passages: scripture block with oxblood left border.
              TODO(backend): only refs are stored, not the verse text the
              design block shows; render the references. */}
          {dev.scripture_refs.length > 0 ? (
            <View className="mt-7 rounded-[14px] border-l-2 border-l-oxblood bg-paper px-5 py-5">
              <Text
                className="mb-2.5 font-sans-semibold text-[11px] uppercase text-oxblood"
                style={{ letterSpacing: 1.98 }}
              >
                Scripture
              </Text>
              <Text className="font-display-italic text-[17px] leading-[26px] text-ink-soft">
                {dev.scripture_refs.join("  ·  ")}
              </Text>
            </View>
          ) : null}

          {/* Body. First paragraph gets a drop cap; the pull quote follows the
              second paragraph (matches the design composition). */}
          <View className="mt-7">
            {paras.map((p, i) => (
              <Fragment key={i}>
                {i === 0 ? (
                  <Text className="mb-4 font-scripture text-[18px] leading-[30px] text-ink">
                    <Text className="font-display text-[52px] leading-[48px] text-copper">
                      {p.charAt(0)}
                    </Text>
                    {p.slice(1)}
                  </Text>
                ) : (
                  <Text className="mb-4 font-scripture text-[18px] leading-[30px] text-ink">
                    {p}
                  </Text>
                )}
                {i === 1 && pullQuote ? (
                  <Text className="my-6 border-l-2 border-l-copper pl-[18px] font-display-italic text-[22px] leading-[29px] text-ink">
                    {pullQuote}
                  </Text>
                ) : null}
              </Fragment>
            ))}
          </View>

          {/* Reflection prompt */}
          <View className="mt-9 rounded-2xl bg-paper-raised px-[22px] py-5">
            <Text
              className="mb-2.5 font-sans-medium text-[11px] uppercase text-copper-deep"
              style={{ letterSpacing: 1.76 }}
            >
              Sit with this
            </Text>
            <Text className="font-display-italic text-[19px] leading-[27px] text-ink">
              {dev.scripture_refs.length > 0
                ? `Sit with ${dev.scripture_refs[0]} today. Where is the Lord asking you to take the first step?`
                : "Where is the Lord asking you to take the first step today?"}
            </Text>
            <Pressable
              onPress={onWriteReflection}
              className="mt-4 flex-row items-center gap-2 self-start rounded-full border border-rule px-4 py-2.5 active:opacity-70"
            >
              <NotebookPen color={colors.ink} size={14} strokeWidth={1.6} />
              <Text className="text-[13px] text-ink">Write your reflection</Text>
            </Pressable>
          </View>

          {/* Continue the series. TODO(backend): the design shows tomorrow's
              title, which needs a next-in-series query; link to the series
              browser until that lands. */}
          {dev.series_id ? (
            <Pressable
              onPress={() => router.push("/devotionals")}
              className="mt-10 flex-row items-center gap-3.5 border-t border-rule pt-6 active:opacity-70"
            >
              <Text className="flex-1 font-display-italic text-sm text-ink-mute">
                More in this series
              </Text>
              <ChevronRight color={colors.inkMute} size={16} strokeWidth={1.5} />
            </Pressable>
          ) : null}
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}
