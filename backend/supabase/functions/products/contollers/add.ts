import { CustomError, transformZodError } from "@shared/errors/mod.ts";
import {
  handleSuccess,
  supabaseUploadImages,
  parseAndValidateFormData,
} from "@shared/utils/mod.ts";
import {
  createProductSchema,
  ProductsMetadataRow,
  CreateProductRequest,
  CreateProductData,
  ProductCollectionsRow,
} from "@shared/schema/index.ts";
import { Context } from "hono";
import { SupabaseClient } from "supabase";

export const addProduct = async (supabase: SupabaseClient, c: Context) => {
  // Zod validation
  const result = await parseAndValidateFormData<CreateProductRequest>(
    c,
    createProductSchema,
    (fd: FormData) => {
      const payload: CreateProductRequest = {
        name: fd.get("name") as string,
        price: fd.get("price") ? Number(fd.get("price")) : 0,
        collectionName: fd.get("collectionName") as string,
        category: fd.get("category") as string,
        colorVariants: fd.getAll("colorVariants") as string[],
        description: fd.get("description") as string,
        productImages: fd.getAll("productImages") as File[],
        primaryImageIndex: (() => {
          const pii = fd.get("primaryImageIndex");
          return pii ? Number(pii) : 0;
        })(),
      };

      return payload;
    },
    { async: true },
  );

  if (!result.success) {
    throw CustomError.validation(transformZodError(result.error));
  }

  const data: CreateProductRequest = result.data;

  // Handle product_categories
  const { data: productCategory, error: upsertCategoryError } = await supabase
    .from("product_categories")
    .upsert({ name: data.category }, { onConflict: "name" })
    .select("id, name")
    .single();

  if (upsertCategoryError)
    throw CustomError.internal(upsertCategoryError.message);

  // Handle 'optional' product_collections
  let productCollection: ProductCollectionsRow | null = null;
  if (data.collectionName) {
    const { data: upsertProductCollection, error: upsertCollectionError } =
      await supabase
        .from("product_collections")
        .upsert({ name: data.collectionName }, { onConflict: "name" })
        .select("id, name")
        .single();

    if (upsertCollectionError)
      throw CustomError.internal(upsertCollectionError.message);

    productCollection = upsertProductCollection;
  }

  const imageUrls = await supabaseUploadImages(
    supabase,
    "products", // bucket name
    data.productImages,
  );

  const { name, price, colorVariants, description } = data;

  const dbInserts: Omit<
    ProductsMetadataRow,
    "created_at" | "updated_at" | "id"
  > = {
    name,
    price,
    color_variants: colorVariants ?? [],
    description: description ?? null,
    image_urls: imageUrls,
    primary_image_url: imageUrls[data.primaryImageIndex ?? 0],
    product_collection_id: productCollection?.id ?? null,
    product_category_id: productCategory.id,
  };

  const { data: createdProduct, error: insertError } = await supabase
    .from("products")
    .insert(dbInserts)
    .select("*")
    .single();

  if (insertError) {
    throw CustomError.internal(insertError.message);
  }

  const res: CreateProductData = {
    ...createdProduct,
    productsCollection: productCollection
      ? { name: productCollection.name }
      : null,
    productsCategory: productCategory ? { name: productCategory.name } : null,
  };

  return handleSuccess(res);
};
