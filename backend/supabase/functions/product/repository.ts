import type { SupabaseClient } from "supabase";
import type { ProductsMetadataRow } from "@shared/schema/index.ts";

export const ProductRepository = {
  insertProduct: async (
    s: SupabaseClient,
    product: Omit<ProductsMetadataRow, "id" | "created_at" | "updated_at">,
  ) => {
    const { data, error } = await s
      .from("products")
      .insert(product)
      .select("*")
      .single();
    return { data, error };
  },

  updateProduct: async (
    s: SupabaseClient,
    productId: string,
    updates: Partial<
      Omit<ProductsMetadataRow, "id" | "created_at" | "updated_at">
    >,
  ) => {
    const { data, error } = await s
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select("*")
      .single();
    return { data, error };
  },

  deleteProductsByIds: async (s: SupabaseClient, productIds: string[]) => {
    const { data, error } = await s
      .from("products")
      .delete()
      .in("id", productIds)
      .select("id");
    return { data, error };
  },

  getProductById: async (s: SupabaseClient, productId: string) => {
    const { data, error } = await s
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    return { data, error };
  },

  getProductsByIds: async (s: SupabaseClient, productIds: string[]) => {
    const { data, error } = await s
      .from("products")
      .select("id, image_urls")
      .in("id", productIds);
    return { data, error };
  },

  upsertCategory: async (s: SupabaseClient, name: string) => {
    const { data, error } = await s
      .from("product_categories")
      .upsert({ name }, { onConflict: "name" })
      .select("id, name")
      .single();
    return { data, error };
  },

  upsertCollection: async (s: SupabaseClient, name: string) => {
    const { data, error } = await s
      .from("product_collections")
      .upsert({ name }, { onConflict: "name" })
      .select("id, name")
      .single();
    return { data, error };
  },
};
