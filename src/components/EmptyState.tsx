import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { type LucideIcon } from "lucide-react-native";
import { colors } from "@/theme/colors";

// A gently animated, on-brand empty state: a copper "halo" medallion that
// floats, with a lucide icon at its center, plus a title and supporting line.
// Used across the app's empty lists for a consistent, modern feel.
export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [y]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(450)}
      className="items-center px-10 py-20"
    >
      <Animated.View style={floatStyle}>
        <Svg width={120} height={120}>
          <Circle cx={60} cy={60} r={56} fill={colors.copper} opacity={0.06} />
          <Circle cx={60} cy={60} r={42} fill={colors.copper} opacity={0.1} />
          <Circle cx={60} cy={60} r={28} fill={colors.copper} opacity={0.16} />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Icon color={colors.copper} size={34} />
        </View>
      </Animated.View>
      <Text className="mt-5 text-center font-display text-xl text-ink">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-6 text-ink/60">
        {body}
      </Text>
    </Animated.View>
  );
}
