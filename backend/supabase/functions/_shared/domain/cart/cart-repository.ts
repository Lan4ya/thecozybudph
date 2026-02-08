import { SupabaseType } from "@shared/types.d.ts";

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
      .select("product_id, quantity")
      .eq("cart_id", cartId);
    return { data, error };
  },

  upsertCartItem: (
    supabase: SupabaseType,
    cartId: string,
    productId: string,
    quantity: number,
  ) => {
    // This postgres function handles both item insertion and updating quantity.
    return supabase.rpc("upsert_cart_item", {
      p_cart_id: cartId,
      p_product_id: productId,
      p_quantity: quantity,
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
