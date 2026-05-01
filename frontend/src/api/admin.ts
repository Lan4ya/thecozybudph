import {
  type DeleteProducts,
  type ProductWithRelations,
  type DeleteProductsInput,
  type AdminQueryOrdersInput,
  type AdminQueryOrdersRes,
} from "@TheCozyBud/schemas";
import { apiClient } from "@/lib/axios/client";

export const AdminAPI = {
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
