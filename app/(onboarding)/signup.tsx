import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
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

const schema = z
  .object({
    name: z.string().trim().min(2, "Tell us your name."),
    email: z.string().trim().email("Enter a valid email."),
    password: z.string().min(8, "At least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type Form = z.infer<typeof schema>;

export default function SignUp() {
  const router = useRouter();
  const signUp = useAuth((s) => s.signUp);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setSubmitError(null);
    const { error } = await signUp(name, email, password);
    if (error) {
      setSubmitError(error);
      return;
    }
    // The backend trigger creates the profile + privacy rows. Continue to
    // campus selection (which skips to house if no campuses are configured).
    router.replace("/(onboarding)/campus");
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
            Create your account
          </Text>
          <Text className="mt-2 text-base text-ink/70">
            Begin the walk. It takes a moment.
          </Text>

          <View className="mt-8 gap-4">
            <TextField
              control={control}
              name="name"
              label="Full name"
              placeholder="Tope Adeyemi"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.name?.message}
            />
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
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="password-new"
              error={errors.password?.message}
            />
            <TextField
              control={control}
              name="confirm"
              label="Confirm password"
              placeholder="Re-enter your password"
              secureTextEntry
              error={errors.confirm?.message}
            />
          </View>

          {submitError ? (
            <Text className="mt-4 text-sm text-oxblood">{submitError}</Text>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting}
            className="mt-8 h-14 items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.parchment} />
            ) : (
              <Text className="font-sans-semibold text-base text-parchment">
                Continue
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(onboarding)/signin")}
            className="mt-6 py-2"
          >
            <Text className="text-center text-sm text-ink/60">
              Already have an account?{" "}
              <Text className="font-sans-medium text-copper">Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
