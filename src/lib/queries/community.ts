import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadToBucket } from "@/lib/storage";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type {
  Chat,
  ChatKind,
  Message,
  ReactionEmoji,
  UserProfile,
} from "@/lib/database.types";

export const communityKeys = {
  chats: ["community", "chats"] as const,
  chat: (id: string) => ["community", "chat", id] as const,
  messages: (id: string) => ["community", "messages", id] as const,
  members: ["community", "members"] as const,
};

// A profile as embedded in chat/message/member rows.
export type MemberProfile = Pick<
  UserProfile,
  "id" | "name" | "photo_url" | "photo_visibility" | "house_id" | "role"
>;
const PROFILE_COLS = "id, name, photo_url, photo_visibility, house_id, role";

export type ChatMemberRow = {
  user_id: string;
  role: string;
  last_read_at: string | null;
  muted: boolean;
  user_profiles: MemberProfile | null;
};

type ChatWithHouse = Chat & {
  houses: { name: string; color: string } | null;
};

export type ChatSummary = {
  id: string;
  kind: ChatKind;
  houseId: string | null;
  title: string;
  accent: string | null;
  other: MemberProfile | null;
  lastBody: string | null;
  lastAt: string | null;
  unread: number;
  muted: boolean;
};

// Title shown for a chat in the list, derived from its kind and members.
function titleFor(
  chat: ChatWithHouse,
  other: MemberProfile | null
): string {
  switch (chat.kind) {
    case "announcements":
      return "Parish Announcements";
    case "parish_group":
      return "Parish Community";
    case "house_group":
      return chat.houses ? `${chat.houses.name} House` : "House group";
    case "discipler":
      return other ? other.name : "Discipler";
    case "ask_pastor_thread":
      return "Ask Pastor";
    case "dm":
      return other ? other.name : "Direct message";
  }
}

// All chats the member can see (their house group, the announcements channel,
// DMs, discipler chat) with a last-message preview and unread count.
export function useChats() {
  const { data: profile } = useProfile();
  const me = profile?.id ?? null;

  return useQuery({
    queryKey: communityKeys.chats,
    enabled: !!me,
    queryFn: async (): Promise<ChatSummary[]> => {
      const { data: chats, error: chatsErr } = await supabase
        .from("chats")
        .select(`id, kind, parish_id, house_id, created_by, created_at, houses(name, color)`)
        .returns<ChatWithHouse[]>();
      if (chatsErr) throw chatsErr;
      const ids = (chats ?? []).map((c) => c.id);
      if (ids.length === 0) return [];

      const [membersRes, msgsRes] = await Promise.all([
        supabase
          .from("chat_members")
          .select(`chat_id, user_id, role, last_read_at, muted, user_profiles(${PROFILE_COLS})`)
          .in("chat_id", ids)
          .returns<(ChatMemberRow & { chat_id: string })[]>(),
        supabase
          .from("messages")
          .select("id, chat_id, author_id, body, kind, created_at")
          .in("chat_id", ids)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(400)
          .returns<
            Pick<Message, "id" | "chat_id" | "author_id" | "body" | "kind" | "created_at">[]
          >(),
      ]);
      if (membersRes.error) throw membersRes.error;
      if (msgsRes.error) throw msgsRes.error;

      const members = membersRes.data ?? [];
      const msgs = msgsRes.data ?? [];

      return (chats ?? [])
        .map((chat): ChatSummary => {
          const chatMembers = members.filter((m) => m.chat_id === chat.id);
          const mine = chatMembers.find((m) => m.user_id === me) ?? null;
          const other =
            chatMembers.find((m) => m.user_id !== me)?.user_profiles ?? null;
          const chatMsgs = msgs.filter((m) => m.chat_id === chat.id);
          const last = chatMsgs[0] ?? null;
          const lastRead = mine?.last_read_at ?? null;
          const unread = chatMsgs.filter(
            (m) =>
              m.author_id !== me &&
              (!lastRead || m.created_at > lastRead)
          ).length;
          return {
            id: chat.id,
            kind: chat.kind,
            houseId: chat.house_id,
            title: titleFor(chat, other),
            accent: chat.houses?.color ?? null,
            other,
            lastBody: last
              ? last.body ??
                (last.kind === "image"
                  ? "Photo"
                  : last.kind === "voice"
                    ? "Voice note"
                    : "")
              : null,
            lastAt: last?.created_at ?? null,
            unread,
            muted: mine?.muted ?? false,
          };
        })
        .sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
    },
  });
}

// One chat with its members (for the thread header, oversight banner, and
// post-permission check).
export function useChat(chatId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: communityKeys.chat(chatId),
    enabled: !!authId && !!chatId,
    queryFn: async (): Promise<{
      chat: ChatWithHouse;
      members: ChatMemberRow[];
    } | null> => {
      const { data: chat, error } = await supabase
        .from("chats")
        .select(`id, kind, parish_id, house_id, created_by, created_at, houses(name, color)`)
        .eq("id", chatId)
        .maybeSingle()
        .returns<ChatWithHouse>();
      if (error) throw error;
      if (!chat) return null;
      const { data: members, error: mErr } = await supabase
        .from("chat_members")
        .select(`user_id, role, last_read_at, muted, user_profiles(${PROFILE_COLS})`)
        .eq("chat_id", chatId)
        .returns<ChatMemberRow[]>();
      if (mErr) throw mErr;
      return { chat, members: members ?? [] };
    },
  });
}

