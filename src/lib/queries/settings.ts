import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type {
  DmWho,
  NotificationChannel,
  NotificationPreference,
  UserPrivacy,
} from "@/lib/database.types";

export const settingsKeys = {
  privacy: ["settings", "privacy"] as const,
  notificationPrefs: ["settings", "notification_prefs"] as const,
};

// ---------------------------------------------------------------------------
// Privacy (user_privacy: one row per member, seeded at sign-up).
// ---------------------------------------------------------------------------

export function useUserPrivacy() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: settingsKeys.privacy,
    enabled: !!authId,
    queryFn: async (): Promise<UserPrivacy | null> => {
      const { data, error } = await supabase
        .from("user_privacy")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

type PrivacyPatch = Partial<
  Pick<UserPrivacy, "dm_who" | "cross_gender_dm_approval" | "mentions_notify">
>;

export function useUpdatePrivacy() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (patch: PrivacyPatch): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      // The row exists (sign-up trigger), but upsert is a safe no-surprise path.
      const { error } = await supabase
        .from("user_privacy")
        .upsert({ user_id: profile.id, ...patch }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.privacy });
      const prev = queryClient.getQueryData<UserPrivacy | null>(
        settingsKeys.privacy
      );
      if (prev) {
        queryClient.setQueryData<UserPrivacy>(settingsKeys.privacy, {
          ...prev,
          ...patch,
        });
      }
      return { prev };
    },
    onError: (_e, _patch, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(settingsKeys.privacy, ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.privacy });
    },
  });
}

export const DM_WHO_OPTIONS: { key: DmWho; label: string; hint: string }[] = [
  { key: "all_parish", label: "Anyone in the parish", hint: "" },
  { key: "house", label: "My house only", hint: "" },
  { key: "discipler", label: "Only my discipler", hint: "" },
  { key: "none", label: "No one", hint: "" },
];

// ---------------------------------------------------------------------------
// Notification preferences (absence of a row means enabled).
// ---------------------------------------------------------------------------

export function useNotificationPrefs() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: settingsKeys.notificationPrefs,
    enabled: !!authId,
    queryFn: async (): Promise<NotificationPreference[]> => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// A pref is on unless a row explicitly disables it.
export function prefEnabled(
  prefs: NotificationPreference[] | undefined,
  type: string,
  channel: NotificationChannel
): boolean {
  const row = (prefs ?? []).find(
    (p) => p.type === type && p.channel === channel
  );
  return row ? row.enabled : true;
}

export function useSetNotificationPref() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      type: string;
      channel: NotificationChannel;
      enabled: boolean;
    }): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      const { error } = await supabase.from("notification_preferences").upsert(
        {
          user_id: profile.id,
          type: args.type,
          channel: args.channel,
          enabled: args.enabled,
        },
        { onConflict: "user_id,type,channel" }
      );
      if (error) throw error;
    },
    onMutate: async (args) => {
      await queryClient.cancelQueries({
        queryKey: settingsKeys.notificationPrefs,
      });
      const prev = queryClient.getQueryData<NotificationPreference[]>(
        settingsKeys.notificationPrefs
      );
      queryClient.setQueryData<NotificationPreference[]>(
        settingsKeys.notificationPrefs,
        (old) => {
          const rest = (old ?? []).filter(
            (p) => !(p.type === args.type && p.channel === args.channel)
          );
          return [
            ...rest,
            {
              user_id: profile?.id ?? "",
              type: args.type,
              channel: args.channel,
              enabled: args.enabled,
            },
          ];
        }
      );
      return { prev };
    },
    onError: (_e, _args, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(settingsKeys.notificationPrefs, ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.notificationPrefs,
      });
    },
  });
}

// The notification types surfaced in settings, with friendly labels.
export const NOTIFICATION_TYPES: { type: string; label: string }[] = [
  { type: "message", label: "Messages" },
  { type: "mention", label: "Mentions" },
  { type: "announcement", label: "Announcements" },
  { type: "prayer", label: "Prayer wall" },
  { type: "ask_answered", label: "Ask Pastor replies" },
  { type: "daily_prompt", label: "Daily Word" },
];
