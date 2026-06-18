import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Clock, RefreshCw } from "lucide-react-native";
import { useProfile } from "@/lib/queries/profile";
import { useAuth } from "@/lib/stores/auth";
import { colors } from "@/theme/colors";

// Shown to members whose status is not 'active' (pending domain-allowlist
// approval, or rejected/suspended). Pending users are walled off server-side
// (null parish + RLS), so this is the only screen they should see.
export default function Pending() {
  const router = useRouter();
  const signOut = useAuth((s) => s.signOut);
  const { data: profile, refetch, isFetching } = useProfile();
  const status = profile?.status ?? "pending";

  // The moment a leader approves them, route into the app (AuthGate then takes
  // them to campus/house as needed).
  useEffect(() => {
    if (status === "active") router.replace("/(auth)/(tabs)/today");
  }, [status, router]);

  const copy =
    status === "rejected"
      ? {
          title: "Not approved",
          body: "Your request to join wasn't approved. If you think this is a mistake, reach out to a house leader.",
        }
      : status === "suspended"
        ? {
            title: "Account paused",
            body: "Your access is paused for now. Please speak with your house leader or pastor.",
          }
        : {
            title: "Almost there",
            body: "Your account is awaiting approval. Students who signed up with a school email are approved automatically; otherwise a house leader will let you in shortly.",
          };

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.copper}1F` }}
        >
          <Clock color={colors.copper} size={30} strokeWidth={1.7} />
        </View>
        <Text
          className="mt-6 font-sans-medium text-[11px] uppercase text-ink-mute"
          style={{ letterSpacing: 1.76 }}
        >
          {status === "pending" ? "Pending approval" : "Account status"}
        </Text>
        <Text className="mt-2 text-center font-display text-[28px] leading-[33px] text-ink">
          {copy.title}
        </Text>
        <Text className="mt-3 max-w-[320px] text-center text-[15px] leading-[23px] text-ink-soft">
          {copy.body}
        </Text>

        {status === "pending" ? (
          <Pressable
            onPress={() => refetch()}
            disabled={isFetching}
            className="mt-7 h-12 flex-row items-center justify-center gap-2 rounded-full bg-ink px-7 active:opacity-90 disabled:opacity-50"
          >
            {isFetching ? (
              <ActivityIndicator color={colors.parchment} />
            ) : (
              <>
                <RefreshCw color={colors.parchment} size={16} strokeWidth={1.8} />
                <Text className="font-sans-semibold text-base text-parchment">
                  Check again
                </Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>

      <View className="px-6 pb-10">
        <Pressable
          onPress={signOut}
          className="h-12 items-center justify-center rounded-full border border-rule active:opacity-70"
        >
          <Text className="font-sans-medium text-ink">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
