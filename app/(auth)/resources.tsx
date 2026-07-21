import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import {
  ChevronLeft,
  ChevronRight,
  BookText,
  BookOpen,
  Headphones,
  Video,
  Library as LibraryIcon,
} from "lucide-react-native";
import { useLibraryItems } from "@/lib/queries/resources";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import type { LibraryItem, LibraryItemKind } from "@/lib/database.types";

const FILTERS: { key: "all" | LibraryItemKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "manual", label: "Manuals" },
  { key: "audio", label: "Sermons" },
  { key: "video", label: "Videos" },
];

const KIND_ICON = {
  book: BookText,
  manual: BookOpen,
  audio: Headphones,
  video: Video,
} as const;

const KIND_LABEL: Record<LibraryItemKind, string> = {
  book: "Book",
  manual: "Manual",
  audio: "Sermon",
  video: "Video",
};

export function durationLabel(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

export default function Resources() {
  const router = useRouter();
  const { data: items, isLoading } = useLibraryItems();
  const [filter, setFilter] = useState<"all" | LibraryItemKind>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? items ?? []
        : (items ?? []).filter((i) => i.kind === filter),
    [items, filter]
  );

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center gap-1 border-b border-rule-soft px-1 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="flex-1 text-center font-display text-[18px] text-ink">
          Library
        </Text>
        <View className="w-11" />
      </View>

      {/* Filters */}
      <View className="flex-row gap-5 px-6 py-2.5">
        {FILTERS.map((f) => {
          const on = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`pb-1.5 ${on ? "border-b-2 border-b-copper" : ""}`}
            >
              <Text
                className={`text-[13px] ${
                  on ? "font-sans-semibold text-ink" : "font-sans-medium text-ink-mute"
                }`}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LibraryIcon}
          title="Nothing here yet"
          body="Books, devotional manuals, sermons and messages from your parish will appear here."
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-16 pt-2 gap-3"
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((item) => (
            <ResourceCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/resource/${item.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ResourceCard({
  item,
  onPress,
}: {
  item: LibraryItem;
  onPress: () => void;
}) {
  const kind = item.kind as LibraryItemKind;
  const Icon = KIND_ICON[kind] ?? LibraryIcon;
  const dur = durationLabel(item.duration_seconds);
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3.5 rounded-2xl border border-rule bg-paper p-3 active:opacity-90"
    >
      {/* Cover (gradient placeholder when no image) */}
      <View className="overflow-hidden rounded-lg" style={{ width: 64, height: 80 }}>
        <Svg width={64} height={80} style={{ position: "absolute" }}>
          <Defs>
            <LinearGradient id={`lib-${item.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.copper} />
              <Stop offset="1" stopColor={colors.oxblood} />
            </LinearGradient>
          </Defs>
          <Rect width={64} height={80} fill={`url(#lib-${item.id})`} />
        </Svg>
        <View className="flex-1 items-center justify-center">
          <Icon color="#fff" size={22} strokeWidth={1.7} />
        </View>
      </View>
      <View className="flex-1 justify-center">
        <Text
          className="font-sans-medium text-[11px] uppercase text-copper-deep"
          style={{ letterSpacing: 1 }}
        >
          {KIND_LABEL[kind] ?? "Resource"}
          {item.category ? ` · ${item.category}` : ""}
        </Text>
        <Text className="mt-1 font-display text-[18px] leading-[22px] text-ink" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="mt-1 text-[12.5px] text-ink-mute" numberOfLines={1}>
          {item.author ?? "Parish"}
          {dur ? ` · ${dur}` : ""}
        </Text>
      </View>
      <ChevronRight
        color={colors.inkFaint}
        size={18}
        strokeWidth={1.5}
        style={{ alignSelf: "center" }}
      />
    </Pressable>
  );
}
