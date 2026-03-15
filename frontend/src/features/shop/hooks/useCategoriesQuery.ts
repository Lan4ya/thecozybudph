import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import type { ProductCategory } from "@TheCozyBud/types";

export const useCategoriesQuery = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useQuery<ProductCategory[]>({
    queryKey: ["product_categories"],
    queryFn: ProductAPI.getCategories,
  });

  return {
    categories,
    error,
    isLoading,
  };
};
