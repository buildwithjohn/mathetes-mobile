import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Production redirect targets (Supabase Site URL is the bare origin, so each
// flow passes its own redirect).
const CONFIRM_URL = "https://mathetes.live/confirmed";
const RESET_URL = "mathetes://reset-password";

type AuthState = {
  session: Session | null;
  initializing: boolean;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  session: null,
  initializing: true,
  setSession: (session) => set({ session, initializing: false }),

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signUp: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: CONFIRM_URL },
    });
    // When email confirmation is required, Supabase returns a user but no
    // session. Surface that so onboarding can show a "confirm your email"
    // screen instead of a session-less (blank) house picker.
    return {
      error: error?.message ?? null,
      needsConfirmation: !error && !data.session,
    };
  },

  // Sends a reset link that deep-links back into the app (mathetes://
  // reset-password); the app handles the PASSWORD_RECOVERY event.
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: RESET_URL,
    });
    return { error: error?.message ?? null };
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
