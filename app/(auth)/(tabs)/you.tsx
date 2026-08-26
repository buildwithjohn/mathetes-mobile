import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
  Library as LibraryIcon,
  Sparkles,
  FolderHeart,
  type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "@/lib/stores/auth";
import { useProfile, useHouses } from "@/lib/queries/profile";
import { useStreak } from "@/lib/queries/engagement";
import { useBookmarks, useHighlights } from "@/lib/queries/library";
import { useVerseImages } from "@/lib/queries/verseImages";
import { Avatar } from "@/components/Avatar";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { PressableScale } from "@/components/PressableScale";
import { haptic } from "@/utils/haptics";
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

  return (
    <View className="flex-1 bg-parchment">
      <Animated.ScrollView
        entering={FadeInDown.duration(380)}
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* IMMERSIVE PROFILE HERO — avatar + identity over a warm gradient */}
        <View className="overflow-hidden">
          <LinearGradient
            colors={["#2C2027", "#41303C", "#4C3140"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(240,200,146,0.20)", "rgba(240,200,146,0)"]}
            start={{ x: 0.85, y: 0 }}
            end={{ x: 0.2, y: 0.8 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <SafeAreaView edges={["top"]}>
            <View className="px-6 pb-9 pt-3">
              <View className="flex-row items-center justify-between">
                <Text
                  className="font-sans-semibold text-[11px] uppercase"
                  style={{ letterSpacing: 1.8, color: "rgba(255,240,225,0.72)" }}
                >
                  Profile
                </Text>
                <View className="flex-row items-center gap-2.5">
                  <PressableScale
                    onPress={() => router.push("/profile/edit")}
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5"
                  >
                    <Text className="font-sans-semibold text-[12px] text-white">Edit</Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => router.push("/settings")}
                    accessibilityLabel="Settings"
                    className="h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10"
                  >
                    <Settings color="#fff" size={17} strokeWidth={1.7} />
                  </PressableScale>
                </View>
              </View>

              {isLoading ? (
                <ActivityIndicator color="#F0C892" className="mt-10 self-center" />
              ) : (
                <View className="mt-6 items-center">
                  <View className="rounded-full border-2 border-white/25 p-1">
                    <Avatar
                      name={profile?.name ?? "Disciple"}
                      photoUrl={profile?.photo_url}
                      size={92}
                    />
                  </View>
                  <Text
                    className="mt-3.5 font-display text-[27px] leading-8"
                    style={{
                      color: "#FFFFFF",
                      textShadowColor: "rgba(0,0,0,0.3)",
                      textShadowRadius: 12,
                      textShadowOffset: { width: 0, height: 1 },
                    }}
                  >
                    {profile?.name ?? "Disciple"}
                  </Text>
                  {house ? (
                    <Text
                      className="mt-1 font-sans-semibold text-[11px] uppercase"
                      style={{ letterSpacing: 1.9, color: "#F0C892" }}
                    >
                      {house.name}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-xs" style={{ color: "rgba(255,240,225,0.6)" }}>
                      No house chosen yet
                    </Text>
                  )}

                  <View className="mt-5 flex-row items-center gap-2.5">
                    <View className="flex-row items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-2">
                      <AnimatedFlame size={14} />
                      <Text className="text-[12.5px] text-white">
                        <Text className="font-sans-semibold">{count}</Text> day
                      </Text>
                    </View>
                    <View className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2">
                      <Text className="text-[12.5px] text-white">
                        <Text className="font-sans-semibold">{bookmarks?.length ?? 0}</Text> saved
                      </Text>
                    </View>
                    <View className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2">
                      <Text className="text-[12.5px] text-white">
                        <Text className="font-sans-semibold">{highlights?.length ?? 0}</Text> highlights
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>

        {/* CONTENT SHEET — rises over the hero */}
        <View className="-mt-6 rounded-t-[30px] bg-parchment px-6 pt-7">

        {/* Quick shortcuts (YouVersion-style) */}
        <View className="mt-3 flex-row gap-2.5">
          <Shortcut
            icon={Bookmark}
            label="Saved"
            onPress={() => router.push("/library")}
          />
          <Shortcut
            icon={HeartHandshake}
            label="Prayer"
            onPress={() => router.push("/prayer")}
          />
          <Shortcut
            icon={HandCoins}
            label="Give"
            onPress={() => router.push("/giving")}
          />
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
            icon={LibraryIcon}
            label="Library"
            onPress={() => router.push("/resources")}
            divider
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
            icon={Sparkles}
            label="Grow"
            onPress={() => router.push("/formation")}
            divider
          />
          <MenuRow
            icon={FolderHeart}
            label="Scripture collections"
            onPress={() => router.push("/collections")}
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

        <PressableScale
          onPress={signOut}
          className="mt-8 h-12 items-center justify-center rounded-full border border-rule"
        >
          <Text className="font-sans-medium text-ink">Sign out</Text>
        </PressableScale>
        </View>
      </Animated.ScrollView>
    </View>
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

function Shortcut({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <PressableScale
        onPress={onPress}
        className="items-center gap-1.5 rounded-2xl border border-rule bg-paper py-4"
      >
        <Icon color={colors.copper} size={20} strokeWidth={1.7} />
        <Text className="text-[13px] text-ink">{label}</Text>
      </PressableScale>
    </View>
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
    <View style={{ flex: 1 }}>
      <PressableScale
        onPress={onPress}
        className="rounded-2xl border border-rule bg-paper p-3.5"
      >
        <Icon color={colors.copper} size={18} strokeWidth={1.6} />
        <Text className="mt-2 font-display text-[22px] text-ink">{n}</Text>
        <Text className="mt-0.5 text-[11px] text-ink-mute">{label}</Text>
      </PressableScale>
    </View>
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
      onPress={() => {
        haptic("light");
        onPress();
      }}
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
