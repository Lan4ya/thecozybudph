import { supabase } from "./supabase.ts";

export async function getRandomAvatarUrl() {
  const { data: files, error } = await supabase.storage
    .from("avatars")
    .list("", {
      limit: 100,
    });

  if (error) {
    throw new Error(`Supabase Storage Error: ${error.message}`);
  }

  if (!files || files.length === 0) {
    throw new Error(
      "Initialization Error: The 'avatars' storage bucket is completely empty. You must upload avatar assets first.",
    );
  }

  // Pick a random file from the array
  const randomIndex = Math.floor(Math.random() * files.length);
  const randomFileName = files[randomIndex].name;

  // Get the public URL
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(randomFileName);

  return data.publicUrl;
}
