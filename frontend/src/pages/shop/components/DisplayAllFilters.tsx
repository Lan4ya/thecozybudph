import { X, Tags } from "lucide-react";
import type { Filters, PriceRangeOption } from "../types";
import { useFilters } from "../hooks/useFilters";
import { useIsExtraLargeScreen } from "@/hooks/useMediaQuery";
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

const DisplayAllFilters = () => {
  const [isClearFilterItemsBtnShown, showClearFilterItemsBtn] = useState(false);
  const { filters, hasFilters } = useFilters();
  const isXlScreen = useIsExtraLargeScreen();

  const filterCount = useMemo(
    () =>
      Object.values(filters).reduce((n, v) => {
        if (Array.isArray(v)) return n + v.filter(Boolean).length;
        if (v != null && v !== "") return n + 1;
        return n;
      }, 0),
    [filters],
  );

  const flattenedFilters = useMemo(() => {
    return Object.entries(filters).reduce<{ key: string; val: unknown }[]>(
      (acc, [key, value]) =>
        acc.concat(
          Array.isArray(value)
            ? value.map((v) => ({ key, val: v }))
            : [{ key, val: value }],
        ),
      [],
    );
  }, [filters]);

  return (
    <div className="text-muted-foreground flex gap-5 text-sm items-center flex-1">
      {!isXlScreen ? (
        <Popover>
          {/* @ts-ignore */}
          <PopoverTrigger asChild>
            <Button variant="minimal" size="auto" className="p-0">
              <div className="relative ">
                <Tags className="text-muted-foreground" />

                {hasFilters && (
                  <>
                    {/* notification bubble */}
                    {/*               <span */}
                    {/*                 className=" */}
                    {/*   absolute -top-1 -right-1 */}
                    {/*   h-2.5 w-2.5 rounded-full bg-red-500 */}
                    {/*   animate-ping */}
                    {/*   opacity-75 */}
                    {/* " */}
                    {/*               /> */}
                    {/* stable dot so ping pulse has a core */}
                    <span
                      className="
        absolute -top-1 -right-1
        h-2.5 w-2.5 rounded-full bg-red-500
      "
                    />
                  </>
                )}
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            sideOffset={10}
            side="top"
            align="start"
            className={cn(
              "flex flex-wrap gap-3 w-full",
              hasFilters ? "max-w-95 md:max-w-120" : "justify-center p-2 w-30",
            )}
          >
            <PopoverArrow />
            {hasFilters ? (
              <>
                {flattenedFilters.map(({ key, val }) => (
                  <FilterItem
                    key={`${key}-${String(val)}`}
                    label={String(val)}
                    filterKey={key as keyof Filters}
                    isXlScreen={isXlScreen}
                  />
                ))}

                {filterCount >= 2 && (
                  <FilterItem label="Clear" isXlScreen={isXlScreen} />
                )}
              </>
            ) : (
              <div>No filters</div>
            )}
          </PopoverContent>
        </Popover>
      ) : (
        <>
          <Tags className="text-muted-foreground" />
          <div
            onMouseEnter={() => showClearFilterItemsBtn(true)}
            onMouseLeave={() => showClearFilterItemsBtn(false)}
            className="flex gap-3 w-full"
          >
            {flattenedFilters.map(({ key, val }) => (
              <FilterItem
                key={`${key}-${String(val)}`}
                label={String(val)}
                filterKey={key as keyof Filters}
                isXlScreen={isXlScreen}
              />
            ))}

            {/* TODO add && (if filters has atleast 2 keys) */}
            {/* add anim fade */}
            {filterCount >= 2 && isClearFilterItemsBtnShown && (
              <FilterItem label="Clear" isXlScreen={isXlScreen} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

type FilterItemProps = {
  label: string;
  filterKey?: keyof Filters;
  isXlScreen: boolean;
};

const FilterItem = ({ label, filterKey, isXlScreen }: FilterItemProps) => {
  const { setFilters, clearFilters } = useFilters();

  return (
    <Button
      variant="outline"
      size="sm"
      key={label}
      className={cn("group flex items-center gap-1")}
      onClick={() => {
        if (label === "Clear") {
          clearFilters();
          return;
        }

        if (!filterKey) return;

        setFilters((prev) => {
          const next = { ...prev };
          const curr = next[filterKey];

          if (Array.isArray(curr)) {
            const updated = toggleArrItem(curr, label);
            (next[filterKey] as string[]) = updated;
          } else if (curr === label) {
            next[filterKey] = undefined;
          }

          return next;
        });
      }}
    >
      {filterKey === "priceRange"
        ? formatPriceRange(label as PriceRangeOption)
        : label}
      {isXlScreen ? (
        <span className="hidden group-hover:inline-block">{xIcon}</span>
      ) : (
        xIcon
      )}
    </Button>
  );
};

export default DisplayAllFilters;
