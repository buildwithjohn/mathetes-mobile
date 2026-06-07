import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/stores/auth";
import { useProfile, useHouses } from "@/lib/queries/profile";
import { colors } from "@/theme/colors";

// Initials from a display name, used until profile photos land in Phase 5.
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Phase 4/5 flesh out streak, library, settings, and profile photo. Phase 1
// shows the signed-in identity (name + house) and the sign-out action.
export default function You() {
  const signOut = useAuth((s) => s.signOut);
  const { data: profile, isLoading } = useProfile();
  const { data: houses } = useHouses();

  const house = houses?.find((h) => h.id === profile?.house_id) ?? null;

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 px-6 pt-8">
        <Text className="font-display text-3xl text-ink">You</Text>

        <View className="mt-8 items-center">
          {isLoading ? (
            <ActivityIndicator color={colors.copper} />
          ) : (
            <>
              <View
                className="h-24 w-24 items-center justify-center rounded-full border-2 bg-surface2"
                style={{ borderColor: house?.color ?? colors.border }}
              >
                <Text className="font-display text-3xl text-ink">
                  {profile ? initials(profile.name) : "?"}
                </Text>
              </View>
              <Text className="mt-4 font-display text-2xl text-ink">
                {profile?.name ?? "Disciple"}
              </Text>
              {house ? (
                <View className="mt-2 flex-row items-center gap-2 rounded-full bg-surface1 px-3 py-1.5">
                  <View
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: house.color }}
                  />
                  <Text className="text-sm font-sans-medium text-ink/80">
                    {house.name}
                  </Text>
                </View>
              ) : (
                <Text className="mt-2 text-sm text-ink/50">
                  No house chosen yet
                </Text>
              )}
            </>
          )}
        </View>

        <Text className="mt-10 text-center text-sm text-ink/50">
          Profile, streak, and library arrive in Phase 4.
        </Text>
      </View>

      <View className="px-6 pb-10">
        <Pressable
          onPress={signOut}
          className="h-12 items-center justify-center rounded-full border border-border active:opacity-70"
        >
          <Text className="font-sans-medium text-ink">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
