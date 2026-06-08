import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import { Play, Pause, Headphones } from "lucide-react-native";
import { colors } from "@/theme/colors";

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Compact audio player for a devotional's narration. Play/pause with a progress
// thread and elapsed/total time. Restarts when finished.
export function AudioPlayer({ url }: { url: string }) {
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  // Let audio play even when the phone is on silent (iOS).
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const duration = status.duration || 0;
  const progress = duration > 0 ? Math.min(status.currentTime / duration, 1) : 0;

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

  return (
    <View className="mt-6 flex-row items-center gap-3 rounded-2xl border border-border bg-surface1 p-3">
      <Pressable
        onPress={toggle}
        className="h-11 w-11 items-center justify-center rounded-full bg-copper active:opacity-90"
        accessibilityLabel={status.playing ? "Pause narration" : "Play narration"}
      >
        {status.playing ? (
          <Pause color={colors.parchment} size={18} fill={colors.parchment} />
        ) : (
          <Play color={colors.parchment} size={18} fill={colors.parchment} />
        )}
      </Pressable>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Headphones color={colors.copper} size={14} />
          <Text className="text-xs font-sans-medium uppercase tracking-widest text-copper">
            Listen
          </Text>
        </View>
        <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface2">
          <View
            className="h-1.5 rounded-full bg-copper"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>
      <Text className="w-16 text-right text-xs text-ink/50">
        {clock(status.currentTime)} / {clock(duration)}
      </Text>
    </View>
  );
}
