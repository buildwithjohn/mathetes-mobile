import { View, Text, Image } from "react-native";
import { initials } from "@/utils/text";
import { colors } from "@/theme/colors";

type Props = {
  name: string;
  photoUrl?: string | null;
  // House accent color for the identity ring; falls back to the neutral border.
  ringColor?: string | null;
  size?: number;
};

// Identity avatar: the member's photo when set, otherwise their initials on a
// surface tile. The ring carries the house color. Profile photos are opt-in,
// so initials are the standing default.
export function Avatar({ name, photoUrl, ringColor, size = 96 }: Props) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full border-2 bg-surface2"
      style={{
        width: size,
        height: size,
        borderColor: ringColor ?? colors.border,
      }}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-display text-ink"
          style={{ fontSize: Math.round(size * 0.34) }}
        >
          {initials(name) || "?"}
        </Text>
      )}
    </View>
  );
}
