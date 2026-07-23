import { Share } from "react-native";

// Uses React Native's built-in share sheet, so it works in both Expo Go and
// installed builds. Image sharing remains available in the dedicated studio.
export async function shareContentText({
  title,
  message,
}: {
  title: string;
  message: string;
}): Promise<boolean> {
  try {
    const result = await Share.share({ title, message });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}
