import { supabase } from "@/lib/supabase/client";
import {
  type ProductCategory,
  type ProductCollection,
  type Product,
  type ProductListItem,
} from "@cozybud/schemas";
import { snakeToCamel } from "@/lib/utils/caseConverter.ts";
import type { ProductQueryListItemsAPI } from "@/types";
import { toProductDomain } from "@/lib/utils/mappers";
import isDev from "@/lib/utils/isDev";

export const ProductAPI = {
  queryProducts: async ({
    filters,
    sort,
    page = 0,
    perPage = 12,
  }: ProductQueryListItemsAPI): Promise<ProductListItem[]> => {
    let query = supabase
      .from("products")
      .select(
        `
          id,
          name,
          primary_image_url,
          min_price_cents,
          max_price_cents,
          description,
          product_collections (
          name
          ),
          product_categories (
          name
          )
          `,
      )
      .range(page * perPage, (page + 1) * perPage - 1);

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
      // convert to cents for comparison
      const minPrice = priceRange.min * 100;
      const maxPrice =
        priceRange.max !== undefined ? priceRange.max * 100 : undefined;

      if (maxPrice !== undefined) {
        query = query
          .gte("min_price_cents", minPrice)
          .lte("min_price_cents", maxPrice)
          .order("min_price_cents", { ascending: true });
      } else {
        query = query
          .gte("min_price_cents", minPrice)
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
            .order("min_price_cents", { ascending: false })
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
    isDev && console.log("Fetching products...");

    if (error) throw error;

    const productListItems = data.map((item) => ({
      id: item.id,
      name: item.name,
      primaryImageUrl: item.primary_image_url,
      minPriceCents: item.min_price_cents,
      maxPriceCents: item.max_price_cents,
      description: item.description ?? null,
      category: item.product_categories?.name ?? null,
      collection: item.product_collections?.name ?? null,
    }));

    // console.log("products: ", productListItems);
    return productListItems;
  },

  getById: async (productId: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(id, attributes, price_cents)")
      .eq("id", productId)
      .maybeSingle();

    isDev && console.log("fetching product by id...");
    if (error) throw error;
    if (!data) return null;

    return toProductDomain(data);
  },

  getByIds: async (productIds: string[]): Promise<Product[] | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(id, attributes, price_cents)")
      .in("id", productIds);

    isDev && console.log("Fetching products by ids...", data);

    if (error) throw error;
    if (!data) return null;

    return (data ?? []).map(toProductDomain);
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
