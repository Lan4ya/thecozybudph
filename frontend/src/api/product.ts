import { supabase } from "@/lib/supabase/client";
import {
  type DeleteProducts,
  type ProductCategory,
  type ProductCollection,
  type Product,
  type ProductWithRelations,
  type DeleteProductsInput,
  type ProductListItem,
  type ProductRow,
} from "@TheCozyBud/types";
import { snakeToCamel } from "@/lib/utils/caseConverter.ts";
import type { ProductQueryAPI } from "@/types";
import { apiClient } from "@/lib/axios/client";
import { parseDateString } from "@/lib/utils/format";
import { mapProductRowToProduct } from "@/lib/utils/mappers";

export const ProductAPI = {
  queryListItems: async ({
    filters,
    sort,
    page = 0,
    perPage = 12,
  }: ProductQueryAPI & { noDummyProduct?: boolean }): Promise<
    ProductListItem[]
  > => {
    console.log({ page });

    let query = supabase
      .from("products")
      .select(
        `id, name, primary_image_url, min_price_cents, max_price_cents, product_collections ( name), product_categories ( name )`,
      )
      .range(page * perPage, (page + 1) * perPage - 1);

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
        query = query
          .gte("max_price_cents", priceRange.min)
          .lte("min_price_cents", priceRange.max)
          .order("min_price_cents", { ascending: true });
      } else {
        query = query
          .gte("max_price_cents", priceRange.min)
          .order("min_price_cents", { ascending: true });
      }
    }

    // Handle sort
    if (sort) {
      switch (sort) {
        case "Lowest Price":
          query
            .order("min_price_cents", { ascending: true })
            .order("id", { ascending: true });
          break;

        case "Highest Price":
          query
            .order("max_price_cents", { ascending: false })
            .order("id", { ascending: false });
          break;

        case "Most Recent":
          query
            .order("created_at", { ascending: false })
            .order("id", { ascending: false });
          break;

        // Usually the default should be Popularity, but since there's no data for what's popular yet,
        // this'll do for now. We'll change this later on.
        default:
          query
            .order("created_at", { ascending: true })
            .order("id", { ascending: true });
      }
    }

    const { data, error } = await query;
    console.log("Fetching products...");

    if (error) throw error;

    const productListItems = snakeToCamel(data);
    return productListItems;
  },

  getById: async (productId: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle<ProductRow>();

    // console.log("Fetching product id");
    if (error) throw error;
    if (!data) return null;
    console.log({ data });

    return mapProductRowToProduct(data);
  },

  getByIds: async (productIds: string[]): Promise<Product[] | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    console.log("Fetching products by ids...", data);

    if (error) throw error;
    if (!data) return null;

    return (data ?? []).map(mapProductRowToProduct);
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
