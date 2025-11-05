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
import { CustomError, handleError } from "@shared/errors/mod.ts";
// @ts-ignore
import { validateProductUpdate } from "@shared/validateProductData.ts";
// @ts-ignore
import { validateImageFile } from "@shared/validateImageFile.ts";
// @ts-ignore
import { parseJSONField } from "@shared/parseJSONField.ts";
// @ts-ignore
import { uploadImagesToDB } from "@shared/uploadImagesToDB.ts";
// @ts-ignore
import { authAdmin } from "../shared/authAdmin.ts";
// @ts-ignore
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";
// @ts-ignore
import type { UpdateProduct } from "@TheCozyBud/dist.index.d.ts";

const supabase = createClient(
  // @ts-ignore
  Deno.env.get("SUPABASE_URL")!,
  // @ts-ignore
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// @ts-ignore
Deno.serve(async (req) => {
  console.log("METHOD:", req.method);
  console.log("HEADERS:", Object.fromEntries(req.headers.entries()));

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
    // check admin priveleges
    await authAdmin(supabase, req);

    const formData = await req.formData();
    const productId = formData.get("product_id") as string;

    if (!productId) {
      throw CustomError.badRequest("Product ID is required");
    }

    // Verify product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products_metadata")
      .select("id, image_urls")
      .eq("id", productId)
      .single();

    if (fetchError)
      throw CustomError.internal("Failed to fetch existing product");

    if (!existingProduct) throw CustomError.notFound("Product not found");

    const updates: UpdateProduct = {};
    let PRODUCT_COLLECTION_ID: number | null = null;

    const name = formData.get("name") as string;
    const price = formData.get("price");
    const color_variants = formData.get("color_variants");
    const collectionName = formData.get("collection_name") as string;
    const description = formData.get("description") as string;

    // Check what fields are being updated
    if (name) updates.name = name;
    if (price) updates.price = Number(price);
    if (color_variants) {
      updates.color_variants = parseJSONField(
        "color_variants",
        color_variants as string,
      );
    }
    if (collectionName) updates.collection_name = collectionName;
    if (description) updates.description = description;

    // Validate the updates
    if (Object.keys(updates).length) {
      validateProductUpdate({ ...updates });
    }

    if (collectionName) {
      // Already exists use the existing collection
      const { data: existingCollection, error: findError } = await supabase
        .from("products_collection")
        .select("id")
        .eq("name", collectionName)
        .maybeSingle();

      if (findError) {
        throw CustomError.internal(`Database error: ${findError.message}`);
      }

      if (existingCollection) {
        PRODUCT_COLLECTION_ID = existingCollection.id;
      } else {
        // Create a new collection and use it
        const { data: newCollection, error: insertError } = await supabase
          .from("products_collection")
          .insert({ name: collectionName })
          .select("id")
          .single();

        if (insertError) {
          throw CustomError.internal(
            `Failed to create collection: ${insertError.message}`,
          );
        }
        PRODUCT_COLLECTION_ID = newCollection.id;
      }
      updates.product_collection_id = PRODUCT_COLLECTION_ID;
    }

    // Handle image uploads

    const productImages = formData.getAll("new_product_images") as File[];
    const imagesToDelete = formData.get("image_urls_to_delete");

    let newProductImages: File[] = [];
    let updatedImageUrls = existingProduct.image_urls || [];

    if (productImages && productImages.length) {
      await validateImageFile(productImages);
      newProductImages = productImages;
    }

    // Upload new images if provided
    if (newProductImages && newProductImages.length) {
      const newImageUrls = await uploadImagesToDB(supabase, newProductImages);
      updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
    }

    // Handle image deletion
    if (imagesToDelete && imagesToDelete.trim()) {
      const deleteUrls = JSON.parse(imagesToDelete) as string[];

      if (existingProduct.image_urls.length - deleteUrls.length <= 0) {
        throw CustomError.badRequest("Product must retain at least one image");
      }

      // NOTE: check existing only??
      updatedImageUrls = updatedImageUrls.filter(
        (url: string) => !deleteUrls.includes(url),
      );

      // Delete files from storage
      const filePaths = deleteUrls
        .map((url) => {
          const match = url.match(/\/products\/([^?]+)/);
          return match ? match[1] : null; // get the first capture group which is the file path
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from("products")
          .remove(filePaths); // batch delete

        if (deleteError) {
          console.error("Failed to delete some images:", deleteError);
          // Not throwing an error here to allow the update to proceed even if some images fail to delete
        }
      }
    }

    // Update primary image if specified
    const primaryImageUrl = formData.get("primary_image_url") as string;
    if (primaryImageUrl && updatedImageUrls.includes(primaryImageUrl)) {
      updates.primary_image_url = primaryImageUrl;
    }
    // else if (updatedImageUrls.length > 0) {
    //   updates.primary_image_url = updatedImageUrls[0];
    // }

    // Update image URLs if they changed
    if (newProductImages.length || imagesToDelete) {
      updates.image_urls = updatedImageUrls;
    }

    // exclude collection_name since it's not part of products_metadata and we just need the ref ID of it.
    const { collection_name, ...rest } = updates;

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products_metadata")
      .update({ ...rest })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      throw CustomError.internal(
        `Failed to update product: ${updateError.message}`,
      );
    }

    return Response.json(
      {
        product: updatedProduct,
        success: true,
        message: "Product updated successfully",
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
