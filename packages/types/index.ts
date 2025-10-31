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

// use when getting products from DB
export type Product = ProductBase & {
  id: string; // generated UUID from db
  created_at: string; // timestamp from db
  image_urls: string[];
  product_collection_id?: string | null;
};

// ---------------- ADMIN ONLY ---------------- //

// use when adding a new product
export type NewProduct = ProductBase & {
  product_images: File[];
  primary_image_url?: string; // default image shown for the product images
};

// use when updating a product
export type UpdateProduct = Partial<ProductBase> & {
  product_images?: File[];
  primary_image_url?: string;
  product_collection_id?: number | null;
};

// ---------------- ADMIN ONLY ---------------- //

// ---------------------------------------------------

// @Order-Types

export interface Order {
  // some types
}
