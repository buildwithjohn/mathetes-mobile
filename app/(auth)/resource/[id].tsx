import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import {
  ChevronLeft,
  BookText,
  BookOpen,
  Headphones,
  Video,
  Play,
  FileText,
} from "lucide-react-native";
import { useLibraryItem } from "@/lib/queries/resources";
import { AudioPlayer } from "@/components/AudioPlayer";
import { colors } from "@/theme/colors";
import type { LibraryItemKind } from "@/lib/database.types";

const KIND_ICON = {
  book: BookText,
  manual: BookOpen,
  audio: Headphones,
  video: Video,
} as const;

const KIND_LABEL: Record<LibraryItemKind, string> = {
  book: "Book",
  manual: "Devotional manual",
  audio: "Audio sermon",
  video: "Video message",
};

export default function ResourceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: item, isLoading, isError } = useLibraryItem(id ?? "");

  const open = (url: string | null) => {
    if (!url) {
      Alert.alert("Not available", "This item has no file to open yet.");
      return;
    }
    WebBrowser.openBrowserAsync(url).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-1 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : isError || !item ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink-mute">
            We could not load this item.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-16"
          showsVerticalScrollIndicator={false}
        >
          {/* Cover */}
          <View className="mx-auto mt-2 h-44 w-32 overflow-hidden rounded-xl">
            <Svg width="100%" height={176} style={{ position: "absolute" }}>
              <Defs>
                <LinearGradient id="rd-cover" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.copper} />
                  <Stop offset="1" stopColor={colors.oxblood} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={176} fill="url(#rd-cover)" />
            </Svg>
            <View className="flex-1 items-center justify-center">
              {(() => {
                const Icon = KIND_ICON[item.kind];
                return <Icon color="#fff" size={40} strokeWidth={1.5} />;
              })()}
            </View>
          </View>

          <Text
            className="mt-5 text-center font-sans-medium text-[11px] uppercase text-copper-deep"
            style={{ letterSpacing: 1.2 }}
          >
            {KIND_LABEL[item.kind]}
            {item.category ? ` · ${item.category}` : ""}
          </Text>
          <Text className="mt-1.5 text-center font-display text-[26px] leading-[31px] text-ink">
            {item.title}
          </Text>
          <Text className="mt-1.5 text-center text-[13px] text-ink-mute">
            {item.author ?? "Parish"}
          </Text>

          {/* Player / open action */}
          <View className="mt-6">
            {item.kind === "audio" && item.file_url ? (
              <AudioPlayer url={item.file_url} />
            ) : item.kind === "video" ? (
              <Pressable
                onPress={() => open(item.external_url ?? item.file_url)}
                className="h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-copper active:opacity-90"
              >
                <Play color="#fff" size={18} fill="#fff" />
                <Text className="font-sans-semibold text-base text-white">
                  Watch video
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => open(item.file_url ?? item.external_url)}
                className="h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-copper active:opacity-90"
              >
                <FileText color="#fff" size={18} strokeWidth={1.8} />
                <Text className="font-sans-semibold text-base text-white">
                  {item.kind === "manual" ? "Open manual" : "Read"}
                </Text>
              </Pressable>
            )}
          </View>

          {item.description ? (
            <Text className="mt-7 font-scripture text-[16px] leading-[26px] text-ink">
              {item.description}
            </Text>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
