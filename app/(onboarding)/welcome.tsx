import { View, Text, Pressable } from "react-native";

// Phase 1 will flesh this out (sign-up / sign-in, house picker, notify).
// Phase 0 placeholder establishes the route and brand.
export default function Welcome() {
  return (
    <View className="flex-1 items-center justify-between bg-parchment px-6 py-16">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xs uppercase tracking-[4px] text-copper">
          CCCFSP FUOYE
        </Text>
        <Text className="mt-2 font-display text-6xl text-ink">Mathetes</Text>
        <Text className="mt-3 font-display text-xl text-oxblood">
          Follow daily.
        </Text>
        <Text className="mt-6 max-w-xs text-center text-base text-ink/70">
          A daily Word, devotionals from your pastor, the Bible in your pocket,
          and your house fellowship close by.
        </Text>
      </View>

      <View className="w-full gap-3">
        <Pressable className="w-full rounded-full bg-copper py-4">
          <Text className="text-center font-sans-semibold text-base text-parchment">
            Create account
          </Text>
        </Pressable>
        <Pressable className="w-full rounded-full border border-border py-4">
          <Text className="text-center font-sans-semibold text-base text-ink">
            I already have an account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
