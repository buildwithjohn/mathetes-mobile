import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/queries/profile";
import type { PrayerRequest, ReactionEmoji, UserProfile } from "@/lib/database.types";

export const prayerKeys = {
  requests: ["prayer", "requests"] as const,
};

type PrayAuthor = Pick<
  UserProfile,
  "id" | "name" | "photo_url" | "photo_visibility" | "house_id"
>;

type PrayerRow = PrayerRequest & {
  user_profiles: PrayAuthor | null;
  prayer_pray: { user_id: string }[];
  prayer_reactions: { emoji: ReactionEmoji; user_id: string }[];
};

export type PrayerEntry = {
  id: string;
  authorId: string;
  body: string;
  anonymous: boolean;
  urgent: boolean;
  praise: boolean;
  houseId: string | null;
  createdAt: string;
  author: PrayAuthor | null;
  prayedCount: number;
  prayedByMe: boolean;
  answeredAt: string | null;
  answerNote: string | null;
};

// Prayer requests visible to the member (parish-wide + their house). Archived
// requests are excluded. RLS does the scoping; we just enrich with counts.
export function usePrayerRequests() {
  const { data: profile } = useProfile();
  const me = profile?.id ?? null;

  return useQuery({
    queryKey: prayerKeys.requests,
    enabled: !!me,
    queryFn: async (): Promise<PrayerEntry[]> => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select(
          `*, user_profiles(id, name, photo_url, photo_visibility, house_id), prayer_pray(user_id), prayer_reactions(emoji, user_id)`
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .returns<PrayerRow[]>();
      if (error) throw error;

      return (data ?? []).map((r) => ({
        id: r.id,
        authorId: r.author_id,
        body: r.body,
        anonymous: r.anonymous,
        urgent: r.urgent,
        praise: r.praise,
        houseId: r.house_id,
        createdAt: r.created_at,
        author: r.anonymous ? null : r.user_profiles,
        prayedCount: r.prayer_pray.length,
        prayedByMe: r.prayer_pray.some((p) => p.user_id === me),
        answeredAt: r.answered_at,
        answerNote: r.answer_note,
      }));
    },
  });
}

/** An answered prayer is an author-only pastoral marker, written through the
 * security-definer RPC so a member cannot mark somebody else's request. */
export function useMarkPrayerAnswered() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, answerNote }: { requestId: string; answerNote: string }) => {
      const { error } = await supabase.rpc("mark_prayer_answered", {
        p_request: requestId,
        p_answer_note: answerNote.trim() || undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: prayerKeys.requests }),
  });
}

export function useCreatePrayer() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      body: string;
      anonymous: boolean;
      urgent: boolean;
      praise: boolean;
      // null => parish-wide; otherwise must be the member's own house.
      houseId: string | null;
    }): Promise<void> => {
      if (!profile?.parish_id) throw new Error("No parish.");
      const { error } = await supabase.from("prayer_requests").insert({
        parish_id: profile.parish_id,
        author_id: profile.id,
        house_id: args.houseId,
        body: args.body.trim(),
        anonymous: args.anonymous,
        urgent: args.urgent,
        praise: args.praise,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerKeys.requests });
    },
  });
}

// Toggle the caller's "I prayed" tap on a request.
export function useTogglePray() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      requestId: string;
      on: boolean;
    }): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      if (args.on) {
        const { error } = await supabase
          .from("prayer_pray")
          .insert({ request_id: args.requestId, user_id: profile.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("prayer_pray")
          .delete()
          .eq("request_id", args.requestId)
          .eq("user_id", profile.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerKeys.requests });
    },
  });
}
