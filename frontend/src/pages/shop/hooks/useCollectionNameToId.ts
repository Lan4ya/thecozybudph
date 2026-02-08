import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useCollectionNameToId = () => {
  const { data: collections } = useQuery({
    queryKey: ["product_collections"],
    queryFn: ProductAPI.getCollections,
  });

  const collectionNameToId = useMemo(() => {
    const map = new Map<string, string>();
    collections?.forEach((c) => map.set(c.name, c.id));
    return map;
  }, [collections]);

  return { collectionNameToId };
};
