import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronRight, Flame, BookOpen } from "lucide-react-native";
import {
  useTodaysWordOfDay,
  useTodaysDevotional,
  todayKey,
} from "@/lib/queries/content";
import { useProfile } from "@/lib/queries/profile";
import { useStreak } from "@/lib/stores/streak";
import { greeting } from "@/utils/text";
import { colors } from "@/theme/colors";

export default function Today() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const word = useTodaysWordOfDay();
  const devotional = useTodaysDevotional();
  const { count: streak } = useStreak();

  const firstName = profile?.name?.trim().split(/\s+/)[0] ?? null;
  const today = todayKey();

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + date + streak chip */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-sm text-ink/60">
              {greeting()}
              {firstName ? `, ${firstName}.` : "."}
            </Text>
            <Text className="mt-1 font-display text-3xl text-ink">Today</Text>
            <Text className="mt-1 text-sm text-ink/50">
              {format(new Date(), "EEEE, d MMMM")}
            </Text>
          </View>
          {/* On-device daily streak; climbs on consecutive days opened. */}
          <View className="mt-1 flex-row items-center gap-1.5 rounded-full bg-surface2 px-3 py-1.5">
            <Flame color={colors.copper} size={16} />
            <Text className="font-sans-semibold text-sm text-ink">{streak}</Text>
          </View>
        </View>

        {/* Word of the Day */}
        <Pressable
          onPress={() => router.push(`/word/${today}`)}
          disabled={!word.data}
          className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface1 active:opacity-90"
        >
          <View className="h-1.5 w-full bg-copper" />
          <View className="p-5">
            <Text className="text-xs uppercase tracking-widest text-copper">
              Word of the Day
            </Text>
            {word.isLoading ? (
              <ActivityIndicator className="mt-4 self-start" color={colors.copper} />
            ) : word.data ? (
              <>
                <Text className="mt-2 font-scripture text-lg leading-7 text-ink">
                  {word.data.verse_text}
                </Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-sans-medium text-sm text-oxblood">
                    {word.data.verse_ref}
                  </Text>
                  <ChevronRight color={colors.copper} size={18} />
                </View>
              </>
            ) : (
              <Text className="mt-2 text-sm text-ink/50">
                No Word posted yet today. Check back soon.
              </Text>
            )}
          </View>
        </Pressable>

        {/* Today's Devotional */}
        <Pressable
          onPress={() =>
            devotional.data && router.push(`/devotional/${devotional.data.id}`)
          }
          disabled={!devotional.data}
          className="mt-4 rounded-2xl border border-border bg-surface1 p-5 active:opacity-90"
        >
          <Text className="text-xs uppercase tracking-widest text-copper">
            Today's Devotional
          </Text>
          {devotional.isLoading ? (
            <ActivityIndicator className="mt-4 self-start" color={colors.copper} />
          ) : devotional.data ? (
            <>
              <Text className="mt-2 font-display text-xl text-ink">
                {devotional.data.title}
              </Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-ink/60">
                  {devotional.data.reading_time_minutes
                    ? `${devotional.data.reading_time_minutes} min read`
                    : "Devotional"}
                </Text>
                <ChevronRight color={colors.copper} size={18} />
              </View>
            </>
          ) : (
            <Text className="mt-2 text-sm text-ink/50">
              No devotional posted yet today.
            </Text>
          )}
        </Pressable>

        {/* Continue reading the Bible */}
        <Pressable
          onPress={() => router.push("/(auth)/(tabs)/bible")}
          className="mt-4 flex-row items-center gap-3 rounded-2xl border border-border bg-surface2 p-5 active:opacity-90"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface1">
            <BookOpen color={colors.copper} size={20} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-semibold text-base text-ink">
              Continue reading
            </Text>
            <Text className="text-sm text-ink/60">Open the Bible</Text>
          </View>
          <ChevronRight color={colors.ink} size={18} />
        </Pressable>

        <Text className="mt-12 text-center font-scripture text-sm italic text-ink/50">
          In all thy ways acknowledge him.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
