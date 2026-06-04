import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import type { ProductCategory } from "@cozybud/schemas";

const staleTime = 1000 * 60 * 5; // 5 mins

export const useCategoriesQuery = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useQuery<ProductCategory[]>({
    queryKey: ["product_categories"],
    queryFn: ProductAPI.getCategories,
    staleTime,
    gcTime: staleTime * 2,
  });

  return {
    categories,
    error,
    isLoading,
  };
};
