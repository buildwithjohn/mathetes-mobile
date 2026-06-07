import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search as SearchIcon } from "lucide-react-native";
import { useBibleSearch } from "@/lib/queries/bible";
import { colors } from "@/theme/colors";

export default function BibleSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useBibleSearch(query);
  const trimmed = query.trim();

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      {/* Search header */}
      <View className="flex-row items-center gap-2 px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded-full border border-border bg-surface1 px-4">
          <SearchIcon color={colors.ink} size={18} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search the Word"
            placeholderTextColor="#9C968A"
            className="flex-1 py-3 text-base text-ink"
            returnKeyType="search"
          />
        </View>
      </View>

      {trimmed.length < 2 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-ink/50">
            Search by keyword or phrase. Try "lean not unto" or "the LORD is my
            shepherd".
          </Text>
        </View>
      ) : isFetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.copper} />
        </View>
      ) : (results?.length ?? 0) === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-ink/50">
            No verses found for "{trimmed}".
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => r.verse_id}
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text className="py-3 text-xs uppercase tracking-widest text-ink/40">
              {results?.length} result{results?.length === 1 ? "" : "s"}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="mb-2 rounded-2xl border border-border bg-surface1 p-4">
              <Text className="text-xs font-sans-semibold text-oxblood">
                {item.reference}
              </Text>
              <Text className="mt-1.5 font-scripture text-base leading-7 text-ink">
                {item.text}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
