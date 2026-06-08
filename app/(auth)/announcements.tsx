import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronLeft, Megaphone, Calendar, MapPin, Clock } from "lucide-react-native";
import {
  useAnnouncements,
  announcementEvent,
} from "@/lib/queries/announcements";
import { paragraphs } from "@/utils/text";
import { colors } from "@/theme/colors";
import type { Announcement } from "@/lib/database.types";

export default function Announcements() {
  const router = useRouter();
  const { data: announcements, isLoading } = useAnnouncements();

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
        <Text className="font-display text-xl text-ink">Announcements</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={colors.copper} />
      ) : (
        <FlatList
          data={announcements ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
          renderItem={({ item }) => <AnnouncementCard a={item} />}
          ListEmptyComponent={
            <View className="items-center py-24 px-10">
              <Megaphone color={colors.copper} size={30} />
              <Text className="mt-4 text-center font-display text-xl text-ink">
                Nothing posted yet
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-ink/60">
                Parish news and events from your leaders will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function AnnouncementCard({ a }: { a: Announcement }) {
  const event = announcementEvent(a.event_data);
  const cover = a.photos[0] ?? null;
  const when = a.posted_at ?? a.publish_date ?? a.created_at;

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-surface1">
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      ) : null}
      <View className="p-4">
        {a.banner ? (
          <View
            className={`mb-2 self-start rounded-full px-2.5 py-1 ${
              a.banner === "urgent" ? "bg-oxblood/15" : "bg-copper/15"
            }`}
          >
            <Text
              className={`text-xs font-sans-semibold uppercase tracking-wide ${
                a.banner === "urgent" ? "text-oxblood" : "text-copper"
              }`}
            >
              {a.banner === "urgent" ? "Urgent" : "Event"}
            </Text>
          </View>
        ) : null}

        <Text className="font-display text-xl leading-7 text-ink">{a.title}</Text>

        {event ? (
          <View className="mt-3 gap-1.5 rounded-xl bg-surface2 p-3">
            {event.date ? (
              <Detail icon={Calendar} text={event.date} />
            ) : null}
            {event.time ? <Detail icon={Clock} text={event.time} /> : null}
            {event.location ? (
              <Detail icon={MapPin} text={event.location} />
            ) : null}
          </View>
        ) : null}

        {paragraphs(a.body_md).map((p, i) => (
          <Text key={i} className="mt-3 text-base leading-6 text-ink/85">
            {p}
          </Text>
        ))}

        <Text className="mt-3 text-xs text-ink/40">
          {format(new Date(when), "d MMM yyyy")}
        </Text>
      </View>
    </View>
  );
}

function Detail({
  icon: Icon,
  text,
}: {
  icon: typeof Calendar;
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon color={colors.copper} size={15} />
      <Text className="text-sm text-ink/80">{text}</Text>
    </View>
  );
}
