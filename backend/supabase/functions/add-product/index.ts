/**
 * Create a new product to DB
 *
 * @admin
 * @method POST
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/add-product
 *
 */

import { createClient } from "supabase";
import { CustomError, transformZodError } from "@shared/errors/mod.ts";
import { handleError } from "@shared/response/handleError.ts";
import { handleSuccess } from "@shared/response/handleSuccess.ts";
import { uploadImagesToDB } from "@shared/uploadImagesToDB.ts";
import { authAdmin } from "@shared/authAdmin.ts";
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";
import {
  createProductSchema,
  parseAndValidateFormData,
  ProductDB,
  CreateProductRequest,
  CreateProductData,
} from "@shared/schema/index.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
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
    // check admin privileges
    await authAdmin(supabase, req);

    const result = await parseAndValidateFormData<CreateProductRequest>(
      req,
      createProductSchema,
      (fd: FormData) => {
        const payload: CreateProductRequest = {
          // name: fd.get("name") as string,
          // price: fd.get("price"),
          // collectionName: fd.get("collectionName"),
          // colorVariants: fd.getAll("colorVariants"),
          // description: fd.get("description"),
          // productImages: fd.getAll("productImages") as File[],
          // primaryImageIndex: fd.get("primaryImageIndex"),
          name: fd.get("name")?.toString() ?? "",
          price: Number(fd.get("price")),
          collectionName: fd.get("collectionName")?.toString(),
          colorVariants: fd
            .getAll("colorVariants")
            .filter((v) => typeof v === "string"),
          description: fd.get("description")?.toString(),
          productImages: fd
            .getAll("productImages")
            .filter((v) => v instanceof File) as File[],
          primaryImageIndex: Number(fd.get("primaryImageIndex")),
        };

        // delete empty optional fields
        Object.keys(payload).forEach((key) => {
          const requiredFields = [
            "name",
            "price",
            "productImages",
            "primaryImageIndex",
          ];
          if (requiredFields.includes(key)) return;

          const val = payload[key as keyof CreateProductRequest];
          if (
            val == null ||
            (typeof val === "string" && val.trim() === "") ||
            (Array.isArray(val) && val.filter(Boolean).length === 0)
          ) {
            delete payload[key as keyof CreateProductRequest];
          }
        });

        return payload;
      },
      { async: true },
    );

    if (!result.success) {
      throw CustomError.validation(transformZodError(result.error));
    }
    const data: CreateProductRequest = result.data;

    // Resolve or create collection
    let productCollectionId: number | null = null;
    if (data.collectionName) {
      const { data: existingCollection, error: findError } = await supabase
        .from("products_collection")
        .select("id")
        .eq("name", data.collectionName)
        .maybeSingle();

      if (findError) {
        throw CustomError.internal(findError.message);
      }

      if (existingCollection) {
        productCollectionId = existingCollection.id;
      } else {
        const { data: newCollection, error: insertError } = await supabase
          .from("products_collection")
          .insert({ name: data.collectionName })
          .select("id")
          .single();

        if (insertError) throw CustomError.internal(insertError.message);

        productCollectionId = newCollection.id;
      }
    }

    // Upload images to Supabase Storage concurrently
    const imageUrls = await uploadImagesToDB(supabase, data.productImages);

    const DBInserts: Omit<ProductDB, "created_at" | "updated_at" | "id"> = {
      name: data.name,
      price: data.price,
      color_variants: data.colorVariants ?? [],
      description: data.description,
      image_urls: imageUrls,
      primary_image_url: imageUrls[data.primaryImageIndex ?? 0],
      product_collection_id: productCollectionId ?? null,
    };

    const { data: createdProduct, error: insertError } = await supabase
      .from("products_metadata")
      .insert(DBInserts)
      .select()
      .single();

    if (insertError) {
      throw CustomError.internal(insertError.message);
    }
    const res: CreateProductData = {
      ...createdProduct,
      productsCollection: { name: data.collectionName },
    };

    return handleSuccess(res, corsHeaders);
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
