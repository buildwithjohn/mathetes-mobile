import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Bell,
  Megaphone,
  Users,
  HeartHandshake,
  MessageCircleQuestion,
  Hash,
  type LucideIcon,
} from "lucide-react-native";
import { useChats, type ChatSummary } from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import {
  useUnreadCount,
  useNotificationsRealtime,
} from "@/lib/queries/notifications";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

export default function Community() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: chats, isLoading } = useChats();
  const unread = useUnreadCount();
  useNotificationsRealtime();

  // Announcements have a dedicated feed; keep the list to conversations.
  const conversations = (chats ?? []).filter((c) => c.kind !== "announcements");

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-6">
        <Text className="font-display text-3xl text-ink">Community</Text>
        <Pressable
          onPress={() => router.push("/notifications")}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Notifications"
        >
          <Bell color={colors.ink} size={24} />
          {unread > 0 ? (
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-oxblood" />
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Quick links */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <QuickTile
              icon={Megaphone}
              label="Announcements"
              onPress={() => router.push("/announcements")}
            />
            <QuickTile
              icon={HeartHandshake}
              label="Prayer Wall"
              onPress={() => router.push("/prayer")}
            />
          </View>
          <View className="flex-row gap-3">
            <QuickTile
              icon={MessageCircleQuestion}
              label="Ask Pastor"
              onPress={() => router.push("/ask-pastor")}
            />
            <QuickTile
              icon={Users}
              label="Members"
              onPress={() => router.push("/members")}
            />
          </View>
        </View>

        {/* Chats (announcements are surfaced via their own feed above) */}
        <Text className="mb-2 mt-8 text-xs uppercase tracking-widest text-copper">
          Messages
        </Text>

        {isLoading ? (
          <ActivityIndicator className="mt-8" color={colors.copper} />
        ) : conversations.length === 0 ? (
          <Text className="mt-6 text-center text-sm text-ink/50">
            Your house group and conversations will appear here.
          </Text>
        ) : (
          <View className="gap-1">
            {conversations.map((c) => (
              <ChatRow
                key={c.id}
                chat={c}
                viewerHouseId={profile?.house_id ?? null}
                onPress={() => router.push(`/chat/${c.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickTile({
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
      className="flex-1 items-center gap-2 rounded-2xl border border-border bg-surface1 px-2 py-4 active:opacity-90"
    >
      <Icon color={colors.copper} size={24} />
      <Text className="text-center text-xs font-sans-medium text-ink">
        {label}
      </Text>
    </Pressable>
  );
}

function ChatRow({
  chat,
  viewerHouseId,
  onPress,
}: {
  chat: ChatSummary;
  viewerHouseId: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface2"
    >
      <ChatIcon chat={chat} viewerHouseId={viewerHouseId} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 font-sans-semibold text-base text-ink"
            numberOfLines={1}
          >
            {chat.title}
          </Text>
          {chat.lastAt ? (
            <Text className="ml-2 text-xs text-ink/40">
              {formatDistanceToNowStrict(new Date(chat.lastAt))}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-ink/55" numberOfLines={1}>
            {chat.lastBody || "No messages yet"}
          </Text>
          {chat.unread > 0 ? (
            <View className="ml-2 h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1.5">
              <Text className="text-xs font-sans-semibold text-parchment">
                {chat.unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ChatIcon({
  chat,
  viewerHouseId,
}: {
  chat: ChatSummary;
  viewerHouseId: string | null;
}) {
  if (chat.kind === "announcements") {
    return (
      <View className="h-12 w-12 items-center justify-center rounded-full bg-copper/15">
        <Megaphone color={colors.copper} size={22} />
      </View>
    );
  }
  if (chat.kind === "house_group") {
    return (
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${chat.accent ?? colors.copper}22` }}
      >
        <Hash color={chat.accent ?? colors.copper} size={22} />
      </View>
    );
  }
  // dm / discipler / ask-pastor: the other participant's avatar.
  return (
    <Avatar
      name={chat.other?.name ?? "Member"}
      photoUrl={chat.other ? visiblePhotoUrl(chat.other, viewerHouseId) : null}
      size={48}
    />
  );
}
