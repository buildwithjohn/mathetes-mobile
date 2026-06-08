import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ChevronLeft, Plus, HandHeart, X, Check } from "lucide-react-native";
import {
  usePrayerRequests,
  useCreatePrayer,
  useTogglePray,
  type PrayerEntry,
} from "@/lib/queries/prayer";
import { useProfile } from "@/lib/queries/profile";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

export default function PrayerWall() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: requests, isLoading, refetch, isRefetching } =
    usePrayerRequests();
  const togglePray = useTogglePray();
  const [composing, setComposing] = useState(false);

  const myHouse = profile?.house_id ?? null;

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
        <Text className="flex-1 font-display text-xl text-ink">Prayer Wall</Text>
        <Pressable
          onPress={() => setComposing(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-copper active:opacity-90"
          accessibilityLabel="Share a request"
        >
          <Plus color={colors.parchment} size={22} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <FlatList
          data={requests ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.copper}
            />
          }
          renderItem={({ item }) => (
            <PrayerCard
              entry={item}
              viewerHouseId={myHouse}
              onPray={() =>
                togglePray.mutate({
                  requestId: item.id,
                  on: !item.prayedByMe,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-20 px-10">
              <HandHeart color={colors.copper} size={30} />
              <Text className="mt-4 text-center font-display text-xl text-ink">
                Carry one another
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-ink/60">
                Share the first request and let your house pray with you.
              </Text>
            </View>
          }
        />
      )}

      <ComposeModal
        visible={composing}
        onClose={() => setComposing(false)}
        hasHouse={!!myHouse}
        houseId={myHouse}
      />
    </SafeAreaView>
  );
}

function PrayerCard({
  entry,
  viewerHouseId,
  onPray,
}: {
  entry: PrayerEntry;
  viewerHouseId: string | null;
  onPray: () => void;
}) {
  return (
    <View
      className={`rounded-2xl border bg-surface1 p-4 ${
        entry.urgent ? "border-oxblood/40" : "border-border"
      }`}
    >
      <View className="flex-row items-center gap-2">
        {entry.anonymous || !entry.author ? (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surface2">
            <Text className="text-xs text-ink/50">??</Text>
          </View>
        ) : (
          <Avatar
            name={entry.author.name}
            photoUrl={visiblePhotoUrl(entry.author, viewerHouseId)}
            size={36}
          />
        )}
        <View className="flex-1">
          <Text className="font-sans-semibold text-sm text-ink">
            {entry.anonymous || !entry.author ? "Anonymous" : entry.author.name}
          </Text>
          <Text className="text-xs text-ink/45">
            {formatDistanceToNowStrict(new Date(entry.createdAt), {
              addSuffix: true,
            })}
            {entry.houseId ? " · House" : " · Parish"}
          </Text>
        </View>
        {entry.praise ? <Badge label="Praise" tone="copper" /> : null}
        {entry.urgent ? <Badge label="Urgent" tone="oxblood" /> : null}
      </View>

      <Text className="mt-3 text-base leading-6 text-ink/90">{entry.body}</Text>

      <Pressable
        onPress={onPray}
        className={`mt-3 flex-row items-center gap-2 self-start rounded-full border px-3.5 py-1.5 active:opacity-80 ${
          entry.prayedByMe
            ? "border-copper bg-copper/15"
            : "border-border bg-surface2"
        }`}
      >
        <HandHeart
          color={entry.prayedByMe ? colors.copper : colors.ink}
          size={16}
        />
        <Text
          className={`text-sm font-sans-medium ${
            entry.prayedByMe ? "text-copper" : "text-ink"
          }`}
        >
          {entry.prayedByMe ? "Prayed" : "I prayed"}
          {entry.prayedCount > 0 ? ` · ${entry.prayedCount}` : ""}
        </Text>
      </Pressable>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: "copper" | "oxblood" }) {
  return (
    <View
      className={`rounded-full px-2 py-0.5 ${
        tone === "oxblood" ? "bg-oxblood/15" : "bg-copper/15"
      }`}
    >
      <Text
        className={`text-xs font-sans-medium ${
          tone === "oxblood" ? "text-oxblood" : "text-copper"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function ComposeModal({
  visible,
  onClose,
  hasHouse,
  houseId,
}: {
  visible: boolean;
  onClose: () => void;
  hasHouse: boolean;
  houseId: string | null;
}) {
  const create = useCreatePrayer();
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [praise, setPraise] = useState(false);
  // Default to the member's house when they have one (conservative scope).
  const [toHouse, setToHouse] = useState(hasHouse);

  const reset = () => {
    setBody("");
    setAnonymous(false);
    setUrgent(false);
    setPraise(false);
    setToHouse(hasHouse);
  };

  const onSubmit = () => {
    if (!body.trim()) return;
    create.mutate(
      {
        body,
        anonymous,
        urgent,
        praise,
        houseId: toHouse ? houseId : null,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
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
            <Text className="font-display text-xl text-ink">Share a request</Text>
            <Pressable onPress={onClose} className="p-1">
              <X color={colors.ink} size={22} />
            </Pressable>
          </View>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="What can we pray with you about?"
            placeholderTextColor="#9C968A"
            multiline
            className="min-h-24 rounded-2xl border border-border bg-parchment px-4 py-3 text-base text-ink"
            textAlignVertical="top"
          />

          <View className="mt-4 gap-2">
            <Toggle label="Post anonymously" value={anonymous} onChange={setAnonymous} />
            <Toggle label="Mark urgent" value={urgent} onChange={setUrgent} />
            <Toggle label="This is a praise report" value={praise} onChange={setPraise} />
            {hasHouse ? (
              <Toggle
                label="Share with my house only"
                value={toHouse}
                onChange={setToHouse}
              />
            ) : null}
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={!body.trim() || create.isPending}
            className="mt-5 h-13 items-center justify-center rounded-full bg-copper py-3.5 active:opacity-90 disabled:opacity-50"
          >
            {create.isPending ? (
              <ActivityIndicator color={colors.parchment} />
            ) : (
              <Text className="font-sans-semibold text-base text-parchment">
                Share request
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Toggle({
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
