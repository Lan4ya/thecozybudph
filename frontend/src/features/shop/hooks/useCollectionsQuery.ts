import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import type { ProductCollection } from "@TheCozyBud/types";

export const useCollectionsQuery = () => {
  const {
    data: collections,
    error,
    isLoading,
  } = useQuery<ProductCollection[]>({
    queryKey: ["product_collections"],
    queryFn: ProductAPI.getCollections,
  });

  return { collections, error, isLoading };
};
