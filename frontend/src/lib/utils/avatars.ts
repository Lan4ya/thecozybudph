import { supabase } from "@/lib/supabase/client";

/**
 * Retrieves public URLs for all seeded avatars in the 'avatars' storage bucket.
 */
export async function getAvatarUrls(): Promise<string[]> {
  const { data, error } = await supabase.storage.from("avatars").list("", {
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    console.error("Error listing avatars:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((file) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(`${file.name}`);
    return publicUrl;
  });
}

/**
 * Returns a deterministic fallback avatar URL based on the user's ID.
 * This ensures the user gets a consistent "random" avatar from the seeded collection.
 */
export function getFallbackAvatarUrl(
  userId: string | undefined,
  availableUrls: string[],
): string {
  if (!userId || availableUrls.length === 0) return "";

  // Simple hash of the UUID to get an index
  const hash = userId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return availableUrls[hash % availableUrls.length];
}
