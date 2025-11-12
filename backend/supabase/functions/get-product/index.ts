/**
 * Get a product in DB
 *
 * @public - requires anon/public key
 * @method GET
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/get-product?product_id=<product_id>
 *
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { CustomError, handleError } from "@shared/errors/mod.ts";

const supabase = createClient(
  // @ts-ignore
  Deno.env.get("SUPABASE_URL")!,
  // @ts-ignore
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

// @ts-ignore
Deno.serve(async (req) => {
  try {
    if (req.method !== "GET") CustomError.method();

    const url = new URL(req.url);
    const product_id = url.searchParams.get("product_id");

    if (!product_id) CustomError.badRequest("Missing product_id query param");

    const { data: product_metadata, error: productMetaDataErr } = await supabase
      .from("products_metadata")
      .select(
        `
    *,
    products_collection (name)
  `,
      )
      .eq("id", product_id)
      .maybeSingle();

    if (productMetaDataErr) {
      throw CustomError.internal(productMetaDataErr.message);
    }

    if (!product_metadata)
      throw CustomError.notFound(`Product ${product_id} not found`);

    return Response.json(
      {
        product: product_metadata,
        success: true,
      },
      { status: 200 },
    );

    // const { data: } = supabase.storage
    //   .from("bucket")
    //   .getPublicUrl("filePath.jpg");

    // console.log(data.publicUrl);
  } catch (err) {
    return handleError(err);
  }
});
