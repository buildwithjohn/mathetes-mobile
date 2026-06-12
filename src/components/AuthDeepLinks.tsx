import { useEffect } from "react";
import { useURL } from "expo-linking";
import { useRouter } from "expo-router";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { supabase } from "@/lib/supabase";

// Handles the password-reset deep link (mathetes://reset-password?code=...):
// exchanges the recovery code for a session, then navigates to the
// set-new-password screen when Supabase fires the PASSWORD_RECOVERY event.
export function AuthDeepLinks() {
  const url = useURL();
  const router = useRouter();

  useEffect(() => {
    if (!url || !url.includes("reset-password")) return;
    const { params } = getQueryParams(url);
    if (params.code) {
      supabase.auth.exchangeCodeForSession(params.code).catch(() => {});
    }
  }, [url]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/(onboarding)/reset-password");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
