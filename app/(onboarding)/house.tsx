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
  const selectedHouse = (houses ?? []).find((h) => h.id === selected) ?? null;

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
        <Text
          className="mt-7 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.76 }}
        >
          Your house
        </Text>
        <Text className="mt-2 font-display text-[28px] leading-[33px] text-ink">
          Choose your{" "}
          <Text className="font-display-italic text-copper-deep">house</Text>{" "}
          fellowship.
        </Text>
        <Text className="mt-1.5 text-sm leading-5 text-ink-mute">
          This is the group you will grow with.
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
            return (
              <Animated.View
                key={house.id}
                entering={FadeInDown.delay(i * 55).duration(360)}
              >
                <Pressable
                  onPress={() => setSelected(house.id)}
                  className="relative overflow-hidden rounded-2xl border bg-paper py-4 pl-[22px] pr-4"
                  style={{
                    borderColor: isSelected ? house.color : colors.rule,
                  }}
                >
                  {/* House accent stripe */}
                  <View
                    className="absolute bottom-0 left-0 top-0 w-1"
                    style={{ backgroundColor: house.color }}
                  />
                  <View className="flex-row items-baseline justify-between gap-2.5">
                    <Text className="font-display text-[23px] leading-[25px] text-ink">
                      {house.name}
                    </Text>
                    {isSelected ? (
                      <View
                        className="h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: house.color }}
                      >
                        <Check color="#fff" size={13} strokeWidth={2.4} />
                      </View>
                    ) : (
                      <View className="h-5 w-5 rounded-full border-[1.5px] border-rule" />
                    )}
                  </View>
                  <Text className="mt-0.5 text-xs text-ink-mute" numberOfLines={1}>
                    {meaning}
                  </Text>
                  {house.verse ? (
                    <Text className="mt-2.5 font-display-italic text-[14.5px] leading-5 text-ink-soft">
                      “{house.verse}”
                    </Text>
                  ) : null}
                  {house.verse_ref ? (
                    <Text
                      className="mt-1.5 font-sans-semibold text-[10.5px] uppercase"
                      style={{ color: house.color, letterSpacing: 1.47 }}
                    >
                      {house.verse_ref}
                    </Text>
                  ) : null}
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      <View className="border-t border-rule-soft bg-parchment px-6 pb-8 pt-4">
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
          className="h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90 disabled:opacity-40"
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color={colors.parchment} />
          ) : (
            <Text className="font-sans-semibold text-base text-parchment">
              {selectedHouse ? `Join ${selectedHouse.name}` : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
