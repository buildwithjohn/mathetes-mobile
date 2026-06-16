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
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
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
            {/* Testament tabs (underline style).
                TODO(backend): the design's "Recently read" chips need a
                reading-history table; only a single reading_position is
                persisted today, so the row is omitted. */}
            <View className="mx-5 mb-2.5 mt-1 flex-row border-b border-rule">
              {(["OT", "NT"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTestament(t)}
                  className={`px-4 py-2.5 ${
                    testament === t ? "-mb-px border-b-2 border-b-copper" : ""
                  }`}
                >
                  <Text
                    className={`font-sans-medium text-[13px] ${
                      testament === t ? "text-ink" : "text-ink-mute"
                    }`}
                  >
                    {t === "OT" ? "Old Testament" : "New Testament"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ScrollView contentContainerClassName="px-5 pb-6">
              {filtered.map((b, i) => (
                <Pressable
                  key={b.id}
                  onPress={() => setBook(b)}
                  className={`flex-row items-center justify-between py-3.5 active:opacity-60 ${
                    i < filtered.length - 1 ? "border-b border-rule-soft" : ""
                  }`}
                >
                  <Text className="text-[15px] text-ink">{b.name}</Text>
                  <ChevronRight color={colors.inkFaint} size={14} strokeWidth={1.5} />
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
