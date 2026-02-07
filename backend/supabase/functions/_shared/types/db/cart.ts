import type { Tables } from "./supabase.types.ts";

export type CartRow = Tables<"carts">;
export type CartItemRow = Tables<"cart_items">;
