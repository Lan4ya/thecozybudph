import {
  type DeleteProducts,
  type ProductWithRelations,
  type DeleteProductsInput,
  type AdminQueryOrdersInput,
  type AdminQueryOrdersRes,
  type CreateProductFormOutput,
} from "@cozybud/schemas";
import { supabase } from "@/lib/supabase/client";
import { toProductWithRelationsDomain } from "@/lib/utils/mappers";
import { client, unwrapData } from "./_client";

export const AdminAPI = {
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
          if (value === undefined || value === null) return;
          fd.append(key, String(value));
        };

        append("name", body.name);
        append("categoryName", body.categoryName);
        append("options", JSON.stringify(body.options));
        append("variants", JSON.stringify(body.variants));
        append("primaryImageIndex", body.primaryImageIndex);
        append("description", body.description);
        append("collectionName", body.collectionName);

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
    productFormData: FormData,
    id: string,
  ): Promise<ProductWithRelations> => {
    const { data: raw } = await client.admin.PATCH("/admin/product/{id}", {
      params: { path: { id } },
      body: productFormData,
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
};
