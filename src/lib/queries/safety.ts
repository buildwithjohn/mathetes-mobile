import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type { ReportTargetType } from "@/lib/database.types";

export const safetyKeys = {
  blocks: ["safety", "blocks"] as const,
};

// The set of profile ids the caller has blocked.
export function useBlocks() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: safetyKeys.blocks,
    enabled: !!authId,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("blocks")
        .select("blocked_id");
      if (error) throw error;
      return (data ?? []).map((b) => b.blocked_id);
    },
  });
}

export function useToggleBlock() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      blockedId: string;
      on: boolean;
    }): Promise<void> => {
      if (!profile) throw new Error("No profile.");
      if (args.on) {
        const { error } = await supabase
          .from("blocks")
          .insert({ blocker_id: profile.id, blocked_id: args.blockedId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blocks")
          .delete()
          .eq("blocker_id", profile.id)
          .eq("blocked_id", args.blockedId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.blocks });
      // Blocked authors' messages are hidden by RLS, so refresh threads.
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

// File a report against a message, user, prayer request, or question. Read and
// resolved by parish admins (pastoral oversight).
export function useReport() {
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      targetType: ReportTargetType;
      targetId: string;
      reason?: string;
    }): Promise<void> => {
      if (!profile?.parish_id) throw new Error("No parish.");
      const { error } = await supabase.from("reports").insert({
        parish_id: profile.parish_id,
        reporter_id: profile.id,
        target_type: args.targetType,
        target_id: args.targetId,
        reason: args.reason ?? null,
      });
      if (error) throw error;
    },
  });
}
