import { Stack } from "expo-router";
import { AuthGate } from "@/components/AuthGate";

export default function AuthedLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="studio" options={{ presentation: "modal" }} />
      </Stack>
    </AuthGate>
  );
}
