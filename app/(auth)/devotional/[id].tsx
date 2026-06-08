import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ChevronLeft, Bookmark, BookmarkCheck } from "lucide-react-native";
import { useDevotional } from "@/lib/queries/content";
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
  const lead = paras[0] ?? "";
  const pullQuote =
    paras.length > 1 ? sentences(paras[paras.length - 1])[0] ?? null : null;

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Header + progress thread */}
      <View>
        <View className="flex-row items-center justify-between px-4 py-2">
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
              <Bookmark color={colors.ink} size={22} />
            )}
          </Pressable>
        </View>
        <View className="h-1 w-full bg-surface2">
          <Animated.View className="h-1 bg-copper" style={barStyle} />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || !dev ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            We could not load this devotional.
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-16 pt-6"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {dev.day_in_series ? (
            <Text className="text-xs uppercase tracking-[3px] text-copper">
              Day {dev.day_in_series}
            </Text>
          ) : null}
          <Text className="mt-2 font-display text-3xl leading-10 text-ink">
            {dev.title}
          </Text>
          <Text className="mt-2 text-sm text-ink/50">
            {dev.reading_time_minutes
              ? `${dev.reading_time_minutes} min read`
              : "Devotional"}
          </Text>

          {/* Anchor passages: scripture block with oxblood left border */}
          {dev.scripture_refs.length > 0 ? (
            <View className="mt-6 rounded-r-xl border-l-4 border-l-oxblood bg-surface1 px-4 py-3">
              <Text className="text-xs uppercase tracking-widest text-oxblood">
                Scripture
              </Text>
              <Text className="mt-1 font-scripture text-base text-ink">
                {dev.scripture_refs.join("  ·  ")}
              </Text>
            </View>
          ) : null}

          {/* Lead paragraph with drop cap */}
          {lead ? (
            <Text className="mt-6 font-scripture text-lg leading-8 text-ink">
              <Text className="font-display text-5xl leading-[48px] text-copper">
                {lead.charAt(0)}
              </Text>
              {lead.slice(1)}
            </Text>
          ) : null}

          {/* Pull quote with copper left border */}
          {pullQuote ? (
            <View className="my-7 border-l-4 border-l-copper pl-4">
              <Text className="font-display text-xl leading-8 text-ink/90">
                {pullQuote}
              </Text>
            </View>
          ) : null}

          {/* Remaining paragraphs */}
          {paras.slice(1).map((p, i) => (
            <Text
              key={i}
              className="mt-5 font-scripture text-lg leading-8 text-ink"
            >
              {p}
            </Text>
          ))}

          {/* Reflection prompt card */}
          <View className="mt-10 rounded-2xl bg-surface2 p-5">
            <Text className="text-xs uppercase tracking-widest text-copper">
              Carry this with you
            </Text>
            <Text className="mt-2 text-base leading-7 text-ink/85">
              {dev.scripture_refs.length > 0
                ? `Sit with ${dev.scripture_refs[0]} today. Where is the Lord asking you to take the first step?`
                : "Where is the Lord asking you to take the first step today?"}
            </Text>
          </View>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}
