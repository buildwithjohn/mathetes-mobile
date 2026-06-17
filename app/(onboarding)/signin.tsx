import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/TextField";
import { SocialAuth } from "@/components/SocialAuth";
import { useAuth } from "@/lib/stores/auth";
import { colors } from "@/theme/colors";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

type Form = z.infer<typeof schema>;

export default function SignIn() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const resetPassword = useAuth((s) => s.resetPassword);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onForgotPassword = async () => {
    const email = getValues("email").trim();
    if (!z.string().email().safeParse(email).success) {
      Alert.alert(
        "Enter your email",
        "Type your email in the field above first, then tap Forgot password."
      );
      return;
    }
    const { error } = await resetPassword(email);
    if (error) {
      Alert.alert("Could not send", error);
    } else {
      Alert.alert(
        "Check your email",
        "We sent a link to reset your password. Open it on this phone to continue."
      );
    }
  };

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setSubmitError(error);
      return;
    }
    router.replace("/(auth)/(tabs)/today");
  });

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="px-6 pb-10 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => router.back()}
            className="-ml-2 h-11 w-11 items-center justify-center"
            accessibilityLabel="Go back"
          >
            <ChevronLeft color={colors.ink} size={26} />
          </Pressable>

          <Text
            className="mt-2 font-sans-medium text-[11px] uppercase text-ink-mute"
            style={{ letterSpacing: 1.76 }}
          >
            Sign in
          </Text>
          <Text className="mt-1.5 font-display text-[32px] leading-9 text-ink">
            Welcome{" "}
            <Text className="font-display-italic text-copper-deep">back</Text>.
          </Text>
          <Text className="mt-2 text-sm leading-5 text-ink-mute">
            Your notes, highlights and streak, kept quietly. Sign in once, return
            any morning.
          </Text>

          <View className="mt-8 gap-4">
            <TextField
              control={control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email?.message}
            />
            <TextField
              control={control}
              name="password"
              label="Password"
              placeholder="Your password"
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              error={errors.password?.message}
            />
          </View>

          <Pressable onPress={onForgotPassword} className="mt-3 self-end py-1">
            <Text className="text-sm font-sans-medium text-copper-deep">
              Forgot password?
            </Text>
          </Pressable>

          {submitError ? (
            <Text className="mt-4 text-sm text-oxblood">{submitError}</Text>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting}
            className="mt-6 h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.parchment} />
            ) : (
              <Text className="font-sans-semibold text-base text-parchment">
                Sign in
              </Text>
            )}
          </Pressable>

          <View className="mt-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-rule" />
            <Text
              className="text-xs uppercase text-ink-mute"
              style={{ letterSpacing: 1.92 }}
            >
              or
            </Text>
            <View className="h-px flex-1 bg-rule" />
          </View>

          <View className="mt-6">
            <SocialAuth />
          </View>

          {/* Quiet privacy note */}
          <View className="mt-9 rounded-[14px] border border-rule bg-paper px-4 py-3.5">
            <Text
              className="mb-1.5 font-sans-medium text-[11px] uppercase text-copper-deep"
              style={{ letterSpacing: 1.76 }}
            >
              A note
            </Text>
            <Text className="text-[13px] leading-5 text-ink-soft">
              Mathetes never sells your reading. Your notes are private to you,
              and to your group leader only if you choose.
            </Text>
          </View>

          <Pressable
            onPress={() => router.replace("/(onboarding)/signup")}
            className="mt-6 py-2"
          >
            <Text className="text-center text-sm text-ink-mute">
              New here?{" "}
              <Text className="font-sans-medium text-copper-deep">
                Create an account
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
