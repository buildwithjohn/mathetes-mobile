import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import { useTheme, type ThemeMode } from "@/lib/stores/theme";
import {
  useUserPrivacy,
  useUpdatePrivacy,
  useNotificationPrefs,
  useSetNotificationPref,
  prefEnabled,
  NOTIFICATION_TYPES,
  DM_WHO_OPTIONS,
} from "@/lib/queries/settings";
import { registerPushToken, type PushRegistration } from "@/lib/push";
import { useProfile } from "@/lib/queries/profile";
import { colors } from "@/theme/colors";
import type { DmWho, NotificationChannel } from "@/lib/database.types";

const TRACK = { true: colors.copper, false: "#D9D2C5" };

export default function Settings() {
  const router = useRouter();
  const { data: privacy, isLoading: privacyLoading } = useUserPrivacy();
  const updatePrivacy = useUpdatePrivacy();
  const { data: prefs } = useNotificationPrefs();
  const setPref = useSetNotificationPref();
  const { data: profile } = useProfile();
  const [pushStatus, setPushStatus] = useState<PushRegistration | null>(null);
  const [registeringPush, setRegisteringPush] = useState(false);

  const enablePushOnThisPhone = async () => {
    if (!profile?.id) return;
    setRegisteringPush(true);
    setPushStatus(await registerPushToken(profile.id));
    setRegisteringPush(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center gap-1 border-b border-rule-soft px-1 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="flex-1 text-center font-display text-[18px] text-ink">
          Settings
        </Text>
        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Text
          className="mb-2 mt-4 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.6 }}
        >
          Appearance
        </Text>
        <Appearance />

        {/* Notifications */}
        <Text
          className="mb-1 mt-8 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.6 }}
        >
          Notifications
        </Text>
        <Text className="mb-3 text-xs leading-5 text-ink-mute">
          Messages and updates can reach this phone even when Mathetes is closed.
        </Text>

        <Pressable
          onPress={enablePushOnThisPhone}
          disabled={registeringPush || !profile?.id}
          className="mb-3 flex-row items-center justify-between rounded-2xl border border-rule bg-paper px-4 py-3.5 active:opacity-75 disabled:opacity-50"
        >
          <View className="flex-1 pr-3"><Text className="font-sans-semibold text-[14px] text-ink">Enable notifications on this phone</Text><Text className="mt-0.5 text-[12px] leading-[17px] text-ink-mute">{pushStatus ? pushStatusMessage(pushStatus) : "Registers this installed app for message and devotional alerts."}</Text></View>
          {registeringPush ? <ActivityIndicator color={colors.copper} /> : <Check color={pushStatus?.state === "registered" ? colors.success : colors.copper} size={20} />}
        </Pressable>

        <View className="rounded-2xl border border-rule bg-paper px-4 py-1">
          <View className="flex-row items-center border-b border-rule-soft py-2">
            <Text className="flex-1" />
            <Text className="w-16 text-center text-xs font-sans-medium text-ink-mute">
              Push
            </Text>
            <Text className="w-16 text-center text-xs font-sans-medium text-ink-mute">
              In-app
            </Text>
          </View>
          {NOTIFICATION_TYPES.map(({ type, label }) => (
            <View
              key={type}
              className="flex-row items-center border-b border-rule-soft py-2.5 last:border-0"
            >
              <Text className="flex-1 text-base text-ink">{label}</Text>
              <View className="w-16 items-center">
                <Switch
                  value={prefEnabled(prefs, type, "push")}
                  onValueChange={(v) =>
                    setPref.mutate({ type, channel: "push", enabled: v })
                  }
                  trackColor={TRACK}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View className="w-16 items-center">
                <Switch
                  value={prefEnabled(prefs, type, "in_app" as NotificationChannel)}
                  onValueChange={(v) =>
                    setPref.mutate({ type, channel: "in_app", enabled: v })
                  }
                  trackColor={TRACK}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Privacy */}
        <Text
          className="mb-2 mt-8 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.6 }}
        >
          Privacy &amp; Safety
        </Text>

        {privacyLoading || !privacy ? (
          <ActivityIndicator className="mt-4 self-start" color={colors.copper} />
        ) : (
          <>
            <Text className="mb-2 text-sm font-sans-medium text-ink">
              Who can message you
            </Text>
            <View className="overflow-hidden rounded-2xl border border-rule bg-paper">
              {DM_WHO_OPTIONS.map((opt, i) => {
                const active = privacy.dm_who === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() =>
                      updatePrivacy.mutate({ dm_who: opt.key as DmWho })
                    }
                    className={`flex-row items-center justify-between px-4 py-3.5 active:bg-surface2 ${
                      i > 0 ? "border-t border-rule-soft" : ""
                    }`}
                  >
                    <Text className="text-base text-ink">{opt.label}</Text>
                    {active ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-copper">
                        <Check color="#fff" size={15} strokeWidth={2.4} />
                      </View>
                    ) : (
                      <View className="h-6 w-6 rounded-full border-[1.5px] border-rule" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-3 gap-2">
              <SwitchRow
                label="Require approval for cross-gender DMs"
                value={privacy.cross_gender_dm_approval}
                onChange={(v) =>
                  updatePrivacy.mutate({ cross_gender_dm_approval: v })
                }
              />
              <SwitchRow
                label="Notify me when I am mentioned"
                value={privacy.mentions_notify}
                onChange={(v) => updatePrivacy.mutate({ mentions_notify: v })}
              />
            </View>

            {/* Pastoral oversight note */}
            <View
              className="mt-4 rounded-[14px] p-4"
              style={{ backgroundColor: `${colors.copper}14` }}
            >
              <Text className="text-[12.5px] leading-5 text-ink-soft">
                Your house leader has pastoral visibility into your house chat
                activity and DMs. This is for pastoral care, not surveillance:
                they can see that conversations are happening, and only read
                content when a concern is raised.
              </Text>
            </View>

            <Text className="mt-6 px-4 text-center font-display-italic text-[12.5px] leading-5 text-ink-mute">
              Mathetes keeps conservative defaults. These settings protect you
              while preserving the integrity of community.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function pushStatusMessage(status: PushRegistration) {
  switch (status.state) {
    case "registered": return "This phone is registered for push notifications.";
    case "permission_denied": return "Notifications are blocked in your phone settings. Allow Mathetes notifications, then try again.";
    case "expo_go": return "Install the Mathetes test build from Google Play or EAS—Expo Go cannot receive Android remote push.";
    case "simulator": return "Use a physical phone to receive push notifications.";
    case "missing_project": return "This build is missing its EAS project configuration. Install the latest Mathetes build.";
    case "failed": return status.message;
  }
}

const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

function Appearance() {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);
  return (
    <View className="flex-row rounded-full bg-surface2 p-1">
      {THEME_OPTIONS.map((o) => {
        const activeOpt = mode === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => setMode(o.key)}
            className={`flex-1 items-center rounded-full py-2.5 ${
              activeOpt ? "bg-paper" : ""
            }`}
          >
            <Text
              className={`font-sans-medium text-sm ${
                activeOpt ? "text-ink" : "text-ink-mute"
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-rule bg-paper px-4 py-3">
      <Text className="flex-1 pr-3 text-base text-ink">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={TRACK}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
