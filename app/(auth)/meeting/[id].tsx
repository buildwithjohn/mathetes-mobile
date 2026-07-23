import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Camera, CameraOff, CircleDot, Mic, MicOff, PhoneOff, Square, UsersRound } from "lucide-react-native";
import { AudioSession, LiveKitRoom, useLocalParticipant, useParticipants, useRoomContext } from "@livekit/react-native";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/queries/profile";
import {
  useChat,
  useCircleMeeting,
  useEndCircleMeeting,
  useManageCircleRecording,
  useMeetingRecordings,
} from "@/lib/queries/community";
import { Avatar } from "@/components/Avatar";
import { colors } from "@/theme/colors";

type JoinDetails = { token: string; url: string; room: string; meeting: { id: string; title: string; mode: "audio" | "video" } };

export default function MeetingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "";
  const { data: profile } = useProfile();
  const { data: meeting, isLoading: meetingLoading } = useCircleMeeting(meetingId);
  const { data: chatData } = useChat(meeting?.chat_id ?? "");
  const { data: recordings } = useMeetingRecordings(meetingId);
  const manageRecording = useManageCircleRecording();
  const endMeeting = useEndCircleMeeting();
  const [join, setJoin] = useState<JoinDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const myRole = chatData?.members.find((member) => member.user_id === profile?.id)?.role;
  const isCircleAdmin = myRole === "owner" || myRole === "admin";
  const currentRecording = recordings?.find((recording) => recording.status === "recording" || recording.status === "processing") ?? null;

  useEffect(() => {
    if (!meetingId || !meeting || meeting.status !== "live") return;
    let active = true;
    supabase.functions.invoke("livekit-token", { body: { meeting_id: meetingId } })
      .then(({ data, error: invokeError }) => {
        if (!active) return;
        if (invokeError) throw invokeError;
        const details = data as JoinDetails;
        if (!details?.token || !details?.url) throw new Error("Meeting access is unavailable.");
        setJoin(details);
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "Could not join this meeting."));
    return () => { active = false; };
  }, [meetingId, meeting]);

  useEffect(() => {
    if (!currentRecording || currentRecording.status !== "processing") return;
    const refresh = () => manageRecording.mutate({ action: "refresh", recordingId: currentRecording.id });
    refresh();
    const timer = setInterval(refresh, 12_000);
    return () => clearInterval(timer);
  }, [currentRecording?.id, currentRecording?.status]);

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return <Unavailable onBack={() => router.back()} message="Prayer meetings need the Mathetes development or Play Store build. Expo Go cannot load secure audio/video calling." />;
  }
  if (meetingLoading || (!error && (!meeting || !join))) {
    return <SafeAreaView className="flex-1 items-center justify-center bg-ink"><ActivityIndicator color={colors.copper} /><Text className="mt-3 text-[13px] text-parchment">Preparing your private meeting…</Text></SafeAreaView>;
  }
  if (error || !meeting || meeting.status !== "live" || !join) {
    return <Unavailable onBack={() => router.back()} message={error ?? "This prayer meeting has ended."} />;
  }
  return (
    <LiveKitRoom serverUrl={join.url} token={join.token} connect audio video={meeting.mode === "video"} onError={(reason) => setError(reason.message)}>
      <MeetingRoom
        title={meeting.title}
        mode={meeting.mode}
        recording={currentRecording}
        canManageRecording={isCircleAdmin}
        actionPending={manageRecording.isPending || endMeeting.isPending}
        onStartRecording={() => Alert.alert(
          "Record this teaching?",
          "Everyone in the Circle will see that recording is on. The finished teaching is private to Circle members.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Start recording",
              onPress: () => manageRecording.mutate(
                { action: "start", meetingId },
                { onError: (reason) => Alert.alert("Could not start recording", reason instanceof Error ? reason.message : "Please try again.") }
              ),
            },
          ]
        )}
        onStopRecording={() => Alert.alert(
          "Stop recording?",
          "The file will be saved privately for Circle members.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Stop recording",
              onPress: () => currentRecording && manageRecording.mutate(
                { action: "stop", recordingId: currentRecording.id },
                { onError: (reason) => Alert.alert("Could not stop recording", reason instanceof Error ? reason.message : "Please try again.") }
              ),
            },
          ]
        )}
        onEndMeeting={() => Alert.alert(
          "End prayer meeting?",
          currentRecording?.status === "recording"
            ? "This also stops the recording and saves the teaching for your Circle."
            : "Members will no longer be able to join this room.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "End meeting",
              style: "destructive",
              onPress: async () => {
                try {
                  if (currentRecording?.status === "recording") await manageRecording.mutateAsync({ action: "stop", recordingId: currentRecording.id });
                  await endMeeting.mutateAsync(meetingId);
                  router.back();
                } catch (reason) {
                  Alert.alert("Could not end meeting", reason instanceof Error ? reason.message : "Please try again.");
                }
              },
            },
          ]
        )}
        onLeave={() => router.back()}
      />
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
}: {
  title: string;
  mode: "audio" | "video";
  recording: { status: "recording" | "processing" | "ready" | "failed" | "deleted" } | null;
  canManageRecording: boolean;
  actionPending: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEndMeeting: () => void;
  onLeave: () => void;
}) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const participants = useParticipants();
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    AudioSession.startAudioSession().catch(() => {});
    return () => { AudioSession.stopAudioSession().catch(() => {}); };
  }, []);
  const people = useMemo(() => participants.filter((person) => person.identity !== localParticipant.identity), [participants, localParticipant.identity]);
  const leave = async () => {
    setLeaving(true);
    await room.disconnect();
    onLeave();
  };
  return (
    <SafeAreaView className="flex-1 bg-ink" edges={["top", "bottom"]}>
      <View className="px-6 pt-5"><Text className="text-center font-display text-[24px] text-parchment">{title}</Text><Text className="mt-1 text-center text-[12px] uppercase text-parchment/55" style={{ letterSpacing: 1.2 }}>{mode === "video" ? "Video prayer meeting" : "Audio prayer meeting"}</Text></View>
      {recording?.status === "recording" ? <View className="mx-5 mt-4 flex-row items-center gap-2 rounded-2xl bg-copper px-4 py-3"><CircleDot color="#fff" size={17} /><Text className="flex-1 text-[12px] leading-4 text-white">Recording is on. This teaching will be saved privately for Circle members.</Text></View> : null}
      {recording?.status === "processing" ? <View className="mx-5 mt-4 flex-row items-center gap-2 rounded-2xl bg-white/10 px-4 py-3"><ActivityIndicator color={colors.copperSoft} size="small" /><Text className="flex-1 text-[12px] leading-4 text-parchment/80">Recording is being saved. It will appear in your Circle when ready.</Text></View> : null}
      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-6 py-8">
        <View className="mb-8 h-28 w-28 items-center justify-center rounded-full bg-copper/20"><UsersRound color={colors.copperSoft} size={42} /></View>
        <Text className="font-display text-[28px] text-parchment">{participants.length} {participants.length === 1 ? "person" : "people"} praying</Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-parchment/60">This room is private to members of your Circle. Recordings only begin when a Circle admin explicitly starts one.</Text>
        <View className="mt-8 w-full max-w-sm overflow-hidden rounded-3xl bg-white/8">
          <ParticipantRow name="You" sublabel={isMicrophoneEnabled ? "Microphone on" : "Microphone off"} />
          {people.map((person) => <ParticipantRow key={person.identity} name={person.name || "Circle member"} sublabel={person.isSpeaking ? "Speaking" : "Listening"} />)}
        </View>
      </ScrollView>
      <View className="flex-row flex-wrap items-center justify-center gap-3 px-6 pb-5">
        <MeetingControl label={isMicrophoneEnabled ? "Mute" : "Unmute"} icon={isMicrophoneEnabled ? Mic : MicOff} onPress={async () => { await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled); }} />
        {mode === "video" ? <MeetingControl label={isCameraEnabled ? "Camera" : "Camera off"} icon={isCameraEnabled ? Camera : CameraOff} onPress={async () => { await localParticipant.setCameraEnabled(!isCameraEnabled); }} /> : null}
        {canManageRecording ? <MeetingControl disabled={actionPending || recording?.status === "processing"} label={recording?.status === "recording" ? "Stop rec." : "Record"} icon={recording?.status === "recording" ? Square : CircleDot} onPress={recording?.status === "recording" ? onStopRecording : onStartRecording} /> : null}
        {canManageRecording ? <MeetingControl disabled={actionPending} label="End" icon={Square} onPress={onEndMeeting} /> : null}
        <Pressable onPress={leave} disabled={leaving} className="h-16 w-16 items-center justify-center rounded-full bg-copper active:opacity-80"><PhoneOff color="#fff" size={24} /></Pressable>
      </View>
    </SafeAreaView>
  );
}

