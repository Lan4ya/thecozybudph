import {
  type DeleteProducts,
  type ProductWithRelations,
  type DeleteProductsInput,
  type AdminQueryOrdersInput,
  type AdminQueryOrdersData,
  type CreateProductFormOutput,
  type UpdateProductFormOutput,
  type AdminAnalyticsRes,
  type CreateShippingQuoteData,
  type CreateShippingQuoteInput,
  type GetShippingOrderData,
  type ShipOrderData,
  type ShipOrderInput,
  type AdminGetOrderData,
} from "@cozybud/schemas";
import { supabase } from "@/lib/supabase/client";
import { toProductWithRelationsDomain } from "@/lib/utils/mappers";
import { client, unwrapData } from "./_client";
import type { ProductQueryListItemsAPI } from "@/types";
import isDev from "@/lib/utils/isDev";

export const AdminAPI = {
  // ------------------------- Products -------------------------

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
        query = query.gte("min_price_cents", min).lte("min_price_cents", max);
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

  // Orders

  getOrder: async (orderId: string): Promise<AdminGetOrderData> => {
    const { data: raw } = await client.admin.GET("/admin/order/{id}", {
      params: { path: { id: orderId } },
    });
    const data = unwrapData(raw, `GET /admin/order/${orderId}`);
    if (!data) return null;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      expiresAt: new Date(data.expiresAt),
    };
  },

  queryOrders: async (
    query: AdminQueryOrdersInput,
  ): Promise<AdminQueryOrdersData> => {
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

  // ------------------------- Analytics -------------------------

  getAnalytics: async (): Promise<AdminAnalyticsRes> => {
    const { data: raw } = await client.admin.GET("/admin/analytics");
    return unwrapData(raw, "GET /admin/analytics");
  },

  // ------------------------- Shipment -------------------------

  createShipmentQuote: async (
    payload: CreateShippingQuoteInput,
  ): Promise<CreateShippingQuoteData[]> => {
    isDev && console.log("creating shipping quotes...", payload);
    const { data: raw } = await client.admin.POST("/admin/shipment/quotes", {
      body: payload,
    });
    const data = unwrapData(raw, "POST /admin/shipment/quotes");

    return data.map((quote) => ({
      ...quote,
      scheduleAt: new Date(quote.scheduleAt),
      expiresAt: new Date(quote.expiresAt),
    }));
  },

  createShipmentOrder: async (
    payload: ShipOrderInput,
    orderId: string,
  ): Promise<ShipOrderData> => {
    const { data: raw } = await client.admin.PATCH("/admin/order/{id}/ship", {
      params: { path: { id: orderId } },
      body: payload,
    });
    const data = unwrapData(raw, `PATCH /admin/order/${orderId}/ship`);
    return {
      ...data,
      updatedAt: new Date(data.updatedAt),
      createdAt: new Date(data.createdAt),
      scheduleAt: data?.scheduleAt ? new Date(data.scheduleAt) : null,
      PODFailedAt: data?.PODFailedAt ? new Date(data.PODFailedAt) : null,
      PODDeliveredAt: data?.PODDeliveredAt
        ? new Date(data.PODDeliveredAt)
        : null,
    };
  },

  getShipmentOrder: async (
    orderId: string,
  ): Promise<GetShippingOrderData | null> => {
    const { data: raw } = await client.admin.GET("/admin/order/{id}/ship", {
      params: { path: { id: orderId } },
    });
    const data = unwrapData(raw, `GET /admin/order/${orderId}/ship`);
    if (!data) return null;

    return {
      ...data,
      updatedAt: new Date(data.updatedAt),
      createdAt: new Date(data.createdAt),
      scheduleAt: data?.scheduleAt ? new Date(data.scheduleAt) : null,
      PODFailedAt: data?.PODFailedAt ? new Date(data.PODFailedAt) : null,
      PODDeliveredAt: data?.PODDeliveredAt
        ? new Date(data.PODDeliveredAt)
        : null,
    };
  },

  cancelShipmentOrder: async (
    orderId: string,
  ): Promise<{ success: boolean }> => {
    const { data: raw } = await client.admin.DELETE("/admin/order/{id}/ship", {
      params: { path: { id: orderId } },
    });
    return unwrapData(raw, `DELETE /admin/order/${orderId}/ship/cancel`);
  },

  // addPriorityFee: async (
  //   payload: AddShippingOrderPriorityFeeInput,
  // ): Promise<GetShippingOrderData> => {
  //   const { data: raw } = await client.admin.POST(
  //     "/admin/shipment/priority-fee",
  //     {
  //       body: payload,
  //     },
  //   );
  //   return unwrapData(raw, "POST /admin/shipment/priority-fee");
  // },
  //
  // getDriver: async (
  //   query: GetShippingDriverInput,
  // ): Promise<GetShippingDriverData> => {
  //   const { data: raw } = await client.admin.GET("/admin/shipment/driver", {
  //     params: { query },
  //   });
  //   return unwrapData(raw, "GET /admin/shipment/driver");
  // },
  //
  // changeDriver: async (
  //   payload: ChangeShippingDriverInput,
  // ): Promise<GetShippingDriverData> => {
  //   const { data: raw } = await client.admin.POST(
  //     "/admin/shipment/driver/change",
  //     {
  //       body: payload,
  //     },
  //   );
  //   return unwrapData(raw, "POST /admin/shipment/driver/change");
  // },
  //
  // getCity: async (cityId: string): Promise<GetShippingCityData> => {
  //   const { data: raw } = await client.admin.GET(
  //     "/admin/shipment/city/{cityId}",
  //     {
  //       params: { path: { cityId } },
  //     },
  //   );
  //   return unwrapData(raw, `GET /admin/shipment/city/${cityId}`);
  // },
  //
  // getMarket: async (): Promise<GetShippingMarketData> => {
  //   const { data: raw } = await client.admin.GET("/admin/shipment/market");
  //   return unwrapData(raw, "GET /admin/shipment/market");
  // },
  //
  // editShippingOrder: async (
  //   orderId: string,
  //   payload: EditShippingOrderInput,
  // ): Promise<GetShippingOrderData> => {
  //   const { data: raw } = await client.admin.PATCH(
  //     "/admin/order/{id}/ship/edit",
  //     {
  //       params: { path: { id: orderId } },
  //       body: payload,
  //     },
  //   );
  //   return unwrapData(raw, `PATCH /admin/order/${orderId}/ship/edit`);
  // },
};
