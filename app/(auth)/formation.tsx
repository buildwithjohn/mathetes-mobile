import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format, isToday, subDays } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react-native";
import {
  useCompleteCampaign,
  useFellowshipEvents,
  useFormationCampaigns,
  useFormationRhythm,
  useMyCampaignCompletions,
  useMyEventRsvps,
  useSetEventRsvp,
} from "@/lib/queries/formation";
import { colors } from "@/theme/colors";

export default function Formation() {
  const router = useRouter();
  const { data: rhythm, isLoading: rhythmLoading } = useFormationRhythm();
  const { data: campaigns, isLoading: campaignsLoading } = useFormationCampaigns();
  const { data: events, isLoading: eventsLoading } = useFellowshipEvents();
  const activeCampaigns = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return (campaigns ?? []).filter(
      (campaign) => campaign.starts_on <= today && campaign.ends_on >= today
    );
  }, [campaigns]);
  const { data: completions } = useMyCampaignCompletions(activeCampaigns.map((campaign) => campaign.id));
  const { data: rsvps } = useMyEventRsvps((events ?? []).map((event) => event.id));
  const completeCampaign = useCompleteCampaign();
  const setRsvp = useSetEventRsvp();
  const completed = new Set((completions ?? []).map((item) => item.campaign_id));
  const rsvpByEvent = new Map((rsvps ?? []).map((item) => [item.event_id, item.response]));
  const busy = rhythmLoading || campaignsLoading || eventsLoading;

  const onCompleteCampaign = (id: string) => {
    completeCampaign.mutate(id, {
      onSuccess: () => Alert.alert("Beautiful", "Your quiet act of faith is saved."),
      onError: (error) => Alert.alert("Could not save", error instanceof Error ? error.message : "Please try again."),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-1 py-2">
        <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Go back">
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="flex-1 text-center font-display text-[19px] text-ink">Grow</Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-14 pt-2" showsVerticalScrollIndicator={false}>
        <View className="overflow-hidden rounded-3xl bg-ink px-6 py-7">
          <View className="absolute -right-6 -top-8 h-36 w-36 rounded-full bg-copper/20" />
          <Text className="font-sans-semibold text-[10px] uppercase text-parchment/65" style={{ letterSpacing: 1.8 }}>
            A life with God, one day at a time
          </Text>
          <Text className="mt-2 font-display text-[27px] leading-[33px] text-parchment">
            Small practices become a steady life.
          </Text>
          <Text className="mt-3 max-w-[290px] text-[13.5px] leading-[20px] text-parchment/70">
            This space is yours. There are no rankings here—only invitations to keep showing up.
          </Text>
        </View>

        {busy ? <ActivityIndicator className="mt-10" color={colors.copper} /> : <>
          <SectionLabel>Your rhythm</SectionLabel>
          <RhythmGarden dates={(rhythm ?? []).map((activity) => activity.occurred_on)} />

          <SectionLabel>Practice together</SectionLabel>
          {activeCampaigns.length === 0 ? (
            <EmptyPractice onPlans={() => router.push("/plans")} />
          ) : (
            <View className="gap-3">
              {activeCampaigns.map((campaign) => {
                const done = completed.has(campaign.id);
                const isHouseQuest = campaign.kind === "house_quest";
                return (
                  <View key={campaign.id} className="overflow-hidden rounded-2xl border border-rule bg-paper">
                    <View className="border-b border-rule-soft bg-surface2 px-5 py-3">
                      <View className="flex-row items-center gap-2">
                        {isHouseQuest ? <Users color={colors.copperDeep} size={16} /> : <Compass color={colors.copperDeep} size={16} />}
                        <Text className="font-sans-semibold text-[11px] uppercase text-copper-deep" style={{ letterSpacing: 1.3 }}>
                          {isHouseQuest ? "House quest" : "Campus mission"}
                        </Text>
                      </View>
                    </View>
                    <View className="px-5 pb-5 pt-4">
                      <Text className="font-display text-[21px] leading-[26px] text-ink">{campaign.title}</Text>
                      {campaign.body ? <Text className="mt-2 text-[13px] leading-[19px] text-ink-soft">{campaign.body}</Text> : null}
                      {campaign.scripture_ref ? <Text className="mt-3 font-sans-semibold text-[12px] text-copper-deep">{campaign.scripture_ref}</Text> : null}
                      <Pressable
                        onPress={() => onCompleteCampaign(campaign.id)}
                        disabled={done || completeCampaign.isPending}
                        className={`mt-4 h-11 flex-row items-center justify-center gap-2 rounded-full ${done ? "bg-sage/25" : "bg-ink"} active:opacity-85 disabled:opacity-70`}
                      >
                        {done ? <Check color={colors.ink} size={17} /> : <Heart color={colors.parchment} size={16} />}
                        <Text className={`font-sans-semibold text-[13px] ${done ? "text-ink" : "text-parchment"}`}>
                          {done ? "Practice completed" : "I did this"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <SectionLabel>Coming together</SectionLabel>
          {(events ?? []).length === 0 ? (
            <View className="rounded-2xl border border-rule bg-paper px-5 py-5">
              <CalendarDays color={colors.inkMute} size={20} />
              <Text className="mt-3 font-display text-[19px] text-ink">Nothing scheduled yet</Text>
              <Text className="mt-1 text-[13px] leading-[19px] text-ink-mute">Your next fellowship gathering will appear here.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {(events ?? []).map((event) => {
                const response = rsvpByEvent.get(event.id);
                return <EventCard key={event.id} event={event} response={response} busy={setRsvp.isPending} onRsvp={(next) => setRsvp.mutate({ eventId: event.id, response: next })} />;
              })}
            </View>
          )}

          <SectionLabel>Keep going</SectionLabel>
          <Pressable onPress={() => router.push("/plans")} className="flex-row items-center rounded-2xl border border-rule bg-paper px-5 py-4 active:bg-surface2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-copper/10"><Sparkles color={colors.copperDeep} size={19} /></View>
            <View className="ml-3 flex-1"><Text className="font-sans-semibold text-[15px] text-ink">Continue a reading plan</Text><Text className="mt-0.5 text-[12.5px] text-ink-mute">A simple next step for today</Text></View>
            <ArrowRight color={colors.inkMute} size={18} />
          </Pressable>
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text className="mb-2.5 mt-7 pl-1 font-sans-semibold text-[10px] uppercase text-ink-mute" style={{ letterSpacing: 1.7 }}>{children}</Text>;
}

function RhythmGarden({ dates }: { dates: string[] }) {
  const recentDays = Array.from({ length: 7 }, (_, index) => subDays(new Date(), 6 - index));
  const active = new Set(dates);
  const daysShown = recentDays.filter((day) => active.has(format(day, "yyyy-MM-dd"))).length;
  const milestone = daysShown >= 7
    ? "A full week of showing up. Keep this quiet rhythm close."
    : daysShown >= 4
      ? "You have returned to God on four days this week. That is a beautiful rhythm."
      : daysShown >= 1
        ? "Every return matters. Your next small step is waiting for you."
        : "Begin gently today. One small moment with God is enough.";
  return <View className="rounded-2xl border border-rule bg-paper px-5 py-5">
    <View className="flex-row items-end justify-between">
      <View><Text className="font-display text-[21px] text-ink">A quiet, growing rhythm</Text><Text className="mt-1 text-[13px] text-ink-mute">Each dot is a day you showed up.</Text></View>
      <Sparkles color={colors.copper} size={21} />
    </View>
    <View className="mt-5 flex-row justify-between">
      {recentDays.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const hasActivity = active.has(key);
        return <View key={key} className="items-center gap-2"><View className={`h-8 w-8 rounded-full border ${hasActivity ? "border-copper bg-copper" : "border-rule bg-surface2"}`}>{hasActivity ? <View className="m-auto mt-[9px] h-2.5 w-2.5 rounded-full bg-parchment" /> : null}</View><Text className={`text-[10px] ${isToday(day) ? "font-sans-semibold text-ink" : "text-ink-mute"}`}>{format(day, "EEEEE")}</Text></View>;
      })}
    </View>
    <View className="mt-5 flex-row items-center gap-2 rounded-xl bg-surface2 px-3 py-2.5">
      <Sparkles color={colors.copperDeep} size={15} />
      <Text className="flex-1 text-[12px] leading-[17px] text-ink-soft">{milestone}</Text>
    </View>
  </View>;
}

function EmptyPractice({ onPlans }: { onPlans: () => void }) {
  return <View className="rounded-2xl border border-rule bg-paper px-5 py-5"><Text className="font-display text-[20px] text-ink">No shared practice right now</Text><Text className="mt-1.5 text-[13px] leading-[19px] text-ink-mute">Your leader will place a house quest or campus mission here when it is ready.</Text><Pressable onPress={onPlans} className="mt-4 flex-row items-center gap-1 self-start"><Text className="font-sans-semibold text-[13px] text-copper-deep">Choose a reading plan</Text><ArrowRight color={colors.copperDeep} size={15} /></Pressable></View>;
}

function EventCard({ event, response, busy, onRsvp }: { event: { id: string; title: string; description: string; starts_at: string; location: string | null }; response?: string; busy: boolean; onRsvp: (response: "going" | "interested" | "not_going") => void }) {
  return <View className="rounded-2xl border border-rule bg-paper px-5 py-5"><View className="flex-row gap-3"><View className="h-11 w-11 items-center justify-center rounded-full bg-copper/10"><CalendarDays color={colors.copperDeep} size={20} /></View><View className="flex-1"><Text className="font-sans-semibold text-[15px] text-ink">{event.title}</Text><Text className="mt-0.5 text-[12.5px] text-ink-mute">{format(new Date(event.starts_at), "EEE, d MMM · h:mm a")}</Text>{event.location ? <View className="mt-1 flex-row items-center gap-1"><MapPin color={colors.inkMute} size={12} /><Text className="text-[11.5px] text-ink-mute">{event.location}</Text></View> : null}</View></View>{event.description ? <Text className="mt-3 text-[13px] leading-[19px] text-ink-soft">{event.description}</Text> : null}<View className="mt-4 flex-row gap-2"><RsvpButton label="Going" active={response === "going"} onPress={() => onRsvp("going")} disabled={busy} /><RsvpButton label="Interested" active={response === "interested"} onPress={() => onRsvp("interested")} disabled={busy} /></View></View>;
}

function RsvpButton({ label, active, onPress, disabled }: { label: string; active: boolean; onPress: () => void; disabled: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} className={`rounded-full border px-4 py-2 ${active ? "border-ink bg-ink" : "border-rule bg-paper"} active:opacity-75 disabled:opacity-50`}><Text className={`font-sans-semibold text-[12px] ${active ? "text-parchment" : "text-ink-soft"}`}>{active ? `${label} ✓` : label}</Text></Pressable>;
}
