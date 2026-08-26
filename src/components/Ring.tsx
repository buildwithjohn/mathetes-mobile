import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";

type RingProps = {
  // 0..1 fraction of the ring to fill. Pass null for a track-only ring when
  // true progress is not known (the caller usually centers an icon instead).
  value?: number | null;
  size?: number;
  stroke?: number;
  // Override the track/fill colours (e.g. on a dark gamified card).
  color?: string;
  trackColor?: string;
  // Optional element centered inside the ring (e.g. an icon or a number).
  children?: React.ReactNode;
};

// Thin circular progress ring. Track in `rule`, fill in `copper` by default;
// pass color/trackColor to theme it (e.g. bright fill on a dark card).
export function Ring({
  value = null,
  size = 36,
  stroke = 2.5,
  color = colors.copper,
  trackColor = colors.rule,
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = value == null ? 0 : Math.max(0, Math.min(1, value));
  const dash = circumference * clamped;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        {value != null ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            // Start the arc at 12 o'clock.
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}
