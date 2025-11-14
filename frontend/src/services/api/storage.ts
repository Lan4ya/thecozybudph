import { supabase } from "../../lib/supabase/connect";

export async function getFileUrlFromDB(
  bucket: string,
  path: string,
  visibility: "public" | "private" = "public",
) {
  if (visibility === "public") {
    // Syncrounous call since this just builds a URL string (no Supabase API request happens).
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // private
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function getAllFileUrlsFromDB(
  bucket: string,
  dir: string = "",
  visibility: "public" | "private" = "public",
  expiresIn = 60, // seconds
) {
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(dir, { sortBy: { column: "name", order: "asc" } });

  if (error) throw error;

  if (!files?.length) return [];

  // console.log("Files found:", files);

  const paths = files.map((f) => (dir ? `${dir}/${f.name}` : f.name));

  console.log("File paths:", paths);

  if (visibility === "public") {
    return paths.map((p) => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(p);
      // console.log("Public URL data for", p, ":", data);
      return data.publicUrl;
    });
  }

  // private
  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn);

  if (signErr) throw signErr;
  return signed.map((d) => d.signedUrl);
}
