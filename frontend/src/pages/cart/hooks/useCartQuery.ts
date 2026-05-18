import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { CartItem } from "@cozybud/schemas";
import { CartAPI } from "@/api/cart";
import { useAuthStore } from "@/store/useAuthStore";

export const cartQueryOptions = {
  queryKey: ["cart"],
  queryFn: CartAPI.getItems,
  meta: { persist: true },
};

export const useCartSuspenseQuery = () => {
  return useSuspenseQuery<CartItem[]>(cartQueryOptions);
};

export const useCartQuery = () => {
  const session = useAuthStore((s) => s.session);
  const status = useAuthStore((s) => s.status);

  return useQuery<CartItem[]>({
    ...cartQueryOptions,
    enabled: !!session && status !== "loading",
  });
};
