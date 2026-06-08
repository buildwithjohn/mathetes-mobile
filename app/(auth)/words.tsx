import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format, parseISO } from "date-fns";
import { ChevronLeft } from "lucide-react-native";
import { useWordArchive } from "@/lib/queries/content";
import { colors } from "@/theme/colors";

export default function Words() {
  const router = useRouter();
  const { data: words, isLoading } = useWordArchive();

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
        <Text className="font-display text-xl text-ink">Words of the Day</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <FlatList
          data={words ?? []}
          keyExtractor={(w) => w.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                item.publish_date && router.push(`/word/${item.publish_date}`)
              }
              disabled={!item.publish_date}
              className="overflow-hidden rounded-2xl border border-border bg-surface1 active:opacity-90"
            >
              <View className="h-1.5 w-full bg-copper" />
              <View className="p-4">
                {item.publish_date ? (
                  <Text className="text-xs uppercase tracking-widest text-copper">
                    {format(parseISO(item.publish_date), "EEEE, d MMM yyyy")}
                  </Text>
                ) : null}
                <Text
                  className="mt-2 font-scripture text-base leading-7 text-ink"
                  numberOfLines={3}
                >
                  {item.verse_text}
                </Text>
                <Text className="mt-2 font-sans-medium text-sm text-oxblood">
                  {item.verse_ref}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text className="mt-10 text-center text-sm text-ink/50">
              Past Words will appear here.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
