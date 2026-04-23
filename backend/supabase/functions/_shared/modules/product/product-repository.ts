import type {
  ProductWithRelations,
  ProductVariant,
} from "@shared/package-types/index.ts";
import {
  products,
  productCategories,
  productCollections,
  productVariants,
} from "../../db/schema/products.ts";
import { eq, inArray } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import {
  InsertProductWithRelations,
  UpdateProductWithRelations,
} from "../../db/types/products.ts";

export const ProductRepository = {
  insertProductWithRelations: async (
    db: DrizzleClient,
    payload: InsertProductWithRelations,
  ): Promise<ProductWithRelations> => {
    const { categoryName, collectionName, ...product } = payload;

    return await db.admin.transaction(async (tx) => {
      // Insert or get collection
      let productCollectionId: string | null = null;
      if (payload.collectionName) {
        const [collection] = await tx
          .insert(productCollections)
          .values({ name: payload.collectionName })
          .onConflictDoUpdate({
            target: productCollections.name,
            set: { name: productCollections.name },
          })
          .returning();

        productCollectionId = collection.id;
      }

      // Insert or get category
      let productCategoryId: string | null = null;
      if (payload.categoryName) {
        const [category] = await tx
          .insert(productCategories)
          .values({ name: payload.categoryName })
          .onConflictDoUpdate({
            target: productCategories.name,
            set: { name: productCategories.name },
          })
          .returning();
        productCategoryId = category?.id ?? null;
      }

      // Insert product
      const [insertedProduct] = await tx
        .insert(products)
        .values({
          ...product,
          productCategoryId,
          productCollectionId,
        })
        .returning({
          id: products.id,
          name: products.name,
          description: products.description,
          imageUrls: products.imageUrls,
          primaryImageUrl: products.primaryImageUrl,
          options: products.options,
          minPriceCents: products.minPriceCents,
          maxPriceCents: products.maxPriceCents,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        });

      const variantRows = product.variants.map((v) => ({
        productId: insertedProduct.id,
        priceCents: v.priceCents,
        attributes: v.attributes,
      }));

      // Insert product variant
      const variants = await tx
        .insert(productVariants)
        .values(variantRows)
        .returning({
          id: productVariants.id,
          priceCents: productVariants.priceCents,
          attributes: productVariants.attributes,
        });

      const productWithRelations = {
        ...insertedProduct,
        options: payload.options,
        variants: variants as unknown as ProductVariant[],
        categoryName: categoryName ?? null,
        collectionName: collectionName ?? null,
      };

      return productWithRelations;
    });
  },

  updateProductWithRelations: async (
    db: DrizzleClient,
    productId: string,
    payload: UpdateProductWithRelations,
  ): Promise<ProductWithRelations> => {
    const {
      categoryName,
      collectionName,
      variants: payloadVariants,
      ...product
    } = payload;

    return await db.admin.transaction(async (tx) => {
      // Upsert collection
      let productCollectionId: string | null = null;
      if (collectionName) {
        const [collection] = await tx
          .insert(productCollections)
          .values({ name: collectionName })
          .onConflictDoUpdate({
            target: productCollections.name,
            set: { name: productCollections.name },
          })
          .returning();
        productCollectionId = collection.id;
      }

      // Upsert category
      let productCategoryId: string | null = null;
      if (categoryName) {
        const [category] = await tx
          .insert(productCategories)
          .values({ name: categoryName })
          .onConflictDoUpdate({
            target: productCategories.name,
            set: { name: productCategories.name },
          })
          .returning();
        productCategoryId = category?.id ?? null;
      }

      // Update product
      const [updatedProduct] = await tx
        .update(products)
        .set({ ...product, productCategoryId, productCollectionId })
        .where(eq(products.id, productId))
        .returning();

      // Handle variants
      const existingVariants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

      const existingMap = new Map(
        existingVariants.map((v) => [JSON.stringify(v.attributes), v]),
      );

      const seenKeys = new Set<string>();
      const variantsToInsert: {
        priceCents: number;
        attributes: Record<string, string>;
        productId: string;
        id?: string;
      }[] = [];
      const variantsToUpdate: { id: string; priceCents: number }[] = [];
      const variantsToKeep: ProductVariant[] = [];

      for (const v of payloadVariants ?? []) {
        // Ensure priceCents is defined (should be validated before this)
        if (v.priceCents === undefined) {
          throw new Error("priceCents is required for variants");
        }

        const key = JSON.stringify(v.attributes);
        seenKeys.add(key);

        if (existingMap.has(key)) {
          const existing = existingMap.get(key)!;

          if (existing.priceCents !== v.priceCents) {
            variantsToUpdate.push({
              id: existing.id,
              priceCents: v.priceCents,
            });
          }

          variantsToKeep.push({
            ...existing,
            priceCents: v.priceCents,
          });
        } else {
          // New variant: insert
          variantsToInsert.push({
            priceCents: v.priceCents,
            attributes: v.attributes,
            productId,
          });
        }
      }

      // Delete removed variants
      const variantsToDelete = existingVariants.filter(
        (v) => !seenKeys.has(JSON.stringify(v.attributes)),
      );

      if (variantsToDelete.length) {
        await tx.delete(productVariants).where(
          inArray(
            productVariants.id,
            variantsToDelete.map((v) => v.id),
          ),
        );
      }

      // Update existing variants with new prices
      for (const v of variantsToUpdate) {
        await tx
          .update(productVariants)
          .set({ priceCents: v.priceCents })
          .where(eq(productVariants.id, v.id));
      }

      // Insert new variants
      let insertedVariants: ProductVariant[] = [];

      if (variantsToInsert.length) {
        insertedVariants = (await tx
          .insert(productVariants)
          .values(variantsToInsert) // Now this satisfies the type
          .returning({
            id: productVariants.id,
            priceCents: productVariants.priceCents,
            attributes: productVariants.attributes,
          })) as ProductVariant[];
      }

      const updatedVariants: ProductVariant[] = [
        ...variantsToKeep,
        ...insertedVariants,
      ];

      return {
        ...updatedProduct,
        options: payload.options ?? [],
        variants: updatedVariants,
        categoryName: categoryName ?? null,
        collectionName: collectionName ?? null,
      } satisfies ProductWithRelations;
    });
  },

  deleteProductsByIds: (db: DrizzleClient, productIds: string[]) => {
    return db.admin.transaction(async (tx) => {
      if (productIds.length === 0) return [];

      return await tx
        .delete(products)
        .where(inArray(products.id, productIds))
        .returning({ id: products.id });
    });
  },

  getProductById: (db: DrizzleClient, productId: string) => {
    return db.rls((tx) =>
      tx.query.products.findFirst({
        where: eq(products.id, productId),
      }),
    );
  },

  getProductsByIds: (db: DrizzleClient, productIds: string[]) => {
    return db.rls((tx) => {
      if (productIds.length === 0) return Promise.resolve([]);

      return tx.query.products.findMany({
        where: inArray(products.id, productIds),
        columns: {
          id: true,
          imageUrls: true,
        },
      });
    });
  },

  upsertCategory: (db: DrizzleClient, name: string) => {
    return db.rls(async (tx) => {
      const [category] = await tx
        .insert(productCategories)
        .values({ name })
        .onConflictDoUpdate({
          target: productCategories.name,
          set: { name },
        })
        .returning({
          id: productCategories.id,
          name: productCategories.name,
        });

      return category ?? null;
    });
  },

  upsertCollection: (db: DrizzleClient, name: string) => {
    return db.rls(async (tx) => {
      const [collection] = await tx
        .insert(productCollections)
        .values({ name })
        .onConflictDoUpdate({
          target: productCollections.name,
          set: { name },
        })
        .returning({
          id: productCollections.id,
          name: productCollections.name,
        });

      return collection ?? null;
    });
  },
};
