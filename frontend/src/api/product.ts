import { supabase } from "@/lib/supabase/client";
import {
  type DeleteProducts,
  type ProductCategory,
  type ProductCollection,
  type Product,
  type ProductWithRelations,
  type DeleteProductsInput,
} from "@TheCozyBud/types";
import { snakeToCamel } from "@/lib/utils/caseConverter";
import type { ProductQueryAPI } from "@/types";
import { apiClient } from "@/lib/axios/client";

export const ProductAPI = {
  getAll: async ({
    filters,
    sort,
    page = 0,
    perPage = 12,
    noDummyProduct = false,
  }: ProductQueryAPI & { noDummyProduct?: boolean }): Promise<
    ProductWithRelations[]
  > => {
    console.log({ page });

    let query = supabase
      .from("products")
      .select("*, product_collections (name), product_categories(name)")
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

    const productsWithRelations = (data ?? []).map(
      ({ product_categories, product_collections, ...rest }) => {
        return {
          ...rest,
          categoryName: product_categories?.name ?? null,
          collectionName: product_collections?.name ?? null,
        };
      },
    );

    return snakeToCamel(productsWithRelations ?? []);
  },

  getById: async (productId: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    console.log("Fetching product id");

    if (error) throw error;
    if (!data) return null;

    return snakeToCamel(data ?? []);
  },

  update: async (
    productFormData: FormData,
    productId: string,
  ): Promise<ProductWithRelations> => {
    return await apiClient.patch(`/product/${productId}`, productFormData);
  },

  create: async (productFormData: FormData): Promise<ProductWithRelations> => {
    return await apiClient.post("/product", productFormData);
  },

  deleteMany: async (
    productIds: DeleteProductsInput,
  ): Promise<DeleteProducts> => {
    return apiClient.delete("/product", {
      data: productIds,
    });
  },

  getCategories: async (): Promise<ProductCategory[]> => {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*");

    console.log("Fetching categories...");
    console.log(data);
    if (error) throw error;
    return snakeToCamel(data ?? []);
  },

  getCollections: async (): Promise<ProductCollection[]> => {
    const { data, error } = await supabase
      .from("product_collections")
      .select("*");

    console.log("Fetching collections...");
    console.log(data);

    if (error) throw error;
    return snakeToCamel(data ?? []);
  },
};
