import { View, Text, Pressable, ScrollView, ActivityIndicator, ImageBackground, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from "react-native-svg";
import { LinearGradient as Gradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight, BookOpen, Flame } from "lucide-react-native";
import {
  useReadingPlans,
  useMySubscriptions,
  type SubscriptionWithPlan,
} from "@/lib/queries/readingPlans";
import { Ring } from "@/components/Ring";
import { EmptyState } from "@/components/EmptyState";
import { PressableScale } from "@/components/PressableScale";
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
  const day = Math.min(sub.current_day, total);
  const pct = Math.round((done / total) * 100);
  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      className="overflow-hidden rounded-[24px]"
    >
      {/* Game-like progress hero: a vivid gradient, a big amber progress ring
          with the day number, and a Continue pill. */}
      <Gradient
        colors={["#2E1F47", "#42305F", "#4B2C53"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Gradient
        colors={["rgba(255,197,120,0.20)", "rgba(255,197,120,0)"]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 0.2, y: 0.85 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View className="p-5">
        <View className="flex-row items-center gap-4">
          <Ring
            value={done / total}
            size={72}
            stroke={5}
            color="#FFC978"
            trackColor="rgba(255,255,255,0.16)"
          >
            <View className="items-center">
              <Text className="font-display text-[23px] leading-6 text-white">
                {sub.current_day}
              </Text>
              <Text
                className="text-[8px] uppercase text-white/55"
                style={{ letterSpacing: 1 }}
              >
                day
              </Text>
            </View>
          </Ring>
          <View className="flex-1">
            <Text
              className="font-sans-semibold text-[10px] uppercase"
              style={{ letterSpacing: 1.6, color: "#FFC978" }}
            >
              {sub.paused ? "Paused · pick back up" : "Continue your journey"}
            </Text>
            <Text
              className="mt-1 font-display text-[21px] leading-[25px] text-white"
              numberOfLines={2}
            >
              {plan.title}
            </Text>
            <Text className="mt-1 text-[12.5px] text-white/70">
              Day {day} of {total} · {pct}% complete
            </Text>
          </View>
        </View>
        <View className="mt-4 flex-row items-center justify-between rounded-full bg-white/10 px-4 py-2.5">
          <Text className="font-sans-semibold text-[13px] text-white">
            Continue Day {day}
          </Text>
          <ChevronRight color="#fff" size={17} strokeWidth={2} />
        </View>
      </View>
    </PressableScale>
  );
}

function PlanCard({ plan, onPress }: { plan: ReadingPlan; onPress: () => void }) {
  const cover = planCover(plan.slug);
  return (
    <PressableScale
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-rule bg-paper"
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
          <PlanCover planId={plan.id} colors={cover.colors} />
        )}
        <View className="flex-1 justify-end bg-ink/35 p-4">
          <Text
            className="mb-1 font-sans-semibold text-[10px] uppercase text-white/75"
            style={{ letterSpacing: 1.45 }}
          >
            {cover.label}
          </Text>
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
    </PressableScale>
  );
}

function planCover(slug: string) {
  switch (slug) {
    case "story-of-the-old-testament":
      return { label: "Bible overview · Old Testament", colors: ["#17242E", "#3D647A"] };
    case "jesus-and-the-new-testament":
      return { label: "Bible overview · New Testament", colors: ["#2A3645", "#577E72"] };
    case "wisdom-for-campus-life":
      return { label: "Topical · Campus life", colors: ["#403A62", "#786B9E"] };
    case "a-life-of-prayer":
      return { label: "Topical · Prayer", colors: ["#4A2F3A", "#A56371"] };
    default:
      return { label: "Reading plan", colors: ["#17242E", "#526D82"] };
  }
}

function PlanCover({ planId, colors: coverColors }: { planId: string; colors: string[] }) {
  return (
    <Svg width="100%" height={112} style={{ position: "absolute" }}>
      <Defs>
        <LinearGradient id={`pc-${planId}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={coverColors[0]} />
          <Stop offset="1" stopColor={coverColors[1]} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height={112} fill={`url(#pc-${planId})`} />
      <Circle cx="88%" cy="22" r="48" fill="rgba(255,255,255,0.10)" />
      <Circle cx="80%" cy="104" r="62" fill="rgba(255,255,255,0.07)" />
      <Circle cx="16%" cy="-12" r="30" fill="rgba(255,255,255,0.06)" />
    </Svg>
  );
}
