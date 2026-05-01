import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import type { ProductCollection } from "@TheCozyBud/schemas";

export const useCollectionsQuery = () => {
  const {
    data: collections,
    error,
    isLoading,
  } = useQuery<ProductCollection[]>({
    queryKey: ["product_collections"],
    queryFn: ProductAPI.getCollections,
    staleTime: 0,
  });

  return { collections, error, isLoading };
};
