import { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";
import Constants, { ExecutionEnvironment } from "expo-constants";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  NotebookPen,
  Share2,
} from "lucide-react-native";
import {
  useDevotional,
  useDevotionalBookmark,
  useToggleDevotionalBookmark,
} from "@/lib/queries/content";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Markdown } from "@/components/Markdown";
import { buildDevotionCards, type DevotionCard } from "@/utils/devotionCards";
import { colors } from "@/theme/colors";

export default function DevotionalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dev, isLoading, isError } = useDevotional(id ?? "");

  const { data: bookmarkId } = useDevotionalBookmark(id ?? "");
  const bookmarkMutation = useToggleDevotionalBookmark(id ?? "");
  const bookmarked = !!bookmarkId;

  const onToggleBookmark = () => {
    bookmarkMutation.mutate(undefined, {
      onError: () => Alert.alert("Could not save", "Please try again."),
    });
  };

  // Reading progress thread.
  const progress = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    const max = e.contentSize.height - e.layoutMeasurement.height;
    progress.value = max > 0 ? Math.min(Math.max(e.contentOffset.y / max, 0), 1) : 0;
  });
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Share the devotional as a small set of branded images (one per section /
  // page), captured off-screen and sent together to WhatsApp etc.
  const [sharing, setSharing] = useState(false);
  const cardRefs = useRef<(View | null)[]>([]);
  const cards = useMemo(
    () => buildDevotionCards(dev?.body_md ?? ""),
    [dev?.body_md]
  );

  const onShareImages = async () => {
    if (!dev || cards.length === 0 || sharing) return;
    // Image sharing needs the native share module, absent from Expo Go.
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      Alert.alert(
        "Available in the app",
        "Sharing the devotion as images works in the installed Mathetes app, not in Expo Go."
      );
      return;
    }
    setSharing(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < cards.length; i++) {
        const node = cardRefs.current[i];
        if (!node) continue;
        const uri = await captureRef(node, { format: "png", quality: 1 });
        urls.push(uri.startsWith("file://") ? uri : `file://${uri}`);
      }
      if (urls.length === 0) return;
      // Lazily load the native share module so the screen still works in Expo
      // Go (RNShare is only in an EAS build).
      const Share = (await import("react-native-share")).default;
      await Share.open({
        urls,
        type: "image/png",
        title: dev.title,
        failOnCancel: false,
      });
    } catch {
      // Expo Go (no native module), user cancelled, or share unavailable: no-op.
    } finally {
      setSharing(false);
    }
  };

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
          <View className="flex-row">
            <Pressable
              onPress={onShareImages}
              disabled={sharing}
              className="h-11 w-11 items-center justify-center"
              accessibilityLabel="Share as images"
            >
              {sharing ? (
                <ActivityIndicator color={colors.copper} />
              ) : (
                <Share2 color={colors.inkSoft} size={21} strokeWidth={1.6} />
              )}
            </Pressable>
            <Pressable
              onPress={onToggleBookmark}
              disabled={bookmarkMutation.isPending}
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
          {dev.cover_image_url ? (
            <ImageBackground
              source={{ uri: dev.cover_image_url }}
              resizeMode="cover"
              className="mb-7 overflow-hidden rounded-3xl"
              imageStyle={{ borderRadius: 24 }}
            >
              <View className="min-h-56 justify-end bg-ink/40 p-6">
                {dev.day_in_series ? (
                  <Text className="font-sans-semibold text-[11px] uppercase text-white" style={{ letterSpacing: 1.8 }}>
                    Day {dev.day_in_series}
                  </Text>
                ) : null}
                <Text className="mt-2 font-display text-[30px] leading-9 text-white">
                  {dev.title}
                </Text>
              </View>
            </ImageBackground>
          ) : null}
          {/* TODO(backend): series_id is stored but not the series name; show
              the day index until a joined series title is available. */}
          {dev.day_in_series && !dev.cover_image_url ? (
            <Text
              className="font-sans-medium text-[11px] uppercase text-ink-mute"
              style={{ letterSpacing: 1.76 }}
            >
              Day {dev.day_in_series}
            </Text>
          ) : null}
          {!dev.cover_image_url ? (
            <Text className="mb-3.5 mt-3 font-display text-[34px] leading-[37px] text-ink">
              {dev.title}
            </Text>
          ) : null}
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

          {/* Body — rendered from markdown (bold/headings/lists/quotes). */}
          <View className="mt-7">
            <Markdown body={dev.body_md} />
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

      {/* Off-screen cards, captured to images on demand for sharing */}
      {dev && cards.length > 0 ? (
        <View
          style={{ position: "absolute", left: -10000, top: 0 }}
          pointerEvents="none"
        >
          {cards.map((c, i) => (
            <View
              key={i}
              collapsable={false}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
            >
              <ShareCard
                card={c}
                title={i === 0 ? dev.title : undefined}
                verseRef={i === 0 ? dev.scripture_refs[0] : undefined}
              />
            </View>
          ))}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function ShareCard({
  card,
  title,
  verseRef,
}: {
  card: DevotionCard;
  title?: string;
  verseRef?: string;
}) {
  return (
    <View className="bg-parchment" style={{ width: 384 }}>
      <View className="px-10 py-12">
        <Text
          className="font-sans-medium text-[11px] uppercase text-copper-deep"
          style={{ letterSpacing: 1.8 }}
        >
          Devotional · {card.index}/{card.total}
        </Text>
        {title ? (
          <Text className="mt-4 font-display text-[29px] leading-9 text-ink">
            {title}
          </Text>
        ) : null}
        {verseRef ? (
          <Text
            className="mt-2 font-sans-medium text-[11px] uppercase text-oxblood"
            style={{ letterSpacing: 1.6 }}
          >
            {verseRef}
          </Text>
        ) : null}
        {card.heading ? (
          <Text className="mb-1 mt-6 font-display text-[22px] text-copper-deep">
            {card.heading}
          </Text>
        ) : null}
        {card.paragraphs.map((p, i) => (
          <Text
            key={i}
            className="mt-3.5 font-scripture text-[17px] leading-[27px] text-ink"
          >
            {p}
          </Text>
        ))}
        <View className="mt-10 flex-row items-center justify-between border-t border-rule pt-4">
          <Text className="font-display text-[17px] text-ink">Mathetes</Text>
          <Text
            className="text-[10px] uppercase text-ink-mute"
            style={{ letterSpacing: 1.5 }}
          >
            CCCFSP FUOYE
          </Text>
        </View>
      </View>
    </View>
  );
}
