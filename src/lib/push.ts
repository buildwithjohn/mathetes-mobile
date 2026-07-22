import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useRouter, type Router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/queries/profile";
import { useCommunityRealtime } from "@/lib/queries/community";
import { useNotificationsRealtime } from "@/lib/queries/notifications";
import type { Notification } from "@/lib/database.types";

// Background notifications are shown by the OS. In the foreground, our live
// Supabase listener schedules the banner below; hiding the remote copy here
// prevents a duplicate banner when push delivery is healthy.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: AppState.currentState !== "active",
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

export type PushRegistration =
  | { state: "registered"; token: string }
  | { state: "simulator" | "expo_go" | "permission_denied" | "missing_project" }
  | { state: "failed"; message: string };

// Request permission and register this device's Expo push token. Exported so
// Settings can give a member an explicit repair button instead of failing
// silently when permission/token registration did not succeed on first launch.
export async function registerPushToken(profileId: string): Promise<PushRegistration> {
  if (!Device.isDevice) return { state: "simulator" };
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return { state: "expo_go" };
  }

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
  if (!granted) return { state: "permission_denied" };

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    undefined;
  if (!projectId) return { state: "missing_project" };

  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (error) {
    return { state: "failed", message: error instanceof Error ? error.message : "Could not get this device's push token." };
  }

  const platform = Platform.OS === "ios" ? "ios" : "android";
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      { user_id: profileId, expo_token: token, platform },
      { onConflict: "expo_token" }
    );
  if (error) return { state: "failed", message: error.message };
  return { state: "registered", token };
}

function toLocalContent(notification: Notification) {
  return {
    title: notification.title,
    body: notification.preview ?? "",
    data: {
      notificationId: notification.id,
      type: notification.type,
      target_id: notification.target_id ?? undefined,
      target_url: notification.target_url ?? undefined,
    },
    sound: "default" as const,
    ...(Platform.OS === "android" ? { channelId: "default" } : {}),
  };
}

// Registers for push (once a profile is known) and wires notification taps to
// navigation. Mounted once inside the authenticated area.
export function usePushNotifications(): void {
  const router = useRouter();
  const { data: profile } = useProfile();
  const handledResponse = useRef<string | null>(null);

  useEffect(() => {
    if (profile?.id) registerPushToken(profile.id).catch(() => {});
  }, [profile?.id]);

  const handleNotificationInsert = useCallback((notification: Notification) => {
    // When the app is already open, a realtime insert is more reliable and
    // immediate than waiting for the remote push round-trip. Background/killed
    // apps remain the job of Expo/FCM remote push.
    if (AppState.currentState === "active") {
      Notifications.scheduleNotificationAsync({
        content: toLocalContent(notification),
        trigger: null,
      }).catch(() => {});
    }
  }, []);

  useCommunityRealtime();
  useNotificationsRealtime(handleNotificationInsert);

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
