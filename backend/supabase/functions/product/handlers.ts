import {
  createProduct,
  deleteProducts,
  updateProduct,
} from "./services/mod.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import type { SupabaseClient } from "supabase";
import {
  DeleteProductsRequest,
  UpdateProductRequest,
  CreateProductRequest,
} from "@shared/schema/index.ts";

export const createProductHandlers = ({
  supabase,
}: {
  supabase: SupabaseClient;
}) => ({
  create: async (data: CreateProductRequest) => {
    const res = await createProduct(supabase, data);
    return handleSuccess(res);
  },

  delete: async (data: DeleteProductsRequest) => {
    const deletedProductIds = await deleteProducts(supabase, data);
    return handleSuccess(deletedProductIds);
  },

  update: async (data: UpdateProductRequest) => {
    const res = await updateProduct(supabase, data);
    return handleSuccess(res);
  },
});
