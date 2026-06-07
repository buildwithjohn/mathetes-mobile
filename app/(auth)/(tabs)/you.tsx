import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/lib/stores/auth";

// Phase 4/5: profile, streak, library, settings, profile photo.
export default function You() {
  const signOut = useAuth((s) => s.signOut);

  return (
    <View className="flex-1 items-center justify-center bg-parchment px-6">
      <Text className="font-display text-2xl text-ink">You</Text>
      <Text className="mt-2 text-center text-ink/60">
        Profile, streak, and library arrive in Phase 4.
      </Text>
      <Pressable
        onPress={signOut}
        className="mt-8 rounded-full border border-border px-6 py-3"
      >
        <Text className="font-sans-medium text-ink">Sign out</Text>
      </Pressable>
    </View>
  );
}
