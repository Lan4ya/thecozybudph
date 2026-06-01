import { X, Tags as TagIcon } from "lucide-react";
import type {
  ProductFiltersUI,
  ProductPriceRangeOptionsUI,
} from "../../../types";
import { useProductsFilterAndSortState } from "../hooks/useProductsFilterAndSortState";
import { useIsXlScreenMin } from "@/hooks/useMediaQuery";
import { Button } from "@/lib/ui/__shadcn__/button";
import toggleArrItem from "@/lib/utils/toggleArrItem";
import { useMemo } from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/ui/__shadcn__/popover";
import { cn } from "@/lib/utils/cn";
import { formatPriceRange } from "./filters/PriceRange";

const xIcon = <X className="size-4" />;

const FilterTags = () => {
  const { productQuery, hasProductQueryFilters } =
    useProductsFilterAndSortState();
  const isXlScreen = useIsXlScreenMin();

  const queryCount = useMemo(
    () =>
      Object.values(productQuery.filters || {}).reduce((n, v) => {
        if (Array.isArray(v)) return n + v.filter(Boolean).length;
        if (v != null && v !== "") return n + 1;
        return n;
      }, 0),
    [productQuery],
  );

  const flattenedFilters = useMemo(() => {
    return Object.entries(productQuery.filters || {}).reduce<
      { key: string; val: string }[]
    >(
      (acc, [key, value]) =>
        acc.concat(
          Array.isArray(value)
            ? value.map((v) => ({ key, val: v }))
            : [{ key, val: value }],
        ),
      [],
    );
  }, [productQuery]);

  return (
    <div className="group-tags text-muted-foreground flex items-center gap-5 text-sm">
      {!isXlScreen ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="minimal" size="icon" className="relative border">
              <TagIcon className="text-muted-foreground size-5" />
              {hasProductQueryFilters && (
                <span className=" absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            sideOffset={10}
            side="top"
            align="start"
            className={cn(
              "flex flex-wrap gap-3 w-full",
              hasProductQueryFilters
                ? "max-w-95 md:max-w-120"
                : "justify-center p-2 w-30",
            )}
          >
            {hasProductQueryFilters ? (
              <>
                {flattenedFilters.map(({ key, val }) => (
                  <FilterTagItem
                    key={`${key}-${val}`}
                    label={val}
                    filterKey={key as keyof ProductFiltersUI}
                    isXlScreen={isXlScreen}
                  />
                ))}

                {queryCount >= 2 && (
                  <FilterTagItem label="Clear" isXlScreen={isXlScreen} />
                )}
              </>
            ) : (
              <div>No filters</div>
            )}
          </PopoverContent>
        </Popover>
      ) : (
        // Desktop
        <div className="flex h-10 items-center gap-3">
          <TagIcon className="size-5 text-muted-foreground" />
          <div className="flex items-center gap-3">
            {flattenedFilters.map(({ key, val }) => (
              <FilterTagItem
                key={`${key}-${String(val)}`}
                label={String(val)}
                filterKey={key as keyof ProductFiltersUI}
                isXlScreen={isXlScreen}
              />
            ))}

            {queryCount >= 2 && (
              <FilterTagItem label="Clear" isXlScreen={isXlScreen} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type FilterTagItemProps = {
  label: string;
  filterKey?: keyof ProductFiltersUI;
  isXlScreen: boolean;
};

const FilterTagItem = ({
  label,
  filterKey,
  isXlScreen,
}: FilterTagItemProps) => {
  const { setProductQuery, clearProductQueryFilters } =
    useProductsFilterAndSortState();

  return (
    <Button
      variant="outline"
      size="sm"
      key={label}
      className={cn("group flex items-center gap-1 capitalize")}
      onClick={() => {
        if (label === "Clear") {
          clearProductQueryFilters();
          return;
        }

        if (!filterKey) return;

        setProductQuery((prev) => {
          // const next = {
          //   ...prev,
          //   filters: { ...(prev.filters || {}) },
          // };
          const curr = prev.filters?.[filterKey];
          const updated = Array.isArray(curr)
            ? toggleArrItem(curr, label)
            : curr === label
              ? undefined
              : label;

          // if (Array.isArray(curr)) {
          //   (prev.filters[filterKey] as string[]) = toggleArrItem(curr, label);
          // } else if (curr === label) {
          //   prev.filters[filterKey] = undefined;
          // }

          return {
            ...prev,
            filters: {
              ...(prev.filters || {}),
              [filterKey]: updated,
            },
          };
        });
      }}
    >
      {filterKey === "priceRange"
        ? formatPriceRange(label as ProductPriceRangeOptionsUI)
        : label}
      {isXlScreen ? (
        <span className="hidden group-hover:inline-block">{xIcon}</span>
      ) : (
        xIcon
      )}
    </Button>
  );
};

export default FilterTags;
