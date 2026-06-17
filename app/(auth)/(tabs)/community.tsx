import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Bell,
  Search,
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

const FILTERS = ["All", "Unread", "Houses", "DMs"] as const;
type Filter = (typeof FILTERS)[number];

export default function Community() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: chats, isLoading, refetch, isRefetching } = useChats();
  const unread = useUnreadCount();
  useNotificationsRealtime();

  const [filter, setFilter] = useState<Filter>("All");

  // Announcements have a dedicated feed; keep the list to conversations.
  const conversations = useMemo(
    () => (chats ?? []).filter((c) => c.kind !== "announcements"),
    [chats]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "Unread":
        return conversations.filter((c) => c.unread > 0);
      case "Houses":
        return conversations.filter((c) => c.kind === "house_group");
      case "DMs":
        return conversations.filter((c) => c.kind === "dm");
      default:
        return conversations;
    }
  }, [conversations, filter]);

  // Pinned + parish entry points + footer only show on the unfiltered view.
  const showExtras = filter === "All";

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <Text className="px-2 font-display text-[23px] text-ink">Community</Text>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.push("/members")}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel="Find members"
          >
            <Search color={colors.ink} size={22} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel="Notifications"
          >
            <Bell color={colors.ink} size={22} />
            {unread > 0 ? (
              <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-parchment bg-copper" />
            ) : null}
          </Pressable>
        </View>
      </View>

      {/* Filter chips (underline tabs) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-5 px-6 pb-3"
      >
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`py-1 ${on ? "border-b-2 border-b-copper" : ""}`}
            >
              <Text
                className={`text-[13.5px] ${
                  on ? "font-sans-semibold text-ink" : "font-sans-medium text-ink-mute"
                }`}
              >
                {f}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.copper}
          />
        }
      >
        {showExtras ? (
          <>
            {/* Pinned: announcements */}
            <SectionLabel>Pinned</SectionLabel>
            <View className="px-3">
              <View className="rounded-2xl border border-rule bg-paper">
                <EntryRow
                  icon={Megaphone}
                  tone={colors.copper}
                  title="Parish announcements"
                  preview="Notices from the parish and your pastor"
                  onPress={() => router.push("/announcements")}
                />
              </View>
            </View>

            {/* Parish surfaces */}
            <SectionLabel>Parish</SectionLabel>
            <EntryRow
              icon={HeartHandshake}
              tone={colors.oxblood}
              title="Prayer wall"
              preview="Share a request, pray for one another"
              onPress={() => router.push("/prayer")}
            />
            <EntryRow
              icon={MessageCircleQuestion}
              tone={colors.copper}
              title="Ask Pastor"
              preview="Submit a question, answered within 48 hours"
              onPress={() => router.push("/ask-pastor")}
            />
            <EntryRow
              icon={Users}
              tone={colors.inkMute}
              title="Members"
              preview="Find someone in the parish directory"
              onPress={() => router.push("/members")}
            />
          </>
        ) : null}

        {/* Conversations */}
        <SectionLabel>Messages</SectionLabel>
        {isLoading ? (
          <ActivityIndicator className="mt-8" color={colors.copper} />
        ) : filtered.length === 0 ? (
          <Text className="mt-6 px-6 text-center text-sm text-ink-mute">
            {filter === "All"
              ? "Your house group and conversations will appear here."
              : "Nothing here yet."}
          </Text>
        ) : (
          filtered.map((c) => (
            <ChatRow
              key={c.id}
              chat={c}
              viewerHouseId={profile?.house_id ?? null}
              onPress={() => router.push(`/chat/${c.id}`)}
            />
          ))
        )}

        {showExtras ? (
          <Text className="px-9 pt-5 text-center font-display text-[12.5px] italic text-ink-mute">
            Replies to Ask Pastor questions arrive within 48 hours.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="px-6 pb-2 pt-5 font-sans-medium text-[11px] uppercase text-ink-mute"
      style={{ letterSpacing: 1.6 }}
    >
      {children}
    </Text>
  );
}

// A non-conversation entry point (announcements, prayer, ask, members), styled
// as an inbox row with a toned icon disc.
function EntryRow({
  icon: Icon,
  tone,
  title,
  preview,
  onPress,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  preview: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-[18px] py-3 active:bg-surface2"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full border"
        style={{ backgroundColor: `${tone}1F`, borderColor: `${tone}59` }}
      >
        <Icon color={tone} size={20} strokeWidth={1.7} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-[14.5px] text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="mt-0.5 text-[12.5px] text-ink-mute" numberOfLines={1}>
          {preview}
        </Text>
      </View>
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
      className="flex-row items-center gap-3 px-[18px] py-3 active:bg-surface2"
    >
      <ChatIcon chat={chat} viewerHouseId={viewerHouseId} />
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          {chat.kind === "house_group" ? (
            <View
              className="h-[7px] w-[7px] rounded-full"
              style={{ backgroundColor: chat.accent ?? colors.copper }}
            />
          ) : null}
          <Text
            className="flex-1 font-sans-semibold text-[14.5px] text-ink"
            numberOfLines={1}
          >
            {chat.title}
          </Text>
          {chat.lastAt ? (
            <Text className="ml-2 text-[11px] text-ink-faint">
              {formatDistanceToNowStrict(new Date(chat.lastAt))}
            </Text>
          ) : null}
        </View>
        <View className="mt-0.5 flex-row items-center justify-between">
          <Text className="flex-1 text-[12.5px] text-ink-mute" numberOfLines={1}>
            {chat.lastBody || "No messages yet"}
          </Text>
          {chat.unread > 0 ? (
            <View className="ml-2 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-copper px-1.5">
              <Text className="text-[10.5px] font-sans-semibold text-white">
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
  if (chat.kind === "parish_group") {
    return (
      <View
        className="h-11 w-11 items-center justify-center rounded-full border"
        style={{ backgroundColor: `${colors.copper}1F`, borderColor: `${colors.copper}59` }}
      >
        <Users color={colors.copper} size={20} strokeWidth={1.7} />
      </View>
    );
  }
  if (chat.kind === "house_group") {
    const accent = chat.accent ?? colors.copper;
    return (
      <View
        className="h-11 w-11 items-center justify-center rounded-full border"
        style={{ backgroundColor: `${accent}1F`, borderColor: `${accent}59` }}
      >
        <Hash color={accent} size={20} strokeWidth={1.7} />
      </View>
    );
  }
  // dm / discipler / ask-pastor: the other participant's avatar.
  return (
    <Avatar
      name={chat.other?.name ?? "Member"}
      photoUrl={chat.other ? visiblePhotoUrl(chat.other, viewerHouseId) : null}
      size={44}
    />
  );
}
