import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product";
import { useToast } from "@/providers/ToastProvider";
import type { ProductWithRelations } from "@TheCozyBud/types";
import isDev from "@/lib/utils/isDev";

type ProductsQueryData = {
  pages: ProductWithRelations[][];
  pageParams?: number[];
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: ProductAPI.deleteMany,
    onMutate: ({ productIds }) => {
      addToast(
        `Deleting product${productIds.length > 1 ? "s" : ""}...`,
        "info",
      );
    },
    onError: (err: Error) => {
      isDev && console.error(err.message);
      addToast(err.message || "Failed to delete product", "error");
    },
    onSuccess: ({ deletedProductIds }) => {
      queryClient.setQueryData<ProductsQueryData>(
        ["__admin__products__"],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const deletedSet = new Set(deletedProductIds);

          // Filter out deleted products from each page
          const newPages = oldData.pages
            .map((page) =>
              page.filter((product) => !deletedSet.has(product.id)),
            )
            .filter((page) => page.length > 0); // remove empty pages

          return { ...oldData, pages: newPages };
        },
      );

      addToast("Product deleted successfully", "success");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: ProductAPI.create,
    onMutate: () => {
      addToast("Creating new product...", "info");
    },
    onError: function handleCreateProductError(err: Error) {
      isDev && console.error("product error:", err.message);
      addToast(err.message, "error");
      throw err.message;
    },
    onSuccess: (product) => {
      queryClient.setQueryData<ProductsQueryData>(
        ["__admin__products__"],
        (oldData) => {
          if (!oldData) return oldData;

          const firstPage = oldData.pages[0] ?? [];

          return {
            ...oldData,
            pages: [
              [product, ...firstPage], // prepend new product to first page
              ...oldData.pages.slice(1),
            ],
          };
        },
      );

      addToast("Product added successfully", "success");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({
      formData,
      productId,
    }: {
      formData: FormData;
      productId: string;
    }) => ProductAPI.update(formData, productId),
    onMutate: () => {
      addToast("Updating product data...", "info");
    },
    onError: (err: Error) => {
      const message = err.message || "Failed to update product";
      isDev && console.error("error message:", message);
      addToast(message, "error");
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<ProductsQueryData>(
        ["__admin__products__"],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          // Build lookup
          const productPositionMap = new Map<
            string,
            { pageIndex: number; productIndex: number }
          >();

          oldData.pages.forEach((page, pIdx) => {
            page.forEach((prod, prodIdx) => {
              productPositionMap.set(prod.id, {
                pageIndex: pIdx,
                productIndex: prodIdx,
              });
            });
          });

          const pos = productPositionMap.get(updatedProduct.id);
          if (!pos) return oldData;

          const { pageIndex, productIndex } = pos;

          const newPages = oldData.pages.map((page, idx) => {
            if (idx !== pageIndex) return page;
            const newPage = [...page];
            newPage[productIndex] = updatedProduct;
            return newPage;
          });

          return { ...oldData, pages: newPages };
        },
      );

      addToast("Product updated successfully", "success");
    },
  });

  return {
    createProductMutation,
    deleteProductMutation,
    updateProductMutation,
  };
};
