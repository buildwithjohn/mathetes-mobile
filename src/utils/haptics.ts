import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export type HapticKind =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "selection";

// Single entry point for haptic feedback. No-ops on web (and swallows the
// occasional unsupported-hardware rejection) so call sites stay clean.
export function haptic(kind: HapticKind = "light") {
  if (Platform.OS === "web") return;
  try {
    switch (kind) {
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "selection":
        Haptics.selectionAsync();
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // best-effort
  }
}
