export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  primaryImageUrl: string;
  options: {
    name: string;
    values: string[];
  }[];
  variants: ProductVariant[];
  minPriceCents: number;
  maxPriceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  sku: string;
  priceCents: number;
  options: Record<string, string>;
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
}

export type DeleteProducts = { deletedProductIds: string[] };

export type ProductCategory = {
  id: string;
  name: string;
};

export type ProductCollection = {
  id: string;
  name: string;
};
