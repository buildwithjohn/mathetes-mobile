import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Entry point of onboarding: brand statement, then routes to sign-up or
// sign-in. The full daily loop and community lie beyond the gate.
export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 items-center justify-between px-6 pb-8 pt-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xs uppercase tracking-[4px] text-copper">
            CCCFSP FUOYE
          </Text>
          <Text className="mt-2 font-display text-6xl text-ink">Mathetes</Text>
          <Text className="mt-3 font-display text-xl text-oxblood">
            Follow daily.
          </Text>
          <Text className="mt-6 max-w-xs text-center text-base leading-6 text-ink/70">
            A daily Word, devotionals from your pastor, the Bible in your pocket,
            and your house fellowship close by.
          </Text>
        </View>

        <View className="w-full gap-3">
          <Pressable
            onPress={() => router.push("/(onboarding)/signup")}
            className="w-full rounded-full bg-copper py-4 active:opacity-90"
          >
            <Text className="text-center font-sans-semibold text-base text-parchment">
              Create account
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(onboarding)/signin")}
            className="w-full rounded-full border border-border py-4 active:opacity-70"
          >
            <Text className="text-center font-sans-semibold text-base text-ink">
              I already have an account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
