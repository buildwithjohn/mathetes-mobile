import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, MessageSquare, Search, Users } from "lucide-react-native";
import {
  useParishMembers,
} from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import { Avatar } from "@/components/Avatar";
import { ScreenHero } from "@/components/ScreenHero";
import { visiblePhotoUrl } from "@/utils/profile";
import { haptic } from "@/utils/haptics";
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

  const [query, setQuery] = useState("");

  const myHouse = profile?.house_id ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members ?? [];
    return (members ?? []).filter((m) => m.name.toLowerCase().includes(q));
  }, [members, query]);

  return (
    <View className="flex-1 bg-parchment">
      <ScreenHero
        title="Members"
        subtitle={
          members && members.length > 0
            ? `${members.length} in the parish`
            : "The parish directory"
        }
        onBack={() => router.back()}
      />
      <View className="-mt-6 flex-1 rounded-t-[30px] bg-parchment pt-5">

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
                onPress={() => {
                  if (isMe) return;
                  haptic("light");
                  router.push({
                    // Expo regenerates this route union when Metro starts.
                    // Keep the object form so the member ID is never dropped.
                    pathname: "/member/[id]" as never,
                    params: { id: item.id },
                  });
                }}
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
            <View className="mt-24 items-center px-10">
              <Users color={colors.inkFaint} size={30} strokeWidth={1.5} />
              <Text className="mt-3 text-center text-[15px] text-ink/60">
                {query ? "No one matches that search." : "No members yet."}
              </Text>
              <Text className="mt-1 text-center text-[13px] text-ink/40">
                Approved members of your parish appear here.
              </Text>
            </View>
          }
        />
      )}
      </View>
    </View>
  );
}
