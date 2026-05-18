import type { ProductWithRelations } from "@cozybud/schemas";
import { createContext, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

type AdminProductsContextType = {
  isFormOpen: boolean;
  setFormOpen: (open: boolean) => void;

  updatingProduct: ProductWithRelations | null;
  openCreateProductForm: () => void;
  openUpdateProductForm: (product: ProductWithRelations) => void;

  deletingProductIds: Set<string>;
  toggleDeletingProductId: (id: string) => void;
  resetDeletingProductIds: () => void;

  searchQuery: string;
  setSearchQuery: (search: string) => void;
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
  let searchQuery = searchParams.get("search") || "";

  const setSearchQuery = useCallback(
    (q: string) => {
      console.log({ searchQuery });
      console.log({ q });
      // const next = new URLSearchParams(searchParams);
      const next = searchParams;

      if (q === "") {
        next.delete("search");
      } else {
        next.set("search", q);
      }

      setSearchParams(next);
      // console.log({ searchParams: searchParams.toString() });
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

      searchQuery,
      setSearchQuery,
    }),
    [
      isFormOpen,
      setFormOpen,
      updatingProduct,
      openCreateProductForm,
      openUpdateProductForm,
      deletingProductIds,
      toggleDeletingProductId,
      resetDeletingProductIds,
      searchQuery,
      setSearchQuery,
    ],
  );

  return (
    <AdminProductsContext.Provider value={value}>
      {children}
    </AdminProductsContext.Provider>
  );
};

export default AdminProductsProvider;
