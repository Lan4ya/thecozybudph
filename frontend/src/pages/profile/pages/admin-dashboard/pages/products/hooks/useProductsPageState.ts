import { useContext } from "react";
import { AdminProductsContext } from "../providers/AdminProductsProvider";

export const useProductsPageState = () => {
  const ctx = useContext(AdminProductsContext);
  if (!ctx)
    throw new Error(
      "useProductsPageState must be used within AdminProductsProvider",
    );
  return ctx;
};
