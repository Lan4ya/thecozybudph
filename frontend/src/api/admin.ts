import {
  type DeleteProducts,
  type ProductWithRelations,
  type DeleteProductsInput,
  type AdminQueryOrdersInput,
  type AdminQueryOrdersRes,
} from "@TheCozyBud/schemas";
import { apiClient } from "@/lib/axios/client";
import { supabase } from "@/lib/supabase/client";
import { mapProductAndRelationsRowToProductWithRelationsDomain } from "@/lib/utils/mappers";

export const AdminAPI = {
  // Queries the full information of products along with it's relations
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
      .range(page * perPage, (page + 1) * perPage - 1)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

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

  updateProduct: async (
    productFormData: FormData,
    productId: string,
  ): Promise<ProductWithRelations> => {
    return await apiClient.patch(`admin/product/${productId}`, productFormData);
  },

  createProduct: async (
    productFormData: FormData,
  ): Promise<ProductWithRelations> => {
    return await apiClient.post("admin/product", productFormData);
  },

  deleteProducts: async (
    productIds: DeleteProductsInput,
  ): Promise<DeleteProducts> => {
    // await new Promise((res) => setTimeout(res, 3000));
    return await apiClient.delete("admin/product", {
      data: productIds,
    });
  },

  getOrders: async (
    query: AdminQueryOrdersInput,
  ): Promise<AdminQueryOrdersRes> => {
    const res: AdminQueryOrdersRes = await apiClient.get("/admin/order", {
      params: query,
    });

    return {
      ...res,
      orders: res.orders.map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        expiresAt: new Date(o.expiresAt),
      })),
    };
  },
};
