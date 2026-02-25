import type { SupabaseType } from "@shared/types.d.ts";
import type {
  CreateProductDBInput,
  UpdateProductDBInput,
  ProductWithRelations,
} from "@shared/types/index.ts";
import {
  products,
  productCategories,
  productCollections,
} from "../../db/schema/products.ts";
import { db } from "../../db/client.ts";
import { eq } from "drizzle-orm";

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

      const [updatedProduct] = await tx
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
          variants: products.variants,
          minPriceCents: products.minPriceCents,
          maxPriceCents: products.maxPriceCents,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        });

      const productWithRelations = {
        ...updatedProduct,
        options: payload.options,
        variants: payload.variants,
        categoryName: categoryName ?? null,
        collectionName: collectionName ?? null,
      };

      return productWithRelations;
    });
  },

  updateProduct: async (
    productId: string,
    payload: UpdateProductDBInput,
  ): Promise<ProductWithRelations> => {
    const { categoryName, collectionName, ...product } = payload;
    return await db.transaction(async (tx) => {
      // upsert collection
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

      // upsert category
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

      const productUpdates = {
        ...product,
        productCategoryId,
        productCollectionId,
      };

      const [updatedProduct] = await tx
        .update(products)
        .set(productUpdates)
        .where(eq(products.id, productId))
        .returning({
          id: products.id,
          name: products.name,
          description: products.description,
          imageUrls: products.imageUrls,
          primaryImageUrl: products.primaryImageUrl,
          options: products.options,
          variants: products.variants,
          minPriceCents: products.minPriceCents,
          maxPriceCents: products.maxPriceCents,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        });

      const productWithRelations = {
        ...updatedProduct,
        options: payload.options ?? [],
        variants: payload.variants ?? [],
        categoryName: categoryName ?? null,
        collectionName: collectionName ?? null,
      };

      return productWithRelations;
    });
  },

  // updateProduct: async (
  //   s: SupabaseType,
  //   productId: string,
  //   updates: Partial<
  //     Omit<ProductsMetadataRow, "id" | "created_at" | "updated_at">
  //   >,
  // ) => {
  //   const { data, error } = await s
  //     .from("products")
  //     .update(updates)
  //     .eq("id", productId)
  //     .select("*")
  //     .single();
  //   return { data, error };
  // },

  // insertProduct: async (
  //   s: SupabaseType,
  //   product: Omit<ProductsMetadataRow, "id" | "created_at" | "updated_at">,
  // ) => {
  //   const { data, error } = await s
  //     .from("products")
  //     .insert(product)
  //     .select("*")
  //     .single();
  //   return { data, error };
  // },

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
