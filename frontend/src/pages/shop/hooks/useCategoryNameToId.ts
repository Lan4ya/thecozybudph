import { ProductAPI } from "@/services/api/products";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useCategoryNameToId = () => {
  const { data: categories } = useQuery({
    queryKey: ["product_categories"],
    queryFn: ProductAPI.getCategories,
  });

  const categoryNameToId = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => map.set(c.name, c.id));
    return map;
  }, [categories]);

  return { categoryNameToId };
};
