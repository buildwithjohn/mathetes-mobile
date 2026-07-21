import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useRouter, type Router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/queries/profile";

// Show a banner while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type PushData = {
  target_url?: string;
  target_id?: string;
  type?: string;
};

// Send a notification tap to the surface it refers to. Mirrors the in-app
// notifications screen's routing, keyed on the target_url the backend sets.
function route(router: Router, data: PushData) {
  const url = data.target_url ?? "";
  if (url.includes("/chat/") && data.target_id) {
    router.push(`/chat/${data.target_id}`);
  } else if (url.includes("/announcements/") || data.type === "announcement") {
    router.push("/announcements");
  } else if (url.includes("/ask-pastor/") || data.type === "ask_answered") {
    router.push("/ask-pastor");
  } else if (data.type === "prayer") {
    router.push("/prayer");
  } else if (url.includes("/word/")) {
    const date = url.split("/word/")[1]?.split(/[?#]/)[0];
    if (date) router.push(`/word/${date}`);
  } else if (url.includes("/devotional/") && data.target_id) {
    router.push(`/devotional/${data.target_id}`);
  } else if (
    data.target_id &&
    (data.type === "message" || data.type === "daily_prompt" || data.type === "mention")
  ) {
    router.push(`/chat/${data.target_id}`);
  }
}

// Request permission and register this device's Expo push token. Remote push is
// unavailable in Expo Go and without an EAS project id, so token retrieval is
// best-effort: failures are swallowed and the rest of the app is unaffected.
async function registerToken(profileId: string): Promise<void> {
  if (!Device.isDevice) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Messages and updates",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && existing.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return;

  const projectId =
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    undefined;
  if (!projectId) return; // needs a dev build with an EAS project

  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return;
  }

  const platform = Platform.OS === "ios" ? "ios" : "android";
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      { user_id: profileId, expo_token: token, platform },
      { onConflict: "expo_token" }
    );
  if (error) throw error;
}

// Registers for push (once a profile is known) and wires notification taps to
// navigation. Mounted once inside the authenticated area.
export function usePushNotifications(): void {
  const router = useRouter();
  const { data: profile } = useProfile();
  const handledResponse = useRef<string | null>(null);

  useEffect(() => {
    if (profile?.id) registerToken(profile.id).catch(() => {});
  }, [profile?.id]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handledResponse.current === id) return;
      handledResponse.current = id;
      route(router, (response.notification.request.content.data ?? {}) as PushData);
    }).catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handledResponse.current = response.notification.request.identifier;
        route(
          router,
          (response.notification.request.content.data ?? {}) as PushData
        );
      }
    );
    return () => sub.remove();
  }, [router]);
}
