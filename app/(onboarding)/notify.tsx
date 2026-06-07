import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Sun } from "lucide-react-native";
import { colors } from "@/theme/colors";

// Notification priming screen with a mock device notification preview. Actual
// Expo push registration and permission prompts land in Phase 8; here we only
// set expectations and let the user continue to the home screen either way.
export default function Notify() {
  const router = useRouter();
  const finish = () => router.replace("/(auth)/(tabs)/today");

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 items-center justify-between px-6 pb-8 pt-4">
        <View className="w-full flex-1 items-center justify-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-copper/15">
            <Bell color={colors.copper} size={30} />
          </View>

          <Text className="mt-6 text-center font-display text-3xl text-ink">
            A gentle nudge each morning
          </Text>
          <Text className="mt-3 max-w-xs text-center text-base leading-6 text-ink/70">
            Get the Word of the Day at 6:30 AM, plus replies from your house and
            your discipler. No pressure, no noise.
          </Text>

          {/* Mock device notification preview */}
          <View className="mt-10 w-full max-w-sm rounded-2xl border border-border bg-surface1 p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-copper">
                <Sun color={colors.parchment} size={20} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-semibold text-sm text-ink">
                    Mathetes
                  </Text>
                  <Text className="text-xs text-ink/40">now</Text>
                </View>
                <Text className="text-sm font-sans-medium text-ink">
                  Today's Word is ready
                </Text>
              </View>
            </View>
            <Text className="mt-2 font-scripture text-sm leading-6 text-ink/75">
              Trust in the LORD with all thine heart. Proverbs 3:5
            </Text>
          </View>
        </View>

        <View className="w-full gap-3">
          <Pressable
            onPress={finish}
            className="h-14 items-center justify-center rounded-full bg-copper active:opacity-90"
          >
            <Text className="font-sans-semibold text-base text-parchment">
              Turn on notifications
            </Text>
          </Pressable>
          <Pressable
            onPress={finish}
            className="h-12 items-center justify-center active:opacity-60"
          >
            <Text className="font-sans-medium text-base text-ink/60">
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
