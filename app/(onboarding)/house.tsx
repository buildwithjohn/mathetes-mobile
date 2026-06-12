import { useState } from "react";
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
import { Check } from "lucide-react-native";
import { useHouses, useProfile, useUpdateProfile } from "@/lib/queries/profile";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { colors } from "@/theme/colors";

// Short meaning shown beneath each house. Keyed by base slug (Ikole houses use
// a "-ikole" suffix).
const HOUSE_MEANING: Record<string, string> = {
  bethel: "House of God",
  antioch: "Where disciples were first called Christians",
  berea: "Noble searchers of the Word",
  bethany: "Home of resurrection hope",
  zion: "The mountain that cannot be moved",
  hebron: "Brethren dwelling together in unity",
  salem: "King of peace",
};

export default function HousePicker() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: houses, isLoading, isError, refetch } = useHouses(
    profile?.campus_id
  );
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selected) return;
    try {
      await updateProfile.mutateAsync({ house_id: selected });
      router.replace("/(onboarding)/profile");
    } catch {
      // Error surfaced in the banner below.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="px-6 pt-3">
        <OnboardingProgress step={2} total={3} />
        <Text className="mt-7 font-display text-4xl leading-tight text-ink">
          Choose your house
        </Text>
        <Text className="mt-2 text-base leading-6 text-ink/60">
          Your house is your closest circle: its chat, its prayer wall, its
          leaders.
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            We could not load the houses.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-full border border-border px-6 py-3"
          >
            <Text className="font-sans-medium text-ink">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="mt-6 flex-1"
          contentContainerClassName="px-6 pb-6 gap-3"
          showsVerticalScrollIndicator={false}
        >
          {(houses ?? []).map((house, i) => {
            const isSelected = selected === house.id;
            const meaning =
              HOUSE_MEANING[house.slug.split("-")[0]] ?? house.verse_ref ?? "";
            const initial = house.name.charAt(0).toUpperCase();
            return (
              <Animated.View
                key={house.id}
                entering={FadeInDown.delay(i * 55).duration(360)}
              >
                <Pressable
                  onPress={() => setSelected(house.id)}
                  className={`flex-row items-center gap-3 rounded-3xl border-2 bg-surface1 p-4 ${
                    isSelected ? "border-copper" : "border-border"
                  }`}
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${house.color}22` }}
                  >
                    <Text
                      className="font-display text-xl"
                      style={{ color: house.color }}
                    >
                      {initial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-display text-xl text-ink">
                      {house.name}
                    </Text>
                    <Text
                      className="mt-0.5 text-sm font-sans-medium text-copper"
                      numberOfLines={1}
                    >
                      {meaning}
                    </Text>
                  </View>
                  {isSelected ? (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-copper">
                      <Check color={colors.parchment} size={16} />
                    </View>
                  ) : (
                    <View className="h-7 w-7 rounded-full border-2 border-border" />
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      <View className="border-t border-border bg-parchment px-6 pb-8 pt-4">
        {updateProfile.isError ? (
          <Text className="mb-3 text-center text-sm text-oxblood">
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : "Could not save your house. Please try again."}
          </Text>
        ) : null}
        <Pressable
          onPress={onContinue}
          disabled={!selected || updateProfile.isPending}
          className="h-14 items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-40"
        >
          {updateProfile.isPending ? (
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
