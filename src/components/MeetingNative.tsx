import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AudioSession,
  LiveKitRoom,
  registerGlobals,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from "@livekit/react-native";
import {
  Camera,
  CameraOff,
  CircleDot,
  Mic,
  MicOff,
  PhoneOff,
  Square,
  UsersRound,
} from "lucide-react-native";
import { Avatar } from "@/components/Avatar";
import { colors } from "@/theme/colors";

// This file is lazy-loaded only in a development or store build. Keep the
// WebRTC registration alongside the native import so Expo Go never evaluates
// either one while it builds the ordinary app routes.
registerGlobals();

type JoinDetails = {
  token: string;
  url: string;
  room: string;
  meeting: { id: string; title: string; mode: "audio" | "video" };
};

type Props = {
  join: JoinDetails;
  title: string;
  mode: "audio" | "video";
  recording: { status: "recording" | "processing" | "ready" | "failed" | "deleted" } | null;
  canManageRecording: boolean;
  actionPending: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEndMeeting: () => void;
  onLeave: () => void;
  onFailure: (message: string) => void;
};

// This module intentionally lives outside `app/`. Expo Router eagerly imports
// every file below app as a route; that would make Expo Go load LiveKit/WebRTC
// even when no meeting was opened.
export default function MeetingNative({ join, onFailure, ...props }: Props) {
  return (
    <LiveKitRoom
      serverUrl={join.url}
      token={join.token}
      connect
      audio
      video={props.mode === "video"}
      onError={(reason) => onFailure(reason.message)}
    >
      <MeetingRoom {...props} />
    </LiveKitRoom>
  );
}

function MeetingRoom({
  title,
  mode,
  recording,
  canManageRecording,
  actionPending,
  onStartRecording,
  onStopRecording,
  onEndMeeting,
  onLeave,
}: Omit<Props, "join" | "onFailure">) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const participants = useParticipants();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    AudioSession.startAudioSession().catch(() => undefined);
    return () => {
      AudioSession.stopAudioSession().catch(() => undefined);
    };
  }, []);

  const otherPeople = useMemo(
    () => participants.filter((person) => person.identity !== localParticipant.identity),
    [participants, localParticipant.identity]
  );

  const leave = async () => {
    setLeaving(true);
    await room.disconnect();
    onLeave();
  };

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top", "bottom"]}>
      <View className="px-6 pt-5">
        <Text className="text-center font-display text-[24px] text-parchment">{title}</Text>
        <Text className="mt-1 text-center text-[12px] uppercase text-parchment/55" style={{ letterSpacing: 1.2 }}>
          {mode === "video" ? "Video prayer meeting" : "Audio prayer meeting"}
        </Text>
      </View>
      {recording?.status === "recording" ? <RecordingBanner /> : null}
      {recording?.status === "processing" ? <SavingBanner /> : null}
      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-6 py-8">
        <View className="mb-8 h-28 w-28 items-center justify-center rounded-full bg-copper/20"><UsersRound color={colors.copperSoft} size={42} /></View>
        <Text className="font-display text-[28px] text-parchment">{participants.length} {participants.length === 1 ? "person" : "people"} praying</Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-parchment/60">This room is private to members of your Circle. Recordings only begin when a Circle admin explicitly starts one.</Text>
        <View className="mt-8 w-full max-w-sm overflow-hidden rounded-3xl bg-white/8">
          <ParticipantRow name="You" sublabel={isMicrophoneEnabled ? "Microphone on" : "Microphone off"} />
          {otherPeople.map((person) => <ParticipantRow key={person.identity} name={person.name || "Circle member"} sublabel={person.isSpeaking ? "Speaking" : "Listening"} />)}
        </View>
      </ScrollView>
      <View className="flex-row flex-wrap items-center justify-center gap-3 px-6 pb-5">
        <MeetingControl label={isMicrophoneEnabled ? "Mute" : "Unmute"} icon={isMicrophoneEnabled ? Mic : MicOff} onPress={() => { void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled); }} />
        {mode === "video" ? <MeetingControl label={isCameraEnabled ? "Camera" : "Camera off"} icon={isCameraEnabled ? Camera : CameraOff} onPress={() => { void localParticipant.setCameraEnabled(!isCameraEnabled); }} /> : null}
        {canManageRecording ? <MeetingControl disabled={actionPending || recording?.status === "processing"} label={recording?.status === "recording" ? "Stop rec." : "Record"} icon={recording?.status === "recording" ? Square : CircleDot} onPress={recording?.status === "recording" ? onStopRecording : onStartRecording} /> : null}
        {canManageRecording ? <MeetingControl disabled={actionPending} label="End" icon={Square} onPress={onEndMeeting} /> : null}
        <Pressable onPress={() => void leave()} disabled={leaving} className="h-16 w-16 items-center justify-center rounded-full bg-copper active:opacity-80"><PhoneOff color="#fff" size={24} /></Pressable>
      </View>
    </SafeAreaView>
  );
}

function RecordingBanner() {
  return <View className="mx-5 mt-4 flex-row items-center gap-2 rounded-2xl bg-copper px-4 py-3"><CircleDot color="#fff" size={17} /><Text className="flex-1 text-[12px] leading-4 text-white">Recording is on. This teaching will be saved privately for Circle members.</Text></View>;
}

function SavingBanner() {
  return <View className="mx-5 mt-4 flex-row items-center gap-2 rounded-2xl bg-white/10 px-4 py-3"><ActivityIndicator color={colors.copperSoft} size="small" /><Text className="flex-1 text-[12px] leading-4 text-parchment/80">Recording is being saved. It will appear in your Circle when ready.</Text></View>;
}

function ParticipantRow({ name, sublabel }: { name: string; sublabel: string }) {
  return <View className="flex-row items-center gap-3 border-b border-white/10 px-4 py-3.5"><Avatar name={name} photoUrl={null} size={38} /><View><Text className="font-sans-semibold text-[14px] text-parchment">{name}</Text><Text className="mt-0.5 text-[11px] text-parchment/55">{sublabel}</Text></View></View>;
}

function MeetingControl({ label, icon: Icon, onPress, disabled = false }: { label: string; icon: typeof Mic; onPress: () => void | Promise<void>; disabled?: boolean }) {
  return <Pressable onPress={() => void onPress()} disabled={disabled} className="h-16 w-16 items-center justify-center rounded-full bg-white/12 active:bg-white/20 disabled:opacity-40"><Icon color="#fff" size={23} /><Text className="mt-1 text-[9px] text-parchment/75">{label}</Text></Pressable>;
}
