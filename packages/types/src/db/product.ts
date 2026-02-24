import { ProductOption, ProductVariant } from "../domain/product.ts";
import type { Tables } from "./supabase.types.ts";

export type ProductRow = Tables<"products">;
export type ProductCollectionRow = Tables<"product_collections">;
export type ProductCategoyRow = Tables<"product_categories">;

export type CreateProductDBInput = {
  name: string;
  description: string | null;
  imageUrls: string[];
  primaryImageUrl: string;
  collectionName: string | null;
  categoryName: string | null;
  minPriceCents: number;
  maxPriceCents: number;
  options: ProductOption[];
  variants: ProductVariant[];
};

export type UpdateProductDBInput = Partial<CreateProductDBInput>;
