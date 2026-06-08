import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadToBucket } from "@/lib/storage";
import { useAuth } from "@/lib/stores/auth";
import { useProfile } from "@/lib/queries/profile";
import type {
  VerseImage,
  VerseImageTheme,
  VerseImageAspect,
} from "@/lib/database.types";

export const verseImageKeys = {
  list: ["verse_images"] as const,
};

// The member's saved verse-image gallery (private to them), newest first.
export function useVerseImages() {
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: verseImageKeys.list,
    enabled: !!authId,
    queryFn: async (): Promise<VerseImage[]> => {
      const { data, error } = await supabase
        .from("verse_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Upload a rendered verse card to the public verse-images bucket and record a
// gallery row. Best-effort from the studio (it should never block saving to
// the camera roll), so callers can swallow errors.
export function useSaveVerseImage() {
  const queryClient = useQueryClient();
  const authId = useAuth((s) => s.session?.user.id ?? null);
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (args: {
      localUri: string;
      verseRef: string;
      verseText: string;
      theme: VerseImageTheme;
      aspectRatio?: VerseImageAspect;
    }): Promise<void> => {
      if (!authId || !profile) throw new Error("Not ready.");
      const path = `${authId}/verse-${Date.now()}.png`;
      const url = await uploadToBucket({
        bucket: "verse-images",
        path,
        localUri: args.localUri,
        contentType: "image/png",
      });
      const { error } = await supabase.from("verse_images").insert({
        user_id: profile.id,
        verse_ref: args.verseRef,
        verse_text: args.verseText,
        theme: args.theme,
        aspect_ratio: args.aspectRatio ?? "square",
        url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verseImageKeys.list });
    },
  });
}

// Remove a gallery entry (and its stored object).
export function useDeleteVerseImage() {
  const queryClient = useQueryClient();
  const authId = useAuth((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: async (image: VerseImage): Promise<void> => {
      const { error } = await supabase
        .from("verse_images")
        .delete()
        .eq("id", image.id);
      if (error) throw error;
      // Best-effort object cleanup: derive the storage path from the URL.
      const marker = "/verse-images/";
      const idx = image.url.indexOf(marker);
      if (idx >= 0 && authId) {
        const path = image.url.slice(idx + marker.length);
        await supabase.storage.from("verse-images").remove([path]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verseImageKeys.list });
    },
  });
}
