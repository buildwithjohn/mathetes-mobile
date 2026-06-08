import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, MessageSquare, X } from "lucide-react-native";
import {
  useParishMembers,
  useCreateDm,
  type DirectoryMember,
} from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import { Avatar } from "@/components/Avatar";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

const ROLE_LABEL: Record<string, string> = {
  house_leader: "House Leader",
  discipler: "Discipler",
  pastor: "Pastor",
  admin: "Admin",
};

export default function Members() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: members, isLoading } = useParishMembers();
  const createDm = useCreateDm();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DirectoryMember | null>(null);

  const myHouse = profile?.house_id ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members ?? [];
    return (members ?? []).filter((m) => m.name.toLowerCase().includes(q));
  }, [members, query]);

  const onMessage = (member: DirectoryMember) => {
    setSelected(null);
    createDm.mutate(member.id, {
      onSuccess: (chatId) => router.push(`/chat/${chatId}`),
      onError: (e) =>
        Alert.alert(
          "Could not open chat",
          e instanceof Error ? e.message : "Please try again."
        ),
    });
  };

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
        <Text className="font-display text-xl text-ink">Members</Text>
      </View>

      {/* Search */}
      <View className="mx-4 mb-2 flex-row items-center gap-2 rounded-full border border-border bg-surface1 px-4">
        <Search color="#9C968A" size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search members"
          placeholderTextColor="#9C968A"
          className="flex-1 py-2.5 text-base text-ink"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isMe = item.id === profile?.id;
            const role = ROLE_LABEL[item.role];
            return (
              <Pressable
                onPress={() => !isMe && setSelected(item)}
                disabled={isMe}
                className="flex-row items-center gap-3 border-b border-border/60 py-3 active:opacity-70"
              >
                <Avatar
                  name={item.name}
                  photoUrl={visiblePhotoUrl(item, myHouse)}
                  ringColor={item.houses?.color}
                  size={44}
                />
                <View className="flex-1">
                  <Text className="font-sans-semibold text-base text-ink">
                    {item.name}
                    {isMe ? "  (You)" : ""}
                  </Text>
                  <Text className="text-sm text-ink/55">
                    {item.houses?.name ?? "No house"}
                    {role ? ` · ${role}` : ""}
                  </Text>
                </View>
                {!isMe ? (
                  <MessageSquare color={colors.copper} size={18} />
                ) : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text className="mt-10 text-center text-sm text-ink/50">
              No members found.
            </Text>
          }
        />
      )}

      {/* Member card */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable
          className="flex-1 justify-end bg-ink/30"
          onPress={() => setSelected(null)}
        >
          {selected ? (
            <View className="rounded-t-3xl bg-surface1 px-6 pb-10 pt-4">
              <View className="mb-2 items-end">
                <Pressable onPress={() => setSelected(null)} className="p-1">
                  <X color={colors.ink} size={20} />
                </Pressable>
              </View>
              <View className="items-center">
                <Avatar
                  name={selected.name}
                  photoUrl={visiblePhotoUrl(selected, myHouse)}
                  ringColor={selected.houses?.color}
                  size={88}
                />
                <Text className="mt-3 font-display text-2xl text-ink">
                  {selected.name}
                </Text>
                <Text className="mt-1 text-sm text-ink/55">
                  {selected.houses?.name ?? "No house"}
                  {selected.dept ? ` · ${selected.dept}` : ""}
                  {selected.year ? ` · ${selected.year}` : ""}
                </Text>
              </View>
              <Pressable
                onPress={() => onMessage(selected)}
                disabled={createDm.isPending}
                className="mt-6 h-13 flex-row items-center justify-center gap-2 rounded-full bg-copper py-3.5 active:opacity-90 disabled:opacity-50"
              >
                {createDm.isPending ? (
                  <ActivityIndicator color={colors.parchment} />
                ) : (
                  <>
                    <MessageSquare color={colors.parchment} size={18} />
                    <Text className="font-sans-semibold text-base text-parchment">
                      Send a message
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <View />
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
