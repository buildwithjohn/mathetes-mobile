import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, Check, HeartHandshake } from "lucide-react-native";
import {
  useGivingFunds,
  useDonations,
  useRecurringGiving,
  useInitGiving,
  useManageRecurring,
  watchDonation,
} from "@/lib/queries/giving";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import type {
  GivingInterval,
  GivingRecurring,
  Donation,
} from "@/lib/database.types";

const PRESETS = [500, 1000, 2000, 5000];
const INTERVALS: { key: GivingInterval; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "annually", label: "Yearly" },
];

function naira(kobo: number): string {
  const n = Math.round(kobo / 100);
  return "₦" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function Giving() {
  const router = useRouter();
  const { data: funds } = useGivingFunds();
  const { data: donations, refetch: refetchDonations, isRefetching } =
    useDonations();
  const { data: recurring, refetch: refetchRecurring } = useRecurringGiving();
  const init = useInitGiving();

  const [amount, setAmount] = useState("");
  const [fundId, setFundId] = useState<string | null>(null);
  const [recurringOn, setRecurringOn] = useState(false);
  const [interval, setInterval] = useState<GivingInterval>("monthly");
  const [anonymous, setAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const unsub = useRef<(() => void) | null>(null);

  useEffect(() => () => unsub.current?.(), []);

  const amountKobo = Math.round((parseFloat(amount) || 0) * 100);

  const onGive = () => {
    if (amountKobo <= 0) {
      Alert.alert("Enter an amount", "Please enter how much you'd like to give.");
      return;
    }
    init.mutate(
      {
        amountKobo,
        kind: recurringOn ? "recurring" : "one_time",
        fundId,
        interval: recurringOn ? interval : undefined,
        anonymous,
      },
      {
        onSuccess: async (res) => {
          setProcessing(true);
          // Watch the one-time donation row; recurring confirms via its list.
          if (!recurringOn) {
            unsub.current = watchDonation(res.reference, (status) => {
              if (status === "success") {
                setProcessing(false);
                unsub.current?.();
                refetchDonations();
                Alert.alert("Thank you", "Your gift has been received.");
              } else if (
                status === "failed" ||
                status === "abandoned" ||
                status === "reversed"
              ) {
                setProcessing(false);
                unsub.current?.();
                Alert.alert("Not completed", "The gift was not completed.");
              }
            });
          }
          await WebBrowser.openBrowserAsync(res.authorization_url).catch(
            () => {}
          );
          // Back from checkout. Refresh; for recurring we rely on the list.
          refetchDonations();
          refetchRecurring();
          if (recurringOn) {
            setProcessing(false);
            Alert.alert(
              "Setting up",
              "Your recurring gift will appear here once confirmed."
            );
          }
          setAmount("");
        },
        onError: (e) => {
          setProcessing(false);
          Alert.alert(
            "Could not start giving",
            e instanceof Error ? e.message : "Please try again."
          );
        },
      }
    );
  };

  const activeRecurring = (recurring ?? []).filter(
    (r) => r.status !== "cancelled"
  );

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
          Give
        </Text>
        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchDonations();
              refetchRecurring();
            }}
            tintColor={colors.copper}
          />
        }
      >
        {/* Amount */}
        <Text className="mb-2 font-sans-medium text-sm text-ink">Amount</Text>
        <View className="flex-row items-center rounded-2xl border border-rule bg-paper px-4">
          <Text className="font-display text-2xl text-ink-mute">₦</Text>
          <TextInput
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            placeholderTextColor={colors.inkFaint}
            keyboardType="numeric"
            className="flex-1 py-3.5 pl-2 font-display text-2xl text-ink"
          />
        </View>
        <View className="mt-2.5 flex-row gap-2">
          {PRESETS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setAmount(String(p))}
              className="flex-1 items-center rounded-full border border-rule bg-paper py-2 active:opacity-80"
            >
              <Text className="text-[13px] font-sans-medium text-ink">
                ₦{p.toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Fund */}
        {(funds ?? []).length > 0 ? (
          <>
            <Text className="mb-2 mt-6 font-sans-medium text-sm text-ink">Fund</Text>
            <View className="flex-row flex-wrap gap-2">
              {(funds ?? []).map((f) => {
                const on = fundId === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => setFundId(on ? null : f.id)}
                    className="rounded-full border px-3.5 py-2"
                    style={{
                      borderColor: on ? colors.copper : colors.rule,
                      backgroundColor: on ? `${colors.copper}1F` : colors.paper,
                    }}
                  >
                    <Text
                      className="text-[13px] font-sans-medium"
                      style={{ color: on ? colors.copperDeep : colors.inkSoft }}
                    >
                      {f.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Recurring */}
        <Pressable
          onPress={() => setRecurringOn((v) => !v)}
          className="mt-6 flex-row items-center justify-between rounded-2xl border border-rule bg-paper px-4 py-3 active:opacity-80"
        >
          <Text className="flex-1 pr-3 text-[15px] text-ink">
            Make this a recurring gift
          </Text>
          <View
            className="h-6 w-6 items-center justify-center rounded-md border"
            style={{
              backgroundColor: recurringOn ? colors.copper : "transparent",
              borderColor: recurringOn ? colors.copper : colors.rule,
            }}
          >
            {recurringOn ? <Check color="#fff" size={15} strokeWidth={2.4} /> : null}
          </View>
        </Pressable>
        {recurringOn ? (
          <View className="mt-2.5 flex-row gap-2">
            {INTERVALS.map((iv) => {
              const on = interval === iv.key;
              return (
                <Pressable
                  key={iv.key}
                  onPress={() => setInterval(iv.key)}
                  className="flex-1 items-center rounded-full border py-2"
                  style={{
                    borderColor: on ? colors.copper : colors.rule,
                    backgroundColor: on ? `${colors.copper}1F` : colors.paper,
                  }}
                >
                  <Text
                    className="text-[12px] font-sans-medium"
                    style={{ color: on ? colors.copperDeep : colors.inkSoft }}
                  >
                    {iv.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* Anonymous */}
        <Pressable
          onPress={() => setAnonymous((v) => !v)}
          className="mt-2.5 flex-row items-center justify-between rounded-2xl border border-rule bg-paper px-4 py-3 active:opacity-80"
        >
          <Text className="flex-1 pr-3 text-[15px] text-ink">Give anonymously</Text>
          <View
            className="h-6 w-6 items-center justify-center rounded-md border"
            style={{
              backgroundColor: anonymous ? colors.copper : "transparent",
              borderColor: anonymous ? colors.copper : colors.rule,
            }}
          >
            {anonymous ? <Check color="#fff" size={15} strokeWidth={2.4} /> : null}
          </View>
        </Pressable>

        <Pressable
          onPress={onGive}
          disabled={init.isPending || processing}
          className="mt-5 h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-copper active:opacity-90 disabled:opacity-50"
        >
          {init.isPending || processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <HeartHandshake color="#fff" size={18} strokeWidth={1.8} />
              <Text className="font-sans-semibold text-base text-white">
                {recurringOn ? "Start recurring gift" : "Give"}
                {amountKobo > 0 ? ` ${naira(amountKobo)}` : ""}
              </Text>
            </>
          )}
        </Pressable>
        {processing ? (
          <Text className="mt-2 text-center text-[12px] text-ink-mute">
            Completing your gift… you can finish payment in the page that opened.
          </Text>
        ) : null}

        <Text className="mt-3 text-center text-[11px] text-ink-faint">
          Payments are processed securely by Paystack.
        </Text>

        {/* Recurring mandates */}
        {activeRecurring.length > 0 ? (
          <>
            <SectionEyebrow>Your recurring giving</SectionEyebrow>
            <View className="gap-2.5">
              {activeRecurring.map((r) => (
                <RecurringRow key={r.id} item={r} />
              ))}
            </View>
          </>
        ) : null}

        {/* History */}
        <SectionEyebrow>Your giving</SectionEyebrow>
        {(donations ?? []).length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No giving yet"
            body="Your gifts to the parish will appear here."
          />
        ) : (
          <View>
            {(donations ?? []).map((d) => (
              <DonationRow key={d.id} item={d} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="mb-2.5 mt-8 font-sans-medium text-[11px] uppercase text-ink-mute"
      style={{ letterSpacing: 1.6 }}
    >
      {children}
    </Text>
  );
}

function RecurringRow({ item }: { item: GivingRecurring }) {
  const manage = useManageRecurring();
  const paused = item.status === "paused";
  const onAction = (action: "pause" | "resume" | "cancel") =>
    manage.mutate(
      { recurringId: item.id, action },
      {
        onError: (e) =>
          Alert.alert(
            "Could not update",
            e instanceof Error ? e.message : "Please try again."
          ),
      }
    );
  const confirmCancel = () =>
    Alert.alert("Cancel recurring gift?", "This stops future charges.", [
      { text: "Keep it", style: "cancel" },
      { text: "Cancel gift", style: "destructive", onPress: () => onAction("cancel") },
    ]);

  return (
    <View className="rounded-2xl border border-rule bg-paper px-4 py-3.5">
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-[17px] text-ink">
          {naira(item.amount_kobo)}
        </Text>
        <Text
          className="text-[11px] font-sans-medium uppercase"
          style={{
            color: paused ? colors.warning : colors.success,
            letterSpacing: 0.5,
          }}
        >
          {item.status}
        </Text>
      </View>
      <Text className="mt-0.5 text-[12.5px] text-ink-mute">
        {item.interval}
        {item.next_payment_at
          ? ` · next ${format(new Date(item.next_payment_at), "d MMM")}`
          : ""}
      </Text>
      <View className="mt-3 flex-row gap-2">
        <Pressable
          onPress={() => onAction(paused ? "resume" : "pause")}
          disabled={manage.isPending}
          className="rounded-full border border-rule px-3.5 py-1.5 active:opacity-70"
        >
          <Text className="text-[13px] text-ink">{paused ? "Resume" : "Pause"}</Text>
        </Pressable>
        <Pressable
          onPress={confirmCancel}
          disabled={manage.isPending}
          className="rounded-full border border-rule px-3.5 py-1.5 active:opacity-70"
        >
          <Text className="text-[13px] text-oxblood">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const STATUS_TONE: Record<string, string> = {
  success: colors.success,
  pending: colors.warning,
  failed: colors.alert,
  abandoned: colors.inkMute,
  reversed: colors.alert,
};

function DonationRow({ item }: { item: Donation }) {
  return (
    <View className="flex-row items-center justify-between border-b border-rule-soft py-3.5">
      <View className="flex-1">
        <Text className="font-sans-semibold text-[15px] text-ink">
          {naira(item.amount_kobo)}
          {item.kind === "recurring" ? " · recurring" : ""}
        </Text>
        <Text className="mt-0.5 text-[12px] text-ink-mute">
          {format(new Date(item.created_at), "d MMM yyyy")}
        </Text>
      </View>
      <Text
        className="text-[11px] font-sans-medium uppercase"
        style={{ color: STATUS_TONE[item.status] ?? colors.inkMute, letterSpacing: 0.5 }}
      >
        {item.status}
      </Text>
    </View>
  );
}
