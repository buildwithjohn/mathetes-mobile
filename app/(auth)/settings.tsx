import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import {
  useUserPrivacy,
  useUpdatePrivacy,
  useNotificationPrefs,
  useSetNotificationPref,
  prefEnabled,
  NOTIFICATION_TYPES,
  DM_WHO_OPTIONS,
} from "@/lib/queries/settings";
import { colors } from "@/theme/colors";
import type { DmWho, NotificationChannel } from "@/lib/database.types";

const TRACK = { true: colors.copper, false: "#D9D2C5" };

export default function Settings() {
  const router = useRouter();
  const { data: privacy, isLoading: privacyLoading } = useUserPrivacy();
  const updatePrivacy = useUpdatePrivacy();
  const { data: prefs } = useNotificationPrefs();
  const setPref = useSetNotificationPref();

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="font-display text-xl text-ink">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications */}
        <Text className="mb-1 mt-4 text-xs uppercase tracking-widest text-copper">
          Notifications
        </Text>
        <Text className="mb-3 text-xs leading-5 text-ink/50">
          In-app alerts show on the bell. Push delivery reaches your phone once
          the installed app is set up.
        </Text>

        <View className="rounded-2xl border border-border bg-surface1 px-4 py-1">
          <View className="flex-row items-center border-b border-border/60 py-2">
            <Text className="flex-1" />
            <Text className="w-16 text-center text-xs font-sans-medium text-ink/50">
              Push
            </Text>
            <Text className="w-16 text-center text-xs font-sans-medium text-ink/50">
              In-app
            </Text>
          </View>
          {NOTIFICATION_TYPES.map(({ type, label }) => (
            <View
              key={type}
              className="flex-row items-center border-b border-border/40 py-2.5 last:border-0"
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
        <Text className="mb-2 mt-8 text-xs uppercase tracking-widest text-copper">
          Privacy
        </Text>

        {privacyLoading || !privacy ? (
          <ActivityIndicator className="mt-4 self-start" color={colors.copper} />
        ) : (
          <>
            <Text className="mb-2 text-sm font-sans-medium text-ink">
              Who can message you
            </Text>
            <View className="overflow-hidden rounded-2xl border border-border bg-surface1">
              {DM_WHO_OPTIONS.map((opt, i) => {
                const active = privacy.dm_who === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() =>
                      updatePrivacy.mutate({ dm_who: opt.key as DmWho })
                    }
                    className={`flex-row items-center justify-between px-4 py-3.5 active:bg-surface2 ${
                      i > 0 ? "border-t border-border/60" : ""
                    }`}
                  >
                    <Text className="text-base text-ink">{opt.label}</Text>
                    {active ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-copper">
                        <Check color={colors.parchment} size={15} />
                      </View>
                    ) : (
                      <View className="h-6 w-6 rounded-full border border-border" />
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

            <Text className="mt-3 text-xs leading-5 text-ink/45">
              Mathetes keeps conservative defaults. Leaders see messaging
              activity for pastoral care, never to intrude.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface1 px-4 py-3">
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
