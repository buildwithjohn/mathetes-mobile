import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, Check, ChevronLeft, Crown, ShieldCheck, UserPlus, X } from "lucide-react-native";
import {
  useAddCircleMembers,
  useChat,
  useParishMembers,
  useSetCircleMemberRole,
  useUpdateCircle,
} from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import { uploadToBucket } from "@/lib/storage";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

export default function CircleDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id ?? "";
  const { data: profile } = useProfile();
  const { data: chatData } = useChat(chatId);
  const { data: directory } = useParishMembers();
  const updateCircle = useUpdateCircle(chatId);
  const addMembers = useAddCircleMembers(chatId);
  const setRole = useSetCircleMemberRole(chatId);
  const chat = chatData?.chat;
  const members = chatData?.members ?? [];
  const myRole = members.find((member) => member.user_id === profile?.id)?.role;
  const isAdmin = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const currentTitle = editing ? title : chat?.title ?? "Circle";
  const currentDescription = editing ? description : chat?.description ?? "";
  const available = useMemo(
    () => (directory ?? []).filter((person) => !members.some((member) => member.user_id === person.id)),
    [directory, members]
  );

  const startEditing = () => {
    setTitle(chat?.title ?? "");
    setDescription(chat?.description ?? "");
    setEditing(true);
  };
  const save = () => updateCircle.mutate(
    { title: title.trim(), description: description.trim() },
    {
      onSuccess: () => setEditing(false),
      onError: (error) => Alert.alert("Could not save", error instanceof Error ? error.message : "Please try again."),
    }
  );
  const changePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow access to choose a Circle photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.75, aspect: [1, 1], allowsEditing: true });
    if (result.canceled || !result.assets[0]?.uri) return;
    const uri = result.assets[0].uri;
    const ext = (uri.split("?")[0].split(".").pop() ?? "jpg").toLowerCase();
    try {
      const url = await uploadToBucket({
        bucket: "circle-images",
        path: `${chatId}/${Date.now()}.${ext === "png" ? "png" : "jpg"}`,
        localUri: uri,
        contentType: ext === "png" ? "image/png" : "image/jpeg",
      });
      updateCircle.mutate({ imageUrl: url }, { onError: () => Alert.alert("Could not update photo", "Please try again.") });
    } catch {
      Alert.alert("Could not upload photo", "Please try again.");
    }
  };
  const addSelected = () => addMembers.mutate(selected, {
    onSuccess: () => { setSelected([]); setAddOpen(false); },
    onError: (error) => Alert.alert("Could not add members", error instanceof Error ? error.message : "Please try again."),
  });
  const toggle = (personId: string) => setSelected((current) => current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId]);
  const changeRole = (memberId: string, role: "member" | "admin") => setRole.mutate({ memberId, role }, {
    onError: (error) => Alert.alert("Could not update role", error instanceof Error ? error.message : "Please try again."),
  });

  if (!chat || chat.kind !== "circle") {
    return <SafeAreaView className="flex-1 items-center justify-center bg-parchment"><Text className="text-ink-mute">Circle not found.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-rule-soft px-2 py-2">
        <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center"><ChevronLeft color={colors.ink} size={26} /></Pressable>
        <Text className="font-display text-[19px] text-ink">Circle details</Text>
        {isAdmin ? <Pressable onPress={editing ? save : startEditing} disabled={updateCircle.isPending} className="px-3 py-2"><Text className="font-sans-semibold text-[13px] text-copper-deep">{editing ? "Save" : "Edit"}</Text></Pressable> : <View className="w-14" />}
      </View>
      <ScrollView contentContainerClassName="pb-12" keyboardShouldPersistTaps="handled">
        <View className="items-center border-b border-rule-soft px-6 py-7">
          <Pressable onPress={isAdmin ? changePhoto : undefined} disabled={!isAdmin} className="relative">
            {chat.image_url ? <Image source={{ uri: chat.image_url }} className="h-24 w-24 rounded-full" /> : <Avatar name={chat.title ?? "Circle"} photoUrl={null} size={96} />}
            {isAdmin ? <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-parchment bg-ink"><Camera color="#fff" size={15} /></View> : null}
          </Pressable>
          {editing ? <TextInput value={currentTitle} onChangeText={setTitle} maxLength={80} className="mt-4 w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-center font-display text-[21px] text-ink" /> : <Text className="mt-4 text-center font-display text-[24px] text-ink">{currentTitle}</Text>}
          {editing ? <TextInput value={currentDescription} onChangeText={setDescription} multiline maxLength={280} placeholder="A shared purpose" placeholderTextColor={colors.inkMute} textAlign="center" className="mt-3 min-h-18 w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-[14px] text-ink" /> : currentDescription ? <Text className="mt-2 text-center text-[13px] leading-5 text-ink-mute">{currentDescription}</Text> : null}
          <Text className="mt-3 text-[12px] text-ink-mute">{members.length} members · private to this Circle</Text>
        </View>

        <View className="px-5 pt-6">
          <View className="mb-2 flex-row items-center justify-between"><Text className="font-sans-semibold text-[12px] uppercase text-ink-mute" style={{ letterSpacing: 1.2 }}>Members</Text>{isAdmin ? <Pressable onPress={() => setAddOpen(true)} className="flex-row items-center gap-1"><UserPlus color={colors.copperDeep} size={16} /><Text className="font-sans-semibold text-[13px] text-copper-deep">Add</Text></Pressable> : null}</View>
          <View className="overflow-hidden rounded-2xl border border-rule bg-paper">
            {members.map((member, index) => {
              const person = member.user_profiles;
              const roleLabel = member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member";
              return <Pressable key={member.user_id} disabled={!isOwner || member.role === "owner" || member.user_id === profile?.id} onPress={() => {
                const promote = member.role !== "admin";
                Alert.alert(promote ? "Make Circle admin?" : "Remove Circle admin?", promote ? "Admins can edit the Circle, add members, and start meetings." : "They will remain a member.", [
                  { text: "Cancel", style: "cancel" },
                  { text: promote ? "Make admin" : "Make member", onPress: () => changeRole(member.user_id, promote ? "admin" : "member") },
                ]);
              }} className={`flex-row items-center gap-3 px-4 py-3 ${index ? "border-t border-rule-soft" : ""}`}>
                <Avatar name={person?.name ?? "Member"} photoUrl={person ? visiblePhotoUrl(person, profile?.house_id ?? null) : null} size={39} />
                <View className="flex-1"><Text className="font-sans-semibold text-[14px] text-ink">{person?.name ?? "Member"}</Text><Text className="mt-0.5 text-[12px] text-ink-mute">{roleLabel}</Text></View>
                {member.role === "owner" ? <Crown color={colors.copperDeep} size={17} /> : member.role === "admin" ? <ShieldCheck color={colors.copperDeep} size={17} /> : null}
              </Pressable>;
            })}
          </View>
          <Text className="mt-3 text-center text-[11px] leading-4 text-ink-faint">Circle admins can add people, update the photo and details, and start private prayer meetings.</Text>
        </View>
      </ScrollView>

      <Modal visible={addOpen} animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
          <View className="flex-row items-center justify-between border-b border-rule-soft px-4 py-2"><Pressable onPress={() => setAddOpen(false)} className="h-11 w-11 items-center justify-center"><X color={colors.ink} size={22} /></Pressable><Text className="font-display text-[19px] text-ink">Add members</Text><Pressable onPress={addSelected} disabled={!selected.length || addMembers.isPending} className="px-3 py-2 disabled:opacity-40"><Text className="font-sans-semibold text-[13px] text-copper-deep">Add ({selected.length})</Text></Pressable></View>
          <ScrollView contentContainerClassName="px-4 py-4">
            {available.map((person) => { const picked = selected.includes(person.id); return <Pressable key={person.id} onPress={() => toggle(person.id)} className="flex-row items-center gap-3 border-b border-rule-soft py-3"><Avatar name={person.name} photoUrl={visiblePhotoUrl(person, profile?.house_id ?? null)} size={39} /><View className="flex-1"><Text className="font-sans-semibold text-[14px] text-ink">{person.name}</Text><Text className="text-[12px] text-ink-mute">{person.houses?.name ?? "Parish member"}</Text></View><View className={`h-6 w-6 items-center justify-center rounded-full border ${picked ? "border-copper bg-copper" : "border-rule"}`}>{picked ? <Check color="#fff" size={15} /> : null}</View></Pressable>; })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
