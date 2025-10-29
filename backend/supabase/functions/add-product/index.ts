/**
 * Add a new product to DB
 *
 * @admin - requires admin privileges
 * @method POST
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/add-product
 *
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { CustomError } from "@shared/CustomError.ts";
import { validateImageFile } from "@shared/validateImageFile.ts";
import { validateProductData } from "@shared/validateProductData.ts";

import type { NewProduct } from "@TheCozyBud/types/types/index.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// @ts-ignore
Deno.serve(async (req) => {
  console.log("METHOD:", req.method);
  console.log("HEADERS:", Object.fromEntries(req.headers.entries()));

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const formData = await req.formData();

    const productImages = formData.getAll("product_images") as File[];
    if (!productImages || productImages.length === 0) {
      return new Response(JSON.stringify({ error: "No images uploaded" }), {
        status: 400,
      });
    }
    // File size and type validation
    await validateImageFile(productImages);

    // Get all product data
    const productData: NewProduct = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      color_variants: JSON.parse(formData.get("color_variants") as string),
    };
    validateProductData(productData);

    const collectionName = formData.get("collection_name") as string;
    let PRODUCT_COLLECTION_ID: number | null = null;
    if (collectionName) {
      const { data: product_collection_data, error } = await supabase
        .from("products_collection")
        .insert(
          { name: collectionName },
          {
            onConflict: "collection_name", // column(s) to use for conflict detection
            ignoreDuplicates: true, // if the collection already exists, do nothing
          },
        )
        .select("id")
        .maybeSingle(); // use maybeSingle() instead of single() to avoid error if nothing inserted

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
        });
      }

      PRODUCT_COLLECTION_ID = product_collection_data?.id;
    }

    // Upload images to Supabase Storage concurrently
    const imageUploads = productImages.map(async (file) => {
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(
          `Failed to upload ${file.name}: ${uploadError.message}`,
        );
      }

      // dev log
      console.log(`Upload data: `, _uploadData);

      // Get the public URL for each image
      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    });
    const imageUrls = await Promise.all(imageUploads);

    // Insert metadata + ALL image URLs into DB
    const { data: product_metadata_data, error: insertError } = await supabase
      .from("products_metadata")
      .insert({
        ...productData,
        image_urls: imageUrls,
        primary_image_url: imageUrls[0],
        product_collection_id: PRODUCT_COLLECTION_ID,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({
        product: {
          ...product_metadata_data,
          total_images: imageUrls.length,
        },
      }),
      { status: 201 },
    );
  } catch (err) {
    // Handle CustomError with proper status codes
    if (err instanceof CustomError) {
      return new Response(
        JSON.stringify({
          error: err.errors,
          success: false,
        }),
        {
          status: err.statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      // Handle unexpected errors
      console.error("Unexpected error:", err);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          success: false,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
});
