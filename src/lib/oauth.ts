import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { supabase } from "@/lib/supabase";

// Required for the in-app auth browser to dismiss and return control.
WebBrowser.maybeCompleteAuthSession();

// In Expo Go this resolves to the Expo proxy URL; in a real build it resolves
// to the app's `mathetes://` scheme (configured in app.json).
const redirectTo = makeRedirectUri();

// Turn the OAuth redirect URL into a Supabase session (handles both the PKCE
// `code` flow and the implicit token flow).
async function createSessionFromUrl(url: string): Promise<void> {
  const { params, errorCode } = getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token, code } = params;
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return;
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }
}

// Google: open the Supabase OAuth URL in an in-app browser, then complete the
// session from the redirect. Works on Android and iOS.
export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("Could not start Google sign-in.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "success") {
    await createSessionFromUrl(result.url);
  } else {
    // cancel / dismiss: surface a benign, recognizable message.
    throw new Error("cancelled");
  }
}

// Apple sign-in is iOS-only (native).
export const appleAuthAvailable = Platform.OS === "ios";

export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) {
    throw new Error("No identity token from Apple.");
  }
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
  });
  if (error) throw error;

  // Apple returns the name only on the very first authorization; persist it.
  const name = [credential.fullName?.givenName, credential.fullName?.familyName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (name) {
    await supabase.auth.updateUser({ data: { name } });
  }
}
