import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  useDevotionalSeries,
  useSeriesDevotionals,
} from "@/lib/queries/content";
import { colors } from "@/theme/colors";

export default function SeriesDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const seriesId = id ?? "";

  const { data: allSeries } = useDevotionalSeries();
  const series = (allSeries ?? []).find((s) => s.id === seriesId) ?? null;
  const { data: days, isLoading } = useSeriesDevotionals(seriesId);

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="font-display text-xl text-ink" numberOfLines={1}>
          {series?.title ?? "Series"}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-16 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {series?.description ? (
            <Text className="mb-2 text-base leading-7 text-ink/75">
              {series.description}
            </Text>
          ) : null}
          {series?.total_days ? (
            <Text className="mb-4 text-xs uppercase tracking-widest text-copper">
              {series.total_days} days
            </Text>
          ) : null}

          {(days ?? []).length === 0 ? (
            <Text className="mt-6 text-sm text-ink/50">
              No days from this series have been published yet.
            </Text>
          ) : (
            <View className="gap-2">
              {(days ?? []).map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => router.push(`/devotional/${d.id}`)}
                  className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface1 p-4 active:opacity-90"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-copper/15">
                    <Text className="font-display text-lg text-copper">
                      {d.day_in_series ?? "·"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-sans-semibold text-base text-ink"
                      numberOfLines={1}
                    >
                      {d.title}
                    </Text>
                    {d.reading_time_minutes ? (
                      <Text className="text-sm text-ink/55">
                        {d.reading_time_minutes} min read
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight color={colors.ink} size={18} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
