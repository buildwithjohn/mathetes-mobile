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
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { colors } from "@/theme/colors";
import type { Gender } from "@/lib/database.types";

const GENDERS: { key: Gender; label: string }[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

// Parse a typed DD/MM/YYYY into an ISO date string, or null if invalid.
function dobToISO(s: string): string | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const thisYear = new Date().getFullYear();
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 1900 || year > thisYear) return null;
  const iso = `${yyyy}-${mm}-${dd}`;
  const dt = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dt.getTime()) || dt.getUTCDate() !== day) return null;
  return iso;
}

// Final onboarding step: a little about the member. Gender is required because
// it powers the cross-gender DM guardrail; level and department are optional
// and help the parish directory.
export default function OnboardingProfile() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [gender, setGender] = useState<Gender | null>(null);
  const [dob, setDob] = useState(""); // DD/MM/YYYY as typed
  const [phone, setPhone] = useState("");
  const [year, setYear] = useState("");
  const [dept, setDept] = useState("");

  const next = () => router.replace("/(onboarding)/notify");

  const onDobChange = (t: string) => {
    const digits = t.replace(/\D/g, "").slice(0, 8);
    let out = digits;
    if (digits.length > 4)
      out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2)
      out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setDob(out);
  };

  const dobValid = dobToISO(dob) !== null;

  const onContinue = async () => {
    if (!gender || !dobValid) return;
    try {
      await updateProfile.mutateAsync({
        gender,
        date_of_birth: dobToISO(dob),
        phone: phone.trim() || null,
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
          <OnboardingProgress step={3} total={3} />
          <Text
            className="mt-7 font-sans-medium text-[11px] uppercase text-ink-mute"
            style={{ letterSpacing: 1.76 }}
          >
            A little about you
          </Text>
          <Text className="mt-2 font-display text-[28px] leading-[33px] text-ink">
            About{" "}
            <Text className="font-display-italic text-copper-deep">you</Text>.
          </Text>
          <Text className="mt-1.5 text-sm leading-5 text-ink-mute">
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
              <Text className="font-sans-medium text-sm text-ink">
                Date of birth
              </Text>
              <TextInput
                value={dob}
                onChangeText={onDobChange}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9C968A"
                keyboardType="number-pad"
                maxLength={10}
                className="rounded-xl border border-rule bg-paper px-4 py-3.5 text-base text-ink"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-sm text-ink">Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="080..."
                placeholderTextColor="#9C968A"
                keyboardType="phone-pad"
                className="rounded-xl border border-rule bg-paper px-4 py-3.5 text-base text-ink"
              />
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-sm text-ink">Level</Text>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 200 Level"
                placeholderTextColor="#9C968A"
                className="rounded-xl border border-rule bg-paper px-4 py-3.5 text-base text-ink"
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
                className="rounded-xl border border-rule bg-paper px-4 py-3.5 text-base text-ink"
              />
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-rule-soft bg-parchment px-6 pb-8 pt-4">
          {updateProfile.isError ? (
            <Text className="mb-3 text-center text-sm text-oxblood">
              {updateProfile.error instanceof Error
                ? updateProfile.error.message
                : "Could not save. Please try again."}
            </Text>
          ) : null}
          <Pressable
            onPress={onContinue}
            disabled={!gender || !dobValid || updateProfile.isPending}
            className="h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90 disabled:opacity-40"
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
              active ? "bg-paper" : ""
            }`}
          >
            <Text
              className={`font-sans-medium text-sm ${
                active ? "text-ink" : "text-ink-mute"
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
