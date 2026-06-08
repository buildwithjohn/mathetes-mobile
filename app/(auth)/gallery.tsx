import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { ChevronLeft, ImageIcon, Share2, Trash2, X } from "lucide-react-native";
import {
  useVerseImages,
  useDeleteVerseImage,
} from "@/lib/queries/verseImages";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import type { VerseImage } from "@/lib/database.types";

const GAP = 12;
const COLS = 2;
const SIZE = Math.floor(
  (Dimensions.get("window").width - 16 * 2 - GAP) / COLS
);

export default function Gallery() {
  const router = useRouter();
  const { data: images, isLoading } = useVerseImages();
  const remove = useDeleteVerseImage();
  const [active, setActive] = useState<VerseImage | null>(null);
  const [sharing, setSharing] = useState(false);

  const onShare = async (image: VerseImage) => {
    try {
      setSharing(true);
      const dest = `${FileSystem.cacheDirectory}verse-${image.id}.png`;
      const { uri } = await FileSystem.downloadAsync(image.url, dest);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png" });
      }
    } catch {
      Alert.alert("Could not share", "Something went wrong. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const onDelete = (image: VerseImage) => {
    Alert.alert("Delete image", "Remove this from your gallery?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove.mutate(image);
          setActive(null);
        },
      },
    ]);
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
        <Text className="font-display text-xl text-ink">Verse images</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <FlatList
          data={images ?? []}
          keyExtractor={(i) => i.id}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ padding: 16, gap: GAP, paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() => setActive(item)}
                className="active:opacity-90"
              >
                <Image
                  source={{ uri: item.url }}
                  style={{ width: SIZE, height: SIZE * 1.25, borderRadius: 16 }}
                  resizeMode="cover"
                />
              </Pressable>
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={ImageIcon}
              title="No verse images yet"
              body="Open a Word or a Bible verse, tap Share as image, and save one to gather it here."
            />
          }
        />
      )}

      {/* Full-screen viewer */}
      <Modal
        visible={!!active}
        transparent
        animationType="fade"
        onRequestClose={() => setActive(null)}
      >
        <View className="flex-1 bg-ink/95">
          <View className="flex-row justify-end px-4 pt-14">
            <Pressable
              onPress={() => setActive(null)}
              className="h-11 w-11 items-center justify-center"
              accessibilityLabel="Close"
            >
              <X color={colors.parchment} size={26} />
            </Pressable>
          </View>
          {active ? (
            <View className="flex-1 items-center justify-center px-6">
              <Image
                source={{ uri: active.url }}
                style={{ width: "100%", height: "78%" }}
                resizeMode="contain"
              />
              <View className="mt-6 flex-row gap-3">
                <Pressable
                  onPress={() => onShare(active)}
                  disabled={sharing}
                  className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-copper px-6 active:opacity-90 disabled:opacity-60"
                >
                  {sharing ? (
                    <ActivityIndicator color={colors.parchment} />
                  ) : (
                    <>
                      <Share2 color={colors.parchment} size={18} />
                      <Text className="font-sans-semibold text-parchment">
                        Share
                      </Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => onDelete(active)}
                  className="h-12 w-12 items-center justify-center rounded-full border border-parchment/30 active:opacity-70"
                  accessibilityLabel="Delete"
                >
                  <Trash2 color={colors.parchment} size={20} />
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
