/**
 * Get all product in DB
 *
 * @public - requires anon/public key
 * @method GET
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/get-all-products
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

// TODO: rewrite this in FE and add storage call

// @ts-ignore
Deno.serve(async (req) => {
  try {
    if (req.method !== "GET") CustomError.method();

    const { data: products, error } = await supabase.from("products_metadata")
      .select(`
    *,
    products_collection (name)
  `);

    if (error) {
      throw CustomError.internal(error.message);
    }

    if (!products) throw CustomError.notFound(`No Products found`);

    return Response.json(
      {
        product: products,
        success: true,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err);
  }
});
