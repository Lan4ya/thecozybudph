import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { CartItem } from "@TheCozyBud/types";
import { CartAPI } from "@/api/cart";
import { useAuthStore } from "@/store/useAuthStore";

export const cartQueryOptions = {
  queryKey: ["cart"],
  queryFn: CartAPI.getItems,
  staleTime: 0,
};

export const useCartSuspenseQuery = () => {
  return useSuspenseQuery<CartItem[]>(cartQueryOptions);
};

export const useCartQuery = () => {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);

  return useQuery<CartItem[]>({
    ...cartQueryOptions,
    enabled: !!session && !loading,
  });
};
