import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { Report } from "@/lib/database.types";

export const oversightKeys = {
  pendingMembers: ["oversight", "pending-members"] as const,
  openReports: ["oversight", "reports", "open"] as const,
};

export type PendingMember = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

// Members awaiting approval (pastor/admin only; RLS/RPC enforce it). Pass
// `enabled=false` for non-admin leaders so we don't fire an unauthorized RPC.
export function usePendingMembers(enabled = true) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: oversightKeys.pendingMembers,
    enabled: !!authId && enabled,
    queryFn: async (): Promise<PendingMember[]> => {
      const { data, error } = await supabase.rpc("list_pending_members");
      if (error) throw error;
      return (data ?? []) as PendingMember[];
    },
  });
}

export function useApproveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      userId: string;
      campusId: string;
    }): Promise<void> => {
      const { error } = await supabase.rpc("approve_member", {
        p_user: args.userId,
        p_campus: args.campusId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oversightKeys.pendingMembers });
    },
  });
}

export function useRejectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      const { error } = await supabase.rpc("reject_member", { p_user: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oversightKeys.pendingMembers });
    },
  });
}

// Open flags/reports (pastor/admin only; parish-scoped by RLS).
export function useOpenReports(enabled = true) {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: oversightKeys.openReports,
    enabled: !!authId && enabled,
    queryFn: async (): Promise<Report[]> => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      reportId: string;
      status: "reviewing" | "resolved" | "dismissed";
    }): Promise<void> => {
      const { error } = await supabase.rpc("resolve_report", {
        p_report: args.reportId,
        p_status: args.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oversightKeys.openReports });
    },
  });
}
