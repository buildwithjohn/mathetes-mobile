import { View, Text, ScrollView } from "react-native";

// Phase 2 wires this to today's Word of the Day + devotional (React Query).
// Phase 0 placeholder establishes the Home tab and brand.
export default function Today() {
  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerClassName="p-6 pt-16">
      <Text className="text-sm text-ink/60">Good morning.</Text>
      <Text className="mt-1 font-display text-3xl text-ink">Today</Text>

      <View className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface1">
        <View className="h-1.5 w-full bg-copper" />
        <View className="p-5">
          <Text className="text-xs uppercase tracking-widest text-copper">
            Word of the Day
          </Text>
          <Text className="mt-2 font-scripture text-lg leading-7 text-ink">
            Trust in the LORD with all thine heart; and lean not unto thine own
            understanding.
          </Text>
          <Text className="mt-3 font-sans-medium text-sm text-oxblood">
            Proverbs 3:5
          </Text>
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-border bg-surface1 p-5">
        <Text className="text-xs uppercase tracking-widest text-copper">
          Today's Devotional
        </Text>
        <Text className="mt-2 font-display text-xl text-ink">
          The First Step Is Surrender
        </Text>
        <Text className="mt-1 text-sm text-ink/60">3 min read</Text>
      </View>

      <Text className="mt-10 text-center text-sm italic text-ink/50">
        In all thy ways acknowledge him.
      </Text>
    </ScrollView>
  );
}
