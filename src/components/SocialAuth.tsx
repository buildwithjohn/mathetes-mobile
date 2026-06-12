import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import Svg, { Path } from "react-native-svg";
import {
  signInWithGoogle,
  signInWithApple,
  appleAuthAvailable,
} from "@/lib/oauth";
import { colors } from "@/theme/colors";

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}

// Google + Apple (iOS) sign-in buttons. On success the auth listener sets the
// session; we route into the app and AuthGate sends new users to onboarding.
export function SocialAuth() {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "google" | "apple">(null);

  const run = async (which: "google" | "apple", fn: () => Promise<void>) => {
    try {
      setBusy(which);
      await fn();
      router.replace("/(auth)/(tabs)/today");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed.";
      if (!/cancel/i.test(msg)) {
        Alert.alert("Could not sign in", msg);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <View className="gap-3">
      <Pressable
        onPress={() => run("google", signInWithGoogle)}
        disabled={busy !== null}
        className="h-14 flex-row items-center justify-center gap-3 rounded-full border border-border bg-surface1 active:opacity-70 disabled:opacity-50"
      >
        {busy === "google" ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <>
            <GoogleIcon />
            <Text className="font-sans-semibold text-base text-ink">
              Continue with Google
            </Text>
          </>
        )}
      </Pressable>

      {appleAuthAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={28}
          style={{ height: 56, width: "100%" }}
          onPress={() => run("apple", signInWithApple)}
        />
      ) : null}
    </View>
  );
}
