import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, GraduationCap, House, MessageSquare, Quote, UserRound } from "lucide-react-native";
import { Avatar } from "@/components/Avatar";
import { useCreateDm, useParishMember } from "@/lib/queries/community";
import { useProfile } from "@/lib/queries/profile";
import { visiblePhotoUrl } from "@/utils/profile";
import { colors } from "@/theme/colors";

const ROLE_LABEL: Record<string, string> = {
  house_leader: "House Leader",
  discipler: "Discipler",
  pastor: "Pastor",
  admin: "Admin",
};

export default function MemberProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: me } = useProfile();
  const { data: member, isLoading, isError } = useParishMember(id ?? "");
  const createDm = useCreateDm();

  const onMessage = () => {
    if (!member) return;
    createDm.mutate(member.id, {
      onSuccess: (chatId) => router.replace(`/chat/${chatId}`),
      onError: (error) =>
        Alert.alert(
          "Could not open chat",
          error instanceof Error ? error.message : "Please try again."
        ),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center border-b border-rule-soft px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="flex-1 text-center font-display text-[19px] text-ink">Profile</Text>
        <View className="h-11 w-11" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || !member ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-display text-xl text-ink">Profile unavailable</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-ink-mute">
            This member may no longer be active in your parish.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-8 pt-7"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <Avatar
                name={member.name}
                photoUrl={visiblePhotoUrl(member, me?.house_id ?? null)}
                size={112}
              />
              <Text className="mt-4 text-center font-display text-[29px] leading-9 text-ink">
                {member.name}
              </Text>
              <Text className="mt-1 text-[13px] text-ink-mute">
                {member.houses?.name ?? "Parish member"}
                {ROLE_LABEL[member.role] ? ` · ${ROLE_LABEL[member.role]}` : ""}
              </Text>
            </View>

            <ProfileSection icon={UserRound} title="About">
              {member.bio || "This member has not added an introduction yet."}
            </ProfileSection>

            <ProfileSection icon={Quote} title="Status">
              {member.thought || "No status shared yet."}
            </ProfileSection>

            <View className="mt-5 overflow-hidden rounded-2xl border border-rule bg-paper">
              <InfoRow icon={House} label="House" value={member.houses?.name ?? "Not assigned"} />
              <InfoRow
                icon={GraduationCap}
                label="Studies"
                value={[member.dept, member.year].filter(Boolean).join(" · ") || "Not shared"}
                divider
              />
              <InfoRow
                icon={BookOpen}
                label="Pinned verse"
                value={member.pinned_verse_ref ?? "Not shared"}
                divider
              />
            </View>
          </ScrollView>

          <View className="border-t border-rule-soft bg-parchment px-6 pb-8 pt-4">
            <Pressable
              onPress={onMessage}
              disabled={createDm.isPending}
              className="h-13 flex-row items-center justify-center gap-2 rounded-full bg-ink active:opacity-85 disabled:opacity-55"
            >
              {createDm.isPending ? (
                <ActivityIndicator color={colors.parchment} />
              ) : (
                <>
                  <MessageSquare color={colors.parchment} size={18} />
                  <Text className="font-sans-semibold text-base text-parchment">Message {member.name.split(" ")[0]}</Text>
                </>
              )}
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: string;
}) {
  return (
    <View className="mt-5 rounded-2xl border border-rule bg-paper px-5 py-4">
      <View className="flex-row items-center gap-2">
        <Icon color={colors.inkMute} size={15} strokeWidth={1.7} />
        <Text className="font-sans-semibold text-[11px] uppercase text-ink-mute" style={{ letterSpacing: 1.3 }}>
          {title}
        </Text>
      </View>
      <Text className="mt-2.5 text-[14px] leading-5 text-ink-soft">{children}</Text>
    </View>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  divider = false,
}: {
  icon: typeof House;
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View className={`flex-row items-center gap-3 px-4 py-4 ${divider ? "border-t border-rule-soft" : ""}`}>
      <Icon color={colors.inkMute} size={17} strokeWidth={1.6} />
      <View className="flex-1">
        <Text className="text-[11px] text-ink-mute">{label}</Text>
        <Text className="mt-0.5 font-sans-medium text-[14px] text-ink">{value}</Text>
      </View>
    </View>
  );
}
