export interface ProductQueryAPI {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  page?: number;
  perPage?: number;
}

export interface ProductFilters {
  search?: string;
  categoryIds?: string[];
  collectionIds?: string[];
  priceRange?: { min: number; max?: number };
}

export interface ProductQueryDomain {
  filters?: ProductFiltersDomain;
  sort?: ProductSortOption;
  page?: number;
  perPage?: number;
}

export interface ProductFiltersDomain {
  search?: string;
  categories?: string[];
  collectionNames?: string[];
  priceRange?: ProductPriceRangeOption;
}

export type ProductPriceRangeOption =
  | "0-2000"
  | "2000-4000"
  | "4000-6000"
  | "6000-8000"
  | "8000-10000"
  | "10000+";

export type ProductSortOption =
  | "Popularity"
  | "Most Recent"
  | "Highest Price"
  | "Lowest Price";

export type ObjectFilterKeys = keyof {
  [K in keyof ProductFiltersDomain as Exclude<
    ProductFiltersDomain[K],
    undefined
  > extends object
    ? Exclude<ProductFiltersDomain[K], undefined> extends any[]
      ? never
      : K
    : never]: ProductFiltersDomain[K];
};

export type ArrayFilterKeys = keyof {
  [K in keyof ProductFiltersDomain as Exclude<
    ProductFiltersDomain[K],
    undefined
  > extends unknown[]
    ? K
    : never]: ProductFiltersDomain[K];
};

export const arrayFiltersKeys: ArrayFilterKeys[] = [
  "collectionNames",
  "categories",
] as const;

export type NonArrayFilterKeys = Exclude<
  keyof ProductFiltersDomain,
  ArrayFilterKeys
>;

// --------------------------------------------------
