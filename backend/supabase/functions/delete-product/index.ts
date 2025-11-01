/**
 * Delete a product from DB
 *
 * @admin - requires admin privileges
 * @method DELETE
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/delete-product
 *
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { CustomError, handleError } from "@shared/errors/mod.ts";
// @ts-ignore
import { authAdmin } from "../shared/authAdmin.ts";

const supabase = createClient(
  // @ts-ignore
  Deno.env.get("SUPABASE_URL")!,
  // @ts-ignore
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// @ts-ignore
Deno.serve(async (req) => {
  console.log("HEADERS:", Object.fromEntries(req.headers.entries()));

  if (req.method !== "DELETE") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // check admin priveleges
  await authAdmin(supabase, req);

  try {
    const { product_id } = await req.json();

    if (!product_id) {
      throw new CustomError(400, "Product ID is required");
    }

    const { data: product, error: fetchError } = await supabase
      .from("products_metadata")
      .select("id, image_urls")
      .eq("id", product_id)
      .single();

    if (fetchError || !product) {
      throw new CustomError(404, "Product not found");
    }

    // Delete images from storage
    if (product.image_urls && product.image_urls.length > 0) {
      const filePaths = product.image_urls
        .map((url: string) => {
          const match = url.match(/\/products\/([^?]+)/);

          // DEBUG LOG
          console.log("Original URL:", url);
          console.log("Matched file path:", match);

          // grab the first capture group which is the file path
          return match ? match[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove(filePaths); // batch delete

        if (storageError) {
          console.error("Failed to delete some images:", storageError);
          // Not gonna throw an err even if storage cleanup fails, instead we continue with DB deletion
        }
      }
    }

    // Delete product from database
    const { error: deleteError } = await supabase
      .from("products_metadata")
      .delete()
      .eq("id", product_id);

    if (deleteError) {
      throw new CustomError(
        400,
        `Failed to delete product: ${deleteError.message}`,
      );
    }

    return Response.json(
      {
        success: true,
        message: "Product deleted successfully",
        deleted_product_id: product_id,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err);
  }
});
