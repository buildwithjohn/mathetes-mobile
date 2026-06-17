import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Flame } from "lucide-react-native";
import { colors } from "@/theme/colors";

// Entry point of onboarding: brand statement, then routes to sign-up or
// sign-in. The full daily loop and community lie beyond the gate.
export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 px-7 pb-7">
        {/* Wordmark */}
        <View className="flex-row items-center gap-2.5 pt-12">
          <Flame color={colors.copper} size={22} fill={colors.copper} />
          <Text className="font-display text-[20px] text-ink">mathetes</Text>
        </View>

        {/* Centerpiece */}
        <View className="flex-1 justify-center">
          <Animated.Text
            entering={FadeInDown.delay(60).duration(620)}
            className="mb-3.5 font-sans-medium text-[11px] uppercase text-ink-mute"
            style={{ letterSpacing: 1.76 }}
          >
            Follow daily
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(160).duration(680)}
            className="font-display text-[44px] leading-[46px] text-ink"
          >
            A discipleship{" "}
            <Text className="font-display italic text-copper-deep">companion</Text>
            , not a content stream.
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(420).duration(680)}
            className="mt-6 max-w-[320px] text-base leading-6 text-ink-soft"
          >
            For students who want to be formed, not informed. Walk a daily path
            with the cloud of witnesses who came before.
          </Animated.Text>
        </View>

        {/* Actions */}
        <View className="w-full gap-2.5">
          <Pressable
            onPress={() => router.push("/(onboarding)/signup")}
            className="h-[54px] w-full items-center justify-center rounded-full bg-ink active:opacity-90"
          >
            <Text className="font-sans-semibold text-base text-parchment">
              Begin
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(onboarding)/signin")}
            className="h-[54px] w-full items-center justify-center rounded-full border border-rule active:opacity-70"
          >
            <Text className="font-sans-medium text-base text-ink">
              I already have an account
            </Text>
          </Pressable>
          <Text
            className="mt-1.5 text-center text-[11px] uppercase text-ink-mute"
            style={{ letterSpacing: 0.55 }}
          >
            CCCFSP · FUOYE Oye
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
