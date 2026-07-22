import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ChevronLeft,
  MessageCircle,
  Megaphone,
  MessageCircleQuestion,
  HeartHandshake,
  Bell,
  BookOpen,
} from "lucide-react-native";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/queries/notifications";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import type { Notification, NotificationType } from "@/lib/database.types";

const ICON: Record<NotificationType, typeof Bell> = {
  message: MessageCircle,
  announcement: Megaphone,
  devotional: BookOpen,
  ask_answered: MessageCircleQuestion,
  mention: MessageCircle,
  daily_prompt: MessageCircle,
  streak: Bell,
  prayer: HeartHandshake,
  system: Bell,
};

export default function Notifications() {
  const router = useRouter();
  const { data: notifications, isLoading, refetch, isRefetching } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const hasUnread = (notifications ?? []).some((n) => n.read_at === null);

  // Route a notification to the surface it refers to. target_url is the
  // reliable signal (e.g. mathetes://chat/<id>, mathetes://announcements/<id>),
  // since announcement rows can come from a chat or the content feed.
  const open = (n: Notification) => {
    if (n.read_at === null) markRead.mutate(n.id);
    const url = n.target_url ?? "";
    if (url.includes("/chat/") && n.target_id) {
      router.push(`/chat/${n.target_id}`);
    } else if (url.includes("/announcements/")) {
      router.push("/announcements");
    } else if (url.includes("/ask-pastor/") || n.type === "ask_answered") {
      router.push("/ask-pastor");
    } else if (n.type === "prayer") {
      router.push("/prayer");
    } else if (n.type === "announcement") {
      router.push("/announcements");
    } else if (n.target_id && (n.type === "message" || n.type === "daily_prompt" || n.type === "mention")) {
      router.push(`/chat/${n.target_id}`);
    }
  };

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
        <Text className="flex-1 font-display text-xl text-ink">
          Notifications
        </Text>
        {hasUnread ? (
          <Pressable
            onPress={() => markAll.mutate()}
            className="px-3 py-2 active:opacity-60"
          >
            <Text className="text-sm font-sans-medium text-copper">
              Mark all read
            </Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.copper}
            />
          }
          renderItem={({ item }) => {
            const Icon = ICON[item.type as NotificationType] ?? Bell;
            const unread = item.read_at === null;
            return (
              <Pressable
                onPress={() => open(item)}
                className={`flex-row gap-3 px-5 py-4 active:bg-surface2 ${
                  unread ? "bg-copper/5" : ""
                }`}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface2">
                  <Icon color={colors.copper} size={18} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="flex-1 font-sans-semibold text-base text-ink"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text className="ml-2 text-xs text-ink/40">
                      {formatDistanceToNowStrict(new Date(item.created_at))}
                    </Text>
                  </View>
                  {item.preview ? (
                    <Text className="text-sm text-ink/60" numberOfLines={2}>
                      {item.preview}
                    </Text>
                  ) : null}
                </View>
                {unread ? (
                  <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-copper" />
                ) : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={Bell}
              title="You are all caught up"
              body="Messages, announcements, and answers will show up here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
