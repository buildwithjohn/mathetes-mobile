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
import { ChevronLeft, Plus, X, Check, Clock } from "lucide-react-native";
import {
  useMyQuestions,
  usePublicQa,
  useSubmitQuestion,
  useWithdrawQuestion,
} from "@/lib/queries/ask";
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
      <View className="flex-row items-center px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="flex-1 font-display text-xl text-ink">Ask Pastor</Text>
        <Pressable
          onPress={() => setComposing(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-copper active:opacity-90"
          accessibilityLabel="Ask a question"
        >
          <Plus color={colors.parchment} size={22} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="mx-4 mb-1 mt-1 flex-row rounded-full bg-surface2 p-1">
        {(["mine", "public"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 items-center rounded-full py-2 ${
              tab === t ? "bg-surface1" : ""
            }`}
          >
            <Text
              className={`font-sans-medium text-sm ${
                tab === t ? "text-ink" : "text-ink/50"
              }`}
            >
              {t === "mine" ? "My questions" : "Public Q&A"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-16 pt-2 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {tab === "mine" ? (
          mine.isLoading ? (
            <ActivityIndicator className="mt-10" color={colors.copper} />
          ) : (mine.data ?? []).length === 0 ? (
            <EmptyHint
              title="Ask in confidence"
              body="Your question goes to the pastor, who answers within 48 hours. Choose to keep it private or share the answer anonymously."
            />
          ) : (
            (mine.data ?? []).map((q) => <MyQuestionCard key={q.id} q={q} />)
          )
        ) : publicQa.isLoading ? (
          <ActivityIndicator className="mt-10" color={colors.copper} />
        ) : (publicQa.data ?? []).length === 0 ? (
          <EmptyHint
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

function EmptyHint({ title, body }: { title: string; body: string }) {
  return (
    <View className="mt-16 items-center px-8">
      <Text className="text-center font-display text-xl text-ink">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-ink/60">
        {body}
      </Text>
    </View>
  );
}

function MyQuestionCard({ q }: { q: AskQuestion }) {
  const withdraw = useWithdrawQuestion();
  const answered = q.status === "answered";
  return (
    <View className="rounded-2xl border border-border bg-surface1 p-4">
      <View className="flex-row items-center justify-between">
        <View
          className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${
            answered ? "bg-copper/15" : "bg-surface2"
          }`}
        >
          {answered ? (
            <Check color={colors.copper} size={13} />
          ) : (
            <Clock color={colors.ink} size={13} />
          )}
          <Text
            className={`text-xs font-sans-medium ${
              answered ? "text-copper" : "text-ink/70"
            }`}
          >
            {answered ? "Answered" : "Awaiting"}
          </Text>
        </View>
        <Text className="text-xs text-ink/40">
          {q.privacy === "public" ? "Public" : "Private"}
        </Text>
      </View>

      <Text className="mt-2 text-base leading-6 text-ink">{q.body}</Text>

      {answered && q.response_body ? (
        <View className="mt-3 rounded-xl border-l-4 border-l-copper bg-parchment p-3">
          <Text className="text-xs uppercase tracking-widest text-copper">
            Pastor
          </Text>
          <Text className="mt-1 text-base leading-6 text-ink/90">
            {q.response_body}
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => withdraw.mutate(q.id)}
          className="mt-3 self-start active:opacity-60"
        >
          <Text className="text-sm font-sans-medium text-oxblood">Withdraw</Text>
        </Pressable>
      )}
    </View>
  );
}

function PublicQaCard({ q }: { q: PublicQa }) {
  return (
    <View className="rounded-2xl border border-border bg-surface1 p-4">
      {q.category ? (
        <Text className="text-xs uppercase tracking-widest text-copper">
          {q.category}
        </Text>
      ) : null}
      <Text className="mt-1 font-display text-lg leading-7 text-ink">
        {q.question}
      </Text>
      {q.answer ? (
        <Text className="mt-2 text-base leading-6 text-ink/85">{q.answer}</Text>
      ) : null}
      {q.answered_at ? (
        <Text className="mt-3 text-xs text-ink/40">
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
            className="min-h-28 rounded-2xl border border-border bg-parchment px-4 py-3 text-base text-ink"
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
          value ? "border-copper bg-copper" : "border-border bg-surface1"
        }`}
      >
        {value ? <Check color={colors.parchment} size={15} /> : null}
      </View>
    </Pressable>
  );
}
