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
  ProductDB,
  UpdateProductRequest,
} from "@shared/schema/index.ts";
import { validateImageFile } from "@shared/validations/mod.ts";
import { uploadImagesToDB } from "@shared/uploadImagesToDB.ts";
import { authAdmin } from "@shared/authAdmin.ts";
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
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
    // admin check
    await authAdmin(supabase, req);

    const result = await parseAndValidateFormData<UpdateProductRequest>(
      req,
      updateProductSchema,
      (fd: FormData) => {
        const payload: UpdateProductRequest = {
          productId: fd.get("productId")?.toString() ?? "",
          name: fd.get("name")?.toString(),
          price: Number(fd.get("price")),
          collectionName: fd.get("collectionName")?.toString(),
          colorVariants: fd.getAll("colorVariants").map((v) => v.toString()),
          description: fd.get("description")?.toString(),
          newProductImages: fd
            .getAll("newProductImages")
            .filter((v) => v instanceof File) as File[],
          imageUrlsToDelete: fd
            .getAll("imageUrlsToDelete")
            .map((v) => v.toString()),
          primaryImageIndex:
            fd.get("primaryImageIndex") !== null
              ? Number(fd.get("primaryImageIndex"))
              : undefined,
        };

        Object.keys(payload).forEach((key) => {
          if (key === "productId") return; // skip required field

          const val = payload[key as keyof UpdateProductRequest];
          if (
            val == undefined ||
            (typeof val === "string" && val.trim() === "") ||
            (Array.isArray(val) && val.filter(Boolean).length === 0)
          ) {
            delete payload[key as keyof UpdateProductRequest];
          }
        });

        return payload;
      },
      { async: true },
    );

    if (!result.success) {
      throw CustomError.validation(transformZodError(result.error));
    }
    const data: UpdateProductRequest = result.data;

    // check existence and get some data
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products_metadata")
      .select("id, image_urls")
      .eq("id", data.productId)
      .single();

    if (fetchError)
      throw CustomError.internal(`Failed to fetch product: ${fetchError}`);
    if (!existingProduct) throw CustomError.notFound("Product not found");

    // handle collection updates
    let productCollectionId: number | null = null;
    if (data.collectionName) {
      const { data: existingCollection, error: findError } = await supabase
        .from("products_collection")
        .select("id")
        .eq("name", data.collectionName)
        .maybeSingle();

      if (findError)
        throw CustomError.internal(`Database error: ${findError.message}`);

      if (existingCollection) {
        productCollectionId = existingCollection.id;
      } else {
        const { data: newCollection, error: insertError } = await supabase
          .from("products_collection")
          .insert({ name: data.collectionName })
          .select("id")
          .single();
        if (insertError)
          throw CustomError.internal(
            `Failed to create collection: ${insertError.message}`,
          );
        productCollectionId = newCollection.id;
      }
    }

    let updatedImageUrls = existingProduct.image_urls ?? [];

    const finalImageCount =
      updatedImageUrls.length -
      (data.imageUrlsToDelete?.length ?? 0) +
      (data.newProductImages?.length ?? 0);

    if (finalImageCount < 1)
      throw CustomError.badRequest("Product must retain at least one image");
    else if (finalImageCount > 3)
      throw CustomError.badRequest("Product can have up to 3 images only");

    // handle image uploads
    if (data.newProductImages?.length) {
      const newImageUrls = await uploadImagesToDB(
        supabase,
        data.newProductImages,
      );
      updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
    }

    // handle image deletion
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

    const DBUpdates: Omit<ProductDB, "created_at" | "updated_at" | "id"> = {
      ...(data.name && { name: data.name }),
      ...(data.price && { price: data.price }),
      ...(data.colorVariants && { color_variants: data.colorVariants }),
      ...(data.description && { description: data.description }),
      ...(productCollectionId != null && {
        product_collection_id: productCollectionId,
      }),
      ...(updatedImageUrls && { image_urls: updatedImageUrls }),
      ...(updatedImageUrls && {
        primary_image_url: updatedImageUrls[data.primaryImageIndex ?? 0],
      }),
    };

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products_metadata")
      .update(DBUpdates) // update ignores undefined fields
      .eq("id", data.productId)
      .select()
      .single();

    if (updateError)
      throw CustomError.internal(
        `Failed to update product: ${updateError.message}`,
      );

    return handleSuccess(
      { ...updatedProduct, collectionName: data.collectionName },
      corsHeaders,
    );
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
