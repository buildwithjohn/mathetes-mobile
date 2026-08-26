import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import { PressableScale } from "@/components/PressableScale";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  // Optional actions rendered on the right of the top row.
  right?: ReactNode;
};

// Shared premium screen header: a compact warm gradient band (bleeding under
// the status bar) with a glassy back button, title, and optional subtitle.
// Pair it with a `-mt-6 rounded-t-[30px] bg-parchment` content sheet below.
export function ScreenHero({ title, subtitle, onBack, right }: Props) {
  return (
    <View className="overflow-hidden">
      <LinearGradient
        colors={["#2C2027", "#41303C", "#4C3140"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(240,200,146,0.18)", "rgba(240,200,146,0)"]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 0.2, y: 0.8 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView edges={["top"]}>
        <View className="px-5 pb-6 pt-1">
          <View className="h-11 flex-row items-center justify-between">
            {onBack ? (
              <PressableScale
                onPress={onBack}
                accessibilityLabel="Go back"
                className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10"
              >
                <ChevronLeft color="#fff" size={22} />
              </PressableScale>
            ) : (
              <View className="h-10 w-10" />
            )}
            {right ?? <View className="h-10 w-10" />}
          </View>
          <View className="mt-3 px-1">
            <Text
              className="font-display text-[28px] leading-[32px]"
              style={{
                color: "#FFFFFF",
                textShadowColor: "rgba(0,0,0,0.28)",
                textShadowRadius: 12,
                textShadowOffset: { width: 0, height: 1 },
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                className="mt-1 text-[12.5px]"
                style={{ color: "rgba(255,240,225,0.72)" }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
