/**
 * Add a new product to DB
 *
 * @admin - requires admin privileges
 * @method POST
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/add-product
 *
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { CustomError, handleError } from "@shared/errors/mod.ts";
import {
  validateNewProductMetadata,
  validateImageFile,
  // @ts-ignore
} from "@shared/validations/mod.ts";
// @ts-ignore
import { parseJSONField } from "@shared/parseJSONField.ts";
// @ts-ignore
import { uploadImagesToDB } from "@shared/uploadImagesToDB.ts";
// @ts-ignore
import { authAdmin } from "@shared/authAdmin.ts";
// @ts-ignore
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";
// @ts-ignore
import type { NewProduct } from "@TheCozyBud/dist.index.d.ts";

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

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    // check admin previleges
    await authAdmin(supabase, req);

    const formData = await req.formData();

    const productImages = formData.getAll("product_images") as File[];
    if (!productImages || productImages.length === 0) {
      throw CustomError.badRequest("No images uploaded");
    }

    // File size and type validation
    await validateImageFile(productImages);

    // Parse core fields
    const productMetaData: Omit<NewProduct, "product_images"> = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
    };

    const colorVariants = formData.get("color_variants") as string;
    if (colorVariants) {
      productMetaData.color_variants = parseJSONField<string[]>(
        "color_variants",
        colorVariants,
      );
    }

    const collectionName = formData.get("collection_name") as string;
    if (collectionName) {
      productMetaData.collection_name = collectionName;
    }

    const description = formData.get("description") as string;
    productMetaData.description = description;

    validateNewProductMetadata(productMetaData);

    const primaryImageIndex = Number(formData.get("primary_image_index") ?? 0);

    // Resolve or create collection
    let PRODUCT_COLLECTION_ID: number | null = null;
    if (collectionName) {
      const { data: existingCollection, error: findError } = await supabase
        .from("products_collection")
        .select("id")
        .eq("name", collectionName.trim())
        .maybeSingle();

      if (findError) {
        throw CustomError.internal(findError.message);
      }

      if (existingCollection) {
        PRODUCT_COLLECTION_ID = existingCollection.id;
        console.log(
          `Using existing collection: "${collectionName}" (ID: ${existingCollection.id})`,
        );
      } else {
        const { data: newCollection, error: insertError } = await supabase
          .from("products_collection")
          .insert({ name: collectionName.trim() })
          .select("id")
          .single();

        if (insertError) {
          throw CustomError.internal(insertError.message);
        }

        PRODUCT_COLLECTION_ID = newCollection.id;
        console.log(
          `Created new collection: "${collectionName}" (ID: ${newCollection.id})`,
        );
      }
    }

    // Upload images to Supabase Storage concurrently
    const imageUrls = await uploadImagesToDB(supabase, productImages);
    if (!imageUrls.length) throw CustomError.internal("Image upload failed");

    const resolvedPrimaryUrl = imageUrls[primaryImageIndex] ?? imageUrls[0];

    // exclude collection_name since it's not part of products_metadata and we just need the ref ID of it.
    const { collection_name, primary_image_url, ...rest } = productMetaData;

    // Insert metadata + ALL image URLs into DB
    const { data: product_metadata_data, error: insertError } = await supabase
      .from("products_metadata")
      .insert({
        ...rest,
        image_urls: imageUrls,
        primary_image_url: resolvedPrimaryUrl,
        product_collection_id: PRODUCT_COLLECTION_ID,
      })
      .select()
      .single();

    if (insertError) {
      throw CustomError.internal(insertError.message);
    }

    return Response.json(
      {
        product: {
          ...product_metadata_data,
          collection_name,
        },
        success: true,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
