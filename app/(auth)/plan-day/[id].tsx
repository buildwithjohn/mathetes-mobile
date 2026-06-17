import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Check } from "lucide-react-native";
import { usePlanDay, useCompletePlanDay } from "@/lib/queries/readingPlans";
import { AudioPlayer } from "@/components/AudioPlayer";
import { paragraphs } from "@/utils/text";
import { colors } from "@/theme/colors";

export default function PlanDayReader() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    planId?: string;
    dayNumber?: string;
  }>();
  const dayId = params.id ?? "";
  const planId = params.planId ?? "";

  const { data: day, isLoading, isError } = usePlanDay(dayId);
  const complete = useCompletePlanDay(planId);

  const [reflection, setReflection] = useState("");
  const [share, setShare] = useState(false);

  const onComplete = () => {
    complete.mutate(
      {
        dayId,
        reflection: reflection.trim() || null,
        shareWithDiscipler: share,
      },
      {
        onSuccess: () => {
          Alert.alert("Day complete", "Well done. See you tomorrow.");
          router.back();
        },
        onError: (e) =>
          Alert.alert(
            "Could not save",
            e instanceof Error ? e.message : "Please try again."
          ),
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-1 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || !day ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink-mute">
            We could not load this day.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-7 pb-16 pt-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              className="font-sans-medium text-[11px] uppercase text-copper-deep"
              style={{ letterSpacing: 1.76 }}
            >
              Day {params.dayNumber ?? day.day_number}
            </Text>
            <Text className="mb-3.5 mt-2 font-display text-[30px] leading-[34px] text-ink">
              {day.title}
            </Text>

            {day.audio_url ? <AudioPlayer url={day.audio_url} /> : null}

            {/* Scripture */}
            <View className="mt-5 rounded-[14px] border-l-2 border-l-oxblood bg-paper px-5 py-5">
              <Text
                className="mb-2 font-sans-semibold text-[11px] uppercase text-oxblood"
                style={{ letterSpacing: 1.98 }}
              >
                {day.scripture_reference}
              </Text>
              {day.scripture_text ? (
                <Text className="font-scripture text-[17px] leading-[27px] text-ink-soft">
                  {day.scripture_text}
                </Text>
              ) : null}
            </View>

            {/* Reflection body */}
            <View className="mt-7">
              {paragraphs(day.reflection_body).map((p, i) => (
                <Text
                  key={i}
                  className="mb-4 font-scripture text-[18px] leading-[30px] text-ink"
                >
                  {p}
                </Text>
              ))}
            </View>

            {/* Prompt */}
            <View className="mt-2 rounded-2xl bg-paper-raised px-[22px] py-5">
              <Text
                className="mb-2.5 font-sans-medium text-[11px] uppercase text-copper-deep"
                style={{ letterSpacing: 1.76 }}
              >
                Sit with this
              </Text>
              <Text className="font-display-italic text-[19px] leading-[27px] text-ink">
                {day.reflection_prompt}
              </Text>
            </View>

            {/* Private reflection */}
            <Text className="mb-2 mt-7 font-sans-medium text-sm text-ink">
              Your reflection
            </Text>
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="Write what the Lord is showing you (private)."
              placeholderTextColor={colors.inkMute}
              multiline
              textAlignVertical="top"
              className="min-h-28 rounded-2xl border border-rule bg-paper px-4 py-3 text-base text-ink"
            />
            <Text className="mt-1.5 text-[11.5px] text-ink-mute">
              Private to you. You can choose to share this one reflection with
              your discipler below.
            </Text>

            <Pressable
              onPress={() => setShare((s) => !s)}
              className="mt-3 flex-row items-center justify-between rounded-2xl border border-rule bg-paper px-4 py-3 active:opacity-80"
            >
              <Text className="flex-1 pr-3 text-[15px] text-ink">
                Share this reflection with my discipler
              </Text>
              <View
                className="h-6 w-6 items-center justify-center rounded-md border"
                style={{
                  backgroundColor: share ? colors.copper : "transparent",
                  borderColor: share ? colors.copper : colors.rule,
                }}
              >
                {share ? <Check color="#fff" size={15} strokeWidth={2.4} /> : null}
              </View>
            </Pressable>

            {/* Optional deep-link to a full devotional */}
            {day.devotional_id ? (
              <Pressable
                onPress={() => router.push(`/devotional/${day.devotional_id}`)}
                className="mt-4 flex-row items-center gap-2 self-start active:opacity-70"
              >
                <Text className="text-[13px] font-sans-medium text-copper-deep">
                  Read the full devotional
                </Text>
                <ChevronRight color={colors.copperDeep} size={15} strokeWidth={1.8} />
              </Pressable>
            ) : null}

            <Pressable
              onPress={onComplete}
              disabled={complete.isPending}
              className="mt-7 h-[52px] items-center justify-center rounded-full bg-ink active:opacity-90 disabled:opacity-50"
            >
              {complete.isPending ? (
                <ActivityIndicator color={colors.parchment} />
              ) : (
                <Text className="font-sans-semibold text-base text-parchment">
                  Mark day complete
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
