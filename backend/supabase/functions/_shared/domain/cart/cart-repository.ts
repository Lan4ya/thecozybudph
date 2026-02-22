import { SupabaseType } from "@shared/types.d.ts";
import { Json } from "../../types/index.ts";

export const CartRepository = {
  insertCart: async (supabase: SupabaseType, profileId: string) => {
    const { data, error } = await supabase
      .from("carts")
      .insert({ profile_id: profileId })
      .select("id")
      .single();
    return { data, error };
  },

  getCartByProfileId: async (supabase: SupabaseType, profileId: string) => {
    const { data, error } = await supabase
      .from("carts")
      .select("id")
      .eq("profile_id", profileId)
      .maybeSingle();
    return { data, error };
  },

  getCartItems: async (supabase: SupabaseType, cartId: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, quantity, product_variant")
      .eq("cart_id", cartId);
    return { data, error };
  },

  upsertCartItem: (
    supabase: SupabaseType,
    cartId: string,
    productId: string,
    quantity: number,
    productVariant: Json,
  ) => {
    // This postgres function handles both item insertion and updating quantity
    // both increase and decrease as long as the final quantity is >= 1.
    // If quantity === 0, delete API should be called from the client instead.
    return supabase.rpc("upsert_cart_item", {
      cart_id: cartId,
      product_id: productId,
      quantity: quantity,
      product_variant: productVariant,
    });
  },

  deleteCartItems: async (
    supabase: SupabaseType,
    cartId: string,
    productIds: string[],
  ) => {
    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .in("product_id", productIds)
      .select("id");

    return { data, error };
  },
};
