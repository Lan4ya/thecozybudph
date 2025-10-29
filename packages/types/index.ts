// @Product Types

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

// use when fetching from DB
export type Product = ProductBase & {
  id: string; // generated UUID from db
  created_at: string; // timestamp from db
  image_urls: string[];
  primary_image_url: string;
};

// use when creating a new product
export type NewProduct = ProductBase;

// use when updating a product
export type UpdateProduct = Partial<ProductBase>;

// ---------------------------------------------------

// @Order Types

export interface Order {
  // some types
}
