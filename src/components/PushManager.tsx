import { usePushNotifications } from "@/lib/push";

// Headless: registers for push notifications and routes notification taps.
// Rendered once inside the authenticated layout.
export function PushManager() {
  usePushNotifications();
  return null;
}
