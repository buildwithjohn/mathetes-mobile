import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Flame } from "lucide-react-native";
import { PressableScale } from "@/components/PressableScale";
import { colors } from "@/theme/colors";

// Entry point of onboarding: a living hero (a lamp-lit open Bible, the flame
// echoed in the lamp) plays as a looping video and dissolves into an editorial
// brand statement, then routes to sign-up or sign-in.
export default function Welcome() {
  const router = useRouter();

  const player = useVideoPlayer(
    require("../../assets/videos/welcome.mp4"),
    (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    }
  );

  return (
    <View className="flex-1 bg-parchment">
      {/* Living hero, bleeding under the status bar, dissolving into parchment.
          It flexes to fill whatever space the content leaves, so the brand
          statement + buttons are always fully visible on any screen size. */}
      <View className="flex-1 overflow-hidden">
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[`${colors.parchment}00`, `${colors.parchment}00`, colors.parchment]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      {/* Brand statement + actions — natural height, anchored at the bottom, so
          the hero above absorbs any extra space and this never clips. */}
      <SafeAreaView edges={["bottom"]}>
        <View className="px-7 pb-4 pt-3">
          <View>
            <View className="flex-row items-center gap-2.5">
              <Flame color={colors.copper} size={22} fill={colors.copper} />
              <Text className="font-display text-[20px] text-ink">mathetes</Text>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(80).duration(600)}
              className="mb-2.5 mt-5 font-sans-medium text-[11px] uppercase text-ink-mute"
              style={{ letterSpacing: 1.76 }}
            >
              Follow daily
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(160).duration(680)}
              className="font-display text-[36px] leading-[40px] text-ink"
            >
              A discipleship{" "}
              <Text className="font-display-italic text-copper-deep">companion</Text>
              , not a content stream.
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(360).duration(680)}
              className="mt-4 max-w-[330px] text-[15px] leading-[21px] text-ink-soft"
            >
              For students who want to be formed, not informed. Walk a daily path
              with the cloud of witnesses who came before.
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInDown.delay(520).duration(640)} className="mt-7 gap-2.5">
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
