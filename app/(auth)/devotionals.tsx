import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Layers, BookOpen } from "lucide-react-native";
import {
  useDevotionalSeries,
  useDevotionalArchive,
} from "@/lib/queries/content";
import { colors } from "@/theme/colors";
import type { Devotional, DevotionalSeries } from "@/lib/database.types";

export default function Devotionals() {
  const router = useRouter();
  const series = useDevotionalSeries();
  const archive = useDevotionalArchive();

  const loading = series.isLoading || archive.isLoading;

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
        <Text className="font-display text-xl text-ink">Devotionals</Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-16 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {(series.data ?? []).length > 0 ? (
            <>
              <Text className="mb-2 mt-3 text-xs uppercase tracking-widest text-copper">
                Series
              </Text>
              <View className="gap-3">
                {(series.data ?? []).map((s) => (
                  <SeriesCard
                    key={s.id}
                    series={s}
                    onPress={() => router.push(`/series/${s.id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <Text className="mb-2 mt-7 text-xs uppercase tracking-widest text-copper">
            Recent
          </Text>
          {(archive.data ?? []).length === 0 ? (
            <Text className="mt-4 text-sm text-ink/50">
              Published devotionals will gather here.
            </Text>
          ) : (
            <View className="gap-2">
              {(archive.data ?? []).map((d) => (
                <DevotionalRow
                  key={d.id}
                  devotional={d}
                  onPress={() => router.push(`/devotional/${d.id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SeriesCard({
  series,
  onPress,
}: {
  series: DevotionalSeries;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-border bg-surface1 active:opacity-90"
    >
      <View className="h-1.5 w-full bg-copper" />
      <View className="p-4">
        <View className="flex-row items-center gap-2">
          <Layers color={colors.copper} size={16} />
          {series.total_days ? (
            <Text className="text-xs font-sans-medium uppercase tracking-widest text-copper">
              {series.total_days} days
            </Text>
          ) : null}
        </View>
        <Text className="mt-2 font-display text-xl text-ink">
          {series.title}
        </Text>
        {series.description ? (
          <Text className="mt-1 text-sm leading-6 text-ink/65" numberOfLines={2}>
            {series.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function DevotionalRow({
  devotional,
  onPress,
}: {
  devotional: Devotional;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface1 p-4 active:opacity-90"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface2">
        <BookOpen color={colors.copper} size={18} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-base text-ink" numberOfLines={1}>
          {devotional.title}
        </Text>
        <Text className="text-sm text-ink/55">
          {devotional.publish_date
            ? format(parseISO(devotional.publish_date), "d MMM yyyy")
            : "Devotional"}
          {devotional.reading_time_minutes
            ? ` · ${devotional.reading_time_minutes} min`
            : ""}
        </Text>
      </View>
      <ChevronRight color={colors.ink} size={18} />
    </Pressable>
  );
}
