import axios from "axios";
import { supabase } from "./connect";
import type { ProductMetadata } from "@TheCozyBud/schema";

// Modify the original database Product type since we're gonna do some db joins
export type ProductPayloadFromDB = ProductMetadata & {
  products_collection?: { name: string } | null;
};

export async function fetchProducts(): Promise<ProductPayloadFromDB[]> {
  const { data, error } = await supabase
    .from("products_metadata")
    .select(`*, products_collection (name)`); // joins products_collection table

  console.log("Fetching products metadata...");
  console.log(data);

  if (error) throw error;
  return data as ProductPayloadFromDB[];
}

// Create reusable instance
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
});

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

export async function updateProduct(productFormData: FormData) {
  console.log("Updating product with form data:", productFormData);
  const response = await apiClient.patch("/patch-product", productFormData);
  return response.data;
}

export async function addProduct(productFormData: FormData) {
  const response = await apiClient.post("/add-product", productFormData);
  console.log("Add product response:", response.data);
  return response.data;
}

export async function deleteProduct(productId: string) {
  const response = await apiClient.delete("/delete-product", {
    params: { product_id: productId },
  });
  return response.data;
}
