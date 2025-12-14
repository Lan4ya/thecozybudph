import { supabase } from "../../lib/supabase/client";
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
import { unwrapAPIResponse } from "@/lib/utils/unwrapAPIResponse";
import type { ProductQueryAPI } from "@/types";

export const ProductAPI = {
  getAll: async ({
    filters,
    sort,
    page = 0,
    perPage = 12,
    noDummyProduct = false,
  }: ProductQueryAPI & { noDummyProduct?: boolean }): Promise<
    ProductDataWithJoins[]
  > => {
    console.log({ page });

    let query = supabase
      .from("products_metadata")
      .select("*, products_collection (*), products_category(*)")
      .range(page * perPage, (page + 1) * perPage - 1);

    if (noDummyProduct) {
      query = query.not("name", "ilike", "%dummy product%");
    }
    // console.log("API Filters: ", filters);

    // Handle filters
    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.categoryIds?.length) {
      query = query.in("product_category_id", filters.categoryIds);
    }

    if (filters?.collectionIds?.length) {
      query = query.in("product_collection_id", filters.collectionIds);
    }

    const priceRange = filters?.priceRange;
    if (priceRange) {
      if (priceRange.max !== undefined) {
        query = query.gte("price", priceRange.min).lte("price", priceRange.max);
      } else {
        query = query
          .gte("price", priceRange.min)
          .order("price", { ascending: true });
      }
    }

    // Handle sort
    if (sort) {
      switch (sort) {
        case "Lowest Price":
          query
            .order("price", { ascending: true })
            .order("id", { ascending: true });
          break;

        case "Highest Price":
          query
            .order("price", { ascending: false })
            .order("id", { ascending: false });
          break;

        case "Most Recent":
          query
            .order("created_at", { ascending: false })
            .order("id", { ascending: false });
          break;

        default:
          query
            .order("created_at", { ascending: true })
            .order("id", { ascending: true });
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
    const res = await apiClient.patch("/products", productFormData);
    return unwrapAPIResponse(res.data);
  },

  create: async (productFormData: FormData): Promise<CreateProductData> => {
    const res = await apiClient.post("/products", productFormData);
    return unwrapAPIResponse(res.data);
  },

  delete: async (productIds: string[]): Promise<DeleteProductData> => {
    const res = await apiClient.delete("/products", {
      params: { productIds },
    });
    return unwrapAPIResponse(res.data);
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
