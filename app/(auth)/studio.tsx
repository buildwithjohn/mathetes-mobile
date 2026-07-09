import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { X, Download, Share2, Check } from "lucide-react-native";
import { useProfile, useHouses } from "@/lib/queries/profile";
import {
  verseThemes,
  houseTheme,
  verseTypeScale,
  galleryTheme,
  type VerseTheme,
} from "@/lib/verseImage";
import { useSaveVerseImage } from "@/lib/queries/verseImages";
import { colors } from "@/theme/colors";

// Renders a verse onto a branded, shareable card and saves or shares it as a
// PNG. Entry points pass the verse via route params (Word of the Day, Bible).
export default function Studio() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    text?: string;
    reference?: string;
    label?: string;
  }>();

  const { data: profile } = useProfile();
  const { data: houses } = useHouses();
  const house = houses?.find((h) => h.id === profile?.house_id) ?? null;

  const text = (params.text ?? "").trim();
  const reference = (params.reference ?? "").trim();
  const label = (params.label ?? "Mathetes").trim();

  // Brand themes, plus the member's house color when known.
  const themes = useMemo<VerseTheme[]>(() => {
    const base = [...verseThemes];
    if (house?.color) base.push(houseTheme(house.name, house.color));
    return base;
  }, [house]);

  const [themeIndex, setThemeIndex] = useState(0);
  const theme = themes[themeIndex] ?? verseThemes[0];
  const scale = verseTypeScale(text.length);

  const cardRef = useRef<View>(null);
  const saveToGallery = useSaveVerseImage();
  const [busy, setBusy] = useState<null | "save" | "share">(null);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1600);
  };

  const capture = () =>
    captureRef(cardRef, { format: "png", quality: 1 });

  const onSave = async () => {
    try {
      setBusy("save");
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Photo access needed",
          "Allow access to your photos to save this verse image."
        );
        return;
      }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      // Also keep it in the in-app gallery (best-effort; never blocks the save).
      saveToGallery.mutate(
        {
          localUri: uri,
          verseRef: reference,
          verseText: text,
          theme: galleryTheme(theme.key),
        },
        { onError: () => undefined }
      );
      showFlash("Saved to Photos & gallery");
    } catch {
      Alert.alert("Could not save", "Something went wrong creating the image.");
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    try {
      setBusy("share");
      const uri = await capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share this verse",
        });
      } else {
        Alert.alert(
          "Sharing unavailable",
          "Sharing is not available on this device."
        );
      }
    } catch {
      Alert.alert("Could not share", "Something went wrong creating the image.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Close"
        >
          <X color={colors.ink} size={24} />
        </Pressable>
        <Text className="font-display text-lg text-ink">Verse image</Text>
        <View className="h-11 w-11" />
      </View>

      {!text ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            No verse to render. Open a Word or a Bible verse to start.
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-1 justify-center px-6">
            {/* The shareable card. collapsable={false} keeps it captureable. */}
            <View
              ref={cardRef}
              collapsable={false}
              className="w-full overflow-hidden rounded-3xl"
              style={{ aspectRatio: 4 / 5, backgroundColor: theme.bg }}
            >
              <View className="flex-1 justify-between p-8">
                <Text
                  className="font-sans-medium"
                  style={{ color: theme.accent, fontSize: 11, letterSpacing: 3 }}
                >
                  {label.toUpperCase()}
                </Text>

                <View>
                  <Text
                    className="font-scripture"
                    style={{
                      color: theme.text,
                      fontSize: scale.fontSize,
                      lineHeight: scale.lineHeight,
                    }}
                  >
                    {text}
                  </Text>
                  <View
                    className="mt-5 rounded-full"
                    style={{ height: 2, width: 32, backgroundColor: theme.accent }}
                  />
                  <Text
                    className="mt-4 font-sans-semibold"
                    style={{ color: theme.accent, fontSize: 15, letterSpacing: 0.5 }}
                  >
                    {reference}
                  </Text>
                </View>

                <View className="flex-row items-end justify-between">
                  <Text
                    className="font-display"
                    style={{ color: theme.text, fontSize: 18, opacity: 0.92 }}
                  >
                    Mathetes
                  </Text>
                  <Text
                    className="font-sans-medium"
                    style={{
                      color: theme.text,
                      opacity: 0.5,
                      fontSize: 10,
                      letterSpacing: 2,
                    }}
                  >
                    CCCFSP FUOYE
                  </Text>
                </View>
              </View>
            </View>

            {/* Theme swatches */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-7"
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                paddingHorizontal: 24,
              }}
            >
              {themes.map((t, i) => {
                const active = i === themeIndex;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setThemeIndex(i)}
                    accessibilityLabel={`${t.name} theme`}
                    className="h-10 w-10 items-center justify-center rounded-full border-2"
                    style={{
                      backgroundColor: t.bg,
                      borderColor: active ? colors.copper : colors.border,
                    }}
                  >
                    {active ? <Check color={t.accent} size={16} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Footer actions */}
          <View className="flex-row gap-3 border-t border-border bg-parchment px-6 pb-8 pt-4">
            <Pressable
              onPress={onSave}
              disabled={busy !== null}
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-border active:opacity-70 disabled:opacity-40"
            >
              {busy === "save" ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <>
                  <Download color={colors.ink} size={18} />
                  <Text className="font-sans-medium text-ink">Save</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={onShare}
              disabled={busy !== null}
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-copper active:opacity-90 disabled:opacity-60"
            >
              {busy === "share" ? (
                <ActivityIndicator color={colors.parchment} />
              ) : (
                <>
                  <Share2 color={colors.parchment} size={18} />
                  <Text className="font-sans-semibold text-parchment">Share</Text>
                </>
              )}
            </Pressable>
          </View>
        </>
      )}

      {/* Flash confirmation */}
      {flash ? (
        <View className="absolute inset-x-0 bottom-24 items-center">
          <View className="rounded-full bg-ink px-4 py-2">
            <Text className="text-sm text-parchment">{flash}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
