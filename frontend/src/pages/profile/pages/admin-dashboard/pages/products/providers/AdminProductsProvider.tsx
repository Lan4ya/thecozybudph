import type { ProductWithRelations } from "@TheCozyBud/types";
import { createContext, useState } from "react";

type AdminProductsContextType = {
  isFormOpen: boolean;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingProduct: ProductWithRelations | null;
  setEditingProduct: React.Dispatch<
    React.SetStateAction<ProductWithRelations | null>
  >;
};

export const AdminProductsContext =
  createContext<AdminProductsContextType | null>(null);

const AdminProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [updatingProduct, setUpdatingProduct] =
    useState<ProductWithRelations | null>(null);

  return (
    <AdminProductsContext.Provider
      value={{
        isFormOpen,
        setFormOpen,
        editingProduct: updatingProduct,
        setEditingProduct: setUpdatingProduct,
      }}
    >
      {children}
    </AdminProductsContext.Provider>
  );
};

export default AdminProductsProvider;
