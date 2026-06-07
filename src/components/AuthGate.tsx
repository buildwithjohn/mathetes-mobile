import { type ReactNode } from "react";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/stores/auth";

// Wraps authenticated routes. While the session is initializing it shows the
// brand splash; once resolved, an absent session redirects to onboarding.
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment">
        <Text className="text-xs uppercase tracking-[4px] text-copper">
          CCCFSP FUOYE
        </Text>
        <Text className="mt-2 font-display text-5xl text-ink">Mathetes</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <>{children}</>;
}
