import { useQuery } from "@tanstack/react-query";
import { AdminAPI } from "@/api";
import type { AdminQueryOrdersInput } from "@cozybud/schemas";

export const useAdminOrdersQuery = (query: AdminQueryOrdersInput) => {
  const queryKey = ["admin-orders", query] as const;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: () => AdminAPI.queryOrders(query),
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  });

  return {
    orders: data?.orders ?? [],
    total: data?.meta.total ?? 0,
    limit: data?.meta.limit ?? query.limit ?? 20,
    offset: data?.meta.offset ?? query.offset ?? 0,
    isLoading,
    isFetching,
    error,
    queryKey,
  };
};
