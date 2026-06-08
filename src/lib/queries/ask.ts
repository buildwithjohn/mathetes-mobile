import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type { AskQuestion, PublicQa } from "@/lib/database.types";

export const askKeys = {
  mine: ["ask", "mine"] as const,
  publicQa: ["ask", "public"] as const,
};

// The caller's own questions (any status), newest first.
export function useMyQuestions() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: askKeys.mine,
    enabled: !!authId,
    queryFn: async (): Promise<AskQuestion[]> => {
      const { data, error } = await supabase
        .from("ask_questions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Answered, public questions with the asker anonymized (served by the
// public_qa view), newest answers first.
export function usePublicQa() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: askKeys.publicQa,
    enabled: !!authId,
    queryFn: async (): Promise<PublicQa[]> => {
      const { data, error } = await supabase
        .from("public_qa")
        .select("*")
        .order("answered_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubmitQuestion() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      body: string;
      category?: string | null;
      privacy: "public" | "private";
      urgent: boolean;
    }): Promise<void> => {
      if (!profile?.parish_id) throw new Error("No parish.");
      const { error } = await supabase.from("ask_questions").insert({
        parish_id: profile.parish_id,
        asker_id: profile.id,
        body: args.body.trim(),
        category: args.category ?? null,
        privacy: args.privacy,
        urgent: args.urgent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: askKeys.mine });
    },
  });
}

// Withdraw a still-unanswered question.
export function useWithdrawQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("ask_questions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: askKeys.mine });
    },
  });
}
