import { useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Flame } from "lucide-react-native";
import { PressableScale } from "@/components/PressableScale";
import { colors } from "@/theme/colors";

// Entry point of onboarding: a cinematic hero (a lamp-lit open Bible, echoing
// the flame mark) that dissolves into an editorial brand statement, then routes
// to sign-up or sign-in. The hero drifts with a slow Ken Burns so a still image
// still feels alive.
export default function Welcome() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const heroHeight = Math.round(height * 0.5);

  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [drift]);
  const kenBurns = useAnimatedStyle(() => ({
    transform: [
      { scale: 1.04 + drift.value * 0.1 },
      { translateY: drift.value * -12 },
    ],
  }));

  return (
    <View className="flex-1 bg-parchment">
      {/* Cinematic hero, bleeding under the status bar, dissolving into parchment */}
      <View style={{ height: heroHeight }} className="overflow-hidden">
        <Animated.View style={[StyleSheet.absoluteFill, kenBurns]}>
          <Image
            source={require("../../assets/images/onboarding/welcome-hero.jpg")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={500}
            cachePolicy="memory-disk"
          />
        </Animated.View>
        <LinearGradient
          colors={[`${colors.parchment}00`, `${colors.parchment}00`, colors.parchment]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      {/* Brand statement + actions */}
      <SafeAreaView edges={["bottom"]} className="flex-1">
        <View className="flex-1 justify-between px-7 pb-4 pt-2">
          <View>
            <View className="flex-row items-center gap-2.5">
              <Flame color={colors.copper} size={22} fill={colors.copper} />
              <Text className="font-display text-[20px] text-ink">mathetes</Text>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(80).duration(600)}
              className="mb-3 mt-7 font-sans-medium text-[11px] uppercase text-ink-mute"
              style={{ letterSpacing: 1.76 }}
            >
              Follow daily
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(160).duration(680)}
              className="font-display text-[40px] leading-[43px] text-ink"
            >
              A discipleship{" "}
              <Text className="font-display-italic text-copper-deep">companion</Text>
              , not a content stream.
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(360).duration(680)}
              className="mt-5 max-w-[330px] text-[15.5px] leading-6 text-ink-soft"
            >
              For students who want to be formed, not informed. Walk a daily path
              with the cloud of witnesses who came before.
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInDown.delay(520).duration(640)} className="gap-2.5">
            <PressableScale
              haptic="medium"
              onPress={() => router.push("/(onboarding)/signup")}
              className="h-[54px] w-full items-center justify-center rounded-full bg-ink"
            >
              <Text className="font-sans-semibold text-base text-parchment">Begin</Text>
            </PressableScale>
            <PressableScale
              haptic="light"
              onPress={() => router.push("/(onboarding)/signin")}
              className="h-[54px] w-full items-center justify-center rounded-full border border-rule"
            >
              <Text className="font-sans-medium text-base text-ink">
                I already have an account
              </Text>
            </PressableScale>
            <Text
              className="mt-1.5 text-center text-[11px] uppercase text-ink-mute"
              style={{ letterSpacing: 0.55 }}
            >
              CCCFSP · FUOYE Oye
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
