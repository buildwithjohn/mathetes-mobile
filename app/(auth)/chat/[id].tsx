import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  MoreVertical,
  Send,
  Eye,
  Flag,
  Copy,
  Ban,
  BellOff,
  Bell,
  X,
} from "lucide-react-native";
import {
  useChat,
  useChatMessages,
  useSendMessage,
  useToggleReaction,
  useMarkChatRead,
  useToggleMute,
  communityKeys,
  type MessageRow,
} from "@/lib/queries/community";
import { useBlocks, useToggleBlock, useReport } from "@/lib/queries/safety";
import { useProfile } from "@/lib/queries/profile";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";
import type { ReactionEmoji } from "@/lib/database.types";

const REACTIONS: ReactionEmoji[] = ["🙏", "❤️", "amen", "🔥", "✋"];
const reactionLabel = (e: ReactionEmoji) => (e === "amen" ? "Amen" : e);

export default function ChatScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id ?? "";

  const { data: profile } = useProfile();
  const me = profile?.id ?? null;
  const { data: chatData, isLoading: chatLoading } = useChat(chatId);
  const { data: messages, isLoading: msgsLoading } = useChatMessages(chatId);
  const { data: blocked } = useBlocks();

  const send = useSendMessage(chatId);
  const toggleReaction = useToggleReaction(chatId);
  const markRead = useMarkChatRead();
  const toggleMute = useToggleMute();
  const toggleBlock = useToggleBlock();
  const report = useReport();

  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<MessageRow | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const chat = chatData?.chat ?? null;
  const members = chatData?.members ?? [];
  const amMember = !!me && members.some((m) => m.user_id === me);
  const other = members.find((m) => m.user_id !== me)?.user_profiles ?? null;
  const myMembership = members.find((m) => m.user_id === me) ?? null;

  const canPost = useMemo(() => {
    if (!chat || !profile) return false;
    switch (chat.kind) {
      case "announcements":
        return profile.role === "pastor" || profile.role === "admin";
      case "house_group":
        return profile.house_id === chat.house_id;
      default:
        return amMember;
    }
  }, [chat, profile, amMember]);

  const isOversight =
    !!chat && !canPost && (chat.kind === "dm" || chat.kind === "discipler");
  const isGroup =
    chat?.kind === "house_group" || chat?.kind === "announcements";
  const isDm = chat?.kind === "dm";

  const title = useMemo(() => {
    if (!chat) return "";
    switch (chat.kind) {
      case "announcements":
        return "Parish Announcements";
      case "house_group":
        return chat.houses ? `${chat.houses.name} House` : "House group";
      case "discipler":
        return other ? other.name : "Discipler";
      case "ask_pastor_thread":
        return "Ask Pastor";
      case "dm":
        return other ? other.name : "Direct message";
    }
  }, [chat, other]);

  const subtitle = useMemo(() => {
    if (!chat) return "";
    if (isOversight) return "Oversight · read only";
    switch (chat.kind) {
      case "announcements":
        return "Parish channel";
      case "house_group":
        return `${members.length} members`;
      case "discipler":
        return "Discipler conversation";
      default:
        return null;
    }
  }, [chat, members.length, isOversight]);

  // Mark the chat read as messages arrive.
  const latestId = messages?.[0]?.id ?? null;
  useEffect(() => {
    if (chatId && latestId) markRead.mutate(chatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, latestId]);

  // Realtime: refetch on new messages or reaction changes for this chat.
  useEffect(() => {
    if (!chatId) return;
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: communityKeys.messages(chatId),
          });
          queryClient.invalidateQueries({ queryKey: communityKeys.chats });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions" },
        () =>
          queryClient.invalidateQueries({
            queryKey: communityKeys.messages(chatId),
          })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  const onSend = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    send.mutate(body);
  };

  const onReact = (emoji: ReactionEmoji) => {
    if (!selected || !me) return;
    const mine = selected.message_reactions.some(
      (r) => r.user_id === me && r.emoji === emoji
    );
    toggleReaction.mutate({ messageId: selected.id, emoji, on: !mine });
    setSelected(null);
  };

  const onReportMessage = () => {
    if (!selected) return;
    report.mutate(
      { targetType: "message", targetId: selected.id },
      {
        onSuccess: () =>
          Alert.alert("Reported", "Thank you. A leader will review this."),
      }
    );
    setSelected(null);
  };

  const onCopy = async () => {
    if (selected?.body) await Clipboard.setStringAsync(selected.body);
    setSelected(null);
  };

  const isBlocked = !!other && (blocked ?? []).includes(other.id);
  const onToggleBlock = () => {
    if (!other) return;
    setMenuOpen(false);
    toggleBlock.mutate({ blockedId: other.id, on: !isBlocked });
  };
  const onReportUser = () => {
    if (!other) return;
    setMenuOpen(false);
    report.mutate(
      { targetType: "user", targetId: other.id },
      {
        onSuccess: () =>
          Alert.alert("Reported", "Thank you. A leader will review this."),
      }
    );
  };
  const onToggleMute = () => {
    setMenuOpen(false);
    toggleMute.mutate({ chatId, muted: !(myMembership?.muted ?? false) });
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <View className="flex-1">
          <Text className="font-display text-lg text-ink" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-ink/50">{subtitle}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => setMenuOpen(true)}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Chat options"
        >
          <MoreVertical color={colors.ink} size={22} />
        </Pressable>
      </View>

      {/* Oversight banner */}
      {isOversight ? (
        <View className="flex-row items-center gap-2 bg-oxblood/10 px-4 py-2">
          <Eye color={colors.oxblood} size={15} />
          <Text className="text-xs text-oxblood">
            You are viewing this for pastoral care. Read only.
          </Text>
        </View>
      ) : null}

      {chatLoading || msgsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : (
        <FlatList
          data={messages ?? []}
          inverted
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 2 }}
          keyboardDismissMode="interactive"
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              mine={item.author_id === me}
              showAuthor={isGroup}
              meId={me}
              viewerHouseId={profile?.house_id ?? null}
              onLongPress={() => setSelected(item)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-sm text-ink/50">
                No messages yet. Say hello.
              </Text>
            </View>
          }
        />
      )}

      {/* Composer */}
      {canPost ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View className="flex-row items-end gap-2 border-t border-border bg-parchment px-3 pb-6 pt-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message"
              placeholderTextColor="#9C968A"
              multiline
              className="max-h-28 flex-1 rounded-2xl border border-border bg-surface1 px-4 py-2.5 text-base text-ink"
            />
            <Pressable
              onPress={onSend}
              disabled={!draft.trim() || send.isPending}
              className="h-11 w-11 items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-40"
            >
              <Send color={colors.parchment} size={18} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : !isOversight ? (
        <View className="border-t border-border bg-parchment px-6 pb-8 pt-3">
          <Text className="text-center text-xs text-ink/50">
            {chat?.kind === "announcements"
              ? "Only parish leaders can post here."
              : "You cannot post in this conversation."}
          </Text>
        </View>
      ) : null}

      {/* Message action bar */}
      {selected ? (
        <Pressable
          className="absolute inset-0 bg-ink/20"
          onPress={() => setSelected(null)}
        >
          <View className="absolute inset-x-4 bottom-10 overflow-hidden rounded-2xl border border-border bg-surface1">
            <View className="flex-row justify-around border-b border-border px-2 py-3">
              {REACTIONS.map((e) => {
                const mine =
                  !!me &&
                  selected.message_reactions.some(
                    (r) => r.user_id === me && r.emoji === e
                  );
                return (
                  <Pressable
                    key={e}
                    onPress={() => onReact(e)}
                    className={`h-10 min-w-10 items-center justify-center rounded-full px-2 ${
                      mine ? "bg-copper/20" : ""
                    }`}
                  >
                    <Text className="text-lg text-ink">{reactionLabel(e)}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selected.body ? (
              <ActionItem icon={Copy} label="Copy" onPress={onCopy} />
            ) : null}
            {selected.author_id !== me ? (
              <ActionItem
                icon={Flag}
                label="Report message"
                onPress={onReportMessage}
                danger
              />
            ) : null}
          </View>
        </Pressable>
      ) : null}

      {/* Chat options menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-ink/30"
          onPress={() => setMenuOpen(false)}
        >
          <View className="rounded-t-3xl bg-surface1 pb-10 pt-2">
            <View className="mb-1 flex-row items-center justify-between px-5 py-2">
              <Text className="font-display text-lg text-ink">Options</Text>
              <Pressable onPress={() => setMenuOpen(false)} className="p-1">
                <X color={colors.ink} size={20} />
              </Pressable>
            </View>
            <ActionItem
              icon={myMembership?.muted ? Bell : BellOff}
              label={myMembership?.muted ? "Unmute" : "Mute notifications"}
              onPress={onToggleMute}
            />
            {isDm && other ? (
              <>
                <ActionItem
                  icon={Flag}
                  label="Report user"
                  onPress={onReportUser}
                />
                <ActionItem
                  icon={Ban}
                  label={isBlocked ? "Unblock" : `Block ${other.name}`}
                  onPress={onToggleBlock}
                  danger
                />
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function MessageBubble({
  message,
  mine,
  showAuthor,
  meId,
  viewerHouseId,
  onLongPress,
}: {
  message: MessageRow;
  mine: boolean;
  showAuthor: boolean;
  meId: string | null;
  viewerHouseId: string | null;
  onLongPress: () => void;
}) {
  if (message.kind === "system") {
    return (
      <Text className="my-1 text-center text-xs text-ink/40">
        {message.body}
      </Text>
    );
  }

  const author = message.user_profiles;
  const removed = message.deleted_at !== null;

  // Group reactions by emoji with counts.
  const counts = new Map<string, number>();
  for (const r of message.message_reactions)
    counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);

  return (
    <View className={mine ? "items-end" : "items-start"}>
      <View className="max-w-[82%] flex-row items-end gap-2">
        {!mine && showAuthor ? (
          <Avatar
            name={author?.name ?? "Member"}
            photoUrl={author ? visiblePhotoUrl(author, viewerHouseId) : null}
            size={28}
          />
        ) : null}
        <Pressable
          onLongPress={onLongPress}
          delayLongPress={250}
          className={`rounded-2xl px-3.5 py-2.5 ${
            mine ? "bg-copper" : "bg-surface1 border border-border"
          }`}
        >
          {!mine && showAuthor && author ? (
            <Text className="mb-0.5 text-xs font-sans-semibold text-copper">
              {author.name}
            </Text>
          ) : null}
          {removed ? (
            <Text
              className={`text-sm italic ${
                mine ? "text-parchment/70" : "text-ink/40"
              }`}
            >
              Message removed
            </Text>
          ) : message.kind === "image" ? (
            <Text className={mine ? "text-parchment" : "text-ink"}>📷 Photo</Text>
          ) : message.kind === "voice" ? (
            <Text className={mine ? "text-parchment" : "text-ink"}>
              🎤 Voice note
            </Text>
          ) : (
            <Text
              className={`text-base leading-6 ${
                mine ? "text-parchment" : "text-ink"
              }`}
            >
              {message.body}
            </Text>
          )}
        </Pressable>
      </View>
      {counts.size > 0 ? (
        <View
          className={`mt-0.5 flex-row gap-1 ${
            mine ? "pr-1" : showAuthor ? "pl-9" : "pl-1"
          }`}
        >
          {Array.from(counts.entries()).map(([emoji, n]) => {
            const reacted =
              !!meId &&
              message.message_reactions.some(
                (r) => r.user_id === meId && r.emoji === emoji
              );
            return (
              <View
                key={emoji}
                className={`flex-row items-center gap-1 rounded-full border px-2 py-0.5 ${
                  reacted ? "border-copper bg-copper/15" : "border-border bg-surface2"
                }`}
              >
                <Text className="text-xs text-ink">
                  {emoji === "amen" ? "Amen" : emoji}
                </Text>
                {n > 1 ? (
                  <Text className="text-xs text-ink/60">{n}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function ActionItem({
  icon: Icon,
  label,
  onPress,
  danger,
}: {
  icon: typeof Copy;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3.5 active:bg-surface2"
    >
      <Icon color={danger ? colors.oxblood : colors.ink} size={19} />
      <Text
        className={`text-base ${danger ? "text-oxblood" : "text-ink"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
