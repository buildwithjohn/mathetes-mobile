import { View } from "react-native";
import { colors } from "@/theme/colors";

// Slim segmented progress for the onboarding flow (step is 1-based).
export function OnboardingProgress({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className="h-1.5 flex-1 rounded-full"
          style={{ backgroundColor: i < step ? colors.copper : colors.border }}
        />
      ))}
    </View>
  );
}
