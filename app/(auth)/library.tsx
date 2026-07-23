import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Bookmark, Highlighter, BookOpen } from "lucide-react-native";
import { useLibraryEntries } from "@/lib/queries/library";
import { useSavedDevotionals, useSavedWords } from "@/lib/queries/content";
import { EmptyState } from "@/components/EmptyState";
import { colors, highlightColors } from "@/theme/colors";

// The member's saved verses: bookmarks and highlights in one place. Tapping an
// entry opens the Bible at that chapter.
export default function Library() {
  const router = useRouter();
  const { data: entries, isLoading, isError, refetch } = useLibraryEntries();
  const {
    data: savedDevotionals,
    isLoading: devotionalsLoading,
    isError: devotionalsError,
    refetch: refetchDevotionals,
  } = useSavedDevotionals();
  const {
    data: savedWords,
    isLoading: wordsLoading,
    isError: wordsError,
    refetch: refetchWords,
  } = useSavedWords();

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

      {isLoading || devotionalsLoading || wordsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : isError || devotionalsError || wordsError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-ink/60">
            We could not load your library.
          </Text>
          <Pressable
            onPress={() => {
              refetch();
              refetchDevotionals();
              refetchWords();
            }}
            className="mt-4 rounded-full border border-border px-6 py-3 active:opacity-70"
          >
            <Text className="font-sans-medium text-ink">Try again</Text>
          </Pressable>
        </View>
      ) : (!entries || entries.length === 0) &&
        (!savedDevotionals || savedDevotionals.length === 0) &&
        (!savedWords || savedWords.length === 0) ? (
        <View className="flex-1 items-center justify-center">
          <EmptyState
            icon={BookOpen}
            title="Nothing saved yet"
            body="Save a Word or devotional, or bookmark and highlight a verse, and it will gather here."
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-16 pt-2 gap-3"
          showsVerticalScrollIndicator={false}
        >
          {savedDevotionals && savedDevotionals.length > 0 ? (
            <>
              <Text className="mb-1 font-sans-semibold text-xs uppercase tracking-widest text-ink-mute">
                Saved devotionals
              </Text>
              {savedDevotionals.map((devotional) => (
                <Pressable
                  key={devotional.id}
                  onPress={() => router.push(`/devotional/${devotional.id}`)}
                  className="rounded-2xl border border-border bg-surface1 p-4 active:opacity-90"
                >
                  <Text className="font-display text-xl text-ink">
                    {devotional.title}
                  </Text>
                  <Text className="mt-1 text-xs text-ink-mute">
                    {devotional.reading_time_minutes
                      ? `${devotional.reading_time_minutes} min read`
                      : "Devotional"}
                  </Text>
                </Pressable>
              ))}
            </>
          ) : null}

          {savedWords && savedWords.length > 0 ? (
            <>
              <Text className="mb-1 mt-4 font-sans-semibold text-xs uppercase tracking-widest text-ink-mute">
                Saved Words
              </Text>
              {savedWords.map((word) => (
                <Pressable
                  key={word.id}
                  onPress={() => word.publish_date && router.push(`/word/${word.publish_date}`)}
                  className="rounded-2xl border border-border bg-surface1 p-4 active:opacity-90"
                >
                  <Text className="font-sans-semibold text-sm text-oxblood">
                    {word.verse_ref} · KJV
                  </Text>
                  <Text
                    className="mt-2 font-scripture text-base leading-6 text-ink"
                    numberOfLines={3}
                  >
                    {word.verse_text}
                  </Text>
                </Pressable>
              ))}
            </>
          ) : null}

          {entries && entries.length > 0 ? (
            <Text className="mb-1 mt-4 font-sans-semibold text-xs uppercase tracking-widest text-ink-mute">
              Saved scripture
            </Text>
          ) : null}
          {(entries ?? []).map((e) => (
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
