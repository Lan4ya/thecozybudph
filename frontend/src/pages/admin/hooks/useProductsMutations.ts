import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import { useToast } from "@/providers/ToastProvider";
import type { CreateProductData, UpdateProductData } from "@TheCozyBud/schema";

type UpdateProductsQueryData = {
  pages: UpdateProductData[][];
  pageParams?: number[];
};

type CreateProductsQueryData = {
  pages: CreateProductData[][];
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
      queryClient.setQueryData<CreateProductsQueryData>(
        ["__admin__products__"],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const productPositionMap = new Map<
            string,
            { pageIndex: number; productIndex: number }
          >();
          oldData.pages.forEach((page, pIdx) => {
            page.forEach((product, prodIdx) => {
              productPositionMap.set(product.id, {
                pageIndex: pIdx,
                productIndex: prodIdx,
              });
            });
          });

          const pos = productPositionMap.get(deletedProduct.productId);
          if (!pos) return oldData; // product not found

          const { pageIndex, productIndex } = pos;
          const newPages = oldData.pages
            .map((page, idx) => {
              if (idx !== pageIndex) return page; // other pages unchanged
              const newPage = [...page];
              newPage.splice(productIndex, 1); // remove the product
              return newPage;
            })
            .filter((page) => page.length > 0);

          return { ...oldData, pages: newPages };
        },
      );

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
    mutationFn: async (formData: FormData) => await update(formData),
    onMutate: () => {
      addToast("Updating product data...", "info");
    },
    onError: (err: Error) => {
      const message = err.message || "Failed to update product";

      // console.error("Backend error message:", message);
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
    addProductMutation,
    deleteProductMutation,
    updateProductMutation,
  };
};
