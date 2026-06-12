import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { MailCheck, Sparkles } from "lucide-react-native";
import { colors } from "@/theme/colors";

// Celebratory post-sign-up screen (shown when email confirmation is required):
// "you're almost in" energy, then off to confirm.
export default function Confirm() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          entering={FadeIn.duration(500)}
          className="h-20 w-20 items-center justify-center rounded-3xl bg-copper/15"
        >
          <MailCheck color={colors.copper} size={36} />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(150).duration(500)}
          className="mt-3 flex-row items-center gap-1.5"
        >
          <Sparkles color={colors.copper} size={14} />
          <Text className="text-xs uppercase tracking-[3px] text-copper">
            Welcome to Mathetes
          </Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(250).duration(500)}
          className="mt-3 text-center font-display text-4xl leading-tight text-ink"
        >
          You're almost in.
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(380).duration(500)}
          className="mt-3 max-w-xs text-center text-base leading-7 text-ink/70"
        >
          We sent a confirmation link to your email. Tap it to verify your
          account, then sign in to set up your campus, house, and profile. Your
          journey of daily discipleship starts here.
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        className="px-6 pb-10"
      >
        <Pressable
          onPress={() => router.replace("/(onboarding)/signin")}
          className="h-14 items-center justify-center rounded-full bg-copper active:opacity-90"
        >
          <Text className="font-sans-semibold text-base text-parchment">
            I have confirmed, sign in
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
