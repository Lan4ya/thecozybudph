import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ProductPayloadFromDB } from "@/lib/supabase/products";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/supabase/products";
import { useToast } from "@/providers/ToastProvider";

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => await deleteProduct(id),
    onMutate: () => {
      addToast("Deleting product", "info");
    },
    onError: (err: any) => {
      addToast(err?.message || "Failed to delete product", "error");
    },
    onSuccess: () => {
      addToast("Product deleted successfully 🌸", "success");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onSettled: () => {},
  });

  const addProductMutation = useMutation({
    mutationFn: async (formData: FormData) => await addProduct(formData),
    onMutate: () => {
      addToast("Adding new product", "info");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.[0]?.message ||
        err?.message ||
        "Failed to add product";

      // console.error("Full error object:", err);
      console.error("Backend error message:", message);

      addToast(message, "error");
    },
    onSuccess: () => {
      addToast("New product added!", "success");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (formData: FormData) => await updateProduct(formData),
    onMutate: () => {
      addToast("Updating product...", "info");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.[0]?.message ||
        err?.meusage ||
        "Failed to update product";

      // console.error("Full error object:", err);
      console.error("Backend error message:", message);

      addToast(message, "error");
    },
    onSuccess: () => {
      addToast("Product updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const query = useSuspenseQuery<ProductPayloadFromDB[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    meta: { persist: true },
  });

  return {
    ...query,
    addProductMutation,
    deleteProductMutation,
    updateProductMutation,
  };
};
