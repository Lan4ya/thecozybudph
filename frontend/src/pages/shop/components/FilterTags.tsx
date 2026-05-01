import { X, Tags as TagIcon } from "lucide-react";
import type {
  ProductFiltersDomain,
  ProductPriceRangeOption,
} from "../../../types";
import { useProductsFilterAndSortState } from "../hooks/useProductsFilterAndSortState";
import { useIsXlScreenMin } from "@/hooks/useMediaQuery";
import { Button } from "@/lib/ui/__shadcn__/button";
import toggleArrItem from "@/lib/utils/toggleArrItem";
import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/ui/__shadcn__/popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";
import { formatPriceRange } from "./filters/PriceRange";

const xIcon = <X className="size-4" />;

const Tags = () => {
  const [isClearFilterItemsBtnShown, showClearFilterItemsBtn] = useState(false);
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
    <div className="xl:h-10 -mt-2 text-muted-foreground flex gap-5 text-sm items-center flex-1">
      {!isXlScreen ? (
        <Popover>
          {/* @ts-ignore */}
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
            <PopoverArrow />
            {hasProductQueryFilters ? (
              <>
                {flattenedFilters.map(({ key, val }) => (
                  <TagItem
                    key={`${key}-${val}`}
                    label={val}
                    filterKey={key as keyof ProductFiltersDomain}
                    isXlScreen={isXlScreen}
                  />
                ))}

                {queryCount >= 2 && (
                  <TagItem label="Clear" isXlScreen={isXlScreen} />
                )}
              </>
            ) : (
              <div>No filters</div>
            )}
          </PopoverContent>
        </Popover>
      ) : (
        <>
          <TagIcon className="text-muted-foreground" />
          <div
            onMouseEnter={() => showClearFilterItemsBtn(true)}
            onMouseLeave={() => showClearFilterItemsBtn(false)}
            className="flex gap-3 w-full"
          >
            {flattenedFilters.map(({ key, val }) => (
              <TagItem
                key={`${key}-${String(val)}`}
                label={String(val)}
                filterKey={key as keyof ProductFiltersDomain}
                isXlScreen={isXlScreen}
              />
            ))}

            {queryCount >= 2 && isClearFilterItemsBtnShown && (
              <TagItem label="Clear" isXlScreen={isXlScreen} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

type TagItemProps = {
  label: string;
  filterKey?: keyof ProductFiltersDomain;
  isXlScreen: boolean;
};

const TagItem = ({ label, filterKey, isXlScreen }: TagItemProps) => {
  const { setProductQuery, clearProductQueryFilters } =
    useProductsFilterAndSortState();

  return (
    <Button
      variant="outline"
      size="sm"
      key={label}
      className={cn("group flex items-center gap-1")}
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
        ? formatPriceRange(label as ProductPriceRangeOption)
        : label}
      {isXlScreen ? (
        <span className="hidden group-hover:inline-block">{xIcon}</span>
      ) : (
        xIcon
      )}
    </Button>
  );
};

export default Tags;
