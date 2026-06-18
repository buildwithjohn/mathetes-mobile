import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Settings,
  Bookmark,
  Highlighter,
  ImageIcon,
  User as UserIcon,
  Users,
  HeartHandshake,
  BookOpen,
  Layers,
  HandCoins,
  type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "@/lib/stores/auth";
import { useProfile, useHouses } from "@/lib/queries/profile";
import { useStreak } from "@/lib/queries/engagement";
import { useBookmarks, useHighlights } from "@/lib/queries/library";
import { useVerseImages } from "@/lib/queries/verseImages";
import { Avatar } from "@/components/Avatar";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { colors } from "@/theme/colors";

export default function You() {
  const router = useRouter();
  const signOut = useAuth((s) => s.signOut);
  const { data: profile, isLoading } = useProfile();
  const { data: houses } = useHouses();
  const { count } = useStreak();
  const { data: bookmarks } = useBookmarks();
  const { data: highlights } = useHighlights();
  const { data: images } = useVerseImages();

  const house = houses?.find((h) => h.id === profile?.house_id) ?? null;
  const accent = house?.color ?? colors.copper;

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-6 pb-1 pt-4">
        <Text
          className="font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.76 }}
        >
          Profile
        </Text>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.push("/profile/edit")}>
            <Text className="font-sans-medium text-[13px] text-copper-deep">
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
          >
            <Settings color={colors.inkMute} size={20} strokeWidth={1.6} />
          </Pressable>
        </View>
      </View>

      <Animated.ScrollView
        entering={FadeInDown.duration(380)}
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header card with house accent stripe */}
        <View className="mt-2 overflow-hidden rounded-2xl border border-rule bg-paper">
          <View className="h-1" style={{ backgroundColor: accent }} />
          <View className="p-5">
            {isLoading ? (
              <ActivityIndicator color={colors.copper} />
            ) : (
              <>
                <View className="flex-row items-center gap-4">
                  <Avatar
                    name={profile?.name ?? "Disciple"}
                    photoUrl={profile?.photo_url}
                    ringColor={house?.color}
                    size={64}
                  />
                  <View className="flex-1">
                    <Text className="font-display text-2xl text-ink">
                      {profile?.name ?? "Disciple"}
                    </Text>
                    {house ? (
                      <Text
                        className="mt-1.5 font-sans-semibold text-[11px] uppercase"
                        style={{ color: accent, letterSpacing: 1.76 }}
                      >
                        {house.name}
                      </Text>
                    ) : (
                      <Text className="mt-1 text-xs text-ink-mute">
                        No house chosen yet
                      </Text>
                    )}
                    {profile?.pinned_verse_ref ? (
                      <Text className="mt-1 text-[11.5px] text-ink-mute">
                        {profile.pinned_verse_ref}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Stats row */}
                <View className="mt-4 flex-row items-center gap-2">
                  <View className="flex-row items-center gap-1.5">
                    <AnimatedFlame size={14} />
                    <Text className="text-xs text-ink-soft">
                      <Text className="font-sans-semibold text-ink">{count}-day</Text>{" "}
                      streak
                    </Text>
                  </View>
                  <Text className="text-ink-faint">·</Text>
                  <Text className="text-xs text-ink-soft">
                    <Text className="font-sans-semibold text-ink">
                      {bookmarks?.length ?? 0}
                    </Text>{" "}
                    saved
                  </Text>
                  <Text className="text-ink-faint">·</Text>
                  <Text className="text-xs text-ink-soft">
                    <Text className="font-sans-semibold text-ink">
                      {highlights?.length ?? 0}
                    </Text>{" "}
                    highlights
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Library */}
        <SectionEyebrow>Your library</SectionEyebrow>
        <View className="flex-row gap-2">
          <LibraryStat
            icon={Bookmark}
            n={bookmarks?.length ?? 0}
            label="Bookmarks"
            onPress={() => router.push("/library")}
          />
          <LibraryStat
            icon={Highlighter}
            n={highlights?.length ?? 0}
            label="Highlights"
            onPress={() => router.push("/library")}
          />
          <LibraryStat
            icon={ImageIcon}
            n={images?.length ?? 0}
            label="Images"
            onPress={() => router.push("/gallery")}
          />
        </View>

        {/* Account & community */}
        <SectionEyebrow>Account &amp; community</SectionEyebrow>
        <View className="overflow-hidden rounded-2xl border border-rule bg-paper">
          <MenuRow
            icon={HandCoins}
            label="Give"
            onPress={() => router.push("/giving")}
          />
          <MenuRow
            icon={Layers}
            label="Devotionals"
            onPress={() => router.push("/devotionals")}
            divider
          />
          <MenuRow
            icon={BookOpen}
            label="Reading plans"
            onPress={() => router.push("/plans")}
            divider
          />
          <MenuRow
            icon={UserIcon}
            label="Edit profile"
            onPress={() => router.push("/profile/edit")}
            divider
          />
          <MenuRow
            icon={Users}
            label="Members"
            onPress={() => router.push("/members")}
            divider
          />
          <MenuRow
            icon={HeartHandshake}
            label="Prayer wall"
            onPress={() => router.push("/prayer")}
            divider
          />
          <MenuRow
            icon={Settings}
            label="Privacy & settings"
            onPress={() => router.push("/settings")}
            divider
          />
        </View>

        <Pressable
          onPress={signOut}
          className="mt-8 h-12 items-center justify-center rounded-full border border-rule active:opacity-70"
        >
          <Text className="font-sans-medium text-ink">Sign out</Text>
        </Pressable>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="mb-2 mt-7 pl-1 font-sans-medium text-[11px] uppercase text-ink-mute"
      style={{ letterSpacing: 1.6 }}
    >
      {children}
    </Text>
  );
}

function LibraryStat({
  icon: Icon,
  n,
  label,
  onPress,
}: {
  icon: LucideIcon;
  n: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-2xl border border-rule bg-paper p-3.5 active:opacity-90"
    >
      <Icon color={colors.copper} size={18} strokeWidth={1.6} />
      <Text className="mt-2 font-display text-[22px] text-ink">{n}</Text>
      <Text className="mt-0.5 text-[11px] text-ink-mute">{label}</Text>
    </Pressable>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  divider,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  divider?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3.5 px-4 py-3.5 active:bg-surface2 ${
        divider ? "border-t border-rule-soft" : ""
      }`}
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-paper-raised">
        <Icon color={colors.inkSoft} size={17} strokeWidth={1.6} />
      </View>
      <Text className="flex-1 text-base text-ink">{label}</Text>
      <ChevronRight color={colors.inkFaint} size={16} strokeWidth={1.5} />
    </Pressable>
  );
}
