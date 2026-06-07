import { View, Text } from "react-native";

// Phase 5/6: inbox, house chat, announcements, ask-pastor, DMs, prayer wall.
export default function Community() {
  return (
    <View className="flex-1 items-center justify-center bg-parchment px-6">
      <Text className="font-display text-2xl text-ink">Community</Text>
      <Text className="mt-2 text-center text-ink/60">
        House chats and the prayer wall arrive in Phase 6.
      </Text>
    </View>
  );
}
