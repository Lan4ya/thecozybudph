export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  primaryImageUrl: string;
  options: ProductOption[];
  variants: ProductVariant[];
  minPriceCents: number;
  maxPriceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductOption = {
  name: string;
  values: string[];
};

export interface ProductVariant {
  id: string;
  priceCents: number;
  attributes: Record<string, string>;
}

export type ProductWithRelations = Product & {
  categoryName: string | null;
  collectionName: string | null;
};

export interface ProductListItem {
  id: string;
  name: string;
  primaryImageUrl: string;
  minPriceCents: number;
  maxPriceCents: number;
  description: string | null;
  collection: string | null;
  category: string | null;
}

export type ProductCategory = {
  id: string;
  name: string;
};

export type ProductCollection = {
  id: string;
  name: string;
};
