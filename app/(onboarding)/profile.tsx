import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateProfile } from "@/lib/queries/profile";
import { colors } from "@/theme/colors";
import type { Gender } from "@/lib/database.types";

const GENDERS: { key: Gender; label: string }[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

// Final onboarding step: a little about the member. Gender is required because
// it powers the cross-gender DM guardrail; level and department are optional
// and help the parish directory.
export default function OnboardingProfile() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [gender, setGender] = useState<Gender | null>(null);
  const [year, setYear] = useState("");
  const [dept, setDept] = useState("");

  const next = () => router.replace("/(onboarding)/notify");

  const onContinue = async () => {
    if (!gender) return;
    try {
      await updateProfile.mutateAsync({
        gender,
        year: year.trim() || null,
        dept: dept.trim() || null,
      });
      next();
    } catch {
      // Error surfaced in the banner below.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4 pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xs uppercase tracking-[3px] text-copper">
            Step 3 of 3
          </Text>
          <Text className="mt-2 font-display text-4xl text-ink">About you</Text>
          <Text className="mt-2 text-base leading-6 text-ink/70">
            A few details so your house and the parish directory know you. You
            can change these anytime.
          </Text>

          <View className="mt-8 gap-1.5">
            <Text className="font-sans-medium text-sm text-ink">Gender</Text>
            <Segmented options={GENDERS} value={gender} onChange={setGender} />
            <Text className="text-xs text-ink/50">
              Used for the parish's cross-gender messaging safeguards.
            </Text>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-sm text-ink">Level</Text>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 200 Level"
                placeholderTextColor="#9C968A"
                className="rounded-xl border border-border bg-surface1 px-4 py-3.5 text-base text-ink"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-sm text-ink">
                Department
              </Text>
              <TextInput
                value={dept}
                onChangeText={setDept}
                placeholder="e.g. Nursing"
                placeholderTextColor="#9C968A"
                autoCapitalize="words"
                className="rounded-xl border border-border bg-surface1 px-4 py-3.5 text-base text-ink"
              />
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-border bg-parchment px-6 pb-8 pt-4">
          {updateProfile.isError ? (
            <Text className="mb-3 text-center text-sm text-oxblood">
              {updateProfile.error instanceof Error
                ? updateProfile.error.message
                : "Could not save. Please try again."}
            </Text>
          ) : null}
          <Pressable
            onPress={onContinue}
            disabled={!gender || updateProfile.isPending}
            className="h-14 items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-40"
          >
            {updateProfile.isPending ? (
              <ActivityIndicator color={colors.parchment} />
            ) : (
              <Text className="font-sans-semibold text-base text-parchment">
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row rounded-full bg-surface2 p-1">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            className={`flex-1 items-center rounded-full py-2.5 ${
              active ? "bg-surface1" : ""
            }`}
          >
            <Text
              className={`font-sans-medium text-sm ${
                active ? "text-ink" : "text-ink/50"
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
