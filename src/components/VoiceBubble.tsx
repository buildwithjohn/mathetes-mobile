import { View, Text, Pressable } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Play, Pause } from "lucide-react-native";
import { colors } from "@/theme/colors";

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Compact voice-note player for a chat bubble. The sender's bubble is a soft
// copper tint, so its controls use copper; a peer's bubble uses ink on rule.
export function VoiceBubble({ url, mine }: { url: string; mine: boolean }) {
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  const duration = status.duration || 0;
  const progress = duration > 0 ? Math.min(status.currentTime / duration, 1) : 0;
  const fg = mine ? colors.copperDeep : colors.ink;
  const track = mine ? `${colors.copper}40` : colors.rule;

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || (duration > 0 && status.currentTime >= duration)) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const shown = status.playing || status.currentTime > 0 ? status.currentTime : duration;

  return (
    <View className="flex-row items-center gap-2" style={{ minWidth: 168 }}>
      <Pressable
        onPress={toggle}
        accessibilityLabel={status.playing ? "Pause voice note" : "Play voice note"}
      >
        {status.playing ? (
          <Pause color={fg} size={20} fill={fg} />
        ) : (
          <Play color={fg} size={20} fill={fg} />
        )}
      </Pressable>
      <View
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: track }}
      >
        <View
          className="h-1.5 rounded-full"
          style={{ width: `${progress * 100}%`, backgroundColor: fg }}
        />
      </View>
      <Text className="text-xs" style={{ color: fg }}>
        {clock(shown)}
      </Text>
    </View>
  );
}
