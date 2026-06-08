import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Flame,
  ChevronRight,
  PenLine,
  BookMarked,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "@/lib/stores/auth";
import { useProfile, useHouses } from "@/lib/queries/profile";
import { useStreak } from "@/lib/queries/engagement";
import { Avatar } from "@/components/Avatar";
import { colors } from "@/theme/colors";

export default function You() {
  const router = useRouter();
  const signOut = useAuth((s) => s.signOut);
  const { data: profile, isLoading } = useProfile();
  const { data: houses } = useHouses();
  const { count, best } = useStreak();

  const house = houses?.find((h) => h.id === profile?.house_id) ?? null;

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-display text-3xl text-ink">You</Text>

        {/* Identity */}
        <View className="mt-6 items-center">
          {isLoading ? (
            <ActivityIndicator color={colors.copper} />
          ) : (
            <>
              <Avatar
                name={profile?.name ?? "Disciple"}
                photoUrl={profile?.photo_url}
                ringColor={house?.color}
                size={96}
              />
              <Text className="mt-4 font-display text-2xl text-ink">
                {profile?.name ?? "Disciple"}
              </Text>
              {house ? (
                <View className="mt-2 flex-row items-center gap-2 rounded-full bg-surface1 px-3 py-1.5">
                  <View
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: house.color }}
                  />
                  <Text className="text-sm font-sans-medium text-ink/80">
                    {house.name}
                  </Text>
                </View>
              ) : (
                <Text className="mt-2 text-sm text-ink/50">
                  No house chosen yet
                </Text>
              )}
              {profile?.pinned_verse_ref ? (
                <Text className="mt-3 font-scripture text-sm italic text-ink/55">
                  {profile.pinned_verse_ref}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* Streak */}
        <View className="mt-8 flex-row items-center rounded-2xl border border-border bg-surface1 py-5">
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-1.5">
              <Flame color={colors.copper} size={20} />
              <Text className="font-display text-3xl text-ink">{count}</Text>
            </View>
            <Text className="mt-1 text-xs uppercase tracking-widest text-ink/50">
              Day streak
            </Text>
          </View>
          <View className="h-10 w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="font-display text-3xl text-ink">{best}</Text>
            <Text className="mt-1 text-xs uppercase tracking-widest text-ink/50">
              Best
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View className="mt-8 gap-3">
          <MenuRow
            icon={PenLine}
            label="Edit profile"
            onPress={() => router.push("/profile/edit")}
          />
          <MenuRow
            icon={BookMarked}
            label="Your library"
            onPress={() => router.push("/library")}
          />
          <MenuRow
            icon={Settings}
            label="Settings"
            onPress={() => router.push("/settings")}
          />
        </View>
      </ScrollView>

      <View className="px-6 pb-10">
        <Pressable
          onPress={signOut}
          className="h-12 items-center justify-center rounded-full border border-border active:opacity-70"
        >
          <Text className="font-sans-medium text-ink">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface1 p-4 active:opacity-90"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface2">
        <Icon color={colors.copper} size={18} />
      </View>
      <Text className="flex-1 font-sans-medium text-base text-ink">{label}</Text>
      <ChevronRight color={colors.ink} size={18} />
    </Pressable>
  );
}
