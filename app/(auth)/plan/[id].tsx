import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { ChevronLeft, Check, Lock, Play, Pause } from "lucide-react-native";
import {
  useReadingPlan,
  usePlanDays,
  usePlanSubscription,
  usePlanProgress,
  useSubscribeToPlan,
  useTogglePlanPause,
} from "@/lib/queries/readingPlans";
import { colors } from "@/theme/colors";
import type { ReadingPlanDay } from "@/lib/database.types";

const DIFFICULTY_LABEL: Record<string, string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  deep: "Deep",
};

export default function PlanDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id ?? "";

  const { data: plan, isLoading } = useReadingPlan(planId);
  const { data: days } = usePlanDays(planId);
  const { data: sub } = usePlanSubscription(planId);
  const { data: completed } = usePlanProgress(sub?.id ?? null);
  const subscribe = useSubscribeToPlan();
  const togglePause = useTogglePlanPause(planId);

  const openDay = (day: ReadingPlanDay) => {
    router.push({
      pathname: "/plan-day/[id]",
      params: { id: day.id, planId, dayNumber: String(day.day_number) },
    });
  };

  const onBegin = () => {
    subscribe.mutate(planId, {
      onSuccess: () => {
        const first = (days ?? []).find((d) => d.day_number === 1);
        if (first) openDay(first);
      },
      onError: (e) =>
        Alert.alert(
          "Could not start",
          e instanceof Error ? e.message : "Please try again."
        ),
    });
  };

  const onContinue = () => {
    const current = (days ?? []).find(
      (d) => d.day_number === (sub?.current_day ?? 1)
    );
    if (current) openDay(current);
  };

  if (isLoading || !plan) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-parchment">
        <ActivityIndicator color={colors.copper} />
      </SafeAreaView>
    );
  }

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

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <View className="mx-5 h-36 overflow-hidden rounded-2xl">
          {plan.cover_image_url ? (
            <ImageBackground
              source={{ uri: plan.cover_image_url }}
              className="absolute inset-0"
              resizeMode="cover"
            />
          ) : (
            <Svg width="100%" height={144} style={{ position: "absolute" }}>
              <Defs>
                <LinearGradient id="pd-cover" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.copper} />
                  <Stop offset="1" stopColor={colors.oxblood} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={144} fill="url(#pd-cover)" />
            </Svg>
          )}
          <View className="flex-1 justify-end bg-ink/35 p-5">
            <Text className="font-display text-[26px] leading-[30px] text-white">
              {plan.title}
            </Text>
          </View>
        </View>

        <View className="px-6 pt-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-[12.5px] text-ink-mute">
              {plan.length_days} days
            </Text>
            {plan.difficulty ? (
              <>
                <Text className="text-ink-faint">·</Text>
                <Text className="text-[12.5px] text-copper-deep">
                  {DIFFICULTY_LABEL[plan.difficulty] ?? plan.difficulty}
                </Text>
              </>
            ) : null}
          </View>
          <Text className="mt-3 text-[15px] leading-[23px] text-ink-soft">
            {plan.description}
          </Text>

          {sub ? (
            <Pressable
              onPress={() => togglePause.mutate(sub.id)}
              className="mt-4 flex-row items-center gap-2 self-start rounded-full border border-rule px-4 py-2 active:opacity-70"
            >
              {sub.paused ? (
                <Play color={colors.inkSoft} size={14} strokeWidth={1.8} />
              ) : (
                <Pause color={colors.inkSoft} size={14} strokeWidth={1.8} />
              )}
              <Text className="text-[13px] text-ink-soft">
                {sub.paused ? "Resume plan" : "Pause plan"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Days */}
        <Text
          className="mb-1 mt-7 px-6 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.6 }}
        >
          The path
        </Text>
        <View className="px-5">
          {(days ?? []).map((day) => {
            const isDone = completed?.has(day.id) ?? false;
            const isCurrent = sub && day.day_number === sub.current_day;
            const locked =
              !!sub && plan.sequence_locked && day.day_number > sub.current_day;
            return (
              <Pressable
                key={day.id}
                onPress={() =>
                  locked
                    ? Alert.alert(
                        "Keep going",
                        "Finish the earlier days first to unlock this one."
                      )
                    : openDay(day)
                }
                className={`flex-row items-center gap-3.5 border-b border-rule-soft py-3.5 ${
                  locked ? "opacity-50" : "active:opacity-70"
                }`}
              >
                {/* Day marker */}
                <View
                  className="h-8 w-8 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: isDone ? colors.copper : "transparent",
                    borderColor: isDone
                      ? colors.copper
                      : isCurrent
                        ? colors.copper
                        : colors.rule,
                  }}
                >
                  {isDone ? (
                    <Check color="#fff" size={15} strokeWidth={2.4} />
                  ) : locked ? (
                    <Lock color={colors.inkFaint} size={13} strokeWidth={1.7} />
                  ) : (
                    <Text
                      className="font-sans-medium text-[12px]"
                      style={{ color: isCurrent ? colors.copper : colors.inkMute }}
                    >
                      {day.day_number}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-sans-semibold text-[14.5px] text-ink" numberOfLines={1}>
                    {day.title}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-ink-mute" numberOfLines={1}>
                    {day.scripture_reference}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="border-t border-rule-soft bg-parchment px-6 pb-8 pt-3">
        <Pressable
          onPress={sub ? onContinue : onBegin}
          disabled={subscribe.isPending}
          className="h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90 disabled:opacity-50"
        >
          {subscribe.isPending ? (
            <ActivityIndicator color={colors.parchment} />
          ) : (
            <Text className="font-sans-semibold text-base text-parchment">
              {sub
                ? sub.completed_at
                  ? "Revisit plan"
                  : `Continue · Day ${sub.current_day}`
                : "Begin plan"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
