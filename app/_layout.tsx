import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { SourceSerif4_400Regular } from "@expo-google-fonts/source-serif-4";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import { useTheme } from "@/lib/stores/theme";
import { AuthDeepLinks } from "@/components/AuthDeepLinks";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
});

export default function RootLayout() {
  const setSession = useAuth((s) => s.setSession);

  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SourceSerif4_400Regular,
  });

  // Load the saved theme (System/Light/Dark) and apply it before first paint.
  useEffect(() => {
    useTheme.getState().init();
  }, []);

  useEffect(() => {
    let mounted = true;
    // A stale/invalid refresh token in storage makes the auto-refresh throw
    // ("Invalid Refresh Token"). Treat any session error as logged-out and
    // clear the bad token, rather than surfacing a red error to the user.
    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!mounted) return;
        if (error) {
          await supabase.auth.signOut().catch(() => {});
          setSession(null);
        } else {
          setSession(data.session);
        }
      })
      .catch(async () => {
        if (!mounted) return;
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider statusBarTranslucent>
          <QueryClientProvider client={queryClient}>
            <ThemedStatusBar />
            <AuthDeepLinks />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(auth)" />
            </Stack>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Status-bar content (clock/icons) follows the active scheme so it stays
// legible on the dark background.
function ThemedStatusBar() {
  const { colorScheme } = useColorScheme();
  return <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />;
}
