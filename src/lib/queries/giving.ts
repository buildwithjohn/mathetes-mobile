import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type {
  GivingFund,
  GivingRecurring,
  Donation,
  GivingInterval,
} from "@/lib/database.types";

export const givingKeys = {
  funds: ["giving", "funds"] as const,
  donations: ["giving", "donations"] as const,
  recurring: ["giving", "recurring"] as const,
};

// Active funds in the member's parish (RLS scopes this).
export function useGivingFunds() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: givingKeys.funds,
    enabled: !!authId,
    queryFn: async (): Promise<GivingFund[]> => {
      const { data, error } = await supabase
        .from("giving_funds")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// The member's own giving history (RLS: own rows only).
export function useDonations() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: givingKeys.donations,
    enabled: !!authId,
    queryFn: async (): Promise<Donation[]> => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// The member's recurring mandates.
export function useRecurringGiving() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: givingKeys.recurring,
    enabled: !!authId,
    queryFn: async (): Promise<GivingRecurring[]> => {
      const { data, error } = await supabase
        .from("giving_recurring")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type InitGivingArgs = {
  amountKobo: number;
  kind?: "one_time" | "recurring";
  fundId?: string | null;
  interval?: GivingInterval;
  anonymous?: boolean;
  note?: string;
};

export type InitGivingResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
  recurring_id?: string;
};

// Initialize a gift via the paystack-initialize edge function. Returns the
// Paystack authorization_url (opened in a WebView) + the reference to watch.
export function useInitGiving() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: InitGivingArgs): Promise<InitGivingResult> => {
      const { data, error } = await supabase.functions.invoke<InitGivingResult>(
        "paystack-initialize",
        {
          body: {
            amount_kobo: args.amountKobo,
            kind: args.kind ?? "one_time",
            fund_id: args.fundId ?? undefined,
            interval: args.interval,
            anonymous: args.anonymous === true,
            note: args.note,
            callback_url: "mathetes://giving/done",
          },
        }
      );
      if (error) throw error;
      if (!data) throw new Error("No response from giving service.");
      return data;
    },
    onSuccess: () => {
      // A pending donation/recurring row now exists; refresh lists.
      queryClient.invalidateQueries({ queryKey: givingKeys.donations });
      queryClient.invalidateQueries({ queryKey: givingKeys.recurring });
    },
  });
}

export type ManageRecurringResult = {
  ok: boolean;
  recurring_id: string;
  status: "cancelled" | "paused" | "active";
};

export function useManageRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      recurringId: string;
      action: "cancel" | "pause" | "resume";
    }): Promise<ManageRecurringResult> => {
      const { data, error } =
        await supabase.functions.invoke<ManageRecurringResult>(
          "paystack-manage-recurring",
          { body: { recurring_id: args.recurringId, action: args.action } }
        );
      if (error) throw error;
      if (!data) throw new Error("No response from giving service.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: givingKeys.recurring });
    },
  });
}

// Watch a single donation row by reference until its status settles. Returns an
// unsubscribe function. The webhook flips status server-side; we react via
// realtime (no polling, no verify call).
export function watchDonation(
  reference: string,
  onStatus: (status: Donation["status"]) => void
): () => void {
  const channel = supabase
    .channel(`donation:${reference}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "donations",
        filter: `reference=eq.${reference}`,
      },
      (payload) => {
        const row = payload.new as Donation | null;
        if (row?.status) onStatus(row.status);
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// Fallback one-shot status read (used if realtime is unavailable).
export async function fetchDonationStatus(
  reference: string
): Promise<Donation["status"] | null> {
  const { data, error } = await supabase
    .from("donations")
    .select("status")
    .eq("reference", reference)
    .maybeSingle();
  if (error) throw error;
  return data?.status ?? null;
}
