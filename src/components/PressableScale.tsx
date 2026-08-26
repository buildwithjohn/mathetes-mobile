import type { ReactNode } from "react";
import {
  Pressable,
  Platform,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type HapticKind = "light" | "medium" | "heavy" | "none";

// A tactile press primitive: springs to a slightly smaller scale on press and
// fires a haptic on tap. This is the shared "expensive feel" layer — prefer it
// over bare Pressable for any primary tap target. Styling goes on `className`
// (NativeWind), which is applied to the animated box so the whole control
// scales as one.
type Props = Omit<PressableProps, "children" | "style"> & {
  className?: string;
  haptic?: HapticKind;
  scaleTo?: number;
  style?: ViewStyle;
  children?: ReactNode;
};

function fireHaptic(kind: HapticKind) {
  if (kind === "none" || Platform.OS === "web") return;
  const style =
    kind === "medium"
      ? Haptics.ImpactFeedbackStyle.Medium
      : kind === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light;
  Haptics.impactAsync(style).catch(() => {});
}

export function PressableScale({
  className,
  haptic = "light",
  scaleTo = 0.96,
  style,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 260 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        fireHaptic(haptic);
        onPress?.(e);
      }}
      {...rest}
    >
      {/* Transform lives on the animated wrapper; the styled box is a plain
          View so NativeWind's className is never dropped in favour of the
          animated style (which happens when both sit on one element on web). */}
      <Animated.View style={animatedStyle}>
        <View className={className} style={style}>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}
