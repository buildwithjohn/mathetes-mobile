import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Flame } from "lucide-react-native";
import { colors } from "@/theme/colors";

// The streak flame, with a soft flicker (scale pulse). Used on the Today chip
// and the You tab streak card.
export function AnimatedFlame({
  size = 20,
  color = colors.copper,
}: {
  size?: number;
  color?: string;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.16, { duration: 720, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 720, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Flame color={color} size={size} />
    </Animated.View>
  );
}
