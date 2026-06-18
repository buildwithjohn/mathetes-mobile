import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Check, MapPin } from "lucide-react-native";
import { useCampuses, useSetMyCampus } from "@/lib/queries/profile";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { colors } from "@/theme/colors";

// First onboarding step: which campus the member attends. If the parish has no
// campuses configured, this step skips straight to houses.
export default function CampusPicker() {
  const router = useRouter();
  const { data: campuses, isLoading } = useCampuses();
  const setMyCampus = useSetMyCampus();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (campuses?.length ?? 0) === 0) {
      router.replace("/(onboarding)/house");
    }
  }, [isLoading, campuses, router]);

  const onContinue = async () => {
    if (!selected) return;
    try {
      // campus_id is set via RPC (direct writes are rejected server-side).
      await setMyCampus.mutateAsync(selected);
      router.replace("/(onboarding)/house");
    } catch {
      // Error surfaced in the banner below.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="px-6 pt-3">
        <OnboardingProgress step={1} total={3} />
        <Text
          className="mt-7 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.76 }}
        >
          Your campus
        </Text>
        <Text className="mt-2 font-display text-[28px] leading-[33px] text-ink">
          Where do you{" "}
          <Text className="font-display-italic text-copper-deep">fellowship</Text>?
        </Text>
        <Text className="mt-1.5 text-sm leading-5 text-ink-mute">
          Pick your campus so your house and community feel close to home.
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : (
        <ScrollView
          className="mt-6 flex-1"
          contentContainerClassName="px-6 pb-4 gap-3"
          showsVerticalScrollIndicator={false}
        >
          {(campuses ?? []).map((campus, i) => {
            const isSelected = selected === campus.id;
            return (
              <Animated.View
                key={campus.id}
                entering={FadeInDown.delay(i * 70).duration(380)}
              >
                <Pressable
                  onPress={() => setSelected(campus.id)}
                  className="flex-row items-center gap-3 rounded-2xl border bg-paper p-5"
                  style={{
                    borderColor: isSelected ? colors.copper : colors.rule,
                  }}
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${colors.copper}1F` }}
                  >
                    <MapPin color={colors.copper} size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-display text-2xl text-ink">
                      {campus.name}
                    </Text>
                    {campus.is_primary ? (
                      <Text
                        className="mt-0.5 font-sans-medium text-[11px] uppercase text-copper-deep"
                        style={{ letterSpacing: 1.6 }}
                      >
                        Main campus
                      </Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-copper">
                      <Check color="#fff" size={14} strokeWidth={2.4} />
                    </View>
                  ) : (
                    <View className="h-6 w-6 rounded-full border-[1.5px] border-rule" />
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      <View className="border-t border-rule-soft bg-parchment px-6 pb-8 pt-4">
        {setMyCampus.isError ? (
          <Text className="mb-3 text-center text-sm text-oxblood">
            {setMyCampus.error instanceof Error
              ? setMyCampus.error.message
              : "Could not save your campus. Please try again."}
          </Text>
        ) : null}
        <Pressable
          onPress={onContinue}
          disabled={!selected || setMyCampus.isPending}
          className="h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90 disabled:opacity-40"
        >
          {setMyCampus.isPending ? (
            <ActivityIndicator color={colors.parchment} />
          ) : (
            <Text className="font-sans-semibold text-base text-parchment">
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
