import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Camera } from "lucide-react-native";
import {
  useProfile,
  useHouses,
  useUpdateProfile,
  useUploadProfilePhoto,
} from "@/lib/queries/profile";
import { TextField } from "@/components/TextField";
import { Avatar } from "@/components/Avatar";
import { colors } from "@/theme/colors";
import type { Gender, PhotoVisibility } from "@/lib/database.types";

const schema = z.object({
  name: z.string().trim().min(1, "Your name is required.").max(80),
  year: z.string().trim().max(40),
  dept: z.string().trim().max(80),
  pinnedVerseRef: z.string().trim().max(60),
});
type FormValues = z.infer<typeof schema>;

const GENDERS: { key: Gender; label: string }[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];
const VISIBILITIES: { key: PhotoVisibility; label: string }[] = [
  { key: "parish", label: "Parish" },
  { key: "house", label: "House" },
  { key: "none", label: "Hidden" },
];

export default function EditProfile() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { data: houses } = useHouses();
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadProfilePhoto();

  const house = houses?.find((h) => h.id === profile?.house_id) ?? null;

  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [visibility, setVisibility] = useState<PhotoVisibility>(
    profile?.photo_visibility ?? "parish"
  );

  // Profile is cached when arriving here, but resync if it loads or changes.
  useEffect(() => {
    if (profile) {
      setGender(profile.gender ?? null);
      setVisibility(profile.photo_visibility);
    }
  }, [profile]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: profile?.name ?? "",
      year: profile?.year ?? "",
      dept: profile?.dept ?? "",
      pinnedVerseRef: profile?.pinned_verse_ref ?? "",
    },
  });

  const onPickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Photo access needed",
        "Allow access to your photos to set a profile picture."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (!uri) return;
    try {
      await uploadPhoto.mutateAsync(uri);
    } catch {
      Alert.alert(
        "Could not upload",
        "Your photo could not be uploaded. Please try again."
      );
    }
  };

  const onRemovePhoto = async () => {
    try {
      await updateProfile.mutateAsync({ photo_url: null });
    } catch {
      // Error surfaced by the save banner below.
    }
  };

  const onSave = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        year: values.year || null,
        dept: values.dept || null,
        pinned_verse_ref: values.pinnedVerseRef || null,
        gender,
        photo_visibility: visibility,
      });
      router.back();
    } catch {
      // Error surfaced by the save banner below.
    }
  });

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-parchment">
        <ActivityIndicator color={colors.copper} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top"]}>
      <View className="flex-row items-center px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.ink} size={26} />
        </Pressable>
        <Text className="font-display text-xl text-ink">Edit profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-4 gap-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo */}
        <View className="items-center">
          <Pressable
            onPress={onPickPhoto}
            disabled={uploadPhoto.isPending}
            className="active:opacity-80"
            accessibilityLabel="Change profile photo"
          >
            <Avatar
              name={profile.name}
              photoUrl={profile.photo_url}
              ringColor={house?.color}
              size={104}
            />
            <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-parchment bg-copper">
              {uploadPhoto.isPending ? (
                <ActivityIndicator color={colors.parchment} size="small" />
              ) : (
                <Camera color={colors.parchment} size={16} />
              )}
            </View>
          </Pressable>
          {profile.photo_url ? (
            <Pressable
              onPress={onRemovePhoto}
              className="mt-3 active:opacity-60"
            >
              <Text className="text-sm font-sans-medium text-oxblood">
                Remove photo
              </Text>
            </Pressable>
          ) : (
            <Text className="mt-3 text-xs text-ink/50">
              Optional. Your initials show until you add one.
            </Text>
          )}
        </View>

        <TextField
          control={control}
          name="name"
          label="Name"
          error={errors.name?.message}
          placeholder="Your full name"
          autoCapitalize="words"
        />

        {/* Gender */}
        <View className="gap-1.5">
          <Text className="font-sans-medium text-sm text-ink">Gender</Text>
          <Segmented options={GENDERS} value={gender} onChange={setGender} />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              control={control}
              name="year"
              label="Year"
              error={errors.year?.message}
              placeholder="e.g. 200 Level"
            />
          </View>
          <View className="flex-1">
            <TextField
              control={control}
              name="dept"
              label="Department"
              error={errors.dept?.message}
              placeholder="e.g. Nursing"
            />
          </View>
        </View>

        <TextField
          control={control}
          name="pinnedVerseRef"
          label="Pinned verse"
          error={errors.pinnedVerseRef?.message}
          placeholder="e.g. Psalm 23:1"
          autoCapitalize="words"
        />

        {/* Photo visibility */}
        <View className="gap-1.5">
          <Text className="font-sans-medium text-sm text-ink">
            Who can see your photo
          </Text>
          <Segmented
            options={VISIBILITIES}
            value={visibility}
            onChange={setVisibility}
          />
          <Text className="text-xs text-ink/50">
            Conservative by default. Choose Hidden to show only your initials.
          </Text>
        </View>

        {updateProfile.isError ? (
          <Text className="text-center text-sm text-oxblood">
            Could not save your changes. Please try again.
          </Text>
        ) : null}
      </ScrollView>

      <View className="border-t border-border bg-parchment px-6 pb-8 pt-4">
        <Pressable
          onPress={onSave}
          disabled={updateProfile.isPending}
          className="h-14 items-center justify-center rounded-full bg-copper active:opacity-90 disabled:opacity-50"
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color={colors.parchment} />
          ) : (
            <Text className="font-sans-semibold text-base text-parchment">
              Save changes
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row rounded-full bg-surface2 p-1">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            className={`flex-1 items-center rounded-full py-2.5 ${
              active ? "bg-surface1" : ""
            }`}
          >
            <Text
              className={`font-sans-medium text-sm ${
                active ? "text-ink" : "text-ink/50"
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
