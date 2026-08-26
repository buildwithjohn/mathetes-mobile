import type { ReactNode } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { haptic as triggerHaptic, type HapticKind } from "@/utils/haptics";

// A tactile press primitive: springs to a slightly smaller scale on press and
// fires a haptic on tap. This is the shared "expensive feel" layer — prefer it
// over bare Pressable for any primary tap target. Styling goes on `className`
// (NativeWind), which is applied to the animated box so the whole control
// scales as one.
type Props = Omit<PressableProps, "children" | "style"> & {
  className?: string;
  haptic?: HapticKind | "none";
  scaleTo?: number;
  style?: ViewStyle;
  children?: ReactNode;
};

export function PressableScale({
  className,
  haptic = "light",
  scaleTo = 0.96,
  style,
  disabled,
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
      // Announce as a button to screen readers by default; callers can override
      // via accessibilityRole in ...rest. Disabled state is forwarded to
      // accessibilityState by Pressable automatically.
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 260 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic !== "none") triggerHaptic(haptic);
        onPress?.(e);
      }}
      {...rest}
    >
      {/* Transform lives on the animated wrapper; the styled box is a plain
          View so NativeWind's className is never dropped in favour of the
          animated style (which happens when both sit on one element on web).
          Disabled dims the box, since the className `disabled:` variant can't
          see the Pressable's state from here. */}
      <Animated.View style={animatedStyle}>
        <View className={className} style={[style, disabled ? { opacity: 0.5 } : null]}>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}
