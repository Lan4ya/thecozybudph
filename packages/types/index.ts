// @Product-Types

// ---------------------------------------------------

// Usage Example:

// import type { Product } from "@TheCozyBud/types";
// let productExample: Product;

// ---------------------------------------------------

type ProductBase = {
  name: string;
  price: number;
  stock: number;
  color_variants?: string[];
  collection_name?: string;
};

export type Product = Omit<ProductBase, "collection_name"> & {
  id: string;
  created_at: string;
  updated_at: string;
  image_urls: string[];
  primary_image_url: string;
  products_collection?: {
    name: string;
  } | null;
};

// ---------------- ADMIN ONLY ---------------- //

export type NewProduct = ProductBase & {
  product_images: File[];
  primary_image_url?: string;
};

export type UpdateProduct = Partial<ProductBase> & {
  product_id: string;
  primary_image_url?: string | null;
  new_product_images?: File[];
  image_urls_to_delete?: string[];
  product_collection_id?: number | null;
  products_collection?: { name: string } | null;
};

// ---------------- ADMIN ONLY ---------------- //

// ---------------------------------------------------

// @Order-Types

export interface Order {
  // some types
}
