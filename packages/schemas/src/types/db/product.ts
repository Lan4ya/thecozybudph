import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  productCategories,
  productCollections,
  products,
  productVariants,
} from "../../drizzle/index.ts";

export type SelectProduct = InferSelectModel<typeof products>;
export type SelectProductVariant = InferSelectModel<typeof productVariants>;
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
