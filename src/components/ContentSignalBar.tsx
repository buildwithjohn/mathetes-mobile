import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Heart, Share2 } from "lucide-react-native";
import {
  type ContentSignalKind,
  useContentSignalSummary,
  useRecordContentShare,
  useToggleContentAmen,
} from "@/lib/queries/contentSignals";
import { colors } from "@/theme/colors";

type Props = {
  kind: ContentSignalKind;
  contentId: string;
  onShare: () => Promise<boolean>;
  dark?: boolean;
  className?: string;
};

// A small, live encouragement bar. It deliberately shows totals only: daily
// formation is communal, but students should never feel ranked or watched.
export function ContentSignalBar({
  kind,
  contentId,
  onShare,
  dark = false,
  className = "",
}: Props) {
  const summary = useContentSignalSummary(kind, contentId);
  const amen = useToggleContentAmen();
  const share = useRecordContentShare();
  const data = summary.data;
  const ink = dark ? "#DCE8F2" : colors.inkSoft;
  const active = dark ? "#FFB4BB" : colors.oxblood;
  const divider = dark ? "rgba(220,232,242,0.22)" : colors.border;

  const onPressShare = async () => {
    if (share.isPending) return;
    const shared = await onShare();
    if (shared) share.mutate({ kind, contentId });
  };

  return (
    <View className={`flex-row items-center gap-3 ${className}`}>
      <Pressable
        onPress={() => amen.mutate({ kind, contentId })}
        disabled={amen.isPending}
        className="h-9 flex-row items-center gap-1.5 rounded-full px-2.5 active:opacity-65 disabled:opacity-55"
        style={{ backgroundColor: data?.my_amen ? `${active}1C` : "transparent" }}
        accessibilityRole="button"
        accessibilityLabel={data?.my_amen ? "Remove Amen" : "Say Amen"}
      >
        {amen.isPending ? (
          <ActivityIndicator color={active} size="small" />
        ) : (
          <Heart
            color={data?.my_amen ? active : ink}
            fill={data?.my_amen ? active : "transparent"}
            size={16}
            strokeWidth={1.8}
          />
        )}
        <Text
          className="font-sans-medium text-[12px]"
          style={{ color: data?.my_amen ? active : ink }}
        >
          Amen{data?.amen_count ? ` · ${data.amen_count}` : ""}
        </Text>
      </Pressable>

      <View style={{ height: 16, width: 1, backgroundColor: divider }} />

      <Pressable
        onPress={() => void onPressShare()}
        disabled={share.isPending}
        className="h-9 flex-row items-center gap-1.5 rounded-full px-2.5 active:opacity-65 disabled:opacity-55"
        accessibilityRole="button"
        accessibilityLabel="Share"
      >
        {share.isPending ? (
          <ActivityIndicator color={ink} size="small" />
        ) : (
          <Share2 color={ink} size={16} strokeWidth={1.8} />
        )}
        <Text className="font-sans-medium text-[12px]" style={{ color: ink }}>
          Share{data?.share_count ? ` · ${data.share_count}` : ""}
        </Text>
      </Pressable>
    </View>
  );
}
