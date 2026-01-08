import { createFactory } from "hono/factory";
import { ProductService } from "./services/mod.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import {
  createProductSchema,
  deleteProductSchema,
  productIdSchema,
  updateProductSchema,
} from "@shared/schema/index.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";

const factory = createFactory<AppEnv>();

export const deleteProductHandler = factory.createHandlers(
  zodValidatorMiddleware("json", deleteProductSchema),
  async (c) => {
    const supabase = c.get("supabaseService");
    const payload = c.req.valid("json");
    const deletedProductIds = await ProductService.deleteProducts(
      supabase,
      payload,
    );
    return handleSuccess(deletedProductIds);
  },
);

export const patchProductHandler = factory.createHandlers(
  zodValidatorMiddleware("param", productIdSchema),
  zodValidatorMiddleware("form", updateProductSchema),
  async (c) => {
    const supabase = c.get("supabaseService");
    const { id } = c.req.valid("param");
    const payload = c.req.valid("form");
    const res = await ProductService.updateProduct(supabase, id, payload);
    return handleSuccess(res);
  },
);

export const createProductHandler = factory.createHandlers(
  zodValidatorMiddleware("form", createProductSchema),
  async (c) => {
    const supabase = c.get("supabaseService");
    const payload = c.req.valid("form");
    const res = await ProductService.createProduct(supabase, payload);
    return handleSuccess(res);
  },
);
