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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

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

          <Text className="mt-2 font-display text-4xl text-ink">
            Welcome back
          </Text>
          <Text className="mt-2 text-base text-ink/70">
            Pick up where you left off.
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

          <Pressable
            onPress={() =>
              Alert.alert(
                "Reset password",
                "Password reset by email is coming soon. Reach a house leader if you are locked out."
              )
            }
            className="mt-3 self-end py-1"
          >
            <Text className="text-sm font-sans-medium text-copper">
              Forgot password?
            </Text>
          </Pressable>

          {submitError ? (
            <Text className="mt-4 text-sm text-oxblood">{submitError}</Text>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting}
            className="mt-6 h-14 items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-60"
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
            <View className="h-px flex-1 bg-border" />
            <Text className="text-xs uppercase tracking-widest text-ink/40">
              or
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <Pressable
            onPress={() =>
              Alert.alert(
                "Google sign-in",
                "Continue with Google is coming soon. Use your email for now."
              )
            }
            className="mt-6 h-14 items-center justify-center rounded-full border border-border bg-surface1 active:opacity-70"
          >
            <Text className="font-sans-semibold text-base text-ink">
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(onboarding)/signup")}
            className="mt-6 py-2"
          >
            <Text className="text-center text-sm text-ink/60">
              New here?{" "}
              <Text className="font-sans-medium text-copper">
                Create an account
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
