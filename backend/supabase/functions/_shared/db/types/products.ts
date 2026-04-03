import { InferInsertModel } from "drizzle-orm";
import {
  productCategories,
  productCollections,
  products,
  productVariants,
} from "../schema/products.ts";

export type InsertProduct = InferInsertModel<typeof products>;
export type InsertProductVariant = InferInsertModel<typeof productVariants>;
export type UpdateProduct = Partial<InsertProduct>;
export type InsertProductCollection = InferInsertModel<
  typeof productCollections
>;
export type InsertProductCategory = InferInsertModel<typeof productCategories>;

export type InsertProductWithRelations = InsertProduct & {
  variants: Omit<InsertProductVariant, "productId">[];
  collectionName?: InsertProductCategory["name"] | null;
  categoryName: InsertProductCategory["name"];
};

export type UpdateProductWithRelations = Partial<InsertProductWithRelations>;
