import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, ChevronLeft } from "lucide-react-native";
import { useBookChapters } from "@/lib/queries/bible";
import type { BibleBook, Testament } from "@/lib/database.types";
import { colors } from "@/theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  books: BibleBook[];
  onSelect: (abbrev: string, chapter: number) => void;
};

// Book selector (OT/NT tabs) then a chapter grid for the chosen book.
export function BibleNavigator({ visible, onClose, books, onSelect }: Props) {
  const [testament, setTestament] = useState<Testament>("OT");
  const [book, setBook] = useState<BibleBook | null>(null);
  const { data: chapters, isLoading } = useBookChapters(book?.id ?? null);

  const close = () => {
    setBook(null);
    onClose();
  };

  const filtered = books.filter((b) => b.testament === testament);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2">
          {book ? (
            <Pressable
              onPress={() => setBook(null)}
              className="h-11 w-11 items-center justify-center"
              accessibilityLabel="Back to books"
            >
              <ChevronLeft color={colors.ink} size={26} />
            </Pressable>
          ) : (
            <View className="h-11 w-11" />
          )}
          <Text className="font-display text-lg text-ink">
            {book ? book.name : "Books"}
          </Text>
          <Pressable
            onPress={close}
            className="h-11 w-11 items-center justify-center"
            accessibilityLabel="Close"
          >
            <X color={colors.ink} size={24} />
          </Pressable>
        </View>

        {book ? (
          // Chapter grid
          isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.copper} />
            </View>
          ) : (
            <ScrollView contentContainerClassName="flex-row flex-wrap gap-2 p-4">
              {(chapters ?? []).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => {
                    onSelect(book.abbrev, n);
                    setBook(null);
                  }}
                  className="h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface1 active:bg-surface2"
                >
                  <Text className="font-sans-medium text-base text-ink">{n}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )
        ) : (
          <>
            {/* Testament tabs */}
            <View className="mx-4 mb-2 mt-1 flex-row rounded-full bg-surface2 p-1">
              {(["OT", "NT"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTestament(t)}
                  className={`flex-1 items-center rounded-full py-2 ${
                    testament === t ? "bg-surface1" : ""
                  }`}
                >
                  <Text
                    className={`font-sans-medium text-sm ${
                      testament === t ? "text-ink" : "text-ink/50"
                    }`}
                  >
                    {t === "OT" ? "Old Testament" : "New Testament"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ScrollView contentContainerClassName="px-4 pb-6">
              {filtered.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => setBook(b)}
                  className="flex-row items-center justify-between border-b border-border/60 py-3.5 active:opacity-60"
                >
                  <Text className="text-base text-ink">{b.name}</Text>
                  <Text className="text-xs text-ink/40">{b.abbrev}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
