// @Product Types

// ---------------------------------------------------

// Usage Example:

// import type { Product } from "@TheCozyBud/types";
// let productExample: Product;

// ---------------------------------------------------

type ProductBase = {
  name: string;
  price: number;
  color_variants?: string[];
  stock: number;
  image_url: string;
};

// use when fetching from DB (displaying the product)
export type Product = ProductBase & {
  id: string; // generated UUID from db
  created_at: string; // timestamp from db
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
