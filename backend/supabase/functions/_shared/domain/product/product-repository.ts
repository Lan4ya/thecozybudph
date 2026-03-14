import type { SupabaseType } from "@shared/types.d.ts";
import type {
  CreateProductDBInput,
  UpdateProductDBInput,
  ProductWithRelations,
  ProductVariant,
} from "@shared/types/index.ts";
import {
  products,
  productCategories,
  productCollections,
  productVariants,
} from "../../db/schema/products.ts";
import { db } from "../../db/client.ts";
import { eq, inArray } from "drizzle-orm";

export const ProductRepository = {
  createProduct: async (
    payload: CreateProductDBInput,
  ): Promise<ProductWithRelations> => {
    const { categoryName, collectionName, ...product } = payload;

    return await db.transaction(async (tx) => {
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

      const [createdProduct] = await tx
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
        productId: createdProduct.id,
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
        ...createdProduct,
        options: payload.options,
        variants: variants as unknown as ProductVariant[],
        categoryName: categoryName ?? null,
        collectionName: collectionName ?? null,
      };

      return productWithRelations;
    });
  },

  // updateProduct: async (
  //   productId: string,
  //   payload: UpdateProductDBInput,
  // ): Promise<ProductWithRelations> => {
  //   const { categoryName, collectionName, ...product } = payload;
  //   return await db.transaction(async (tx) => {
  //     // Upsert collection
  //     let productCollectionId: string | null = null;
  //     if (payload.collectionName) {
  //       const [collection] = await tx
  //         .insert(productCollections)
  //         .values({ name: payload.collectionName })
  //         .onConflictDoUpdate({
  //           target: productCollections.name,
  //           set: { name: productCollections.name },
  //         })
  //         .returning();
  //       productCollectionId = collection.id;
  //     }
  //
  //     // Upsert category
  //     let productCategoryId: string | null = null;
  //     if (payload.categoryName) {
  //       const [category] = await tx
  //         .insert(productCategories)
  //         .values({ name: payload.categoryName })
  //         .onConflictDoUpdate({
  //           target: productCategories.name,
  //           set: { name: productCategories.name },
  //         })
  //         .returning();
  //       productCategoryId = category?.id ?? null;
  //     }
  //
  //     // Update products
  //     const [updatedProduct] = await tx
  //       .update(products)
  //       .set({
  //         ...product,
  //         productCategoryId,
  //         productCollectionId,
  //       })
  //       .where(eq(products.id, productId))
  //       .returning({
  //         id: products.id,
  //         name: products.name,
  //         description: products.description,
  //         imageUrls: products.imageUrls,
  //         primaryImageUrl: products.primaryImageUrl,
  //         options: products.options,
  //         minPriceCents: products.minPriceCents,
  //         maxPriceCents: products.maxPriceCents,
  //         createdAt: products.createdAt,
  //         updatedAt: products.updatedAt,
  //       });
  //
  //
  //     // Update product variants
  //     const updatedProductVariants: ProductVariant[] = [];
  //     if (product.variants) {
  //       for (const v of product.variants) {
  //         const [updatedVariant] = await tx
  //           .update(productVariants)
  //           .set({
  //             priceCents: v.priceCents,
  //             attributes: v.attributes,
  //           })
  //           .where(eq(productVariants.id, v.id))
  //           .returning({
  //             id: productVariants.id,
  //             priceCents: productVariants.priceCents,
  //             attributes: productVariants.attributes,
  //           });
  //
  //         updatedProductVariants.push(
  //           updatedVariant as unknown as ProductVariant,
  //         );
  //       }
  //     }
  //
  //     const productWithRelations = {
  //       ...updatedProduct,
  //       options: payload.options ?? [],
  //       variants: updatedProductVariants,
  //       categoryName: categoryName ?? null,
  //       collectionName: collectionName ?? null,
  //     };
  //
  //     return productWithRelations;
  //   });
  // },

  updateProduct: async (
    productId: string,
    payload: UpdateProductDBInput,
  ): Promise<ProductWithRelations> => {
    const {
      categoryName,
      collectionName,
      variants: payloadVariants,
      ...product
    } = payload;

    return await db.transaction(async (tx) => {
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
          } as ProductVariant);
        } else {
          // New variant: insert
          variantsToInsert.push({
            ...v,
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
          .values(variantsToInsert)
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

  deleteProductsByIds: async (s: SupabaseType, productIds: string[]) => {
    const { data, error } = await s
      .from("products")
      .delete()
      .in("id", productIds)
      .select("id");
    return { data, error };
  },

  getProductById: async (s: SupabaseType, productId: string) => {
    const { data, error } = await s
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();
    return { data, error };
  },

  getProductsByIds: async (s: SupabaseType, productIds: string[]) => {
    const { data, error } = await s
      .from("products")
      .select("id, image_urls")
      .in("id", productIds);
    return { data, error };
  },

  upsertCategory: async (s: SupabaseType, name: string) => {
    const { data, error } = await s
      .from("product_categories")
      .upsert({ name }, { onConflict: "name" })
      .select("id, name")
      .single();
    return { data, error };
  },

  upsertCollection: async (s: SupabaseType, name: string) => {
    const { data, error } = await s
      .from("product_collections")
      .upsert({ name }, { onConflict: "name" })
      .select("id, name")
      .single();
    return { data, error };
  },
};

[
  {
    id: "bfd64878-f045-5952-b678-8a845a82b1b1",
    attributes: {
      Color: "Red",
      "Stem Count": "6",
    },
    product_id: "bb5203ae-e8c4-5972-997b-642f711b73e3",
    price_cents: 50000,
  },
  {
    id: "56a2b912-3964-5120-99f6-0e2c114ba3e2",
    attributes: {
      Color: "Red",
      "Stem Count": "12",
    },
    product_id: "bb5203ae-e8c4-5972-997b-642f711b73e3",
    price_cents: 100000,
  },
  {
    id: "613ed00b-ffe5-5f82-9005-632431271f70",
    attributes: {
      Color: "Green",
      "Stem Count": "6",
    },
    product_id: "bb5203ae-e8c4-5972-997b-642f711b73e3",
    price_cents: 50000,
  },
  {
    id: "ad615474-dcd8-5377-affd-0fed6e45fa7b",
    attributes: {
      Color: "Green",
      "Stem Count": "12",
    },
    product_id: "bb5203ae-e8c4-5972-997b-642f711b73e3",
    price_cents: 100000,
  },
];
