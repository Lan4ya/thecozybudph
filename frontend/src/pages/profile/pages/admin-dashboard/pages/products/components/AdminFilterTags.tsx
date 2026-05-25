import { X } from "lucide-react";
import type { ProductFiltersUI, ProductPriceRangeOptionsUI } from "@/types";
import { useAdminProductsPageState } from "../hooks/useAdminProductsPageState";
import { Button } from "@/lib/ui/__shadcn__/button";
import toggleArrItem from "@/lib/utils/toggleArrItem";
import { useMemo } from "react";
import { formatPriceRange } from "@/pages/shop/components/filters/PriceRange";

const AdminFilterTags = () => {
  const { productQuery, setProductQuery } = useAdminProductsPageState();

  const hasFilters = useMemo(() => {
    const { filters } = productQuery;
    if (!filters) return false;
    return Object.values(filters).some((v) =>
      Array.isArray(v) ? v.length > 0 : Boolean(v),
    );
  }, [productQuery.filters]);

  const flattenedFilters = useMemo(() => {
    return Object.entries(productQuery.filters || {}).reduce<
      { key: string; val: string }[]
    >(
      (acc, [key, value]) =>
        acc.concat(
          Array.isArray(value)
            ? value.map((v) => ({ key, val: v }))
            : value
              ? [{ key, val: String(value) }]
              : [],
        ),
      [],
    );
  }, [productQuery]);

  if (!hasFilters) return null;

  const handleRemoveFilter = (
    filterKey: keyof ProductFiltersUI,
    value: string,
  ) => {
    setProductQuery((prev) => {
      const curr = prev.filters?.[filterKey];
      const updated = Array.isArray(curr)
        ? toggleArrItem(curr, value)
        : curr === value
          ? undefined
          : value;

      return {
        ...prev,
        filters: {
          ...(prev.filters || {}),
          [filterKey]: updated,
        },
      };
    });
  };

  const handleClearAll = () => {
    setProductQuery({
      filters: undefined,
      sort: "Popularity",
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        {flattenedFilters.map(({ key, val }) => (
          <Button
            key={`${key}-${val}`}
            variant="outline"
            size="sm"
            className="gap-1 capitalize"
            onClick={() =>
              handleRemoveFilter(key as keyof ProductFiltersUI, val)
            }
          >
            {key === "priceRange"
              ? formatPriceRange(val as ProductPriceRangeOptionsUI)
              : val}
            <X className="size-3" />
          </Button>
        ))}

        {flattenedFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={handleClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminFilterTags;
