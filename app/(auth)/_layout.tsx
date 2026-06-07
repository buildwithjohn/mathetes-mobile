import { Stack } from "expo-router";

export default function AuthedLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
