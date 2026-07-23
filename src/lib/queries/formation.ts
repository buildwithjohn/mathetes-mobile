import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type {
  FellowshipEvent,
  FellowshipEventRsvp,
  FormationActivity,
  FormationCampaign,
  FormationCampaignCompletion,
} from "@/lib/database.types";

export const formationKeys = {
  rhythm: ["formation", "rhythm"] as const,
  campaigns: ["formation", "campaigns"] as const,
  completions: (campaignIds: string[]) => ["formation", "completions", ...campaignIds] as const,
  events: ["formation", "events"] as const,
  rsvps: (eventIds: string[]) => ["formation", "rsvps", ...eventIds] as const,
  badges: ["formation", "badges"] as const,
};

export type EarnedFormationBadge = {
  key: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
};

export function useMyFormationBadges() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: formationKeys.badges,
    enabled: !!authId,
    queryFn: async (): Promise<EarnedFormationBadge[]> => {
      const { data: earned, error: earnedError } = await supabase
        .from("member_badges")
        .select("badge_key, earned_at");
      if (earnedError) throw earnedError;
      if (!earned?.length) return [];

      const { data: definitions, error: definitionsError } = await supabase
        .from("formation_badges")
        .select("key, title, description, icon")
        .in("key", earned.map((item) => item.badge_key));
      if (definitionsError) throw definitionsError;

      const byKey = new Map((definitions ?? []).map((item) => [item.key, item]));
      return earned.flatMap((item) => {
        const definition = byKey.get(item.badge_key);
        return definition ? [{ ...definition, earned_at: item.earned_at }] : [];
      });
    },
  });
}

export function useRecordFormationActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      kind:
        | "word_read"
        | "devotional_read"
        | "plan_day_complete"
        | "reflection_saved"
        | "prayer_offered"
        | "verse_shared"
        | "quest_complete"
        | "mission_complete";
      targetKey?: string;
    }) => {
      const { error } = await supabase.rpc("record_formation_activity", {
        p_kind: args.kind,
        p_target_key: args.targetKey ?? "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.rhythm });
      queryClient.invalidateQueries({ queryKey: formationKeys.badges });
    },
  });
}

export function useFormationRhythm() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: formationKeys.rhythm,
    enabled: !!authId,
    queryFn: async (): Promise<FormationActivity[]> => {
      const { data, error } = await supabase
        .from("formation_activities")
        .select("*")
        .order("occurred_on", { ascending: false })
        .limit(42)
        .returns<FormationActivity[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFormationCampaigns() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: formationKeys.campaigns,
    enabled: !!authId,
    queryFn: async (): Promise<FormationCampaign[]> => {
      const { data, error } = await supabase
        .from("formation_campaigns")
        .select("*")
        .eq("published", true)
        .order("starts_on", { ascending: true })
        .returns<FormationCampaign[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyCampaignCompletions(campaignIds: string[]) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: formationKeys.completions(campaignIds),
    enabled: !!authId && campaignIds.length > 0,
    queryFn: async (): Promise<FormationCampaignCompletion[]> => {
      const { data, error } = await supabase
        .from("formation_campaign_completions")
        .select("*")
        .in("campaign_id", campaignIds)
        .returns<FormationCampaignCompletion[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCompleteCampaign() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!profile) throw new Error("Your profile is still loading.");
      const { error } = await supabase
        .from("formation_campaign_completions")
        .upsert({ campaign_id: campaignId, user_id: profile.id });
      if (error) throw error;
      const { error: activityError } = await supabase.rpc("record_formation_activity", {
        p_kind: "quest_complete",
        p_target_key: campaignId,
      });
      if (activityError) throw activityError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation"] });
    },
  });
}

export function useFellowshipEvents() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: formationKeys.events,
    enabled: !!authId,
    queryFn: async (): Promise<FellowshipEvent[]> => {
      const { data, error } = await supabase
        .from("fellowship_events")
        .select("*")
        .eq("published", true)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(10)
        .returns<FellowshipEvent[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyEventRsvps(eventIds: string[]) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: formationKeys.rsvps(eventIds),
    enabled: !!authId && eventIds.length > 0,
    queryFn: async (): Promise<FellowshipEventRsvp[]> => {
      const { data, error } = await supabase
        .from("fellowship_event_rsvps")
        .select("*")
        .in("event_id", eventIds)
        .returns<FellowshipEventRsvp[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSetEventRsvp() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: { eventId: string; response: "going" | "interested" | "not_going" }) => {
      if (!profile) throw new Error("Your profile is still loading.");
      const { error } = await supabase
        .from("fellowship_event_rsvps")
        .upsert({ event_id: args.eventId, user_id: profile.id, response: args.response });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation", "rsvps"] });
    },
  });
}
