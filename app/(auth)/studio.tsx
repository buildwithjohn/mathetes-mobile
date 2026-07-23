import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { X, Download, Share2, Check, ImagePlus } from "lucide-react-native";
import { useProfile, useHouses } from "@/lib/queries/profile";
import {
  verseThemes,
  houseTheme,
  verseTypeScale,
  galleryTheme,
  type VerseTheme,
} from "@/lib/verseImage";
import { useSaveVerseImage } from "@/lib/queries/verseImages";
import {
  type ContentSignalKind,
  useRecordContentShare,
} from "@/lib/queries/contentSignals";
import { colors } from "@/theme/colors";

type ImageContrast = {
  text: string;
  accent: string;
  labelSurface: string;
  readingSurface: string;
  footerSurface: string;
};

const lightImageContrast: ImageContrast = {
  text: "#17242E",
  accent: "#9B2C36",
  labelSurface: "rgba(255,255,255,0.84)",
  readingSurface: "rgba(255,255,255,0.90)",
  footerSurface: "rgba(255,255,255,0.76)",
};

const darkImageContrast: ImageContrast = {
  text: "#FFFFFF",
  accent: "#FFB4BB",
  labelSurface: "rgba(11,24,35,0.70)",
  readingSurface: "rgba(11,24,35,0.82)",
  footerSurface: "rgba(11,24,35,0.68)",
};

