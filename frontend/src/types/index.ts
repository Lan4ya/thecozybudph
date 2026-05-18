import type { CartItem, Expand } from "@cozybud/schemas";

// Product API

export type ProductSortOption =
  | "Popularity"
  | "Most Recent"
  | "Highest Price"
  | "Lowest Price";

export interface ProductFilters {
  search?: string;
  categoryIds?: string[];
  collectionIds?: string[];
  priceRange?: { min: number; max?: number };
}

export interface ProductQueryListItemsAPI {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  page?: number;
  perPage?: number;
}

// Product UI

export type ProductPriceRangeOptionsUI =
  | "0-2000"
  | "2000-4000"
  | "4000-6000"
  | "6000-8000"
  | "8000-10000"
  | "10000+";

export interface ProductQueryUI {
  filters?: ProductFiltersUI;
  sort?: ProductSortOption;
  page?: number;
  perPage?: number;
}

export interface ProductFiltersUI {
  search?: string;
  categories?: string[];
  collectionNames?: string[];
  priceRange?: ProductPriceRangeOptionsUI;
}

export type ObjectFilterKeys = keyof {
  [K in keyof ProductFiltersUI as Exclude<
    ProductFiltersUI[K],
    undefined
  > extends object
    ? Exclude<ProductFiltersUI[K], undefined> extends any[]
      ? never
      : K
    : never]: ProductFiltersUI[K];
};

export type ArrayFilterKeys = keyof {
  [K in keyof ProductFiltersUI as Exclude<
    ProductFiltersUI[K],
    undefined
  > extends unknown[]
    ? K
    : never]: ProductFiltersUI[K];
};

export const arrayFiltersKeys: ArrayFilterKeys[] = [
  "collectionNames",
  "categories",
] as const;

export type NonArrayFilterKeys = Exclude<
  keyof ProductFiltersUI,
  ArrayFilterKeys
>;

// UI Types

export type CartItemUI = Expand<
  CartItem & {
    selected: boolean;
  }
>;

export type CheckoutOrderSummaryUI = {
  quantity: number;
  cardMessages: string[];
  // productId: string;
  // variantId: string;
  attributes: Record<string, string>;
  name: string;
  priceCents: number;
  imageUrl: string;
};

export type CheckoutUI = {};
