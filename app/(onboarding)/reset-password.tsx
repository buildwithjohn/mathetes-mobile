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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/lib/stores/auth";
import { colors } from "@/theme/colors";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type Form = z.infer<typeof schema>;

// Reached from the password-reset deep link (PASSWORD_RECOVERY). The recovery
// session is already active, so we just set the new password.
export default function ResetPassword() {
  const router = useRouter();
  const updatePassword = useAuth((s) => s.updatePassword);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setSubmitError(null);
    const { error } = await updatePassword(password);
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
          contentContainerClassName="px-6 pb-10 pt-8"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="font-display text-4xl text-ink">
            Set a new password
          </Text>
          <Text className="mt-2 text-base text-ink/70">
            Choose a new password to get back into your account.
          </Text>

          <View className="mt-8 gap-4">
            <TextField
              control={control}
              name="password"
              label="New password"
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={errors.password?.message}
            />
            <TextField
              control={control}
              name="confirm"
              label="Confirm password"
              placeholder="Re-enter your password"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
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
                Save new password
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
