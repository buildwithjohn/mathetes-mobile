import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type {
  ReadingPlan,
  ReadingPlanDay,
  ReadingPlanSubscription,
} from "@/lib/database.types";

export const planKeys = {
  all: ["reading_plans"] as const,
  plan: (id: string) => ["reading_plans", id] as const,
  days: (planId: string) => ["reading_plans", planId, "days"] as const,
  mySubs: ["reading_plans", "subscriptions"] as const,
  sub: (planId: string) => ["reading_plans", "subscription", planId] as const,
  progress: (subId: string) => ["reading_plans", "progress", subId] as const,
};

export type SubscriptionWithPlan = ReadingPlanSubscription & {
  reading_plans: ReadingPlan | null;
};

// Published plans in the member's parish (RLS scopes this).
export function useReadingPlans() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: planKeys.all,
    enabled: !!authId,
    queryFn: async (): Promise<ReadingPlan[]> => {
      const { data, error } = await supabase
        .from("reading_plans")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReadingPlan(planId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: planKeys.plan(planId),
    enabled: !!authId && !!planId,
    queryFn: async (): Promise<ReadingPlan | null> => {
      const { data, error } = await supabase
        .from("reading_plans")
        .select("*")
        .eq("id", planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePlanDays(planId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: planKeys.days(planId),
    enabled: !!authId && !!planId,
    queryFn: async (): Promise<ReadingPlanDay[]> => {
      const { data, error } = await supabase
        .from("reading_plan_days")
        .select("*")
        .eq("plan_id", planId)
        .order("day_number", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePlanDay(dayId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: ["reading_plans", "day", dayId] as const,
    enabled: !!authId && !!dayId,
    queryFn: async (): Promise<ReadingPlanDay | null> => {
      const { data, error } = await supabase
        .from("reading_plan_days")
        .select("*")
        .eq("id", dayId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// The member's own in-progress / completed plans, newest activity first.
export function useMySubscriptions() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: planKeys.mySubs,
    enabled: !!authId,
    queryFn: async (): Promise<SubscriptionWithPlan[]> => {
      const { data, error } = await supabase
        .from("reading_plan_subscriptions")
        .select("*, reading_plans(*)")
        .order("last_activity_at", { ascending: false })
        .returns<SubscriptionWithPlan[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePlanSubscription(planId: string) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: planKeys.sub(planId),
    enabled: !!authId && !!planId,
    queryFn: async (): Promise<ReadingPlanSubscription | null> => {
      const { data, error } = await supabase
        .from("reading_plan_subscriptions")
        .select("*")
        .eq("plan_id", planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// Set of completed day ids for a subscription (to tick off the day list).
export function usePlanProgress(subscriptionId: string | null) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: planKeys.progress(subscriptionId ?? ""),
    enabled: !!authId && !!subscriptionId,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from("reading_plan_progress")
        .select("day_id")
        .eq("subscription_id", subscriptionId!);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.day_id));
    },
  });
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string): Promise<string> => {
      const { data, error } = await supabase.rpc("subscribe_to_plan", {
        p_plan_id: planId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_id, planId) => {
      queryClient.invalidateQueries({ queryKey: planKeys.sub(planId) });
      queryClient.invalidateQueries({ queryKey: planKeys.mySubs });
    },
  });
}

export function useCompletePlanDay(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      dayId: string;
      reflection?: string | null;
      shareWithDiscipler?: boolean;
    }): Promise<string> => {
      const { data, error } = await supabase.rpc("complete_plan_day", {
        p_day_id: args.dayId,
        p_reflection_response: args.reflection ?? undefined,
        p_share_with_discipler: args.shareWithDiscipler ?? undefined,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.sub(planId) });
      queryClient.invalidateQueries({ queryKey: planKeys.mySubs });
      queryClient.invalidateQueries({ queryKey: ["reading_plans", "progress"] });
    },
  });
}

export function useTogglePlanPause(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc("toggle_plan_pause", {
        p_subscription_id: subscriptionId,
      });
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.sub(planId) });
      queryClient.invalidateQueries({ queryKey: planKeys.mySubs });
    },
  });
}
