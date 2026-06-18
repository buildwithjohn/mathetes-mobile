import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import {
  ChevronRight,
  MessageCircleQuestion,
  HeartHandshake,
  Users,
  Megaphone,
  X,
  Check,
  Eye,
} from "lucide-react-native";
import { useProfile } from "@/lib/queries/profile";
import {
  usePendingQuestions,
  useAnswerQuestion,
} from "@/lib/queries/ask";
import { colors } from "@/theme/colors";
import type { AskQuestion } from "@/lib/database.types";

const ROLE_LABEL: Record<string, string> = {
  house_leader: "House leader",
  discipler: "Discipler",
  pastor: "Pastor",
  admin: "Admin",
};

export default function Oversight() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const pending = usePendingQuestions();
  const [answering, setAnswering] = useState<AskQuestion | null>(null);

  const canAnswer = profile?.role === "pastor" || profile?.role === "admin";
  const questions = pending.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pb-1 pt-4">
        <Text className="font-display text-[23px] text-ink">Oversight</Text>
        {profile ? (
          <View className="rounded-full border border-rule px-3 py-1">
            <Text className="font-sans-medium text-[11px] uppercase text-copper-deep" style={{ letterSpacing: 0.8 }}>
              {ROLE_LABEL[profile.role] ?? "Leader"}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={pending.isRefetching}
            onRefresh={() => pending.refetch()}
            tintColor={colors.copper}
          />
        }
      >
        {/* Guardrail note */}
        <View className="mx-5 mt-2 flex-row items-start gap-2 rounded-[14px] px-4 py-3" style={{ backgroundColor: `${colors.copper}12` }}>
          <Eye color={colors.copperDeep} size={14} strokeWidth={1.7} style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] leading-[18px] text-ink-soft">
            Pastoral oversight, not surveillance. You see what you're meant to
            care for; private messages stay private unless a concern is raised.
          </Text>
        </View>

        {/* Ask Pastor answering */}
        {canAnswer ? (
          <>
            <SectionLabel>Ask Pastor · to answer</SectionLabel>
            {pending.isLoading ? (
              <ActivityIndicator className="mt-4" color={colors.copper} />
            ) : questions.length === 0 ? (
              <Text className="px-6 text-sm text-ink-mute">
                No questions waiting. You're all caught up.
              </Text>
            ) : (
              questions.map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => setAnswering(q)}
                  className="flex-row items-center gap-3 border-b border-rule-soft px-6 py-3.5 active:bg-surface2"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.copper}1F` }}>
                    <MessageCircleQuestion color={colors.copper} size={18} strokeWidth={1.7} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14.5px] text-ink" numberOfLines={2}>
                      {q.body}
                    </Text>
                    <Text className="mt-0.5 text-[11.5px] text-ink-mute">
                      {q.urgent ? "Urgent · " : ""}
                      {q.privacy === "public" ? "May be shared" : "Private"} ·{" "}
                      {format(new Date(q.created_at), "d MMM")}
                    </Text>
                  </View>
                  <ChevronRight color={colors.inkFaint} size={16} strokeWidth={1.5} />
                </Pressable>
              ))
            )}
          </>
        ) : null}

        {/* Surfaces the leader already has access to (RLS-scoped) */}
        <SectionLabel>Where you serve</SectionLabel>
        <EntryRow
          icon={Users}
          label="Conversations"
          sub="Houses, discipler chats and DMs you oversee"
          onPress={() => router.push("/(auth)/(tabs)/community")}
        />
        <EntryRow
          icon={HeartHandshake}
          label="Prayer wall"
          sub="Requests across the houses you care for"
          onPress={() => router.push("/prayer")}
        />
        <EntryRow
          icon={Megaphone}
          label="Announcements"
          sub="Parish notices"
          onPress={() => router.push("/announcements")}
        />

        {/* TODO(backend): member approvals queue + reports/flags inbox need
            confirmed RLS reads (pending profiles, reports) and the
            approve_member/reject_member RPCs; wire once confirmed. Management
            (create/edit/delete) stays in the admin portal. */}
      </ScrollView>

      <AnswerModal
        question={answering}
        onClose={() => setAnswering(null)}
      />
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="px-6 pb-2 pt-7 font-sans-medium text-[11px] uppercase text-ink-mute"
      style={{ letterSpacing: 1.6 }}
    >
      {children}
    </Text>
  );
}

function EntryRow({
  icon: Icon,
  label,
  sub,
  onPress,
}: {
  icon: typeof Users;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-6 py-3.5 active:bg-surface2"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-paper-raised">
        <Icon color={colors.inkSoft} size={18} strokeWidth={1.7} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-[14.5px] text-ink">{label}</Text>
        <Text className="mt-0.5 text-[12.5px] text-ink-mute">{sub}</Text>
      </View>
      <ChevronRight color={colors.inkFaint} size={16} strokeWidth={1.5} />
    </Pressable>
  );
}

function AnswerModal({
  question,
  onClose,
}: {
  question: AskQuestion | null;
  onClose: () => void;
}) {
  const answer = useAnswerQuestion();
  const [response, setResponse] = useState("");
  const [makePublic, setMakePublic] = useState(false);

  const onSend = () => {
    if (!question || !response.trim()) return;
    answer.mutate(
      { id: question.id, response, makePublic },
      {
        onSuccess: () => {
          setResponse("");
          setMakePublic(false);
          onClose();
          Alert.alert("Answer sent", "Your response has been delivered.");
        },
        onError: (e) =>
          Alert.alert(
            "Could not send",
            e instanceof Error ? e.message : "Please try again."
          ),
      }
    );
  };

  return (
    <Modal
      visible={!!question}
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
            <Text className="font-display text-xl text-ink">Answer</Text>
            <Pressable onPress={onClose} className="p-1">
              <X color={colors.ink} size={22} />
            </Pressable>
          </View>

          {question ? (
            <Text className="mb-3 text-[14px] leading-5 text-ink-soft">
              {question.body}
            </Text>
          ) : null}

          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder="Write your response."
            placeholderTextColor={colors.inkMute}
            multiline
            textAlignVertical="top"
            className="min-h-28 rounded-2xl border border-rule bg-parchment px-4 py-3 text-base text-ink"
          />

          <Pressable
            onPress={() => setMakePublic((v) => !v)}
            className="mt-3 flex-row items-center justify-between rounded-2xl border border-rule bg-paper px-4 py-3 active:opacity-80"
          >
            <Text className="flex-1 pr-3 text-[15px] text-ink">
              Share answer publicly (asker kept anonymous)
            </Text>
            <View
              className="h-6 w-6 items-center justify-center rounded-md border"
              style={{
                backgroundColor: makePublic ? colors.copper : "transparent",
                borderColor: makePublic ? colors.copper : colors.rule,
              }}
            >
              {makePublic ? <Check color="#fff" size={15} strokeWidth={2.4} /> : null}
            </View>
          </Pressable>

          <Pressable
            onPress={onSend}
            disabled={!response.trim() || answer.isPending}
            className="mt-5 h-[52px] items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-50"
          >
            {answer.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-sans-semibold text-base text-white">
                Send answer
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
