import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronLeft, House, UserPlus, Users, X } from "lucide-react-native";
import {
  useAssignHouseMembers,
  useChat,
  useParishMembers,
} from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

// Official House groups are different from private Circles. A member belongs
// to one because of their canonical house assignment, not because a chat row
// was added. This detail surface makes that relationship clear while letting a
// parish administrator move approved members into the correct House.
export default function GroupDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id ?? "";
  const { data: profile } = useProfile();
  const { data: chatData, isLoading } = useChat(chatId);
  const { data: directory } = useParishMembers();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const chat = chatData?.chat;
  const isHouseGroup = chat?.kind === "house_group";
  const canManageHouse = profile?.is_owner === true || profile?.role === "admin";
  const assignMembers = useAssignHouseMembers(chat?.house_id ?? "");
  const houseMembers = useMemo(
    () => (directory ?? []).filter((person) => person.house_id === chat?.house_id),
    [chat?.house_id, directory]
  );
  const available = useMemo(
    () => (directory ?? []).filter((person) => person.house_id !== chat?.house_id),
    [chat?.house_id, directory]
  );
  const title = chat?.houses?.name ?? "House group";
  const accent = chat?.houses?.color ?? colors.copper;

  const toggle = (memberId: string) => {
    setSelected((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };
  const addSelected = () => {
    if (!selected.length || !chat?.house_id) return;
    assignMembers.mutate(selected, {
      onSuccess: () => {
        setSelected([]);
        setAddOpen(false);
      },
      onError: (error) =>
        Alert.alert(
          "Could not update the House",
          error instanceof Error ? error.message : "Please try again."
        ),
    });
  };

  if (!isLoading && (!chat || !isHouseGroup)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-parchment px-8">
        <Text className="text-center text-ink-mute">This group is unavailable.</Text>
        <Pressable onPress={() => router.back()} className="mt-5 rounded-full bg-ink px-5 py-3">
          <Text className="font-sans-semibold text-parchment">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-rule-soft px-2 py-2">
        <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Go back">
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="font-display text-[19px] text-ink">House details</Text>
        <View className="w-11" />
      </View>

      <ScrollView contentContainerClassName="pb-12">
        <View className="items-center border-b border-rule-soft px-6 py-8">
          <View className="h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1F` }}>
            <House color={accent} size={42} strokeWidth={1.55} />
          </View>
          <Text className="mt-4 text-center font-display text-[27px] text-ink">{title}</Text>
          <Text className="mt-2 text-center text-[13px] leading-5 text-ink-mute">
            An official fellowship House for prayer, care, and shared growth.
          </Text>
          <View className="mt-4 rounded-full px-3 py-1.5" style={{ backgroundColor: `${accent}16` }}>
            <Text className="font-sans-semibold text-[11px] uppercase" style={{ color: accent, letterSpacing: 1.1 }}>
              {houseMembers.length} {houseMembers.length === 1 ? "member" : "members"}
            </Text>
          </View>
        </View>

        <View className="px-5 pt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-sans-semibold text-[12px] uppercase text-ink-mute" style={{ letterSpacing: 1.2 }}>
              Members
            </Text>
            {canManageHouse ? (
              <Pressable onPress={() => setAddOpen(true)} className="flex-row items-center gap-1.5 px-1 py-1">
                <UserPlus color={colors.copperDeep} size={16} />
                <Text className="font-sans-semibold text-[13px] text-copper-deep">Add members</Text>
              </Pressable>
            ) : null}
          </View>
          <View className="overflow-hidden rounded-2xl border border-rule bg-paper">
            {houseMembers.map((member, index) => (
              <Pressable
                key={member.id}
                onPress={() => router.push({ pathname: "/member/[id]" as never, params: { id: member.id } })}
                className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-paper-raised ${index ? "border-t border-rule-soft" : ""}`}
              >
                <Avatar name={member.name} photoUrl={visiblePhotoUrl(member, profile?.house_id ?? null)} size={42} />
                <View className="flex-1">
                  <Text className="font-sans-semibold text-[14px] text-ink">{member.name}{member.id === profile?.id ? " (You)" : ""}</Text>
                  <Text className="mt-0.5 text-[12px] text-ink-mute">{member.role === "house_leader" ? "House leader" : member.role === "pastor" ? "Pastor" : member.role === "admin" ? "Admin" : "Member"}</Text>
                </View>
              </Pressable>
            ))}
            {!houseMembers.length ? (
              <View className="items-center px-5 py-8">
                <Users color={colors.inkFaint} size={23} />
                <Text className="mt-2 text-center text-[13px] text-ink-mute">No approved members have been placed in this House yet.</Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-3 text-center text-[11px] leading-4 text-ink-faint">
            House membership follows each member’s official House assignment, so the roster stays accurate everywhere in Mathetes.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={addOpen} animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
          <View className="flex-row items-center justify-between border-b border-rule-soft px-4 py-2">
            <Pressable onPress={() => setAddOpen(false)} className="h-11 w-11 items-center justify-center" accessibilityLabel="Close">
              <X color={colors.ink} size={22} />
            </Pressable>
            <Text className="font-display text-[19px] text-ink">Add to {title}</Text>
            <Pressable onPress={addSelected} disabled={!selected.length || assignMembers.isPending} className="px-3 py-2 disabled:opacity-40">
              <Text className="font-sans-semibold text-[13px] text-copper-deep">Add ({selected.length})</Text>
            </Pressable>
          </View>
          <Text className="px-5 pt-4 text-center text-[12px] leading-5 text-ink-mute">Adding someone moves their House assignment to {title}.</Text>
          <ScrollView contentContainerClassName="px-4 pb-10 pt-3">
            {available.map((member) => {
              const picked = selected.includes(member.id);
              return (
                <Pressable key={member.id} onPress={() => toggle(member.id)} className="flex-row items-center gap-3 border-b border-rule-soft py-3">
                  <Avatar name={member.name} photoUrl={visiblePhotoUrl(member, profile?.house_id ?? null)} size={40} />
                  <View className="flex-1"><Text className="font-sans-semibold text-[14px] text-ink">{member.name}</Text><Text className="mt-0.5 text-[12px] text-ink-mute">{member.houses?.name ?? "No House"}</Text></View>
                  <View className={`h-6 w-6 items-center justify-center rounded-full border ${picked ? "border-copper bg-copper" : "border-rule"}`}>{picked ? <Check color="#fff" size={15} /> : null}</View>
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
