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
import { CustomError } from "@shared/errors/mod.ts";
// @ts-ignore
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";
// @ts-ignore
import { authAdmin } from "../shared/authAdmin.ts";
// @ts-ignore
import { handleError } from "@shared/response/handleError.ts";
// @ts-ignore
import { handleSuccess } from "@shared/response/handleSuccess.ts";
// @ts-ignore
import { DeleteProductRequest } from "@shared/schema/index.ts";

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

  if (req.method !== "DELETE") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    // check admin priveleges
    await authAdmin(supabase, req);

    const url = new URL(req.url);
    const productId: DeleteProductRequest = url.searchParams.get("productId");

    if (!productId) {
      throw CustomError.badRequest("Product ID is required");
    }

    const { data: product, error: fetchError } = await supabase
      .from("products_metadata")
      .select("id, image_urls")
      .eq("id", productId)
      .single();

    if (fetchError) {
      throw CustomError.internal(
        `Failed to delete product: ${fetchError.message}`,
      );
    }

    if (!product) {
      throw CustomError.notFound("Product to delete not found");
    }

    // Delete images from storage
    if (product.image_urls && product.image_urls.length > 0) {
      const filePaths = product.image_urls
        .map((url: string) => {
          const match = url.match(/\/products\/([^?]+)/);

          // console.log("Original URL:", url);
          // console.log("Matched file path:", match);

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
      .eq("id", productId);

    if (deleteError) {
      throw CustomError.internal(
        `Failed to delete product: ${deleteError.message}`,
      );
    }

    return handleSuccess({ productId }, corsHeaders);
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
