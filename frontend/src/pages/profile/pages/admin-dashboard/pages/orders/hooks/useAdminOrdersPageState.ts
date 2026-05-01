import { useState, useCallback } from "react";
import type { OrderStatus, AdminQueryOrdersInput } from "@TheCozyBud/schemas";

export const useAdminOrdersPageState = () => {
  const [query, setQuery] = useState<AdminQueryOrdersInput>({
    sortBy: "createdAt",
    sortDir: "desc",
    limit: 20,
    offset: 0,
  });

  const setSort = useCallback(
    (
      sortBy: AdminQueryOrdersInput["sortBy"],
      sortDir: AdminQueryOrdersInput["sortDir"],
    ) => {
      setQuery((prev) => ({ ...prev, sortBy, sortDir, offset: 0 }));
    },
    [],
  );

  const setStatus = useCallback((status?: OrderStatus) => {
    setQuery((prev) => ({ ...prev, status, offset: 0 }));
  }, []);

  const setSearch = useCallback((search?: string) => {
    setQuery((prev) => ({ ...prev, search: search || undefined, offset: 0 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({
      ...prev,
      offset: page * (prev.limit ?? 20),
    }));
  }, []);

  const page = Math.floor((query.offset ?? 0) / (query.limit ?? 20));

  return {
    query,
    page,
    setSort,
    setStatus,
    setSearch,
    setPage,
  };
};
