import type { SupabaseClient } from "@supabase/supabase-js";

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

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("Could not read the selected image.");
  }

  const blob = await response.blob();
  if (blob.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB.");
  }

  const contentType = blob.type || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Profile picture must be an image.");
  }

  const ext =
    contentType.split("/")[1]?.replace("jpeg", "jpg").split(";")[0] || "jpg";
  const path = `${userId}/avatar.${ext}`;

  // Prefer ArrayBuffer — more reliable across web + React Native.
  const body = await blob.arrayBuffer();

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
