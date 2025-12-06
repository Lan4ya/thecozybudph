/**
 * Update a product in DB
 *
 * @admin
 * @method PATCH
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/patch-product
 *
 */

import { createClient } from "supabase";
import { CustomError, transformZodError } from "@shared/errors/mod.ts";
import { handleError } from "@shared/response/handleError.ts";
import { handleSuccess } from "@shared/response/handleSuccess.ts";
import {
  updateProductSchema,
  parseAndValidateFormData,
  ProductsMetadataRow,
  UpdateProductRequest,
  UpdateProductData,
} from "@shared/schema/index.ts";
// import { validateImageFile } from "@shared/validations/mod.ts";
import { uploadImagesToDB } from "@shared/uploadImagesToDB.ts";
import { authAdmin } from "@shared/authAdmin.ts";
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request): Promise<Response> => {
  const optionsRes = handleCorsOptions(req);
  if (optionsRes) return optionsRes;
  const corsHeaders = getCorsHeaders(req);

  if (req.method !== "PATCH") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    // Admin check
    await authAdmin(supabase, req);

    const result = await parseAndValidateFormData<UpdateProductRequest>(
      req,
      updateProductSchema,
      (fd: FormData) => {
        const payload: UpdateProductRequest = {
          productId: fd.get("productId") as string,
          name: fd.get("name") as string,
          price: fd.get("price") ? Number(fd.get("price")) : undefined,
          collectionName: fd.get("collectionName") as string,
          colorVariants: (() => {
            const values = fd.getAll("colorVariants") as string[];
            if (!values.length) return [];
            const fv = values.filter(Boolean);
            return fv.length > 0 ? fv : [];
          })(),
          category: fd.get("category") as string,
          description: fd.get("description") as string,
          newProductImages: fd
            .getAll("newProductImages")
            .filter((v) => v instanceof File) as File[],
          imageUrlsToDelete: (() => {
            const values = fd.getAll("imageUrlsToDelete") as string[];
            return values.length > 0 ? values : [];
          })(),
          primaryImageIndex: (() => {
            const pii = fd.get("primaryImageIndex");
            return pii ? Number(pii) : 0;
          })(),
        };

        console.log({ payload });
        return payload;
      },
      { async: true },
    );

    if (!result.success) {
      throw CustomError.validation(transformZodError(result.error));
    }
    const data: UpdateProductRequest = result.data;

    // Check product existence and get image_urls along the way for upload logic
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products_metadata")
      .select("id, image_urls")
      .eq("id", data.productId)
      .single();

    if (fetchError)
      throw CustomError.internal(`Failed to fetch product: ${fetchError}`);
    if (!existingProduct) throw CustomError.notFound("Product not found");

    // Handle required field category updates
    let productCategory: { id: number; name: string } | null = null;
    if (data.category) {
      const { data: existingCategory, error: findError } = await supabase
        .from("products_category")
        .select("id, name")
        .eq("name", data.category)
        .maybeSingle();

      if (findError)
        throw CustomError.internal(`Database error: ${findError.message}`);

      if (existingCategory) {
        productCategory = existingCategory;
      } else {
        const { data: newCategory, error: insertError } = await supabase
          .from("products_category")
          .insert({ name: data.category })
          .select("id, name")
          .single();
        if (insertError)
          throw CustomError.internal(
            `Failed to create collection: ${insertError.message}`,
          );
        productCategory = newCategory;
      }
    }

    // Handle optional field collection updates
    let productCollection: { id: number; name: string } | null = null;

    if (!data.collectionName) {
      productCollection = null;
    } else {
      const { data: existingCollection, error: findError } = await supabase
        .from("products_collection")
        .select("id, name")
        .eq("name", data.collectionName)
        .maybeSingle();

      if (findError)
        throw CustomError.internal(`Database error: ${findError.message}`);

      if (existingCollection) {
        productCollection = existingCollection;
      } else {
        const { data: newCollection, error: insertError } = await supabase
          .from("products_collection")
          .insert({ name: data.collectionName })
          .select("id, name")
          .single();
        if (insertError)
          throw CustomError.internal(
            `Failed to create collection: ${insertError.message}`,
          );
        productCollection = newCollection;
      }
    }

    // Handle image uploads

    let updatedImageUrls = existingProduct.image_urls ?? [];

    const finalImageCount =
      updatedImageUrls.length -
      (data.imageUrlsToDelete?.length ?? 0) +
      (data.newProductImages?.length ?? 0);

    if (finalImageCount < 1)
      throw CustomError.badRequest("Product must retain at least one image");
    else if (finalImageCount > 3)
      throw CustomError.badRequest("Product can have up to 3 images only");

    if (data.newProductImages?.length) {
      const newImageUrls = await uploadImagesToDB(
        supabase,
        data.newProductImages,
      );
      updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
    }

    // Handle image deletion

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

    const dbUpdates: Omit<
      ProductsMetadataRow,
      "created_at" | "updated_at" | "id"
    > = {
      // set null or [] for optional fields (deletion patch)
      name: data.name,
      price: data.price ?? 0,
      color_variants: data.colorVariants ?? [],
      description: data.description ?? null,
      product_collection_id: productCollection?.id ?? null,
      product_category_id: productCategory?.id ?? null,
      image_urls: updatedImageUrls,
      primary_image_url: updatedImageUrls[data.primaryImageIndex ?? 0],
    };
    console.log("db updates", dbUpdates);

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products_metadata")
      .update(dbUpdates)
      .eq("id", data.productId)
      .select("*")
      .single();

    if (updateError)
      throw CustomError.internal(
        `Failed to update product: ${updateError.message}`,
      );

    console.log("updated product", updatedProduct);

    const res: UpdateProductData = {
      ...updatedProduct,
      productsCollection: productCollection
        ? { name: productCollection.name }
        : null,
      productsCategory: productCategory ? { name: productCategory.name } : null,
    };

    return handleSuccess(res, corsHeaders);
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
