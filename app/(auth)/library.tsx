import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Bookmark, Highlighter, BookOpen } from "lucide-react-native";
import { useLibraryEntries } from "@/lib/queries/library";
import { colors, highlightColors } from "@/theme/colors";

// The member's saved verses: bookmarks and highlights in one place. Tapping an
// entry opens the Bible at that chapter.
export default function Library() {
  const router = useRouter();
  const { data: entries, isLoading, isError, refetch } = useLibraryEntries();

  const openInBible = (bookAbbrev: string, chapter: number) =>
    router.push({
      pathname: "/(auth)/(tabs)/bible",
      params: { book: bookAbbrev, chapter: String(chapter) },
    });

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="font-display text-xl text-ink">Your library</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            We could not load your library.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-full border border-border px-6 py-3 active:opacity-70"
          >
            <Text className="font-sans-medium text-ink">Try again</Text>
          </Pressable>
        </View>
      ) : !entries || entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface2">
            <BookOpen color={colors.copper} size={28} />
          </View>
          <Text className="mt-5 text-center font-display text-xl text-ink">
            Nothing saved yet
          </Text>
          <Text className="mt-2 text-center text-sm leading-6 text-ink/60">
            Bookmark or highlight a verse while you read and it will gather here.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-16 pt-2 gap-3"
          showsVerticalScrollIndicator={false}
        >
          {entries.map((e) => (
            <Pressable
              key={e.key}
              onPress={() => openInBible(e.bookAbbrev, e.chapter)}
              className="rounded-2xl border border-border bg-surface1 p-4 active:opacity-90"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-sm text-oxblood">
                  {e.reference}
                </Text>
                {e.kind === "highlight" ? (
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: e.color
                          ? highlightColors[e.color]
                          : colors.copper,
                      }}
                    />
                    <Highlighter color={colors.ink} size={14} />
                  </View>
                ) : (
                  <Bookmark color={colors.copper} size={14} fill={colors.copper} />
                )}
              </View>
              <Text
                className="mt-2 font-scripture text-base leading-6 text-ink"
                numberOfLines={3}
              >
                {e.text}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
