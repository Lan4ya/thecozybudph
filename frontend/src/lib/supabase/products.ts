import axios from "axios";
import { supabase } from "./connect";
import type {
  FetchProductsResponse,
  FetchProductOpts,
  AddProductResponse,
  UpdateProductResponse,
} from "@/types/api/index.d.ts";

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

export async function fetchProducts({
  page = 0,
  perPage = 12,
}: FetchProductOpts): Promise<FetchProductsResponse[]> {
  const query = supabase
    .from("products_metadata")
    .select(`*, products_collection (name)`)
    .range(page * perPage, (page + 1) * perPage - 1); // pagination range

  const { data, error } = await query;

  console.log("Fetching products metadata...");
  // console.log(data);

  if (error) throw error; // throwing err here so tanstack query can proerly catch it (personally don't like this pattern bruh)
  return data as FetchProductsResponse[];
}

// Create reusable instance
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
});

export const fetchProductById = async (productId: string) => {
  const { data: product, error } = await supabase
    .from("products_metadata")
    .select("*")
    .eq("id", productId)
    .single();

  console.log("fetching product id");
  if (error) throw error;
  return product;
};

// Add auth header to all requests
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    console.warn("⚠️ No session found — using anon key fallback");
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
  }

  return config;
});

export async function updateProduct(
  productFormData: FormData,
): Promise<UpdateProductResponse> {
  const response = await apiClient.patch("/patch-product", productFormData);
  console.log("Updating product response:", response.data);
  return response.data;
}

export async function addProduct(
  productFormData: FormData,
): Promise<AddProductResponse> {
  const response = await apiClient.post("/add-product", productFormData);
  console.log("Add product response:", response.data);
  return response.data;
}

interface DeleteProductResponse {
  success: true;
  message: string;
  deleted_product_id: string;
}

export async function deleteProduct(
  productId: string,
): Promise<DeleteProductResponse> {
  const response = await apiClient.delete("/delete-product", {
    params: { product_id: productId },
  });
  console.log("Delete product response:", response.data);
  return response.data;
}
