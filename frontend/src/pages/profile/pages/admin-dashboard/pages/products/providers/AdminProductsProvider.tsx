import type { ProductWithRelations } from "@TheCozyBud/types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router";

type AdminProductsContextType = {
  isFormOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingProduct: ProductWithRelations | null;
  openCreateProductForm: () => void;
  openEditProductForm: (product: ProductWithRelations) => void;

  deletingProductIds: Set<string>;
  isDeletingInProgress: boolean;
  setDeletingInProgress: (isDeleting: boolean) => void;
  toggleDeletingProductId: (id: string) => void;
  resetDeletingProductIds: () => void;

  searchQuery: string;
  setSearchQuery: (search: string) => void;
};

export const AdminProductsContext =
  createContext<AdminProductsContextType | null>(null);

const AdminProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithRelations | null>(null);
  const [deletingProductIds, setDeletingProductIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDeletingInProgress, setDeletingInProgress] = useState(false);

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
    setEditingProduct(null);
  }, []);

  const openEditProductForm = useCallback((product: ProductWithRelations) => {
    setFormOpen(true);
    setEditingProduct(product);
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
      editingProduct,
      openCreateProductForm,
      openEditProductForm,

      deletingProductIds,
      isDeletingInProgress,
      setDeletingInProgress,
      toggleDeletingProductId,
      resetDeletingProductIds,

      searchQuery,
      setSearchQuery,
    }),
    [
      isFormOpen,
      setFormOpen,
      editingProduct,
      openCreateProductForm,
      openEditProductForm,
      deletingProductIds,
      isDeletingInProgress,
      setDeletingInProgress,
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
