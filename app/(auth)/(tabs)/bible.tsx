import { View, Text } from "react-native";

// Phase 3: KJV reader with navigator, search, highlights, bookmarks.
export default function Bible() {
  return (
    <View className="flex-1 items-center justify-center bg-parchment px-6">
      <Text className="font-display text-2xl text-ink">Bible</Text>
      <Text className="mt-2 text-center text-ink/60">
        The KJV reader arrives in Phase 3.
      </Text>
    </View>
  );
}
