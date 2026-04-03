import { SupabaseType } from "@shared/types.d.ts";
import { DrizzleClient } from "../../db/client.ts";
import {
  productCategories,
  productCollections,
  products,
  productVariants,
} from "../../db/schema/products.ts";
import { eq, inArray } from "drizzle-orm";

export const OrderRepository = {
  updateStatus: async (s: SupabaseType, orderId: string, status: string) => {
    const { data, error } = await s
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId)
      .eq("status", status)
      .select()
      .single();

    return { data, error };
  },

  getDetailsByVariantIds: (db: DrizzleClient, variantIds: string[]) => {
    return db.rls(async (tx) => {
      return await tx
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          priceCents: productVariants.priceCents,
          variantAttributes: productVariants.attributes,

          name: products.name,
          primaryImageUrl: products.primaryImageUrl,

          collection: productCollections.name,
          category: productCategories.name,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .leftJoin(
          productCollections,
          eq(productCollections.id, products.productCollectionId),
        )
        .innerJoin(
          productCategories,
          eq(productCategories.id, products.productCategoryId),
        )
        .where(inArray(productVariants.id, variantIds));
    });
  },
};
