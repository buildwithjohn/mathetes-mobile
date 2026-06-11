import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MailCheck } from "lucide-react-native";
import { colors } from "@/theme/colors";

// Shown after sign-up when the project requires email confirmation (Supabase
// returns no session). Members land here instead of a session-less house
// picker; once they confirm, they sign in and onboarding continues.
export default function Confirm() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 items-center justify-center px-8">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-copper/15">
          <MailCheck color={colors.copper} size={30} />
        </View>
        <Text className="mt-6 text-center font-display text-3xl text-ink">
          Check your email
        </Text>
        <Text className="mt-3 max-w-xs text-center text-base leading-6 text-ink/70">
          We sent a confirmation link to your inbox. Tap it to verify your
          account, then sign in to choose your campus and house.
        </Text>
      </View>

      <View className="px-6 pb-10">
        <Pressable
          onPress={() => router.replace("/(onboarding)/signin")}
          className="h-14 items-center justify-center rounded-full bg-copper active:opacity-90"
        >
          <Text className="font-sans-semibold text-base text-parchment">
            I have confirmed, sign in
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
