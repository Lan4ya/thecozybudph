import {
  updateProductSchema,
  ProductsMetadataRow,
  UpdateProductRequest,
  UpdateProductData,
} from "@shared/schema/index.ts";
import { SupabaseClient } from "supabase";
import { Context } from "hono";
import { CustomError } from "@shared/errors/CustomError.ts";
import {
  parseAndValidateFormData,
  handleSuccess,
  supabaseUploadImages,
} from "@shared/utils/mod.ts";
import { transformZodError } from "@shared/errors/transformZodErrors.ts";

export const patchProduct = async (
  supabase: SupabaseClient,
  c: Context,
): Promise<Response> => {
  // Zod validation
  const result = await parseAndValidateFormData<UpdateProductRequest>(
    c,
    updateProductSchema,
    (fd: FormData) => {
      const payload: UpdateProductRequest = {
        productId: fd.get("productId") as string,
        name: (fd.get("name") as string) || undefined,
        price: fd.get("price") ? Number(fd.get("price")) : 0,
        collectionName: fd.get("collectionName") as string,
        colorVariants: fd.getAll("colorVariants") as string[],
        category: (fd.get("category") as string) || undefined,
        description: fd.get("description") as string,
        newProductImages: fd.getAll("newProductImages") as File[],
        imageUrlsToDelete: fd.getAll("imageUrlsToDelete") as string[],
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
  const data = result.data;

  // Check product existence
  const { data: existingProduct, error: fetchError } = await supabase
    .from("products")
    .select("id, image_urls, name")
    .eq("id", data.productId)
    .single();

  if (fetchError)
    throw CustomError.internal(`Failed to fetch product: ${fetchError}`);
  if (!existingProduct) throw CustomError.notFound("Product not found");

  // Handle category updates
  let productCategory: { id: string; name: string } | null = null;
  if (data.category) {
    const { data: upsertProductCategory, error } = await supabase
      .from("product_categories")
      .upsert({ name: data.category }, { onConflict: "name" })
      .select("id, name")
      .single();

    if (error) throw CustomError.internal(error.message);
    productCategory = upsertProductCategory;
  }

  // Handle collection updates
  let productCollection: { id: string; name: string } | null = null;
  if (!data.collectionName) {
    productCollection = null;
  } else {
    const { data: upsertProductCollection, error } = await supabase
      .from("product_collections")
      .upsert({ name: data.collectionName }, { onConflict: "name" })
      .select("id, name")
      .single();

    if (error) throw CustomError.internal(error.message);

    productCollection = upsertProductCollection;
  }

  // Handle image uploads
  let updatedImageUrls = existingProduct.image_urls ?? [];

  const finalImageCount =
    updatedImageUrls.length -
    (data.imageUrlsToDelete?.length ?? 0) +
    (data.newProductImages?.length ?? 0);

  if (finalImageCount < 1)
    throw CustomError.badRequest("Product must have at least one image");
  else if (finalImageCount > 3)
    throw CustomError.badRequest("You can upload up to 3 images only");

  if (data.newProductImages?.length) {
    const newImageUrls = await supabaseUploadImages(
      supabase,
      "products",
      data.newProductImages,
    );
    updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
  }

  // Handle image deletions
  if (data.imageUrlsToDelete?.length) {
    updatedImageUrls = updatedImageUrls.filter(
      (url: string) => !data.imageUrlsToDelete!.includes(url),
    );

    const filePaths = data.imageUrlsToDelete
      .map((url: string) => url.match(/\/products\/([^?]+)/)?.[1])
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("products")
        .remove(filePaths);
      if (deleteError)
        console.error("Failed to delete some images:", deleteError);
    }
  }

  const dbUpdates: Partial<
    Omit<ProductsMetadataRow, "created_at" | "updated_at" | "id">
  > = {
    name: data.name ?? existingProduct.name,
    price: data.price ?? 0,
    color_variants: data.colorVariants ?? [],
    description: data.description ?? null,
    product_collection_id: productCollection?.id ?? null,
    product_category_id: productCategory?.id ?? null,
    image_urls: updatedImageUrls,
    primary_image_url: updatedImageUrls[data.primaryImageIndex ?? 0],
  };

  const { data: updatedProduct, error: updateError } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", data.productId)
    .select("*")
    .single();

  if (updateError)
    throw CustomError.internal(
      `Failed to update product: ${updateError.message}`,
    );

  const res: UpdateProductData = {
    ...updatedProduct,
    productsCollection: productCollection
      ? { name: productCollection.name }
      : null,
    productsCategory: productCategory ? { name: productCategory.name } : null,
  };

  return handleSuccess(res);
};
