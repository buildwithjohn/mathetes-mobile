import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Flame } from "lucide-react-native";
import { useAuth } from "@/lib/stores/auth";

// Cinematic cold-launch entry: a painterly dawn breaking over the hills plays
// full-screen while the brand rises over it, then dissolves into the app. It
// holds for a minimum beat so it always reads as an intentional moment, not a
// flash, then routes based on auth.
export default function Index() {
  const { session, initializing } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 2600);
    return () => clearTimeout(t);
  }, []);

  const player = useVideoPlayer(
    require("../assets/videos/intro.mp4"),
    (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    }
  );

  if (!initializing && minElapsed) {
    return (
      <Redirect href={session ? "/(auth)/(tabs)/today" : "/(onboarding)/welcome"} />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} className="bg-[#1C1712]">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      {/* Warm cinematic vignette so the wordmark reads over the sunrise */}
      <LinearGradient
        colors={["rgba(28,23,18,0.28)", "rgba(28,23,18,0.08)", "rgba(20,15,11,0.82)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View className="flex-1 items-center justify-end px-8 pb-32">
        <Animated.View
          entering={FadeInDown.delay(350).duration(1000)}
          className="flex-row items-center gap-2.5"
        >
          <Flame color="#FF7A5C" size={28} fill="#FF7A5C" />
          <Text className="font-display text-[42px] leading-[46px] text-white">
            Mathetes
          </Text>
        </Animated.View>
        <Animated.Text
          entering={FadeIn.delay(950).duration(1100)}
          className="mt-3 text-[12px] uppercase text-white/75"
          style={{ letterSpacing: 3.4 }}
        >
          Follow daily
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(1500).duration(1100)}
          className="mt-8 text-[10.5px] uppercase text-white/45"
          style={{ letterSpacing: 2.2 }}
        >
          CCCFSP · FUOYE
        </Animated.Text>
      </View>
    </View>
  );
}
