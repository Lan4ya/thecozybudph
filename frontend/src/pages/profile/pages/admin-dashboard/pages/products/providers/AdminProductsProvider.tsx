import type { ProductWithRelations } from "@cozybud/schemas";
import { createContext, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import type { ProductQueryUI } from "@/types";
import { parseProductQueryParams } from "@/pages/shop/utils/parseProductQueryParams";
import { ProductQueryStateContext } from "@/providers/ProductQueryProvider";

type AdminProductsContextType = {
  isFormOpen: boolean;
  setFormOpen: (open: boolean) => void;

  updatingProduct: ProductWithRelations | null;
  openCreateProductForm: () => void;
  openUpdateProductForm: (product: ProductWithRelations) => void;

  deletingProductIds: Set<string>;
  toggleDeletingProductId: (id: string) => void;
  resetDeletingProductIds: () => void;

  productQuery: ProductQueryUI;
  setProductQuery: (
    updates:
      | Partial<ProductQueryUI>
      | ((filters: ProductQueryUI) => Partial<ProductQueryUI>),
  ) => void;
};

export const AdminProductsContext =
  createContext<AdminProductsContextType | null>(null);

const AdminProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [updatingProduct, setUpdatingProduct] =
    useState<ProductWithRelations | null>(null);
  const [deletingProductIds, setDeletingProductIds] = useState<Set<string>>(
    new Set(),
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const productQuery: ProductQueryUI = parseProductQueryParams(searchParams);

  const setProductQuery = useCallback(
    (
      updates:
        | Partial<ProductQueryUI>
        | ((pq: ProductQueryUI) => Partial<ProductQueryUI>),
    ) => {
      const qp: ProductQueryUI = parseProductQueryParams(searchParams);
      const nextQp = typeof updates === "function" ? updates(qp) : updates;

      // Handle filters
      if (nextQp.filters) {
        Object.entries(nextQp.filters).forEach(([key, val]) => {
          if (!val || (Array.isArray(val) && !val.length)) {
            searchParams.delete(key);
          } else if (Array.isArray(val)) {
            searchParams.delete(key);
            val.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.set(key, String(val));
          }
        });
      }

      // Handle sort
      if (nextQp.sort) {
        searchParams.set("sort", nextQp.sort);
      }

      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const openCreateProductForm = useCallback(() => {
    setFormOpen(true);
    setUpdatingProduct(null);
  }, []);

  const openUpdateProductForm = useCallback((product: ProductWithRelations) => {
    setFormOpen(true);
    setUpdatingProduct(product);
  }, []);

  const resetDeletingProductIds = useCallback(
    () => setDeletingProductIds(new Set()),
    [],
  );

  const toggleDeletingProductId = useCallback((id: string) => {
    setDeletingProductIds((prev) => {
      const searchParams = new Set(prev);
      if (searchParams.has(id)) searchParams.delete(id);
      else searchParams.add(id);

      return prev.size === searchParams.size ? prev : searchParams;
    });
  }, []);

  const hasProductQueryFilters = useMemo(() => {
    const { filters } = productQuery;
    if (!filters) return false;
    return Object.values(filters).some((v) =>
      Array.isArray(v) ? v.length > 0 : Boolean(v),
    );
  }, [productQuery]);

  const clearProductQueryFilters = useCallback(() => {
    const qp = parseProductQueryParams(searchParams);
    if (qp.filters) {
      Object.keys(qp.filters).forEach((key) => {
        searchParams.delete(key);
      });
    }
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const value = useMemo(
    () => ({
      isFormOpen,
      setFormOpen,
      updatingProduct,
      openCreateProductForm,
      openUpdateProductForm,

      deletingProductIds,
      toggleDeletingProductId,
      resetDeletingProductIds,

      productQuery,
      setProductQuery,
    }),
    [
      isFormOpen,
      updatingProduct,
      deletingProductIds,
      productQuery,
      setProductQuery,
    ],
  );

  const shopProviderValue = useMemo(
    () => ({
      productQuery,
      setProductQuery,
      hasProductQueryFilters,
      clearProductQueryFilters,
    }),
    [
      productQuery,
      setProductQuery,
      hasProductQueryFilters,
      clearProductQueryFilters,
    ],
  );

  return (
    <AdminProductsContext.Provider value={value}>
      <ProductQueryStateContext.Provider value={shopProviderValue}>
        {children}
      </ProductQueryStateContext.Provider>
    </AdminProductsContext.Provider>
  );
};

export default AdminProductsProvider;
