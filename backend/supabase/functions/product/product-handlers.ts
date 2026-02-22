import { createFactory } from "hono/factory";
import { ProductService } from "@shared/domain/product/mod.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import {
  createProductSchema,
  deleteProductsSchema,
  productIdSchema,
  updateProductSchema,
} from "@shared/types/index.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";

const factory = createFactory<AppEnv>();

export const createProductHandler = factory.createHandlers(
  zodValidatorMiddleware("form", createProductSchema),
  async (c) => {
    const supabase = c.get("supabaseService");
    const payload = c.req.valid("form");
    const res = await ProductService.createProduct(supabase, payload);
    return handleSuccess(res);
  },
);

export const updateProductHandler = factory.createHandlers(
  zodValidatorMiddleware("param", productIdSchema),
  zodValidatorMiddleware("form", updateProductSchema),
  async (c) => {
    const supabase = c.get("supabaseService");
    const { id: productId } = c.req.valid("param");
    const payload = c.req.valid("form");
    const res = await ProductService.updateProduct(
      supabase,
      productId,
      payload,
    );
    return handleSuccess(res);
  },
);

export const deleteProductHandler = factory.createHandlers(
  zodValidatorMiddleware("json", deleteProductsSchema),
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
