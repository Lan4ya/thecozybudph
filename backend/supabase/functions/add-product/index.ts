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
  ProductsMetadataRow,
  CreateProductRequest,
  CreateProductData,
} from "@shared/schema/index.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request): Promise<Response> => {
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
          name: fd.get("name") as string,
          price: fd.get("price") ? Number(fd.get("price")) : 0,
          collectionName: fd.get("collectionName") as string,
          category: fd.get("category") as string,
          colorVariants: (() => {
            const values = fd.getAll("colorVariants") as string[];
            if (!values.length) return [];
            const fv = values.filter(Boolean);
            return fv.length > 0 ? fv : [];
          })(),
          description: (fd.get("description") as string) || undefined,
          productImages: fd
            .getAll("productImages")
            .filter((v) => v instanceof File) as File[],
          primaryImageIndex: (() => {
            const pii = fd.get("primaryImageIndex");
            return pii ? Number(pii) : 0;
          })(),
        };

        const requiredFields = new Set([
          "name",
          "price",
          "category",
          "productImages",
          "primaryImageIndex",
        ]);

        // delete empty optional fields
        Object.keys(payload).forEach((key) => {
          if (requiredFields.has(key)) return;

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

    // Resolve or create category
    let productCategory: { id: number; name: string } | null = null;
    const { data: existingCategory, error: findError } = await supabase
      .from("products_category")
      .select("id, name")
      .eq("name", data.category)
      .maybeSingle();

    if (findError) {
      throw CustomError.internal(findError.message);
    }

    if (existingCategory) {
      productCategory = existingCategory;
    } else {
      const { data: newCategory, error: insertError } = await supabase
        .from("products_category")
        .insert({ name: data.category })
        .select("id, name")
        .single();

      if (insertError) throw CustomError.internal(insertError.message);

      productCategory = newCategory;
    }

    // Resolve or create collection
    let productCollection: { id: number; name: string } | null = null;
    if (data.collectionName) {
      const { data: existingCollection, error: findError } = await supabase
        .from("products_collection")
        .select("id, name")
        .eq("name", data.collectionName)
        .maybeSingle();

      if (findError) {
        throw CustomError.internal(findError.message);
      }

      if (existingCollection) {
        productCollection = existingCollection;
      } else {
        const { data: newCollection, error: insertError } = await supabase
          .from("products_collection")
          .insert({ name: data.collectionName })
          .select("id, name")
          .single();

        if (insertError) throw CustomError.internal(insertError.message);

        productCollection = newCollection;
      }
    }

    // Upload images to Supabase Storage concurrently
    const imageUrls = await uploadImagesToDB(supabase, data.productImages);

    const DBInserts: Omit<
      ProductsMetadataRow,
      "created_at" | "updated_at" | "id"
    > = {
      name: data.name,
      price: data.price,
      color_variants: data.colorVariants ?? [],
      description: data.description ?? null,
      image_urls: imageUrls,
      primary_image_url: imageUrls[data.primaryImageIndex ?? 0],
      product_collection_id: productCollection?.id ?? null,
      product_category_id: productCategory.id,
    };

    const { data: createdProduct, error: insertError } = await supabase
      .from("products_metadata")
      .insert(DBInserts)
      .select("*")
      .single();

    if (insertError) {
      throw CustomError.internal(insertError.message);
    }
    const res: CreateProductData = {
      ...createdProduct,
      productsCollection: productCollection
        ? { name: productCollection.name }
        : null,
      productsCategory: productCategory ? { name: productCategory.name } : null,
    };

    return handleSuccess(res, corsHeaders);
  } catch (err) {
    return handleError(err, corsHeaders);
  }
});
