import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import { useToast } from "@/providers/ToastProvider";
import type { ProductData } from "@TheCozyBud/schema";

type ProductsQueryData = {
  pages: ProductData[][];
  pageParams?: number[];
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { deleteById, update, create } = ProductAPI;

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => await deleteById(id),
    onMutate: () => {
      addToast("Deleting product...", "info");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to delete product", "error");
    },
    onSuccess: (deletedProduct) => {
      queryClient.setQueryData<ProductsQueryData>(["products"], (oldData) => {
        if (!oldData?.pages) return oldData;

        // remove the deleted product from all pages
        const pages = oldData.pages
          .map((page) => page.filter((p) => p.id !== deletedProduct.productId))
          .filter((page) => page.length > 0);

        return { ...oldData, pages };
      });

      addToast("Product deleted successfully", "success");
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (formData: FormData) => await create(formData),
    onMutate: () => {
      addToast("Creating new product...", "info");
    },
    onError: (err: Error) => {
      const message = err.message || "Failed to add product";
      console.error("Backend error message:", message);
      addToast(message, "error");
    },
    onSuccess: (product) => {
      queryClient.setQueryData<ProductsQueryData>(["products"], (oldData) => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0] ?? [];

        return {
          ...oldData,
          pages: [
            [product, ...firstPage], // prepend new product to first page
            ...oldData.pages.slice(1),
          ],
        };
      });

      addToast("Product added successfully", "success");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (formData: FormData) => await update(formData),
    onMutate: () => {
      addToast("Updating product data...", "info");
    },
    onError: (err: Error) => {
      const message = err.message || "Failed to update product";

      console.error("Backend error message:", message);
      addToast(message, "error");
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<ProductsQueryData>(["products"], (oldData) => {
        if (!oldData?.pages) return oldData;

        const pageIndex = oldData.pages.findIndex((page) =>
          page.some((p) => p.id === updatedProduct.id),
        );
        if (pageIndex === -1) return oldData;

        const pages = oldData.pages.map((page, idx) =>
          idx === pageIndex
            ? page.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
            : page,
        );

        return { ...oldData, pages };
      });

      addToast("Product updated successfully", "success");
    },
  });

  return {
    addProductMutation,
    deleteProductMutation,
    updateProductMutation,
  };
};
