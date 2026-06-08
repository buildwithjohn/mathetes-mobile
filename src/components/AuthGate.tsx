import { type ReactNode } from "react";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";

function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-parchment">
      <Text className="text-xs uppercase tracking-[4px] text-copper">
        CCCFSP FUOYE
      </Text>
      <Text className="mt-2 font-display text-5xl text-ink">Mathetes</Text>
    </View>
  );
}

// Wraps authenticated routes. While the session is initializing it shows the
// brand splash; once resolved, an absent session redirects to onboarding. A
// signed-in member who never finished onboarding (no house yet) is sent back to
// the house step so the app's house-scoped surfaces have what they need.
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (initializing) return <Splash />;
  if (!session) return <Redirect href="/(onboarding)/welcome" />;
  if (isLoading) return <Splash />;
  if (profile && !profile.house_id) {
    return <Redirect href="/(onboarding)/house" />;
  }

  return <>{children}</>;
}
