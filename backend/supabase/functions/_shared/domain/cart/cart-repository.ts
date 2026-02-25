import { SupabaseType } from "@shared/types.d.ts";
import { ProductVariant } from "../../types/index.ts";
import { db } from "../../db/client.ts";
import { cartItems } from "../../db/schema/carts.ts";
import { sql } from "drizzle-orm";

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

  upsertCartItem: async (
    cartId: string,
    productId: string,
    quantity: number,
    productVariant: ProductVariant,
    cardMessages: string[] = [],
  ) => {
    return await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(cartItems)
        .values({
          cartId,
          productId,
          productVariant,
          quantity,
          cardMessages,
        })
        .onConflictDoUpdate({
          target: [
            cartItems.cartId,
            cartItems.productId,
            cartItems.productVariant,
          ],
          set: {
            quantity: sql`${cartItems.quantity} + ${quantity}`,
            cardMessages: sql`array_append(${cartItems.cardMessages}, ${cardMessages})`,
          },
        })
        .returning({
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          productVariant: cartItems.productVariant,
          cardMessages: cartItems.cardMessages,
        });

      return result;
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
