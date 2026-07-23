import { Tabs } from "expo-router";
import { Sun, BookOpen, MessageCircle, User, Shield } from "lucide-react-native";
import { useProfile } from "@/lib/queries/profile";
import { useChats } from "@/lib/queries/community";
import { colors } from "@/theme/colors";

const LEADER_ROLES = ["house_leader", "discipler", "pastor", "admin"];

export default function TabsLayout() {
  const { data: profile } = useProfile();
  const { data: chats } = useChats();
  const isLeader = !!profile && LEADER_ROLES.includes(profile.role);
  const unreadMessages = (chats ?? []).reduce((total, chat) => total + chat.unread, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.copper,
        tabBarInactiveTintColor: "#9C968A",
        tabBarStyle: {
          backgroundColor: colors.surface1,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <Sun color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: "Bible",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Messages",
          tabBarAccessibilityLabel: unreadMessages
            ? `Messages, ${unreadMessages} unread`
            : "Messages",
          tabBarBadge: unreadMessages || undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.copper,
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "600",
          },
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="oversight"
        options={{
          title: "Oversight",
          // Hidden for ordinary members; shown only to leaders.
          href: isLeader ? undefined : null,
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "You",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
