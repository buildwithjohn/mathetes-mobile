import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";

// Upload a local file to a storage bucket and return its public URL. Files are
// read as base64 then decoded to an ArrayBuffer, which is the reliable path for
// React Native uploads. The caller owns the path convention (e.g. uploads live
// under the user's auth-UID folder, which the bucket policies require).
export async function uploadToBucket(args: {
  bucket: string;
  path: string;
  localUri: string;
  contentType: string;
}): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(args.localUri, {
    encoding: "base64",
  });
  const { error } = await supabase.storage
    .from(args.bucket)
    .upload(args.path, decode(base64), {
      contentType: args.contentType,
      upsert: false,
    });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from(args.bucket).getPublicUrl(args.path);
  return publicUrl;
}
