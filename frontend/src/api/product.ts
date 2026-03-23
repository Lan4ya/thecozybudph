import { supabase } from "@/lib/supabase/client";
import {
  type DeleteProducts,
  type ProductCategory,
  type ProductCollection,
  type Product,
  type ProductWithRelations,
  type DeleteProductsInput,
  type ProductListItem,
} from "@TheCozyBud/types";
import { snakeToCamel } from "@/lib/utils/caseConverter.ts";
import type { ProductQueryListItemsAPI } from "@/types";
import { apiClient } from "@/lib/axios/client";
import {
  mapProductAndRelationsRowToProductWithRelationsDomain,
  mapProductAndVariantsRowToProductDomain,
} from "@/lib/utils/mappers";
import isDev from "@/lib/utils/isDev";

export const ProductAPI = {
  // Queries the minimum information of products to display in shop
  queryListItems: async ({
    filters,
    sort,
    page = 0,
    perPage = 12,
  }: ProductQueryListItemsAPI & { noDummyProduct?: boolean }): Promise<
    ProductListItem[]
  > => {
    console.log({ page });

    let query = supabase
      .from("products")
      .select(`id, name, primary_image_url, min_price_cents, max_price_cents`)
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
    // console.log("Price Range Filter: ", priceRange);

    if (priceRange) {
      // convert to cents for comparison
      const min = priceRange.min * 100;
      const max =
        priceRange.max !== undefined ? priceRange.max * 100 : undefined;
      console.log("Price Range in cents: ", { min, max });

      if (max !== undefined) {
        query = query
          .gte("min_price_cents", min)
          .lte("min_price_cents", max)
          .order("min_price_cents", { ascending: true });
      } else {
        query = query
          .gte("min_price_cents", min)
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

    // console.log("products: ", productListItems);
    return productListItems;
  },

  // Queries the full information of products along with it's relations
  // (variants, collections, categories) to display in admin dashboard
  queryProducts: async ({
    page = 0,
    perPage = 12,
    search,
  }: {
    page: number;
    perPage: number;
    search?: string;
  }): Promise<ProductWithRelations[]> => {
    let query = supabase
      .from("products")
      .select(
        "*, product_variants(attributes, id, price_cents), product_categories(name), product_collections(name)",
      )
      .range(page * perPage, (page + 1) * perPage - 1);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data.map((d) =>
      mapProductAndRelationsRowToProductWithRelationsDomain(d),
    );
  },

  getById: async (productId: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(id, attributes, price_cents)")
      .eq("id", productId)
      .maybeSingle();

    // isDev && console.log("product: ", data);
    if (error) throw error;
    if (!data) return null;

    return mapProductAndVariantsRowToProductDomain(data);
  },

  getByIds: async (productIds: string[]): Promise<Product[] | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(id, attributes, price_cents)")
      .in("id", productIds);

    isDev && console.log("Fetching products by ids...", data);

    if (error) throw error;
    if (!data) return null;

    return (data ?? []).map(mapProductAndVariantsRowToProductDomain);
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

    isDev && console.log("Fetching categories...");
    isDev && console.log(data);
    if (error) throw error;
    return snakeToCamel(data ?? []);
  },

  getCollections: async (): Promise<ProductCollection[]> => {
    const { data, error } = await supabase
      .from("product_collections")
      .select("*");

    isDev && console.log("Fetching collections...");
    isDev && console.log(data);

    if (error) throw error;
    return snakeToCamel(data ?? []);
  },
};
