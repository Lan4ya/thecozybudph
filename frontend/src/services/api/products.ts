import { supabase } from "../../lib/supabase/connect";
import {
  type ProductDataWithJoins,
  type CreateProductData,
  type UpdateProductData,
  type DeleteProductData,
  type ProductData,
  type ProductsCategoryData,
  type ProductsCollectionData,
} from "@TheCozyBud/schema";
import { snakeToCamel } from "../../lib/utils/caseConverter";
import { apiClient } from "./interceptors/interceptors";
import { unwrapResponse } from "./utils";
import type { ProductQueryAPI } from "@/types";

export const ProductAPI = {
  getAll: async ({
    filters,
    sort,
    page = 0,
    perPage = 12,
  }: ProductQueryAPI): Promise<ProductDataWithJoins[]> => {
    let query = supabase
      .from("products_metadata")
      .select("*, products_collection (*), products_category(*)")
      .range(page * perPage, (page + 1) * perPage - 1);

    // Apply filters
    console.log("API Filters: ", filters);

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.categoryIds?.length) {
      query = query.in("product_category_id", filters.categoryIds);
    }

    if (filters?.collectionIds?.length) {
      query = query.in("product_collection_id", filters.collectionIds);
    }

    const pr = filters?.priceRange;
    if (pr) {
      if (pr.max !== undefined) {
        query = query.gte("price", pr.min).lte("price", pr.max);
        // .order("price", { ascending: true });
      } else {
        query = query.gte("price", pr.min).order("price", { ascending: true });
      }
    }

    if (sort) {
      switch (sort) {
        case "Lowest Price":
          query.order("price", { ascending: true });
          break;
        case "Highest Price":
          query.order("price", { ascending: false });
          break;
        case "Most Recent":
          query.order("created_at", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: true });
      }
    }

    const { data, error } = await query;
    console.log("Fetching products...");

    if (error) throw error;
    return snakeToCamel(data ?? []) satisfies ProductDataWithJoins[];
  },

  getById: async (productId: string): Promise<ProductData | null> => {
    const { data, error } = await supabase
      .from("products_metadata")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    console.log("Fetching product id");

    if (error) throw error;
    if (!data) return null;

    return snakeToCamel(data) satisfies ProductData;
  },

  update: async (productFormData: FormData): Promise<UpdateProductData> => {
    const res = await apiClient.patch("/patch-product", productFormData);
    return unwrapResponse(res.data);
  },

  create: async (productFormData: FormData): Promise<CreateProductData> => {
    const res = await apiClient.post("/add-product", productFormData);
    return unwrapResponse(res.data);
  },

  deleteById: async (productId: string): Promise<DeleteProductData> => {
    const res = await apiClient.delete("/delete-product", {
      params: { productId },
    });
    return unwrapResponse(res.data);
  },

  getCategories: async (): Promise<ProductsCategoryData[]> => {
    const { data, error } = await supabase
      .from("products_category")
      .select("*");

    console.log("Fetching categories...");
    console.log(data);
    if (error) throw error;
    return snakeToCamel(data ?? []) satisfies ProductsCategoryData[];
  },

  getCollections: async (): Promise<ProductsCollectionData[]> => {
    const { data, error } = await supabase
      .from("products_collection")
      .select("*");

    console.log("Fetching collections...");
    console.log(data);

    if (error) throw error;
    return snakeToCamel(data ?? []) satisfies ProductsCollectionData[];
  },
};
