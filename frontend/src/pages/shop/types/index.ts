export const CATEGORIES = ["bouquet", "vases", "mugs"] as const;
export type Category = (typeof CATEGORIES)[number];

export type SortOption =
  | "mostPopular"
  | "mostRecent"
  | "lowestToHighestPrice"
  | "highestToLowestPrice";

export type PriceRangeOption =
  | "0-2000"
  | "2000-4000"
  | "4000-6000"
  | "6000-8000"
  | "8000-10000"
  | "10000+";

export interface Filters {
  search?: string;
  categories?: Category[];
  collectionName?: string[];
  priceRange?: PriceRangeOption;
  sort?: SortOption;
}

export type ObjectFilterKeys = keyof {
  [K in keyof Filters as Exclude<Filters[K], undefined> extends object
    ? Exclude<Filters[K], undefined> extends any[]
      ? never
      : K
    : never]: Filters[K];
};

export type ArrayFilterKeys = keyof {
  [K in keyof Filters as Exclude<Filters[K], undefined> extends unknown[]
    ? K
    : never]: Filters[K];
};

export const arrayFilters: ArrayFilterKeys[] = [
  "collectionName",
  "categories",
] as const;

export type NonArrayFilterKeys = Exclude<keyof Filters, ArrayFilterKeys>;
