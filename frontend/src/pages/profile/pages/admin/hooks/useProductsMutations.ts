import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product";
import { useToast } from "@/providers/ToastProvider";
import type { ProductWithRelations } from "@TheCozyBud/types";

type UpdateProductsQueryData = {
  pages: ProductWithRelations[][];
  pageParams?: number[];
};

type CreateProductsQueryData = {
  pages: ProductWithRelations[][];
  pageParams?: number[];
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: async (ids: string[]) => await ProductAPI.deleteMany(ids),
    onMutate: (ids) => {
      addToast(`Deleting product${ids.length > 1 ? "s" : ""}...`, "info");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to delete product", "error");
    },
    onSuccess: ({ deletedProductIds }) => {
      queryClient.setQueryData<CreateProductsQueryData>(
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
    mutationFn: async (formData: FormData) => await ProductAPI.create(formData),
    onMutate: () => {
      addToast("Creating new product...", "info");
    },
    onError: function handleCreateProductError(err: Error) {
      throw err.message;
      // console.error("product error:", err.message);
      // addToast(err.message, "error");
    },
    onSuccess: (product) => {
      queryClient.setQueryData<CreateProductsQueryData>(
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
    mutationFn: async ({
      formData,
      productId,
    }: {
      formData: FormData;
      productId: string;
    }) => await ProductAPI.update(formData, productId),
    onMutate: () => {
      addToast("Updating product data...", "info");
    },
    onError: (err: Error) => {
      const message = err.message || "Failed to update product";
      // console.error("error message:", message);
      addToast(message, "error");
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<UpdateProductsQueryData>(
        ["__admin__products__"],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          // Build lookup once
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
