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
import { Check } from "lucide-react-native";
import { useHouses, useUpdateProfile } from "@/lib/queries/profile";
import { colors } from "@/theme/colors";

// Short meaning shown beneath each house verse. Keyed by house slug.
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
  const { data: houses, isLoading, isError, refetch } = useHouses();
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selected) return;
    try {
      await updateProfile.mutateAsync({ house_id: selected });
      router.replace("/(onboarding)/notify");
    } catch {
      // Surface a gentle retry; mutation error is also exposed below.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="px-6 pt-4">
        <Text className="text-xs uppercase tracking-[3px] text-copper">
          Step 2 of 3
        </Text>
        <Text className="mt-2 font-display text-4xl text-ink">
          Choose your house
        </Text>
        <Text className="mt-2 text-base leading-6 text-ink/70">
          Seven house fellowships make up CCCFSP. Your house is your closest
          circle: its chat, its prayer wall, its leaders.
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
          contentContainerClassName="px-6 pb-4 gap-3"
        >
          {(houses ?? []).map((house) => {
            const isSelected = selected === house.id;
            return (
              <Pressable
                key={house.id}
                onPress={() => setSelected(house.id)}
                className={`flex-row overflow-hidden rounded-2xl border bg-surface1 ${
                  isSelected ? "border-copper" : "border-border"
                }`}
              >
                <View
                  className="w-1.5"
                  style={{ backgroundColor: house.color }}
                />
                <View className="flex-1 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-display text-xl text-ink">
                      {house.name}
                    </Text>
                    {isSelected ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-copper">
                        <Check color={colors.parchment} size={15} />
                      </View>
                    ) : null}
                  </View>
                  <Text className="mt-0.5 text-sm font-sans-medium text-copper">
                    {HOUSE_MEANING[house.slug] ?? house.verse_ref ?? ""}
                  </Text>
                  {house.verse ? (
                    <Text
                      className="mt-2 font-scripture text-sm leading-6 text-ink/75"
                      numberOfLines={3}
                    >
                      {house.verse}
                    </Text>
                  ) : null}
                  {house.verse_ref ? (
                    <Text className="mt-1.5 text-xs text-oxblood">
                      {house.verse_ref}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
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
