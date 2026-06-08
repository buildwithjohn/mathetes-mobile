import { Stack } from "expo-router";
import { AuthGate } from "@/components/AuthGate";
import { PushManager } from "@/components/PushManager";

export default function AuthedLayout() {
  return (
    <AuthGate>
      <PushManager />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="studio" options={{ presentation: "modal" }} />
      </Stack>
    </AuthGate>
  );
}
