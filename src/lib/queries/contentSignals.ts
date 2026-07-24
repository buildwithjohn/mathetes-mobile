import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";

export type ContentSignalKind = "word" | "devotional";

export type ContentSignalSummary = {
  amen_count: number;
  share_count: number;
  my_amen: boolean;
};

export const contentSignalKeys = {
  summary: (kind: ContentSignalKind, contentId: string) =>
    ["content-signals", kind, contentId] as const,
};

type SignalTarget = {
  kind: ContentSignalKind;
  contentId: string;
};

const emptySummary: ContentSignalSummary = {
  amen_count: 0,
  share_count: 0,
  my_amen: false,
};

// Counts are parish-visible, while the individual rows remain private. The
// realtime listener makes a new Amen or share appear for everyone reading the
// same daily item without exposing who made it.
export function useContentSignalSummary(
  kind: ContentSignalKind,
  contentId: string
) {
  const authId = useAuth((state) => state.session?.user.id ?? null);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!authId || !contentId) return;

    // `removeChannel` is asynchronous. This must be created inside the effect
    // (rather than once per component) so React's development effect replay or
    // a fast screen remount never tries to add callbacks to a channel that is
    // still subscribed.
    const channelName = `content-signal-counts:${kind}:${contentId}:${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_signal_counts",
          filter: `content_id=eq.${contentId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: contentSignalKeys.summary(kind, contentId),
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authId, contentId, kind, queryClient]);

  return useQuery({
    queryKey: contentSignalKeys.summary(kind, contentId),
    enabled: !!authId && !!contentId,
    queryFn: async (): Promise<ContentSignalSummary> => {
      const { data, error } = await supabase.rpc("content_signal_summary", {
        p_kind: kind,
        p_content: contentId,
      });
      if (error) throw error;
      return data?.[0] ?? emptySummary;
    },
  });
}

export function useToggleContentAmen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kind, contentId }: SignalTarget) => {
      const { data, error } = await supabase.rpc("toggle_content_amen", {
        p_kind: kind,
        p_content: contentId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_active, { kind, contentId }) => {
      queryClient.invalidateQueries({
        queryKey: contentSignalKeys.summary(kind, contentId),
      });
    },
  });
}

export function useRecordContentShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kind, contentId }: SignalTarget) => {
      const { data, error } = await supabase.rpc("record_content_share", {
        p_kind: kind,
        p_content: contentId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_count, { kind, contentId }) => {
      queryClient.invalidateQueries({
        queryKey: contentSignalKeys.summary(kind, contentId),
      });
      // Share is a private formation action too. The badge/rhythm layer keeps
      // this personal; it never publishes who shared an item.
      void supabase.rpc("record_formation_activity", {
        p_kind: "verse_shared",
        p_target_key: `${kind}:${contentId}`,
      });
    },
  });
}
