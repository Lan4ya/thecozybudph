import { supabase } from "@/lib/supabase/connectDB";

/**
 * Expected table schema (recommended):
 *
 * create table public.products (
 *   id uuid default uuid_generate_v4() primary key,
 *   name text not null,
 *   price numeric not null,
 *   stock int default 0,
 *   images text[] default '{}',
 *   color_variants text[] default '{}',
 *   collection text,
 *   created_at timestamptz default now()
 * );
 *
 * Also create a storage bucket named "products" (public or private as you configure).
 */

/**
 * List products (simple)
 */
export async function listProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Upload images to storage and return array of public URLs
 */
async function uploadImages(files: File[], folder = "uploads") {
  if (!files?.length) return [];
  const urls: string[] = [];

  for (const f of files) {
    const key = `${folder}/${Date.now()}_${f.name.replace(/\s+/g, "_")}`;
    const { error: upErr } = await supabase.storage
      .from("products")
      .upload(key, f, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("products").getPublicUrl(key);
    urls.push(data.publicUrl);
  }

  return urls;
}

/**
 * Create product row and upload images
 */
export async function createProductWithImages(
  payload: {
    name: string;
    price: number;
    stock: number;
    color_variants?: string[];
    collection?: string;
  },
  files: File[] = [],
) {
  // upload images
  const images = await uploadImages(files);

  // create row
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        ...payload,
        images,
        color_variants: payload.color_variants || [],
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
