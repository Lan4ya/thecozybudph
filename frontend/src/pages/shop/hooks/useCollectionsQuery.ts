import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import type { ProductCollection } from "@cozybud/schemas";

const staleTime = 1000 * 60 * 5; // 5 mins

export const useCollectionsQuery = () => {
  const {
    data: collections,
    error,
    isLoading,
  } = useQuery<ProductCollection[]>({
    queryKey: ["product_collections"],
    queryFn: ProductAPI.getCollections,
    staleTime,
    gcTime: staleTime * 2,
  });

  return { collections, error, isLoading };
};
