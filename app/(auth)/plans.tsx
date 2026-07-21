import { View, Text, Pressable, ScrollView, ActivityIndicator, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react-native";
import {
  useReadingPlans,
  useMySubscriptions,
  type SubscriptionWithPlan,
} from "@/lib/queries/readingPlans";
import { Ring } from "@/components/Ring";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import type { ReadingPlan } from "@/lib/database.types";

const DIFFICULTY_LABEL: Record<string, string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  deep: "Deep",
};

export default function Plans() {
  const router = useRouter();
  const { data: plans, isLoading } = useReadingPlans();
  const { data: subs } = useMySubscriptions();

  const active = (subs ?? []).filter(
    (s) => !s.completed_at && s.reading_plans
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
          Reading plans
        </Text>
        <View className="w-11" />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-16 pt-3"
          showsVerticalScrollIndicator={false}
        >
          {active.length > 0 ? (
            <>
              <View className="mt-4 rounded-2xl border border-rule bg-paper-raised px-5 py-5">
                <Text
                  className="font-sans-semibold text-[10px] uppercase text-copper-deep"
                  style={{ letterSpacing: 1.7 }}
                >
                  Your quiet rhythm
                </Text>
                <Text className="mt-1.5 font-display text-[21px] leading-[26px] text-ink">
                  Pick up one small, faithful step today.
                </Text>
                <Text className="mt-2 text-[13px] leading-[19px] text-ink-soft">
                  There is no race here. Your next day is ready when you are.
                </Text>
              </View>
              <SectionEyebrow>Continue</SectionEyebrow>
              <View className="gap-2.5">
                {active.map((s) => (
                  <ContinueCard
                    key={s.id}
                    sub={s}
                    onPress={() => router.push(`/plan/${s.plan_id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {active.length === 0 ? (
            <View className="mt-4 rounded-2xl bg-ink px-5 py-6">
              <Text
                className="font-sans-semibold text-[10px] uppercase text-parchment/65"
                style={{ letterSpacing: 1.7 }}
              >
                Begin where you are
              </Text>
              <Text className="mt-1.5 font-display text-[22px] leading-[27px] text-parchment">
                A few minutes in the Word can reshape a whole day.
              </Text>
              <Text className="mt-2 text-[13px] leading-[19px] text-parchment/70">
                Choose a path below. You can pause anytime and return without losing your place.
              </Text>
            </View>
          ) : null}

          <SectionEyebrow>{active.length > 0 ? "Explore another path" : "Choose a path"}</SectionEyebrow>
          {(plans ?? []).length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No plans yet"
              body="Reading plans from your parish will appear here soon."
            />
          ) : (
            <View className="gap-3">
              {(plans ?? []).map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPress={() => router.push(`/plan/${plan.id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="mb-2.5 mt-6 pl-1 font-sans-medium text-[11px] uppercase text-ink-mute"
      style={{ letterSpacing: 1.6 }}
    >
      {children}
    </Text>
  );
}

function ContinueCard({
  sub,
  onPress,
}: {
  sub: SubscriptionWithPlan;
  onPress: () => void;
}) {
  const plan = sub.reading_plans!;
  const total = plan.length_days || 1;
  const done = Math.max(0, Math.min(sub.current_day - 1, total));
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-2xl border border-rule bg-paper px-5 py-[18px] active:opacity-90"
    >
      <Ring value={done / total} size={38} stroke={2.5}>
        <Text className="font-sans-semibold text-[11px] text-ink">
          {sub.current_day}
        </Text>
      </Ring>
      <View className="flex-1">
        <Text className="font-display text-[17px] text-ink" numberOfLines={1}>
          {plan.title}
        </Text>
        <Text className="mt-0.5 text-[12.5px] text-ink-mute">
          {sub.paused ? "Paused · " : ""}Day {Math.min(sub.current_day, total)} of {total} · one small step
        </Text>
      </View>
      <ChevronRight color={colors.inkMute} size={18} strokeWidth={1.5} />
    </Pressable>
  );
}

function PlanCard({ plan, onPress }: { plan: ReadingPlan; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-rule bg-paper active:opacity-90"
    >
      {/* Covers are pastor-uploaded from the admin plan editor. */}
      <View className="h-28 w-full">
        {plan.cover_image_url ? (
          <ImageBackground
            source={{ uri: plan.cover_image_url }}
            className="absolute inset-0"
            resizeMode="cover"
          />
        ) : (
          <Svg width="100%" height={112} style={{ position: "absolute" }}>
            <Defs>
              <LinearGradient id={`pc-${plan.id}`} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.copper} />
                <Stop offset="1" stopColor={colors.oxblood} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={112} fill={`url(#pc-${plan.id})`} />
          </Svg>
        )}
        <View className="flex-1 justify-end bg-ink/35 p-4">
          <Text className="font-display text-[20px] text-white" numberOfLines={2}>
            {plan.title}
          </Text>
        </View>
      </View>
      <View className="p-4">
        <Text className="text-[13px] leading-[19px] text-ink-soft" numberOfLines={2}>
          {plan.description}
        </Text>
        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-[12px] text-ink-mute">
            {plan.length_days} days
          </Text>
          {plan.difficulty ? (
            <>
              <Text className="text-ink-faint">·</Text>
              <Text className="text-[12px] text-copper-deep">
                {DIFFICULTY_LABEL[plan.difficulty] ?? plan.difficulty}
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
