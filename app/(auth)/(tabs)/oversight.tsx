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
  UserCheck,
  Flag,
} from "lucide-react-native";
import { useProfile, useCampuses } from "@/lib/queries/profile";
import {
  usePendingQuestions,
  useAnswerQuestion,
} from "@/lib/queries/ask";
import {
  usePendingMembers,
  useApproveMember,
  useRejectMember,
  useOpenReports,
  useResolveReport,
  type PendingMember,
} from "@/lib/queries/oversight";
import { colors } from "@/theme/colors";
import type { AskQuestion, Report, Campus } from "@/lib/database.types";

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

  // Approvals + reports + ask-answering are pastor/admin only (RLS-gated too).
  const isAdmin = profile?.role === "pastor" || profile?.role === "admin";
  const pendingMembers = usePendingMembers(isAdmin);
  const openReports = useOpenReports(isAdmin);
  const { data: campuses } = useCampuses();

  const canAnswer = isAdmin;
  const questions = pending.data ?? [];
  const members = pendingMembers.data ?? [];
  const reports = openReports.data ?? [];

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

        {/* Member approvals (pastor/admin) */}
        {isAdmin ? (
          <>
            <SectionLabel>Approvals</SectionLabel>
            {pendingMembers.isLoading ? (
              <ActivityIndicator className="mt-4" color={colors.copper} />
            ) : members.length === 0 ? (
              <Text className="px-6 text-sm text-ink-mute">
                No one is waiting to be approved.
              </Text>
            ) : (
              members.map((m) => (
                <ApprovalRow key={m.id} member={m} campuses={campuses ?? []} />
              ))
            )}
          </>
        ) : null}

        {/* Reports / flags (pastor/admin) */}
        {isAdmin ? (
          <>
            <SectionLabel>Flags to review</SectionLabel>
            {openReports.isLoading ? (
              <ActivityIndicator className="mt-4" color={colors.copper} />
            ) : reports.length === 0 ? (
              <Text className="px-6 text-sm text-ink-mute">
                No open flags. Nothing needs review.
              </Text>
            ) : (
              reports.map((r) => <ReportRow key={r.id} report={r} />)
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

        {/* TODO(backend): DM-content oversight view is intentionally NOT built
            yet — RLS may tighten to existence-only (+ content on open report)
            in 0028. House-leader-scoped report reads aren't available either
            (reports have no house_id), so the flags inbox is admin-only. */}
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

function ApprovalRow({
  member,
  campuses,
}: {
  member: PendingMember;
  campuses: Campus[];
}) {
  const approve = useApproveMember();
  const reject = useRejectMember();
  const busy = approve.isPending || reject.isPending;

  const onApprove = () => {
    const doApprove = (campusId: string) =>
      approve.mutate(
        { userId: member.id, campusId },
        {
          onError: (e) =>
            Alert.alert(
              "Could not approve",
              e instanceof Error ? e.message : "Please try again."
            ),
        }
      );
    if (campuses.length <= 1) {
      if (campuses[0]) doApprove(campuses[0].id);
      return;
    }
    Alert.alert(`Approve ${member.name}`, "Assign to which campus?", [
      ...campuses.map((c) => ({ text: c.name, onPress: () => doApprove(c.id) })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const onReject = () =>
    Alert.alert("Reject this request?", member.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () =>
          reject.mutate(member.id, {
            onError: (e) =>
              Alert.alert(
                "Could not reject",
                e instanceof Error ? e.message : "Please try again."
              ),
          }),
      },
    ]);

  return (
    <View className="border-b border-rule-soft px-6 py-3.5">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-paper-raised">
          <UserCheck color={colors.inkSoft} size={18} strokeWidth={1.7} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[14.5px] text-ink">
            {member.name}
          </Text>
          <Text className="mt-0.5 text-[12px] text-ink-mute" numberOfLines={1}>
            {member.email} · {format(new Date(member.created_at), "d MMM")}
          </Text>
        </View>
      </View>
      <View className="mt-2.5 flex-row gap-2 pl-12">
        <Pressable
          onPress={onApprove}
          disabled={busy}
          className="rounded-full bg-copper px-4 py-1.5 active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-[13px] font-sans-semibold text-white">Approve</Text>
        </Pressable>
        <Pressable
          onPress={onReject}
          disabled={busy}
          className="rounded-full border border-rule px-4 py-1.5 active:opacity-70 disabled:opacity-50"
        >
          <Text className="text-[13px] text-oxblood">Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

const REPORT_TARGET_LABEL: Record<string, string> = {
  message: "Message",
  user: "User",
  prayer_request: "Prayer request",
  ask_question: "Ask Pastor question",
};

function ReportRow({ report }: { report: Report }) {
  const resolve = useResolveReport();
  const act = (status: "reviewing" | "resolved" | "dismissed") =>
    resolve.mutate(
      { reportId: report.id, status },
      {
        onError: (e) =>
          Alert.alert(
            "Could not update",
            e instanceof Error ? e.message : "Please try again."
          ),
      }
    );

  return (
    <View className="border-b border-rule-soft px-6 py-3.5">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-paper-raised">
          <Flag color={colors.oxblood} size={18} strokeWidth={1.7} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[14.5px] text-ink">
            {REPORT_TARGET_LABEL[report.target_type] ?? "Flag"}
          </Text>
          <Text className="mt-0.5 text-[12px] text-ink-mute" numberOfLines={2}>
            {report.reason || "No reason given"} ·{" "}
            {format(new Date(report.created_at), "d MMM")}
          </Text>
        </View>
      </View>
      <View className="mt-2.5 flex-row gap-2 pl-12">
        <Pressable
          onPress={() => act("reviewing")}
          disabled={resolve.isPending}
          className="rounded-full border border-rule px-3.5 py-1.5 active:opacity-70 disabled:opacity-50"
        >
          <Text className="text-[13px] text-ink">Reviewing</Text>
        </Pressable>
        <Pressable
          onPress={() => act("resolved")}
          disabled={resolve.isPending}
          className="rounded-full bg-ink px-3.5 py-1.5 active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-[13px] font-sans-medium text-parchment">Resolve</Text>
        </Pressable>
        <Pressable
          onPress={() => act("dismissed")}
          disabled={resolve.isPending}
          className="rounded-full border border-rule px-3.5 py-1.5 active:opacity-70 disabled:opacity-50"
        >
          <Text className="text-[13px] text-ink-mute">Dismiss</Text>
        </Pressable>
      </View>
    </View>
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
