import { lazy, Suspense, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/queries/profile";
import {
  useChat,
  useCircleMeeting,
  useEndCircleMeeting,
  useManageCircleRecording,
  useMeetingRecordings,
} from "@/lib/queries/community";
import { colors } from "@/theme/colors";

const MeetingNative = lazy(() => import("@/components/MeetingNative"));

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
    <Suspense fallback={<MeetingLoading />}>
      <MeetingNative
        join={join}
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
        onFailure={setError}
      />
    </Suspense>
  );
}

function MeetingLoading() {
  return <SafeAreaView className="flex-1 items-center justify-center bg-ink"><ActivityIndicator color={colors.copper} /><Text className="mt-3 text-[13px] text-parchment">Loading secure call controls…</Text></SafeAreaView>;
}

function Unavailable({ onBack, message }: { onBack: () => void; message: string }) {
  return <SafeAreaView className="flex-1 items-center justify-center bg-ink px-8"><Text className="text-center font-display text-[27px] text-parchment">Prayer meeting</Text><Text className="mt-3 text-center text-[14px] leading-6 text-parchment/65">{message}</Text><Pressable onPress={onBack} className="mt-7 rounded-full bg-parchment px-6 py-3"><Text className="font-sans-semibold text-ink">Go back</Text></Pressable></SafeAreaView>;
}