export type MessageRow = Message & {
  user_profiles: MemberProfile | null;
  message_reactions: { emoji: ReactionEmoji; user_id: string }[];
};

// Recent messages for a chat, newest first (the thread renders inverted).
export function useChatMessages(chatId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: communityKeys.messages(chatId),
    enabled: !!authId && !!chatId,
    queryFn: async (): Promise<MessageRow[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `*, user_profiles(${PROFILE_COLS}), message_reactions(emoji, user_id)`
        )
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<MessageRow[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (body: string): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        author_id: profile.id,
        body: body.trim(),
        kind: "text",
      });
      if (error) throw error;
    },
    // Show the message instantly (so it never feels like "nothing happened"),
    // then reconcile with the server on settle. Rolls back on failure.
    onMutate: async (body: string) => {
      if (!profile) return { previous: undefined };
      await queryClient.cancelQueries({
        queryKey: communityKeys.messages(chatId),
      });
      const key = communityKeys.messages(chatId);
      const previous = queryClient.getQueryData<MessageRow[]>(key);
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        chat_id: chatId,
        author_id: profile.id,
        body: body.trim(),
        kind: "text",
        image_url: null,
        voice_url: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        user_profiles: {
          id: profile.id,
          name: profile.name,
          photo_url: profile.photo_url,
          photo_visibility: profile.photo_visibility,
          house_id: profile.house_id,
          role: profile.role,
        },
        message_reactions: [],
      } as unknown as MessageRow;
      queryClient.setQueryData<MessageRow[]>(key, (old = []) => [
        optimistic,
        ...old,
      ]);
      return { previous };
    },
    onError: (_e, _body, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(communityKeys.messages(chatId), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.chats });
    },
  });
}

// Send an image or voice note: upload to the chat-media bucket (under the
// author's auth-UID folder, as the bucket policy requires) then insert the
// message row referencing the public URL.
export function useSendMediaMessage(chatId: string) {
  const queryClient = useQueryClient();
  const authId = useAuth((s) => s.session?.user.id ?? null);
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      localUri: string;
      kind: "image" | "voice";
      ext: string;
      contentType: string;
    }): Promise<void> => {
      if (!authId || !profile) throw new Error("Not ready.");
      const path = `${authId}/${chatId}/${Date.now()}.${args.ext}`;
      const url = await uploadToBucket({
        bucket: "chat-media",
        path,
        localUri: args.localUri,
        contentType: args.contentType,
      });
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        author_id: profile.id,
        kind: args.kind,
        image_url: args.kind === "image" ? url : null,
        voice_url: args.kind === "voice" ? url : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.chats });
    },
  });
}

// Toggle one of the fixed reaction emojis on a message.
export function useToggleReaction(chatId: string) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      messageId: string;
      emoji: ReactionEmoji;
      on: boolean;
    }): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      if (args.on) {
        const { error } = await supabase
          .from("message_reactions")
          .insert({
            message_id: args.messageId,
            user_id: profile.id,
            emoji: args.emoji,
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", args.messageId)
          .eq("user_id", profile.id)
          .eq("emoji", args.emoji);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.messages(chatId) });
    },
  });
}

// Upsert the caller's membership row to advance last_read_at (also creates a
// membership for read-only channels like announcements so unread can be tracked).
export function useMarkChatRead() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (chatId: string): Promise<void> => {
      if (!profile) return;
      const { error } = await supabase.from("chat_members").upsert(
        {
          chat_id: chatId,
          user_id: profile.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "chat_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.chats });
    },
  });
}

export function useToggleMute() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      chatId: string;
      muted: boolean;
    }): Promise<void> => {
      if (!profile) return;
      const { error } = await supabase.from("chat_members").upsert(
        { chat_id: args.chatId, user_id: profile.id, muted: args.muted },
        { onConflict: "chat_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.chats });
    },
  });
}

// Open (or reuse) a DM with another member; returns the chat id to navigate to.
export function useCreateDm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string): Promise<string> => {
      const { data, error } = await supabase.rpc("create_dm", {
        p_other: otherUserId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.chats });
    },
  });
}

export type DirectoryMember = MemberProfile & {
  role: string;
  year: string | null;
  dept: string | null;
  houses: { name: string; color: string } | null;
};

// Parish member directory, ordered by name.
export function useParishMembers() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: communityKeys.members,
    enabled: !!authId,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<DirectoryMember[]> => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `id, name, photo_url, photo_visibility, house_id, role, year, dept, houses(name, color)`
        )
        .order("name", { ascending: true })
        .returns<DirectoryMember[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}
