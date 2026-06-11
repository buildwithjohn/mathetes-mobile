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
import { Check, MapPin } from "lucide-react-native";
import { useCampuses, useUpdateProfile } from "@/lib/queries/profile";
import { colors } from "@/theme/colors";

// First onboarding step: which campus the member attends. If the parish has no
// campuses configured (table not deployed), this step skips straight to houses.
export default function CampusPicker() {
  const router = useRouter();
  const { data: campuses, isLoading } = useCampuses();
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<string | null>(null);

  // Nothing to choose -> go straight to house selection.
  useEffect(() => {
    if (!isLoading && (campuses?.length ?? 0) === 0) {
      router.replace("/(onboarding)/house");
    }
  }, [isLoading, campuses, router]);

  const onContinue = async () => {
    if (!selected) return;
    try {
      await updateProfile.mutateAsync({ campus_id: selected });
      router.replace("/(onboarding)/house");
    } catch {
      // Error surfaced in the banner below.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="px-6 pt-4">
        <Text className="text-xs uppercase tracking-[3px] text-copper">
          Step 1 of 3
        </Text>
        <Text className="mt-2 font-display text-4xl text-ink">
          Which campus?
        </Text>
        <Text className="mt-2 text-base leading-6 text-ink/70">
          FUOYE has two campuses. Pick where you fellowship so your house and
          community feel close to home.
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
        >
          {(campuses ?? []).map((campus) => {
            const isSelected = selected === campus.id;
            return (
              <Pressable
                key={campus.id}
                onPress={() => setSelected(campus.id)}
                className={`flex-row items-center gap-3 rounded-2xl border bg-surface1 p-5 ${
                  isSelected ? "border-copper" : "border-border"
                }`}
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-copper/15">
                  <MapPin color={colors.copper} size={20} />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-xl text-ink">
                    {campus.name}
                  </Text>
                  {campus.is_primary ? (
                    <Text className="mt-0.5 text-xs font-sans-medium uppercase tracking-widest text-copper">
                      Main campus
                    </Text>
                  ) : null}
                </View>
                {isSelected ? (
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-copper">
                    <Check color={colors.parchment} size={15} />
                  </View>
                ) : null}
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
              : "Could not save your campus. Please try again."}
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