function ParticipantRow({ name, sublabel }: { name: string; sublabel: string }) {
  return <View className="flex-row items-center gap-3 border-b border-white/10 px-4 py-3.5"><Avatar name={name} photoUrl={null} size={38} /><View><Text className="font-sans-semibold text-[14px] text-parchment">{name}</Text><Text className="mt-0.5 text-[11px] text-parchment/55">{sublabel}</Text></View></View>;
}
function MeetingControl({ label, icon: Icon, onPress, disabled = false }: { label: string; icon: typeof Mic; onPress: () => void | Promise<void>; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} className="h-16 w-16 items-center justify-center rounded-full bg-white/12 active:bg-white/20 disabled:opacity-40"><Icon color="#fff" size={23} /><Text className="mt-1 text-[9px] text-parchment/75">{label}</Text></Pressable>;
}
function Unavailable({ onBack, message }: { onBack: () => void; message: string }) {
  return <SafeAreaView className="flex-1 items-center justify-center bg-ink px-8"><Text className="text-center font-display text-[27px] text-parchment">Prayer meeting</Text><Text className="mt-3 text-center text-[14px] leading-6 text-parchment/65">{message}</Text><Pressable onPress={onBack} className="mt-7 rounded-full bg-parchment px-6 py-3"><Text className="font-sans-semibold text-ink">Go back</Text></Pressable></SafeAreaView>;
}
