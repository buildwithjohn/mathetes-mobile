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
import { PressableScale } from "@/components/PressableScale";
import { colors } from "@/theme/colors";
import type { ReadingPlanDay } from "@/lib/database.types";

// Warm gold for the journey path — a "quest trail" feel, distinct from chrome.
const JOURNEY_AMBER = "#E0912F";

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

        {/* The journey — a walkable path of day-nodes */}
        <View className="flex-row items-baseline justify-between px-6 pb-1 pt-8">
          <Text
            className="font-sans-semibold text-[11px] uppercase text-ink-mute"
            style={{ letterSpacing: 1.7 }}
          >
            The journey
          </Text>
          {sub ? (
            <Text className="text-[12px] text-ink-mute">
              {completed?.size ?? 0} of {plan.length_days} days
            </Text>
          ) : null}
        </View>
        <View className="px-6 pt-4">
          {(days ?? []).map((day, i) => {
            const isDone = completed?.has(day.id) ?? false;
            const isCurrent = !!sub && day.day_number === sub.current_day;
            const locked =
              !!sub && plan.sequence_locked && day.day_number > sub.current_day;
            const isLast = i === (days?.length ?? 0) - 1;
            const filled = isDone || isCurrent;
            return (
              <PressableScale
                key={day.id}
                haptic={locked ? "none" : "light"}
                onPress={() =>
                  locked
                    ? Alert.alert(
                        "Keep going",
                        "Finish the earlier days first to unlock this one."
                      )
                    : openDay(day)
                }
              >
                <View className="flex-row gap-4">
                  {/* Path column: node + connecting trail */}
                  <View className="items-center" style={{ width: 44 }}>
                    <View
                      className="items-center justify-center"
                      style={{ width: 44, height: 44 }}
                    >
                      {isCurrent ? (
                        <View
                          className="absolute rounded-full"
                          style={{ width: 44, height: 44, backgroundColor: `${JOURNEY_AMBER}26` }}
                        />
                      ) : null}
                      <View
                        className={`items-center justify-center rounded-full ${
                          filled ? "" : "border-[1.5px] border-rule bg-paper"
                        }`}
                        style={{
                          width: 34,
                          height: 34,
                          backgroundColor: filled ? JOURNEY_AMBER : undefined,
                        }}
                      >
                        {isDone ? (
                          <Check color="#fff" size={16} strokeWidth={2.6} />
                        ) : locked ? (
                          <Lock color="#A39C8E" size={13} strokeWidth={1.8} />
                        ) : (
                          <Text
                            className={`font-sans-semibold text-[13px] ${
                              isCurrent ? "" : "text-ink-mute"
                            }`}
                            style={isCurrent ? { color: "#fff" } : undefined}
                          >
                            {day.day_number}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!isLast ? (
                      <View
                        className={`rounded-full ${isDone ? "" : "bg-rule"}`}
                        style={{
                          width: 2.5,
                          flex: 1,
                          minHeight: 24,
                          backgroundColor: isDone ? JOURNEY_AMBER : undefined,
                        }}
                      />
                    ) : null}
                  </View>

                  {/* Content */}
                  <View
                    className="mb-3 flex-1 rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: isCurrent ? `${JOURNEY_AMBER}12` : "transparent",
                      opacity: locked ? 0.55 : 1,
                    }}
                  >
                    <Text
                      className="font-sans-semibold text-[10px] uppercase"
                      style={{
                        letterSpacing: 1.4,
                        color: isCurrent ? JOURNEY_AMBER : colors.inkMute,
                      }}
                    >
                      Day {day.day_number}
                      {isCurrent ? " · Today" : ""}
                    </Text>
                    <Text
                      className="mt-1 font-display text-[18px] leading-[22px] text-ink"
                      numberOfLines={2}
                    >
                      {day.title}
                    </Text>
                    <Text
                      className="mt-0.5 text-[12.5px] text-ink-mute"
                      numberOfLines={1}
                    >
                      {day.scripture_reference}
                    </Text>
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="border-t border-rule-soft bg-parchment px-6 pb-8 pt-3">
        <PressableScale
          haptic="medium"
          onPress={sub ? onContinue : onBegin}
          disabled={subscribe.isPending}
          className="h-[52px] items-center justify-center rounded-full bg-ink"
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
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}
