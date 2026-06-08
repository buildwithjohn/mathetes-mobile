import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/stores/auth";
import type { House, UserProfile } from "@/lib/database.types";

// Supabase Storage bucket for opt-in profile photos.
const AVATAR_BUCKET = "avatars";

// Query keys, centralized so mutations can invalidate precisely.
export const profileKeys = {
  me: ["profile", "me"] as const,
  houses: ["houses"] as const,
};

// The current user's profile row (auto-created by the backend trigger on
// sign-up). Returns null while signed out.
export function useProfile() {
  const authId = useAuth((s) => s.session?.user.id ?? null);

  return useQuery({
    queryKey: profileKeys.me,
    enabled: !!authId,
    queryFn: async (): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("auth_id", authId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// Houses readable by the signed-in user. RLS scopes this to their parish, so a
// plain select returns exactly the seven CCCFSP houses for the pilot.
export function useHouses() {
  const authId = useAuth((s) => s.session?.user.id ?? null);

  return useQuery({
    queryKey: profileKeys.houses,
    enabled: !!authId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<House[]> => {
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

type ProfilePatch = Partial<
  Pick<
    UserProfile,
    | "name"
    | "house_id"
    | "gender"
    | "year"
    | "dept"
    | "photo_url"
    | "photo_visibility"
    | "pinned_verse_ref"
  >
>;

// Patch the current user's profile row. RLS allows users to update only their
// own row, so we scope by auth_id.
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const authId = useAuth((s) => s.session?.user.id ?? null);

  return useMutation({
    mutationFn: async (patch: ProfilePatch): Promise<UserProfile> => {
      if (!authId) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("user_profiles")
        .update(patch)
        .eq("auth_id", authId)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile);
    },
  });
}

// Upload a picked image to the avatars bucket and point the profile at its
// public URL. Photos are opt-in; visibility defaults to parish (schema default)
// and is editable on the profile screen.
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  const authId = useAuth((s) => s.session?.user.id ?? null);

  return useMutation({
    mutationFn: async (localUri: string): Promise<UserProfile> => {
      if (!authId) throw new Error("Not signed in.");
      const clean = localUri.split("?")[0];
      const ext = (clean.split(".").pop() ?? "jpg").toLowerCase();
      const contentType = ext === "png" ? "image/png" : "image/jpeg";

      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: "base64",
      });
      const path = `${authId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, decode(base64), { contentType, upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

      const { data, error } = await supabase
        .from("user_profiles")
        .update({ photo_url: publicUrl })
        .eq("auth_id", authId)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile);
    },
  });
}
