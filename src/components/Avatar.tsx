import { View, Text, Image } from "react-native";
import { initials } from "@/utils/text";
import { colors } from "@/theme/colors";

type Props = {
  name: string;
  photoUrl?: string | null;
  // Accepted for call-site compatibility; no longer drawn as a coloured ring.
  ringColor?: string | null;
  size?: number;
};

// Identity avatar: the member's photo when set, otherwise their initials on a
// surface tile, with a neutral hairline (no coloured ring). Profile photos are
// opt-in, so initials are the standing default.
export function Avatar({ name, photoUrl, size = 96 }: Props) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full border bg-surface2"
      style={{
        width: size,
        height: size,
        borderColor: colors.border,
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
