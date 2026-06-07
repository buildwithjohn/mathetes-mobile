import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/stores/auth";

// Splash + router decision. Shows the wordmark while auth initializes, then
// routes to the app (if signed in) or onboarding.
export default function Index() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment">
        <Text className="text-xs uppercase tracking-[4px] text-copper">
          CCCFSP FUOYE
        </Text>
        <Text className="mt-2 font-display text-6xl text-ink">Mathetes</Text>
        <Text className="mt-3 font-display text-xl text-oxblood">
          Follow daily.
        </Text>
      </View>
    );
  }

  return (
    <Redirect href={session ? "/(auth)/(tabs)/today" : "/(onboarding)/welcome"} />
  );
}
