import type { SupabaseClient } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import { Platform } from "react-native";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Upload a local image (file:// or blob:) to the avatars bucket and
 * return a stable public URL. Blob URLs die on refresh — never store them.
 */
export async function uploadAvatarFromUri(
  supabase: SupabaseClient,
  userId: string,
  uri: string,
) {
  // Already a permanent remote URL — keep it.
  if (/^https?:\/\//i.test(uri) && !uri.startsWith("blob:")) {
    return uri;
  }

  const { body, contentType } = await readImage(uri);
  if (body.byteLength > MAX_BYTES) {
    throw new Error("Image must be under 5MB.");
  }
  if (!contentType.startsWith("image/")) {
    throw new Error("Profile picture must be an image.");
  }

  const ext =
    contentType.split("/")[1]?.replace("jpeg", "jpg").split(";")[0] || "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, body, {
      upsert: true,
      contentType,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  return `${publicUrl}?t=${Date.now()}`;
}

async function readImage(uri: string) {
  // Expo Go's Blob has no arrayBuffer(), so read the picked file directly.
  if (Platform.OS !== "web") {
    const file = new File(uri);
    return {
      body: await file.arrayBuffer(),
      contentType: imageContentType(uri, file.type),
    };
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("Could not read the selected image.");
  }
  const blob = await response.blob();
  return {
    body: await blob.arrayBuffer(),
    contentType: imageContentType(uri, blob.type),
  };
}

function imageContentType(uri: string, reported?: string) {
  if (reported?.startsWith("image/")) return reported;

  const ext = uri.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "heic":
    case "heif":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}
