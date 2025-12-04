import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File, bucket: string, path?: string) {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${path ? path + '/' : ''}${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error: uploadError, data } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}
