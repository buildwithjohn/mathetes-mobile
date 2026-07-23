import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, ChevronLeft, UsersRound } from "lucide-react-native";
import { useCreateCircle, useParishMembers } from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

export default function NewCircleScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: members } = useParishMembers();
  const createCircle = useCreateCircle();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const invitees = useMemo(
    () => (members ?? []).filter((member) => member.id !== profile?.id),
    [members, profile?.id]
  );

  const toggleMember = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };
  const submit = () => {
    if (title.trim().length < 2) {
      Alert.alert("Name your Circle", "Choose a name with at least 2 characters.");
      return;
    }
    createCircle.mutate(
      { title: title.trim(), description: description.trim(), memberIds: selected },
      {
        onSuccess: (chatId) => router.replace(`/circle/${chatId}`),
        onError: (error) => Alert.alert("Could not create Circle", error instanceof Error ? error.message : "Please try again."),
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center border-b border-rule-soft px-2 py-2">
        <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center">
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="font-display text-[20px] text-ink">Create a Circle</Text>
      </View>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-6" keyboardShouldPersistTaps="handled">
        <View className="items-center rounded-3xl border border-rule bg-paper px-6 py-6">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-copper/15">
            <UsersRound color={colors.copper} size={26} />
          </View>
          <Text className="text-center font-display text-[21px] text-ink">A smaller place to grow</Text>
          <Text className="mt-2 text-center text-[13px] leading-5 text-ink-mute">
            Private to the people you invite. Members can chat, pray, and join live meetings together.
          </Text>
        </View>

        <Text className="mb-2 mt-7 font-sans-semibold text-[12px] uppercase text-ink-mute" style={{ letterSpacing: 1.2 }}>Circle name</Text>
        <TextInput value={title} onChangeText={setTitle} maxLength={80} placeholder="e.g. Deborahs at Dawn" placeholderTextColor={colors.inkMute} className="rounded-2xl border border-rule bg-paper px-4 py-3.5 text-[16px] text-ink" />
        <Text className="mb-2 mt-5 font-sans-semibold text-[12px] uppercase text-ink-mute" style={{ letterSpacing: 1.2 }}>Purpose (optional)</Text>
        <TextInput value={description} onChangeText={setDescription} maxLength={280} multiline placeholder="What will this Circle help you grow in?" placeholderTextColor={colors.inkMute} className="min-h-24 rounded-2xl border border-rule bg-paper px-4 py-3.5 text-[15px] text-ink" textAlignVertical="top" />

        <View className="mb-2 mt-7 flex-row items-center justify-between">
          <Text className="font-sans-semibold text-[12px] uppercase text-ink-mute" style={{ letterSpacing: 1.2 }}>Invite people</Text>
          <Text className="text-[12px] text-copper-deep">{selected.length} selected</Text>
        </View>
        <View className="overflow-hidden rounded-2xl border border-rule bg-paper">
          {invitees.map((member, index) => {
            const isSelected = selected.includes(member.id);
            return (
              <Pressable key={member.id} onPress={() => toggleMember(member.id)} className={`flex-row items-center gap-3 px-4 py-3 ${index ? "border-t border-rule-soft" : ""}`}>
                <Avatar name={member.name} photoUrl={visiblePhotoUrl(member, profile?.house_id ?? null)} size={38} />
                <View className="flex-1">
                  <Text className="font-sans-semibold text-[14px] text-ink">{member.name}</Text>
                  <Text className="mt-0.5 text-[12px] text-ink-mute">{member.houses?.name ?? "Parish member"}</Text>
                </View>
                <View className={`h-6 w-6 items-center justify-center rounded-full border ${isSelected ? "border-copper bg-copper" : "border-rule"}`}>
                  {isSelected ? <Check color="#fff" size={15} strokeWidth={2.7} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={submit} disabled={createCircle.isPending} className="mt-7 items-center rounded-2xl bg-ink py-4 active:opacity-85 disabled:opacity-50">
          <Text className="font-sans-semibold text-[15px] text-parchment">{createCircle.isPending ? "Creating…" : "Create private Circle"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
