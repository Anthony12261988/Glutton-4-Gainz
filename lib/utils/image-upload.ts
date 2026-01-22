import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File, bucket: string, path?: string) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${path ? path + "/" : ""}${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError, data } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
}

const VIDEO_MAX_BYTES = 104857600; // 100MB
const VIDEO_ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const VIDEO_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadVideoAsset(
  file: File,
  path: string,
  options?: { upsert?: boolean }
) {
  if (!VIDEO_ALLOWED_TYPES.includes(file.type) && !VIDEO_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type for video assets.");
  }

  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error("File exceeds 100MB limit.");
  }

  const supabase = createClient();

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: options?.upsert ?? false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  return path;
}
