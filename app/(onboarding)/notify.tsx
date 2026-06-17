import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Bell, Sun } from "lucide-react-native";
import { colors } from "@/theme/colors";

// Notification priming screen with a mock device notification preview. The
// primary action requests the OS permission; PushManager then registers the
// device token once inside the app. Either button continues to the home screen.
export default function Notify() {
  const router = useRouter();
  const finish = () => router.replace("/(auth)/(tabs)/today");
  const enableAndFinish = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Permission flow is best-effort; continue regardless.
    }
    finish();
  };

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
          <View className="mt-10 w-full max-w-sm rounded-2xl border border-rule bg-paper p-4 shadow-sm">
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

        <View className="w-full gap-2.5">
          <Pressable
            onPress={enableAndFinish}
            className="h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90"
          >
            <Text className="font-sans-semibold text-base text-parchment">
              Turn on notifications
            </Text>
          </Pressable>
          <Pressable
            onPress={finish}
            className="h-12 items-center justify-center active:opacity-60"
          >
            <Text className="font-sans-medium text-base text-ink-mute">
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
