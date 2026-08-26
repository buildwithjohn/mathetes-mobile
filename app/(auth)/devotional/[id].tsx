import { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, Image, ImageBackground, Modal, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSequence,
  withSpring,
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
  useDevotionalNote,
  useSaveDevotionalNote,
  useToggleDevotionalBookmark,
} from "@/lib/queries/content";
import { ContentSignalBar } from "@/components/ContentSignalBar";
import { useRecordContentShare } from "@/lib/queries/contentSignals";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Markdown } from "@/components/Markdown";
import { buildDevotionCards, type DevotionCard } from "@/utils/devotionCards";
import { PressableScale } from "@/components/PressableScale";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";

export default function DevotionalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dev, isLoading, isError } = useDevotional(id ?? "");

  const { data: bookmarkId } = useDevotionalBookmark(id ?? "");
  const bookmarkMutation = useToggleDevotionalBookmark(id ?? "");
  const bookmarked = !!bookmarkId;
  const recordContentShare = useRecordContentShare();
  const devotionalNote = useDevotionalNote(id ?? "");
  const saveDevotionalNote = useSaveDevotionalNote(id ?? "");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");

  const bookmarkScale = useSharedValue(1);
  const bookmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));
  const onToggleBookmark = () => {
    const saving = !bookmarked;
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

  const onShareImages = async (): Promise<boolean> => {
    if (!dev || cards.length === 0 || sharing) return false;
    haptic("light");
    // Image sharing needs the native share module, absent from Expo Go.
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      Alert.alert(
        "Available in the app",
        "Sharing the devotion as images works in the installed Mathetes app, not in Expo Go."
      );
      return false;
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
      if (urls.length === 0) {
        Alert.alert("Could not prepare images", "Please try again in a moment.");
        return false;
      }
      // Lazily load the native share module so the screen still works in Expo
      // Go (RNShare is only in an EAS build).
      const Share = (await import("react-native-share")).default;
      await Share.open({
        urls,
        type: "image/png",
        title: dev.title,
        failOnCancel: false,
      });
      recordContentShare.mutate({ kind: "devotional", contentId: dev.id });
      return true;
    } catch {
      // Cancelling the share sheet is normal. Other failures simply leave the
      // reader on the devotional rather than crashing the screen.
      return false;
    } finally {
      setSharing(false);
    }
  };

  const onWriteReflection = () => {
    setNoteBody(devotionalNote.data?.body ?? "");
    setNoteOpen(true);
  };

  return (
    <View className="flex-1 bg-parchment">
      {/* Slim reading-progress bar, fixed at the very top */}
      <View className="absolute inset-x-0 top-0 z-20 h-[3px] bg-black/10">
        <Animated.View className="h-[3px] bg-copper" style={barStyle} />
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
          contentContainerClassName="pb-16"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* IMMERSIVE HERO — the pastor's cover, or a doorway-into-light
              default, with the title over a warm scrim and glassy actions. */}
          <View style={{ minHeight: 360 }} className="overflow-hidden">
            <Image
              source={
                dev.cover_image_url
                  ? { uri: dev.cover_image_url }
                  : require("../../../assets/images/today/devotion-bg.jpg")
              }
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "rgba(20,13,7,0.44)",
                "rgba(20,13,7,0.10)",
                "rgba(18,11,6,0.64)",
                "rgba(12,7,3,0.96)",
              ]}
              locations={[0, 0.3, 0.66, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <SafeAreaView edges={["top"]}>
              <View className="flex-row items-center justify-between px-3 pt-1">
                <Pressable
                  onPress={() => router.back()}
                  className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25"
                  accessibilityLabel="Go back"
                >
                  <ChevronLeft color="#fff" size={24} />
                </Pressable>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={onShareImages}
                    disabled={sharing}
                    className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25"
                    accessibilityLabel="Share as images"
                  >
                    {sharing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Share2 color="#fff" size={20} strokeWidth={1.7} />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={onToggleBookmark}
                    disabled={bookmarkMutation.isPending}
                    className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25"
                    accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <Animated.View style={bookmarkStyle}>
                      {bookmarked ? (
                        <BookmarkCheck color="#FFC978" size={21} />
                      ) : (
                        <Bookmark color="#fff" size={21} strokeWidth={1.7} />
                      )}
                    </Animated.View>
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 148 }} />

              <View className="px-6 pb-8">
                {dev.day_in_series ? (
                  <Text
                    className="font-sans-semibold text-[11px] uppercase"
                    style={{ letterSpacing: 1.9, color: "#F0C892" }}
                  >
                    Day {dev.day_in_series}
                  </Text>
                ) : null}
                <Text
                  className="mt-2 font-display text-[32px] leading-[37px]"
                  style={{
                    color: "#FFFFFF",
                    textShadowColor: "rgba(0,0,0,0.4)",
                    textShadowRadius: 14,
                    textShadowOffset: { width: 0, height: 1 },
                  }}
                >
                  {dev.title}
                </Text>
                <Text
                  className="mt-2 text-[12.5px]"
                  style={{ color: "rgba(255,240,225,0.78)" }}
                >
                  {dev.reading_time_minutes
                    ? `${dev.reading_time_minutes} min read`
                    : "Devotional"}
                </Text>
              </View>
            </SafeAreaView>
          </View>

          {/* CONTENT SHEET — rises over the hero image edge */}
          <View className="-mt-6 rounded-t-[30px] bg-parchment px-7 pt-5">

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

          <ContentSignalBar
            kind="devotional"
            contentId={dev.id}
            onShare={onShareImages}
            className="mt-8 border-t border-rule-soft pt-4"
          />

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
            <View className="mt-4 self-start">
              <PressableScale
                onPress={onWriteReflection}
                className="flex-row items-center gap-2 rounded-full border border-rule px-4 py-2.5"
              >
                <NotebookPen color={colors.ink} size={14} strokeWidth={1.6} />
                <Text className="text-[13px] text-ink">Write your reflection</Text>
              </PressableScale>
            </View>
          </View>

          {/* Continue the series. TODO(backend): the design shows tomorrow's
              title, which needs a next-in-series query; link to the series
              browser until that lands. */}
          {dev.series_id ? (
            <PressableScale
              onPress={() => router.push("/devotionals")}
              className="mt-10 flex-row items-center gap-3.5 border-t border-rule pt-6"
            >
              <Text className="flex-1 font-display-italic text-sm text-ink-mute">
                More in this series
              </Text>
              <ChevronRight color={colors.inkMute} size={16} strokeWidth={1.5} />
            </PressableScale>
          ) : null}
          </View>
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

      <Modal visible={noteOpen} transparent animationType="slide" onRequestClose={() => setNoteOpen(false)}>
        <View className="flex-1 justify-end bg-ink/35">
          <View className="rounded-t-3xl bg-surface1 px-6 pb-10 pt-4">
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-rule" />
            <Text className="font-display text-xl text-ink">Your reflection</Text>
            <Text className="mt-1 text-sm leading-5 text-ink-soft">
              Keep a private record of what God is teaching you.
            </Text>
            <TextInput
              value={noteBody}
              onChangeText={setNoteBody}
              multiline
              autoFocus
              placeholder="What is God showing you today?"
              placeholderTextColor={colors.inkMute}
              textAlignVertical="top"
              className="mt-5 min-h-32 rounded-2xl border border-rule bg-paper p-4 text-[16px] leading-6 text-ink"
            />
            <View className="mt-4 flex-row justify-end gap-3">
              <Pressable onPress={() => setNoteOpen(false)} className="rounded-full px-4 py-3">
                <Text className="font-sans-medium text-ink-soft">Cancel</Text>
              </Pressable>
              <PressableScale
                haptic="medium"
                onPress={() =>
                  saveDevotionalNote.mutate(noteBody, {
                    onSuccess: () => {
                      setNoteOpen(false);
                    },
                    onError: () => Alert.alert("Could not save", "Please try again."),
                  })
                }
                disabled={saveDevotionalNote.isPending}
                className="rounded-full bg-ink px-5 py-3"
              >
                <Text className="font-sans-semibold text-parchment">
                  {saveDevotionalNote.isPending ? "Saving…" : "Save reflection"}
                </Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
