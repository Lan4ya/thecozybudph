/**
 * Update a product in DB
 *
 * @admin - requires admin privileges
 * @method PATCH
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/patch-product
 *
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import {
  CustomError,
  transformZodError,
  // @ts-ignore
} from "@shared/errors/mod.ts";
// @ts-ignore
import { handleError } from "@shared/response/handleError.ts";
// @ts-ignore
import { handleSuccess } from "@shared/response/handleSuccess.ts";
import {
  updateProductSchema,
  parseAndValidateFormData,
  Product,
  UpdateProductRequest,
  // @ts-ignore
} from "@shared/schema/index.ts";
// @ts-ignore
import { parseJSONField } from "@shared/parseJSONField.ts";
// @ts-ignore
import {
  validateImageFile,
  // @ts-ignore
} from "@shared/validations/mod.ts";
import {
  uploadImagesToDB,
  // @ts-ignore
} from "@shared/uploadImagesToDB.ts";
// @ts-ignore
import { authAdmin } from "../shared/authAdmin.ts";
// @ts-ignore
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";

const supabase = createClient(
  // @ts-ignore
  Deno.env.get("SUPABASE_URL")!,
  // @ts-ignore
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// @ts-ignore
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
          productId: fd.get("productId") ?? "",
          name: fd.get("name"),
          price: fd.get("price"),
          collectionName: fd.get("collectionName"),
          colorVariants: fd.getAll("colorVariants"),
          description: fd.get("description"),
          newProductImages: fd.getAll("newProductImages") as File[] | undefined,
          imageUrlsToDelete: fd.getAll("imageUrlsToDelete"),
          primaryImageIndex: fd.get("primaryImageIndex"),
        };

        Object.keys(payload).forEach((key) => {
          if (key === "productId") return; // skip required field

          const val = payload[key];
          if (
            val == undefined ||
            (typeof val === "string" && val.trim() === "") ||
            (Array.isArray(val) && val.filter(Boolean).length === 0)
          ) {
            delete payload[key];
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
      throw CustomError.internal("Failed to fetch product", fetchError);
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

    const DBUpdates: Omit<Product, "created_at" | "updated_at" | "id"> = {
      name: data.name,
      price: data.price,
      color_variants: data.colorVariants,
      description: data.description,
      product_collection_id: productCollectionId ?? undefined,
      image_urls: updatedImageUrls,
      primary_image_url: updatedImageUrls[data.primaryImageIndex ?? 0],
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
