export interface ProductQueryAPI {
  filters?: FiltersAPI;
  sort?: SortOption;
  page?: number;
  perPage?: number;
}

export interface FiltersAPI {
  search?: string;
  categoryIds?: string[];
  collectionIds?: string[];
  priceRange?: { min: number; max?: number };
}

export interface ProductQueryDomain {
  filters?: FiltersDomain;
  sort?: SortOption;
  page?: number;
  perPage?: number;
}

export interface FiltersDomain {
  search?: string;
  categories?: string[];
  collectionNames?: string[];
  priceRange?: PriceRangeOption;
}

export type PriceRangeOption =
  | "0-2000"
  | "2000-4000"
  | "4000-6000"
  | "6000-8000"
  | "8000-10000"
  | "10000+";

export type SortOption =
  | "Popularity"
  | "Most Recent"
  | "Highest Price"
  | "Lowest Price";

export type ObjectFilterKeys = keyof {
  [K in keyof FiltersDomain as Exclude<
    FiltersDomain[K],
    undefined
  > extends object
    ? Exclude<FiltersDomain[K], undefined> extends any[]
      ? never
      : K
    : never]: FiltersDomain[K];
};

export type ArrayFilterKeys = keyof {
  [K in keyof FiltersDomain as Exclude<
    FiltersDomain[K],
    undefined
  > extends unknown[]
    ? K
    : never]: FiltersDomain[K];
};

export const arrayFiltersKeys: ArrayFilterKeys[] = [
  "collectionNames",
  "categories",
] as const;

export type NonArrayFilterKeys = Exclude<keyof FiltersDomain, ArrayFilterKeys>;