function luminance(hex: string) {
  const match = hex.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return 0;
  const channel = (value: string) => {
    const normalized = parseInt(value, 16) / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(match[1]) + 0.7152 * channel(match[2]) + 0.0722 * channel(match[3]);
}

function contrastForImage(color: string): ImageContrast {
  return luminance(color) > 0.36 ? lightImageContrast : darkImageContrast;
}

// Renders a verse onto a branded, shareable card and saves or shares it as a
// PNG. Entry points pass the verse via route params (Word of the Day, Bible).
export default function Studio() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    text?: string;
    reference?: string;
    label?: string;
    backgroundUrl?: string;
    signalKind?: ContentSignalKind;
    signalContentId?: string;
  }>();

  const { data: profile } = useProfile();
  const { data: houses } = useHouses();
  const house = houses?.find((h) => h.id === profile?.house_id) ?? null;

  const text = (params.text ?? "").trim();
  const reference = (params.reference ?? "").trim();
  const label = (params.label ?? "Mathetes").trim();
  const [backgroundUri, setBackgroundUri] = useState<string | number | null>(params.backgroundUrl ?? null);
  const [imageContrast, setImageContrast] = useState<ImageContrast>(darkImageContrast);
  const curatedBackgrounds = [
    { key: "dawn", label: "Dawn", source: require("../../assets/images/devotional-fallback-v1.png") },
    { key: "study", label: "Study", source: require("../../assets/images/share-study-v1.png") },
    { key: "house", label: "Together", source: require("../../assets/images/share-house-v1.png") },
  ];

  // Brand themes, plus the member's house color when known.
  const themes = useMemo<VerseTheme[]>(() => {
    const base = [...verseThemes];
    if (house?.color) base.push(houseTheme(house.name, house.color));
    return base;
  }, [house]);

  const [themeIndex, setThemeIndex] = useState(0);
  const theme = themes[themeIndex] ?? verseThemes[0];
  const scale = verseTypeScale(text.length);

  // Image palettes are available in installed builds. Expo Go deliberately
  // falls back to the high-contrast dark reading surface because it does not
  // include this small native palette module.
  useEffect(() => {
    let cancelled = false;
    if (!backgroundUri) return;

    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      setImageContrast(darkImageContrast);
      return;
    }

    const uri = typeof backgroundUri === "string"
      ? backgroundUri
      : Image.resolveAssetSource(backgroundUri).uri;

    void import("react-native-image-colors")
      .then(({ getColors }) => getColors(uri, { fallback: "#17242E", cache: true, key: uri }))
      .then((palette) => {
        if (cancelled) return;
        const sampledColor = palette.platform === "ios"
          ? palette.background
          : palette.platform === "android"
            ? palette.average || palette.dominant
            : palette.dominant;
        setImageContrast(contrastForImage(sampledColor));
      })
      .catch(() => {
        if (!cancelled) setImageContrast(darkImageContrast);
      });

    return () => {
      cancelled = true;
    };
  }, [backgroundUri]);

  const cardRef = useRef<View>(null);
  const saveToGallery = useSaveVerseImage();
  const recordContentShare = useRecordContentShare();
  const [busy, setBusy] = useState<null | "save" | "share">(null);
  const [flash, setFlash] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

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
        if (params.signalKind && params.signalContentId) {
          recordContentShare.mutate({
            kind: params.signalKind,
            contentId: params.signalContentId,
          });
        }
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

  const chooseBackground = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 5],
    });
    if (!result.canceled) setBackgroundUri(result.assets[0]?.uri ?? null);
  };

  const hasImageBackground = backgroundUri !== null;
  const cardText = hasImageBackground ? imageContrast.text : theme.text;
  const cardAccent = hasImageBackground ? imageContrast.accent : theme.accent;

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
              {backgroundUri ? (
                <ImageBackground source={typeof backgroundUri === "string" ? { uri: backgroundUri } : backgroundUri} className="absolute inset-0" resizeMode="cover" />
              ) : null}
              <View className="flex-1 justify-between p-7">
                <View
                  className={hasImageBackground ? "self-start rounded-full px-3 py-2" : ""}
                  style={hasImageBackground ? { backgroundColor: imageContrast.labelSurface } : undefined}
                >
                  <Text
                    className="font-sans-semibold"
                    style={{ color: hasImageBackground ? cardText : theme.accent, fontSize: 10, letterSpacing: 2.5 }}
                  >
                    {label.toUpperCase()}
                  </Text>
                </View>

                <View
                  className={hasImageBackground ? "rounded-[28px] px-5 py-6" : ""}
                  style={hasImageBackground ? { backgroundColor: imageContrast.readingSurface } : undefined}
                >
                  <Text
                    className="font-scripture"
                    style={{
                      color: cardText,
                      fontSize: scale.fontSize,
                      lineHeight: scale.lineHeight,
                    }}
                  >
                    {text}
                  </Text>
                  <View
                    className="mt-5 rounded-full"
                    style={{ height: 2, width: 32, backgroundColor: cardAccent }}
                  />
                  <Text
                    className="mt-4 font-sans-semibold"
                    style={{ color: cardAccent, fontSize: 15, letterSpacing: 0.5 }}
                  >
                    {reference}
                  </Text>
                </View>

                <View
                  className={`flex-row items-end justify-between ${hasImageBackground ? "rounded-2xl px-4 py-3" : ""}`}
                  style={hasImageBackground ? { backgroundColor: imageContrast.footerSurface } : undefined}
                >
                  <Text
                    className="font-display"
                    style={{ color: cardText, fontSize: 18, opacity: 0.92 }}
                  >
                    Mathetes
                  </Text>
                  <Text
                    className="font-sans-medium"
                    style={{
                      color: cardText,
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

            <View className="mt-7 flex-row items-center justify-center gap-3">
              <Pressable
                onPress={chooseBackground}
                className="h-10 w-10 items-center justify-center rounded-full border-2 border-rule bg-paper"
                accessibilityLabel="Choose a photo background"
              >
                <ImagePlus color={colors.ink} size={18} />
              </Pressable>
              {curatedBackgrounds.map((background) => (
                <Pressable
                  key={background.key}
                  onPress={() => setBackgroundUri(background.source)}
                  className="h-10 w-10 overflow-hidden rounded-full border-2"
                  style={{ borderColor: backgroundUri === background.source ? colors.copper : colors.border }}
                  accessibilityLabel={`${background.label} background`}
                >
                  <Image source={background.source} className="h-full w-full" resizeMode="cover" />
                </Pressable>
              ))}
              {backgroundUri ? (
                <Pressable onPress={() => setBackgroundUri(null)} className="rounded-full border border-rule px-3 py-2">
                  <Text className="text-xs text-ink-soft">Use colours</Text>
                </Pressable>
              ) : null}
            </View>
            {hasImageBackground ? (
              <Text className="mt-3 text-center text-xs text-ink-soft">
                Auto contrast keeps the verse clear on this image.
              </Text>
            ) : null}
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
          <View
            className="flex-row gap-3 border-t border-border bg-parchment px-6 pt-4"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
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
