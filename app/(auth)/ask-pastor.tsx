import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import {
  ChevronLeft,
  Plus,
  X,
  Check,
  Clock,
  MessageCircleQuestion,
} from "lucide-react-native";
import {
  useMyQuestions,
  usePublicQa,
  useSubmitQuestion,
  useWithdrawQuestion,
} from "@/lib/queries/ask";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import type { AskQuestion, PublicQa } from "@/lib/database.types";

type Tab = "mine" | "public";

export default function AskPastor() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("mine");
  const [composing, setComposing] = useState(false);

  const mine = useMyQuestions();
  const publicQa = usePublicQa();

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center gap-1 border-b border-rule-soft px-1 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="flex-1 text-center font-display text-[18px] text-ink">
          Ask Pastor
        </Text>
        <Pressable
          onPress={() => setComposing(true)}
          className="h-[34px] w-[34px] items-center justify-center rounded-full bg-copper active:opacity-90"
          accessibilityLabel="Ask a question"
        >
          <Plus color="#fff" size={18} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Tabs (underline) */}
      <View className="flex-row gap-6 border-b border-rule-soft px-6">
        {(["mine", "public"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`py-2.5 ${tab === t ? "-mb-px border-b-2 border-b-copper" : ""}`}
          >
            <Text
              className={`text-[13.5px] ${
                tab === t
                  ? "font-sans-semibold text-ink"
                  : "font-sans-medium text-ink-mute"
              }`}
            >
              {t === "mine" ? "My questions" : "Public Q&A"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-16 pt-3 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="rounded-2xl border border-rule-soft bg-paper p-5">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full" style={{ backgroundColor: `${colors.copper}1F` }}>
            <MessageCircleQuestion color={colors.copper} size={26} strokeWidth={1.7} />
          </View>
          <Text className="mt-3.5 font-display text-[22px] text-ink">
            Bring your questions
          </Text>
          <Text className="mt-1.5 text-[13.5px] leading-5 text-ink-soft">
            The pastor responds within 48 hours. Your question may also help your
            house-mates if you choose to share the answer anonymously.
          </Text>
        </View>

        {tab === "mine" ? (
          mine.isLoading ? (
            <ActivityIndicator className="mt-10" color={colors.copper} />
          ) : (mine.data ?? []).length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Ask in confidence"
              body="Your question goes to the pastor, who answers within 48 hours. Choose to keep it private or share the answer anonymously."
            />
          ) : (
            (mine.data ?? []).map((q) => <MyQuestionCard key={q.id} q={q} />)
          )
        ) : publicQa.isLoading ? (
          <ActivityIndicator className="mt-10" color={colors.copper} />
        ) : (publicQa.data ?? []).length === 0 ? (
          <EmptyState
            icon={MessageCircleQuestion}
            title="No public answers yet"
            body="Answers the pastor chooses to share appear here, with the asker kept anonymous."
          />
        ) : (
          (publicQa.data ?? []).map((q) => <PublicQaCard key={q.id} q={q} />)
        )}
      </ScrollView>

      <ComposeModal visible={composing} onClose={() => setComposing(false)} />
    </SafeAreaView>
  );
}

function MyQuestionCard({ q }: { q: AskQuestion }) {
  const withdraw = useWithdrawQuestion();
  const answered = q.status === "answered";
  return (
    <View className="rounded-2xl border border-rule bg-paper p-4">
      <View className="mb-2 flex-row items-center gap-1.5">
        {answered ? (
          <Check color={colors.success} size={15} strokeWidth={2.2} />
        ) : (
          <Clock color={colors.inkMute} size={14} strokeWidth={1.7} />
        )}
        <Text
          className="text-[11.5px] font-sans-medium"
          style={{ color: answered ? colors.success : colors.inkMute }}
        >
          {answered ? "Answered" : "Awaiting response"}
        </Text>
      </View>

      <Text className="text-[14.5px] font-sans-medium leading-5 text-ink">
        {q.body}
      </Text>

      {answered && q.response_body ? (
        <Text className="mt-2 font-display text-[13.5px] italic leading-5 text-ink-soft">
          {q.response_body}
        </Text>
      ) : null}

      <View className="mt-3 flex-row items-center">
        <Text className="text-[11px] text-ink-mute">
          {q.privacy === "public" ? "Public" : "Private"}
        </Text>
        {!answered ? (
          <Pressable
            onPress={() => withdraw.mutate(q.id)}
            className="ml-auto active:opacity-60"
          >
            <Text className="text-[12px] font-sans-medium text-oxblood">
              Withdraw
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function PublicQaCard({ q }: { q: PublicQa }) {
  return (
    <View className="rounded-2xl border border-rule bg-paper p-4">
      {q.category ? (
        <Text
          className="font-sans-medium text-[11px] uppercase text-copper-deep"
          style={{ letterSpacing: 1.6 }}
        >
          {q.category}
        </Text>
      ) : null}
      <Text className="mt-1 font-display text-lg leading-7 text-ink">
        {q.question}
      </Text>
      {q.answer ? (
        <Text className="mt-2 font-display text-[14px] italic leading-[21px] text-ink-soft">
          {q.answer}
        </Text>
      ) : null}
      {q.answered_at ? (
        <Text className="mt-3 text-[11px] text-ink-faint">
          {format(new Date(q.answered_at), "d MMM yyyy")}
        </Text>
      ) : null}
    </View>
  );
}

function ComposeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const submit = useSubmitQuestion();
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const onSubmit = () => {
    if (!body.trim()) return;
    submit.mutate(
      { body, privacy: isPublic ? "public" : "private", urgent },
      {
        onSuccess: () => {
          setBody("");
          setIsPublic(false);
          setUrgent(false);
          onClose();
          Alert.alert(
            "Question sent",
            "The pastor will respond within 48 hours."
          );
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-3xl bg-surface1 px-6 pb-10 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-display text-xl text-ink">Ask the pastor</Text>
            <Pressable onPress={onClose} className="p-1">
              <X color={colors.ink} size={22} />
            </Pressable>
          </View>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Ask anything on your heart."
            placeholderTextColor="#9C968A"
            multiline
            className="min-h-28 rounded-2xl border border-rule bg-parchment px-4 py-3 text-base text-ink"
            textAlignVertical="top"
          />

          <View className="mt-4 gap-2">
            <ToggleRow
              label="Share answer publicly (anonymous)"
              value={isPublic}
              onChange={setIsPublic}
            />
            <ToggleRow label="Mark urgent" value={urgent} onChange={setUrgent} />
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={!body.trim() || submit.isPending}
            className="mt-5 h-13 items-center justify-center rounded-full bg-copper py-3.5 active:opacity-90 disabled:opacity-50"
          >
            {submit.isPending ? (
              <ActivityIndicator color={colors.parchment} />
            ) : (
              <Text className="font-sans-semibold text-base text-parchment">
                Send question
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between rounded-xl bg-surface2 px-4 py-3 active:opacity-80"
    >
      <Text className="text-base text-ink">{label}</Text>
      <View
        className={`h-6 w-6 items-center justify-center rounded-md border ${
          value ? "border-copper bg-copper" : "border-rule bg-surface1"
        }`}
      >
        {value ? <Check color={colors.parchment} size={15} /> : null}
      </View>
    </Pressable>
  );
}
