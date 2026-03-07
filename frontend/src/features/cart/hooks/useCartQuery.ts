import { CartAPI } from "@/api/cart";
import { useQuery } from "@tanstack/react-query";
import type { CartItem } from "@TheCozyBud/types";

export const cartQueryOptions = {
  queryKey: ["cart"],
  queryFn: CartAPI.getItems,
  meta: { persist: false },
};

export const useCartQuery = () => {
  return useQuery<CartItem[]>(cartQueryOptions);
};
