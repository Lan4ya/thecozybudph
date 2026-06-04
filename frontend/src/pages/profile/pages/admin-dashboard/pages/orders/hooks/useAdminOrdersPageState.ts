import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { OrderStatus, AdminQueryOrdersInput } from "@cozybud/schemas";

const DEFAULT_LIMIT = 20;

export const useAdminOrdersPageState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo((): AdminQueryOrdersInput => {
    const sortBy =
      (searchParams.get("sort") as AdminQueryOrdersInput["sortBy"]) ||
      "createdAt";
    const sortDir =
      (searchParams.get("dir") as AdminQueryOrdersInput["sortDir"]) || "desc";
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(
      searchParams.get("limit") || String(DEFAULT_LIMIT),
      10,
    );
    const pageParam = parseInt(searchParams.get("page") || "0", 10);
    const offset = pageParam * limit;

    return {
      sortBy,
      sortDir,
      status: status || undefined,
      search,
      limit,
      offset,
    };
  }, [searchParams]);

  const page = Math.floor((query.offset ?? 0) / (query.limit ?? DEFAULT_LIMIT));

  const setSort = useCallback(
    (
      sortBy: AdminQueryOrdersInput["sortBy"],
      sortDir: AdminQueryOrdersInput["sortDir"],
    ) => {
      setSearchParams(
        (prev) => {
          prev.set("sort", sortBy || "createdAt");
          prev.set("dir", sortDir || "desc");
          prev.set("page", "0");
          return prev;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setStatus = useCallback(
    (status?: OrderStatus) => {
      setSearchParams(
        (prev) => {
          if (status) {
            prev.set("status", status);
          } else {
            prev.delete("status");
          }
          prev.set("page", "0");
          return prev;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (search?: string) => {
      setSearchParams(
        (prev) => {
          if (search) {
            prev.set("search", search);
          } else {
            prev.delete("search");
          }
          prev.set("page", "0");
          return prev;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      setSearchParams(
        (prev) => {
          prev.set("page", page.toString());
          return prev;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    query,
    page,
    setSort,
    setStatus,
    setSearch,
    setPage,
  };
};
