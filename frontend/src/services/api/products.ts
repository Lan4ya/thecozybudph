// FILTERING AND SORTING LATER:
//   for (const [key, value] of Object.entries(filters)) {
//     if (value !== undefined && value !== null && value !== "") {
//       query = query.eq(key, value);
//     }
//   }
//
//   // ↕️ Apply sorting
//   if (sort?.column) {
//     query = query.order(sort.column, { ascending: sort.ascending ?? true });
//   }
import { supabase } from "../../lib/supabase/connect";
import type {
  ProductData,
  CreateProductData,
  UpdateProductData,
  DeleteProductData,
} from "@TheCozyBud/schema";
import { snakeToCamel } from "../../lib/utils/caseConverter";
import { apiClient } from "./interceptors/interceptors";
import { unwrapResponse } from "./utils";

export type FetchProductOpts = {
  page?: number;
  perPage?: number;
  // filters and sorting here later
};

export const ProductAPI = {
  getAll: async ({
    page = 0,
    perPage = 12,
  }: FetchProductOpts): Promise<ProductData[]> => {
    const query = supabase
      .from("products_metadata")
      .select(`*, products_collection (name)`)
      .range(page * perPage, (page + 1) * perPage - 1);
    const { data, error } = await query;

    console.log("Fetching products...");
    if (error) throw error;
    return snakeToCamel(data);
  },

  getById: async (productId: string): Promise<ProductData> => {
    const { data, error } = await supabase
      .from("products_metadata")
      .select("*")
      .eq("id", productId)
      .single();

    console.log("Fetching product id");
    console.log(data);
    if (error) throw error;
    return snakeToCamel(data);
  },

  update: async (productFormData: FormData): Promise<UpdateProductData> => {
    const res = await apiClient.patch("/patch-product", productFormData);
    return unwrapResponse(res.data);
  },

  create: async (productFormData: FormData): Promise<CreateProductData> => {
    const res = await apiClient.post("/add-product", productFormData);
    return unwrapResponse(res.data);
  },

  deleteById: async (productId: string): Promise<DeleteProductData> => {
    const res = await apiClient.delete("/delete-product", {
      params: { productId },
    });
    return unwrapResponse(res.data);
  },
};
