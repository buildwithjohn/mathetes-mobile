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

// Wraps authenticated routes. Order: while the session initializes, show the
// splash; no session -> onboarding welcome. Then enforce membership gating:
// a non-active member (pending/rejected/suspended) only ever sees the pending
// screen. An active member who hasn't finished onboarding is routed to the
// right next step (campus -> house). Role/status/campus are server-controlled;
// the app only reads them.
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (initializing) return <Splash />;
  if (!session) return <Redirect href="/(onboarding)/welcome" />;
  if (isLoading || !profile) return <Splash />;

  // Membership gating: only active members reach the app.
  if (profile.status !== "active") {
    return <Redirect href="/(onboarding)/pending" />;
  }
  // Active but onboarding incomplete: campus first (school-email signups come
  // back active with no campus since both campuses share the domain), then house.
  if (!profile.campus_id) {
    return <Redirect href="/(onboarding)/campus" />;
  }
  if (!profile.house_id) {
    return <Redirect href="/(onboarding)/house" />;
  }

  return <>{children}</>;
}
