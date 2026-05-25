import {
  type DeleteProducts,
  type ProductWithRelations,
  type DeleteProductsInput,
  type AdminQueryOrdersInput,
  type AdminQueryOrdersRes,
  type CreateProductFormOutput,
  type UpdateProductFormOutput,
  type AdminAnalyticsRes,
} from "@cozybud/schemas";
import { supabase } from "@/lib/supabase/client";
import { toProductWithRelationsDomain } from "@/lib/utils/mappers";
import { client, unwrapData } from "./_client";
import type { ProductQueryListItemsAPI } from "@/types";

export const AdminAPI = {
  queryProducts: async ({
    page = 0,
    perPage = 12,
    filters,
    sort,
  }: {
    page: number;
    perPage: number;
    filters?: ProductQueryListItemsAPI["filters"];
    sort?: ProductQueryListItemsAPI["sort"];
  }): Promise<ProductWithRelations[]> => {
    let query = supabase
      .from("products")
      .select(
        "*, product_variants(attributes, id, price_cents), product_categories(name), product_collections(name)",
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
      const min = priceRange.min * 100;
      const max =
        priceRange.max !== undefined ? priceRange.max * 100 : undefined;

      if (max !== undefined) {
        query = query
          .gte("min_price_cents", min)
          .lte("min_price_cents", max);
      } else {
        query = query.gte("min_price_cents", min);
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

        default:
          query
            .order("created_at", { ascending: false })
            .order("id", { ascending: false });
      }
    } else {
      query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data.map((d) => toProductWithRelationsDomain(d));
  },

  createProduct: async (
    payload: CreateProductFormOutput,
  ): Promise<ProductWithRelations> => {
    const { data: raw } = await client.admin.POST("/admin/product", {
      body: payload,
      bodySerializer(body) {
        if (!body) return;
        const fd = new FormData();

        const append = (key: string, value: unknown) => {
          if (value == undefined) return;
          fd.append(key, String(value));
        };

        append("name", body.name);
        append("categoryName", body.categoryName);
        append("primaryImageIndex", body.primaryImageIndex);
        append("description", body.description);
        append("collectionName", body.collectionName);

        // Stringify complex objects
        append("options", JSON.stringify(body.options));
        append("variants", JSON.stringify(body.variants));

        // Files array → iterate and append each File
        if (body.productImages) {
          body.productImages.forEach((file) =>
            fd.append("productImages", file),
          );
        }

        return fd;
      },
    });

    const data = unwrapData(raw, "POST /admin/product");
    return {
      ...data,
      createdAt: new Date(data.createdAt as unknown as Date),
      updatedAt: new Date(data.updatedAt),
    };
  },

  updateProduct: async (
    payload: UpdateProductFormOutput,
    id: string,
  ): Promise<ProductWithRelations> => {
    const { data: raw } = await client.admin.PATCH("/admin/product/{id}", {
      params: { path: { id } },
      body: payload,
      bodySerializer(body) {
        if (!body) return;
        const fd = new FormData();

        const append = (key: string, value: unknown) => {
          if (value == undefined) return;
          fd.append(key, String(value));
        };

        append("name", body.name);
        append("description", body.description);
        append("primaryImageIndex", body.primaryImageIndex);
        append("categoryName", body.categoryName);
        append("collectionName", body.collectionName);

        // Stringify complex objects
        append("options", JSON.stringify(body.options));
        append("variants", JSON.stringify(body.variants));

        // Files array → iterate and append each File
        if (body.newProductImages) {
          body.newProductImages.forEach((file) =>
            fd.append("newProductImages", file),
          );
        }
        if (body.imageUrlsToDelete) {
          body.imageUrlsToDelete.forEach((file) =>
            fd.append("imageUrlsToDelete", file),
          );
        }

        return fd;
      },
    });
    const data = unwrapData(raw, "PATCH /admin/product/{id}");
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },

  deleteProducts: async (
    productIds: DeleteProductsInput,
  ): Promise<DeleteProducts> => {
    const { data: raw } = await client.admin.DELETE("/admin/product", {
      body: productIds,
    });
    return unwrapData(raw, "DELETE /admin/product");
  },

  getOrders: async (
    query: AdminQueryOrdersInput,
  ): Promise<AdminQueryOrdersRes> => {
    const { data: raw } = await client.admin.GET("/admin/order", {
      params: { query },
    });
    const data = unwrapData(raw, "GET /admin/order");

    return {
      ...data,
      orders: data.orders.map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        expiresAt: new Date(o.expiresAt),
      })),
    };
  },

  getAnalytics: async (): Promise<AdminAnalyticsRes> => {
    const { data: raw } = await client.admin.GET("/admin/analytics");
    return unwrapData(raw, "GET /admin/analytics");
  },
};
