import React, {
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../base-dropdown";
import { Button } from "@/lib/ui/__shadcn__/button";
import { ChevronDown } from "lucide-react";
import PersistSuspense from "@/components/PersistSuspense";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { useProductsFilterAndSortState } from "../../hooks/useProductsFilterAndSortState";
import { useIsSmScreenMax, useMediaQuery } from "@/hooks/useMediaQuery";
import type {
  ProductFiltersDomain,
  ProductPriceRangeOption,
} from "../../../../types";
import isDev from "@/lib/utils/isDev";
import { formatPriceRange } from "./PriceRange";

type DropdownFilterLabels = Exclude<
  keyof ProductFiltersDomain,
  "search" | "sort"
>;

const filterLabels: Record<DropdownFilterLabels, string> = {
  priceRange: "Price range",
  categories: "Categories",
  collectionNames: "Collections",
};

type FilterDropdownMenuProps = {
  children: ReactNode | ((inputValue: string) => ReactNode);
  dropdownType: DropdownFilterLabels;
  inputValue?: string;
  setInputValue?: React.Dispatch<React.SetStateAction<string>>;
};

// INFO: This is used by all the filter components as base except Search

export const FilterDropdown = ({
  children,
  dropdownType,
  inputValue: controlledValue,
  setInputValue: setControlledValue,
}: FilterDropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const { productQuery } = useProductsFilterAndSortState();
  const isMobile = useIsSmScreenMax();

  const [isInputFocused, setInputFocus] = useState(false);

  const isControlled =
    controlledValue !== undefined && setControlledValue !== undefined;

  // Log warning when misusing component is being misused
  if ((controlledValue === undefined) !== (setControlledValue === undefined)) {
    if (isDev) {
      console.warn(
        "FilterDropdownMenu: both inputValue and setInputValue must be provided together for controlled mode.",
      );
    }
  }

  const [uncontrolledValue, setUncontrolledValue] = useState("");
  const inputValue = isControlled ? controlledValue! : uncontrolledValue;
  const setInputValue = isControlled
    ? setControlledValue!
    : setUncontrolledValue;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();

    // watch for element size changes
    const observer = new ResizeObserver(updateWidth);
    if (triggerRef.current) observer.observe(triggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const label = filterLabels[dropdownType];
  const filterVal = productQuery.filters?.[dropdownType];
  const childrenWithValue =
    typeof children === "function" ? children(inputValue) : children;

  return (
    <div className="flex w-full flex-col gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <label className="cursor-text">{label}</label>

        <DropdownMenuTrigger
          ref={triggerRef}
          asChild
          asControlled
          // prevents input blur/losing focus so the "Any"
          // placeholder wont flicker when clicking
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            document.activeElement !== inputRef.current &&
              inputRef.current?.focus();
            // !open && setOpen(true);
            setOpen(!open);
          }}
        >
          <div className="border relative flex h-[45px] w-full items-center rounded-md p-3 outline dark:outline-0 outline-ring focus-within:outline-2">
            {!isInputFocused && hasValue(filterVal) && (
              <DisplaySelectedFilters dropdownType={dropdownType} />
            )}
            {/* NOTE: */}
            {/* input causes dropdown content positioning bugs on mobile that is */}
            {/* not so simple to fix, so I disabled it temporarily on mobiles. */}
            {!isMobile ? (
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onClick={() => !open && setOpen(true)}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                className="h-full w-full placeholder-muted-foreground focus:outline-none"
                placeholder={
                  (hasValue(filterVal) && !isInputFocused) || isInputFocused
                    ? ""
                    : "Any"
                }
                type="text"
              />
            ) : (
              <div className="text-muted-foreground text-xs">
                {hasValue(filterVal) ? null : "Any"}
              </div>
            )}

            <Button
              variant="minimal"
              size="auto"
              // prevents input blur (losing focus) so the "Any" placeholder
              // wont flicker when clicking this btn
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                document.activeElement !== inputRef.current &&
                  inputRef.current?.focus();
                setOpen(!open);
              }}
              className="ml-auto"
            >
              <ChevronDown
                className={`transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          style={{ width: triggerWidth }}
          className={`max-w-[243px] min-h-[25px] max-h-[370px] lg:max-h-[520px] bg-background text-muted-foreground`}
          sideOffset={15}
          align="center"
        >
          <PersistSuspense
            fallback={
              <FilterDropdownContentSkeleton triggerWidth={triggerWidth} />
            }
          >
            {/* Should contain FilterDropdownItem */}
            {childrenWithValue}
          </PersistSuspense>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Tailwind cannot parse template strings at runtime
// This is placed here and not in ui/skeletons dir so triggerWidth can be accessed.
const FilterDropdownContentSkeleton = ({
  triggerWidth,
}: {
  triggerWidth: number;
}) => {
  return (
    <div
      className={`max-h-[520px] overflow-y-hidden py-[9px] px-1 flex flex-col gap-[18px] w-[${triggerWidth}px]`}
    >
      <Skeleton className="h-[17px] w-[70px] rounded mx-1 mb-1" />
      {Array.from({ length: 4 }).map((_, i) => (
        <React.Fragment key={i}>
          <Skeleton className="h-4 w-20 rounded mx-3" />
          <Skeleton className="h-4 w-20 rounded mx-3" />
          <Skeleton className="h-4 w-[90px] rounded mx-3" />
        </React.Fragment>
      ))}
    </div>
  );
};

// Displays selected filter value(s) inside input box.
// Simply for ui/ux. Clicking it removes the filter
const DisplaySelectedFilters = ({
  dropdownType,
}: {
  dropdownType: DropdownFilterLabels;
}) => {
  const { setProductQuery, productQuery } = useProductsFilterAndSortState();
  const filterVal = productQuery.filters?.[dropdownType];

  const smScreen = useMediaQuery("(max-width: 449px)");
  const vals = useMemo(
    () => (Array.isArray(filterVal) ? filterVal : [filterVal]),
    [filterVal],
  );
  const [first, ...rest] = vals;
  const normalizedFirst = useMemo(() => {
    if (dropdownType === "priceRange") {
      return formatPriceRange(first as ProductPriceRangeOption);
    }
    return first;
  }, [first, dropdownType]);

  return (
    <Button
      variant="minimal"
      size="auto"
      className="gap-1! text-sm absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
      onClick={(e) => {
        e.stopPropagation();

        setProductQuery((prev) => {
          const currVal = prev.filters?.[dropdownType];

          const updated =
            Array.isArray(currVal) && currVal.length >= 2
              ? currVal.slice(1)
              : undefined;

          return {
            ...prev,
            filters: {
              ...prev.filters,
              [dropdownType]: updated,
            },
          };
        });
      }}
    >
      {smScreen && vals.length && (
        <span className="bg-background rounded-md px-2 py-1.5">
          +{vals.length}
        </span>
      )}

      {!smScreen && (
        <>
          {normalizedFirst && (
            <span className="bg-background rounded-md px-2 py-1.5">
              {normalizedFirst}
            </span>
          )}
          {rest.length > 0 && (
            <span className="bg-background">+ {rest.length}</span>
          )}
        </>
      )}
    </Button>
  );
};

const hasValue = (v: unknown) => (Array.isArray(v) ? v.length > 0 : v != null);
