import { Tabs } from "expo-router";
import { Sun, BookOpen, Users, User, Shield } from "lucide-react-native";
import { useProfile } from "@/lib/queries/profile";
import { colors } from "@/theme/colors";

const LEADER_ROLES = ["house_leader", "discipler", "pastor", "admin"];

export default function TabsLayout() {
  const { data: profile } = useProfile();
  const isLeader = !!profile && LEADER_ROLES.includes(profile.role);

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
          title: "Community",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
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
